from django.contrib import admin
from .models import Scholarship, Bookmark

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'deadline', 'minimum_gpa')
    search_fields = ('title', 'organization', 'province_restriction')
    list_filter = ('deadline', 'disability_requirement')

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'scholarship', 'created_at')
