from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'chat', ChatMessageViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
]