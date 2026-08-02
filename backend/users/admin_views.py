from rest_framework import viewsets, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from scholarships.models import Scholarship
from scholarships.serializers import ScholarshipSerializer

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """Only allow staff/superusers."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/ — list all registered users."""
    queryset = User.objects.all().select_related('profile').order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class AdminScholarshipViewSet(viewsets.ModelViewSet):
    """Full CRUD on scholarships for admin users."""
    queryset = Scholarship.objects.all().order_by('-created_at')
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAdminUser]


class AdminStatsView(APIView):
    """GET /api/admin/stats/ — quick dashboard numbers."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from scholarships.models import Bookmark
        return Response({
            'total_users': User.objects.count(),
            'total_scholarships': Scholarship.objects.count(),
            'total_bookmarks': Bookmark.objects.count(),
        })
