from django.contrib import admin
from .models import Patient, GlobalMedicine, UserMedicine, UserColorPreferences


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'email')
    list_filter = ('age',)
    search_fields = ('user__username', 'email')


@admin.register(GlobalMedicine)
class GlobalMedicineAdmin(admin.ModelAdmin):
    list_display = ('medicine_name', 'generic_name', 'indication')
    list_filter = ('indication',)
    search_fields = ('medicine_name', 'generic_name', 'indication')


@admin.register(UserColorPreferences)
class UserColorPreferencesAdmin(admin.ModelAdmin):
    """Admin interface for user color preferences"""
    list_display = ('user', 'palette_type', 'morning_color', 'noon_color', 'night_color')
    list_filter = ('palette_type',)
    search_fields = ('user__username', 'palette_type')
    ordering = ('-updated_at',)


@admin.register(UserMedicine)
class UserMedicineAdmin(admin.ModelAdmin):
    list_display = ('medicine_name', 'generic_name', 'dose', 'cycle', 'schedule', 'with_food', 'indication', 'patient')
    list_filter = ('cycle', 'schedule', 'with_food', 'patient')
    search_fields = ('medicine_name', 'generic_name', 'indication')
    ordering = ('patient', 'medicine_name')
