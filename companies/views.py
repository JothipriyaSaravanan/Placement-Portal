
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.hashers import make_password, check_password
import json

from .models import Company, CompanyVerificationRequest



@csrf_exempt
@require_GET
def smart_email_check(request):
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "Email required"}, status=400)

    email = email.lower().strip()

    company = Company.objects.filter(email=email).first()
    verification = CompanyVerificationRequest.objects.filter(email=email).first()

    # 1️⃣ Company exists
    if company:
        if company.is_approved and company.is_active:
            return JsonResponse({"next": "login"})
        else:
            return JsonResponse({"next": "wait"})

    # 2️⃣ Verification exists AND rejected
    if verification and verification.is_rejected:
        return JsonResponse({"next": "rejected"})

    # 3️⃣ Verification approved but company not registered
    if verification and verification.is_approved:
        return JsonResponse({"next": "verified"})

    # 4️⃣ Verification pending
    if verification and not verification.is_approved:
        return JsonResponse({"next": "wait"})

    # 5️⃣ Fresh email
    return JsonResponse({"next": "verification"})




@csrf_exempt
@require_POST
def request_company_verification(request):
    data = json.loads(request.body)

    name = data.get("name")
    email = data.get("email")
    contact = data.get("contact")

    if not all([name, email, contact]):
        return JsonResponse({"error": "All fields required"}, status=400)

    if CompanyVerificationRequest.objects.filter(email=email).exists():
        return JsonResponse({"error": "Already requested"}, status=400)

    CompanyVerificationRequest.objects.create(
        name=name,
        email=email.lower(),
        contact=contact
    )

    return JsonResponse({"message": "Verification request sent"})


@csrf_exempt
@require_POST
def company_register(request):
    data = json.loads(request.body)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JsonResponse({"error": "Email & password required"}, status=400)

    verification = CompanyVerificationRequest.objects.filter(
        email=email,
        is_approved=True,
        is_rejected=False
    ).first()

    if not verification:
        return JsonResponse({"error": "Not approved by admin"}, status=403)

    if Company.objects.filter(email=email).exists():
        return JsonResponse({"error": "Already registered"}, status=400)

    company = Company.objects.create(
        name=verification.name,
        email=email,
        password=make_password(password),
        contact=verification.contact,
        is_approved=True
    )

    return JsonResponse({
        "message": "Registered successfully",
        "company_id": company.id
    })


