# CLAUDE CODE PROMPT: MindsetLens - AI-Powered Teacher Analytics Platform

## PROJECT MISSION
Build a production-ready, full-stack educational technology platform called "MindsetLens" that helps teachers identify student learning mindsets using AI-powered analysis and provides personalized teaching recommendations.

---

## 🎯 CORE REQUIREMENTS

**What to Build:**
A teacher dashboard application where educators can:
1. Add and manage student profiles
2. Conduct mindset assessment surveys (12 questions)
3. View AI-generated Growth Mindset Scores (0-100)
4. Receive personalized teaching recommendations
5. Add ongoing observations and track mindset trends
6. Visualize student progress over time

**Important Constraints:**
- Teachers only (NO student login/dashboard)
- Teachers conduct surveys on their own devices
- Must be production-ready with proper security
- Mobile-responsive design required
- Sub-200ms API response times (excluding AI calls)
- Support 50+ concurrent users

---

## 📚 TECH STACK (Different from Lovable)

### Backend Stack
- **Language:** Python 3.11+
- **Framework:** Django 4.2+ with Django REST Framework (DRF)
- **Database:** PostgreSQL 15+ (with psycopg3)
- **ORM:** Django ORM (built-in)
- **Authentication:** Django Simple JWT (JWT tokens)
- **API Documentation:** drf-spectacular (OpenAPI/Swagger)
- **Task Queue:** Celery with Redis (for async AI calls)
- **Caching:** Redis
- **CORS:** django-cors-headers
- **Environment:** django-environ
- **Testing:** pytest + pytest-django

### Frontend Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3 + HeadlessUI
- **State Management:** Zustand + TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Heroicons
- **HTTP Client:** Axios with interceptors
- **Date Handling:** date-fns
- **Notifications:** react-hot-toast

### AI/ML Stack
- **Primary LLM:** Anthropic Claude API (via anthropic Python SDK)
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2)
- **Sentiment Analysis:** TextBlob or VADER
- **Text Processing:** spaCy (for NER and theme extraction)

### DevOps & Infrastructure
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **WSGI Server:** Gunicorn
- **Process Manager:** Supervisor (for Celery workers)
- **Database Migrations:** Django migrations
- **Static Files:** WhiteNoise (Django static file serving)
- **Monitoring:** Python logging with structured JSON logs

---

## 📂 PROJECT STRUCTURE

