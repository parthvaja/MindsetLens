from rest_framework.routers import SimpleRouter
from django.urls import path, include

from .views import StudyPlanViewSet

router = SimpleRouter()
router.register(r'', StudyPlanViewSet, basename='studyplans')

urlpatterns = [
    path('', include(router.urls)),
]
