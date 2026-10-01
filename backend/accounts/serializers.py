from rest_framework import serializers

from .models import User, RegistrationDetails


# =========================================================
# REGISTER SERIALIZER
# =========================================================

class RegisterSerializer(serializers.Serializer):

    full_name = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=["user", "admin"]
    )

    # -----------------------------------------------------
    # PASSWORD VALIDATION
    # -----------------------------------------------------

    def validate_password(self, value):

        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must contain at least 8 characters."
            )

        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )

        if not any(char.islower() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )

        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one digit."
            )

        if not any(
            char in "!@#$%^&*"
            for char in value
        ):
            raise serializers.ValidationError(
                "Password must contain at least one special symbol."
            )

        return value

    # -----------------------------------------------------
    # EMAIL VALIDATION
    # -----------------------------------------------------

    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    def create(self, validated_data):

        full_name = validated_data["full_name"]
        email = validated_data["email"]
        password = validated_data["password"]
        role = validated_data["role"]

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role=role
        )

        if role == "admin":
            user.is_staff = True
            user.save()

        RegistrationDetails.objects.create(
            user=user,
            full_name=full_name,
            email=email,
            role=role
        )

        return user


# =========================================================
# USER MANAGEMENT SERIALIZER
# =========================================================

class UserManagementSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = User

        fields = [
            "id",
            "full_name",
            "email",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# =========================================================
# ADMIN CREATE USER SERIALIZER
# =========================================================

class AdminCreateUserSerializer(
    serializers.Serializer
):

    full_name = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    role = serializers.ChoiceField(
        choices=["user", "admin"],
        default="user"
    )

    is_active = serializers.BooleanField(
        default=True
    )

    # -----------------------------------------------------
    # EMAIL VALIDATION
    # -----------------------------------------------------

    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    # =========================================================
# PROFILE SERIALIZER
# =========================================================

class ProfileSerializer(serializers.ModelSerializer):

    profile_image = serializers.SerializerMethodField()

    class Meta:

        model = User

        fields = [
            "id",
            "full_name",
            "email",
            "role",
            "profile_image",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "email",
            "role",
            "created_at",
            "updated_at",
        ]

    def get_profile_image(self, obj):

        if obj.profile_image:
            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    obj.profile_image.url
                )

            return obj.profile_image.url

        return None


# =========================================================
# CHANGE PASSWORD SERIALIZER
# =========================================================

class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate(self, data):

        user = self.context["request"].user

        if not user.check_password(
            data["old_password"]
        ):
            raise serializers.ValidationError({
                "old_password": "Current password is incorrect."
            })

        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        if data["old_password"] == data["new_password"]:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password."
            })

        return data