```
mindsetlens/
├── backend/                      # Django backend
│   ├── mindsetlens/             # Django project folder
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # Base settings
│   │   │   ├── development.py   # Dev settings
│   │   │   └── production.py    # Prod settings
│   │   ├── urls.py              # Main URL configuration
│   │   ├── wsgi.py
│   │   └── celery.py            # Celery configuration
│   ├── apps/
│   │   ├── accounts/            # Teacher authentication
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── students/            # Student management
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── surveys/             # Survey & responses
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── scoring.py       # Mindset scoring logic
│   │   │   └── tests/
│   │   ├── notes/               # Teacher observations
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── recommendations/     # AI recommendations
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── ai_service.py    # Claude API integration
│   │   │   ├── tasks.py         # Celery tasks
│   │   │   └── tests/
│   │   └── analytics/           # Dashboard stats
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── tests/
│   ├── core/                    # Shared utilities
│   │   ├── middleware.py
│   │   ├── exceptions.py
│   │   ├── pagination.py
│   │   └── permissions.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   ├── manage.py
│   ├── pytest.ini
│   └── Dockerfile
│
├── frontend/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── students/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── survey/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── notes/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── api/             # API route handlers (if needed)
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Chart.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── students/
│   │   │   │   ├── StudentCard.tsx
│   │   │   │   ├── StudentTable.tsx
│   │   │   │   ├── StudentForm.tsx
│   │   │   │   └── MindsetBadge.tsx
│   │   │   ├── surveys/
│   │   │   │   ├── SurveyForm.tsx
│   │   │   │   ├── LikertScale.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── ResultsDisplay.tsx
│   │   │   ├── notes/
│   │   │   │   ├── NotesList.tsx
│   │   │   │   ├── NoteCard.tsx
│   │   │   │   └── NoteForm.tsx
│   │   │   ├── recommendations/
│   │   │   │   ├── RecommendationCard.tsx
│   │   │   │   └── RecommendationsList.tsx
│   │   │   └── charts/
│   │   │       ├── TrendChart.tsx
│   │   │       ├── DonutChart.tsx
│   │   │       └── BarChart.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts     # Axios configuration
│   │   │   │   ├── auth.ts
│   │   │   │   ├── students.ts
│   │   │   │   ├── surveys.ts
│   │   │   │   ├── notes.ts
│   │   │   │   └── analytics.ts
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── constants.ts
│   │   │   └── store/
│   │   │       ├── authStore.ts
│   │   │       └── uiStore.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useStudents.ts
│   │   │   ├── useSurvey.ts
│   │   │   └── useAnalytics.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── student.types.ts
│   │   │   ├── survey.types.ts
│   │   │   └── api.types.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄️ DATABASE SCHEMA (Django Models)

### App: accounts/models.py

```python
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class Teacher(AbstractUser):
    """Custom user model for teachers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    school_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'teachers'
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
```

### App: students/models.py

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Student(models.Model):
    """Student profile managed by teacher"""
    
    GRADE_CHOICES = [
        ('K', 'Kindergarten'),
        ('1', '1st Grade'),
        ('2', '2nd Grade'),
        ('3', '3rd Grade'),
        ('4', '4th Grade'),
        ('5', '5th Grade'),
        ('6', '6th Grade'),
        ('7', '7th Grade'),
        ('8', '8th Grade'),
        ('9', '9th Grade'),
        ('10', '10th Grade'),
        ('11', '11th Grade'),
        ('12', '12th Grade'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('NB', 'Non-binary'),
        ('O', 'Other'),
        ('P', 'Prefer not to say'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        'accounts.Teacher',
        on_delete=models.CASCADE,
        related_name='students'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(4), MaxValueValidator(19)],
        null=True,
        blank=True
    )
    grade_level = models.CharField(max_length=2, choices=GRADE_CHOICES, blank=True)
    gender = models.CharField(max_length=2, choices=GENDER_CHOICES, blank=True)
    notes = models.TextField(blank=True)
    
    # Cached latest mindset data (for quick dashboard display)
    latest_mindset_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    latest_classification = models.CharField(
        max_length=10,
        choices=[('growth', 'Growth'), ('mixed', 'Mixed'), ('fixed', 'Fixed')],
        null=True,
        blank=True
    )
    last_assessed = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'students'
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['teacher', '-last_assessed']),
            models.Index(fields=['latest_classification']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
```

### App: surveys/models.py

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class SurveyResponse(models.Model):
    """Student survey response with mindset analysis"""
    
    SURVEY_TYPES = [
        ('initial', 'Initial Assessment'),
        ('followup', 'Follow-up Assessment'),
        ('quarterly', 'Quarterly Check-in'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='survey_responses'
    )
    survey_type = models.CharField(max_length=20, choices=SURVEY_TYPES, default='initial')
    
    # Store responses as JSONB (PostgreSQL)
    # Format: [{"question_id": "q1", "question_text": "...", "answer_value": 4}, ...]
    responses = models.JSONField()
    
    # Calculated scores
    growth_mindset_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    likert_component = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Score from Likert scale questions only"
    )
    text_adjustment = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Adjustment from NLP analysis of open-ended responses"
    )
    
    mindset_classification = models.CharField(
        max_length=10,
        choices=[('growth', 'Growth'), ('mixed', 'Mixed'), ('fixed', 'Fixed')]
    )
    
    # AI analysis summary
    ai_analysis_summary = models.TextField(blank=True)
    processing_time_ms = models.PositiveIntegerField(help_text="Time to calculate score in milliseconds")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'survey_responses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.survey_type} ({self.created_at.date()})"
```

### App: notes/models.py

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class TeacherNote(models.Model):
    """Teacher observations about student behavior/performance"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='teacher_notes'
    )
    teacher = models.ForeignKey(
        'accounts.Teacher',
        on_delete=models.CASCADE,
        related_name='notes'
    )
    
    note_text = models.TextField(help_text="Observation details")
    observation_date = models.DateField()
    
    # NLP analysis results
    sentiment_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(-1), MaxValueValidator(1)],
        null=True,
        blank=True,
        help_text="Sentiment score: -1 (negative) to 1 (positive)"
    )
    detected_themes = models.JSONField(
        default=list,
        help_text="Array of detected behavioral themes"
    )
    
    # Trigger recommendation regeneration
    triggered_update = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'teacher_notes'
        ordering = ['-observation_date', '-created_at']
        indexes = [
            models.Index(fields=['student', '-observation_date']),
            models.Index(fields=['teacher', '-created_at']),
        ]
    
    def __str__(self):
        return f"Note for {self.student.full_name} on {self.observation_date}"
