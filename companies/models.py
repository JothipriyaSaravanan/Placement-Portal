

from django.db import models
from django.contrib.auth.hashers import check_password

class Company(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=191, unique=True)
    password = models.CharField(max_length=255)
    contact = models.CharField(
    max_length=15,
    unique=True,
    null=True,
    blank=True
)


    # ─── Core company info ────────────────────────────────────────
    registration_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)

    # Location
    location = models.CharField(max_length=120, blank=True)           # e.g. Chennai, Bangalore
    address = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True)

    # Company details
    industry = models.CharField(max_length=100, blank=True, null=True)
    company_type = models.CharField(max_length=50, blank=True, null=True)  # Private, Public, Startup...
    employee_count = models.CharField(max_length=50, blank=True, null=True)  # 1-50, 51-200...
    founded_year = models.PositiveIntegerField(blank=True, null=True)

    # Description
    description = models.TextField(blank=True, null=True)

    # ─── Social links (added LinkedIn + others) ────────────────────
    linkedin = models.URLField(max_length=255, blank=True, null=True)     # ← LinkedIn company page
    twitter = models.URLField(max_length=255, blank=True, null=True)      # optional
    facebook = models.URLField(max_length=255, blank=True, null=True)     # optional
    instagram = models.URLField(max_length=255, blank=True, null=True)    # optional

    # Status & moderation
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    rejected_reason = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['name']


class CompanyVerificationRequest(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=191, unique=True)
    contact = models.CharField(max_length=20)

    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


from django.utils import timezone           # ← Add this line
from datetime import timedelta

class CompanyPasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)








class Job(models.Model):
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=150, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=50, default='full_time')
    last_date_to_apply = models.DateField(null=True, blank=True)
    skills = models.JSONField(default=list, blank=True)

    # Approval workflow
    is_active = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    admin_remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Department targeting
    departments = models.JSONField(default=list, blank=True)
    show_to_all_departments = models.BooleanField(default=False)
    programmes = models.JSONField(default=list, blank=True)
    graduation_years = models.JSONField(default=list, blank=True)


    graduation_years = models.JSONField(default=list, blank=True)


    def __str__(self):
        return f"{self.title} @ {self.company.name}"







class JobApplication(models.Model):
    student = models.ForeignKey(
        'students.Student',           # ← correct: app_label.ModelName
        on_delete=models.CASCADE,
        related_name='applications'
    )
    job = models.ForeignKey(
        Job,                          # ← can use class name directly here
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=40,
        default='Applied',
        choices=[
            ('Applied', 'Applied'),
            ('Shortlisted', 'Shortlisted'),
            ('Rejected', 'Rejected'),
            ('Selected', 'Selected'),
        ]
    )
    resume_used = models.ForeignKey(
        'students.Resume',            # ← correct: app_label.ModelName
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_in_applications'
    )
    cover_letter = models.TextField(blank=True)

    class Meta:
        unique_together = ['student', 'job']


    def __str__(self):
        return f"{self.student.name} → {self.job.title}"




class OfferLetter(models.Model):
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='offer_letters'
    )
    company = models.ForeignKey(
        'Company',
        on_delete=models.CASCADE,
        related_name='sent_offer_letters'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='offer_letters'
    )
    offer_letter = models.FileField(upload_to='offer_letters/')
    message = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_viewed_by_student = models.BooleanField(default=False)

    def __str__(self):
        return f"Offer Letter: {self.student.name} - {self.company.name}"

