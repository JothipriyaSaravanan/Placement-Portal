
from django.urls import path
from . import views

urlpatterns = [
    # 🔐 AUTH
    path("register/", views.admin_register),
    path("login/", views.admin_login),

    path("forgot-password/send-otp/", views.send_otp),
    path("forgot-password/verify-otp/", views.verify_otp),
    path("forgot-password/reset/", views.reset_password),

    path('api/pending-requests/', views.get_pending_requests, name='pending-requests'),
    path('api/approve-request/', views.approve_request, name='approve-request'),
    path("api/reject-request/", views.reject_request, name="reject-request"),
    path("api/approved-requests/", views.approved_requests, name="approved-requests"),
    path("api/rejected-requests/", views.rejected_requests, name="rejected-requests"),


    path("pending-companies/", views.pending_companies),
    path("approved-companies/", views.approved_companies),
    path("rejected-companies/", views.rejected_companies),
    path("approve-company/", views.approve_company),
    path("reject-company/", views.reject_company),



    # Jobs
    path('pending-jobs/', views.pending_jobs),
    path('approved-jobs/', views.approved_jobs),
    path('rejected-jobs/', views.rejected_jobs),
    path('approve-job/', views.approve_job),
    path('reject-job/', views.reject_job),



     path("coordinators/create/", views.create_coordinator, name="create_coordinator"),
     path('coordinators/', views.list_all_coordinators, name='list_all_coordinators'),
     path('coordinators/<int:pk>/', views.coordinator_detail),

       path(
        "students/by-coordinator/<int:coordinator_id>/",
        views.students_by_coordinator,
        name="students_by_coordinator"
    ),

      path("companies/create/", views.create_company, name="create_company"),
      path("companies/", views.list_companies, name="list_companies"),


      path("departments/", views.list_departments, name="list_departments"),
       

    path("reports/", views.admin_departments_report),
    path("reports/<str:department>/", views.admin_selected_by_department),  
    path('total-students/', views.total_students),
    path('total-companies/', views.total_companies),
    path('total-jobs/', views.total_jobs),

   
    path("approved-jobs-count/", views.approved_jobs_count),
    path("pending-jobs-count/", views.pending_jobs_count),
    path('total-selected/', views.total_selected),
    path('placement-percentage/', views.placement_percentage),

    path("stats/departments/", views.department_placement_stats),
    path("stats/job-types/", views.job_type_distribution),
    path("stats/monthly-jobs/", views.monthly_job_trend),
    path("stats/company-selections/", views.company_selection_stats),
    path("alerts/", views.admin_alerts),
    path("stats/departments/", views.department_placement_stats),
    path('students/years/', views.get_student_graduation_years, name='student-graduation-years'),
    path("stats/year-department-analysis/", views.year_department_placement_analysis),
    
   path('announcements/create/', views.create_announcement, name='create-announcement'),
   path('announcements/', views.get_announcements, name='get-announcements'),
   path('announcements/<int:pk>/', views.update_announcement),
   path('announcements/<int:pk>/delete/', views.delete_announcement),



   path('students-per-department/', views.students_per_department, name='students_per_department'),
   path('students-ug-pg-distribution/', views.students_ug_pg_distribution, name='students_ug_pg_distribution'),
   path('students-per-batch/', views.students_per_batch, name='students_per_batch'),



    path('jobs-per-company/', views.jobs_per_company, name='jobs_per_company'),
    path('job-types-distribution/', views.job_types_distribution, name='job_types_distribution'),
    path('monthly-jobs-trend/', views.monthly_jobs_trend, name='monthly_jobs_trend'),
    path('monthly-jobs-posted-trend/', views.monthly_jobs_posted_trend, name='monthly_jobs_posted_trend'),
    path("filters/", views.admin_filters),
]




