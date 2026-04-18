from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate

from .models import Teacher
from .serializers import (
    TeacherSerializer,
    TeacherRegisterSerializer,
    TeacherUpdateSerializer,
    ChangePasswordSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new teacher account."""
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
    """Authenticate teacher and return JWT tokens."""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'detail': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    teacher = authenticate(request, username=email, password=password)
    if teacher is None:
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(teacher)
    return Response({
        'teacher': TeacherSerializer(teacher).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Blacklist the refresh token to log out."""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return the current authenticated teacher's profile."""
    serializer = TeacherSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Partially update the current teacher's profile."""
    serializer = TeacherUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(TeacherSerializer(request.user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change the current teacher's password."""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
