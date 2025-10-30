"""
Studio CRM URL Configuration
Epic 2: Project Lifecycle Visibility & Tracking - REST API endpoints
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreatorViewSet,
    CreatorCredentialViewSet,
    MilestoneViewSet,
    AuditLogViewSet,
    AIDeliverableViewSet,
    DashboardViewSet,
)

app_name = 'studio_crm'

# DRF Router for automatic URL routing
router = DefaultRouter()

# Register ViewSets
router.register(r'creators', CreatorViewSet, basename='creator')
router.register(r'credentials', CreatorCredentialViewSet, basename='credential')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'deliverables', AIDeliverableViewSet, basename='deliverable')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]

"""
API Endpoints Generated:

CREATORS (Epic 1 & 2):
  GET    /api/crm/creators/                         - List all creators (Story 1.1, 2.4)
  POST   /api/crm/creators/                         - Create creator (Story 1.3)
  GET    /api/crm/creators/{id}/                    - Get creator detail (Story 1.2)
  PUT    /api/crm/creators/{id}/                    - Update creator (Story 1.5)
  PATCH  /api/crm/creators/{id}/                    - Partial update
  DELETE /api/crm/creators/{id}/                    - Delete creator
  POST   /api/crm/creators/{id}/update_journey_status/ - Change status (Story 2.2)
  GET    /api/crm/creators/urgent/                  - Get urgent projects (Story 2.4)
  GET    /api/crm/creators/by_status/               - Group by status

CREDENTIALS (Story 1.4):
  GET    /api/crm/credentials/                      - List credentials
  POST   /api/crm/credentials/                      - Add credential
  GET    /api/crm/credentials/{id}/                 - Get credential
  PUT    /api/crm/credentials/{id}/                 - Update credential
  DELETE /api/crm/credentials/{id}/                 - Delete credential

MILESTONES (Story 2.1):
  GET    /api/crm/milestones/                       - List milestones
  POST   /api/crm/milestones/                       - Create milestone
  GET    /api/crm/milestones/{id}/                  - Get milestone
  PUT    /api/crm/milestones/{id}/                  - Update milestone
  DELETE /api/crm/milestones/{id}/                  - Delete milestone
  POST   /api/crm/milestones/{id}/mark_complete/   - Mark as complete
  GET    /api/crm/milestones/by_creator/           - Get by creator

AUDIT LOGS (Epic 0.4):
  GET    /api/crm/audit-logs/                       - List audit logs (read-only)
  GET    /api/crm/audit-logs/{id}/                  - Get audit log detail
  GET    /api/crm/audit-logs/recent/                - Recent logs
  GET    /api/crm/audit-logs/by_creator/           - Logs for creator

DELIVERABLES (Epic 3):
  GET    /api/crm/deliverables/                     - List deliverables
  POST   /api/crm/deliverables/                     - Create deliverable
  GET    /api/crm/deliverables/{id}/                - Get deliverable

DASHBOARD (Epic 0.3):
  GET    /api/crm/dashboard/                        - Dashboard stats
  GET    /api/crm/dashboard/health_summary/         - Health score distribution
  GET    /api/crm/dashboard/status_summary/         - Status distribution

Query Parameters:
  ?journey_status=ONBOARDING              - Filter by status
  ?health_score=RED                       - Filter by health
  ?urgent_only=true                       - Only urgent projects
  ?active_only=true                       - Only active projects
  ?search=brandname                       - Full-text search
  ?ordering=-created_at                   - Sort results
"""
