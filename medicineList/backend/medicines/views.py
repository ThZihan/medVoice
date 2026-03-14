from django.shortcuts import render, redirect, get_object_or_404, reverse
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout as django_logout
from django.contrib.auth.decorators import login_required
from django.conf import settings
import os
import json
import requests
import logging
from .models import Patient, UserMedicine, UserColorPreferences

logger = logging.getLogger(__name__)


@csrf_exempt
@ensure_csrf_cookie
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('patient_id')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        
        if user is None:
            return JsonResponse({
                'success': False,
                'message': 'Invalid credentials'
            }, status=401)
        
        # Log user in
        login(request, user)
        
        # Get patient info
        try:
            patient = Patient.objects.get(user=user)
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'patient_id': patient.user.username,
                'name': patient.user.get_full_name() or patient.user.username
            }, status=200)
        except Patient.DoesNotExist:
            # User exists but no patient record - create one
            patient = Patient.objects.create(user=user)
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'patient_id': patient.user.username,
                'name': patient.user.get_full_name() or patient.user.username
            }, status=200)

    return redirect(reverse('home_page'))


@csrf_exempt
@ensure_csrf_cookie
def register_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        age = request.POST.get('age')
        email = request.POST.get('email', '')
        username = request.POST.get('patient_id')
        password = request.POST.get('password')

        if not name or not age or not username or not password:
            return JsonResponse({
                'success': False,
                'message': 'Missing required fields'
            }, status=400)

        try:
            age = int(age)
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Age must be a number'
            }, status=400)

        # Check if username already exists
        from django.contrib.auth.models import User
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'message': 'Username already exists'
            }, status=400)

        # Create Django User
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=name.split()[0] if name else '',
            last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
            email=email
        )
        
        # Create Patient record
        patient = Patient.objects.create(
            user=user,
            age=age,
            email=email
        )

        return JsonResponse({
            'success': True,
            'message': 'Registration successful',
            'patient_id': patient.user.username,
            'name': patient.user.get_full_name() or patient.user.username
        }, status=201)

    return JsonResponse({
        'success': False,
        'message': 'Only POST method allowed'
    }, status=405)


@csrf_exempt
@login_required
def logout_view(request):
    """
    Logout the current user and clear session.
    
    SECURITY: Uses @csrf_exempt because the frontend fetch API
    doesn't automatically include CSRF tokens. The session cookie
    provides sufficient authentication for logout.
    """
    django_logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Logged out successfully'
    }, status=200)


@login_required
def get_patient_profile(request):
    """
    Get patient profile information (name and age).
    GET /api/patient/profile/
    
    Returns:
    {
        "success": true,
        "name": "Patient Full Name",
        "age": 30
    }
    """
    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Only GET method allowed'
        }, status=405)
    
    try:
        patient = Patient.objects.get(user=request.user)
        name = patient.user.get_full_name() or patient.user.username
        
        return JsonResponse({
            'success': True,
            'name': name,
            'age': patient.age
        }, status=200)
    except Patient.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Patient record not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching patient profile: {str(e)}'
        }, status=500)


@login_required
def update_patient_profile(request):
    """
    Update patient profile information (name and age).
    POST /api/patient/profile/update/
    
    Expected JSON payload:
    {
        "name": "New Patient Name",
        "age": 31
    }
    """
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Only POST method allowed'
        }, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        if 'name' not in data or not data['name']:
            return JsonResponse({
                'success': False,
                'message': 'Name is required'
            }, status=400)
        
        if 'age' not in data or data['age'] is None:
            return JsonResponse({
                'success': False,
                'message': 'Age is required'
            }, status=400)
        
        try:
            age = int(data['age'])
            if age < 0 or age > 150:
                return JsonResponse({
                    'success': False,
                    'message': 'Age must be between 0 and 150'
                }, status=400)
        except ValueError:
            return JsonResponse({
                'success': False,
                'message': 'Age must be a valid number'
            }, status=400)
        
        # Get patient record
        patient = Patient.objects.get(user=request.user)
        
        # Update user's name
        name_parts = data['name'].split(maxsplit=1)
        patient.user.first_name = name_parts[0]
        patient.user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        patient.user.save()
        
        # Update patient's age
        patient.age = age
        patient.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully',
            'name': data['name'],
            'age': age
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Patient.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Patient record not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating patient profile: {str(e)}'
        }, status=500)


# Serve HTML pages
@require_http_methods(["GET"])
def serve_login_page(request):
    """Serve the login page"""
    return render(request, 'login.html')


