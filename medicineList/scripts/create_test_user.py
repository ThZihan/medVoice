#!/usr/bin/env python
"""Create a test user for the medicine list generator"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlist_backend.settings')
django.setup()

from django.contrib.auth.models import User
from medicines.models import Patient

# Create a test user
try:
    # Check if user already exists
    existing_user = User.objects.filter(username='test123').first()
    if existing_user:
        # Delete existing user (which will cascade delete the Patient record)
        existing_user.delete()
        print("Deleted existing test user.")
    
    # Create Django User
    user = User.objects.create_user(
        username='test123',
        password='password123',
        first_name='Test',
        last_name='User',
        email='test@example.com'
    )
    
    # Create Patient record
    patient = Patient.objects.create(
        user=user,
        age=30,
        email='test@example.com'
    )
    
    print("Test user created successfully!")
    print("  Username: test123")
    print("  Password: password123")
    print(f"  Name: {user.get_full_name()}")
except Exception as e:
    print(f"Error creating test user: {e}")
