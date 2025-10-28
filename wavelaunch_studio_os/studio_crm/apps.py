"""
Studio CRM App Configuration
"""
from django.apps import AppConfig


class StudioCrmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'studio_crm'
    verbose_name = 'Wavelaunch Studio CRM'

    def ready(self):
        """Import signal handlers when app is ready"""
        import studio_crm.signals
