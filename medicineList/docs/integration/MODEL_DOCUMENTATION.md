# Medicine List Model Documentation

This document provides comprehensive documentation for all models in the medicine list application.

---

## Overview

The medicine list application uses Django ORM with the following models:

1. **Patient** - User profile linked to Django User
2. **UserColorPreferences** - User-specific color preferences
3. **GlobalMedicine** - Global medicine database for autocomplete
4. **UserMedicine** - User's personal medicine list

All models inherit from `BaseModel` which provides common timestamp fields.

---

## BaseModel

**Abstract base class** for all models with common fields.

### Fields

| Field | Type | Description |
|--------|--------|-------------|
| `created_at` | DateTimeField(auto_now_add=True) | Timestamp when record was created |
| `updated_at` | DateTimeField(auto_now=True) | Timestamp when record was last updated |

### Usage

All models automatically include these fields without explicit definition.

---

## Patient Model

**Table**: `patients`

Represents a patient profile linked to a Django User.

### Fields

| Field | Type | Constraints | Description |
|--------|--------|-------------|-------------|
| `user` | OneToOneField(User, primary_key=True) | Linked Django User |
| `age` | IntegerField | Patient age |
| `email` | EmailField(blank=True, null=True) | Patient email address |

### Relationships

- **One-to-One** with Django User
- **One-to-Many** with UserMedicine (via `patient` field)

### Methods

#### `__str__()`

Returns the username of the linked user.

```python
def __str__(self):
    return self.user.username
```

### Meta Configuration

```python
class Meta:
    db_table = 'patients'
    verbose_name = "Patient"
    verbose_name_plural = "Patients"
    ordering = ['-created_at']
```

### Example

```python
from medicines.models import Patient

# Create patient
user = User.objects.get(username='john_doe')
patient = Patient.objects.create(
    user=user,
    age=35,
    email='john@example.com'
)

# Query patient
patient = Patient.objects.get(user__username='john_doe')
print(patient.age)  # 35
```

---

## UserColorPreferences Model

**Table**: `user_color_preferences`

Stores user-specific color preferences for medicine timing.

### Fields

| Field | Type | Constraints | Description |
|--------|--------|-------------|-------------|
| `user` | OneToOneField(User, primary_key=True) | Linked Django User |
| `palette_type` | CharField(max_length=20, default='default') | Palette type: 'default' or 'vibrant' |
| `morning_color` | CharField(max_length=7, default='#72CB92') | Morning timing color (hex) |
| `noon_color` | CharField(max_length=7, default='#D79E63') | Noon timing color (hex) |
| `night_color` | CharField(max_length=7, default='#7DA7D7') | Night timing color (hex) |
| `morning_noon_color` | CharField(max_length=7, blank=True, null=True) | Morning+Noon combined color |
| `morning_night_color` | CharField(max_length=7, blank=True, null=True) | Morning+Night combined color |
| `noon_night_color` | CharField(max_length=7, blank=True, null=True) | Noon+Night combined color |
| `all_day_color` | CharField(max_length=7, blank=True, null=True) | All day combined color |
| `custom_morning_noon` | BooleanField(default=False) | Is morning_noon color custom? |
| `custom_morning_night` | BooleanField(default=False) | Is morning_night color custom? |
| `custom_noon_night` | BooleanField(default=False) | Is noon_night color custom? |
| `custom_all_day` | BooleanField(default=False) | Is all_day color custom? |
| `updated_at` | DateTimeField(auto_now=True) | Last update timestamp |

### Relationships

- **One-to-One** with Django User

### Color Calculation Logic

Combined colors are calculated automatically when not custom:

```python
# Morning + Noon (50% mix)
def calculate_morning_noon(morning, noon):
    return blend_colors(morning, noon, 0.5)

# Morning + Night (50% mix)
def calculate_morning_night(morning, night):
    return blend_colors(morning, night, 0.5)

# Noon + Night (50% mix)
def calculate_noon_night(noon, night):
    return blend_colors(noon, night, 0.5)

# All Day (33% mix of all three)
def calculate_all_day(morning, noon, night):
    return blend_colors(blend_colors(morning, noon, 0.5), night, 0.33)
```