```

### App: recommendations/models.py

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class TeachingRecommendation(models.Model):
    """AI-generated personalized teaching strategies"""
    
    CATEGORIES = [
        ('communication', 'Communication'),
        ('feedback', 'Feedback'),
        ('challenge', 'Challenge Level'),
        ('motivation', 'Motivation'),
        ('general', 'General Strategy'),
    ]
    
    SOURCES = [
        ('initial_survey', 'Initial Survey'),
        ('followup_survey', 'Follow-up Survey'),
        ('teacher_note', 'Teacher Note'),
        ('combined', 'Combined Analysis'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    
    recommendation_text = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES)
    
    confidence_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="AI confidence in this recommendation (0-1)"
    )
    
    source = models.CharField(max_length=20, choices=SOURCES)
    is_active = models.BooleanField(default=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'teaching_recommendations'
        ordering = ['-confidence_score', '-created_at']
        indexes = [
            models.Index(fields=['student', 'is_active', '-confidence_score']),
        ]
    
    def __str__(self):
        return f"{self.category} for {self.student.full_name}"
```

### App: analytics/models.py

```python
from django.db import models
import uuid

class MindsetTrend(models.Model):
    """Historical tracking of mindset scores"""
    
    SOURCES = [
        ('survey', 'Survey'),
        ('note_analysis', 'Note Analysis'),
        ('combined', 'Combined Analysis'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='mindset_trends'
    )
    
    score = models.DecimalField(max_digits=5, decimal_places=2)
    classification = models.CharField(
        max_length=10,
        choices=[('growth', 'Growth'), ('mixed', 'Mixed'), ('fixed', 'Fixed')]
    )
    data_source = models.CharField(max_length=20, choices=SOURCES)
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mindset_trends'
        ordering = ['student', 'recorded_at']
        indexes = [
            models.Index(fields=['student', 'recorded_at']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.score} ({self.recorded_at.date()})"
```

---

## 🔧 BACKEND IMPLEMENTATION DETAILS

### 1. Settings Configuration (mindsetlens/settings/base.py)

```python
import os
from pathlib import Path
import environ

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False)
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    'django_celery_beat',
    'django_celery_results',
    
    # Local apps
    'apps.accounts',
    'apps.students',
    'apps.surveys',
    'apps.notes',
    'apps.recommendations',
    'apps.analytics',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'mindsetlens.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mindsetlens.wsgi.application'

# Database
DATABASES = {
    'default': env.db('DATABASE_URL')
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Custom user model
AUTH_USER_MODEL = 'accounts.Teacher'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])

# Celery
CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Redis Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# AI API Keys (stored in environment)
ANTHROPIC_API_KEY = env('ANTHROPIC_API_KEY', default='')

# Spectacular (API Documentation)
SPECTACULAR_SETTINGS = {
    'TITLE': 'MindsetLens API',
    'DESCRIPTION': 'AI-powered teacher analytics platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

### 2. Mindset Scoring Algorithm (surveys/scoring.py)

```python
"""
Mindset scoring algorithm with NLP analysis
"""
import re
from decimal import Decimal
from typing import Dict, List, Tuple
from textblob import TextBlob

