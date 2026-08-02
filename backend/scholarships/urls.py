from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScholarshipViewSet, BookmarkViewSet

router = DefaultRouter()
router.register(r'list', ScholarshipViewSet, basename='scholarship')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')

urlpatterns = [
    path('', include(router.urls)),
]
