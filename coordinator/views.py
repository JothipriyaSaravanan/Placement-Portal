from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import DepartmentCoordinator
import json


@csrf_exempt
@require_POST
def coordinator_register(request):
    """
    Used by ADMIN to create coordinator accounts
    """
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")
        department = data.get("department")

        if not username or not password or not department:
            return JsonResponse({"error": "All fields required"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(
            username=username,
            password=password
        )

        DepartmentCoordinator.objects.create(
            user=user,
            department=department
        )

        return JsonResponse({
            "message": "Coordinator registered successfully"
        })


from django.contrib.auth import authenticate, login







import json
import requests
import openpyxl
from io import BytesIO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import openpyxl
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import openpyxl
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt



@csrf_exempt
def process_excel(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    excel_file = request.FILES.get("file")
    if not excel_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    # Load workbook
    wb = openpyxl.load_workbook(excel_file)
    sheet = wb.active

    added = 0
    skipped = 0

    for row in sheet.iter_rows(min_row=2, values_only=True):
        try:
            (
                university_reg_no,
                name,
                ug_pg,
                department,
                programme,
                email,
                phone,
            ) = row
        except ValueError:
            skipped += 1
            continue

        if not university_reg_no or not name:
            skipped += 1
            continue


        added += 1

    return JsonResponse({
        "message": "Excel processed successfully",
        "students_added": added,
        "rows_skipped": skipped
    })


from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
import json

from .models import DepartmentCoordinator
from students.models import Student   # ← adjust this import to match your actual Student model location

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

# coordinator/views.py
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json


from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
import uuid

from companies.models import Job

@csrf_exempt
@require_POST
def coordinator_login(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse({"error": "Username & password required"}, status=400)

        # 🚀 Support email-based login
        actual_username = username
        if "@" in username:
            try:
                user_obj = User.objects.get(email=username)
                actual_username = user_obj.username
            except User.DoesNotExist:
                return JsonResponse({"error": "No account found with this email"}, status=401)

        user = authenticate(username=actual_username, password=password)

        if user is None:
            return JsonResponse({"error": "Invalid credentials. Please check your password."}, status=401)

        # Confirm if user is a coordinator
        if not hasattr(user, 'departmentcoordinator'):
            return JsonResponse({"error": "This account is not registered as a coordinator"}, status=403)

        # Token for frontend (not stored in User table to avoid crash if field missing)
        token = str(uuid.uuid4())

        return JsonResponse({
            "message": "Login successful",
            "username": user.username,
            "department": user.departmentcoordinator.department,
            "token": token
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Internal server error"}, status=500)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)







@require_GET
def coordinator_students(request):
    print("User authenticated?", request.user.is_authenticated)          # ← add this
    print("Username:", request.user.username if request.user.is_authenticated else "Anonymous")
    print("Has coordinator profile?", hasattr(request.user, 'departmentcoordinator'))

    if not request.user.is_authenticated:
        return JsonResponse(
            {
                "error": "Authentication required",
                "message": "Please log in as coordinator",
                "login_url": "/coordinator/login/"
            },
            status=401
        )

    if not hasattr(request.user, 'departmentcoordinator'):
        return JsonResponse({"error": "You are not a coordinator"}, status=403)

    # rest of your code...



from django.db.models import Q

@require_GET
def coordinator_jobs(request):
    department = request.GET.get("department")

    jobs = Job.objects.filter(
        is_approved=True,
        is_active=True
    ).filter(
        Q(show_to_all_departments=True) |
        Q(departments__name=department)
    ).distinct()

    return JsonResponse({
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "departments": [d.name for d in j.departments.all()]
            }
            for j in jobs
        ]
    })





from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from companies.models import Job
from .models import DepartmentCoordinator


@csrf_exempt
@require_GET
def get_coordinator_jobs(request):
    username = request.GET.get('username')

    if not username:
        return JsonResponse({"error": "Username required"}, status=400)

    try:
        coordinator = DepartmentCoordinator.objects.get(user__username=username)

        jobs = Job.objects.filter(
            is_active=True
        ).filter(
            Q(show_to_all_departments=True) |
            Q(departments__contains=[coordinator.department])
        ).order_by('-created_at')

        job_list = []
        for job in jobs:
            job_list.append({
                "id": job.id,
                "title": job.title,
                "company": job.company.name,
                "location": job.location,
                "job_type": job.job_type,
                "last_date_to_apply": str(job.last_date_to_apply),
            })

        return JsonResponse({"jobs": job_list})

    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import DepartmentCoordinator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import DepartmentCoordinator
from django.contrib.auth.models import User

@csrf_exempt
def coordinator_info(request):
    try:
        username = request.GET.get("username")  # from frontend
        if not username:
            return JsonResponse({"error": "Username is required"}, status=400)

        # Since DepartmentCoordinator has a ForeignKey to User:
        coordinator = DepartmentCoordinator.objects.get(user__username=username)

        return JsonResponse({
            "username": coordinator.user.username,
            "email": coordinator.user.email,  # get email from User
            "department": coordinator.department
        }, status=200)

    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)





from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from companies.models import JobApplication

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from companies.models import JobApplication


@csrf_exempt
@require_GET
def selected_students_report(request):
    """
    Returns selected students report.
    Optional filters:
    ?department=Tamil
    ?programme=MA_Tamil
    ?batch=2026
    """

    try:
        department = request.GET.get("department")
        programme = request.GET.get("programme")
        batch = request.GET.get("batch")

        # Base Query: Only Selected students
        applications = JobApplication.objects.filter(
            status__iexact="Selected"
        ).select_related("student", "job", "job__company")

        # 🔹 Filter by Department
        if department:
            applications = applications.filter(
                student__department__iexact=department.strip()
            )

        # 🔹 Filter by Programme
        if programme:
            applications = applications.filter(
                student__programme__iexact=programme.strip()
            )

        # 🔹 Filter by Batch (Passed Out Year)
        if batch:
            applications = applications.filter(
                student__passed_out_year=batch
            )

        report = []

        for app in applications:
            student = app.student
            job = app.job

            # Safety check
            if not student or not job:
                continue

            report.append({
                "application_id": app.id,
                "university_reg_no": student.university_reg_no or "",
                "student_name": student.name or "",
                "student_email": student.email or "",
                "department": student.department or "",
                "programme": student.programme or "",
                "passed_out_year": student.passed_out_year or "",
                "company": job.company.name if job.company else "",
                "job_title": job.title or "",
                "job_location": job.location or "",
                "selected_at": (
                    app.applied_at.strftime("%Y-%m-%d")
                    if app.applied_at else ""
                ),
            })

        return JsonResponse(
            {
                "count": len(report),
                "selected_students": report
            },
            status=200
        )

    except Exception as e:
        print("ERROR IN selected_students_report:", str(e))
        return JsonResponse(
            {"error": "Internal Server Error"},
            status=500
        )




import random
import json
from django.http import JsonResponse
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from .models import DepartmentCoordinator, CoordinatorPasswordResetOTP

User = get_user_model()

# 1️⃣ Send OTP
@csrf_exempt
def coordinator_send_otp(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email")
        if not email:
            return JsonResponse({"error": "Email required"}, status=400)

        coordinator = DepartmentCoordinator.objects.filter(user__email=email).first()
        if not coordinator:
            return JsonResponse({"error": "Coordinator not found"}, status=404)

        otp = str(random.randint(100000, 999999))
        CoordinatorPasswordResetOTP.objects.create(email=email, otp=otp)

        send_mail(
            "Coordinator Password Reset OTP",
            f"Your OTP is {otp}. Valid for 5 minutes.",
            None,  # From email (can set in settings)
            [email],
            fail_silently=False,
        )
        return JsonResponse({"message": "OTP sent successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# 2️⃣ Verify OTP
@csrf_exempt
def coordinator_verify_otp(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email")
        otp = data.get("otp")

        record = CoordinatorPasswordResetOTP.objects.filter(email=email, otp=otp).last()
        if not record:
            return JsonResponse({"error": "Invalid OTP"}, status=400)
        if record.is_expired():
            return JsonResponse({"error": "OTP expired"}, status=400)

        return JsonResponse({"message": "OTP verified successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# 3️⃣ Reset Password (works with username login)
@csrf_exempt
def coordinator_reset_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get("email")
        otp = data.get("otp")
        password = data.get("password")  # make sure frontend sends "password"

        if not all([email, otp, password]):
            return JsonResponse({"error": "Email, OTP, and new password required"}, status=400)

        # 1. Validate OTP
        record = CoordinatorPasswordResetOTP.objects.filter(email=email, otp=otp).last()
        if not record:
            return JsonResponse({"error": "Invalid OTP"}, status=400)
        if record.is_expired():
            return JsonResponse({"error": "OTP expired"}, status=400)

        # 2. Get coordinator user by email
        coordinator = DepartmentCoordinator.objects.filter(user__email=email).first()
        if not coordinator:
            return JsonResponse({"error": "Coordinator not found"}, status=404)

        user = coordinator.user

        # 3. Update password (username login will work)
        user.set_password(password)
        user.save()

        # 4. Delete OTP to prevent reuse
        CoordinatorPasswordResetOTP.objects.filter(email=email).delete()

        return JsonResponse({
            "message": "Password reset successful. You can now log in with your username."
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth.models import User
from .models import DepartmentCoordinator, CoordinatorMessage
from students.models import Student
import json

from django.utils import timezone
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import CoordinatorMessage, DepartmentCoordinator


@require_GET
def my_announcements(request):
    username = request.GET.get("username")

    if not username:
        return JsonResponse({"error": "Username required"}, status=400)

    try:
        user = User.objects.get(username=username)
        coordinator = DepartmentCoordinator.objects.get(user=user)

        messages = CoordinatorMessage.objects.filter(
            coordinator=coordinator
        ).order_by("-created_at")

        data = [
            {
                "id": msg.id,
                "title": msg.title,
                "message": msg.message,
                "department": msg.department,
                "date": timezone.localtime(msg.created_at)
                        .strftime("%Y-%m-%d %H:%M"),
            }
            for msg in messages
        ]

        return JsonResponse({"messages": data})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)


# ✅ Send announcement
@csrf_exempt
@require_POST
def send_message(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        title = data.get("title")
        message = data.get("message")

        if not username or not title or not message:
            return JsonResponse({"error": "All fields required"}, status=400)

        user = User.objects.get(username=username)
        coordinator = DepartmentCoordinator.objects.get(user=user)

        CoordinatorMessage.objects.create(
            coordinator=coordinator,
            department=coordinator.department,
            title=title,
            message=message
        )

        return JsonResponse({"message": "Announcement sent successfully"})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from students.models import Student
from coordinator.models import CoordinatorMessage

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.utils import timezone
from students.models import Student
from coordinator.models import CoordinatorMessage


@require_GET
def student_messages(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"error": "Email required"}, status=400)

    try:
        student = Student.objects.get(email=email)

        messages = CoordinatorMessage.objects.filter(
            department__iexact=student.department
        ).order_by("-created_at")

        data = [
            {
                "id": msg.id,
                "title": msg.title,
                "message": msg.message,
                "sent_by": msg.coordinator.user.username,
                "department": msg.department,
                "date": timezone.localtime(msg.created_at)
                        .strftime("%Y-%m-%d %H:%M"),
            }
            for msg in messages
        ]

        return JsonResponse({"messages": data})

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)



        # ✅ Edit announcement
@csrf_exempt
@require_POST
def edit_message(request):
    try:
        data = json.loads(request.body)
        message_id = data.get("id")
        username = data.get("username")
        title = data.get("title")
        message = data.get("message")

        if not message_id or not username:
            return JsonResponse({"error": "Message ID and username required"}, status=400)

        user = User.objects.get(username=username)
        coordinator = DepartmentCoordinator.objects.get(user=user)

        msg = CoordinatorMessage.objects.get(
            id=message_id,
            coordinator=coordinator
        )

        if title:
            msg.title = title
        if message:
            msg.message = message

        msg.save()

        return JsonResponse({"message": "Announcement updated successfully"})

    except CoordinatorMessage.DoesNotExist:
        return JsonResponse({"error": "Message not found"}, status=404)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)





        # ✅ Delete announcement
@csrf_exempt
@require_POST
def delete_message(request):
    try:
        data = json.loads(request.body)
        message_id = data.get("id")
        username = data.get("username")

        if not message_id or not username:
            return JsonResponse({"error": "Message ID and username required"}, status=400)

        user = User.objects.get(username=username)
        coordinator = DepartmentCoordinator.objects.get(user=user)

        msg = CoordinatorMessage.objects.get(
            id=message_id,
            coordinator=coordinator
        )

        msg.delete()

        return JsonResponse({"message": "Announcement deleted successfully"})

    except CoordinatorMessage.DoesNotExist:
        return JsonResponse({"error": "Message not found"}, status=404)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)





        
# coordinator/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from students.models import Student
from companies.models import Job
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from datetime import date
from students.models import Student
from companies.models import Job
@require_GET
def coordinator_dashboard_stats(request):
    department = request.GET.get('department')
    if not department:
        return JsonResponse({"error": "Department parameter is required"}, status=400)

    total_students = Student.objects.filter(
        department=department,
        is_active=True
    ).count()

    today = date.today()

    # Active jobs - only jobs specifically targeted to this department (exclude show_to_all broadcast jobs)
    active_jobs = Job.objects.filter(
        is_active=True,
        is_approved=True,
        last_date_to_apply__isnull=False,
        last_date_to_apply__gte=today,
        departments__contains=[department]  # Only jobs explicitly for this department
    ).distinct().count()

    # Complete jobs - deadline has passed
    complete_jobs = Job.objects.filter(
        is_active=True,
        is_approved=True,
        last_date_to_apply__isnull=False,
        last_date_to_apply__lt=today,
        departments__contains=[department]  # Only jobs explicitly for this department
    ).distinct().count()

    return JsonResponse({
        "total_students": total_students,
        "active_jobs": active_jobs,
        "complete_jobs": complete_jobs,
    })

from django.db.models import Count, Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from students.models import Student


@require_GET
def department_placement_stats(request):
    """
    Returns placement stats for ONE specific department.
    - Counts UNIQUE students only (no double-counting even with multiple selected jobs)
    """
    department = request.GET.get("department")
    if not department:
        return JsonResponse({"error": "department parameter is required"}, status=400)

    # Base: only active students in this department
    qs = Student.objects.filter(department=department, is_active=True)

    total_students = qs.count()

    # Unique students who have AT LEAST ONE "Selected" application
    placed_students = qs.filter(
        applications__status="Selected"
    ).distinct().count()  # ← this distinct() ensures one student = one count

    not_placed = total_students - placed_students
    percentage = round((placed_students / total_students) * 100, 2) if total_students > 0 else 0

    return JsonResponse({
        "department": department,
        "total_students": total_students,
        "placed_students": placed_students,
        "not_placed": not_placed,
        "placement_percentage": percentage,
    })





from django.db.models import Count, Q
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from students.models import Student


@require_GET
def year_wise_placement_trend(request):

    department = request.GET.get("department")
    if not department:
        return JsonResponse({"error": "department parameter is required"}, status=400)

    # Get all students of department
    students = Student.objects.filter(
        department=department,
        is_active=True
    )

    # Year-wise total students
    total_by_year = (
        students
        .values("passed_out_year")
        .annotate(total_students=Count("id"))
        .order_by("passed_out_year")
    )

    result = []

    prev_percentage = None

    for row in total_by_year:
        year = row["passed_out_year"]

        total = row["total_students"]

        # 🔥 COUNT DISTINCT STUDENTS WHO HAVE SELECTED
        placed = students.filter(
            passed_out_year=year,
            applications__status="Selected"
        ).values("id").distinct().count()

        percentage = round((placed / total) * 100, 2) if total > 0 else 0

        change = None
        if prev_percentage is not None:
            change = round(percentage - prev_percentage, 2)

        result.append({
            "year": year,
            "total_students": total,
            "placed_students": placed,
            "not_placed": total - placed,
            "placement_percentage": percentage,
            "change_from_previous": change,
        })

        prev_percentage = percentage

    return JsonResponse(result, safe=False)


from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET
from students.models import Student
from coordinator.models import DepartmentCoordinator


@require_GET
def students_by_coordinator(request, username):
    from django.db.models import Q
    from django.shortcuts import get_object_or_404
    
    # Flexibility: match both username or email
    coordinator = get_object_or_404(
        DepartmentCoordinator.objects.filter(
            Q(user__username=username) | Q(user__email=username),
            is_active=True
        )
    )

    programme = request.GET.get("programme")
    batch_year = request.GET.get("batch")

    base_qs = Student.objects.filter(
        department__iexact=coordinator.department,
        is_active=True
    )

    response = {}

    # Always return programmes
    if coordinator.programme:
        response["programmes"] = [
            p.strip() for p in coordinator.programme.split(",")
        ]
    else:
        response["programmes"] = []

    # If programme + batch → return students
    if programme and batch_year:
        students_qs = base_qs.filter(
            programme__iexact=programme,
            passed_out_year=batch_year
        )

        response["students"] = [
            {
                "id": s.id,
                "university_reg_no": s.university_reg_no,
                "name": s.name,
                "ug_pg": s.ug_pg,
                "programme": s.programme,
                "email": s.email,
                "phone": s.phone,
                "passed_out_year": s.passed_out_year,
            }
            for s in students_qs
        ]

    # If programme only → return batches
    elif programme:
        batches = (
            base_qs.filter(programme__iexact=programme)
            .values_list("passed_out_year", flat=True)
            .distinct()
            .order_by("-passed_out_year")
        )

        response["batch_years"] = list(batches)

    # If nothing selected → return all batches
    else:
        batches = (
            base_qs.values_list("passed_out_year", flat=True)
            .distinct()
            .order_by("-passed_out_year")
        )

        response["batch_years"] = list(batches)

    return JsonResponse(response)

@require_GET
def coordinator_programmes(request):
    """
    Return programmes based on department.
    Example:
    /coordinator/programmes/?department=Tamil
    """

    department = request.GET.get("department")

    if not department:
        return JsonResponse(
            {"error": "Department is required"},
            status=400
        )

    coordinator = DepartmentCoordinator.objects.filter(
        department__iexact=department,
        is_active=True
    ).first()

    if not coordinator:
        return JsonResponse(
            {"programmes": []}
        )

    programmes = []
    if coordinator.programme:
        programmes = [
            p.strip()
            for p in coordinator.programme.split(",")
        ]

    return JsonResponse({
        "department": department,
        "programmes": programmes
    })

    from django.http import JsonResponse
from django.views.decorators.http import require_GET
from coordinator.models import DepartmentCoordinator


@require_GET
def coordinator_programmes(request):
    """
    Return programmes based on department.
    Example:
    /coordinator/programmes/?department=Tamil
    """

    department = request.GET.get("department")

    if not department:
        return JsonResponse(
            {"error": "Department is required"},
            status=400
        )

    coordinator = DepartmentCoordinator.objects.filter(
        department__iexact=department,
        is_active=True
    ).first()

    if not coordinator:
        return JsonResponse(
            {"programmes": []}
        )

    programmes = []
    if coordinator.programme:
        programmes = [
            p.strip()
            for p in coordinator.programme.split(",")
        ]

    return JsonResponse({
        "department": department,
        "programmes": programmes
    })






    from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from companies.models import Job

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from companies.models import Job

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from companies.models import Job

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from companies.models import Job


@require_GET
def coordinator_jobs(request):

    department = request.GET.get("department")
    programme = request.GET.get("programme")
    graduation_year = request.GET.get("graduation_year")
    status = request.GET.get("status")

    jobs = Job.objects.filter(is_approved=True)

    if department:
        jobs = jobs.filter(eligible_departments__icontains=department)

    if programme:
        jobs = jobs.filter(eligible_programmes__icontains=programme)

    if graduation_year:
        jobs = jobs.filter(eligible_years__icontains=graduation_year)

    if status == "active":
        jobs = jobs.filter(is_active=True)

    results = []

    for job in jobs:
        results.append({
            "id": job.id,
            "title": job.title,
            "company": job.company.name if job.company else "",
            "location": job.location,
            "salary": job.salary,
            "deadline": job.last_date_to_apply,
            "active": job.is_active
        })

    return JsonResponse({"jobs": results})


@require_GET
def coordinator_programmes(request):
    """
    Return programmes available for a coordinator's department
    """

    department = request.GET.get("department")

    if not department:
        return JsonResponse({"programmes": []})

    programmes = (
        Student.objects.filter(department=department)
        .exclude(programme__isnull=True)
        .values_list("programme", flat=True)
        .distinct()
    )

    return JsonResponse({
        "programmes": list(programmes)
    })

# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_GET
# from django.shortcuts import get_object_or_404
# from companies.models import Job, JobApplication
# @csrf_exempt
# @require_GET
# def get_job_applicants(request):
#     job_id = request.GET.get("job_id")

#     if not job_id:
#         return JsonResponse({"error": "job_id required"}, status=400)

#     job = get_object_or_404(Job, id=job_id)

#     applications = JobApplication.objects.filter(
#         job=job
#     ).select_related("student")

#     data = []

#     for app in applications:
#         student = app.student

#         data.append({
#             "application_id": app.id,

#             "student": {
#                 "id": student.id,
#                 "name": student.name or "N/A",
#                 "email": student.email or "N/A",
#                 "university_reg_no": getattr(student, "university_reg_no", "N/A"),
#                 "department": getattr(student, "department", "N/A"),
#                 "programme": getattr(student, "programme", "N/A"),
                
#                 # ─── Fixed fields ───
#                 "year": getattr(student, "passed_out_year", "N/A"),          # ← changed
#                 "phone": student.phone or "N/A",           # ← changed
                
#                 "cgpa": getattr(student, "cgpa", "N/A"),
#             },

#             "status": app.status or "Pending",

#             "applied_at": app.applied_at.strftime("%d %b %Y %H:%M")
#             if app.applied_at else "N/A",

#             "cover_letter": (app.cover_letter[:200] + "...")
#             if app.cover_letter else "No cover letter"
#         })

#     return JsonResponse({
#         "applications": data,
#         "count": len(data)
#     })

@csrf_exempt
@require_GET
def get_job_applicants(request):
    job_id = request.GET.get("job_id")
    username = request.GET.get("username")  # Get coordinator's username

    if not job_id:
        return JsonResponse({"error": "job_id required"}, status=400)
    
    if not username:
        return JsonResponse({"error": "username required"}, status=400)

    # Get coordinator to retrieve their department
    try:
        coordinator = DepartmentCoordinator.objects.get(user__username=username)
    except DepartmentCoordinator.DoesNotExist:
        return JsonResponse({"error": "Coordinator not found"}, status=404)

    job = get_object_or_404(Job, id=job_id)

    # Filter applicants: only from the coordinator's department
    applications = JobApplication.objects.filter(
        job=job,
        student__department__iexact=coordinator.department  # ← Department filter added
    ).select_related("student")

    data = []

    for app in applications:
        student = app.student

        data.append({
            "application_id": app.id,

            "student": {
                "id": student.id,
                "name": student.name or "N/A",
                "email": student.email or "N/A",
                "university_reg_no": getattr(student, "university_reg_no", "N/A"),
                "department": getattr(student, "department", "N/A"),
                "programme": getattr(student, "programme", "N/A"),
                
                "year": getattr(student, "passed_out_year", "N/A"),
                "phone": student.phone or "N/A",
                
                "cgpa": getattr(student, "cgpa", "N/A"),
            },

            "status": app.status or "Pending",

            "applied_at": app.applied_at.strftime("%d %b %Y %H:%M")
            if app.applied_at else "N/A",

            "cover_letter": (app.cover_letter[:200] + "...")
            if app.cover_letter else "No cover letter"
        })

    return JsonResponse({
        "applications": data,
        "count": len(data)
    })

# import io
# import csv
# from django.http import HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_GET
# from django.shortcuts import get_object_or_404
# from companies.models import JobApplication, Job

# @csrf_exempt
# @require_GET
# def download_job_applications(request):
#     """
#     Coordinator downloads job applicants as CSV
#     Query params: job_id, status (optional)
#     """
#     job_id = request.GET.get("job_id")
#     status_filter = request.GET.get("status")  # optional

#     if not job_id:
#         return HttpResponse("Job ID is required", status=400)

#     job = get_object_or_404(Job, id=job_id)

#     applications = JobApplication.objects.filter(job=job).select_related("student")

#     if status_filter:
#         applications = applications.filter(status=status_filter)

#     # Prepare CSV
#     output = io.StringIO()
#     writer = csv.writer(output)
#     writer.writerow([
#         "Student Name",
#         "Email",
#         "Department",
#         "Programme",
#         "Year",
#         "Phone",
#         "CGPA",
#         "Status",
#         "Applied At",
#         "Cover Letter",
#     ])

#     for app in applications:
#         student = app.student
#         writer.writerow([
#             student.name,
#             student.email,
#             getattr(student, "department", "N/A"),
#             getattr(student, "programme", "N/A"),
#             getattr(student, "year", "N/A"),
#             getattr(student, "phone", "N/A"),
#             getattr(student, "cgpa", "N/A"),
#             app.status or "Pending",
#             app.applied_at.strftime("%d %b %Y %H:%M") if hasattr(app, "applied_at") else "N/A",
#             app.cover_letter[:200] + "..." if app.cover_letter else "No cover letter",
#         ])

#     response = HttpResponse(output.getvalue(), content_type="text/csv")
#     response["Content-Disposition"] = f'attachment; filename="job_{job_id}_applications.csv"'
#     return response


import io
import csv
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from companies.models import JobApplication, Job
from .models import DepartmentCoordinator

@csrf_exempt
@require_GET
def download_job_applications(request):
    """
    Coordinator downloads job applicants as CSV
    Query params: job_id, username, status (optional)
    """
    job_id = request.GET.get("job_id")
    username = request.GET.get("username")
    status_filter = request.GET.get("status")

    if not job_id:
        return HttpResponse("Job ID is required", status=400)
    
    if not username:
        return HttpResponse("Username is required", status=400)

    # Get coordinator's department
    try:
        coordinator = DepartmentCoordinator.objects.get(user__username=username)
    except DepartmentCoordinator.DoesNotExist:
        return HttpResponse("Coordinator not found", status=404)

    job = get_object_or_404(Job, id=job_id)

    # Filter by job AND coordinator's department
    applications = JobApplication.objects.filter(
        job=job,
        student__department__iexact=coordinator.department
    ).select_related("student")

    if status_filter:
        applications = applications.filter(status=status_filter)

    # Prepare CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student Name",
        "Email",
        "Department",
        "Programme",
        "Year",
        "Phone",
        "CGPA",
        "Status",
        "Applied At",
        "Cover Letter",
    ])

    for app in applications:
        student = app.student
        writer.writerow([
            student.name or "N/A",
            student.email or "N/A",
            getattr(student, "department", "N/A"),
            getattr(student, "programme", "N/A"),
            getattr(student, "passed_out_year", "N/A"),
            getattr(student, "phone", "N/A"),
            getattr(student, "cgpa", "N/A"),
            app.status or "Pending",
            app.applied_at.strftime("%d %b %Y %H:%M") if app.applied_at else "N/A",
            app.cover_letter[:200] + "..." if app.cover_letter else "No cover letter",
        ])

    response = HttpResponse(output.getvalue(), content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="job_{job_id}_applications.csv"'
    return response


    # coordinator/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from admin_app.models import Announcement   # import Announcement model

from admin_app.models import Announcement   # ✅ ADD THIS
from django.db.models import Q

@require_GET
def get_admin_announcements(request):
    department = request.GET.get("department")

    department = request.GET.get("department") or ""
    announcements = Announcement.objects.filter(
        is_active=True
    ).filter(
        Q(target_type="all") |
        Q(target_type="coordinator", department__icontains=department)
    ).order_by('-created_at')

    return JsonResponse({
        "announcements": [
            {
                "id": a.id,
                "title": a.title,
                "message": a.message,
                "important": a.important,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M"),
                "created_by": a.created_by.username if a.created_by else "Admin",
            }
            for a in announcements
        ]
    })

@require_GET
def recent_student_activity(request):
    """
    Returns latest 10 job applications (activity) for a specific department.
    """
    department = request.GET.get('department')
    if not department:
        return JsonResponse({"error": "Department parameter is required"}, status=400)

    from companies.models import JobApplication

    # Detailed join with Student to get name, batch (passed_out_year), dept, status
    applications = JobApplication.objects.filter(
        student__department=department
    ).select_related('student', 'job').order_by('-applied_at')[:10]

    activity_list = []
    for app in applications:
        activity_list.append({
            "name": app.student.name,
            "batch": app.student.passed_out_year,
            "dept": app.student.department,
            "status": app.status, # e.g. "Applied", "Shortlisted", "Selected", "Rejected"
            "applied_at": app.applied_at.strftime("%Y-%m-%d %H:%M")
        })

    return JsonResponse({"activity": activity_list})
