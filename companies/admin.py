from django.contrib import admin
from .models import CompanyVerificationRequest

@admin.register(CompanyVerificationRequest)
class CompanyVerificationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "contact",
        "is_approved",
        "is_rejected",
        "created_at",
    )
    list_filter = ("is_approved", "is_rejected")
    search_fields = ("company_name", "email")