class MindsetScorer:
    """Calculate growth mindset score from survey responses"""
    
    # Questions requiring reverse scoring (higher value = fixed mindset)
    REVERSE_SCORED = [2, 5, 7]
    
    # Growth mindset indicators
    GROWTH_KEYWORDS = [
        'tried again', 'practiced', 'asked for help', 'learned from',
        'effort', 'worked hard', "didn't give up", 'persevered',
        'improved', 'got better', 'kept trying', 'challenge',
        'mistake', 'learn', 'grow', 'progress', 'practice'
    ]
    
    # Fixed mindset indicators
    FIXED_KEYWORDS = [
        'gave up', 'too hard', 'not good at', "can't do",
        'born with', 'naturally smart', 'talent', 'not smart enough',
        'impossible', 'never', 'always fail', 'just the way i am'
    ]
    
    @classmethod
    def calculate_score(cls, responses: List[Dict]) -> Dict:
        """
        Calculate mindset score from survey responses
        
        Args:
            responses: List of response dicts with format:
                [{"question_id": "q1", "answer_value": 4}, ...]
        
        Returns:
            Dict with score, classification, and components
        """
        # Step 1: Calculate Likert component (questions 1-10)
        likert_score = cls._calculate_likert_score(responses[:10])
        
        # Step 2: Analyze open-ended responses (questions 11-12)
        text_q11 = next((r['answer_text'] for r in responses if r['question_id'] == 'q11'), '')
        text_q12 = next((r['answer_text'] for r in responses if r['question_id'] == 'q12'), '')
        
        text_adjustment = cls._analyze_text_responses(text_q11, text_q12)
        
        # Step 3: Combine scores
        final_score = min(100, max(0, likert_score + text_adjustment))
        
        # Step 4: Classify mindset
        classification = cls._classify_mindset(final_score)
        
        return {
            'growth_mindset_score': round(float(final_score), 2),
            'likert_component': round(float(likert_score), 2),
            'text_adjustment': round(float(text_adjustment), 2),
            'classification': classification
        }
    
    @classmethod
    def _calculate_likert_score(cls, likert_responses: List[Dict]) -> Decimal:
        """Calculate score from Likert scale questions (1-5)"""
        scores = []
        
        for response in likert_responses:
            q_num = int(response['question_id'][1:])  # Extract number from 'q1', 'q2', etc.
            value = response['answer_value']
            
            # Reverse score if needed
            if q_num in cls.REVERSE_SCORED:
                score = 6 - value  # 5->1, 4->2, 3->3, 2->4, 1->5
            else:
                score = value
            
            scores.append(score)
        
        # Average score (1-5 range)
        avg = sum(scores) / len(scores)
        
        # Convert to 0-100 scale
        percentage = ((avg - 1) / 4) * 100
        
        return Decimal(str(percentage))
    
    @classmethod
    def _analyze_text_responses(cls, text_q11: str, text_q12: str) -> Decimal:
        """Analyze open-ended responses for mindset indicators"""
        combined_text = (text_q11 + ' ' + text_q12).lower()
        
        # Count growth indicators
        growth_count = sum(
            1 for phrase in cls.GROWTH_KEYWORDS
            if phrase in combined_text
        )
        
        # Count fixed indicators
        fixed_count = sum(
            1 for phrase in cls.FIXED_KEYWORDS
            if phrase in combined_text
        )
        
        # Sentiment analysis
        sentiment = TextBlob(combined_text).sentiment.polarity  # -1 to 1
        
        # Calculate adjustment
        if growth_count > fixed_count:
            keyword_adjustment = min(10, growth_count * 3)
        elif fixed_count > growth_count:
            keyword_adjustment = -min(10, fixed_count * 3)
        else:
            keyword_adjustment = 0
        
        # Sentiment contributes ±5 points
        sentiment_adjustment = sentiment * 5
        
        total_adjustment = keyword_adjustment + sentiment_adjustment
        
        return Decimal(str(total_adjustment))
    
    @classmethod
    def _classify_mindset(cls, score: Decimal) -> str:
        """Classify mindset based on score"""
        if score >= 70:
            return 'growth'
        elif score >= 40:
            return 'mixed'
        else:
            return 'fixed'
```

### 3. AI Service (recommendations/ai_service.py)

```python
"""
Anthropic Claude API integration for teaching recommendations
"""
import os
import json
from typing import List, Dict
from anthropic import Anthropic
from django.conf import settings

