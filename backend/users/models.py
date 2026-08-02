from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    pass

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True)
    province = models.CharField(max_length=50, blank=True)
    district = models.CharField(max_length=50, blank=True)
    education_level = models.CharField(max_length=50, blank=True)
    university_school = models.CharField(max_length=100, blank=True)
    field_of_study = models.CharField(max_length=100, blank=True)
    current_semester = models.CharField(max_length=20, blank=True)
    gpa = models.FloatField(null=True, blank=True)
    family_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    disability_status = models.BooleanField(default=False)
    ethnicity = models.CharField(max_length=50, blank=True)
    interests = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
