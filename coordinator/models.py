
from django.db import models
from django.contrib.auth.models import User

class DepartmentCoordinator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    programme = models.CharField(max_length=100, null=True, blank=True)  # 👈 TEMP FIX
    department = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True,      # 👈 TEMPORARY
        blank=True
    )



# coordinator/models.py
from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name




# coordinator/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta

class CoordinatorPasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        """OTP is valid for 5 minutes"""
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.email} - {self.otp}"






# coordinator/models.py

from django.db import models
from django.contrib.auth.models import User
from students.models import Student



class CoordinatorMessage(models.Model):
    coordinator = models.ForeignKey(
        DepartmentCoordinator,
        on_delete=models.CASCADE
    )
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.department}"