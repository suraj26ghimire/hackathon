from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ProfileView
from .admin_views import AdminUserListView, AdminScholarshipViewSet, AdminStatsView

admin_router = DefaultRouter()
admin_router.register(r'scholarships', AdminScholarshipViewSet, basename='admin-scholarship')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/', include(admin_router.urls)),
]

