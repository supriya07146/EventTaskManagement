from django.urls import path

from .views import (
    register,
    login,
    user_list,
    user_detail,
    user_status,
    forgot_password,
    verify_otp,
    reset_password,
    profile,
    upload_profile_image,
    change_password,
)


urlpatterns = [

    # REGISTER
    path(
        "register/",
        register,
        name="register"
    ),

    # LOGIN
    path(
        "login/",
        login,
        name="login"
    ),

    # USER MANAGEMENT
    path(
        "users/",
        user_list,
        name="user-list"
    ),

    path(
        "users/<int:pk>/",
        user_detail,
        name="user-detail"
    ),

    path(
        "users/<int:pk>/status/",
        user_status,
        name="user-status"
    ),

    # FORGOT PASSWORD
    path(
        "forgot-password/",
        forgot_password,
        name="forgot-password"
    ),

    # VERIFY OTP
    path(
        "verify-otp/",
        verify_otp,
        name="verify-otp"
    ),

    # RESET PASSWORD
    path(
        "reset-password/",
        reset_password,
        name="reset-password"
    ),

    # =====================================================
    # PROFILE
    # =====================================================

    path(
        "profile/",
        profile,
        name="profile"
    ),

    path(
        "profile/upload-image/",
        upload_profile_image,
        name="upload-profile-image"
    ),

    path(
        "profile/change-password/",
        change_password,
        name="change-password"
    ),
]