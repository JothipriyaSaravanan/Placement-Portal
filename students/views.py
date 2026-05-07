from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.core.files.storage import default_storage
import json
import random
from .models import (
    Student, StudentProfile, Education, Skill, Certificate, Resume, PasswordResetOTP
)

@csrf_exempt
@require_POST
def send_otp(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        if not Student.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email not registered"}, status=400)

        otp = str(random.randint(100000, 999999))
        PasswordResetOTP.objects.create(email=email, otp=otp)

        send_mail(
            "Password Reset OTP",
            f"Your OTP is {otp}. It is valid for 5 minutes.",
            None,
            [email],
            fail_silently=False,
        )
        return JsonResponse({"message": "OTP sent successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def verify_otp(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        otp = data.get("otp")

        record = PasswordResetOTP.objects.filter(email=email, otp=otp).last()
        if not record:
            return JsonResponse({"error": "Invalid OTP"}, status=400)
        if record.is_expired():
            return JsonResponse({"error": "OTP expired"}, status=400)

        return JsonResponse({"message": "OTP verified"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def reset_password(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        student = Student.objects.filter(email=email).first()
        if not student:
            return JsonResponse({"error": "User not found"}, status=404)

        student.password = make_password(password)
        student.save()
        PasswordResetOTP.objects.filter(email=email).delete()

        return JsonResponse({"message": "Password reset successful"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.shortcuts import get_object_or_404
from .models import Student, StudentProfile, Education, Skill, Certificate, Resume

@csrf_exempt
@require_GET
def get_profile(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"error": "Email required"}, status=400)

    student = get_object_or_404(Student, email=email)
    profile = StudentProfile.objects.filter(student=student).first()

    def safe_url(field):
        if not field:
            return ""

        try:
            url = field.url
        except Exception:
            return ""

        # If local file exists, return URL
        try:
            path = field.name
            if path and field.storage.exists(path):
                return url
        except Exception:
            pass

        # If URL is an absolute remote URL, return it
        if url.startswith("http://") or url.startswith("https://"):
            return url

        # If URL is a media path and file exists, return it
        if url.startswith("/media/"):
            try:
                if default_storage.exists(url.lstrip("/")):
                    return url
            except Exception:
                pass

        return ""

    return JsonResponse({
    "student": {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "phone": student.phone or "",
        "university_reg_no": student.university_reg_no or "",  # ✅ Added
        "ug_pg": student.ug_pg,
        "programme": student.programme,
        "passed_out_year": student.passed_out_year or ""  # ✅ Added
    },
    "about": profile.about if profile else "",
    "profile_image": safe_url(profile.profile_image) if profile else "",
    "education": list(Education.objects.filter(student=student).values()),
    "skills": list(Skill.objects.filter(student=student).values()),
    "certificates": [
        {
            "id": c.id,
            "title": c.title,
            "certificate_file": safe_url(c.certificate_file),
            "issued_by": c.issued_by,
            "year_obtained": c.year_obtained,

        }
        for c in Certificate.objects.filter(student=student)
    ],
    "resume": safe_url(Resume.objects.filter(student=student).first().resume_file) if Resume.objects.filter(student=student).exists() else ""
})





@csrf_exempt
@require_POST
def edit_profile(request, student_id):
    try:
        student = get_object_or_404(Student, id=student_id)
        profile, _ = StudentProfile.objects.get_or_create(student=student)

        # Handle multipart/form-data
        if request.content_type.startswith("multipart/form-data"):
            about = request.POST.get("about")
            profile_image = request.FILES.get("profile_image")
        else:
            data = json.loads(request.body)
            about = data.get("about")
            profile_image = None  # files can't come in JSON

        if about is not None:
            profile.about = about
        if profile_image is not None:
            profile.profile_image = profile_image

        profile.save()

        return JsonResponse({
            "message": "Profile updated",
            "about": profile.about,
            "profile_image": profile.profile_image.url if profile.profile_image else ""
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



@csrf_exempt
def delete_about(request, student_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Use DELETE method"}, status=405)

    profile = get_object_or_404(StudentProfile, student_id=student_id)
    profile.about = ""
    profile.save()
    return JsonResponse({"message": "About section cleared"})


from .models import Student, StudentProfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_profile_photo(request):
    email = request.GET.get("email")
    if not email:
        return JsonResponse({"error": "Email required"}, status=400)

    try:
        # Get student and profile
        student = get_object_or_404(Student, email=email.strip().lower())
        profile = get_object_or_404(StudentProfile, student=student)

        if profile.profile_image:
            # 1. Delete from local storage
            profile.profile_image.delete(save=False)

            # 2. Clear the field in database
            profile.profile_image = None
            profile.save()

        return JsonResponse({
            "message": "Profile photo deleted successfully",
            "profile_image": ""
        }, status=200)

    except (Student.DoesNotExist, StudentProfile.DoesNotExist):
        return JsonResponse({"error": "Profile not found"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)
# ─── Education ─────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def add_education(request):
    degree = request.POST.get("degree")
    institution = request.POST.get("institution")
    year_of_passing = request.POST.get("year_of_passing")
    cgpa = request.POST.get("cgpa")
    student_id = request.POST.get("student")

    if not all([degree, institution, year_of_passing, cgpa, student_id]):
        return JsonResponse({"error": "All fields required"}, status=400)

    student = get_object_or_404(Student, id=student_id)

    edu = Education.objects.create(
        student=student,
        degree=degree,
        institution=institution,
        year_of_passing=year_of_passing,
        cgpa=cgpa,
    )
    return JsonResponse({"message": "Education added", "id": edu.id}, status=201)


@csrf_exempt
@require_POST
def edit_education(request, edu_id):
    edu = get_object_or_404(Education, id=edu_id)

    edu.degree = request.POST.get("degree", edu.degree)
    edu.institution = request.POST.get("institution", edu.institution)
    edu.year_of_passing = request.POST.get("year_of_passing", edu.year_of_passing)
    edu.cgpa = request.POST.get("cgpa", edu.cgpa)
    edu.save()

    return JsonResponse({"message": "Education updated"})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_education(request, edu_id):
    edu = get_object_or_404(Education, id=edu_id)
    edu.delete()
    return JsonResponse({"message": "Education deleted successfully"})



@csrf_exempt
@require_POST
def add_certificate(request):
    try:
        student_id = request.POST.get("student")
        title = request.POST.get("title")
        issued_by = request.POST.get("issued_by")
        year_obtained = request.POST.get("year_obtained")
        certificate_file = request.FILES.get("certificate_file")

        student = Student.objects.get(id=student_id)

        certificate = Certificate.objects.create(
            student=student,
            title=title,
            issued_by=issued_by,          # ← VERY IMPORTANT
            year_obtained=year_obtained,  # ← VERY IMPORTANT
            certificate_file=certificate_file
        )

        return JsonResponse({"message": "Certificate added successfully"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def edit_certificate(request, cert_id):   # ← must match <int:cert_id> in urls.py
    try:
        certificate = Certificate.objects.get(id=cert_id)

        # Title
        title = request.POST.get("title")
        if title:
            certificate.title = title.strip()

        # Issued By
        issued_by = request.POST.get("issued_by")
        certificate.issued_by = issued_by.strip() if issued_by else None

        # Year Obtained
        year_obtained = request.POST.get("year_obtained")
        if year_obtained:
            try:
                certificate.year_obtained = int(year_obtained)
            except ValueError:
                return JsonResponse({"error": "Year must be a number"}, status=400)
        else:
            certificate.year_obtained = None

        # File (optional)
        if request.FILES.get("certificate_file"):
            certificate.certificate_file = request.FILES.get("certificate_file")

        certificate.save()

        return JsonResponse({"message": "Certificate updated successfully"})

    except Certificate.DoesNotExist:
        return JsonResponse({"error": "Certificate not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
@require_http_methods(["DELETE"])
def delete_certificate(request, cert_id):
    cert = get_object_or_404(Certificate, id=cert_id)
    cert.delete()
    return JsonResponse({"message": "Certificate deleted"})


# ─── Resume ────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def add_resume(request):
    student_id = request.POST.get("student")
    if not student_id:
        return JsonResponse({"error": "student ID required"}, status=400)
    if "resume_file" not in request.FILES:
        return JsonResponse({"error": "No resume file"}, status=400)

    if Resume.objects.filter(student_id=student_id).exists():
        return JsonResponse({"error": "Resume already exists. Use edit."}, status=400)

    Resume.objects.create(
        student_id=student_id,
        resume_file=request.FILES["resume_file"]
    )
    return JsonResponse({"message": "Resume uploaded"})


@csrf_exempt
@require_POST
def edit_resume(request, student_id):
    if "resume_file" not in request.FILES:
        return JsonResponse({"error": "No resume file provided"}, status=400)

    resume, created = Resume.objects.get_or_create(student_id=student_id)
    resume.resume_file = request.FILES["resume_file"]
    resume.save()

    return JsonResponse({"message": "Resume updated/created"})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_resume(request, student_id):
    Resume.objects.filter(student_id=student_id).delete()
    return JsonResponse({"message": "Resume deleted"})


# ─── Skills (optional – if still used) ─────────────────────────────

@csrf_exempt
@require_POST
def add_skill(request):
    student_id = request.POST.get("student")
    skill_name = request.POST.get("skill_name")
    if not student_id or not skill_name:
        return JsonResponse({"error": "student and skill_name required"}, status=400)

    Skill.objects.create(student_id=student_id, skill_name=skill_name)
    return JsonResponse({"message": "Skill added"})


@require_GET
def list_skills(request):
    student_id = request.GET.get("student")
    if not student_id:
        return JsonResponse([], safe=False)

    skills = Skill.objects.filter(student_id=student_id).values("id", "skill_name")
    return JsonResponse(list(skills), safe=False)


@csrf_exempt
@require_POST
def edit_skill(request, skill_id):
    if request.method != "POST":
        return JsonResponse({"error": "Use POST method"}, status=400)
    
    try:
        skill = Skill.objects.get(id=skill_id)
    except Skill.DoesNotExist:
        return JsonResponse({"error": "Skill not found"}, status=404)

    new_name = request.POST.get("skill_name")
    if not new_name:
        return JsonResponse({"error": "skill_name is required"}, status=400)

    skill.skill_name = new_name.strip()
    skill.save()

    return JsonResponse({"message": "Skill updated successfully"})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_skill(request, skill_id):
    try:
        skill = Skill.objects.get(id=skill_id)
        skill.delete()
        return JsonResponse({"message": "Skill deleted successfully"})
    except Skill.DoesNotExist:
        return JsonResponse({"error": "Skill not found"}, status=404)


from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .models import StudentVerificationRequest


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import StudentVerificationRequest



           

@csrf_exempt
@require_POST
def register(request):
    data = json.loads(request.body)
    email = data.get("email")

    # 🔒 Check admin approval
    req = StudentVerificationRequest.objects.filter(
        email=email,
        is_approved=True
    ).first()

    if not req:
        return JsonResponse(
            {"error": "Admin verification required before registration"},
            status=403
        )

    if Student.objects.filter(email=email).exists():
        return JsonResponse({"error": "Already registered"}, status=400)

    Student.objects.create(
        name=req.username, # Using username from request as name
        email=req.email,
        password=make_password(data["password"]),
        department=req.department,
        passed_out_year=req.year,
        phone=req.contact,
        university_reg_no=data.get("university_reg_no", f"REG-{req.id}"), # Fallback if not in data
        is_verified=True,
        is_active=True
    )

    return JsonResponse({
        "message": "Registration successful. You can now log in."
    }, status=201)




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.hashers import make_password, check_password
import json
from students.models import Student

@csrf_exempt
@require_POST
def student_login(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JsonResponse({"error": "Email and password are required"}, status=400)

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Invalid email or password"}, status=401)

    # ─── First-time login ─────────────────────────────
    if student.password is None:
        if password == student.university_reg_no:
            student.password = make_password(password)
            student.save(update_fields=['password'])

            return JsonResponse({
                "message": "Login successful (first-time login)",
                "student_id": student.id,
                "email": student.email,
                "name": student.name,
                "first_time": True,
                "message_detail": "Please change your password after login."
            }, status=200)
        else:
            return JsonResponse({
                "error": "Use your University Registration Number as password",
                "needs_regno_as_password": True
            }, status=401)

    # ─── Normal login ─────────────────────────────
    if not check_password(password, student.password):
        return JsonResponse({"error": "Invalid email or password"}, status=401)

    return JsonResponse({
        "message": "Login successful",
        "student_id": student.id,
        "email": student.email,
        "name": student.name,
        "first_time": False,
    }, status=200)




# students/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import Student, StudentVerificationRequest

@csrf_exempt
@require_GET
def check_email_exists(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    # 1️⃣ Check if student exists
    student_exists = Student.objects.filter(email=email).exists()
    
    # 2️⃣ Check if rejected
    rejected = StudentVerificationRequest.objects.filter(email=email, is_rejected=True).exists()
    
    if rejected:
        return JsonResponse({
            "status": "rejected",
            "message": "Your registration was rejected by admin."
        })

    if student_exists:
        # student exists but not rejected
        return JsonResponse({
            "status": "approved_or_pending",
            "next_step": "login"
        })
    else:
        # email not found
        return JsonResponse({
            "status": "not_registered",
            "next_step": "verification"
        })


# students/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from .models import Student, StudentVerificationRequest


@csrf_exempt
@require_GET
def check_verification_status(request):
    email = request.GET.get('email')
    
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)
    
    # Check if already registered
    if Student.objects.filter(email=email).exists():
        return JsonResponse({
            "status": "registered",
            "message": "Account already exists. Please login.",
            "next": "login"
        })

    # Check verification request
    verification = StudentVerificationRequest.objects.filter(email=email).first()
    
    if not verification:
        return JsonResponse({
            "status": "not_found",
            "message": "No verification request found for this email.",
            "next": "request-verification"
        })
    
    if verification.is_approved:
        return JsonResponse({
            "status": "approved",
            "message": "Your verification is approved! You can now register.",
            "next": "register"
        })
    else:
        return JsonResponse({
            "status": "pending",
            "message": "Your verification request is pending admin approval.",
            "next": "wait"
        })


    
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import Student, StudentVerificationRequest

@csrf_exempt
@require_GET
def smart_email_check(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    email = email.strip().lower()

    # 1. Already a real registered student?
    if Student.objects.filter(email=email).exists():
        return JsonResponse({
            "status": "registered",
            "message": "Account already exists. Please login.",
            "next": "login"
        })

    # 2. Check verification request
    verification = StudentVerificationRequest.objects.filter(email=email).first()

    if verification:
        if verification.is_approved == 1:          # approved
            return JsonResponse({
                "status": "approved",
                "message": "Your verification is approved! You can now register.",
                "next": "register"
            })
        else:                                      # 0 → pending
            return JsonResponse({
                "status": "pending",
                "message": "Your verification request is pending admin approval.",
                "next": "wait"
            })
    else:
        return JsonResponse({
            "status": "not_found",
            "message": "No verification request found. Please submit one.",
            "next": "verification"
        })

@csrf_exempt
@require_http_methods(["POST"])
def request_verification(request):
    try:
        data = json.loads(request.body)
        print("→ Received data:", data)  # ← very important!

        required_fields = ["email", "username", "department", "year", "contact"]
        missing = [f for f in required_fields if f not in data or not data[f]]
        if missing:
            print("Missing fields:", missing)
            return JsonResponse({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

        email = data["email"].strip().lower()

        if StudentVerificationRequest.objects.filter(email=email).exists():
            print(f"→ Already exists for {email}")
            return JsonResponse({"error": "Request already submitted for this email"}, status=400)

        # Create
        req = StudentVerificationRequest.objects.create(
            email=email,
            username=data["username"].strip(),
            department=data["department"].strip(),
            year=data["year"],
            contact=data["contact"].strip(),
            is_approved=False
        )
        print("→ SUCCESSFULLY CREATED →", req.id, req.email, req.is_approved)

        return JsonResponse({"message": "Request submitted successfully"}, status=201)

    except json.JSONDecodeError:
        print("→ Invalid JSON")
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        import traceback
        print("→ ERROR:", str(e))
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)





from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST, require_http_methods
import json

from .models import Internship, Student


# ─────────────────────────────────────────
# LIST INTERNSHIPS (BY EMAIL)
# ─────────────────────────────────────────
# students/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Student, Internship

@csrf_exempt
@require_GET
def get_internships(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse(
            {"error": "email is required"},
            status=400
        )

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return JsonResponse(
            {"error": "Student not found"},
            status=404
        )

    internships = Internship.objects.filter(student=student)

    data = []
    for i in internships:
        data.append({
            "id": i.id,
            "domain": i.domain,
            "company": i.company_name,   # 🔥 VERY IMPORTANT
            "start_date": i.start_date,
            "end_date": i.end_date,
            "description": i.description,
        })

    return JsonResponse(data, safe=False)



# ─────────────────────────────────────────
# ADD INTERNSHIP
# ─────────────────────────────────────────
@csrf_exempt
@require_POST
def add_internship(request):
    try:
        data = json.loads(request.body)

        email = data.get("email")
        domain = data.get("domain")
        company = data.get("company")
        start_date = data.get("start_date")

        if not all([email, domain, company, start_date]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        student = Student.objects.get(email=email)

        Internship.objects.create(
            student=student,
            domain=domain.strip(),
            company_name=company.strip(),
            start_date=start_date,
            end_date=data.get("end_date"),
            description=data.get("description", "").strip()
        )

        return JsonResponse({"message": "Internship added successfully"}, status=201)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ─────────────────────────────────────────
# EDIT INTERNSHIP
# ─────────────────────────────────────────
@csrf_exempt
@require_POST
def edit_internship(request, internship_id):
    try:
        data = json.loads(request.body)

        internship = Internship.objects.get(id=internship_id)

        internship.domain = data.get("domain", internship.domain)
        internship.company_name = data.get("company", internship.company_name)
        internship.start_date = data.get("start_date", internship.start_date)
        internship.end_date = data.get("end_date", internship.end_date)
        internship.description = data.get("description", internship.description)

        internship.save()

        return JsonResponse({"message": "Internship updated successfully"})

    except Internship.DoesNotExist:
        return JsonResponse({"error": "Internship not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ─────────────────────────────────────────
# DELETE INTERNSHIP
# ─────────────────────────────────────────
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_internship(request, internship_id):
    try:
        Internship.objects.get(id=internship_id).delete()
        return JsonResponse({"message": "Internship deleted"})
    except Internship.DoesNotExist:
        return JsonResponse({"error": "Internship not found"}, status=404)






import pandas as pd
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password
from .models import Student


@csrf_exempt
def process_excel(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    excel_file = request.FILES.get("excel")
    if not excel_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        df = pd.read_excel(excel_file)

        required_columns = [
            "UniversityRegNo",
            "Name",
            "UG/PG",
            "Department",
            "Programme",
            "Email",
            "Phone",
            "PassedOutYear"   # ✅ Changed here
        ]

        for col in required_columns:
            if col not in df.columns:
                return JsonResponse({"error": f"Missing column: {col}"}, status=400)

        for _, row in df.iterrows():
            reg_no = str(row["UniversityRegNo"]).strip()
            email = str(row["Email"]).strip() if pd.notna(row["Email"]) else None

            # ✅ Get Passed Out Year properly
            passed_out_year = (
                int(row["PassedOutYear"])
                if pd.notna(row["PassedOutYear"])
                else None
            )

            if not reg_no or not email:
                continue

            student, created = Student.objects.update_or_create(
                university_reg_no=reg_no,
                defaults={
                    "name": str(row["Name"]).strip(),
                    "ug_pg": str(row["UG/PG"]).strip(),
                    "department": str(row["Department"]).strip(),
                    "programme": str(row["Programme"]).strip(),
                    "email": email,
                    "phone": str(row["Phone"]).strip() if pd.notna(row["Phone"]) else None,
                    "password": make_password(reg_no),
                    "passed_out_year": passed_out_year,   # ✅ Added here
                }
            )

            # Send email
            try:
                send_mail(
                    subject="Your Student Account Created",
                    message=f"""
Hello {student.name},

Your student account has been created by your department coordinator.

Login credentials:
Username: {student.email}
Password: {reg_no}

Passed Out Year: {passed_out_year}

Please login and complete your profile.
""",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[student.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Email sending failed for {student.email}: {e}")

        return JsonResponse({
            "message": "Excel processed successfully! Students created/updated."
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


        

 # students/views.py
from django.http import JsonResponse
from .models import Student

def list_students(request):
    students = list(Student.objects.values(
        "university_reg_no", "name", "ug_pg", "department", "programme", "email", "phone"
    ))
    return JsonResponse({"students": students})
       

# students/views.py

# ... other imports ...

from companies.models import JobApplication   # ← CORRECT import
from .models import Student                   # keep this
# students/views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.shortcuts import get_object_or_404
import json
from .models import Student
from companies.models import Job, JobApplication   # ← important imports


@csrf_exempt
@require_POST
def apply_job(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        job_id = data.get("job_id")

        if not email or not job_id:
            return JsonResponse({"error": "email and job_id required"}, status=400)

        student = get_object_or_404(Student, email=email)
        job = get_object_or_404(Job, id=job_id, is_active=True)

        # ✅ 1️⃣ Check if already selected in 2 jobs
        selected_count = JobApplication.objects.filter(
          student=student,
         status__iexact="selected"
        ).count()
        if selected_count >= 2:
            return JsonResponse({
                "error": "You are already selected in 2 jobs. You cannot apply further."
            }, status=400)

        # ✅ 2️⃣ Prevent duplicate application
        if JobApplication.objects.filter(student=student, job=job).exists():
            return JsonResponse({
                "error": "You have already applied to this job"
            }, status=400)

        # ✅ 3️⃣ Create application
        JobApplication.objects.create(
            student=student,
            job=job,
            cover_letter=data.get("cover_letter", ""),
            status="Applied"  # important if you use status field
        )

        return JsonResponse({"message": "Application submitted successfully"}, status=201)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except Job.DoesNotExist:
        return JsonResponse({"error": "Job not found or inactive"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




@csrf_exempt
@require_GET
def get_my_applications(request):
    email = request.GET.get('email')
    if not email:
        return JsonResponse({"error": "email is required"}, status=400)

    try:
        student = Student.objects.get(email=email)
        applications = JobApplication.objects.filter(student=student).select_related('job')

        data = []
        for app in applications:
            job = app.job
            company_name = "Unknown Company"
            if job and hasattr(job, 'company') and job.company:
                company_name = getattr(job.company, 'name', str(job.company))

            # Try to get the date field safely
            applied_date = "N/A"
            date_field_name = None
            for field in ['applied_at', 'created_at', 'created', 'date_applied', 'timestamp']:
                if hasattr(app, field):
                    value = getattr(app, field)
                    if value:
                        applied_date = value.strftime("%Y-%m-%d")
                        date_field_name = field
                        break

            entry = {
                "job_id": job.id if job else None,
                "job_title": getattr(job, 'title', 'Untitled Job') if job else 'No Job',
                "company": company_name,
                "applied_at": applied_date,
                "status": getattr(app, 'status', 'Pending'),
                "cover_letter": getattr(app, 'cover_letter', '') or "",
            }
            data.append(entry)

        return JsonResponse({"applications": data}, status=200)

    except Student.DoesNotExist:
        return JsonResponse({"applications": []}, status=200)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)






from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from .models import Student

# views.py
@csrf_exempt
@require_GET
def list_students_by_department(request):
    department = request.GET.get("department")

    if not department:
        return JsonResponse({"error": "Department is required"}, status=400)

    # Match students whose department contains the given department
    students = Student.objects.filter(department__icontains=department.strip())

    data = []
    for s in students:
        data.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "department": s.department,
            "programme": s.programme,
            "ug_pg": s.ug_pg,
            "university_reg_no": s.university_reg_no,
            "phone": s.phone,
            "passed_out_year": s.passed_out_year
        })

    return JsonResponse({"students": data})

# students/views.py
from django.http import JsonResponse
from students.models import Student
from django.views.decorators.http import require_GET

@require_GET
def get_graduation_years(request):
    # Get distinct graduation years from Student table, excluding None
    years = Student.objects.values_list('passed_out_year', flat=True).exclude(passed_out_year__isnull=True).distinct()
    
    years = sorted(years, reverse=True)  # newest first
    return JsonResponse({"years": list(years)})





from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
from django.core.mail import send_mail
from django.conf import settings
from .models import Student
from django.contrib.auth.hashers import make_password
@csrf_exempt
@require_POST
def add_student(request):
    try:
        data = json.loads(request.body)

        # ✅ Validate required fields
        required_fields = [
            "university_reg_no",
            "name",
            "ug_pg",
            "department",
            "programme",
            "email",
            "phone",
            "passed_out_year",
        ]

        for field in required_fields:
            if not data.get(field):
                return JsonResponse({"error": f"{field} is required"}, status=400)

        # ✅ Prevent duplicate registration number
        if Student.objects.filter(
            university_reg_no=data["university_reg_no"].strip()
        ).exists():
            return JsonResponse(
                {"error": "Student with this Register Number already exists"},
                status=400,
            )

        student = Student.objects.create(
            university_reg_no=data["university_reg_no"].strip(),
            name=data["name"].strip(),
            ug_pg=data["ug_pg"].strip(),
            department=data["department"].strip(),
            programme=data["programme"].strip(),
            email=data["email"].strip(),
            phone=data["phone"].strip(),
            passed_out_year=int(data["passed_out_year"]),
            password=make_password(data["university_reg_no"].strip()),
        )

        # ✅ Send email
        try:
            send_mail(
                subject="Student Account Created",
                message=f"""
Hello {student.name},

Your student account has been created.

Login credentials:
Username: {student.email}
Password: {data['university_reg_no']}

Please login and update your profile.
""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.email],
                fail_silently=False,
            )
        except Exception as mail_error:
            print("Email failed:", mail_error)

        return JsonResponse(
            {"message": "Student added successfully", "id": student.id},
            status=201,
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)






from django.http import HttpResponse, FileResponse
from django.shortcuts import get_object_or_404
from .models import Student, Resume

def preview_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id)
    if not resume.resume_file:
        return HttpResponse("No resume file", status=404)
    
    response = FileResponse(
        resume.resume_file.open('rb'),
        content_type='application/pdf',
        as_attachment=False  # ← this is key: inline = preview
    )
    response['Content-Disposition'] = 'inline; filename="resume.pdf"'
    return response       



@csrf_exempt
@require_POST
def add_project(request):
    try:
        data = json.loads(request.body)

        email = data.get("email")
        title = data.get("title")

        if not email or not title:
            return JsonResponse({"error": "Email and title required"}, status=400)

        student = Student.objects.get(email=email)

        Project.objects.create(
            student=student,
            title=title.strip(),
            description=data.get("description", "").strip(),
            technologies=data.get("technologies", "").strip(),
            github_link=data.get("github_link"),
            live_link=data.get("live_link"),
        )

        return JsonResponse({"message": "Project added successfully"}, status=201)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def edit_project(request, project_id):
    try:
        data = json.loads(request.body)
        project = Project.objects.get(id=project_id)

        project.title = data.get("title", project.title)
        project.description = data.get("description", project.description)
        project.technologies = data.get("technologies", project.technologies)
        project.github_link = data.get("github_link", project.github_link)
        project.live_link = data.get("live_link", project.live_link)

        project.save()

        return JsonResponse({"message": "Project updated successfully"})

    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found"}, status=404)

from django.shortcuts import get_object_or_404
from .models import (
    Student,
    StudentProfile,
    Education,
    Skill,
    Certificate,
    Resume,
    PasswordResetOTP,
    Project   # ← ADD THIS
)


@require_GET
def get_projects(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    projects = Project.objects.filter(student=student)

    return JsonResponse({
        "projects": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "technologies": p.technologies
            }
            for p in projects
        ]
    })




@csrf_exempt
@require_http_methods(["DELETE"])
def delete_project(request, project_id):
    try:
        Project.objects.get(id=project_id).delete()
        return JsonResponse({"message": "Project deleted"})
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found"}, status=404)



from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json
from .models import Student, SocialLinks        

@csrf_exempt
@require_POST
def save_social_links(request):
    try:
        data = json.loads(request.body)

        email = data.get("email")
        if not email:
            return JsonResponse({"error": "Email required"}, status=400)

        student = Student.objects.get(email=email)

        social, created = SocialLinks.objects.get_or_create(student=student)

        social.github = data.get("github")
        social.linkedin = data.get("linkedin")
        social.portfolio = data.get("portfolio")
        social.twitter = data.get("twitter")
        social.save()

        return JsonResponse({"message": "Social links saved successfully"})

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_GET
def get_social_links(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"error": "Email required"}, status=400)

    try:
        student = Student.objects.get(email=email.strip().lower())
        social = SocialLinks.objects.filter(student=student).first()

        if not social:
            return JsonResponse({
                "github": "",
                "linkedin": "",
                "portfolio": "",
                "twitter": ""
            }, status=200)

        return JsonResponse({
            "github": social.github or "",
            "linkedin": social.linkedin or "",
            "portfolio": social.portfolio or "",
            "twitter": social.twitter or ""
        }, status=200)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": "Server error", "detail": str(e)}, status=500)



# ─────────────────────────────────────────
# EDIT STUDENT (Coordinator)
# ─────────────────────────────────────────
@csrf_exempt
@require_POST
def edit_student(request, student_id):
    try:
        data = json.loads(request.body)

        student = get_object_or_404(Student, id=student_id)

        # Update fields safely
        student.university_reg_no = data.get("university_reg_no", student.university_reg_no).strip()
        student.name = data.get("name", student.name).strip()
        student.ug_pg = data.get("ug_pg", student.ug_pg).strip()
        student.department = data.get("department", student.department).strip()
        student.programme = data.get("programme", student.programme).strip()
        student.email = data.get("email", student.email).strip()
        student.phone = data.get("phone", student.phone)

        # Passed out year (convert safely)
        if data.get("passed_out_year"):
            student.passed_out_year = int(data["passed_out_year"])

        student.save()

        return JsonResponse({
            "message": "Student updated successfully"
        }, status=200)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)





 # ─────────────────────────────────────────
# DELETE STUDENT (Coordinator)
# ─────────────────────────────────────────
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_student(request, student_id):
    try:
        student = get_object_or_404(Student, id=student_id)
        student.delete()

        return JsonResponse({
            "message": "Student deleted successfully"
        }, status=200)

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)     


from django.http import JsonResponse
from students.models import Student
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def student_detail(request, university_reg_no):
    try:
        student = Student.objects.get(university_reg_no=university_reg_no)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    if request.method == "GET":
        # Return all relevant fields
        return JsonResponse({
            "university_reg_no": student.university_reg_no,
            "name": student.name,
            "email": student.email,
            "department": student.department,
            "programme": student.programme,
            "phone": student.phone,
            "passed_out_year": student.passed_out_year,
        })

    if request.method == "PUT":
        data = json.loads(request.body)
        student.name = data.get("name", student.name)
        student.email = data.get("email", student.email)
        student.department = data.get("department", student.department)
        student.programme = data.get("programme", student.programme)
        student.phone = data.get("phone", student.phone)
        student.passed_out_year = data.get("passed_out_year", student.passed_out_year)
        student.save()
        return JsonResponse({"message": "Student updated successfully"})

    if request.method == "DELETE":
        student.delete()
        return JsonResponse({"message": "Student deleted successfully"})






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

                # 🔥 THIS LINE FIXES EVERYTHING
                "date": timezone.localtime(msg.created_at)
                        .strftime("%Y-%m-%d %H:%M"),
            }
            for msg in messages
        ]

        return JsonResponse({"messages": data})

    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)




@require_GET
def list_programmes(request):
    students = (
        Student.objects
        .exclude(programme__isnull=True)
        .exclude(programme__exact="")
        .values("programme", "department")
        .distinct()
    )

    programmes = [
        {
            "name": s["programme"],
            "department": s["department"]
        }
        for s in students
    ]

    return JsonResponse({"programmes": programmes})



from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from admin_app.models import Announcement
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from admin_app.models import Announcement
@require_GET
def get_announcements(request):
    # Get student info from React params
    dept = request.GET.get("department")
    prog = request.GET.get("programme")
    batch = request.GET.get("batch")

    # Filter for active student announcements
    announcements = Announcement.objects.filter(
        is_active=True, 
        target_type="student"
    ).filter(
        # CONDITION: (Is Global) OR (Matches Dept) OR (Matches Prog) OR (Matches Batch)
        Q(department__isnull=True) | Q(department="") |
        Q(department__iexact=dept) |
        Q(programme__iexact=prog) |
        Q(batch=batch)
    ).distinct().order_by('-created_at')

    return JsonResponse({
        "announcements": [
            {
                "id": a.id,
                "title": a.title,
                "message": a.message,
                "important": a.important,
                "department": a.department,
                "programme": a.programme,
                "batch": a.batch,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M"),
                "created_by": a.created_by.username if a.created_by else "Admin",
            }
            for a in announcements
        ]
    })