"""
Django Signals for Audit Logging
Epic 0.4: Automatic audit trail for sensitive actions

Captures all CREATE, UPDATE, DELETE actions on critical models.
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Creator, CreatorCredential, AuditLog
import threading

# Thread-local storage for request context
_thread_locals = threading.local()


def get_current_request():
    """Get the current HTTP request from thread-local storage"""
    return getattr(_thread_locals, 'request', None)


def set_current_request(request):
    """Store the current HTTP request in thread-local storage"""
    _thread_locals.request = request


class AuditMiddleware:
    """
    Middleware to capture request context for audit logging
    Add to MIDDLEWARE in settings.py after AuthenticationMiddleware
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_current_request(request)
        response = self.get_response(request)
        set_current_request(None)
        return response


def create_audit_log(user, action_type, target_model, target_id, target_display, changes=None, notes=''):
    """
    Helper function to create audit log entries
    Story 0.4: Capture User ID, Action, Target, Timestamp
    """
    request = get_current_request()
    ip_address = None

    if request:
        # Get IP address from request
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

    AuditLog.objects.create(
        user=user,
        user_email=user.email if user else 'system',
        ip_address=ip_address,
        action_type=action_type,
        target_model=target_model,
        target_id=target_id,
        target_display=target_display,
        changes=changes or {},
        notes=notes,
    )


# Store original values before update
@receiver(pre_save, sender=Creator)
def store_creator_original(sender, instance, **kwargs):
    """Store original values before update for change tracking"""
    if instance.pk:
        try:
            instance._original = Creator.objects.get(pk=instance.pk)
        except Creator.DoesNotExist:
            instance._original = None
    else:
        instance._original = None


@receiver(post_save, sender=Creator)
def audit_creator_changes(sender, instance, created, **kwargs):
    """
    Log Creator CREATE and UPDATE actions
    Story 1.5: Audit log for sensitive changes
    """
    request = get_current_request()
    user = request.user if request and request.user.is_authenticated else None

    if created:
        # CREATE action
        create_audit_log(
            user=user,
            action_type='CREATE',
            target_model='Creator',
            target_id=instance.id,
            target_display=str(instance),
            changes={
                'created': {
                    'brand_name': instance.brand_name,
                    'creator_name': instance.creator_name,
                    'journey_status': instance.journey_status,
                }
            },
            notes='New creator/brand added to system'
        )
    else:
        # UPDATE action - track what changed
        if hasattr(instance, '_original') and instance._original:
            changes = {}
            original = instance._original

            # Track important field changes
            important_fields = [
                'journey_status', 'health_score', 'creator_email',
                'brand_name', 'is_active', 'priority_level'
            ]

            for field in important_fields:
                old_value = getattr(original, field, None)
                new_value = getattr(instance, field, None)
                if old_value != new_value:
                    changes[field] = {
                        'from': str(old_value),
                        'to': str(new_value)
                    }

            if changes:
                create_audit_log(
                    user=user,
                    action_type='UPDATE',
                    target_model='Creator',
                    target_id=instance.id,
                    target_display=str(instance),
                    changes=changes,
                    notes='Creator/brand record updated'
                )


@receiver(post_delete, sender=Creator)
def audit_creator_deletion(sender, instance, **kwargs):
    """Log Creator DELETE actions"""
    request = get_current_request()
    user = request.user if request and request.user.is_authenticated else None

    create_audit_log(
        user=user,
        action_type='DELETE',
        target_model='Creator',
        target_id=instance.id,
        target_display=str(instance),
        changes={
            'deleted': {
                'brand_name': instance.brand_name,
                'creator_name': instance.creator_name,
            }
        },
        notes='Creator/brand removed from system'
    )


@receiver(post_save, sender=CreatorCredential)
def audit_credential_access(sender, instance, created, **kwargs):
    """
    Log Credential CREATE and UPDATE - HIGH SECURITY
    Story 1.4: All credential access must be logged
    """
    request = get_current_request()
    user = request.user if request and request.user.is_authenticated else None

    action = 'CREATE' if created else 'UPDATE'

    create_audit_log(
        user=user,
        action_type=action,
        target_model='CreatorCredential',
        target_id=instance.id,
        target_display=f"{instance.creator.brand_name} - {instance.platform_name}",
        changes={
            'platform': instance.platform_name,
            'account': instance.account_identifier,
        },
        notes=f'Credential {action.lower()}d - passwords are encrypted'
    )


@receiver(post_delete, sender=CreatorCredential)
def audit_credential_deletion(sender, instance, **kwargs):
    """Log Credential DELETE - HIGH SECURITY"""
    request = get_current_request()
    user = request.user if request and request.user.is_authenticated else None

    create_audit_log(
        user=user,
        action_type='DELETE',
        target_model='CreatorCredential',
        target_id=instance.id,
        target_display=f"{instance.creator.brand_name} - {instance.platform_name}",
        changes={
            'platform': instance.platform_name,
            'account': instance.account_identifier,
        },
        notes='Credential permanently deleted'
    )
