from django.db import models
from django.utils import timezone
from datetime import timedelta



class Student(models.Model):
    university_reg_no = models.CharField(max_length=50, unique=True)  # NO default!
    name = models.CharField(max_length=100, default="Unknown")
    ug_pg = models.CharField(max_length=10, default="Unknown")
    department = models.CharField(max_length=50, default="Unknown")
    programme = models.CharField(max_length=50, default="Unknown")
    email = models.EmailField(max_length=191, blank=True, null=True, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    password = models.CharField(max_length=128, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    passed_out_year = models.IntegerField(blank=True, null=True) 

    def __str__(self):
        return f"{self.name} ({self.university_reg_no})"









class PasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.email} - {self.otp}"


    
    
# Education
class Education(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    degree = models.CharField(max_length=100)
    institution = models.CharField(max_length=150)
    year_of_passing = models.IntegerField()
    cgpa = models.DecimalField(
    max_digits=4,           # or 5 if needed
    decimal_places=2,
    null=True,
    blank=True
)



class Project(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    title = models.CharField(max_length=150)
    description = models.TextField()
    technologies = models.CharField(max_length=255, blank=True)
    github_link = models.URLField(blank=True, null=True)
    live_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



class SocialLinks(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Social Links - {self.student.name}"

class Internship(models.Model):
    domain = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField()
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        db_column="student_id"   # IMPORTANT: maps to your existing column
    )







# Skill
class Skill(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    skill_name = models.CharField(max_length=50)




class StudentProfile(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    about = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='student_profiles/', blank=True, null=True)








class Certificate(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)

    issued_by = models.CharField(max_length=150, blank=True, null=True)
    year_obtained = models.PositiveIntegerField(blank=True, null=True)

    certificate_file = models.FileField(
        upload_to='certificates/',
        blank=True,
        null=True
    )

    def __str__(self):
        return self.title



class Resume(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    resume_file = models.FileField(
        upload_to='resumes/',
        blank=True,
        null=True
    )




class StudentVerificationRequest(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    year = models.IntegerField()
    contact = models.CharField(max_length=15)
    is_rejected = models.BooleanField(default=False)  # ✅ new field
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
