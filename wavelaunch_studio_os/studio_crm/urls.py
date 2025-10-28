"""
Studio CRM URL Configuration
API endpoints for frontend integration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# API routes will be added as we build the views
# from .views import CreatorViewSet, CredentialViewSet

app_name = 'studio_crm'

# router = DefaultRouter()
# router.register(r'creators', CreatorViewSet, basename='creator')
# router.register(r'credentials', CredentialViewSet, basename='credential')

urlpatterns = [
    # path('', include(router.urls)),
]
