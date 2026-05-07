




from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Student,
    StudentProfile,
    Education,
    Skill,
    Certificate,
    Resume,
    StudentVerificationRequest,
)

# =====================================================
# STUDENT VERIFICATION REQUEST ADMIN
# =====================================================

@admin.register(StudentVerificationRequest)
class StudentVerificationRequestAdmin(admin.ModelAdmin):
    list_display = (
        'email',
        'username',
        'department',
        'year',
        'contact',
        'status_badge',
        'created_at',
    )
    list_filter = ('is_approved', 'department', 'created_at')
    search_fields = ('email', 'username', 'contact')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    actions = ['approve_requests', 'reject_requests']

    def status_badge(self, obj):
        if obj.is_approved:
            return format_html(
                '<span style="background:#28a745; color:white; padding:4px 8px; border-radius:4px;">Approved</span>'
            )
        elif obj.is_rejected:
            return format_html(
                '<span style="background:#dc3545; color:white; padding:4px 8px; border-radius:4px;">Rejected</span>'
            )
        else:
            return format_html(
                '<span style="background:#ffc107; color:black; padding:4px 8px; border-radius:4px;">Pending</span>'
            )

    status_badge.short_description = "Status"

    # ---------- APPROVE ----------
    @admin.action(description="Approve selected verification requests")
    def approve_requests(self, request, queryset):
        for req in queryset:
            req.is_approved = True
            req.is_rejected = False
            req.save()

            # 🔥 UPDATE STUDENT TABLE
            Student.objects.filter(email=req.email).update(
                is_verified=True,
                is_active=True
            )

        self.message_user(request, "Student approved and activated successfully.")

    # ---------- REJECT ----------
    @admin.action(description="Reject selected verification requests")
    def reject_requests(self, request, queryset):
        for req in queryset:
            req.is_approved = False
            req.is_rejected = True
            req.save()

            # 🔥 UPDATE STUDENT TABLE
            Student.objects.filter(email=req.email).update(
                is_verified=False,
                is_active=False
            )

        self.message_user(request, "Student rejected and disabled successfully.")





# students/admin.py
from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("university_reg_no", "name", "ug_pg", "department", "programme", "email", "phone")
    search_fields = ("university_reg_no", "name", "department")