class RecommendationGenerator:
    """Generate personalized teaching recommendations using Claude"""
    
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    def generate_recommendations(
        self,
        student_name: str,
        mindset_score: float,
        classification: str,
        survey_responses: List[Dict],
        teacher_notes: List[str] = None
    ) -> List[Dict]:
        """
        Generate teaching recommendations using Claude API
        
        Args:
            student_name: Student's full name
            mindset_score: Growth mindset score (0-100)
            classification: 'growth', 'mixed', or 'fixed'
            survey_responses: List of survey response dicts
            teacher_notes: Optional list of teacher observation texts
        
        Returns:
            List of recommendation dicts with format:
                [{"category": "communication", "text": "...", "confidence": 0.85}, ...]
        """
        prompt = self._build_prompt(
            student_name,
            mindset_score,
            classification,
            survey_responses,
            teacher_notes or []
        )
        
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                temperature=0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Parse JSON response
            response_text = message.content[0].text
            recommendations = json.loads(response_text)
            
            return recommendations
            
        except Exception as e:
            # Log error and return fallback recommendations
            print(f"Error generating recommendations: {str(e)}")
            return self._get_fallback_recommendations(classification)
    
    def _build_prompt(
        self,
        student_name: str,
        score: float,
        classification: str,
        responses: List[Dict],
        notes: List[str]
    ) -> str:
        """Build the Claude API prompt"""
        
        # Format survey responses
        survey_text = "\n".join([
            f"Q{i+1}: {r.get('question_text', '')}\nAnswer: {r.get('answer_text', r.get('answer_value', ''))}"
            for i, r in enumerate(responses)
        ])
        
        # Format teacher notes
        notes_text = "\n".join([f"- {note}" for note in notes]) if notes else "No notes yet."
        
        prompt = f"""You are an educational psychologist specializing in growth mindset development based on Carol Dweck's research.

**Student Profile:**
- Name: {student_name}
- Growth Mindset Score: {score}/100
- Classification: {classification}

**Survey Responses:**
{survey_text}

**Teacher Observations:**
{notes_text}

**Task:**
Generate 4-5 specific, actionable teaching recommendations for this student. Each recommendation should:
1. Be 1-2 sentences long
2. Focus on specific communication strategies or teaching approaches
3. Be personalized to this student's mindset profile
4. Include a confidence score (0.0-1.0) indicating how strongly you recommend it
5. Be categorized as: communication, feedback, challenge, motivation, or general

**Output Format (JSON only, no markdown):**
[
  {{
    "category": "communication",
    "text": "When this student encounters difficulty, emphasize the learning process rather than the outcome. Use phrases like 'What strategies could you try?' instead of 'Can you do this?'",
    "confidence": 0.90
  }},
  {{
    "category": "feedback",
    "text": "Celebrate specific effort and strategy use: 'I noticed you tried three different approaches to solve that problem.'",
    "confidence": 0.85
  }}
]

Generate the recommendations now:"""

        return prompt
    
    def _get_fallback_recommendations(self, classification: str) -> List[Dict]:
        """Return generic recommendations if AI fails"""
        
        if classification == 'growth':
            return [
                {
                    "category": "challenge",
                    "text": "This student shows strong growth mindset. Provide increasingly challenging tasks to maintain engagement.",
                    "confidence": 0.70
                },
                {
                    "category": "feedback",
                    "text": "Continue praising effort, strategy use, and improvement over time.",
                    "confidence": 0.75
                }
            ]
        elif classification == 'fixed':
            return [
                {
                    "category": "communication",
                    "text": "Emphasize that intelligence and abilities can be developed through effort and practice.",
                    "confidence": 0.80
                },
                {
                    "category": "feedback",
                    "text": "When providing feedback, focus on the process and strategies used rather than innate ability.",
                    "confidence": 0.85
                }
            ]
        else:  # mixed
            return [
                {
                    "category": "motivation",
                    "text": "Help student recognize situations where they demonstrate growth mindset and encourage applying that mindset more broadly.",
                    "confidence": 0.75
                },
                {
                    "category": "general",
                    "text": "Provide explicit teaching about neuroplasticity and how the brain grows stronger with challenge.",
                    "confidence": 0.70
                }
            ]
```

### 4. Celery Tasks (recommendations/tasks.py)

```python
"""
Asynchronous tasks for AI processing
"""
from celery import shared_task
from django.apps import apps
from .ai_service import RecommendationGenerator

@shared_task
def generate_recommendations_async(survey_response_id: str):
    """
    Generate recommendations asynchronously after survey submission
    
    Args:
        survey_response_id: UUID of the SurveyResponse
    """
    SurveyResponse = apps.get_model('surveys', 'SurveyResponse')
    TeachingRecommendation = apps.get_model('recommendations', 'TeachingRecommendation')
    
    try:
        survey = SurveyResponse.objects.get(id=survey_response_id)
        student = survey.student
        
        # Deactivate old recommendations
        TeachingRecommendation.objects.filter(
            student=student,
            is_active=True
        ).update(is_active=False)
        
        # Generate new recommendations
        generator = RecommendationGenerator()
        recommendations = generator.generate_recommendations(
            student_name=student.full_name,
            mindset_score=float(survey.growth_mindset_score),
            classification=survey.mindset_classification,
            survey_responses=survey.responses
        )
        
        # Save to database
        for rec in recommendations:
            TeachingRecommendation.objects.create(
                student=student,
                recommendation_text=rec['text'],
                category=rec['category'],
                confidence_score=rec['confidence'],
                source='initial_survey',
                is_active=True
            )
        
        return f"Generated {len(recommendations)} recommendations"
        
    except Exception as e:
        return f"Error: {str(e)}"

