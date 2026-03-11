"""
PDF Generator Utility

This module provides server-side PDF generation for medicine schedules.
Uses ReportLab for professional PDF creation with custom styling.

Key Features:
- Generate medicine schedule PDFs
- Custom color schemes based on timing
- Professional table formatting
- Patient information headers
- Support for custom templates
- Celery async task support for non-blocking PDF generation
"""
import io
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


class PDFGeneratorError(Exception):
    """Custom exception for PDF generation errors"""
    pass


class MedicinePDFGenerator:
    """
    Generator for medicine schedule PDFs.
    
    Creates professional PDF documents with medicine schedules,
    patient information, and color-coded timing indicators.
    """
    
    # Default colors
    HEADER_COLOR = colors.HexColor('#FFF9C4')  # Light yellow
    TEXT_COLOR = colors.HexColor('#1A1A1A')    # Dark gray
    LIGHT_COLOR = colors.HexColor('#6B7280')    # Medium gray
    
    # Default timing colors
    DEFAULT_TIMING_COLORS = {
        'morning': colors.HexColor('#72CB92'),  # Teal
        'noon': colors.HexColor('#D79E63'),     # Orange
        'night': colors.HexColor('#7DA7D7')     # Purple
    }
    
    # Light base shades for baseline medicines
    LIGHT_BASE_SHADES = {
        'morning': colors.HexColor('#E1EED9'),  # Light teal
        'noon': colors.HexColor('#FAE3D4'),     # Light orange
        'night': colors.HexColor('#DEEAF6')      # Light purple
    }
    
    def __init__(self, timing_colors: Optional[Dict[str, str]] = None):
        """
        Initialize the PDF generator.
        
        Args:
            timing_colors: Optional custom timing colors dict with 'morning', 'noon', 'night' keys
        """
        if timing_colors:
            self.timing_colors = {
                'morning': colors.HexColor(timing_colors.get('morning', '#72CB92')),
                'noon': colors.HexColor(timing_colors.get('noon', '#D79E63')),
                'night': colors.HexColor(timing_colors.get('night', '#7DA7D7'))
            }
        else:
            self.timing_colors = self.DEFAULT_TIMING_COLORS.copy()
        
        self.light_base_shades = self.LIGHT_BASE_SHADES.copy()
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for PDF"""
        self.styles.add(ParagraphStyle(
            name='HeaderTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=self.TEXT_COLOR,
            spaceAfter=6,
            alignment=TA_LEFT
        ))
        
        self.styles.add(ParagraphStyle(
            name='HeaderDate',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.LIGHT_COLOR,
            alignment=TA_RIGHT
        ))
        
        self.styles.add(ParagraphStyle(
            name='ImportantNotice',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.TEXT_COLOR,
            alignment=TA_LEFT
        ))
    
    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """
        Convert hex color string to RGB tuple.
        
        Args:
            hex_color: Hex color string (e.g., '#72CB92')
            
        Returns:
            tuple: (R, G, B) values (0-255)
        """
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def _rgb_to_reportlab(self, rgb: Tuple[int, int, int]) -> colors.Color:
        """
        Convert RGB tuple to ReportLab color.
        
        Args:
            rgb: RGB tuple (0-255)
            
        Returns:
            colors.Color: ReportLab color object
        """
        return colors.Color(rgb[0]/255, rgb[1]/255, rgb[2]/255)
    
    def _blend_timing_colors(self, timing: List[str]) -> colors.Color:
        """
        Blend timing colors based on medicine timing.
        
        Args:
            timing: List of timing strings ['morning', 'noon', 'night']
            
        Returns:
            colors.Color: Blended color
        """
        has_morning = 'morning' in timing
        has_noon = 'noon' in timing
        has_night = 'night' in timing
        
        timing_count = sum([has_morning, has_noon, has_night])
        
        # Single timing
        if timing_count == 1:
            if has_morning:
                return self.timing_colors['morning']
            if has_noon:
                return self.timing_colors['noon']
            if has_night:
                return self.timing_colors['night']
        
        # Blend multiple timings
        total_r, total_g, total_b = 0, 0, 0
        
        if has_morning:
            total_r += self.timing_colors['morning'].red
            total_g += self.timing_colors['morning'].green
            total_b += self.timing_colors['morning'].blue
        
        if has_noon:
            total_r += self.timing_colors['noon'].red
            total_g += self.timing_colors['noon'].green
            total_b += self.timing_colors['noon'].blue
        
        if has_night:
            total_r += self.timing_colors['night'].red
            total_g += self.timing_colors['night'].green
            total_b += self.timing_colors['night'].blue
        
        return colors.Color(
            total_r / timing_count,
            total_g / timing_count,
            total_b / timing_count
        )
    
    def _get_row_color(self, medicine: Dict, variations: int = 0) -> colors.Color:
        """
        Get the background color for a medicine row.
        
        Args:
            medicine: Medicine dictionary
            variations: Number of parameter variations
            
        Returns:
            colors.Color: Row background color
        """
        timing = medicine.get('timing', [])
        base_color = self._blend_timing_colors(timing)
        
        # If 0 variations (baseline), use lighter base shades
        if variations == 0:
            has_morning = 'morning' in timing
            has_noon = 'noon' in timing
            has_night = 'night' in timing
            
            timing_count = sum([has_morning, has_noon, has_night])
            
            # Single timing
            if timing_count == 1:
                if has_morning:
                    return self.light_base_shades['morning']
                if has_noon:
                    return self.light_base_shades['noon']
                if has_night:
                    return self.light_base_shades['night']
            
            # Blend light base shades for mixed timing
            total_r, total_g, total_b = 0, 0, 0
            
            if has_morning:
                total_r += self.light_base_shades['morning'].red
                total_g += self.light_base_shades['morning'].green
                total_b += self.light_base_shades['morning'].blue
            
            if has_noon:
                total_r += self.light_base_shades['noon'].red
                total_g += self.light_base_shades['noon'].green
                total_b += self.light_base_shades['noon'].blue
            
            if has_night:
                total_r += self.light_base_shades['night'].red
                total_g += self.light_base_shades['night'].green
                total_b += self.light_base_shades['night'].blue
            
            return colors.Color(
                total_r / timing_count,
                total_g / timing_count,
                total_b / timing_count
            )
        
        # Darken color based on variation level (15% per variation)
        darken_factor = 1 - (variations * 0.15)
        return colors.Color(
            base_color.red * darken_factor,
            base_color.green * darken_factor,
            base_color.blue * darken_factor
        )
    
    def _get_timing_string(self, timing: List[str]) -> str:
        """
        Get formatted timing string.
        
        Args:
            timing: List of timing strings
            
        Returns:
            str: Formatted timing string
        """
        labels = []
        if 'morning' in timing:
            labels.append('Morning')
        if 'noon' in timing:
            labels.append('Noon')
        if 'night' in timing:
            labels.append('Night')
        return ' + '.join(labels)
    
    def _count_parameter_variations(self, medicine: Dict) -> int:
        """
        Count parameter variations from baseline.
        
        Args:
            medicine: Medicine dictionary
            
        Returns:
            int: Number of variations
        """
        variations = 0
        
        # Check if dose varies from baseline (assuming 500mg as baseline)
        dose = medicine.get('dose', '')
        if dose and '500mg' not in dose.lower():
            variations += 1
        
        # Check if frequency varies (assuming 'Daily' as baseline)
        frequency = medicine.get('frequency', '')
        if frequency and frequency != 'Daily':
            variations += 1
        
        # Check if food timing varies (assuming 'AFTER FOOD' as baseline)
        food_timing = medicine.get('foodTiming', '')
        if food_timing and food_timing != 'AFTER FOOD':
            variations += 1
        
        # Check if there are special remarks
        remarks = medicine.get('remarks', [])
        if remarks:
            variations += 1
        
        return variations
    
    def _create_header(self, patient_name: str, patient_age: Optional[int]) -> List:
        """
        Create PDF header with patient information.
        
        Args:
            patient_name: Patient name
            patient_age: Optional patient age
            
        Returns:
            list: List of flowable elements for header
        """
        elements = []
        
        # Header background
        header_data = [[
            Paragraph(
                f"<b>{patient_name}</b>" + 
                (f" <font size=8>({patient_age} yrs)</font>" if patient_age else ""),
                self.styles['HeaderTitle']
            ),
            Paragraph(
                f"Date: {datetime.now().strftime('%B %d, %Y')}",
                self.styles['HeaderDate']
            )
        ]]
        
        header_table = Table(header_data, colWidths=[12*cm, 5*cm])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.HEADER_COLOR),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('LEFTPADDING', (0, 0), (0, 0), 10),
            ('RIGHTPADDING', (-1, 0), (-1, 0), 10),
        ]))
        
        elements.append(header_table)
        elements.append(Spacer(1, 0.5*cm))
        
        return elements
    
    def _create_medicine_table(self, medicines: List[Dict]) -> Table:
        """
        Create medicine table with color-coded rows.
        
        Args:
            medicines: List of medicine dictionaries
            
        Returns:
            Table: ReportLab table object
        """
        # Sort medicines
        medicines_sorted = sorted(medicines, key=lambda m: (
            not ('morning' in m.get('timing', [])),
            not ('noon' in m.get('timing', [])),
            not ('night' in m.get('timing', [])),
            m.get('medicineName', '')
        ))
        
        # Table header
        headers = ['#', 'Medicine Name', 'Generic Name', 'Dose', 'Instructions', 
                   'Cycle', 'Schedule', 'With Food', 'Indication']
        
        # Table data
        table_data = [headers]
        
        for idx, med in enumerate(medicines_sorted, 1):
            timing_str = self._get_timing_string(med.get('timing', []))
            remarks_str = ', '.join(med.get('remarks', [])) if med.get('remarks') else ''
            
            row = [
                str(idx),
                med.get('medicineName', ''),
                med.get('genericName', '-'),
                med.get('dose', ''),
                remarks_str,
                med.get('frequency', ''),
                timing_str,
                med.get('foodTiming', ''),
                med.get('usedFor', '-')
            ]
            table_data.append(row)
        
        # Create table
        table = Table(table_data, colWidths=[0.8*cm, 3.5*cm, 3*cm, 1.5*cm, 3.5*cm, 
                                          1.5*cm, 2.5*cm, 2*cm, 2.5*cm])
        
        # Table styles
        styles = [
            # Header styles
            ('BACKGROUND', (0, 0), (-1, 0), self.HEADER_COLOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.TEXT_COLOR),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Grid styles
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.grey),
            
            # Cell styles
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            
            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ]
        
        # Add row-specific colors
        for idx, med in enumerate(medicines_sorted, 1):
            variations = self._count_parameter_variations(med)
            row_color = self._get_row_color(med, variations)
            styles.append(('BACKGROUND', (0, idx), (-1, idx), row_color))
        
        table.setStyle(TableStyle(styles))
        
        return table
    
    def _create_footer(self) -> List:
        """
        Create PDF footer with important notice.
        
        Returns:
            list: List of flowable elements for footer
        """
        elements = []
        
        # Important notice box
        notice_data = [[
            Paragraph("<b>IMPORTANT:</b> Consult healthcare provider before changing medication.", 
                     self.styles['ImportantNotice'])
        ]]
        
        notice_table = Table(notice_data, colWidths=[18*cm])
        notice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.HEADER_COLOR),
            ('LEFTPADDING', (0, 0), (0, 0), 5),
            ('RIGHTPADDING', (-1, 0), (-1, 0), 5),
            ('TOPPADDING', (0, 0), (-1, 0), 4),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ]))
        
        elements.append(notice_table)
        
        return elements
    
    @shared_task
    def generate_pdf(
        self,
        medicines: List[Dict],
        patient_name: str,
        patient_age: Optional[int] = None,
        output_format: str = 'bytes'
    ) -> bytes:
        """
        Generate medicine schedule PDF.
        
        Args:
            medicines: List of medicine dictionaries
            patient_name: Patient name
            patient_age: Optional patient age
            output_format: Output format ('bytes' or 'file')
            
        Returns:
            bytes: PDF data if output_format is 'bytes'
            
        Raises:
            PDFGeneratorError: If PDF generation fails
        """
        try:
            # Validate inputs
            if not medicines:
                raise PDFGeneratorError('No medicines provided for PDF generation')
            
            if not patient_name:
                raise PDFGeneratorError('Patient name is required')
            
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Create document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=1*cm,
                leftMargin=1*cm,
                topMargin=1*cm,
                bottomMargin=1*cm
            )
            
            # Build document elements
            elements = []
            
            # Add header
            elements.extend(self._create_header(patient_name, patient_age))
            
            # Add medicine table
            table = self._create_medicine_table(medicines)
            elements.append(table)
            elements.append(Spacer(1, 0.8*cm))
            
            # Add footer
            elements.extend(self._create_footer())
            
            # Build PDF
            doc.build(elements)
            
            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()
            
            logger.info(f'Successfully generated PDF with {len(medicines)} medicines')
            
            return pdf_data
            
        except Exception as e:
            logger.error(f'Failed to generate PDF: {str(e)}')
            raise PDFGeneratorError(f'PDF generation failed: {str(e)}')
    
    def generate_pdf_file(
        self,
        medicines: List[Dict],
        patient_name: str,
        patient_age: Optional[int] = None,
        filename: Optional[str] = None
    ) -> str:
        """
        Generate medicine schedule PDF and save to file.
        
        Args:
            medicines: List of medicine dictionaries
            patient_name: Patient name
            patient_age: Optional patient age
            filename: Optional filename (auto-generated if not provided)
            
        Returns:
            str: Path to generated PDF file
            
        Raises:
            PDFGeneratorError: If PDF generation fails
        """
        try:
            # Generate filename if not provided
            if not filename:
                date_str = datetime.now().strftime('%Y%m%d')
                filename = f'Medicine_List_{date_str}.pdf'
            
            # Generate PDF
            pdf_data = self.generate_pdf(medicines, patient_name, patient_age)
            
            # Write to file
            filepath = f'{settings.MEDIA_ROOT}/{filename}'
            with open(filepath, 'wb') as f:
                f.write(pdf_data)
            
            logger.info(f'Successfully saved PDF to {filepath}')
            
            return filepath
            
        except Exception as e:
            logger.error(f'Failed to generate PDF file: {str(e)}')
            raise PDFGeneratorError(f'PDF file generation failed: {str(e)}')


def generate_medicine_pdf(
    medicines: List[Dict],
    patient_name: str,
    patient_age: Optional[int] = None,
    timing_colors: Optional[Dict[str, str]] = None
) -> bytes:
    """
    Convenience function to generate medicine schedule PDF.
    
    Args:
        medicines: List of medicine dictionaries
        patient_name: Patient name
        patient_age: Optional patient age
        timing_colors: Optional custom timing colors
        
    Returns:
        bytes: PDF data
        
    Example:
        >>> medicines = [
        ...     {
        ...         'medicineName': 'Paracetamol',
        ...         'genericName': 'Acetaminophen',
        ...         'dose': '500mg',
        ...         'frequency': 'Daily',
        ...         'timing': ['morning', 'night'],
        ...         'foodTiming': 'AFTER FOOD',
        ...         'usedFor': 'Fever',
        ...         'remarks': []
        ...     }
        ... ]
        >>> pdf_data = generate_medicine_pdf(medicines, 'John Doe', 35)
    """
    generator = MedicinePDFGenerator(timing_colors)
    return generator.generate_pdf(medicines, patient_name, patient_age)


# ============================================================================
# Celery Async Tasks for Non-Blocking PDF Generation
# ============================================================================

@shared_task(bind=True, max_retries=3)
def generate_medicine_pdf_async(
    self,
    medicines: List[Dict],
    patient_name: str,
    patient_age: Optional[int] = None,
    timing_colors: Optional[Dict[str, str]] = None,
    user_id: Optional[int] = None
) -> Dict[str, any]:
    """
    Async Celery task to generate medicine schedule PDF.
    
    This task runs in the background to avoid blocking the main thread,
    which is important for large medicine lists or high-traffic scenarios.
    
    Args:
        self: Celery task instance (for retry functionality)
        medicines: List of medicine dictionaries
        patient_name: Patient name
        patient_age: Optional patient age
        timing_colors: Optional custom timing colors
        user_id: Optional user ID for tracking
        
    Returns:
        Dict with keys:
            - success: bool indicating if generation succeeded
            - pdf_data: bytes (if success=True)
            - pdf_url: str (if saved to file)
            - error: str (if success=False)
            
    Raises:
        PDFGeneratorError: If PDF generation fails after retries
        
    Example:
        >>> # In a view or service:
        >>> task = generate_medicine_pdf_async.delay(medicines, 'John Doe', 35)
        >>> task_id = task.id
        >>> # Later, check status:
        >>> result = AsyncResult(task_id)
        >>> if result.ready():
        ...     pdf_data = result.result['pdf_data']
    """
    try:
        logger.info(f'Generating PDF for patient {patient_name} (async task)')
        
        # Generate PDF
        generator = MedicinePDFGenerator(timing_colors)
        pdf_data = generator.generate_pdf(medicines, patient_name, patient_age)
        
        # Optionally save to file for later retrieval
        if settings.MEDIA_ROOT:
            date_str = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'Medicine_List_{patient_name.replace(" ", "_")}_{date_str}.pdf'
            filepath = f'{settings.MEDIA_ROOT}/{filename}'
            
            with open(filepath, 'wb') as f:
                f.write(pdf_data)
            
            logger.info(f'PDF saved to {filepath}')
            
            return {
                'success': True,
                'pdf_data': pdf_data,
                'pdf_url': f'/media/{filename}',
                'filename': filename,
                'user_id': user_id
            }
        else:
            return {
                'success': True,
                'pdf_data': pdf_data,
                'user_id': user_id
            }
            
    except Exception as e:
        logger.error(f'PDF generation failed: {str(e)}')
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            logger.info(f'Retrying PDF generation (attempt {self.request.retries + 1}/{self.max_retries})')
            raise self.retry(exc=e, countdown=2 ** self.request.retries)
        
        return {
            'success': False,
            'error': str(e),
            'user_id': user_id
        }


@shared_task(bind=True)
def generate_pdf_from_user_medicines_async(
    self,
    user_id: int,
    timing_colors: Optional[Dict[str, str]] = None
) -> Dict[str, any]:
    """
    Async Celery task to generate PDF from user's medicines in database.
    
    This task fetches medicines from the database and generates a PDF,
    all in the background without blocking the main thread.
    
    Args:
        self: Celery task instance
        user_id: User ID to fetch medicines for
        timing_colors: Optional custom timing colors
        
    Returns:
        Dict with PDF data or error information
        
    Example:
        >>> # In a view:
        >>> task = generate_pdf_from_user_medicines_async.delay(request.user.id)
        >>> return JsonResponse({'task_id': task.id})
    """
    try:
        from .models import UserMedicine, Patient
        
        # Get user's patient profile
        patient = Patient.objects.select_related('user').get(user_id=user_id)
        
        # Get user's medicines
        user_medicines = UserMedicine.objects.filter(user_id=user_id).select_related('medicine')
        
        # Convert to format expected by PDF generator
        medicines = []
        for um in user_medicines:
            medicines.append({
                'medicineName': um.medicine.medicine_name,
                'genericName': um.medicine.generic_name or '',
                'dose': um.dose,
                'frequency': um.frequency,
                'timing': um.timing,
                'foodTiming': um.food_timing,
                'usedFor': um.used_for or '',
                'remarks': um.remarks or []
            })
        
        # Generate PDF
        generator = MedicinePDFGenerator(timing_colors)
        pdf_data = generator.generate_pdf(
            medicines,
            patient.user.username,
            patient.age
        )
        
        # Save to file
        date_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'Medicine_List_{patient.user.username}_{date_str}.pdf'
        filepath = f'{settings.MEDIA_ROOT}/{filename}'
        
        with open(filepath, 'wb') as f:
            f.write(pdf_data)
        
        logger.info(f'PDF generated for user {user_id}: {filename}')
        
        return {
            'success': True,
            'pdf_url': f'/media/{filename}',
            'filename': filename,
            'user_id': user_id
        }
        
    except Exception as e:
        logger.error(f'Failed to generate PDF for user {user_id}: {str(e)}')
        
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=2 ** self.request.retries)
        
        return {
            'success': False,
            'error': str(e),
            'user_id': user_id
        }
