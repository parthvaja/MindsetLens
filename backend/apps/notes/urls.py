from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import TeacherNoteViewSet

router = SimpleRouter()
router.register(r'', TeacherNoteViewSet, basename='notes')

urlpatterns = [
    path('', include(router.urls)),
]