@shared_task
def update_recommendations_from_note(note_id: str):
    """
    Regenerate recommendations when teacher adds a note
    
    Args:
        note_id: UUID of the TeacherNote
    """
    TeacherNote = apps.get_model('notes', 'TeacherNote')
    TeachingRecommendation = apps.get_model('recommendations', 'TeachingRecommendation')
    SurveyResponse = apps.get_model('surveys', 'SurveyResponse')
    
    try:
        note = TeacherNote.objects.get(id=note_id)
        student = note.student
        
        # Get latest survey
        latest_survey = SurveyResponse.objects.filter(
            student=student
        ).order_by('-created_at').first()
        
        if not latest_survey:
            return "No survey found for student"
        
        # Get all teacher notes
        all_notes = TeacherNote.objects.filter(
            student=student
        ).order_by('-observation_date').values_list('note_text', flat=True)
        
        # Deactivate old recommendations
        TeachingRecommendation.objects.filter(
            student=student,
            is_active=True
        ).update(is_active=False)
        
        # Generate updated recommendations
        generator = RecommendationGenerator()
        recommendations = generator.generate_recommendations(
            student_name=student.full_name,
            mindset_score=float(latest_survey.growth_mindset_score),
            classification=latest_survey.mindset_classification,
            survey_responses=latest_survey.responses,
            teacher_notes=list(all_notes)
        )
        
        # Save to database
        for rec in recommendations:
            TeachingRecommendation.objects.create(
                student=student,
                recommendation_text=rec['text'],
                category=rec['category'],
                confidence_score=rec['confidence'],
                source='teacher_note',
                is_active=True
            )
        
        # Mark note as having triggered update
        note.triggered_update = True
        note.save()
        
        return f"Generated {len(recommendations)} updated recommendations"
        
    except Exception as e:
        return f"Error: {str(e)}"
```

---

## 📡 API ENDPOINTS (Django REST Framework)

### Authentication Endpoints (accounts/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import TeacherRegisterSerializer, TeacherSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new teacher"""
    serializer = TeacherRegisterSerializer(data=request.data)
    if serializer.is_valid():
        teacher = serializer.save()
        refresh = RefreshToken.for_user(teacher)
        
        return Response({
            'teacher': TeacherSerializer(teacher).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login teacher"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    teacher = authenticate(request, username=email, password=password)
    
    if teacher:
        refresh = RefreshToken.for_user(teacher)
        
        return Response({
            'teacher': TeacherSerializer(teacher).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    
    return Response(
        {'detail': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['GET'])
def me(request):
    """Get current teacher profile"""
    serializer = TeacherSerializer(request.user)
    return Response(serializer.data)
```

### Survey Endpoints (surveys/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import time
from .models import SurveyResponse
from .serializers import SurveyResponseSerializer, SurveySubmissionSerializer
from .scoring import MindsetScorer
from apps.students.models import Student
from apps.analytics.models import MindsetTrend
from apps.recommendations.tasks import generate_recommendations_async

class SurveyViewSet(viewsets.ModelViewSet):
    """Survey response endpoints"""
    serializer_class = SurveyResponseSerializer
    
    def get_queryset(self):
        return SurveyResponse.objects.filter(
            student__teacher=self.request.user
        )
    
    @action(detail=False, methods=['post'], url_path='submit/(?P<student_id>[^/.]+)')
    def submit_survey(self, request, student_id=None):
        """
        Submit a new survey for a student
        
        POST /api/surveys/submit/{student_id}/
        Body: {
            "survey_type": "initial",
            "responses": [
                {"question_id": "q1", "question_text": "...", "answer_value": 4},
                {"question_id": "q11", "question_text": "...", "answer_text": "..."},
                ...
            ]
        }
        """
        try:
            student = Student.objects.get(
                id=student_id,
                teacher=request.user
            )
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SurveySubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate mindset score
        start_time = time.time()
        scoring_result = MindsetScorer.calculate_score(
            serializer.validated_data['responses']
        )
        processing_time = int((time.time() - start_time) * 1000)  # milliseconds
        
        # Create survey response
        survey = SurveyResponse.objects.create(
            student=student,
            survey_type=serializer.validated_data.get('survey_type', 'initial'),
            responses=serializer.validated_data['responses'],
            growth_mindset_score=scoring_result['growth_mindset_score'],
            likert_component=scoring_result['likert_component'],
            text_adjustment=scoring_result['text_adjustment'],
            mindset_classification=scoring_result['classification'],
            processing_time_ms=processing_time
        )
        
        # Update student's cached data
        student.latest_mindset_score = scoring_result['growth_mindset_score']
        student.latest_classification = scoring_result['classification']
        student.last_assessed = timezone.now()
        student.save()
        
        # Create trend data point
        MindsetTrend.objects.create(
            student=student,
            score=scoring_result['growth_mindset_score'],
            classification=scoring_result['classification'],
            data_source='survey'
        )
        
        # Trigger async recommendation generation
        generate_recommendations_async.delay(str(survey.id))
        
        return Response({
            'survey_id': str(survey.id),
            'growth_mindset_score': scoring_result['growth_mindset_score'],
            'classification': scoring_result['classification'],
            'processing_time_ms': processing_time,
            'message': 'Survey submitted successfully. Recommendations are being generated.'
        }, status=status.HTTP_201_CREATED)
