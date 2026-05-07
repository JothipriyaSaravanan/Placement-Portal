

from django.urls import path
from . import views
from students import views as student_views

urlpatterns = [
    path('login/', views.coordinator_login, name='coordinator_login'),
    path('students/', views.coordinator_students, name='coordinator_students'),
    path('upload-excel/', views.process_excel, name='process_excel'),
     path("job-applicants/", views.get_job_applicants, name="coordinator_job_applicants"),
    path("download-applications/", views.download_job_applications, name="download_coordinator_applications"),
    #  path("jobs/", views.coordinator_jobs, name="coordinator_jobs"),
    # path('api/students/by-department/', student_views.list_students_by_department),
     path("jobs/", views.get_coordinator_jobs, name="coordinator_jobs"),
     path('info/', views.coordinator_info, name='coordinator_info'),
     path("selected-students-report/", views.selected_students_report, name="selected_students_report"),
    path('password-reset/send-otp/', views.coordinator_send_otp, name='coordinator_send_otp'),
    path('password-reset/verify-otp/', views.coordinator_verify_otp, name='coordinator_verify_otp'),
    path('password-reset/reset-password/', views.coordinator_reset_password, name='coordinator_reset_password'),
    path("dashboard-stats/", views.coordinator_dashboard_stats, name="coordinator-dashboard-stats"),
    path("my-announcements/", views.my_announcements),
    path("send-message/", views.send_message),
    path("student-messages/", views.student_messages),
    path("edit-message/", views.edit_message),
    path("delete-message/", views.delete_message),
   path('department-placement-stats/', views.department_placement_stats, name='department-placement-stats'),
    path('year-wise-placement-trend/', views.year_wise_placement_trend, name='year-wise-placement-trend'),
    path("programmes/",views.coordinator_programmes,name="coordinator_programmes" ),
   # urls.py
   
  
   path('by-coordinator/<str:username>/', views.students_by_coordinator, name='students_by_coordinator'),
   
   path("programmes/", views.coordinator_programmes),
   path("jobs/", views.coordinator_jobs, name="coordinator_jobs"),

    path('announcements/', views.get_admin_announcements, name='coordinator-admin-announcements'),
    path('recent-activity/', views.recent_student_activity, name='recent_student_activity'),
]