@require_http_methods(["GET"])
@login_required
def serve_home_page(request):
    """Serve the MedVoice BD homepage"""
    # Get patient info
    try:
        patient = Patient.objects.get(user=request.user)
        return render(request, 'medvoice-home.html', {'patient': patient})
    except Patient.DoesNotExist:
        return render(request, 'medvoice-home.html')


@require_http_methods(["GET"])
@login_required
def serve_index_page(request):
    """Serve the index page"""
    # Get patient info
    try:
        patient = Patient.objects.get(user=request.user)
        return render(request, 'index.html', {'patient': patient})
    except Patient.DoesNotExist:
        return render(request, 'index.html')


# Serve static files
@require_http_methods(["GET"])
def serve_static_file(request, filename):
    """Serve static files from the medicineList_generator directory"""
    import mimetypes
    from django.http import HttpResponse, Http404
    
    file_path = os.path.join(settings.BASE_DIR.parent, 'medicineList_generator', filename)
    
    if not os.path.exists(file_path):
        raise Http404(f"File not found: {filename}")
    
    # Determine content type
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type is None:
        content_type = 'application/octet-stream'
    
    # Read and return the file
    with open(file_path, 'rb') as f:
        content = f.read()
    
    return HttpResponse(content, content_type=content_type)


# ===================================
# USER MEDICINE CRUD API VIEWS
# ===================================

@login_required
def get_user_medicines(request):
    """
    Fetch all medicines for the logged-in user.
    GET /api/medicines/
    
    SECURITY: Only returns medicines belonging to request.user.patient
    """
    if request.method != 'GET':
        return JsonResponse({
            'success': False,
            'message': 'Only GET method allowed'
        }, status=405)
    
    try:
        # Get the patient record for the logged-in user
        # This ensures we only access data for the authenticated user
        patient = Patient.objects.get(user=request.user)
        
        # Fetch all medicines for this patient only
        # The filter ensures we cannot access another user's medicines
        medicines = UserMedicine.objects.filter(patient=patient)
        
        # Convert to list of dictionaries
        medicines_data = []
        for med in medicines:
            medicines_data.append({
                'id': med.id,
                'medicine_name': med.medicine_name,
                'generic_name': med.generic_name,
                'dose': med.dose,
                'instructions': med.instructions,
                'cycle': med.cycle,
                'schedule': med.schedule,
                'with_food': med.with_food,
                'indication': med.indication
            })
        
        return JsonResponse({
            'success': True,
            'medicines': medicines_data,
            'count': len(medicines_data)
        }, status=200)
        
    except Patient.DoesNotExist:
        # Patient record doesn't exist for this user
        # This is a 404, not 403, because the user is authenticated
        # but has no patient record
        return JsonResponse({
            'success': False,
            'message': 'Patient record not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching medicines: {str(e)}'
        }, status=500)


