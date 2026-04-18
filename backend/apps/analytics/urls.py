from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import DashboardStatsView, MindsetTrendViewSet

router = SimpleRouter()
router.register(r'trends', MindsetTrendViewSet, basename='trends')

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', include(router.urls)),
]
