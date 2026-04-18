from pathlib import Path

from .base import *  # noqa

DEBUG = True

# Override with a fixed dev-only key so the server works without a .env file
# and so JWT tokens meet the minimum 32-byte key length requirement.
# Never use this value outside local development.
SECRET_KEY = 'dev-only-secret-key-not-for-production-mindsetlens-2024'  # noqa: S105

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Use SQLite in development — no PostgreSQL installation required.
# BASE_DIR points to the backend/ folder (three parents up from this file).
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': Path(__file__).resolve().parent.parent.parent / 'db.sqlite3',
    }
}

INSTALLED_APPS += ['django_extensions']  # noqa: F405

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Use console email backend in development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Easier password validation in development
AUTH_PASSWORD_VALIDATORS = []

# ── Celery ────────────────────────────────────────────────────────────────────
# Run tasks synchronously in the same process so Redis is not required.
# CELERY_TASK_EAGER_PROPAGATES = False means task exceptions are logged
# but do NOT bubble up and crash the HTTP request.
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = False

# ── Cache ─────────────────────────────────────────────────────────────────────
# Replace the Redis cache backend with Django's built-in local-memory cache.
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        # psycopg.pq logs a DEBUG message when its C extension is unavailable
        # and it falls back to the pure-Python implementation.  The fallback
        # is transparent; raise the threshold so it doesn't clutter output.
        'psycopg.pq': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
