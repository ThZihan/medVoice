from django.db import models
from django.conf import settings
from django.utils import timezone


# Create abstract base class for common fields
class BaseModel(models.Model):
    """Abstract base class with common fields and timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class Patient(BaseModel):
    """Patient profile linked to Django User"""
    # Use settings.AUTH_USER_MODEL for MedVoice compatibility
    # This allows MedVoice to use a custom User model without breaking this app
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    age = models.IntegerField()
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.user.username
    
    class Meta:
        db_table = 'patients'
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        ordering = ['-created_at']


class UserColorPreferences(BaseModel):
    """Store user-specific color preferences for medicine timing"""
    # Use settings.AUTH_USER_MODEL for MedVoice compatibility
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    
    # Palette type: 'default' or 'vibrant'
    palette_type = models.CharField(max_length=20, default='default')
    
    # Base colors
    morning_color = models.CharField(max_length=7, default='#72CB92')  # Teal
    noon_color = models.CharField(max_length=7, default='#D79E63')    # Orange
    night_color = models.CharField(max_length=7, default='#7DA7D7')   # Purple
    
    # Combined colors (can be custom or auto-calculated)
    morning_noon_color = models.CharField(max_length=7, blank=True, null=True)
    morning_night_color = models.CharField(max_length=7, blank=True, null=True)
    noon_night_color = models.CharField(max_length=7, blank=True, null=True)
    all_day_color = models.CharField(max_length=7, blank=True, null=True)
    
    # Track which combined colors are custom (not auto-calculated)
    custom_morning_noon = models.BooleanField(default=False)
    custom_morning_night = models.BooleanField(default=False)
    custom_noon_night = models.BooleanField(default=False)
    custom_all_day = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} - {self.palette_type} palette"
    
    class Meta:
        db_table = 'user_color_preferences'
        verbose_name = "User Color Preferences"
        verbose_name_plural = "User Color Preferences"
        ordering = ['-updated_at']


class GlobalMedicine(BaseModel):
    """Global medicine database for autocomplete"""
    medicine_name = models.CharField(max_length=255, db_index=True)
    generic_name = models.CharField(max_length=255)
    indication = models.CharField(max_length=255)

    def __str__(self):
        return self.medicine_name
    
    class Meta:
        db_table = 'global_medicines'
        verbose_name = "Global Medicine"
        verbose_name_plural = "Global Medicines"
        ordering = ['medicine_name']


class UserMedicine(BaseModel):
    """User's personal medicine list"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medicines')
    medicine_name = models.CharField(max_length=255, db_index=True)
    generic_name = models.CharField(max_length=255, blank=True, null=True)
    dose = models.CharField(max_length=50, blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)
    cycle = models.CharField(max_length=50)
    schedule = models.CharField(max_length=50)
    with_food = models.CharField(max_length=50)
    indication = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.medicine_name
    
    class Meta:
        db_table = 'user_medicines'
        verbose_name = "User Medicine"
        verbose_name_plural = "User Medicines"
        ordering = ['-created_at']
