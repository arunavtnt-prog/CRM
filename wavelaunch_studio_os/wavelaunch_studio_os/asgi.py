"""
ASGI config for Wavelaunch Studio OS.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wavelaunch_studio_os.settings')

application = get_asgi_application()