@login_required
def add_user_medicine(request):
    """
    Add a new medicine for the logged-in user.
    POST /api/medicines/
    
    Expected JSON payload:
    {
        "medicine_name": "Medicine Name",
        "generic_name": "Generic Name",
        "dose": "50mg",
        "instructions": "Instructions",
        "cycle": "Daily",
        "schedule": "1-0-0",
        "with_food": "BEFORE FOOD",
        "indication": "Used For"
    }
    
    SECURITY: Only creates medicines for request.user.patient
    Cannot create medicines for another user even if patient_id is provided
    """
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Only POST method allowed'
        }, status=405)
    
    try:
        # Parse JSON request body
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['medicine_name', 'cycle', 'schedule', 'with_food']
        for field in required_fields:
            if field not in data or not data[field]:
                return JsonResponse({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }, status=400)
        
        # SECURITY: Get the patient record for the logged-in user only
        # This ensures we can only create medicines for the authenticated user
        # Even if client sends a patient_id in the payload, we ignore it
        # and use request.user.patient instead
        patient = Patient.objects.get(user=request.user)
        
        # Create new UserMedicine record
        # The patient field is set from request.user, not from the request body
        # This prevents creating medicines for another user
        medicine = UserMedicine.objects.create(
            patient=patient,  # Set from authenticated user, not from request
            medicine_name=data['medicine_name'],
            generic_name=data.get('generic_name', ''),
            dose=data.get('dose', ''),
            instructions=data.get('instructions', ''),
            cycle=data['cycle'],
            schedule=data['schedule'],
            with_food=data['with_food'],
            indication=data.get('indication', '')
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Medicine added successfully',
            'medicine': {
                'id': medicine.id,
                'medicine_name': medicine.medicine_name,
                'generic_name': medicine.generic_name,
                'dose': medicine.dose,
                'instructions': medicine.instructions,
                'cycle': medicine.cycle,
                'schedule': medicine.schedule,
                'with_food': medicine.with_food,
                'indication': medicine.indication
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Patient.DoesNotExist:
        # Patient record doesn't exist for this user
        # This is a 404, not 403, because the user is authenticated
        # but has no patient record
        return JsonResponse({
            'success': False,
            'message': 'Patient record not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error adding medicine: {str(e)}'
        }, status=500)


@login_required
def delete_user_medicine(request, medicine_id):
    """
    Delete a medicine owned by the logged-in user.
    DELETE /api/medicines/<id>/
    
    SECURITY: Only deletes medicines belonging to request.user.patient
    Returns 403 if attempting to delete another user's medicine
    """
    if request.method != 'DELETE':
        return JsonResponse({
            'success': False,
            'message': 'Only DELETE method allowed'
        }, status=405)
    
    try:
        # SECURITY: Get the patient record for the logged-in user only
        patient = Patient.objects.get(user=request.user)
        
        # SECURITY: Explicit ownership check before deletion
        # We first try to get the medicine with the patient filter
        # If it doesn't exist, we check if it exists at all
        try:
            medicine = UserMedicine.objects.get(id=medicine_id, patient=patient)
        except UserMedicine.DoesNotExist:
            # Medicine doesn't exist for this patient
            # Check if it exists at all (belongs to another user)
            if UserMedicine.objects.filter(id=medicine_id).exists():
                # Medicine exists but belongs to another user
                # Return 403 Forbidden - unauthorized access attempt
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to delete this medicine'
                }, status=403)
            else:
                # Medicine doesn't exist at all
                return JsonResponse({
                    'success': False,
                    'message': 'Medicine not found'
                }, status=404)
        
        # Delete the medicine
        medicine.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Medicine deleted successfully'
        }, status=200)
        
    except Patient.DoesNotExist:
        # Patient record doesn't exist for this user
        # This is a 404, not 403, because the user is authenticated
        # but has no patient record
        return JsonResponse({
            'success': False,
            'message': 'Patient record not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error deleting medicine: {str(e)}'
        }, status=500)


@login_required
def update_user_medicine(request, medicine_id):
    """
    Update a medicine owned by the logged-in user.
    PUT /api/medicines/<id>/update/
    
    Expected JSON payload:
    {
        "medicine_name": "Updated Medicine Name",
        "generic_name": "Updated Generic Name",
        "dose": "100mg",
        "instructions": "Updated instructions",
        "cycle": "Weekly",
        "schedule": "1-1-1",
        "with_food": "AFTER FOOD",
        "indication": "Updated indication"
    }
    
    SECURITY: Only updates medicines belonging to request.user.patient
    Returns 403 if attempting to update another user's medicine
    """
    if request.method != 'PUT':
        return JsonResponse({
            'success': False,
            'message': 'Only PUT method allowed'
        }, status=405)
    
    try:
        # Parse JSON request body
        data = json.loads(request.body)
        
        # SECURITY: Get the patient record for the logged-in user only
        patient = Patient.objects.get(user=request.user)
        
        # SECURITY: Explicit ownership check before update
        try:
            medicine = UserMedicine.objects.get(id=medicine_id, patient=patient)
        except UserMedicine.DoesNotExist:
            # Medicine doesn't exist for this patient
            # Check if it exists at all (belongs to another user)
            if UserMedicine.objects.filter(id=medicine_id).exists():
                # Medicine exists but belongs to another user
                # Return 403 Forbidden - unauthorized access attempt
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to update this medicine'
                }, status=403)
            else:
                # Medicine doesn't exist at all
                return JsonResponse({
                    'success': False,
                    'message': 'Medicine not found'
                }, status=404)
        
        # Validate required fields
        required_fields = ['medicine_name', 'cycle', 'schedule', 'with_food']
        for field in required_fields:
            if field in data and not data[field]:
                return JsonResponse({
                    'success': False,
                    'message': f'Field {field} cannot be empty'
                }, status=400)
        
        # Update medicine fields (only if provided in request)
        if 'medicine_name' in data:
            medicine.medicine_name = data['medicine_name']
        if 'generic_name' in data:
            medicine.generic_name = data.get('generic_name', '')
        if 'dose' in data:
            medicine.dose = data['dose']
        if 'instructions' in data:
            medicine.instructions = data.get('instructions', '')
        if 'cycle' in data:
            medicine.cycle = data['cycle']
        if 'schedule' in data:
            medicine.schedule = data['schedule']
        if 'with_food' in data:
            medicine.with_food = data['with_food']
        if 'indication' in data:
            medicine.indication = data.get('indication', '')
        
        # Save the updated medicine
        medicine.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Medicine updated successfully',
            'medicine': {
                'id': medicine.id,
                'medicine_name': medicine.medicine_name,
                'generic_name': medicine.generic_name,
                'dose': medicine.dose,
                'instructions': medicine.instructions,
                'cycle': medicine.cycle,
                'schedule': medicine.schedule,
                'with_food': medicine.with_food,
                'indication': medicine.indication
            }
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Patient.DoesNotExist:
        # Patient record doesn't exist for this user
        return JsonResponse({
            'success': False,
            'message': 'Patient record not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating medicine: {str(e)}'
        }, status=500)


