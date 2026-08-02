from rest_framework import viewsets, permissions, filters
from .models import Scholarship, Bookmark
from .serializers import ScholarshipSerializer, BookmarkSerializer

from django.db.models import F
from django.utils import timezone

class ScholarshipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ScholarshipSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'organization', 'eligibility', 'eligible_field', 'province_restriction']

    def get_queryset(self):
        # Only show active scholarships and those with upcoming or unknown deadlines
        today = timezone.localdate()
        return Scholarship.objects.filter(
            is_active=True,
        ).exclude(
            deadline__lt=today
        ).order_by(F('deadline').asc(nulls_last=True), '-updated_at')
class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
