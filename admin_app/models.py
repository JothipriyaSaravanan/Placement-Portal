from django.db import models

class AdminUser(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

       
from django.db import models
from datetime import timedelta
from django.utils import timezone

class AdminPasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)


from django.db import models
from django.contrib.auth.models import User

class Announcement(models.Model):
    TARGET_CHOICES = (
        ("student", "Student"),
        ("coordinator", "Coordinator"),
        ("both", "Both"),
    )

    title = models.CharField(max_length=255)
    message = models.TextField()
    important = models.BooleanField(default=False)

    # 🎯 TARGETING
    target_type = models.CharField(max_length=20, choices=TARGET_CHOICES, default="student")

    department = models.CharField(max_length=50, null=True, blank=True)
    programme = models.CharField(max_length=20, null=True, blank=True)
    batch = models.CharField(max_length=10, null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title