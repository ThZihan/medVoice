# Generated migration to add timestamp fields to existing models

from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('medicines', '0004_alter_usermedicine_dose'),
    ]

    operations = [
        # Add created_at and updated_at to GlobalMedicine with default values for existing rows
        migrations.AddField(
            model_name='globalmedicine',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='globalmedicine',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
        
        # Add created_at and updated_at to Patient with default values for existing rows
        migrations.AddField(
            model_name='patient',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
        
        # Add created_at and updated_at to UserColorPreferences with default values for existing rows
        migrations.AddField(
            model_name='usercolorpreferences',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='usercolorpreferences',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
        
        # Add created_at and updated_at to UserMedicine with default values for existing rows
        migrations.AddField(
            model_name='usermedicine',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='usermedicine',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
    ]