import uuid
@csrf_exempt
@require_POST
def company_login(request):
    try:
        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email & password required"}, status=400)

        company = Company.objects.filter(email=email).first()
        if not company:
            return JsonResponse({"error": "Company not found"}, status=404)

        if not check_password(password, company.password):
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        if not company.is_approved:
            return JsonResponse({"error": "Not approved"}, status=403)

        # ✅ Generate new token every login (important)
        company.auth_token = uuid.uuid4()
        company.save()

        return JsonResponse({
            "message": "Login successful",
            "company_id": company.id,
            "name": company.name,
            "email": company.email,
            "token": str(company.auth_token)   # <-- frontend must store this
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
@require_GET
def get_company_by_email(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    company = Company.objects.filter(email=email).first()

    if not company:
        return JsonResponse({"error": "Company not found"}, status=404)

    return JsonResponse({
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "contact": company.contact,
        "is_approved": company.is_approved,
        "is_active": company.is_active,
        "created_at": company.created_at,
    })
from django.views.decorators.http import require_GET
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from .models import Company

# companies/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import Company

@csrf_exempt
@require_GET
def company_dashboard(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"error": "Email required"}, status=400)

    try:
        company = Company.objects.get(email=email)
    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)

    return JsonResponse({
        "company_name": company.name or "Company",
        "email": company.email,
        "is_approved": company.is_approved,
        "jobs_count": 0,
        "applications_count": 0
    })




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
import json
import random

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
import json, random

from .models import Company, CompanyPasswordResetOTP

# ─── Send OTP ─────────────────────────
@csrf_exempt
@require_POST
def company_send_otp(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)

        company = Company.objects.filter(email=email).first()
        if not company:
            return JsonResponse({"error": "Email not registered"}, status=404)

        otp = str(random.randint(100000, 999999))
        CompanyPasswordResetOTP.objects.create(email=email, otp=otp)

        send_mail(
            "Company Password Reset OTP",
            f"Your OTP is {otp}. It is valid for 5 minutes.",
            None,
            [email],
            fail_silently=False,
        )

        return JsonResponse({"message": "OTP sent successfully"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

from django.utils import timezone          # ← ADD THIS
from datetime import timedelta
# ─── Verify OTP ───────────────────────
@csrf_exempt
@require_POST
def company_verify_otp(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        otp = data.get("otp")
        if not email or not otp:
            return JsonResponse({"error": "Email and OTP required"}, status=400)

        record = CompanyPasswordResetOTP.objects.filter(email=email, otp=otp).last()
        if not record:
            return JsonResponse({"error": "Invalid OTP"}, status=400)
        if record.is_expired():
            return JsonResponse({"error": "OTP expired"}, status=400)

        return JsonResponse({"message": "OTP verified"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ─── Reset Password ───────────────────
@csrf_exempt
@require_POST
def company_reset_password(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        new_password = data.get("password")
        if not email or not new_password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        company = Company.objects.filter(email=email).first()
        if not company:
            return JsonResponse({"error": "Company not found"}, status=404)

        company.password = make_password(new_password)
        company.save()

        # Delete OTP after successful reset
        CompanyPasswordResetOTP.objects.filter(email=email).delete()

        return JsonResponse({"message": "Password reset successfully"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




# companies/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.shortcuts import get_object_or_404
import json
from .models import Company, Job
from students.models import Student  # adjust import path if needed





@csrf_exempt
@require_POST
def create_job(request):
    try:
        data = json.loads(request.body)

        email = data.get("email")
        if not email:
            return JsonResponse({"error": "email required"}, status=400)

        company = get_object_or_404(Company, email=email)

        skills = data.get("skills", [])
        departments = data.get("departments", [])
        programmes = data.get("programmes", [])
        graduation_years = data.get("graduation_years", [])

        job = Job.objects.create(
            company=company,
            title=data.get("title", "").strip(),
            description=data.get("description", "").strip(),
            location=data.get("location", ""),
            salary_range=data.get("salary_range", ""),
            job_type=data.get("job_type", "full_time"),
            last_date_to_apply=data.get("last_date_to_apply"),

            skills=skills,

            # ✅ eligibility
            departments=departments,
            programmes=programmes,
            graduation_years=graduation_years,
            show_to_all_departments=data.get("show_to_all_departments", False),
        )

        return JsonResponse({
            "message": "Job created successfully",
            "job_id": job.id
        }, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Job, Company

# companies/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Company, Job  # ← ADD Job here (critical!)
import traceback


@csrf_exempt
@require_GET
def get_my_jobs(request):
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "email required"}, status=400)

    try:
        company = get_object_or_404(Company, email=email)

        jobs = Job.objects.filter(company=company).select_related('company').order_by("-created_at")

        data = []
        for j in jobs:
            data.append({
                "id": j.id,
                "title": j.title,
                "company": j.company.name if j.company else "Unknown",
                "location": j.location or "Not specified",
                "salary_range": j.salary_range or "Not disclosed",
                "job_type": j.job_type.replace("_", " ").title() if j.job_type else "Unknown",
                "description": j.description[:150] + "..." if j.description and len(j.description) > 150 else j.description,
                "last_date_to_apply": str(j.last_date_to_apply) if j.last_date_to_apply else None,
                "is_active": j.is_active,
                "created_at": j.created_at.strftime("%Y-%m-%d") if j.created_at else None,

                "skills": j.skills if j.skills else [],

                # ✅ ADD THESE
                "departments": j.departments if j.departments else [],
                "programmes": j.programmes if j.programmes else [],
                "graduation_years": j.graduation_years if j.graduation_years else [],
                "show_to_all_departments": j.show_to_all_departments,
            })

        return JsonResponse({"jobs": data}, status=200)

    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)

    except Exception as e:
        import traceback
        print("get_my_jobs error:")
        traceback.print_exc()
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["PATCH"])
def edit_job(request, job_id):
    import json

    data = json.loads(request.body)
    email = request.GET.get("email") or data.get("email")

    if not email:
        return JsonResponse({"error": "email required"}, status=400)

    company = get_object_or_404(Company, email=email)
    job = get_object_or_404(Job, id=job_id, company=company)

    job.title = data.get("title", job.title)
    job.description = data.get("description", job.description)
    job.location = data.get("location", job.location)
    job.salary_range = data.get("salary_range", job.salary_range)
    job.job_type = data.get("job_type", job.job_type)
    job.last_date_to_apply = data.get("last_date_to_apply") or job.last_date_to_apply

    # Skills
    skills = data.get("skills")
    if skills is not None:
        if isinstance(skills, list):
            job.skills = skills
        elif isinstance(skills, str):
            job.skills = [s.strip() for s in skills.split(",") if s.strip()]

    # ✅ Departments
    departments = data.get("departments")
    if departments is not None:
        if isinstance(departments, list):
            job.departments = departments
        elif isinstance(departments, str):
            job.departments = [d.strip() for d in departments.split(",") if d.strip()]

    # ✅ Programmes
    programmes = data.get("programmes")
    if programmes is not None:
        if isinstance(programmes, list):
            job.programmes = programmes
        elif isinstance(programmes, str):
            job.programmes = [p.strip() for p in programmes.split(",") if p.strip()]

    # ✅ Graduation years
    graduation_years = data.get("graduation_years")
    if graduation_years is not None:
        if isinstance(graduation_years, list):
            job.graduation_years = graduation_years
        elif isinstance(graduation_years, str):
            job.graduation_years = [y.strip() for y in graduation_years.split(",") if y.strip()]

    # ✅ Show to all departments
    if "show_to_all_departments" in data:
        job.show_to_all_departments = data["show_to_all_departments"]

    job.save()

    return JsonResponse({"message": "Job updated successfully"})



@csrf_exempt
@require_http_methods(["PATCH"])
def toggle_job_active(request, job_id):
    # Read email from query params (GET) instead of body
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "email required"}, status=400)

    try:
        company = get_object_or_404(Company, email=email)
        job = get_object_or_404(Job, id=job_id, company=company)

        data = json.loads(request.body) if request.body else {}
        is_active = data.get("is_active")

        if is_active is not None:
            job.is_active = bool(is_active)
        else:
            job.is_active = not job.is_active

        job.save(update_fields=["is_active"])

        return JsonResponse({
            "message": f"Job {'activated' if job.is_active else 'deactivated'}",
            "is_active": job.is_active
        })

    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)
    except Job.DoesNotExist:
        return JsonResponse({"error": "Job not found or not owned by you"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


        # companies/views.py
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_job(request, job_id):
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "email required"}, status=400)

    try:
        company = get_object_or_404(Company, email=email)
        job = get_object_or_404(Job, id=job_id, company=company)

        # No JobApplication cleanup needed yet — just delete the job
        job.delete()

        return JsonResponse({
            "message": f"Job '{job.title}' deleted successfully"
        }, status=200)

    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)
    except Job.DoesNotExist:
        return JsonResponse({"error": "Job not found or not owned by your company"}, status=404)
    except Exception as e:
        import traceback
        print("Delete job error:", str(e))
        print(traceback.format_exc())
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)
# companies/views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Company, Job
from .models import JobApplication, Company  # ← .models means current app (companies)
from students.models import Student

@csrf_exempt
@require_GET
def get_company_applications(request):
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "email required"}, status=400)

    try:
        company = get_object_or_404(Company, email=email.strip().lower())
        applications = JobApplication.objects.filter(job__company=company).select_related('student', 'job')

        data = []
        for app in applications:
            data.append({
                "application_id": app.id,
                "student": {
                    "id": app.student.id,
                    "name": app.student.name or "N/A",
                    "email": app.student.email,
                    "department": app.student.department or "N/A",
                    "phone": app.student.phone or "N/A"
                },
                "job": {
                    "id": app.job.id,
                    "title": app.job.title or "Untitled Job",
                    "is_active": app.job.is_active
                },
                "status": app.status or "Pending",
                "applied_at": app.applied_at.strftime("%d %b %Y %H:%M") if hasattr(app, 'applied_at') else "N/A",
                "cover_letter": app.cover_letter[:200] + "..." if app.cover_letter else "No cover letter"
            })

        return JsonResponse({"applications": data, "count": len(data)}, status=200)

    except Company.DoesNotExist:
        return JsonResponse({"error": f"No company found with email: {email}"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# 4. View basic student profile (for company)
@csrf_exempt
@require_GET
def get_student_profile_for_company(request):
    company_email = request.GET.get("company_email")
    student_id = request.GET.get("student_id")

    if not company_email or not student_id:
        return JsonResponse({"error": "company_email and student_id required"}, status=400)

    try:
        # Optional: verify company exists
        get_object_or_404(Company, email=company_email)

        student = get_object_or_404(Student, id=student_id)

        return JsonResponse({
            "student": {
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "department": student.department,
                "phone": student.phone or "",
            }
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)






from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.utils import timezone
from django.db.models import Q
from .models import Job
from students.models import Student
import traceback


@csrf_exempt
@require_GET
def get_active_jobs(request):
    """
    Returns jobs filtered by:
    - Department
    - Programme
    - Graduation Year
    - Active status
    """

    try:
        status = request.GET.get("status", "active").lower()
        now = timezone.now()

        # Base queryset
        jobs = Job.objects.select_related("company").order_by("-created_at")

        # Only active jobs
        if status == "active":
            jobs = jobs.filter(is_active=True, last_date_to_apply__gte=now)

        # ---------------- STUDENT FILTER ----------------
        student_email = request.GET.get("email")
        student_dept = None
        student_grad_year = None
        student_programme = None

        if student_email:
            try:
                student = Student.objects.get(email=student_email.strip().lower())
                student_dept = student.department.strip() if student.department else None
                student_grad_year = student.passed_out_year
                student_programme = student.programme.strip() if student.programme else None
            except Student.DoesNotExist:
                return JsonResponse({"error": "Student not found."}, status=400)

        if student_email:
            filters = Q()

            # Department filter
            if student_dept:
                filters &= (
                    Q(show_to_all_departments=True) |
                    Q(departments__contains=[student_dept]) |
                    Q(departments__contains=["ALL"])
                )

            # Graduation year filter
            if student_grad_year:
                filters &= (
                    Q(graduation_years__contains=[student_grad_year]) |
                    Q(graduation_years__contains=["ALL"])
                )

            # Programme filter
            if student_programme:
                filters &= (
                    Q(programmes__contains=[student_programme]) |
                    Q(programmes__contains=["ALL"]) |
                    Q(programmes__isnull=True)
                )

            jobs = jobs.filter(filters)

        # ---------------- COORDINATOR FILTER ----------------

        # Department filter
        department_name = request.GET.get("department")
        if department_name:
            department_name = department_name.strip()
            jobs = jobs.filter(
                 Q(show_to_all_departments=True) |
                 Q(departments__icontains=department_name) |
                 Q(departments__icontains="ALL")
           )

        # Graduation year filter
        grad_year = request.GET.get("graduation_year")
        if grad_year:
            try:
                grad_year = int(grad_year)
                jobs = jobs.filter(
                    Q(graduation_years__icontains=grad_year) |
                    Q(graduation_years__icontains="ALL")
                )
            except ValueError:
                pass

        # Programme filter
        programme_name = request.GET.get("programme")
        if programme_name:
             programme_name = programme_name.strip()
             jobs = jobs.filter(
                 Q(programmes__icontains=programme_name) |
                 Q(programmes__icontains="ALL") |
                 Q(programmes__isnull=True)
               )

        # ---------------- RESPONSE ----------------
        job_list = []

        for job in jobs:
            skills = []
            if hasattr(job, "skills"):
                try:
                    skills = [s.name for s in job.skills.all()]
                except:
                    skills = job.skills if isinstance(job.skills, (list, tuple)) else []

            job_list.append({
                "id": job.id,
                "title": job.title,
                "company": job.company.name if job.company else "—",
                "company_email": job.company.email if job.company else "",
                "job_location": job.location or "Not specified",
                "salary_range": job.salary_range or "Not disclosed",
                "job_type": job.job_type.replace("_", " ").title() if job.job_type else "—",
                "description": (
                    job.description[:250] + "..."
                    if job.description and len(job.description) > 250
                    else job.description
                ),
                "last_date_to_apply": str(job.last_date_to_apply) if job.last_date_to_apply else None,
                "posted_at": job.created_at.strftime("%Y-%m-%d") if job.created_at else None,
                "departments": job.departments or [],
                "programmes": job.programmes or [],   # ✅ IMPORTANT
                "graduation_years": job.graduation_years or [],
                "skills": skills,
            })

        return JsonResponse({"jobs": job_list}, status=200)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)






# companies/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from .models import Company

@csrf_exempt
@require_GET
def get_company_profile(request):
    name = request.GET.get('name')

    if not name:
        return JsonResponse({"error": "Company name is required"}, status=400)

    try:
        # Case-insensitive exact match
        company = Company.objects.get(name__iexact=name.strip())

        return JsonResponse({
            "name": company.name,

        }, status=200)

    except Company.DoesNotExist:
        return JsonResponse({"error": f"Company '{name}' not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)






@csrf_exempt
@require_GET
def get_company_applications(request):

    email = request.GET.get("email")
    job_id = request.GET.get("job_id")
    status_filter = request.GET.get("status")

    if not email:
        return JsonResponse({"error": "email required"}, status=400)

    try:
        company = get_object_or_404(Company, email=email.strip().lower())

        applications = JobApplication.objects.filter(
            job__company=company
        ).select_related("student", "job")

        # Filter by job
        if job_id:
            applications = applications.filter(job_id=job_id)

        # Filter by status
        if status_filter:
            applications = applications.filter(status=status_filter)

        data = []

        for app in applications:
            data.append({
                "application_id": app.id,

                "student": {
                    "id": app.student.id,
                    "name": app.student.name or "N/A",
                    "email": app.student.email,
                    "department": getattr(app.student, "department", "N/A"),
                    "phone": getattr(app.student, "phone", "N/A"),
                    "year": getattr(app.student, "year", "N/A"),
                    "cgpa": getattr(app.student, "cgpa", "N/A"),
                },

                "job": {
                    "id": app.job.id,
                    "title": app.job.title or "Untitled Job",
                    "is_active": app.job.is_active
                },

                "status": app.status or "Pending",

                "applied_at": app.applied_at.strftime("%d %b %Y %H:%M")
                if app.applied_at else "N/A",

                "cover_letter": app.cover_letter[:200] + "..."
                if app.cover_letter else "No cover letter"
            })

        return JsonResponse({
            "applications": data,
            "count": len(data)
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



import csv
from django.http import HttpResponse
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Company, JobApplication


@require_GET
def download_company_applications(request):

    email = request.GET.get("email")
    job_id = request.GET.get("job_id")

    if not email:
        return HttpResponse("Email required", status=400)

    company = get_object_or_404(Company, email=email.strip().lower())

    applications = JobApplication.objects.filter(
        job__company=company
    ).select_related("student", "job")

    if job_id:
        applications = applications.filter(job_id=job_id)

    # Create CSV response
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="applicants.csv"'

    writer = csv.writer(response)

    # Header row
    writer.writerow([
        "Student Name",
        "Email",
        "Phone",
        "Department",
        "Year",
        "CGPA",
        "Job Title",
        "Status",
        "Applied Date"
    ])

    # Data rows
    for app in applications:
        writer.writerow([
            app.student.name,
            app.student.email,
            getattr(app.student, "phone", ""),
            getattr(app.student, "department", ""),
            getattr(app.student, "year", ""),
            getattr(app.student, "cgpa", ""),
            app.job.title,
            app.status,
            app.applied_at.strftime("%d %b %Y") if app.applied_at else ""
        ])

    return response







from students.models import (
    Student,
    Education,
    Internship,
    Skill,
    Certificate,
    Resume,
    Project,
    SocialLinks,  # 👈 added
)

@csrf_exempt
@require_GET
def company_view_student_profile(request, student_email):
    company_email = request.GET.get("company_email")

    if not company_email:
        return JsonResponse({"error": "company_email is required"}, status=400)

    try:
        company = get_object_or_404(Company, email=company_email.strip().lower())
        student = get_object_or_404(Student, email=student_email.strip().lower())

        # Security check: only allow if applied
        has_applied = JobApplication.objects.filter(
            student=student,
            job__company=company
        ).exists()

        if not has_applied:
            return JsonResponse({"error": "You are not authorized to view this profile"}, status=403)

        # ─── Gather data ───
        skills = Skill.objects.filter(student=student).values_list("skill_name", flat=True)
        internships = Internship.objects.filter(student=student)
        certificates = Certificate.objects.filter(student=student)
        resume = Resume.objects.filter(student=student).first()
        educations = Education.objects.filter(student=student)
        projects = Project.objects.filter(student=student)

        # ─── Social links ───
        social = SocialLinks.objects.filter(student=student).first()
        social_links = {
            "github": social.github if social else "",
            "linkedin": social.linkedin if social else "",
            "portfolio": social.portfolio if social else "",
            "twitter": social.twitter if social else "",
        }

        response_data = {
            "student": {
                "name": student.name or "Not provided",
                "email": student.email,
                "phone": student.phone or "Not provided",
                "department": student.department or "Not specified",
                "programme": student.programme or "Not specified",
                "ug_pg": student.ug_pg or "Not specified",
                "university_reg_no": student.university_reg_no or "Not provided",
                "year": getattr(student, 'year', 'Not provided'),
                "cgpa": str(student.cgpa) if getattr(student, 'cgpa', None) else None,
            },

            "skills": list(skills),

            "internships": [
                {
                    "company_name": i.company_name,
                    "domain": i.domain or "Not specified",
                    "description": i.description or "",
                    "duration": getattr(i, 'duration', None) or "Not specified",
                }
                for i in internships
            ],

            "projects": [
                {
                    "title": p.title,
                    "description": p.description or "",
                    "technologies": p.technologies or "",
                    "github_link": p.github_link or None,
                    "live_link": p.live_link or None,
                }
                for p in projects
            ],

            "certificates": [
                {
                    "title": c.title,
                    "provider": getattr(c, 'provider', None) or "Not specified",
                    "file": c.certificate_file.url if c.certificate_file else None,
                    "issued_by": getattr(c, 'issued_by', None) or "Not specified",        # 👈 added
                    "year_obtained": getattr(c, 'year_obtained', None) or "Not specified", # 👈 added
                }
                for c in certificates
            ],

            "resume": request.build_absolute_uri(resume.resume_file.url)
            if resume and resume.resume_file else None,

            "educations": [
                {
                    "degree": edu.degree or "Not specified",
                    "institution": edu.institution or "Not specified",
                    "year_from": None,
                    "year_to": edu.year_of_passing or "Not specified",
                    "cgpa": str(edu.cgpa) if edu.cgpa is not None else None,
                    "percentage": None,
                }
                for edu in educations
            ],

            "social_links": social_links,  # 👈 added
        }

        return JsonResponse(response_data, status=200)

    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Server error", "detail": str(e)}, status=500)






from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Company
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Company


# views.py
@require_GET
def company_profile(request, email):
    try:
        company = Company.objects.get(email=email)
    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)

    data = {
        "id": company.id,
        "name": company.name or "",
        "email": company.email,
        "contact": company.contact or "",
        
        "registration_number": company.registration_number or "",
        "website": company.website or "",
        "logo": company.logo.url if company.logo else "",
        
        "location": company.location or "",
        "address": company.address or "",
        "state": company.state or "",
        "country": company.country or "",
        
        "industry": company.industry or "",
        "company_type": company.company_type or "",
        "employee_count": company.employee_count or "",
        "founded_year": company.founded_year or None,
        
        "description": company.description or "",
        
        "linkedin": company.linkedin or "",
        "twitter": company.twitter or "",
        "facebook": company.facebook or "",
        "instagram": company.instagram or "",
        
        "is_active": company.is_active,
        "is_approved": company.is_approved,
        "is_rejected": company.is_rejected,
        "rejected_reason": company.rejected_reason or "",
        
        "created_at": company.created_at.isoformat() if company.created_at else None,
        "updated_at": company.updated_at.isoformat() if company.updated_at else None,
    }
    return JsonResponse(data)







@require_POST
@csrf_exempt
def update_company_profile(request, email):
    try:
        company = Company.objects.get(email=email)

        # ✅ If request is multipart (file upload)
        if request.content_type.startswith('multipart/form-data'):
            data = request.POST
            logo_file = request.FILES.get("logo")

            if logo_file:
                company.logo = logo_file

        else:
            # ✅ JSON request
            data = json.loads(request.body)

        # Update normal fields
        company.name = data.get("name", company.name)
        company.contact = data.get("contact", company.contact)
        company.website = data.get("website", company.website)
        company.location = data.get("location", company.location)
        company.address = data.get("address", company.address)
        company.state = data.get("state", company.state)
        company.country = data.get("country", company.country)
        company.industry = data.get("industry", company.industry)
        company.company_type = data.get("company_type", company.company_type)
        company.employee_count = data.get("employee_count", company.employee_count)
        company.founded_year = data.get("founded_year", company.founded_year)
        company.description = data.get("description", company.description)
        company.linkedin = data.get("linkedin", company.linkedin)
        company.twitter = data.get("twitter", company.twitter)
        company.facebook = data.get("facebook", company.facebook)
        company.instagram = data.get("instagram", company.instagram)

        company.save()

        updated_data = {
            "id": company.id,
            "name": company.name or "",
            "email": company.email,
            "contact": company.contact or "",
            "registration_number": company.registration_number or "",
            "website": company.website or "",
            "logo": company.logo.url if company.logo else "",
            "location": company.location or "",
            "address": company.address or "",
            "state": company.state or "",
            "country": company.country or "",
            "industry": company.industry or "",
            "company_type": company.company_type or "",
            "employee_count": company.employee_count or "",
            "founded_year": company.founded_year,
            "description": company.description or "",
            "linkedin": company.linkedin or "",
            "twitter": company.twitter or "",
            "facebook": company.facebook or "",
            "instagram": company.instagram or "",
            "is_active": company.is_active,
            "is_approved": company.is_approved,
            "is_rejected": company.is_rejected,
            "rejected_reason": company.rejected_reason or "",
            "created_at": company.created_at.isoformat() if company.created_at else None,
            "updated_at": company.updated_at.isoformat() if company.updated_at else None,
        }

        return JsonResponse({
            "message": "Profile updated successfully",
            "company": updated_data
        })

    except Company.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)




from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
# Remove company logo by email
@csrf_exempt
@require_http_methods(["DELETE"])
def remove_company_logo(request, email):
    """
    Remove the logo for a company by email.
    Endpoint: DELETE /companies/profile/remove-logo/<email>
    """
    company = get_object_or_404(Company, email=email)
    if company.logo:
        company.logo.delete(save=False)  # Delete the file from storage
        company.logo = None
        company.save(update_fields=["logo"])
        return JsonResponse({"message": "Logo removed successfully"})
    else:
        return JsonResponse({"error": "No logo to remove"}, status=400)




        # companies/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Company


@csrf_exempt
@require_GET
def get_company_website(request):
    """
    GET /api/companies/website/?email=hr@company.com

    Purpose: Lightweight endpoint specifically for "View Company Website" button
    Returns only the website URL (or error message)
    """
    email = request.GET.get('email')

    if not email:
        return JsonResponse({
            "success": False,
            "error": "Email parameter is required"
        }, status=400)

    try:
        # Case-insensitive lookup
        company = get_object_or_404(Company, email__iexact=email.strip())

        if not company.website:
            return JsonResponse({
                "success": False,
                "error": "This company has not provided an official website"
            }, status=404)

        return JsonResponse({
            "success": True,
            "website": company.website,
            "company_name": company.name  # optional - nice to show in alert/tooltip
        }, status=200)

    except Company.DoesNotExist:
        return JsonResponse({
            "success": False,
            "error": "Company not found with this email"
        }, status=404)

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Server error: {str(e)}"
        }, status=500)





from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import JobApplication, Company

@csrf_exempt
@require_POST
def update_application_status(request, application_id):
    """
    Update a student's application status and send email notification.
    """
    import json
    try:
        data = json.loads(request.body)
        status_input = data.get("status")  # Accept case-insensitive input
        
        if not status_input:
            return JsonResponse({"error": "Status field is required"}, status=400)
        
        # Normalize status to title case and validate
        valid_statuses = ["Applied", "Shortlisted", "Rejected", "Selected"]
        status = None
        
        # Find matching status (case-insensitive)
        for valid_status in valid_statuses:
            if valid_status.lower() == status_input.lower():
                status = valid_status
                break
        
        if not status:
            return JsonResponse({"error": f"Invalid status. Valid options: {', '.join(valid_statuses)}"}, status=400)

        application = JobApplication.objects.select_related("student", "job").get(id=application_id)
        application.status = status
        application.save(update_fields=["status"])

        student_email = application.student.email
        student_name = application.student.name
        job_title = application.job.title
        company_name = application.job.company.name

        # Email subject and message based on status
        if status == "Selected":
            subject = f"Congratulations! Selected for {job_title}"
            message = f"Dear {student_name},\n\nCongratulations! You have been selected by {company_name} for the position '{job_title}'.\n\nBest wishes,\n{company_name} Team"
        elif status == "Shortlisted":
            subject = f"Application Update: {job_title}"
            message = f"Dear {student_name},\n\nGreat news! You have been shortlisted by {company_name} for the position '{job_title}'. We will contact you soon with further details.\n\nBest regards,\n{company_name} Team"
        elif status == "Rejected":
            subject = f"Application Update: {job_title}"
            message = f"Dear {student_name},\n\nThank you for applying to {company_name} for the position '{job_title}'. We regret to inform you that you were not selected at this stage.\n\nBest regards,\n{company_name} Team"
        else:  # Applied
            subject = f"Application Confirmation: {job_title}"
            message = f"Dear {student_name},\n\nYour application for {job_title} at {company_name} has been received. We appreciate your interest and will review your profile.\n\nBest regards,\n{company_name} Team"

        # Send email
        send_mail(
            subject,
            message,
            "no-reply@yourdomain.com",  # Replace with your from email
            [student_email],
            fail_silently=False
        )

        return JsonResponse({"message": f"Status updated to '{status}' and email sent to {student_email}"})

    except JobApplication.DoesNotExist:
        return JsonResponse({"error": "Application not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)





from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Company, Job

@require_GET
def get_jobs_by_company_email(request):
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    company = get_object_or_404(Company, email=email.strip().lower())
    jobs = Job.objects.filter(company=company).order_by("-created_at")

    job_list = []
    for job in jobs:
        skills = []
        if hasattr(job, "skills"):
            try:
                skills = [s.name for s in job.skills.all()]
            except:
                skills = job.skills if isinstance(job.skills, (list, tuple)) else []

        job_list.append({
            "id": job.id,
            "title": job.title,
            "job_type": job.job_type.replace("_", " ").title() if job.job_type else "Unknown",
            "departments": job.departments or [],
            "last_date_to_apply": str(job.last_date_to_apply) if job.last_date_to_apply else None,
            "skills": skills,
        })

    return JsonResponse({"company_name": company.name, "jobs": job_list}, status=200)


from .models import Company, Job, JobApplication, OfferLetter
from students.models import Student
from django.core.files.storage import FileSystemStorage
import os
from django.shortcuts import get_object_or_404
import traceback

@csrf_exempt
@require_POST
def upload_offer_letter(request):
    try:
        company_email = request.POST.get("company_email")
        student_email = request.POST.get("student_email")
        job_id = request.POST.get("job_id")
        message = request.POST.get("message", "")
        file = request.FILES.get("offer_letter")

        if not all([company_email, student_email, job_id, file]):
            return JsonResponse({"error": "Missing required fields or file"}, status=400)

        company = get_object_or_404(Company, email=company_email)
        student = get_object_or_404(Student, email=student_email)
        job = get_object_or_404(Job, id=job_id)

        # Check if student is selected for this job
        application = JobApplication.objects.filter(student=student, job=job, status="Selected").first()
        if not application:
            return JsonResponse({"error": "Student is not selected for this job or application not found"}, status=400)

        offer_letter = OfferLetter.objects.create(
            company=company,
            student=student,
            job=job,
            offer_letter=file,
            message=message
        )

        # Notify Student via Email
        try:
            from django.core.mail import send_mail
            subject = f"Congratulations! You've received an Offer Letter from {company.name}"
            email_message = f"Hello {student.name},\n\nWe are pleased to inform you that {company.name} has uploaded an offer letter for the position of {job.title}.\n\nYou can view and download it from your student portal dashboard.\n\nMessage from company: {message}\n\nBest regards,\nPlacement Cell"
            send_mail(subject, email_message, None, [student.email], fail_silently=True)
        except Exception as mail_err:
            print(f"Failed to send offer letter email: {mail_err}")

        return JsonResponse({
            "message": "Offer letter uploaded successfully",
            "offer_letter_id": offer_letter.id
        }, status=201)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_GET
def get_offer_letters(request):
    student_email = request.GET.get("student_email")
    company_email = request.GET.get("company_email")
    is_admin = request.GET.get("is_admin") == "true"

    try:
        queryset = OfferLetter.objects.select_related('company', 'student', 'job').order_by('-uploaded_at')

        if student_email:
            queryset = queryset.filter(student__email=student_email)
        elif company_email:
            queryset = queryset.filter(company__email=company_email)
        elif not is_admin:
             return JsonResponse({"error": "Unauthorized access"}, status=403)

        data = []
        for ol in queryset:
            data.append({
                "id": ol.id,
                "company_name": ol.company.name,
                "company_email": ol.company.email,
                "student_name": ol.student.name,
                "student_email": ol.student.email,
                "job_title": ol.job.title,
                "offer_letter_url": ol.offer_letter.url if ol.offer_letter else None,
                "message": ol.message,
                "uploaded_at": ol.uploaded_at.strftime("%d %b %Y %H:%M"),
                "is_viewed": ol.is_viewed_by_student
            })

        return JsonResponse({"offer_letters": data}, status=200)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)