```

---

## 🎨 FRONTEND IMPLEMENTATION (Next.js)

### Survey Questions (lib/utils/constants.ts)

```typescript
export const SURVEY_QUESTIONS = [
  {
    id: 'q1',
    text: 'When I face a difficult problem, I see it as a chance to learn something new.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q2',
    text: "If I don't understand something right away, I usually give up.",
    type: 'likert' as const,
    reversed: true
  },
  {
    id: 'q3',
    text: 'I believe my abilities can improve with practice and effort.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q4',
    text: 'Making mistakes is an important part of learning.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q5',
    text: "I prefer easy tasks where I know I'll do well.",
    type: 'likert' as const,
    reversed: true
  },
  {
    id: 'q6',
    text: 'When I receive criticism, I try to learn from it.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q7',
    text: "I think intelligence is something you're born with and can't change much.",
    type: 'likert' as const,
    reversed: true
  },
  {
    id: 'q8',
    text: 'I enjoy challenging tasks even if I might fail.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q9',
    text: 'When classmates do better than me, I feel inspired to improve.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q10',
    text: 'I believe effort is more important than natural talent.',
    type: 'likert' as const,
    reversed: false
  },
  {
    id: 'q11',
    text: 'Describe a time when you struggled with something in school. What did you do?',
    type: 'text' as const,
    maxLength: 500
  },
  {
    id: 'q12',
    text: 'What do you think makes someone successful in learning?',
    type: 'text' as const,
    maxLength: 500
  }
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' }
];
```

### API Client (lib/api/client.ts)

```typescript
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 - try refresh token
    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    const message = error.response?.data?.detail || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);
```

### Survey Form Component (components/surveys/SurveyForm.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SURVEY_QUESTIONS, LIKERT_OPTIONS } from '@/lib/utils/constants';
import { submitSurvey } from '@/lib/api/surveys';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

interface SurveyFormProps {
  studentId: string;
  studentName: string;
}

export default function SurveyForm({ studentId, studentName }: SurveyFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = SURVEY_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / SURVEY_QUESTIONS.length) * 100;

  const handleLikertResponse = (value: number) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value
    });
  };

  const handleTextResponse = (text: string) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: text
    });
  };

  const canProceed = () => {
    const response = responses[currentQuestion.id];
    if (currentQuestion.type === 'likert') {
      return response !== undefined;
    }
    return response && response.length >= 20;
  };

  const handleNext = () => {
    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Format responses for API
      const formattedResponses = SURVEY_QUESTIONS.map(q => {
        if (q.type === 'likert') {
          return {
            question_id: q.id,
            question_text: q.text,
            answer_value: responses[q.id]
          };
        } else {
          return {
            question_id: q.id,
            question_text: q.text,
            answer_text: responses[q.id]
          };
        }
      });

      const result = await submitSurvey(studentId, {
        survey_type: 'initial',
        responses: formattedResponses
      });

      toast.success('Survey submitted successfully!');
      router.push(`/dashboard/students/${studentId}?survey_complete=true`);
      
    } catch (error) {
      toast.error('Failed to submit survey');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Mindset Survey for {studentName}</h1>
        <ProgressBar progress={progress} />
        <p className="text-sm text-gray-600 mt-2">
          Question {currentStep + 1} of {SURVEY_QUESTIONS.length}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

        {currentQuestion.type === 'likert' ? (
          <div className="space-y-3">
            {LIKERT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleLikertResponse(option.value)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  responses[currentQuestion.id] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <textarea
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleTextResponse(e.target.value)}
              maxLength={currentQuestion.maxLength}
              rows={6}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Type your response here..."
            />
            <p className="text-sm text-gray-500 mt-2">
              {responses[currentQuestion.id]?.length || 0} / {currentQuestion.maxLength} characters
              {responses[currentQuestion.id]?.length < 20 && (
                <span className="text-red-500 ml-2">(minimum 20 characters)</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="secondary"
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          variant="primary"
        >
          {currentStep === SURVEY_QUESTIONS.length - 1
            ? isSubmitting ? 'Submitting...' : 'Submit Survey'
            : 'Next'}
        </Button>
      </div>
    </div>
  );
}
```

---