# ===================================
# COLOR PREFERENCES API
# ===================================

@csrf_exempt
@login_required
def get_color_preferences(request):
    """Get user's color preferences"""
    try:
        user = request.user
        
        # Get or create user color preferences
        preferences, created = UserColorPreferences.objects.get_or_create(
            user=user,
            defaults={
                'palette_type': 'default',
                'morning_color': '#72CB92',
                'noon_color': '#D79E63',
                'night_color': '#7DA7D7'
            }
        )
        
        # Calculate combined colors if not set
        combined_colors = calculate_combined_colors(
            preferences.morning_color,
            preferences.noon_color,
            preferences.night_color
        )
        
        # Use custom colors if set, otherwise use calculated
        response_data = {
            'success': True,
            'palette_type': preferences.palette_type,
            'base_colors': {
                'morning': preferences.morning_color,
                'noon': preferences.noon_color,
                'night': preferences.night_color
            },
            'combined_colors': {
                'morning_noon': preferences.morning_noon_color if preferences.custom_morning_noon else combined_colors['morning_noon'],
                'morning_night': preferences.morning_night_color if preferences.custom_morning_night else combined_colors['morning_night'],
                'noon_night': preferences.noon_night_color if preferences.custom_noon_night else combined_colors['noon_night'],
                'all_day': preferences.all_day_color if preferences.custom_all_day else combined_colors['all_day']
            },
            'custom_flags': {
                'morning_noon': preferences.custom_morning_noon,
                'morning_night': preferences.custom_morning_night,
                'noon_night': preferences.custom_noon_night,
                'all_day': preferences.custom_all_day
            }
        }
        
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error getting color preferences: {str(e)}'
        }, status=500)


@csrf_exempt
@login_required
def save_color_preferences(request):
    """Save user's color preferences"""
    try:
        if request.method != 'POST':
            return JsonResponse({
                'success': False,
                'message': 'Only POST method is allowed'
            }, status=405)
        
        user = request.user
        data = json.loads(request.body)
        
        # Get or create user color preferences
        preferences, created = UserColorPreferences.objects.get_or_create(
            user=user
        )
        
        # Update base colors
        if 'palette_type' in data:
            palette_type = data['palette_type']
            
            # Apply preset colors if palette type is 'vibrant'
            if palette_type == 'vibrant':
                preferences.palette_type = 'vibrant'
                preferences.morning_color = '#00c853'  # Bright green
                preferences.noon_color = '#ffeb3b'      # Bright yellow
                preferences.night_color = '#ff1744'     # Bright red
            elif palette_type == 'default':
                preferences.palette_type = 'default'
                preferences.morning_color = '#72CB92'
                preferences.noon_color = '#D79E63'
                preferences.night_color = '#7DA7D7'
            else:
                preferences.palette_type = palette_type
        
        if 'base_colors' in data:
            base_colors = data['base_colors']
            if 'morning' in base_colors:
                preferences.morning_color = base_colors['morning']
            if 'noon' in base_colors:
                preferences.noon_color = base_colors['noon']
            if 'night' in base_colors:
                preferences.night_color = base_colors['night']
        
        # Update combined colors if provided
        if 'combined_colors' in data:
            combined_colors = data['combined_colors']
            if 'morning_noon' in combined_colors:
                preferences.morning_noon_color = combined_colors['morning_noon']
                preferences.custom_morning_noon = True
            if 'morning_night' in combined_colors:
                preferences.morning_night_color = combined_colors['morning_night']
                preferences.custom_morning_night = True
            if 'noon_night' in combined_colors:
                preferences.noon_night_color = combined_colors['noon_night']
                preferences.custom_noon_night = True
            if 'all_day' in combined_colors:
                preferences.all_day_color = combined_colors['all_day']
                preferences.custom_all_day = True
        
        # Reset custom flags if requested
        if 'reset_custom' in data and data['reset_custom']:
            preferences.custom_morning_noon = False
            preferences.custom_morning_night = False
            preferences.custom_noon_night = False
            preferences.custom_all_day = False
            preferences.morning_noon_color = None
            preferences.morning_night_color = None
            preferences.noon_night_color = None
            preferences.all_day_color = None
        
        preferences.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Color preferences saved successfully'
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error saving color preferences: {str(e)}'
        }, status=500)


