"""
GLM API Service

This module provides AI-powered content generation and moderation functionality
using the GLM-4 API for medical review processing.

Key Features:
- Server-side API key configuration
- Review generation from Q&A answers
- Content moderation for medical content
- Review structuring and formatting
- Error handling and logging
- Rate limiting support
"""

import requests
import logging
import json
from typing import Dict, List, Optional, Any
from django.conf import settings

logger = logging.getLogger(__name__)


class GLMAPIError(Exception):
    """Custom exception for GLM API errors"""
    pass


class GLMAPIService:
    """
    Service for interacting with GLM-4 API.
    
    Handles content generation, moderation, and review structuring operations.
    """
    
    def __init__(self, api_key=None, model=None, api_url=None):
        """
        Initialize the GLM API service.
        
        Args:
            api_key: Optional API key. If not provided, will use from settings.
            model: Optional model name. Defaults to GLM-4.
            api_url: Optional API URL. If not provided, will use from settings.
        """
        self.api_key = api_key or settings.GLM_API_KEY
        self.model = model or getattr(settings, 'GLM_MODEL', 'glm-4')
        self.api_url = api_url or getattr(settings, 'GLM_API_URL', 'https://open.bigmodel.cn/api/paas/v4/chat/completions')
        self.timeout = 30  # 30 second timeout
        
    def _validate_request(self, content: str) -> tuple[bool, Optional[str]]:
        """
        Validate the request content.
        
        Args:
            content: The content to validate
            
        Returns:
            tuple: (is_valid, error_message)
        """
        # Check if content exists
        if not content or not content.strip():
            return False, 'No content provided'
        
        # Validate content length (max 10000 characters)
        max_length = 10000
        if len(content) > max_length:
            return False, f'Content exceeds {max_length} character limit: {len(content)} characters'
        
        return True, None
    
    def _construct_prompt(self, prompt_type: str, content: Any, **kwargs) -> str:
        """
        Construct the appropriate prompt based on the operation type.
        
        Args:
            prompt_type: Type of prompt ('review_generation', 'moderation', 'structuring')
            content: The content to process (str or List[Dict] depending on prompt_type)
            **kwargs: Additional parameters specific to prompt type
            
        Returns:
            str: The constructed prompt
        """
        if prompt_type == 'review_generation':
            return self._construct_review_prompt(content, **kwargs)
        elif prompt_type == 'moderation':
            return self._construct_moderation_prompt(content)
        elif prompt_type == 'structuring':
            return self._construct_structuring_prompt(content)
        else:
            raise ValueError(f'Unknown prompt type: {prompt_type}')
    
    def _construct_review_prompt(self, answers: List[Dict], **kwargs) -> str:
        """
        Construct prompt for generating medical review from Q&A answers.
        
        Args:
            answers: List of Q&A answers
            **kwargs: Additional parameters (patient_name, doctor_name, review_type, etc.)
            
        Returns:
            str: The review generation prompt
        """
        patient_name = kwargs.get('patient_name', 'Patient')
        doctor_name = kwargs.get('doctor_name', 'Doctor')
        review_type = kwargs.get('review_type', 'clinical')  # 'clinical' or 'medvoice'
        
        # Format answers for the prompt
        answers_text = '\n'.join([
            f"Q: {ans.get('question', '')}\nA: {ans.get('answer', '')}"
            for ans in answers
        ])
        
        if review_type == 'medvoice':
            # MedVoice-specific prompt for patient experience reviews
            prompt = f"""You are a medical review specialist for MedVoice. Generate a comprehensive patient experience review based on the following Q&A session.

Patient Name: {patient_name}
Doctor Name: {doctor_name}

<user_qa_session>
{answers_text}
</user_qa_session>

Generate a structured patient experience review in JSON format with the following structure:
{{
  "review": {{
    "patient_name": "string",
    "doctor_name": "string",
    "facility_name": "string",
    "review_date": "YYYY-MM-DD",
    "overall_rating": number (1-5),
    "wait_time": {{
      "rating": number (1-5),
      "comment": "string"
    }},
    "doctor_behavior": {{
      "rating": number (1-5),
      "comment": "string"
    }},
    "facility_quality": {{
      "rating": number (1-5),
      "comment": "string"
    }},
    "cost_transparency": {{
      "rating": number (1-5),
      "comment": "string"
    }},
    "treatment_effectiveness": {{
      "rating": number (1-5),
      "comment": "string"
    }},
    "staff_behavior": {{
      "rating": number (1-5),
      "comment": "string"
    }},
    "pros": ["string", "string"],
    "cons": ["string", "string"],
    "recommendation": "Would Recommend" | "Would Not Recommend" | "Neutral",
    "summary": "string (brief 2-3 sentence summary)",
    "detailed_feedback": "string"
  }}
}}

IMPORTANT:
- Extract all rating information accurately from the Q&A
- Use professional but accessible language
- Keep the review honest and balanced
- Return ONLY valid JSON, no additional text
- If information is not available, use null or "Not specified"
- Ratings should be integers from 1 to 5
"""
        else:
            # Clinical medical review prompt (original)
            prompt = f"""You are a medical documentation specialist. Generate a comprehensive medical review based on the following Q&A session.

Patient Name: {patient_name}
Doctor Name: {doctor_name}

<user_qa_session>
{answers_text}
</user_qa_session>

Generate a structured medical review in JSON format with the following structure:
{{
  "review": {{
    "patient_name": "string",
    "doctor_name": "string",
    "review_date": "YYYY-MM-DD",
    "chief_complaint": "string",
    "history_of_present_illness": "string",
    "past_medical_history": "string",
    "current_medications": [
      {{
        "medicine_name": "string",
        "dose": "string",
        "frequency": "string",
        "duration": "string"
      }}
    ],
    "physical_examination": "string",
    "diagnosis": "string",
    "treatment_plan": "string",
    "follow_up": "string",
    "recommendations": "string"
  }}
}}

IMPORTANT:
- Extract all medication information accurately
- Use professional medical terminology
- Keep the review concise but comprehensive
- Return ONLY valid JSON, no additional text
- If information is not available, use null or "Not specified"
"""
        return prompt
    
    def _construct_moderation_prompt(self, content: str) -> str:
        """
        Construct prompt for content moderation.
        
        Args:
            content: The content to moderate
            
        Returns:
            str: The moderation prompt
        """
        prompt = f"""You are a content moderation specialist for medical content. Analyze the following content for:

1. Medical accuracy and safety
2. Appropriate medical terminology
3. No harmful or dangerous advice
4. Professional tone and language
5. Compliance with medical standards
6. No hate speech, harassment, or inappropriate content
7. No personal information or PII disclosure

<user_content>
{content}
</user_content>

Return your analysis in JSON format:
{{
  "decision": "APPROVE" | "FLAG" | "REJECT",
  "safety_score": number (0-100),
  "issues": [
    {{
      "severity": "high" | "medium" | "low",
      "category": "medical_accuracy" | "safety" | "terminology" | "tone" | "compliance" | "inappropriate_content" | "pii",
      "description": "string",
      "suggestion": "string"
    }}
  ],
  "summary": "string"
}}

Decision Guidelines:
- APPROVE: Content is safe, accurate, and appropriate for publication
- FLAG: Content has minor issues that need review before publication (e.g., minor inaccuracies, tone issues)
- REJECT: Content has serious issues (e.g., dangerous advice, hate speech, PII disclosure)

IMPORTANT:
- Return ONLY valid JSON, no additional text
- Be thorough in your analysis
- Provide actionable suggestions for improvement
- Always include a clear decision in the "decision" field
"""
        return prompt
    
    def _construct_structuring_prompt(self, content: str) -> str:
        """
        Construct prompt for structuring medical review content.
        
        Args:
            content: The content to structure
            
        Returns:
            str: The structuring prompt
        """
        prompt = f"""You are a medical documentation specialist. Structure and format the following medical review content into a standardized format.

<user_content>
{content}
</user_content>

Return the structured content in JSON format:
{{
  "structured_review": {{
    "header": {{
      "title": "string",
      "patient_name": "string",
      "doctor_name": "string",
      "date": "YYYY-MM-DD"
    }},
    "sections": [
      {{
        "section_name": "string",
        "content": "string",
        "order": number
      }}
    ],
    "medications": [
      {{
        "name": "string",
        "dose": "string",
        "frequency": "string",
        "duration": "string",
        "instructions": "string"
      }}
    ],
    "diagnosis": "string",
    "treatment_plan": "string",
    "follow_up": "string"
  }}
}}

IMPORTANT:
- Extract all medication information accurately
- Organize content into logical sections
- Maintain professional medical terminology
- Return ONLY valid JSON, no additional text
"""
        return prompt
    
    def _call_api(self, messages: List[Dict], model: str = 'glm-4') -> Dict:
        """
        Make an API call to GLM-4.
        
        Args:
            messages: List of message dictionaries
            model: GLM model to use
            
        Returns:
            dict: The API response
            
        Raises:
            GLMAPIError: If the API call fails
        """
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': model,
            'messages': messages,
            'temperature': 0.1,  # Lower temperature for more deterministic JSON output
            'max_tokens': 4000
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error('GLM API request timed out')
            raise GLMAPIError('API request timed out')
        except requests.exceptions.RequestException as e:
            logger.error(f'GLM API request failed: {str(e)}')
            raise GLMAPIError(f'API request failed: {str(e)}')
        except json.JSONDecodeError as e:
            logger.error(f'Failed to parse GLM API response: {str(e)}')
            raise GLMAPIError(f'Invalid API response: {str(e)}')
    
    def _parse_response(self, response: Dict) -> Dict:
        """
        Parse the API response and extract the content.
        
        Args:
            response: The API response
            
        Returns:
            dict: Parsed content
            
        Raises:
            GLMAPIError: If response parsing fails
        """
        try:
            if 'choices' not in response or not response['choices']:
                raise GLMAPIError('No choices in API response')
            
            content = response['choices'][0].get('message', {}).get('content', '')
            
            if not content:
                raise GLMAPIError('Empty content in API response')
            
            # Try to parse as JSON
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # If not JSON, return as plain text
                return {'content': content}
                
        except Exception as e:
            logger.error(f'Failed to parse GLM API response: {str(e)}')
            raise GLMAPIError(f'Failed to parse response: {str(e)}')
    
    def generate_review_from_qa(
        self,
        answers: List[Dict],
        patient_name: str = None,
        doctor_name: str = None,
        review_type: str = 'clinical',
        model: str = None
    ) -> Dict:
        """
        Generate a medical review from Q&A answers.
        
        Args:
            answers: List of Q&A answer dictionaries
            patient_name: Optional patient name
            doctor_name: Optional doctor name
            review_type: Type of review ('clinical' or 'medvoice')
            model: GLM model to use (defaults to instance model)
            
        Returns:
            dict: Generated review with success status
            
        Example:
            >>> answers = [
            ...     {'question': 'What brings you here today?', 'answer': 'I have a headache'}
            ... ]
            >>> service = GLMAPIService()
            >>> result = service.generate_review_from_qa(answers, review_type='clinical')
            >>> print(result['review'])
        """
        try:
            # Validate input
            if not answers or not isinstance(answers, list):
                return {
                    'success': False,
                    'error': 'Invalid answers: must be a non-empty list'
                }
            
            # Use instance model if not specified
            model = model or self.model
            
            # Construct prompt
            prompt = self._construct_prompt(
                'review_generation',
                answers,
                patient_name=patient_name,
                doctor_name=doctor_name,
                review_type=review_type
            )
            
            # Call API
            messages = [
                {'role': 'system', 'content': 'You are a medical documentation specialist.'},
                {'role': 'user', 'content': prompt}
            ]
            
            response = self._call_api(messages, model or self.model)
            result = self._parse_response(response)
            
            logger.info(f'Successfully generated review from {len(answers)} Q&A answers')
            
            return {
                'success': True,
                'review': result
            }
            
        except GLMAPIError as e:
            logger.error(f'Failed to generate review: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f'Unexpected error generating review: {str(e)}')
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def moderate_content(self, content: str, model: str = None) -> Dict:
        """
        Moderate medical content for safety and accuracy.
        
        Args:
            content: The content to moderate
            model: GLM model to use (defaults to instance model)
            
        Returns:
            dict: Moderation results with safety assessment
            
        Example:
            >>> service = GLMAPIService()
            >>> result = service.moderate_content('Take 100 pills daily')
            >>> print(result['is_safe'])
        """
        try:
            # Validate input
            is_valid, error = self._validate_request(content)
            if not is_valid:
                return {
                    'success': False,
                    'error': error
                }
            
            # Construct prompt
            prompt = self._construct_prompt('moderation', content)
            
            # Call API
            messages = [
                {'role': 'system', 'content': 'You are a content moderation specialist for medical content.'},
                {'role': 'user', 'content': prompt}
            ]
            
            response = self._call_api(messages, model or self.model)
            result = self._parse_response(response)
            
            logger.info(f'Successfully moderated content (length: {len(content)})')
            
            return {
                'success': True,
                'moderation': result
            }
            
        except GLMAPIError as e:
            logger.error(f'Failed to moderate content: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f'Unexpected error moderating content: {str(e)}')
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def structure_review(self, content: str, model: str = None) -> Dict:
        """
        Structure and format medical review content.
        
        Args:
            content: The content to structure
            model: GLM model to use (defaults to instance model)
            
        Returns:
            dict: Structured review
            
        Example:
            >>> service = GLMAPIService()
            >>> result = service.structure_review('Patient has headache...')
            >>> print(result['structured_review'])
        """
        try:
            # Validate input
            is_valid, error = self._validate_request(content)
            if not is_valid:
                return {
                    'success': False,
                    'error': error
                }
            
            # Construct prompt
            prompt = self._construct_prompt('structuring', content)
            
            # Call API
            messages = [
                {'role': 'system', 'content': 'You are a medical documentation specialist.'},
                {'role': 'user', 'content': prompt}
            ]
            
            response = self._call_api(messages, model or self.model)
            result = self._parse_response(response)
            
            logger.info(f'Successfully structured review content (length: {len(content)})')
            
            return {
                'success': True,
                'structured_review': result
            }
            
        except GLMAPIError as e:
            logger.error(f'Failed to structure review: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f'Unexpected error structuring review: {str(e)}')
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }


# Convenience alias for backward compatibility
GLMAPIClient = GLMAPIService
