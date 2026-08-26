from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def register_view(request):

    if request.user.is_authenticated:
        return redirect("/")


    if request.method == "POST":

        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")
        confirm_password = request.POST.get(
            "confirm_password",
            ""
        )


        if not username or not email or not password:
            messages.error(
                request,
                "All fields are required."
            )
            return render(
                request,
                "accounts/register.html"
            )


        if password != confirm_password:
            messages.error(
                request,
                "Passwords do not match."
            )
            return render(
                request,
                "accounts/register.html"
            )


        from .models import User


        if User.objects.filter(
            username=username
        ).exists():

            messages.error(
                request,
                "Username already exists."
            )
            return render(
                request,
                "accounts/register.html"
            )


        if User.objects.filter(
            email=email
        ).exists():

            messages.error(
                request,
                "Email already exists."
            )
            return render(
                request,
                "accounts/register.html"
            )


        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )


        login(request, user)

        return redirect("/")


    return render(
        request,
        "accounts/register.html"
    )


@ensure_csrf_cookie
def login_view(request):

    if request.user.is_authenticated:
        return redirect("/")


    if request.method == "POST":

        username = request.POST.get(
            "username",
            ""
        ).strip()

        password = request.POST.get(
            "password",
            ""
        )


        user = authenticate(
            request,
            username=username,
            password=password
        )


        if user is not None:

            login(request, user)

            return redirect("/")


        messages.error(
            request,
            "Invalid username or password."
        )


    return render(
        request,
        "accounts/login.html"
    )


@login_required
def logout_view(request):

    logout(request)

    return redirect("/accounts/login/")


@login_required
def current_user_view(request):

    return JsonResponse({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "role": "Project Manager",
    })

@login_required
def users_list_view(request):

    from django.contrib.auth import get_user_model

    User = get_user_model()

    users = User.objects.filter(
        is_active=True
    ).values(
        "id",
        "username",
    )

    return JsonResponse(
        list(users),
        safe=False,
    )