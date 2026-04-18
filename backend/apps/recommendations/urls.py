from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import TeachingRecommendationViewSet

router = SimpleRouter()
router.register(r'', TeachingRecommendationViewSet, basename='recommendations')

urlpatterns = [
    path('', include(router.urls)),
]