@csrf_exempt
def get_available_palettes(request):
    """Get available color palettes"""
    try:
        palettes = {
            'default': {
                'name': 'Default',
                'description': 'Standard color scheme',
                'base_colors': {
                    'morning': '#72CB92',
                    'noon': '#D79E63',
                    'night': '#7DA7D7'
                },
                'combined_colors': {
                    'morning_noon': '#84cc16',
                    'morning_night': '#06b6d4',
                    'noon_night': '#8b5cf6',
                    'all_day': '#6366f1'
                }
            },
            'vibrant': {
                'name': 'Vibrant',
                'description': 'Bright and energetic colors',
                'base_colors': {
                    'morning': '#00c853',
                    'noon': '#ffeb3b',
                    'night': '#ff1744'
                },
                'combined_colors': {
                    'morning_noon': '#64dd17',
                    'morning_night': '#00e676',
                    'noon_night': '#ff9100',
                    'all_day': '#ff6d00'
                }
            }
        }
        
        return JsonResponse({
            'success': True,
            'palettes': palettes
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error getting palettes: {str(e)}'
        }, status=500)


def calculate_combined_colors(morning_color, noon_color, night_color):
    """Calculate combined colors by mixing base colors"""
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def rgb_to_hex(rgb):
        return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))
    
    def mix_colors(color1, color2, ratio=0.5):
        rgb1 = hex_to_rgb(color1)
        rgb2 = hex_to_rgb(color2)
        mixed = (
            rgb1[0] * ratio + rgb2[0] * (1 - ratio),
            rgb1[1] * ratio + rgb2[1] * (1 - ratio),
            rgb1[2] * ratio + rgb2[2] * (1 - ratio)
        )
        return rgb_to_hex(mixed)
    
    morning_rgb = hex_to_rgb(morning_color)
    noon_rgb = hex_to_rgb(noon_color)
    night_rgb = hex_to_rgb(night_color)
    
    # Morning + Noon
    morning_noon = mix_colors(morning_color, noon_color, 0.5)
    
    # Morning + Night
    morning_night = mix_colors(morning_color, night_color, 0.5)
    
    # Noon + Night
    noon_night = mix_colors(noon_color, night_color, 0.5)
    
    # All Day (equal mix of all three)
    all_day_rgb = (
        (morning_rgb[0] + noon_rgb[0] + night_rgb[0]) / 3,
        (morning_rgb[1] + noon_rgb[1] + night_rgb[1]) / 3,
        (morning_rgb[2] + noon_rgb[2] + night_rgb[2]) / 3
    )
    all_day = rgb_to_hex(all_day_rgb)
    
    return {
        'morning_noon': morning_noon,
        'morning_night': morning_night,
        'noon_night': noon_night,
        'all_day': all_day
    }