### Methods

#### `__str__()`

Returns user username and palette type.

```python
def __str__(self):
    return f"{self.user.username} - {self.palette_type} palette"
```

### Meta Configuration

```python
class Meta:
    db_table = 'user_color_preferences'
    verbose_name = "User Color Preferences"
    verbose_name_plural = "User Color Preferences"
    ordering = ['-updated_at']
```

### Example

```python
from medicines.models import UserColorPreferences

# Create preferences
user = User.objects.get(username='john_doe')
preferences = UserColorPreferences.objects.create(
    user=user,
    palette_type='default',
    morning_color='#72CB92',
    noon_color='#D79E63',
    night_color='#7DA7D7'
)

# Update preferences
preferences.palette_type = 'vibrant'
preferences.morning_color = '#10B981'
preferences.save()

# Get preferences
preferences = UserColorPreferences.objects.get(user=user)
print(preferences.morning_color)  # '#10B981'
```

---

## GlobalMedicine Model

**Table**: `global_medicines`

Global medicine database for autocomplete suggestions.

### Fields

| Field | Type | Constraints | Description |
|--------|--------|-------------|-------------|
| `medicine_name` | CharField(max_length=255, db_index=True) | Medicine name (indexed) |
| `generic_name` | CharField(max_length=255) | Generic/chemical name |
| `indication` | CharField(max_length=255) | Medical indication/usage |

### Indexes

- `medicine_name` - B-tree index for fast autocomplete queries

### Methods

#### `__str__()`

Returns the medicine name.

```python
def __str__(self):
    return self.medicine_name
```

### Meta Configuration

```python
class Meta:
    db_table = 'global_medicines'
    verbose_name = "Global Medicine"
    verbose_name_plural = "Global Medicines"
    ordering = ['medicine_name']
```

### Example

```python
from medicines.models import GlobalMedicine

# Create medicine
medicine = GlobalMedicine.objects.create(
    medicine_name='Paracetamol',
    generic_name='Acetaminophen',
    indication='Fever, Pain relief'
)

# Query medicines (uses index)
medicines = GlobalMedicine.objects.filter(
    medicine_name__icontains='para'
)

# Autocomplete suggestion
suggestions = GlobalMedicine.objects.filter(
    medicine_name__istartswith='Par'
)[:10]
```

---

## UserMedicine Model

**Table**: `user_medicines`

User's personal medicine list with timing and dosage information.

### Fields

| Field | Type | Constraints | Description |
|--------|--------|-------------|-------------|
| `patient` | ForeignKey(Patient, on_delete=CASCADE, related_name='medicines') | Linked patient |
| `medicine_name` | CharField(max_length=255, db_index=True) | Medicine name (indexed) |
| `generic_name` | CharField(max_length=255, blank=True, null=True) | Generic name |
| `dose` | CharField(max_length=50, blank=True, null=True) | Dosage (e.g., '500mg') |
| `instructions` | TextField(blank=True, null=True) | Special instructions |
| `cycle` | CharField(max_length=50) | Frequency cycle |
| `schedule` | CharField(max_length=50) | Timing schedule (e.g., '1+0+1') |
| `with_food` | CharField(max_length=50) | Food timing |
| `indication` | CharField(max_length=255, blank=True, null=True) | Medical indication |

### Valid Field Values

#### Cycle Values
- `Daily`
- `per NEED`
- `Weekly`
- `Only Friday`
- `Except WED & THUR`

#### With Food Values
- `BEFORE FOOD`
- `AFTER FOOD`

#### Schedule Format
- `1+0+1` - Morning, Noon, Night
- `1+0+0` - Morning only
- `0+1+0` - Noon only
- `0+0+1` - Night only
- `2+0+0` - Morning twice
- `3+0+0` - Morning three times

### Relationships

- **Many-to-One** with Patient (via `patient` field)
- **Patient** has **Many-to-One** with UserMedicine (via `medicines` related_name)

### Indexes

- `medicine_name` - B-tree index for fast queries

