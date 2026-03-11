"""
URL configuration for medicine list module.

This file defines all URL patterns for the medicine list functionality.
All URLs are namespaced under /api/medicine-list/ for MedVoice integration.
"""

from django.urls import path
from . import views

app_name = 'medicines'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    
    # Patient profile endpoints
    path('patient/profile/', views.get_patient_profile, name='get_patient_profile'),
    path('patient/profile/update/', views.update_patient_profile, name='update_patient_profile'),
    
    # Medicine management endpoints
    path('medicines/', views.get_user_medicines, name='get_user_medicines'),
    path('medicines/add/', views.add_user_medicine, name='add_user_medicine'),
    path('medicines/<int:medicine_id>/update/', views.update_user_medicine, name='update_user_medicine'),
    path('medicines/<int:medicine_id>/delete/', views.delete_user_medicine, name='delete_user_medicine'),
    
    # Color preferences endpoints
    path('colors/', views.get_color_preferences, name='get_color_preferences'),
    path('colors/save/', views.save_color_preferences, name='save_color_preferences'),
    path('colors/palettes/', views.get_available_palettes, name='get_available_palettes'),
    
    # OCR endpoints
    path('ocr/scan/', views.ocr_scan_prescription, name='ocr_scan_prescription'),
    
    # Static file serving (for development only)
    path('static/<path:filename>/', views.serve_static_file, name='serve_static_file'),
    
    # Page serving endpoints
    path('login-page/', views.serve_login_page, name='serve_login_page'),
    path('', views.serve_index_page, name='serve_index_page'),
]
