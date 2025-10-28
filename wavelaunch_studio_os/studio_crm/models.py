"""
Wavelaunch Studio OS - Data Models
Epic 1: Creator Data & Identity Management

These models represent the complete creator/brand lifecycle and operational data.
Story 1.3: 24+ custom fields for comprehensive tracking
Story 1.4: Secure credential vault with encryption
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import URLValidator, EmailValidator
from django.utils import timezone
from encrypted_model_fields.fields import EncryptedCharField, EncryptedTextField
import uuid


class JourneyStatus(models.TextChoices):
    """
    Epic 2: Project Lifecycle stages
    Story 2.1: Journey Status tracking
    """
    ONBOARDING = 'ONBOARDING', 'Onboarding'
    BRAND_BUILDING = 'BRAND_BUILDING', 'Brand Building'
    LAUNCH = 'LAUNCH', 'Launch'
    LIVE = 'LIVE', 'Live'
    PAUSED = 'PAUSED', 'Paused'
    CLOSED = 'CLOSED', 'Closed'


class HealthScore(models.TextChoices):
    """
    Epic 2: Health Score indicators
    Story 2.3: Visual health indicators
    """
    GREEN = 'GREEN', 'Green - On Track'
    YELLOW = 'YELLOW', 'Yellow - Needs Attention'
    RED = 'RED', 'Red - Urgent'


class Creator(models.Model):
    """
    Core Creator/Brand entity combining personal and business data.

    Epic 1, Story 1.2: All critical info in one place
    Story 1.3: 24+ fields for comprehensive tracking
    """

    # Primary Identity
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='creators_created')
    last_updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='creators_updated')

    # === CREATOR PERSONAL INFO (Fields 1-6) ===
    creator_name = models.CharField(max_length=200, help_text="Full name of the creator")
    creator_email = models.EmailField(validators=[EmailValidator()], unique=True)
    creator_phone = models.CharField(max_length=20, blank=True, null=True)
    creator_location = models.CharField(max_length=200, blank=True, help_text="City, Country")
    creator_timezone = models.CharField(max_length=50, default='UTC')
    creator_avatar = models.ImageField(upload_to='creator_avatars/', blank=True, null=True)

    # === BRAND IDENTITY (Fields 7-12) ===
    brand_name = models.CharField(max_length=200, db_index=True, help_text="Primary brand name")
    brand_tagline = models.CharField(max_length=500, blank=True)
    brand_niche = models.CharField(max_length=200, help_text="Industry/niche (e.g., Fitness, Tech, Finance)")
    brand_logo = models.ImageField(upload_to='brand_logos/', blank=True, null=True)
    brand_website = models.URLField(blank=True, validators=[URLValidator()])
    brand_description = models.TextField(blank=True, help_text="Elevator pitch / brand positioning")

    # === PROJECT STATUS & HEALTH (Fields 13-16) ===
    journey_status = models.CharField(
        max_length=20,
        choices=JourneyStatus.choices,
        default=JourneyStatus.ONBOARDING,
        db_index=True,
        help_text="Story 2.2: Current stage in creator journey"
    )
    health_score = models.CharField(
        max_length=10,
        choices=HealthScore.choices,
        default=HealthScore.GREEN,
        db_index=True,
        help_text="Story 2.3: Auto-calculated urgency indicator"
    )
    last_status_change = models.DateTimeField(auto_now_add=True)
    priority_level = models.IntegerField(
        default=3,
        help_text="1=Highest, 5=Lowest priority for studio attention"
    )

    # === OPERATIONAL LINKS (Fields 17-22) ===
    instagram_handle = models.CharField(max_length=100, blank=True)
    youtube_channel = models.URLField(blank=True, validators=[URLValidator()])
    tiktok_handle = models.CharField(max_length=100, blank=True)
    twitter_handle = models.CharField(max_length=100, blank=True)
    linkedin_profile = models.URLField(blank=True, validators=[URLValidator()])
    other_social_links = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional platforms as key-value pairs"
    )

    # === COMMUNICATION & ENGAGEMENT (Fields 23-26) ===
    primary_communication_channel = models.CharField(
        max_length=50,
        default='Email',
        help_text="Preferred: Email, WhatsApp, Slack, etc."
    )
    last_contacted_date = models.DateField(blank=True, null=True)
    next_follow_up_date = models.DateField(blank=True, null=True)
    communication_notes = models.TextField(
        blank=True,
        help_text="Story 1.2: Key conversation history and context"
    )

    # === FLEXIBLE CUSTOM FIELDS (Story 1.3) ===
    custom_fields = models.JSONField(
        default=dict,
        blank=True,
        help_text="Story 1.3: JSONB for unlimited custom attributes"
    )

    # === METADATA ===
    is_active = models.BooleanField(default=True)
    internal_notes = models.TextField(
        blank=True,
        help_text="Private studio notes, never shared"
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="Tags for filtering (e.g., ['VIP', 'High-Revenue', 'Needs-Attention'])"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Creator/Brand"
        verbose_name_plural = "Creators/Brands"
        indexes = [
            models.Index(fields=['journey_status', 'health_score']),
            models.Index(fields=['brand_name']),
            models.Index(fields=['-last_status_change']),
        ]

    def __str__(self):
        return f"{self.creator_name} - {self.brand_name}"

    def save(self, *args, **kwargs):
        """Auto-update health score on save based on business logic"""
        self.health_score = self.calculate_health_score()
        super().save(*args, **kwargs)

    def calculate_health_score(self):
        """
        Story 2.3: Health score calculation logic
        Based on last status change age and journey stage
        """
        from datetime import timedelta

        days_since_update = (timezone.now() - self.last_status_change).days

        # Red flags (urgent attention needed)
        if days_since_update > 14 and self.journey_status in ['ONBOARDING', 'BRAND_BUILDING']:
            return HealthScore.RED
        if days_since_update > 30:
            return HealthScore.RED
        if self.journey_status == 'PAUSED' and days_since_update > 7:
            return HealthScore.YELLOW

        # Yellow flags (needs attention soon)
        if days_since_update > 7 and self.journey_status in ['ONBOARDING', 'BRAND_BUILDING']:
            return HealthScore.YELLOW
        if self.next_follow_up_date and self.next_follow_up_date < timezone.now().date():
            return HealthScore.YELLOW

        # Green (on track)
        return HealthScore.GREEN


class CreatorCredential(models.Model):
    """
    Story 1.4: Secure credential vault for login links and passwords
    Epic 0.4: All access logged for audit trail

    Encrypted storage for sensitive operational access credentials.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='credentials')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    # Credential Identification
    platform_name = models.CharField(
        max_length=100,
        help_text="E.g., Instagram Business, YouTube Studio, Shopify Admin"
    )
    account_identifier = models.CharField(
        max_length=200,
        help_text="Username or email associated with this login"
    )

    # Encrypted Sensitive Data (Story 1.4)
    login_url = EncryptedCharField(max_length=500, blank=True, help_text="Direct login link")
    password = EncryptedCharField(max_length=200, blank=True, help_text="Encrypted password")
    two_factor_backup_codes = EncryptedTextField(blank=True, help_text="2FA recovery codes if applicable")
    api_keys = EncryptedTextField(blank=True, help_text="API keys or tokens in JSON format")

    # Metadata
    notes = models.TextField(blank=True, help_text="Special instructions for accessing this account")
    last_verified_date = models.DateField(blank=True, null=True, help_text="Last time we confirmed access works")
    expires_on = models.DateField(blank=True, null=True, help_text="Password expiration date if applicable")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['platform_name']
        verbose_name = "Credential"
        verbose_name_plural = "Credentials"
        unique_together = ['creator', 'platform_name', 'account_identifier']

    def __str__(self):
        return f"{self.creator.brand_name} - {self.platform_name} ({self.account_identifier})"


