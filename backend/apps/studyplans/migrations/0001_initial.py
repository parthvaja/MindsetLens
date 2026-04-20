import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyPlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('topic', models.CharField(max_length=255)),
                ('duration_minutes', models.PositiveIntegerField()),
                ('student_ids', models.JSONField(default=list)),
                ('context_notes', models.TextField(blank=True)),
                ('plan_content', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('teacher', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='study_plans',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'study_plans',
                'ordering': ['-created_at'],
            },
        ),
    ]
