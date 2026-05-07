
from django.urls import path
from . import views

urlpatterns = [

    path("smart-email-check/", views.smart_email_check),
    path("request-verification/", views.request_company_verification),
    path("register/", views.company_register),
    path("login/", views.company_login),
    path("by-email/", views.get_company_by_email),
    path("dashboard/", views.company_dashboard),

    path("send-otp/", views.company_send_otp, name="company-send-otp"),
    path("verify-otp/", views.company_verify_otp, name="company-verify-otp"),
    path("reset-password/", views.company_reset_password, name="company-reset-password"),

    path('jobs/create/', views.create_job, name='create_job'),

    # ⭐ ADD THIS LINE
    path('jobs/', views.get_active_jobs, name='all_jobs'),

    path('jobs/active/', views.get_active_jobs, name='active_jobs'),

    path('jobs/<int:job_id>/toggle/', views.toggle_job_active, name='toggle_job'),

    path('applications/', views.get_company_applications, name='company_applications'),
    path('student-profile/', views.get_student_profile_for_company, name='company_student_profile'),

    path('jobs/my/', views.get_my_jobs, name='my_jobs'),
    path("download-excel/", views.download_company_applications),

    path('jobs/<int:job_id>/edit/', views.edit_job, name='edit_job'),
    path('jobs/<int:job_id>/delete/', views.delete_job, name='delete_job'),

    path('profile/', views.get_company_profile, name='company-profile'),
    path('applicants/', views.get_company_applications, name='company-applicants'),

    path('student-profile/<str:student_email>/', views.company_view_student_profile, name='student_profile'),

    path("profile/<str:email>/", views.company_profile, name="company_profile"),
    path('profile/update/<str:email>/', views.update_company_profile, name='update_company_profile'),

    path('website/', views.get_company_website, name='company-website'),

    path('profile/remove-logo/<str:email>/', views.remove_company_logo, name='remove_company_logo'),

    path(
        "update-application-status/<int:application_id>/",
        views.update_application_status,
        name="update_application_status"
    ),

    path('jobs/by-company/', views.get_jobs_by_company_email, name='get_jobs_by_company_email'),
    path('upload-offer-letter/', views.upload_offer_letter, name='upload_offer_letter'),
    path('offer-letters/', views.get_offer_letters, name='offer_letters'),
]