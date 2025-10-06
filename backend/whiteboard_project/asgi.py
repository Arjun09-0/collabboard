import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard_project.settings')

# Initialize Django before importing anything else
django.setup()

# Now import Django-related modules
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import whiteboard.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            whiteboard.routing.websocket_urlpatterns
        )
    ),
})