### Methods

#### `__str__()`

Returns the medicine name.

```python
def __str__(self):
    return self.medicine_name
```

### Meta Configuration

```python
class Meta:
    db_table = 'user_medicines'
    verbose_name = "User Medicine"
    verbose_name_plural = "User Medicines"
    ordering = ['-created_at']
```

### Example

```python
from medicines.models import UserMedicine, Patient

# Get patient
user = User.objects.get(username='john_doe')
patient = Patient.objects.get(user=user)

# Create medicine
medicine = UserMedicine.objects.create(
    patient=patient,
    medicine_name='Paracetamol',
    generic_name='Acetaminophen',
    dose='500mg',
    instructions='Take with water',
    cycle='Daily',
    schedule='1+0+1',
    with_food='AFTER FOOD',
    indication='Fever'
)

# Query medicines
medicines = UserMedicine.objects.filter(patient=patient)

# Filter by timing
medicines = UserMedicine.objects.filter(
    patient=patient,
    schedule__contains='1+0+0'  # Morning only
)

# Update medicine
medicine.dose = '650mg'
medicine.save()

# Delete medicine
medicine.delete()
```

---

## Model Relationships Diagram

```
User (Django)
  │
  ├── Patient (One-to-One)
  │     │
  │     └── UserMedicine (Many-to-One)
  │
  └── UserColorPreferences (One-to-One)

GlobalMedicine (Independent)
  └── Used for autocomplete suggestions
```

---

## Database Migrations

### Current Migrations

1. `0001_initial.py` - Initial schema creation
2. `0002_usercolorpreferences.py` - Add color preferences model
3. `0003_update_default_colors.py` - Update default color values
4. `0004_alter_usermedicine_dose.py` - Update dose field constraints

### Creating New Migrations

```bash
# Create migration
python manage.py makemigrations medicines

# Apply migration
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

### PostgreSQL-Specific Migrations

For PostgreSQL integration, consider adding:

```python
# ArrayField for timing
from django.contrib.postgres.fields import ArrayField

class UserMedicine(BaseModel):
    timing = ArrayField(
        models.CharField(max_length=20),
        default=list
    )

# JSONField for metadata
from django.contrib.postgres.fields import JSONField

class UserMedicine(BaseModel):
    metadata = JSONField(default=dict, blank=True, null=True)

# GinIndex for full-text search
from django.contrib.postgres.indexes import GinIndex

class GlobalMedicine(BaseModel):
    class Meta:
        indexes = [
            GinIndex(fields=['medicine_name']),
        ]
```

---

## Query Optimization

### Efficient Queries

```python
# GOOD: Use select_related for foreign keys
medicines = UserMedicine.objects.select_related('patient').all()

# GOOD: Use prefetch_related for reverse relations
patient = Patient.objects.prefetch_related('medicines').get(user=user)

# GOOD: Use only() to limit fields
medicines = UserMedicine.objects.only(
    'medicine_name', 'dose', 'schedule'
).all()

# BAD: N+1 query problem
medicines = UserMedicine.objects.all()
for med in medicines:
    print(med.patient.user.username)  # Separate query for each medicine
```

### Using Indexes

```python
# GOOD: Uses medicine_name index
medicines = UserMedicine.objects.filter(
    medicine_name__istartswith='Par'
)

# GOOD: Uses patient foreign key index
medicines = UserMedicine.objects.filter(patient=patient)

# BAD: Function call prevents index usage
from django.db.models.functions import Lower
medicines = UserMedicine.objects.annotate(
    lower_name=Lower('medicine_name')
).filter(lower_name__istartswith='par')
```

---

## Data Validation

### Patient Model

```python
# Age validation
if patient.age < 0 or patient.age > 120:
    raise ValidationError("Invalid age")

# Email validation
if patient.email and '@' not in patient.email:
    raise ValidationError("Invalid email format")
```

### UserMedicine Model

```python
# Cycle validation
valid_cycles = ['Daily', 'per NEED', 'Weekly', 'Only Friday', 'Except WED & THUR']
if medicine.cycle not in valid_cycles:
    raise ValidationError("Invalid cycle value")

