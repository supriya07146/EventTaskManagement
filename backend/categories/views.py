from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Category
from .serializers import CategorySerializer

from notifications.utils import create_notification


# =========================================================
# ADMIN CHECK
# =========================================================

def check_admin(request):

    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    return None


# =========================================================
# CATEGORY LIST
# GET  - List categories
# POST - Create category
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def category_list(request):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    if request.method == "GET":

        categories = Category.objects.all().order_by("-created_at")

        search = request.GET.get("search")

        if search:
            categories = categories.filter(
                name__icontains=search
            )

        serializer = CategorySerializer(
            categories,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    serializer = CategorySerializer(data=request.data)

    if serializer.is_valid():

        category = serializer.save()

        create_notification(
            notification_type="new_category",
            title="New Category Created",
            message=(
                f"Category '{category.name}' "
                f"has been created."
            ),
            user=request.user
        )

        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# CATEGORY DETAIL
# GET    - View category
# PUT    - Update category
# DELETE - Delete category
# =========================================================

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    try:
        category = Category.objects.get(pk=pk)

    except Category.DoesNotExist:
        return Response(
            {"error": "Category not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = CategorySerializer(category)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    if request.method == "PUT":

        serializer = CategorySerializer(
            category,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_category = serializer.save()

            create_notification(
                notification_type="category_updated",
                title="Category Updated",
                message=(
                    f"Category '{updated_category.name}' "
                    f"has been updated."
                ),
                user=request.user
            )

            return Response(
                CategorySerializer(updated_category).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    category_name = category.name

    create_notification(
        notification_type="category_deleted",
        title="Category Deleted",
        message=(
            f"Category '{category_name}' "
            f"has been deleted."
        ),
        user=request.user
    )

    category.delete()

    return Response(
        {"message": "Category deleted successfully"},
        status=status.HTTP_200_OK
    )