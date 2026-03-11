"""
Gemini API Service

This module provides OCR functionality for extracting medicine information
from prescription images using Google Gemini 2.5 Flash API.

Key Features:
- Server-side API key configuration
- Image validation (size, mime type)
- OCR prompt engineering for medical prescriptions
- Response parsing and validation
- Error handling and logging
- Rate limiting support
"""

import requests
import logging
import base64
import json
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiAPIError(Exception):
    """Custom exception for Gemini API errors"""
    pass


class GeminiAPIService:
    """
    Service for interacting with Google Gemini 2.5 Flash API.
    
    Handles OCR operations for medicine prescription scanning.
    """
    
    def __init__(self, api_key=None, model=None):
        """
        Initialize the Gemini API service.
        
        Args:
            api_key: Optional API key. If not provided, will use from settings.
            model: Optional model name. Defaults to gemini-2.0-flash for production stability.
        """
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or getattr(settings, 'GEMINI_MODEL', 'gemini-2.0-flash')
        self.api_url = f'https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}'
        
    def _validate_request(self, image_data, mime_type):
        """
        Validate the OCR request data.
        
        Args:
            image_data: Base64 encoded image data
            mime_type: MIME type of the image
            
        Returns:
            tuple: (is_valid, error_message)
        """
        # Check if image data exists
        if not image_data:
            return False, 'No image data provided'
        
        # Validate mime type
        valid_mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if mime_type not in valid_mime_types:
            return False, f'Invalid image type. Supported types: {", ".join(valid_mime_types)}'
        
        # Validate image size (max 10MB base64 encoded)
        max_size = 10 * 1024 * 1024  # 10MB
        try:
            image_size = len(image_data) * 3 / 4  # Base64 to bytes approximation
            if image_size > max_size:
                return False, f'Image size exceeds 10MB limit: {image_size / 1024 / 1024:.2f} MB'
        except Exception:
            return False, 'Failed to validate image size'
        
        return True, None
    
    def _construct_ocr_prompt(self):
        """
        Construct the OCR prompt for medical prescription extraction.
        
        Returns:
            str: The OCR prompt
        """
        prompt = f"""You are a medical prescription OCR system. Extract ALL medicines found in this prescription image and return ONLY valid JSON in this exact format:

{{
  "medicines": [
    {{
      "medicineName": "string (exact medicine name from image)",
      "genericName": "string or null (generic name if visible)",
      "dose": "string (e.g., '500mg', '50mg', '10mg')",
      "frequency": "Daily" | "per NEED" | "Weekly" | "Only Friday" | "Except WED & THUR",
      "foodTiming": "BEFORE FOOD" | "AFTER FOOD",
      "usedFor": "string (indication/reason for medicine)",
      "remarks": "string (any special instructions like '1+0+1' schedule)"
    }}
  ]
}}

Important rules:
- Return ONLY the JSON, no additional text
- Parse schedule from remarks like "1+0+1" (morning+noon+night)
- If dose is just a number without unit, add 'mg' by default
- Extract timing information from schedule patterns or text mentions
- Include all medicines visible in the prescription
"""
        return prompt
    
    def _parse_schedule_from_text(self, text):
        """
        Parse schedule information from remarks or text.
        
        Args:
            text: Text to parse for schedule information
            
        Returns:
            dict: Schedule information with timing keys
        """
        schedule = {
            'morning': False,
            'noon': False,
            'night': False,
            'daily': True
        }
        
        # Check for common schedule patterns in text
        text_lower = text.lower()
        
        # Pattern 1: "1+0+1" or similar
        if any(pattern in text_lower for pattern in ['1+0+1', '1+0+2', '1+1+3', '1+2', '2+0', '2+1', '3+0']):
            schedule['morning'] = True
            schedule['noon'] = True
            schedule['night'] = True
            schedule['daily'] = False
        
        # Pattern 2: "2+0" or similar
        elif any(pattern in text_lower for pattern in ['2+0', '2+1', '2+2']):
            schedule['noon'] = True
            schedule['daily'] = False
        
        # Pattern 3: "3+0" or similar
        elif any(pattern in text_lower for pattern in ['3+0', '3+1']):
            schedule['night'] = True
            schedule['daily'] = False
        
        # Pattern 4: Daily keywords
        elif any(keyword in text_lower for keyword in ['daily', 'every day', 'once daily']):
            schedule['daily'] = True
        
        # Pattern 5: Weekly keywords
        elif any(keyword in text_lower for keyword in ['weekly', 'once a week', 'every week']):
            schedule['daily'] = False
            schedule['frequency'] = 'Weekly'
        
        # Pattern 6: Friday only
        elif 'friday' in text_lower or 'only friday' in text_lower:
            schedule['daily'] = False
            schedule['frequency'] = 'Only Friday'
        
        # Pattern 7: As needed keywords
        elif any(keyword in text_lower for keyword in ['as needed', 'when needed', 'as required', 'prn']):
            schedule['daily'] = True
            schedule['frequency'] = 'per NEED'
        
        return schedule
    
    def _parse_dose(self, dose_text):
        """
        Parse dose information and add default unit if needed.
        
        Args:
            dose_text: Dose text
            
        Returns:
            str: Parsed dose with unit
        """
        if not dose_text:
            return ''
        
        dose_text = dose_text.strip()
        
        # Check if dose already has unit
        if any(unit in dose_text.lower() for unit in ['mg', 'ml', 'g', 'mcg', 'ug']):
            return dose_text
        
        # Add 'mg' by default if just a number
        if dose_text.isdigit():
            return f'{dose_text}mg'
        
        return dose_text
    
    def _parse_food_timing(self, text):
        """
        Parse food timing from text.
        
        Args:
            text: Text to parse
            
        Returns:
            str: Food timing ('BEFORE FOOD', 'AFTER FOOD')
        """
        if not text:
            return ''
        
        text_lower = text.lower()
        
        # Check for before food keywords
        before_keywords = ['before food', 'take before food', 'before meals']
        if any(keyword in text_lower for keyword in before_keywords):
            return 'BEFORE FOOD'
        
        # Check for after food keywords
        after_keywords = ['after food', 'take after food', 'after meals', 'with food', 'take with food', 'with meals']
        if any(keyword in text_lower for keyword in after_keywords):
            return 'AFTER FOOD'
        
        # Default
        return 'BEFORE FOOD'
    
    def extract_medicines_from_image(self, image_data, mime_type):
        """
        Extract medicine information from prescription image using Gemini API.
        
        Args:
            image_data: Base64 encoded image data
            mime_type: MIME type of the image
            
        Returns:
            dict: {
                'success': bool,
                'medicines': list,
                'error': str or None
            }
        """
        try:
            # Validate request
            is_valid, error_message = self._validate_request(image_data, mime_type)
            if not is_valid:
                return {
                    'success': False,
                    'medicines': [],
                    'error': error_message
                }
            
            # Construct prompt
            prompt = self._construct_ocr_prompt()
            
            # Prepare API request
            headers = {
                'Content-Type': 'application/json',
            }
            
            payload = {
                'contents': [
                    {
                        'parts': [
                            {
                                'inline_data': {
                                    'mime_type': mime_type,
                                    'data': image_data
                                }
                            },
                            {
                                'text': prompt
                            }
                        ]
                    }
                ],
                'generationConfig': {
                    'responseMimeType': 'application/json',
                    'temperature': 0.1,  # Lower for more deterministic results
                    'topK': 1,  # Return most likely result
                    'topP': 0.9,
                },
                'safetySettings': [
                    {
                        'category': 'HARM_CATEGORY_HARASSMENT',
                        'threshold': 'BLOCK_NONE'
                    }
                ]
            }
            
            logger.info(f'Sending OCR request to Gemini API for image processing')
            
            # Make API call
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30  # 30 second timeout
            )
            
            # Check response
            if response.status_code != 200:
                logger.error(f'Gemini API returned status code: {response.status_code}')
                return {
                    'success': False,
                    'medicines': [],
                    'error': f'Gemini API error: Status {response.status_code}'
                }
            
            # Parse response
            try:
                result = response.json()
                
                if 'candidates' not in result:
                    logger.error(f'Gemini API response missing candidates field')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'Invalid API response format'
                    }
                
                candidates = result['candidates']
                
                if not candidates or len(candidates) == 0:
                    logger.error(f'Gemini API returned no candidates: {candidates}')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'No medicines found in prescription'
                    }
                
                # Get the first (and only) candidate
                candidate = candidates[0]
                
                if 'content' not in candidate:
                    logger.error(f'Gemini API candidate missing content field')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'Invalid API response format'
                    }
                
                content = candidate['content']
                parts = content.get('parts', [])
                
                if not parts or len(parts) == 0:
                    logger.error(f'Gemini API returned no parts in response')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'Invalid API response format'
                    }
                
                # Get the text from the first part
                text = parts[0].get('text', '')
                
                if not text:
                    logger.error(f'Gemini API returned empty text in response')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'No text content in API response'
                    }
                
                # Parse JSON from text
                try:
                    # Remove markdown formatting if present
                    text = text.replace('```json', '').replace('```', '')
                    medicines_data = json.loads(text)
                except json.JSONDecodeError as e:
                    logger.error(f'Failed to parse Gemini API response: {e}')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': f'Failed to parse API response: {str(e)}'
                    }
                
                if not isinstance(medicines_data, dict) or 'medicines' not in medicines_data:
                    logger.error(f'Gemini API response is not a dict with medicines key: {type(medicines_data)}')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'Invalid API response format'
                    }
                
                medicines_list = medicines_data.get('medicines', [])
                
                if not medicines_list or not isinstance(medicines_list, list):
                    logger.error(f'Gemini API returned invalid medicines format: {type(medicines_list)}')
                    return {
                        'success': False,
                        'medicines': [],
                        'error': 'Invalid API response format'
                    }
                
                # Process each medicine
                processed_medicines = []
                for medicine in medicines_list:
                    processed = self._process_medicine_dict(medicine)
                    if processed:
                        processed_medicines.append(processed)
                
                logger.info(f'Successfully extracted {len(processed_medicines)} medicines from prescription')
                
                return {
                    'success': True,
                    'medicines': processed_medicines,
                    'error': None
                }
                
        except requests.exceptions.Timeout:
            logger.error(f'Gemini API request timed out')
            return {
                'success': False,
                'medicines': [],
                'error': 'Gemini API request timed out'
                }
        except requests.exceptions.RequestException as e:
            logger.error(f'Gemini API request failed: {e}')
            return {
                'success': False,
                'medicines': [],
                'error': f'Gemini API request failed: {str(e)}'
                }
        except Exception as e:
            logger.error(f'Unexpected error in OCR processing: {e}')
            return {
                'success': False,
                'medicines': [],
                'error': f'Unexpected error: {str(e)}'
            }
    
    def _process_medicine_dict(self, medicine_dict):
        """
        Process a medicine dictionary and ensure all required fields are present.
        
        Args:
            medicine_dict: Raw medicine dictionary from API
            
        Returns:
            dict: Processed medicine with defaults applied
        """
        processed = medicine_dict.copy()
        
        # Ensure medicine name exists
        medicine_name = medicine_dict.get('medicineName', '').strip()
        if not medicine_name:
            logger.warning(f'Medicine missing medicineName, skipping')
            return None
        
        processed['medicineName'] = medicine_name
        
        # Handle generic name (optional field)
        generic_name = medicine_dict.get('genericName', '').strip()
        if generic_name:
            processed['genericName'] = generic_name
        else:
            processed['genericName'] = None
        
        # Parse and validate dose
        dose_text = medicine_dict.get('dose', '').strip()
        processed['dose'] = self._parse_dose(dose_text)
        
        # Parse schedule and frequency
        remarks = medicine_dict.get('remarks', '').strip()
        schedule = self._parse_schedule_from_text(remarks)
        processed['frequency'] = schedule.get('frequency', 'Daily')
        
        # Parse food timing
        food_timing_text = medicine_dict.get('foodTiming', '').strip()
        processed['foodTiming'] = self._parse_food_timing(food_timing_text)
        
        # Handle usedFor (indication)
        used_for = medicine_dict.get('usedFor', '').strip()
        if used_for:
            processed['usedFor'] = used_for
        else:
            processed['usedFor'] = None
        
        # Handle remarks (special instructions)
        if remarks and not food_timing_text and not schedule.get('frequency', 'Daily'):
            # If remarks exist but no clear food timing, use as remarks
            processed['remarks'] = remarks
        else:
            processed['remarks'] = None
        
        return processed if processed.get('medicineName') else None


