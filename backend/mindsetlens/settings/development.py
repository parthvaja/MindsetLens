from .base import *  # noqa

DEBUG = True

INSTALLED_APPS += ['django_extensions']  # noqa: F405

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Use console email backend in development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Easier password validation in development
AUTH_PASSWORD_VALIDATORS = []

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