# Food timing validation
valid_food_timings = ['BEFORE FOOD', 'AFTER FOOD']
if medicine.with_food not in valid_food_timings:
    raise ValidationError("Invalid food timing value")

# Schedule format validation
import re
if not re.match(r'^[0-9]+\+[0-9]+\+[0-9]+$', medicine.schedule):
    raise ValidationError("Invalid schedule format")
```

### UserColorPreferences Model

```python
# Hex color validation
import re
hex_pattern = r'^#[0-9A-Fa-f]{6}$'

for field in ['morning_color', 'noon_color', 'night_color']:
    color = getattr(preferences, field)
    if not re.match(hex_pattern, color):
        raise ValidationError(f"Invalid hex color: {color}")

# Palette type validation
valid_palettes = ['default', 'vibrant']
if preferences.palette_type not in valid_palettes:
    raise ValidationError("Invalid palette type")
```

---

## Model Signals

### Create Patient Profile Signal

Automatically create patient profile when user is created:

```python
# medicines/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Patient

@receiver(post_save, sender=User)
def create_patient_profile(sender, instance, created, **kwargs):
    if created:
        Patient.objects.create(user=patient=instance)

# medicines/apps.py
default_app_config.ready = lambda: import_module('medicines.signals')
```

---

## Admin Configuration

All models are registered in Django admin:

```python
# medicines/admin.py
from django.contrib import admin
from .models import Patient, GlobalMedicine, UserMedicine, UserColorPreferences

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'email', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'email')
    ordering = ('-created_at',)

@admin.register(GlobalMedicine)
class GlobalMedicineAdmin(admin.ModelAdmin):
    list_display = ('medicine_name', 'generic_name', 'indication')
    search_fields = ('medicine_name', 'generic_name', 'indication')
    ordering = ('medicine_name',)

@admin.register(UserMedicine)
class UserMedicineAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medicine_name', 'dose', 'cycle', 'schedule')
    list_filter = ('cycle', 'with_food')
    search_fields = ('medicine_name', 'generic_name', 'indication')
    ordering = ('-created_at',)

@admin.register(UserColorPreferences)
class UserColorPreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'palette_type', 'morning_color', 'noon_color', 'night_color')
    list_filter = ('palette_type',)
    search_fields = ('user__username', 'palette_type')
    ordering = ('-updated_at',)
```

---

## Testing Models

### Unit Tests

```python
from django.test import TestCase
from medicines.models import Patient, UserMedicine, UserColorPreferences

class PatientModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('john', 'john@example.com', 'password')
        self.patient = Patient.objects.create(user=self.user, age=35)
    
    def test_patient_creation(self):
        self.assertEqual(self.patient.user.username, 'john')
        self.assertEqual(self.patient.age, 35)
    
    def test_patient_str(self):
        self.assertEqual(str(self.patient), 'john')

class UserMedicineModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('john', 'john@example.com', 'password')
        self.patient = Patient.objects.create(user=self.user, age=35)
        self.medicine = UserMedicine.objects.create(
            patient=self.patient,
            medicine_name='Paracetamol',
            dose='500mg',
            cycle='Daily',
            schedule='1+0+1',
            with_food='AFTER FOOD'
        )
    
    def test_medicine_creation(self):
        self.assertEqual(self.medicine.medicine_name, 'Paracetamol')
        self.assertEqual(self.medicine.dose, '500mg')
    
    def test_medicine_str(self):
        self.assertEqual(str(self.medicine), 'Paracetamol')
```

---

## Additional Resources

- [Django Model Documentation](https://docs.djangoproject.com/en/5.0/topics/db/models/)
- [Django ORM QuerySet API](https://docs.djangoproject.com/en/5.0/ref/models/querysets/)
- [PostgreSQL-specific Fields](https://docs.djangoproject.com/en/5.0/ref/contrib/postgres/fields/)
- [MedVoice Integration Guide](MEDVOICE_INTEGRATION.md)

---

*Last Updated: 2026-03-11*
