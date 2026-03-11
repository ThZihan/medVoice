"""
Color Calculator Utility

This module provides color calculation and manipulation utilities for
medicine timing colors and color blending operations.

Key Features:
- Hex to RGB and RGB to Hex conversion
- Color blending for combined timing colors
- Color validation
- Generate color variations
"""

import re
from typing import Dict, Tuple, Optional, List
import logging

logger = logging.getLogger(__name__)


class ColorCalculatorError(Exception):
    """Custom exception for color calculation errors"""
    pass


class ColorCalculator:
    """
    Calculator for color operations including blending, conversion, and validation.
    
    Provides utilities for working with hex colors in the medicine list application,
    particularly for calculating combined timing colors.
    """
    
    # Default color palettes
    DEFAULT_PALETTE = {
        'morning': '#72CB92',  # Teal
        'noon': '#D79E63',     # Orange
        'night': '#7DA7D7'      # Purple
    }
    
    VIBRANT_PALETTE = {
        'morning': '#10B981',  # Emerald
        'noon': '#F59E0B',     # Amber
        'night': '#3B82F6'      # Blue
    }
    
    # Light base shades for baseline medicines
    LIGHT_BASE_SHADES = {
        'morning': '#E1EED9',  # Light teal
        'noon': '#FAE3D4',     # Light orange
        'night': '#DEEAF6'      # Light purple
    }
    
    def __init__(self):
        """Initialize the color calculator"""
        pass
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> Optional[Tuple[int, int, int]]:
        """
        Convert hex color string to RGB tuple.
        
        Args:
            hex_color: Hex color string (e.g., '#72CB92' or '72CB92')
            
        Returns:
            tuple: (R, G, B) values (0-255) or None if invalid
            
        Example:
            >>> ColorCalculator.hex_to_rgb('#72CB92')
            (114, 203, 146)
        """
        # Remove # if present
        hex_color = hex_color.lstrip('#')
        
        # Validate hex format
        if not re.match(r'^[a-fA-F0-9]{6}$', hex_color):
            logger.warning(f'Invalid hex color: {hex_color}')
            return None
        
        # Convert to RGB
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            return (r, g, b)
        except ValueError as e:
            logger.error(f'Failed to convert hex to RGB: {e}')
            return None
    
    @staticmethod
    def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
        """
        Convert RGB tuple to hex color string.
        
        Args:
            rgb: RGB tuple (R, G, B) with values 0-255
            
        Returns:
            str: Hex color string (e.g., '#72CB92')
            
        Example:
            >>> ColorCalculator.rgb_to_hex((114, 203, 146))
            '#72cb92'
        """
        try:
            r, g, b = rgb
            return '#{:02x}{:02x}{:02x}'.format(r, g, b)
        except (TypeError, ValueError) as e:
            logger.error(f'Failed to convert RGB to hex: {e}')
            raise ColorCalculatorError(f'Invalid RGB tuple: {rgb}')
    
    @staticmethod
    def validate_hex_color(hex_color: str) -> bool:
        """
        Validate a hex color string.
        
        Args:
            hex_color: Hex color string to validate
            
        Returns:
            bool: True if valid, False otherwise
            
        Example:
            >>> ColorCalculator.validate_hex_color('#72CB92')
            True
            >>> ColorCalculator.validate_hex_color('invalid')
            False
        """
        hex_color = hex_color.lstrip('#')
        return bool(re.match(r'^[a-fA-F0-9]{6}$', hex_color))
    
    @staticmethod
    def mix_colors(
        color1: Tuple[int, int, int],
        color2: Tuple[int, int, int],
        ratio: float = 0.5
    ) -> Tuple[int, int, int]:
        """
        Mix two colors together.
        
        Args:
            color1: First color as RGB tuple
            color2: Second color as RGB tuple
            ratio: Mixing ratio (0.5 = equal mix, closer to 1 = more color1)
            
        Returns:
            tuple: Mixed color as RGB tuple
            
        Example:
            >>> ColorCalculator.mix_colors((255, 0, 0), (0, 255, 0), 0.5)
            (128, 128, 0)
        """
        try:
            r = round(color1[0] * ratio + color2[0] * (1 - ratio))
            g = round(color1[1] * ratio + color2[1] * (1 - ratio))
            b = round(color1[2] * ratio + color2[2] * (1 - ratio))
            return (r, g, b)
        except (TypeError, IndexError) as e:
            logger.error(f'Failed to mix colors: {e}')
            raise ColorCalculatorError(f'Invalid color tuples: {color1}, {color2}')
    
    @staticmethod
    def mix_hex_colors(
        hex_color1: str,
        hex_color2: str,
        ratio: float = 0.5
    ) -> str:
        """
        Mix two hex colors together.
        
        Args:
            hex_color1: First color as hex string
            hex_color2: Second color as hex string
            ratio: Mixing ratio (0.5 = equal mix)
            
        Returns:
            str: Mixed color as hex string
            
        Example:
            >>> ColorCalculator.mix_hex_colors('#FF0000', '#00FF00', 0.5)
            '#808000'
        """
        rgb1 = ColorCalculator.hex_to_rgb(hex_color1)
        rgb2 = ColorCalculator.hex_to_rgb(hex_color2)
        
        if rgb1 is None or rgb2 is None:
            raise ColorCalculatorError('Invalid hex colors provided')
        
        mixed_rgb = ColorCalculator.mix_colors(rgb1, rgb2, ratio)
        return ColorCalculator.rgb_to_hex(mixed_rgb)
    
    @staticmethod
    def calculate_combined_colors(
        morning_color: str,
        noon_color: str,
        night_color: str
    ) -> Dict[str, str]:
        """
        Calculate all combined timing colors from base colors.
        
        Args:
            morning_color: Morning timing color (hex)
            noon_color: Noon timing color (hex)
            night_color: Night timing color (hex)
            
        Returns:
            dict: Dictionary with all combined colors
            
        Example:
            >>> colors = ColorCalculator.calculate_combined_colors(
            ...     '#72CB92', '#D79E63', '#7DA7D7'
            ... )
            >>> print(colors['morning_noon'])
        """
        # Convert to RGB
        morning_rgb = ColorCalculator.hex_to_rgb(morning_color)
        noon_rgb = ColorCalculator.hex_to_rgb(noon_color)
        night_rgb = ColorCalculator.hex_to_rgb(night_color)
        
        if not all([morning_rgb, noon_rgb, night_rgb]):
            raise ColorCalculatorError('Invalid base colors provided')
        
        # Calculate combined colors
        morning_noon = ColorCalculator.mix_colors(morning_rgb, noon_rgb, 0.5)
        morning_night = ColorCalculator.mix_colors(morning_rgb, night_rgb, 0.5)
        noon_night = ColorCalculator.mix_colors(noon_rgb, night_rgb, 0.5)
        
        # All day (equal mix of all three)
        all_day = (
            round((morning_rgb[0] + noon_rgb[0] + night_rgb[0]) / 3),
            round((morning_rgb[1] + noon_rgb[1] + night_rgb[1]) / 3),
            round((morning_rgb[2] + noon_rgb[2] + night_rgb[2]) / 3)
        )
        
        return {
            'morning_noon': ColorCalculator.rgb_to_hex(morning_noon),
            'morning_night': ColorCalculator.rgb_to_hex(morning_night),
            'noon_night': ColorCalculator.rgb_to_hex(noon_night),
            'all_day': ColorCalculator.rgb_to_hex(all_day)
        }
    
    @staticmethod
    def get_light_base_shades() -> Dict[str, str]:
        """
        Get the light base shades for baseline medicines.
        
        Returns:
            dict: Dictionary with light base shades for morning, noon, night
        """
        return ColorCalculator.LIGHT_BASE_SHADES.copy()
    
    @staticmethod
    def get_default_palette() -> Dict[str, str]:
        """
        Get the default color palette.
        
        Returns:
            dict: Dictionary with default colors for morning, noon, night
        """
        return ColorCalculator.DEFAULT_PALETTE.copy()
    
    @staticmethod
    def get_vibrant_palette() -> Dict[str, str]:
        """
        Get the vibrant color palette.
        
        Returns:
            dict: Dictionary with vibrant colors for morning, noon, night
        """
        return ColorCalculator.VIBRANT_PALETTE.copy()
    
    @staticmethod
    def generate_color_variations(
        base_color: str,
        num_variations: int = 5,
        darken: bool = True
    ) -> List[str]:
        """
        Generate color variations from a base color.
        
        Args:
            base_color: Base color as hex string
            num_variations: Number of variations to generate
            darken: If True, generate darker variations; if False, lighter
            
        Returns:
            list: List of hex color strings
            
        Example:
            >>> variations = ColorCalculator.generate_color_variations('#72CB92', 3)
            >>> print(len(variations))
            3
        """
        base_rgb = ColorCalculator.hex_to_rgb(base_color)
        if base_rgb is None:
            raise ColorCalculatorError(f'Invalid base color: {base_color}')
        
        variations = []
        step = 0.15 / num_variations  # 15% total change divided by variations
        
        for i in range(1, num_variations + 1):
            if darken:
                factor = 1 - (step * i)
            else:
                factor = 1 + (step * i)
                factor = min(factor, 1.0)  # Don't exceed pure white
            
            varied_rgb = (
                round(base_rgb[0] * factor),
                round(base_rgb[1] * factor),
                round(base_rgb[2] * factor)
            )
            variations.append(ColorCalculator.rgb_to_hex(varied_rgb))
        
        return variations
    
    @staticmethod
    def get_contrast_color(hex_color: str) -> str:
        """
        Get a contrasting color (black or white) for text on a background.
        
        Args:
            hex_color: Background color as hex string
            
        Returns:
            str: '#000000' for black text, '#FFFFFF' for white text
            
        Example:
            >>> ColorCalculator.get_contrast_color('#FFFFFF')
            '#000000'
            >>> ColorCalculator.get_contrast_color('#000000')
            '#FFFFFF'
        """
        rgb = ColorCalculator.hex_to_rgb(hex_color)
        if rgb is None:
            return '#000000'  # Default to black
        
        # Calculate luminance
        luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
        
        # Return black for light backgrounds, white for dark backgrounds
        return '#000000' if luminance > 0.5 else '#FFFFFF'
    
    @staticmethod
    def lighten_color(hex_color: str, amount: float = 0.2) -> str:
        """
        Lighten a color by a given amount.
        
        Args:
            hex_color: Color to lighten (hex string)
            amount: Amount to lighten (0.0 to 1.0)
            
        Returns:
            str: Lightened color as hex string
        """
        rgb = ColorCalculator.hex_to_rgb(hex_color)
        if rgb is None:
            return hex_color
        
        new_rgb = (
            round(rgb[0] + (255 - rgb[0]) * amount),
            round(rgb[1] + (255 - rgb[1]) * amount),
            round(rgb[2] + (255 - rgb[2]) * amount)
        )
        
        return ColorCalculator.rgb_to_hex(new_rgb)
    
    @staticmethod
    def darken_color(hex_color: str, amount: float = 0.2) -> str:
        """
        Darken a color by a given amount.
        
        Args:
            hex_color: Color to darken (hex string)
            amount: Amount to darken (0.0 to 1.0)
            
        Returns:
            str: Darkened color as hex string
        """
        rgb = ColorCalculator.hex_to_rgb(hex_color)
        if rgb is None:
            return hex_color
        
        new_rgb = (
            round(rgb[0] * (1 - amount)),
            round(rgb[1] * (1 - amount)),
            round(rgb[2] * (1 - amount))
        )
        
        return ColorCalculator.rgb_to_hex(new_rgb)


def calculate_combined_colors(
    morning_color: str,
    noon_color: str,
    night_color: str
) -> Dict[str, str]:
    """
    Convenience function to calculate combined timing colors.
    
    Args:
        morning_color: Morning timing color (hex)
        noon_color: Noon timing color (hex)
        night_color: Night timing color (hex)
        
    Returns:
        dict: Dictionary with all combined colors
        
    Example:
        >>> colors = calculate_combined_colors('#72CB92', '#D79E63', '#7DA7D7')
        >>> print(colors['morning_noon'])
    """
    return ColorCalculator.calculate_combined_colors(morning_color, noon_color, night_color)


def blend_colors(hex_color1: str, hex_color2: str, ratio: float = 0.5) -> str:
    """
    Convenience function to blend two hex colors.
    
    Args:
        hex_color1: First color (hex)
        hex_color2: Second color (hex)
        ratio: Mixing ratio (0.5 = equal mix)
        
    Returns:
        str: Blended color as hex string
        
    Example:
        >>> result = blend_colors('#FF0000', '#00FF00', 0.5)
        >>> print(result)
        #808000
    """
    return ColorCalculator.mix_hex_colors(hex_color1, hex_color2, ratio)
