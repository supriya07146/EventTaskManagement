from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User,
    RegistrationDetails,
    LoginDetails,
    PasswordResetOTP
)

from .serializers import (
    RegisterSerializer,
    UserManagementSerializer,
    AdminCreateUserSerializer,
    ProfileSerializer,
    ChangePasswordSerializer,
)

from notifications.utils import create_notification
from django.contrib.auth.hashers import make_password

import random
import string
from datetime import timedelta


# =========================================================
# HELPER - JWT TOKENS
# =========================================================

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# =========================================================
# HELPER - TEMPORARY PASSWORD
# =========================================================

def generate_temporary_password(length=10):
    characters = string.ascii_letters + string.digits + "!@#$%"
    return "".join(random.choice(characters) for _ in range(length))


# =========================================================
# REGISTER
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():

        user = serializer.save()

        create_notification(
            notification_type="new_user",
            title="New User Registered",
            message=f"{user.full_name} has registered successfully.",
            user=user
        )

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "message": "Registration successful",

                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                },

                "accessToken": tokens["access"],
                "refreshToken": tokens["refresh"],
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# LOGIN
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    email = (request.data.get("email") or "").strip()
    password = request.data.get("password")
    role = request.data.get("role")

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find the account ignoring upper / lower case in the email
    account = User.objects.filter(email__iexact=email).first()

    user = None

    if account:
        user = authenticate(
            request,
            email=account.email,
            password=password
        )

    if user is None:

        # LoginDetails.user is required, so a failed attempt can only
        # be logged when the email belongs to a real account.
        if account:
            LoginDetails.objects.create(
                user=account,
                email=account.email,
                role=role or account.role,
                login_status="Failed"
            )

        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:

        LoginDetails.objects.create(
            user=user,
            email=user.email,
            role=user.role,
            login_status="Failed"
        )

        return Response(
            {"error": "Your account is inactive"},
            status=status.HTTP_403_FORBIDDEN
        )

    if role and user.role != role:

        LoginDetails.objects.create(
            user=user,
            email=user.email,
            role=role,
            login_status="Failed"
        )

        return Response(
            {"error": "Invalid role"},
            status=status.HTTP_403_FORBIDDEN
        )

    LoginDetails.objects.create(
        user=user,
        email=user.email,
        role=user.role,
        login_status="Success"
    )

    tokens = get_tokens_for_user(user)

    return Response(
        {
            "message": "Login successful",

            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
            },

            "accessToken": tokens["access"],
            "refreshToken": tokens["refresh"],
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# USER LIST
# GET  - List users
# POST - Create user from Admin Dashboard
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def user_list(request):

    # -----------------------------------------------------
    # ADMIN CHECK
    # -----------------------------------------------------

    if not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # GET USERS
    # -----------------------------------------------------

    if request.method == "GET":

        users = User.objects.all().order_by("-created_at")

        search = request.GET.get("search")
        role = request.GET.get("role")
        status_filter = request.GET.get("status")

        if search:
            users = users.filter(
                full_name__icontains=search
            ) | users.filter(
                email__icontains=search
            )

        if role:
            users = users.filter(role=role)

        if status_filter == "active":
            users = users.filter(is_active=True)

        elif status_filter == "inactive":
            users = users.filter(is_active=False)

        serializer = UserManagementSerializer(
            users,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    serializer = AdminCreateUserSerializer(
        data=request.data
    )

    if serializer.is_valid():

        full_name = serializer.validated_data["full_name"]
        email = serializer.validated_data["email"]
        role = serializer.validated_data.get(
            "role",
            "user"
        )

        temporary_password = generate_temporary_password()

        user = User.objects.create_user(
            email=email,
            password=temporary_password,
            full_name=full_name,
            role=role
        )

        user.is_active = True
        user.is_staff = role == "admin"
        user.save()

        RegistrationDetails.objects.create(
            user=user,
            full_name=user.full_name,
            email=user.email,
            role=user.role
        )

        # -------------------------------------------------
        # NOTIFICATION
        # -------------------------------------------------

        create_notification(
            notification_type="new_user",
            title="New User Registered",
            message=f"{user.full_name} has been registered.",
            user=user
        )

        # -------------------------------------------------
        # EMAIL
        # -------------------------------------------------

        send_mail(
            subject="Your Account Credentials",
            message=(
                f"Hello {user.full_name},\n\n"
                f"Your account has been created.\n\n"
                f"Email: {user.email}\n"
                f"Temporary Password: {temporary_password}\n\n"
                f"Please change your password after login."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "User created successfully",
                "user": UserManagementSerializer(user).data,
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# USER DETAIL
# GET    - Get user
# PUT    - Update user
# DELETE - Delete user
# =========================================================

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):

    if not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(pk=pk)

    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = UserManagementSerializer(user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    if request.method == "PUT":

        serializer = UserManagementSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_user = serializer.save()

            create_notification(
                notification_type="user_updated",
                title="User Updated",
                message=(
                    f"{updated_user.full_name}'s account "
                    f"has been updated."
                ),
                user=updated_user
            )

            return Response(
                UserManagementSerializer(updated_user).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    user_name = user.full_name
    user_email = user.email

    create_notification(
        notification_type="user_deleted",
        title="User Deleted",
        message=(
            f"User {user_name} ({user_email}) "
            f"has been deleted."
        )
    )

    user.delete()

    return Response(
        {"message": "User deleted successfully"},
        status=status.HTTP_200_OK
    )


# =========================================================
# USER STATUS
# PATCH - Activate / Deactivate User
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def user_status(request, pk):

    if not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        user = User.objects.get(pk=pk)

    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    user.is_active = request.data.get(
        "is_active",
        user.is_active
    )

    user.save()

    status_text = (
        "Active"
        if user.is_active
        else "Inactive"
    )

    create_notification(
        notification_type="user_status",
        title="User Status Updated",
        message=(
            f"{user.full_name}'s status was changed "
            f"to {status_text}."
        ),
        user=user
    )

    return Response(
        {
            "message": "User status updated successfully",
            "is_active": user.is_active
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# FORGOT PASSWORD
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):

    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    otp = str(random.randint(100000, 999999))

    PasswordResetOTP.objects.create(
        user=user,
        otp=otp,
        expires_at=timezone.now() + timedelta(minutes=10)
    )

    send_mail(
        subject="Password Reset OTP",
        message=f"Your password reset OTP is {otp}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False
    )

    return Response(
        {"message": "OTP sent successfully"},
        status=status.HTTP_200_OK
    )


# =========================================================
# VERIFY OTP
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):

    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response(
            {"error": "Email and OTP are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    otp_record = PasswordResetOTP.objects.filter(
        user=user,
        otp=otp,
        is_verified=False
    ).order_by("-created_at").first()

    if not otp_record:
        return Response(
            {"error": "Invalid OTP"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if timezone.now() > otp_record.expires_at:
        return Response(
            {"error": "OTP expired"},
            status=status.HTTP_400_BAD_REQUEST
        )

    otp_record.is_verified = True
    otp_record.save()

    return Response(
        {"message": "OTP verified successfully"},
        status=status.HTTP_200_OK
    )


# =========================================================
# RESET PASSWORD
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):

    email = request.data.get("email")
    new_password = request.data.get("new_password")

    if not email or not new_password:
        return Response(
            {"error": "Email and new password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    otp_record = PasswordResetOTP.objects.filter(
        user=user,
        is_verified=True
    ).order_by("-created_at").first()

    if not otp_record:
        return Response(
            {"error": "OTP verification required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.password = make_password(new_password)
    user.save()

    otp_record.delete()

    return Response(
        {"message": "Password reset successfully"},
        status=status.HTTP_200_OK
    )


# =========================================================
# PROFILE
# GET  - View Profile
# PUT  - Edit Profile
# =========================================================

@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile(request):

    user = request.user

    # -----------------------------------------------------
    # VIEW PROFILE
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = ProfileSerializer(
            user,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # EDIT PROFILE
    # -----------------------------------------------------

    serializer = ProfileSerializer(
        user,
        data=request.data,
        partial=True,
        context={"request": request}
    )

    if serializer.is_valid():

        updated_user = serializer.save()

        create_notification(
            notification_type="user_updated",
            title="Profile Updated",
            message=(
                f"{updated_user.full_name} "
                f"updated their profile."
            ),
            user=updated_user
        )

        return Response(
            {
                "message": "Profile updated successfully",
                "user": ProfileSerializer(
                    updated_user,
                    context={"request": request}
                ).data
            },
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# UPLOAD PROFILE IMAGE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):

    user = request.user

    if "profile_image" not in request.FILES:

        return Response(
            {
                "error": "Please select an image."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user.profile_image = request.FILES["profile_image"]

    user.save()

    create_notification(
        notification_type="user_updated",
        title="Profile Image Updated",
        message=(
            f"{user.full_name} "
            f"updated their profile image."
        ),
        user=user
    )

    serializer = ProfileSerializer(
        user,
        context={"request": request}
    )

    return Response(
        {
            "message": "Profile image uploaded successfully",
            "profile_image": serializer.data["profile_image"]
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# CHANGE PASSWORD
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):

    serializer = ChangePasswordSerializer(
        data=request.data,
        context={"request": request}
    )

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user

    user.set_password(
        serializer.validated_data["new_password"]
    )

    user.save()

    create_notification(
        notification_type="user_updated",
        title="Password Changed",
        message=(
            f"{user.full_name}'s password "
            f"was changed successfully."
        ),
        user=user
    )

    return Response(
        {
            "message": "Password changed successfully. Please login again."
        },
        status=status.HTTP_200_OK
    )