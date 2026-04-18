from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API
    path('api/auth/', include('apps.accounts.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/surveys/', include('apps.surveys.urls')),
    path('api/notes/', include('apps.notes.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/analytics/', include('apps.analytics.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
