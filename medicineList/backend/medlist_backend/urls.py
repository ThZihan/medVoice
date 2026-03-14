"""
URL configuration for medlist_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from medicines.views import (
    login_view, register_view, logout_view, serve_login_page,
    serve_home_page, serve_index_page, serve_static_file, get_user_medicines,
    add_user_medicine, delete_user_medicine, update_user_medicine,
    get_patient_profile, update_patient_profile,
    get_color_preferences, save_color_preferences, get_available_palettes,
    ocr_scan_prescription
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/register/', register_view, name='register'),
    path('api/medicines/', get_user_medicines, name='get_medicines'),
    path('api/medicines/add/', add_user_medicine, name='add_medicine'),
    path('api/medicines/<int:medicine_id>/delete/', delete_user_medicine, name='delete_medicine'),
    path('api/medicines/<int:medicine_id>/update/', update_user_medicine, name='update_medicine'),
    path('api/patient/profile/', get_patient_profile, name='get_patient_profile'),
    path('api/patient/profile/update/', update_patient_profile, name='update_patient_profile'),
    path('api/colors/preferences/', get_color_preferences, name='get_color_preferences'),
    path('api/colors/preferences/save/', save_color_preferences, name='save_color_preferences'),
    path('api/colors/palettes/', get_available_palettes, name='get_available_palettes'),
    path('api/ocr/scan/', ocr_scan_prescription, name='ocr_scan'),
    path('login/', serve_login_page, name='login_page'),
    path('', serve_login_page, name='home'),
    path('home/', serve_home_page, name='home_page'),
    path('mlg/', serve_index_page, name='mlg_page'),
    path('static/<path:filename>', serve_static_file, name='serve_static'),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else BASE_DIR / 'static')