class Milestone(models.Model):
    """
    Story 2.1: Project Timeline & Milestones
    Track key achievements and deliverables per creator
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='milestones')
    created_at = models.DateTimeField(auto_now_add=True)

    title = models.CharField(max_length=200, help_text="E.g., 'Brand Identity Delivered', 'First 1K Subscribers'")
    description = models.TextField(blank=True)
    target_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    # Link to journey stage
    related_journey_stage = models.CharField(
        max_length=20,
        choices=JourneyStatus.choices,
        help_text="Which stage this milestone belongs to"
    )

    class Meta:
        ordering = ['target_date', '-is_completed']
        verbose_name = "Milestone"
        verbose_name_plural = "Milestones"

    def __str__(self):
        status = "✓" if self.is_completed else "○"
        return f"{status} {self.title} - {self.creator.brand_name}"


class AuditLog(models.Model):
    """
    Epic 0.4: System Audit Log
    Story 0.4: Capture all sensitive actions for security and compliance

    Immutable log of all critical system actions.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    # Actor
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    user_email = models.EmailField(help_text="Snapshot of user email at time of action")
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    # Action Details
    action_type = models.CharField(
        max_length=50,
        db_index=True,
        help_text="E.g., CREATE, UPDATE, DELETE, VIEW_CREDENTIAL, GENERATE_DELIVERABLE"
    )
    target_model = models.CharField(max_length=50, help_text="Model name (Creator, Credential, etc.)")
    target_id = models.UUIDField(help_text="ID of the affected object")
    target_display = models.CharField(max_length=200, help_text="Human-readable target description")

    # Change Details
    changes = models.JSONField(
        default=dict,
        help_text="Before/after values for updates, or full object for creates"
    )

    # Context
    notes = models.TextField(blank=True, help_text="Additional context or reason for action")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Audit Log Entry"
        verbose_name_plural = "Audit Logs"
        indexes = [
            models.Index(fields=['-timestamp', 'action_type']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M')} - {self.user_email} - {self.action_type} on {self.target_display}"


class AIDeliverable(models.Model):
    """
    Epic 3: Automated Deliverable Generation
    Story 3.1-3.4: AI-generated documents and assets
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='deliverables')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    # Deliverable Type
    deliverable_type = models.CharField(
        max_length=100,
        help_text="E.g., Brand Guidelines, Progress Report, Launch Plan"
    )

    # Generation Details
    prompt_used = models.TextField(help_text="The AI prompt template used")
    context_data = models.JSONField(help_text="Creator data snapshot used for generation")
    ai_model = models.CharField(max_length=50, default='claude-3-5-sonnet', help_text="AI model used")

    # Output
    generated_content = models.TextField(help_text="Raw AI output")
    file_url = models.URLField(blank=True, help_text="Link to generated PDF/asset if applicable")

    # Status (Story 3.3)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('GENERATING', 'Generating'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
        ],
        default='PENDING'
    )
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "AI Deliverable"
        verbose_name_plural = "AI Deliverables"

    def __str__(self):
        return f"{self.deliverable_type} for {self.creator.brand_name} - {self.status}"