class GeminiAPIClient:
    """
    Client class for Gemini API operations.
    
    Provides high-level methods for common OCR tasks.
    """
    
    def __init__(self, api_key=None):
        """
        Initialize the Gemini API client.
        
        Args:
            api_key: Optional API key. If not provided, will use from settings.
        """
        self.service = GeminiAPIService(api_key)
    
    def extract_from_image(self, image_data, mime_type='image/jpeg'):
        """
        Extract medicine information from a prescription image.
        
        Args:
            image_data: Base64 encoded image data
            mime_type: MIME type of the image (default: image/jpeg)
            
        Returns:
            dict: Extraction result with medicines list or error
        """
        return self.service.extract_medicines_from_image(image_data, mime_type)
    
    def extract_from_image_file(self, image_path):
        """
        Extract medicine information from an image file.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            dict: Extraction result with medicines list or error
        """
        try:
            # Read and encode image file
            with open(image_path, 'rb') as image_file:
                image_data = base64.b64encode(image_file.read())
                mime_type = 'image/jpeg'
                if 'png' in image_path.lower():
                    mime_type = 'image/png'
            
            return self.extract_from_image(image_data, mime_type)
            
        except FileNotFoundError:
            return {
                'success': False,
                'medicines': [],
                'error': f'Image file not found: {image_path}'
            }
        except Exception as e:
            return {
                'success': False,
                'medicines': [],
                'error': f'Failed to read image file: {str(e)}'
            }
