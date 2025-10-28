"""
WSGI config for Wavelaunch Studio OS.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wavelaunch_studio_os.settings')

application = get_wsgi_application()
