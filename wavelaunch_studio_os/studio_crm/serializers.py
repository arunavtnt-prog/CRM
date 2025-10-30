"""
Django REST Framework Serializers for Studio CRM
Epic 2: API layer for frontend integration
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Creator,
    CreatorCredential,
    Milestone,
    AuditLog,
    AIDeliverable,
    JourneyStatus,
    HealthScore
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (for created_by, last_updated_by)"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class MilestoneSerializer(serializers.ModelSerializer):
    """
    Serializer for Milestone model
    Story 2.1: Project timeline and milestones
    """

    class Meta:
        model = Milestone
        fields = [
            'id',
            'creator',
            'title',
            'description',
            'target_date',
            'completed_date',
            'is_completed',
            'related_journey_stage',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """Ensure completed_date is set when is_completed is True"""
        if data.get('is_completed') and not data.get('completed_date'):
            from django.utils import timezone
            data['completed_date'] = timezone.now().date()
        return data


class CreatorCredentialSerializer(serializers.ModelSerializer):
    """
    Serializer for CreatorCredential model
    Story 1.4: Secure credential vault

    Note: Encrypted fields are automatically encrypted/decrypted by the model
    """

    class Meta:
        model = CreatorCredential
        fields = [
            'id',
            'creator',
            'platform_name',
            'account_identifier',
            'login_url',
            'password',
            'two_factor_backup_codes',
            'api_keys',
            'notes',
            'last_verified_date',
            'expires_on',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},  # Never return password in GET requests
            'two_factor_backup_codes': {'write_only': True},
            'api_keys': {'write_only': True},
        }


class CreatorListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for Creator list views
    Story 1.1: Creator/Brand List
    Story 2.4: Filter/sort by Health Score
    """

    created_by = UserSerializer(read_only=True)
    journey_status_display = serializers.CharField(
        source='get_journey_status_display',
        read_only=True
    )
    health_score_display = serializers.CharField(
        source='get_health_score_display',
        read_only=True
    )
    milestone_count = serializers.SerializerMethodField()
    credential_count = serializers.SerializerMethodField()

    class Meta:
        model = Creator
        fields = [
            'id',
            'creator_name',
            'creator_email',
            'brand_name',
            'brand_niche',
            'journey_status',
            'journey_status_display',
            'health_score',
            'health_score_display',
            'last_status_change',
            'priority_level',
            'is_active',
            'created_at',
            'updated_at',
            'created_by',
            'milestone_count',
            'credential_count',
            'tags',
        ]
        read_only_fields = ['id', 'health_score', 'created_at', 'updated_at']

    def get_milestone_count(self, obj):
        """Count of milestones for this creator"""
        return obj.milestones.count()

    def get_credential_count(self, obj):
        """Count of credentials for this creator"""
        return obj.credentials.count()


class CreatorDetailSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for Creator detail views
    Story 1.2: View Creator Profile
    Story 2.1: Include milestones for timeline
    """

    created_by = UserSerializer(read_only=True)
    last_updated_by = UserSerializer(read_only=True)
    journey_status_display = serializers.CharField(
        source='get_journey_status_display',
        read_only=True
    )
    health_score_display = serializers.CharField(
        source='get_health_score_display',
        read_only=True
    )
    milestones = MilestoneSerializer(many=True, read_only=True)
    credentials = CreatorCredentialSerializer(many=True, read_only=True)

    class Meta:
        model = Creator
        fields = '__all__'
        read_only_fields = [
            'id',
            'health_score',
            'created_at',
            'updated_at',
            'created_by',
            'last_updated_by',
            'last_status_change',
        ]

    def update(self, instance, validated_data):
        """
        Story 2.2: Track journey status changes
        Update last_status_change when journey_status changes
        """
        old_status = instance.journey_status
        new_status = validated_data.get('journey_status', old_status)

        if old_status != new_status:
            from django.utils import timezone
            validated_data['last_status_change'] = timezone.now()

        return super().update(instance, validated_data)


class CreatorCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating Creator records
    Story 1.3: Add Creator/Brand with all fields
    """

    class Meta:
        model = Creator
        fields = [
            'creator_name',
            'creator_email',
            'creator_phone',
            'creator_location',
            'creator_timezone',
            'creator_avatar',
            'brand_name',
            'brand_tagline',
            'brand_niche',
            'brand_logo',
            'brand_website',
            'brand_description',
            'journey_status',
            'priority_level',
            'instagram_handle',
            'youtube_channel',
            'tiktok_handle',
            'twitter_handle',
            'linkedin_profile',
            'other_social_links',
            'primary_communication_channel',
            'last_contacted_date',
            'next_follow_up_date',
            'communication_notes',
            'custom_fields',
            'is_active',
            'internal_notes',
            'tags',
        ]

    def create(self, validated_data):
        """Track who created this record"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            validated_data['last_updated_by'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Track who updated this record"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['last_updated_by'] = request.user
        return super().update(instance, validated_data)


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for AuditLog (read-only)
    Epic 0.4: System Audit Log
    """

    user = UserSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = '__all__'  # Audit logs are immutable


class AIDeliverableSerializer(serializers.ModelSerializer):
    """
    Serializer for AIDeliverable
    Epic 3: AI-generated documents
    """

    creator = CreatorListSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = AIDeliverable
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']


class JourneyStatusUpdateSerializer(serializers.Serializer):
    """
    Dedicated serializer for journey status updates
    Story 2.2: Change Journey Status
    """

    journey_status = serializers.ChoiceField(choices=JourneyStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        """Update journey status and log the change"""
        from django.utils import timezone

        old_status = instance.journey_status
        new_status = validated_data['journey_status']

        instance.journey_status = new_status
        instance.last_status_change = timezone.now()

        # Track who made the change
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            instance.last_updated_by = request.user

        instance.save()

        # Log to audit trail (handled by signals)
        return instance


class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializer for dashboard statistics
    Epic 0.3: View Dashboard with key metrics
    """

    total_creators = serializers.IntegerField()
    active_creators = serializers.IntegerField()
    onboarding_count = serializers.IntegerField()
    brand_building_count = serializers.IntegerField()
    launch_count = serializers.IntegerField()
    live_count = serializers.IntegerField()
    paused_count = serializers.IntegerField()
    closed_count = serializers.IntegerField()
    red_health_count = serializers.IntegerField()
    yellow_health_count = serializers.IntegerField()
    green_health_count = serializers.IntegerField()
    recent_updates = CreatorListSerializer(many=True, read_only=True)
    urgent_projects = CreatorListSerializer(many=True, read_only=True)
