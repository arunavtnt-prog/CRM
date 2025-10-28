"""
Django Admin Configuration for Studio CRM
Epic 1: Story 1.1, 1.2 - View and manage creators/brands

Customized admin interface optimized for founder workflows.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Creator, CreatorCredential, Milestone, AuditLog, AIDeliverable


@admin.register(Creator)
class CreatorAdmin(admin.ModelAdmin):
    """
    Story 1.1: Creator/Brand List with filters
    Story 1.2: Full profile view with all sections
    """

    list_display = [
        'brand_name',
        'creator_name',
        'journey_status_badge',
        'health_score_badge',
        'last_status_change',
        'created_at',
    ]

    list_filter = [
        'journey_status',
        'health_score',
        'brand_niche',
        'is_active',
        'priority_level',
    ]

    search_fields = [
        'creator_name',
        'brand_name',
        'creator_email',
        'brand_niche',
    ]

    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'created_by',
        'last_updated_by',
        'health_score',
    ]

    fieldsets = (
        ('Creator Identity', {
            'fields': (
                'creator_name',
                'creator_email',
                'creator_phone',
                'creator_location',
                'creator_timezone',
                'creator_avatar',
            )
        }),
        ('Brand Identity', {
            'fields': (
                'brand_name',
                'brand_tagline',
                'brand_niche',
                'brand_logo',
                'brand_website',
                'brand_description',
            )
        }),
        ('Project Status', {
            'fields': (
                'journey_status',
                'health_score',
                'last_status_change',
                'priority_level',
            )
        }),
        ('Operational Links', {
            'fields': (
                'instagram_handle',
                'youtube_channel',
                'tiktok_handle',
                'twitter_handle',
                'linkedin_profile',
                'other_social_links',
            ),
            'classes': ('collapse',),
        }),
        ('Communication', {
            'fields': (
                'primary_communication_channel',
                'last_contacted_date',
                'next_follow_up_date',
                'communication_notes',
            )
        }),
        ('Custom Fields & Tags', {
            'fields': (
                'custom_fields',
                'tags',
            ),
            'classes': ('collapse',),
        }),
        ('Internal Management', {
            'fields': (
                'is_active',
                'internal_notes',
                'created_at',
                'updated_at',
                'created_by',
                'last_updated_by',
                'id',
            ),
            'classes': ('collapse',),
        }),
    )

    def journey_status_badge(self, obj):
        """Story 2.2: Visual status indicator"""
        colors = {
            'ONBOARDING': '#FFA500',
            'BRAND_BUILDING': '#1E90FF',
            'LAUNCH': '#FFD700',
            'LIVE': '#32CD32',
            'PAUSED': '#808080',
            'CLOSED': '#DC143C',
        }
        color = colors.get(obj.journey_status, '#000000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_journey_status_display()
        )
    journey_status_badge.short_description = 'Journey Status'

    def health_score_badge(self, obj):
        """Story 2.3: Health score visual indicator"""
        colors = {
            'GREEN': '#28a745',
            'YELLOW': '#ffc107',
            'RED': '#dc3545',
        }
        color = colors.get(obj.health_score, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">●</span>',
            color
        )
    health_score_badge.short_description = 'Health'

    def save_model(self, request, obj, form, change):
        """Track who created/updated the record"""
        if not change:
            obj.created_by = request.user
        obj.last_updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CreatorCredential)
class CreatorCredentialAdmin(admin.ModelAdmin):
    """
    Story 1.4: Secure credential vault management
    Masked passwords with controlled access
    """

    list_display = [
        'creator',
        'platform_name',
        'account_identifier',
        'last_verified_date',
        'is_active',
    ]

    list_filter = [
        'platform_name',
        'is_active',
        'last_verified_date',
    ]

    search_fields = [
        'creator__brand_name',
        'creator__creator_name',
        'platform_name',
        'account_identifier',
    ]

    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by']

    fieldsets = (
        ('Identification', {
            'fields': (
                'creator',
                'platform_name',
                'account_identifier',
            )
        }),
        ('Credentials (Encrypted)', {
            'fields': (
                'login_url',
                'password',
                'two_factor_backup_codes',
                'api_keys',
            ),
            'description': 'All fields are encrypted at rest. Access is logged.'
        }),
        ('Management', {
            'fields': (
                'notes',
                'last_verified_date',
                'expires_on',
                'is_active',
            )
        }),
        ('Metadata', {
            'fields': (
                'id',
                'created_at',
                'updated_at',
                'created_by',
            ),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """Track who created this credential"""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    """Story 2.1: Project Timeline & Milestones"""

    list_display = [
        'title',
        'creator',
        'related_journey_stage',
        'target_date',
        'completed_date',
        'status_icon',
    ]

    list_filter = [
        'is_completed',
        'related_journey_stage',
        'target_date',
    ]

    search_fields = [
        'title',
        'creator__brand_name',
        'description',
    ]

    fieldsets = (
        (None, {
            'fields': (
                'creator',
                'title',
                'description',
                'related_journey_stage',
            )
        }),
        ('Timeline', {
            'fields': (
                'target_date',
                'completed_date',
                'is_completed',
            )
        }),
    )

    def status_icon(self, obj):
        """Visual completion indicator"""
        if obj.is_completed:
            return format_html('<span style="color: green; font-size: 18px;">✓</span>')
        return format_html('<span style="color: gray; font-size: 18px;">○</span>')
    status_icon.short_description = 'Status'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Epic 0.4: System Audit Log
    Read-only view of all sensitive actions
    """

    list_display = [
        'timestamp',
        'user_email',
        'action_type',
        'target_model',
        'target_display',
    ]

    list_filter = [
        'action_type',
        'target_model',
        'timestamp',
    ]

    search_fields = [
        'user_email',
        'target_display',
        'notes',
    ]

    readonly_fields = [
        'id',
        'timestamp',
        'user',
        'user_email',
        'ip_address',
        'action_type',
        'target_model',
        'target_id',
        'target_display',
        'changes',
        'notes',
    ]

    def has_add_permission(self, request):
        """Audit logs cannot be manually created"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Audit logs are immutable"""
        return False

    def has_change_permission(self, request, obj=None):
        """Audit logs cannot be edited"""
        return False


@admin.register(AIDeliverable)
class AIDeliverableAdmin(admin.ModelAdmin):
    """Epic 3: AI Deliverable Generation Management"""

    list_display = [
        'deliverable_type',
        'creator',
        'status',
        'ai_model',
        'created_at',
        'created_by',
    ]

    list_filter = [
        'status',
        'deliverable_type',
        'ai_model',
        'created_at',
    ]

    search_fields = [
        'creator__brand_name',
        'deliverable_type',
    ]

    readonly_fields = [
        'id',
        'created_at',
        'created_by',
    ]

    fieldsets = (
        ('Deliverable Info', {
            'fields': (
                'creator',
                'deliverable_type',
                'status',
            )
        }),
        ('Generation Details', {
            'fields': (
                'ai_model',
                'prompt_used',
                'context_data',
            ),
            'classes': ('collapse',),
        }),
        ('Output', {
            'fields': (
                'generated_content',
                'file_url',
                'error_message',
            )
        }),
        ('Metadata', {
            'fields': (
                'id',
                'created_at',
                'created_by',
            ),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """Track who created this deliverable"""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
