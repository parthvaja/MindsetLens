from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import SurveyViewSet

router = SimpleRouter()
router.register(r'', SurveyViewSet, basename='surveys')

urlpatterns = [
    path('', include(router.urls)),
]
