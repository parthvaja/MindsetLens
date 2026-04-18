from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Phase 2: SurveyViewSet will be registered here
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]
