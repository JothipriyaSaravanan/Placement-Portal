


from django.urls import path
from . import views

urlpatterns = [
    
    path("process-excel/", views.process_excel),
    path("list/", views.list_students),
    path("request-verification/", views.request_verification),
    path("register/", views.register),
    path("login/", views.student_login),
    path("forgot-password/", views.send_otp),
    path("verify-otp/", views.verify_otp),
    path("reset-password/", views.reset_password),

    path('profile/', views.get_profile),
    path('profile/edit/<int:student_id>/', views.edit_profile),
    path('about/delete/<int:student_id>/', views.delete_about),
    path('profile/delete-photo/', views.delete_profile_photo),

    path('education/add/', views.add_education),
    path('profile/edit/', views.edit_profile),
    path('education/edit/<int:edu_id>/', views.edit_education),
    path('education/delete/<int:edu_id>/', views.delete_education),

    path('certificate/add/', views.add_certificate),
    path('certificate/edit/<int:cert_id>/', views.edit_certificate),
    path('certificate/delete/<int:cert_id>/', views.delete_certificate),

    path('resume/add/', views.add_resume),
    path('resume/edit/<int:student_id>/', views.edit_resume),
    path('resume/delete/<int:student_id>/', views.delete_resume),

    path('skill/add/', views.add_skill),
    path('skill/list/', views.list_skills),
    path('skill/edit/<int:skill_id>/', views.edit_skill),
    path('skill/delete/<int:skill_id>/', views.delete_skill),




    path("internship/list/", views.get_internships),
    path("internship/add/", views.add_internship),
    path("internship/edit/<int:internship_id>/", views.edit_internship),
    path("internship/delete/<int:internship_id>/", views.delete_internship),

    path('check-verification-status/', views.check_verification_status, name='check-verification-status'),
    path('check-email/', views.check_email_exists, name='check-email'),
    path('smart-email-check/', views.smart_email_check, name='smart-email-check'),
    path("request-verification/", views.request_verification),
    path('applications/my/', views.get_my_applications, name='my-applications'),
    path('jobs/apply/', views.apply_job, name='apply-job'),



    path('by-department/', views.list_students_by_department, name='students_by_department'),
    
    path('add/', views.add_student, name='add_student'),
    path('resume/preview/<int:resume_id>/', views.preview_resume, name='preview_resume'),


    path("add-project/", views.add_project),
    path("get-projects/", views.get_projects),
    path("edit-project/<int:project_id>/", views.edit_project),
    path("delete-project/<int:project_id>/", views.delete_project),
    
    path("get-social-links/", views.get_social_links),
    path("save-social-links/", views.save_social_links),
     path("get-announcements/", views.get_announcements),
     path('years/', views.get_graduation_years, name='get_graduation_years'),
     path("programmes/", views.list_programmes, name="list_programmes"),
     path("edit-student/<int:student_id>/", views.edit_student),
     path("delete-student/<int:student_id>/", views.delete_student),
     path("<str:university_reg_no>/", views.student_detail, name="student_detail"),
     path("messages/", views.student_messages, name="student_messages"),
    
    
]