@csrf_exempt
@ensure_csrf_cookie
@login_required
@require_http_methods(["POST"])
def ocr_scan_prescription(request):
    """
    Proxy endpoint for Gemini OCR API calls.
    Frontend sends image data, backend adds API key and calls Gemini API.
    
    This endpoint:
    - Requires user authentication
    - Validates image data
    - Calls Gemini API with server-side API key
    - Returns parsed medicine data
    """
    try:
        # Parse request body (decode bytes to string first)
        import json
        body_str = request.body.decode('utf-8')
        data = json.loads(body_str)
        image_data = data.get('image')
        model = data.get('model', 'gemini-flash-latest')
        mime_type = data.get('mimeType', 'image/jpeg')
        
        # Validate request
        if not image_data:
            logger.warning(f'OCR request from user {request.user.username} missing image data')
            return JsonResponse({
                'success': False,
                'error': 'No image data provided'
            }, status=400)
        
        # Validate image size (max 10MB base64 encoded)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(image_data) > max_size:
            logger.warning(f'OCR request from user {request.user.username} exceeded size limit: {len(image_data)} bytes')
            return JsonResponse({
                'success': False,
                'error': 'Image size exceeds 10MB limit'
            }, status=400)
        
        # Validate mime type
        valid_mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if mime_type not in valid_mime_types:
            return JsonResponse({
                'success': False,
                'error': f'Invalid image type. Supported types: {", ".join(valid_mime_types)}'
            }, status=400)
        
        # Check if API key is configured
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.error('GEMINI_API_KEY not configured in settings')
            return JsonResponse({
                'success': False,
                'error': 'OCR service not configured. Please contact administrator.'
            }, status=500)
        
        # Construct the OCR prompt
        ocr_prompt = """You are a medical prescription OCR system. Extract ALL medicines found in this prescription image and return ONLY valid JSON in this exact format:

{
    "medicines": [
        {
            "medicineName": "string (exact medicine name from image)",
            "genericName": "string or null (generic name if visible)",
            "dose": "string (e.g., '500mg', '50mg', '10mg')",
            "frequency": "Daily" | "per NEED" | "Weekly" | "Only Friday" | "Except WED & THUR",
            "foodTiming": "BEFORE FOOD" | "AFTER FOOD",
            "usedFor": "string (indication/reason for medicine)",
            "remarks": "string (any special instructions like '1+0+1' schedule)"
        }
    ]
}

Important rules:
1. Return ONLY the JSON, no additional text
2. Parse schedule from remarks like "1+0+1" (morning+noon+night)
3. Include all medicines visible in the prescription
4. If dose is just a number without unit, add 'mg' by default
5. Extract timing information from schedule patterns or text mentions
"""
        
        # Call Gemini API with server-side API key
        api_url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
        
        logger.info(f'Calling Gemini API for user {request.user.username} with model {model}')
        
        response = requests.post(
            api_url,
            params={'key': api_key},
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'parts': [
                        {'inline_data': {'mime_type': mime_type, 'data': image_data}},
                        {'text': ocr_prompt}
                    ]
                }],
                'safetySettings': [
                    {'category': 'HARM_CATEGORY_HARASSMENT', 'threshold': 'BLOCK_NONE'},
                    {'category': 'HARM_CATEGORY_HATE_SPEECH', 'threshold': 'BLOCK_NONE'},
                    {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold': 'BLOCK_NONE'},
                    {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold': 'BLOCK_NONE'}
                ]
            },
            timeout=30
        )
        
        # Handle API response
        if response.status_code == 200:
            logger.info(f'Gemini API success for user {request.user.username}')
            return JsonResponse({
                'success': True,
                'data': response.json()
            })
        
        elif response.status_code == 403:
            logger.error(f'Gemini API 403 Forbidden - API key issue')
            return JsonResponse({
                'success': False,
                'error': 'API access denied. Please contact administrator.'
            }, status=500)
        
        elif response.status_code == 429:
            logger.warning(f'Gemini API 429 Rate limit exceeded for user {request.user.username}')
            return JsonResponse({
                'success': False,
                'error': 'Rate limit exceeded. Please try again later.'
            }, status=429)
        
        else:
            logger.error(f'Gemini API error {response.status_code}: {response.text[:200]}')
            return JsonResponse({
                'success': False,
                'error': f'OCR service error. Please try again.'
            }, status=response.status_code)
            
    except requests.Timeout:
        logger.error(f'OCR request timeout for user {request.user.username}')
        return JsonResponse({
            'success': False,
            'error': 'Request timeout. Please try again.'
        }, status=504)
        
    except requests.RequestException as e:
        logger.error(f'OCR request error for user {request.user.username}: {str(e)}')
        return JsonResponse({
            'success': False,
            'error': 'Network error. Please check your connection.'
        }, status=503)
        
    except json.JSONDecodeError as e:
        logger.error(f'Invalid JSON in OCR request from user {request.user.username}: {str(e)}')
        return JsonResponse({
            'success': False,
            'error': 'Invalid request format.'
        }, status=400)
        
    except Exception as e:
        logger.exception(f'Unexpected OCR error for user {request.user.username}: {str(e)}')
        return JsonResponse({
            'success': False,
            'error': 'Internal server error. Please try again.'
        }, status=500)
