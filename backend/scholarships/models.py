from django.db import models
from django.conf import settings

class Scholarship(models.Model):
    title = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    description = models.TextField()
    eligibility = models.TextField()
    minimum_gpa = models.FloatField(null=True, blank=True)
    eligible_education_level = models.CharField(max_length=200, blank=True)
    eligible_field = models.CharField(max_length=200, blank=True)
    province_restriction = models.CharField(max_length=200, blank=True)
    income_requirement_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gender_requirement = models.CharField(max_length=50, blank=True)
    disability_requirement = models.BooleanField(default=False)
    ethnicity_requirement = models.CharField(max_length=100, blank=True)
    benefits = models.TextField()
    required_documents = models.TextField()
    deadline = models.DateField(null=True, blank=True)
    deadline_text = models.TextField(blank=True)
    official_link = models.URLField(max_length=500)
    source = models.CharField(max_length=100, blank=True)
    source_identifier = models.CharField(
        max_length=100, blank=True, db_index=True,
    )
    country = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    last_checked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.title

class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'scholarship')
