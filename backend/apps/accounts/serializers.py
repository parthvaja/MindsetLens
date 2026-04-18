from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Teacher


class TeacherSerializer(serializers.ModelSerializer):
    """Read-only teacher profile serializer."""

    class Meta:
        model = Teacher
        fields = ('id', 'email', 'first_name', 'last_name', 'school_name', 'phone', 'created_at')
        read_only_fields = ('id', 'created_at')


class TeacherRegisterSerializer(serializers.ModelSerializer):
    """Registration serializer — validates and creates a Teacher."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password')

    class Meta:
        model = Teacher
        fields = ('email', 'username', 'first_name', 'last_name', 'school_name', 'phone', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        teacher = Teacher(**validated_data)
        teacher.set_password(password)
        teacher.save()
        return teacher


class TeacherUpdateSerializer(serializers.ModelSerializer):
    """Partial update serializer for teacher profile."""

    class Meta:
        model = Teacher
        fields = ('first_name', 'last_name', 'school_name', 'phone')


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