## 🐳 DOCKER CONFIGURATION

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: mindsetlens_postgres
    environment:
      POSTGRES_DB: mindsetlens
      POSTGRES_USER: mindsetlens_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mindsetlens_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: mindsetlens_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mindsetlens_backend
    command: >
      bash -c "python manage.py migrate &&
               python manage.py collectstatic --noinput &&
               gunicorn mindsetlens.wsgi:application --bind 0.0.0.0:8000 --workers 4"
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - DJANGO_SETTINGS_MODULE=mindsetlens.settings.production
      - DATABASE_URL=postgresql://mindsetlens_user:${DB_PASSWORD}@postgres:5432/mindsetlens
      - REDIS_URL=redis://redis:6379/0

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mindsetlens_celery
    command: celery -A mindsetlens worker -l info
    volumes:
      - ./backend:/app
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - backend
    environment:
      - DJANGO_SETTINGS_MODULE=mindsetlens.settings.production
      - DATABASE_URL=postgresql://mindsetlens_user:${DB_PASSWORD}@postgres:5432/mindsetlens
      - REDIS_URL=redis://redis:6379/0

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mindsetlens_beat
    command: celery -A mindsetlens beat -l info
    volumes:
      - ./backend:/app
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
      - backend
    environment:
      - DJANGO_SETTINGS_MODULE=mindsetlens.settings.production
      - DATABASE_URL=postgresql://mindsetlens_user:${DB_PASSWORD}@postgres:5432/mindsetlens
      - REDIS_URL=redis://redis:6379/0

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: mindsetlens_frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: mindsetlens_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

---

## 🔐 ENVIRONMENT VARIABLES (.env.example)

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DATABASE_URL=postgresql://mindsetlens_user:securepassword@localhost:5432/mindsetlens
DB_PASSWORD=securepassword

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# AI API Keys (NEVER commit actual keys)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Email (optional for production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📋 DEVELOPMENT COMMANDS

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/development.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run Celery worker (separate terminal)
celery -A mindsetlens worker -l info

# Run tests
pytest
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Run migrations in Docker
docker-compose exec backend python manage.py migrate

# Create superuser in Docker
docker-compose exec backend python manage.py createsuperuser
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Setup (Week 1)
- [ ] Set up Django project with apps
- [ ] Create database models and migrations
- [ ] Implement authentication (register, login, JWT)
- [ ] Set up Django REST Framework
- [ ] Create basic student CRUD endpoints
- [ ] Set up Next.js project with TypeScript
- [ ] Implement authentication pages (login/register)
- [ ] Create protected route wrapper

### Phase 2: Survey & Scoring (Week 2)
- [ ] Implement mindset scoring algorithm
- [ ] Create survey submission endpoint
- [ ] Build survey form component
- [ ] Add survey results display
- [ ] Create student detail page
- [ ] Implement dashboard statistics

### Phase 3: AI Integration (Week 3)
- [ ] Set up Celery with Redis
- [ ] Implement Claude API service
- [ ] Create async recommendation tasks
- [ ] Build recommendation display components
- [ ] Add teacher notes feature
- [ ] Implement note-triggered updates

### Phase 4: Analytics & Polish (Week 4)
- [ ] Create trend tracking system
- [ ] Build chart components (Recharts)
- [ ] Add search/filter for students
- [ ] Implement table view
- [ ] Add loading states everywhere
- [ ] Error handling and toasts
- [ ] Write unit tests
- [ ] API documentation (Spectacular)

### Phase 5: Deployment (Week 5)
- [ ] Set up Nginx configuration
- [ ] Configure Docker production settings
- [ ] Set up PostgreSQL backups
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring/logging
- [ ] Deploy to production server
- [ ] Load testing
- [ ] Security audit

---

## 🎯 SUCCESS CRITERIA

The application is complete when:

1. ✅ Teacher can register and log in with JWT
2. ✅ Teacher can add/edit/delete students
3. ✅ Teacher can conduct 12-question survey
4. ✅ System calculates mindset score in < 200ms
5. ✅ AI generates 4-5 personalized recommendations
6. ✅ Teacher can add notes and see updated recommendations
7. ✅ Dashboard shows accurate statistics
8. ✅ Trend charts display score history
9. ✅ Application is responsive on all devices
10. ✅ All API endpoints have proper error handling
11. ✅ Unit tests cover critical functions
12. ✅ Application runs in Docker containers
13. ✅ API documentation is auto-generated
14. ✅ No critical security vulnerabilities

---

## 🚀 DEPLOYMENT NOTES

### Production Checklist:
- [ ] Change SECRET_KEY to cryptographically secure value
- [ ] Set DEBUG=False
- [ ] Configure allowed hosts
- [ ] Set up PostgreSQL with backups
- [ ] Configure Redis persistence
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up log aggregation
- [ ] Configure monitoring (Sentry, New Relic)
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Add CSP headers
- [ ] GDPR/FERPA compliance review

---

**END OF CLAUDE CODE PROMPT**

This is a production-ready, enterprise-grade specification. Use it to build MindsetLens from scratch in your terminal with Claude Code!
