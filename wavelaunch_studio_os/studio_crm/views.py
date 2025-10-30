"""
Django REST Framework Views for Studio CRM
Epic 2: Project Lifecycle Visibility & Tracking

API endpoints for frontend integration.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone

from .models import (
    Creator,
    CreatorCredential,
    Milestone,
    AuditLog,
    AIDeliverable,
    JourneyStatus,
    HealthScore
)
from .serializers import (
    CreatorListSerializer,
    CreatorDetailSerializer,
    CreatorCreateUpdateSerializer,
    CreatorCredentialSerializer,
    MilestoneSerializer,
    AuditLogSerializer,
    AIDeliverableSerializer,
    JourneyStatusUpdateSerializer,
    DashboardStatsSerializer,
)


class CreatorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Creator CRUD operations

    Epic 1:
    - Story 1.1: View creator brand list
    - Story 1.2: View creator profile
    - Story 1.3: Add creator/brand
    - Story 1.5: Edit creator profile

    Epic 2:
    - Story 2.2: Change journey status
    - Story 2.4: Filter/sort by health score
    """

    queryset = Creator.objects.all().select_related(
        'created_by',
        'last_updated_by'
    ).prefetch_related('milestones', 'credentials')

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # Story 2.4: Filter by status and health score
    filterset_fields = {
        'journey_status': ['exact', 'in'],
        'health_score': ['exact', 'in'],
        'brand_niche': ['exact', 'icontains'],
        'is_active': ['exact'],
        'priority_level': ['exact', 'lte', 'gte'],
    }

    # Story 1.1: Search creators
    search_fields = ['creator_name', 'brand_name', 'creator_email', 'brand_niche']

    # Story 2.4: Sort by health score and status
    ordering_fields = [
        'created_at',
        'updated_at',
        'last_status_change',
        'brand_name',
        'creator_name',
        'health_score',
        'priority_level'
    ]
    ordering = ['-last_status_change']  # Most recent first

    def get_serializer_class(self):
        """Use different serializers for list vs detail views"""
        if self.action == 'list':
            return CreatorListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CreatorCreateUpdateSerializer
        return CreatorDetailSerializer

    def get_queryset(self):
        """
        Story 2.4: Filter creators by health score
        Support urgent_only parameter for dashboard
        """
        queryset = super().get_queryset()

        # Filter for urgent projects (Red or Yellow health)
        if self.request.query_params.get('urgent_only') == 'true':
            queryset = queryset.filter(
                health_score__in=[HealthScore.RED, HealthScore.YELLOW]
            )

        # Filter for active projects only
        if self.request.query_params.get('active_only') == 'true':
            queryset = queryset.filter(is_active=True)

        return queryset

    @action(detail=True, methods=['post'])
    def update_journey_status(self, request, pk=None):
        """
        Story 2.2: Change Journey Status
        POST /api/crm/creators/{id}/update_journey_status/

        Body: {"journey_status": "BRAND_BUILDING", "notes": "optional"}
        """
        creator = self.get_object()
        serializer = JourneyStatusUpdateSerializer(
            creator,
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()

            # Return updated creator
            return Response(
                CreatorDetailSerializer(creator).data,
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """
        Get creators with urgent health status (Red or Yellow)
        GET /api/crm/creators/urgent/

        Story 2.4: Filter by health score for dashboard
        """
        urgent_creators = self.get_queryset().filter(
            health_score__in=[HealthScore.RED, HealthScore.YELLOW],
            is_active=True
        ).order_by('health_score', 'last_status_change')

        serializer = CreatorListSerializer(urgent_creators, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """
        Get creators grouped by journey status
        GET /api/crm/creators/by_status/

        Returns: {
            "ONBOARDING": [...],
            "BRAND_BUILDING": [...],
            ...
        }
        """
        creators_by_status = {}

        for status_choice in JourneyStatus.choices:
            status_key = status_choice[0]
            creators = self.get_queryset().filter(
                journey_status=status_key,
                is_active=True
            )
            creators_by_status[status_key] = CreatorListSerializer(
                creators,
                many=True
            ).data

        return Response(creators_by_status)


class MilestoneViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Milestone CRUD operations
    Story 2.1: View Project Timeline/Roadmap
    """

    queryset = Milestone.objects.all().select_related('creator')
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    filterset_fields = {
        'creator': ['exact'],
        'is_completed': ['exact'],
        'related_journey_stage': ['exact'],
    }

    ordering_fields = ['target_date', 'completed_date', 'created_at']
    ordering = ['target_date']

    @action(detail=False, methods=['get'])
    def by_creator(self, request):
        """
        Get milestones for a specific creator
        GET /api/crm/milestones/by_creator/?creator_id={uuid}
        """
        creator_id = request.query_params.get('creator_id')

        if not creator_id:
            return Response(
                {'error': 'creator_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        milestones = self.get_queryset().filter(creator_id=creator_id)
        serializer = self.get_serializer(milestones, many=True)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """
        Mark a milestone as completed
        POST /api/crm/milestones/{id}/mark_complete/
        """
        milestone = self.get_object()
        milestone.is_completed = True
        milestone.completed_date = timezone.now().date()
        milestone.save()

        serializer = self.get_serializer(milestone)
        return Response(serializer.data)


class CreatorCredentialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CreatorCredential operations
    Story 1.4: Securely store login links

    Note: All access is automatically logged via signals
    """

    queryset = CreatorCredential.objects.all().select_related('creator', 'created_by')
    serializer_class = CreatorCredentialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    filterset_fields = {
        'creator': ['exact'],
        'platform_name': ['exact', 'icontains'],
        'is_active': ['exact'],
    }

    def get_queryset(self):
        """Filter credentials by creator if specified"""
        queryset = super().get_queryset()
        creator_id = self.request.query_params.get('creator_id')

        if creator_id:
            queryset = queryset.filter(creator_id=creator_id)

        return queryset


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for AuditLog
    Epic 0.4: System Audit Log

    No create/update/delete - logs are immutable
    """

    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    filterset_fields = {
        'action_type': ['exact'],
        'target_model': ['exact'],
        'user': ['exact'],
    }

    ordering_fields = ['timestamp']
    ordering = ['-timestamp']  # Most recent first

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent audit log entries (last 50)
        GET /api/crm/audit-logs/recent/
        """
        recent_logs = self.get_queryset()[:50]
        serializer = self.get_serializer(recent_logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_creator(self, request):
        """
        Get audit logs for a specific creator
        GET /api/crm/audit-logs/by_creator/?creator_id={uuid}
        """
        creator_id = request.query_params.get('creator_id')

        if not creator_id:
            return Response(
                {'error': 'creator_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logs = self.get_queryset().filter(
            target_model='Creator',
            target_id=creator_id
        )

        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


class AIDeliverableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AIDeliverable operations
    Epic 3: Automated Deliverable Generation
    """

    queryset = AIDeliverable.objects.all().select_related('creator', 'created_by')
    serializer_class = AIDeliverableSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    filterset_fields = {
        'creator': ['exact'],
        'deliverable_type': ['exact'],
        'status': ['exact'],
    }

    ordering_fields = ['created_at']
    ordering = ['-created_at']


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for Dashboard statistics
    Epic 0.3: View Dashboard with key metrics
    """

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        GET /api/crm/dashboard/

        Returns comprehensive dashboard statistics:
        - Total creators and active count
        - Counts by journey status
        - Counts by health score
        - Recent updates (last 5)
        - Urgent projects (Red/Yellow health)
        """

        # Total counts
        all_creators = Creator.objects.all()
        total_creators = all_creators.count()
        active_creators = all_creators.filter(is_active=True).count()

        # Journey status counts
        onboarding_count = all_creators.filter(
            journey_status=JourneyStatus.ONBOARDING
        ).count()
        brand_building_count = all_creators.filter(
            journey_status=JourneyStatus.BRAND_BUILDING
        ).count()
        launch_count = all_creators.filter(
            journey_status=JourneyStatus.LAUNCH
        ).count()
        live_count = all_creators.filter(
            journey_status=JourneyStatus.LIVE
        ).count()
        paused_count = all_creators.filter(
            journey_status=JourneyStatus.PAUSED
        ).count()
        closed_count = all_creators.filter(
            journey_status=JourneyStatus.CLOSED
        ).count()

        # Health score counts (Story 2.3, 2.4)
        red_health_count = all_creators.filter(
            health_score=HealthScore.RED
        ).count()
        yellow_health_count = all_creators.filter(
            health_score=HealthScore.YELLOW
        ).count()
        green_health_count = all_creators.filter(
            health_score=HealthScore.GREEN
        ).count()

        # Recent updates (last 5 updated)
        recent_updates = all_creators.order_by('-updated_at')[:5]

        # Urgent projects (Red or Yellow health, active only)
        urgent_projects = all_creators.filter(
            health_score__in=[HealthScore.RED, HealthScore.YELLOW],
            is_active=True
        ).order_by('health_score', 'last_status_change')[:10]

        # Serialize data
        stats = {
            'total_creators': total_creators,
            'active_creators': active_creators,
            'onboarding_count': onboarding_count,
            'brand_building_count': brand_building_count,
            'launch_count': launch_count,
            'live_count': live_count,
            'paused_count': paused_count,
            'closed_count': closed_count,
            'red_health_count': red_health_count,
            'yellow_health_count': yellow_health_count,
            'green_health_count': green_health_count,
            'recent_updates': CreatorListSerializer(recent_updates, many=True).data,
            'urgent_projects': CreatorListSerializer(urgent_projects, many=True).data,
        }

        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def health_summary(self, request):
        """
        GET /api/crm/dashboard/health_summary/

        Returns health score distribution
        """
        return Response({
            'red': Creator.objects.filter(health_score=HealthScore.RED).count(),
            'yellow': Creator.objects.filter(health_score=HealthScore.YELLOW).count(),
            'green': Creator.objects.filter(health_score=HealthScore.GREEN).count(),
        })

    @action(detail=False, methods=['get'])
    def status_summary(self, request):
        """
        GET /api/crm/dashboard/status_summary/

        Returns journey status distribution
        """
        return Response({
            'ONBOARDING': Creator.objects.filter(
                journey_status=JourneyStatus.ONBOARDING
            ).count(),
            'BRAND_BUILDING': Creator.objects.filter(
                journey_status=JourneyStatus.BRAND_BUILDING
            ).count(),
            'LAUNCH': Creator.objects.filter(
                journey_status=JourneyStatus.LAUNCH
            ).count(),
            'LIVE': Creator.objects.filter(
                journey_status=JourneyStatus.LIVE
            ).count(),
            'PAUSED': Creator.objects.filter(
                journey_status=JourneyStatus.PAUSED
            ).count(),
            'CLOSED': Creator.objects.filter(
                journey_status=JourneyStatus.CLOSED
            ).count(),
        })
