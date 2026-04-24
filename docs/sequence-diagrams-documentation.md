# ICMS - Sequence Diagrams Documentation

## Internship and Career Management System

---

## Table of Contents

1. [Login Sequence Diagram](#1-login-sequence-diagram)
2. [Apply for Internship Sequence Diagram](#2-apply-for-internship-sequence-diagram)
3. [Technical Reference](#3-technical-reference)

---

## 1. Login Sequence Diagram

### 1.1 Overview

The login sequence describes how users authenticate into the ICMS system. The system supports role-based authentication where each user role is redirected to their specific dashboard after successful login.

### 1.2 Participants

| Participant | Type | Description |
|-------------|------|-------------|
| User | Actor | Any user attempting to login |
| ICMS (Welcome Page) | Page | Main welcome/landing page |
| Login Page (login.tsx) | React Component | Login form page |
| Login Form | UI Component | Form with email, password fields |
| AuthenticatedSessionController | Laravel Controller | Handles authentication logic |
| Database (users) | Database | Users table storage |

### 1.3 ASCII Sequence Diagram

```
    User          ICMS       Login Page    Login Form    Controller      Database
     │             │             │             │             │              │
     │  Start()    │             │             │             │              │
     │────────────>│             │             │             │              │
     │             │  Display()  │             │             │              │
     │             │────────────>│             │             │              │
     │             │             │             │             │              │
     │<─────────────────────────────────────────────────────│              │
     │    Show Login Form (Email, Password, Remember me)    │              │
     │             │             │             │             │              │
     │  Enter email and password │             │             │              │
     │────────────────────────────────────────>│             │              │
     │             │             │             │             │              │
     │  Click "Log in" button()  │             │             │              │
     │────────────────────────────────────────>│             │              │
     │             │             │             │             │              │
     │             │             │             │ POST /login │              │
     │             │             │             │────────────>│              │
     │             │             │             │             │              │
     │             │             │             │             │  Query user  │
     │             │             │             │             │─────────────>│
     │             │             │             │             │              │
     │             │             │             │             │<─────────────│
     │             │             │             │             │  User record │
     │             │             │             │             │              │
     │             │             │             │             │   verify()   │
     │             │             │             │             │──────┐       │
     │             │             │             │             │      │       │
     │             │             │             │             │<─────┘       │
     │             │             │             │             │              │
    ─┴─           ─┴─           ─┴─           ─┴─           ─┴─            ─┴─
   [IF INVALID CREDENTIALS]
     │             │             │             │             │              │
     │             │             │             │<────────────│              │
     │             │             │             │ Invalid     │              │
     │<────────────────────────────────────────│             │              │
     │  Display error: "The provided credentials do not     │              │
     │                  match our records"                  │              │
    ─┴─           ─┴─           ─┴─           ─┴─           ─┴─            ─┴─
   [IF VALID CREDENTIALS]
     │             │             │             │             │              │
     │             │             │             │             │  Check status│
     │             │             │             │             │─────────────>│
     │             │             │             │             │<─────────────│
     │             │             │             │             │              │
     │             │             │             │<────────────│              │
     │             │             │             │  response() │              │
     │<────────────────────────────────────────│ Redirect    │              │
     │  display() - Redirect to Dashboard by role           │              │
     │             │             │             │             │              │
```

### 1.4 Flow Description

#### Main Flow (Successful Login)

| Step | From | To | Action | Route/Method |
|------|------|-----|--------|--------------|
| 1 | User | ICMS | Access the system | GET / |
| 2 | ICMS | Login Page | Redirect to login | GET /login |
| 3 | Login Page | User | Display login form | - |
| 4 | User | Login Form | Enter email, password | - |
| 5 | User | Login Form | Click "Log in" button | - |
| 6 | Login Form | Controller | Submit credentials | POST /login |
| 7 | Controller | Database | Query user by email | SELECT * FROM users WHERE email = ? |
| 8 | Controller | Controller | Verify password hash | Hash::check() |
| 9 | Controller | Controller | Check user status | status === 'active' |
| 10 | Controller | Dashboard | Redirect based on role | redirect()->intended() |

#### Alternative Flow (Invalid Credentials)

| Step | From | To | Action |
|------|------|-----|--------|
| 7a | Database | Controller | User not found OR password mismatch |
| 8a | Controller | Login Page | Return error message |
| 9a | Login Page | User | Display "The provided credentials do not match our records" |

#### Alternative Flow (Account Inactive)

| Step | From | To | Action |
|------|------|-----|--------|
| 9b | Controller | Controller | Detect status = 'inactive' |
| 10b | Controller | Login Page | Logout and return error |
| 11b | Login Page | User | Display "Your account has been deactivated" |

### 1.5 Role-Based Redirects

| User Role | Redirect Route | Dashboard |
|-----------|---------------|-----------|
| student | /student | Student Dashboard |
| company_admin | /companyadmin | Company Admin Dashboard |
| supervisor | /company-supervisor | Supervisor Dashboard |
| dept_head | /department-head | Department Head Dashboard |
| advisor | /faculty-advisor | Faculty Advisor Dashboard |
| coordinator | /dashboard | Coordinator Dashboard |
| admin | /dashboard | Admin Dashboard |

### 1.6 Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Email | email | Yes | Valid email format |
| Password | password | Yes | String, not empty |
| Remember me | checkbox | No | Boolean |

### 1.7 Error Messages

| Error Code | Message | Condition |
|------------|---------|-----------|
| AUTH_001 | "The provided credentials do not match our records" | Invalid email or password |
| AUTH_002 | "Your account has been deactivated" | User status = 'inactive' |
| AUTH_003 | "Your account is suspended" | User status = 'suspended' |

---

## 2. Apply for Internship Sequence Diagram

### 2.1 Overview

This sequence describes how a student applies for an internship posting. The key requirement is that the student must have an Application Letter from the university coordinator before they can apply.

### 2.2 Participants

| Participant | Type | Description |
|-------------|------|-------------|
| Student (Job Seeker) | Actor | Authenticated student user |
| ICMS | System | Main application system |
| Postings Page (postings.tsx) | React Component | Browse postings page |
| Posting View (posting-view.tsx) | React Component | Single posting detail page |
| Application Form | UI Component | Form for submitting application |
| StudentController | Laravel Controller | Handles student actions |
| Database | Database | postings, applications, application_letters tables |

### 2.3 ASCII Sequence Diagram

```
  Student       ICMS      Postings     Posting      App Form    Controller    Database
     │           │          Page        View           │            │            │
     │  Start()  │           │           │             │            │            │
     │──────────>│           │           │             │            │            │
     │           │ Display() │           │             │            │            │
     │           │──────────>│           │             │            │            │
     │           │           │           │             │            │            │
     │           │           │  GET /student/postings  │            │            │
     │           │           │─────────────────────────────────────>│            │
     │           │           │           │             │            │            │
     │           │           │           │             │            │  Query     │
     │           │           │           │             │            │───────────>│
     │           │           │           │             │            │<───────────│
     │           │           │           │             │            │  Postings  │
     │           │           │<─────────────────────────────────────│            │
     │<──────────────────────│           │             │            │            │
     │  Display postings list (Title, Company, Location, Deadline) │            │
     │           │           │           │             │            │            │
     │  Click "View" button()│           │             │            │            │
     │──────────────────────>│           │             │            │            │
     │           │           │           │             │            │            │
     │           │           │  Navigate │             │            │            │
     │           │           │──────────>│             │            │            │
     │           │           │           │             │            │            │
     │           │           │           │  GET /student/postings/{id}          │
     │           │           │           │─────────────────────────>│            │
     │           │           │           │             │            │            │
     │           │           │           │             │            │  Query     │
     │           │           │           │             │            │  posting   │
     │           │           │           │             │            │───────────>│
     │           │           │           │             │            │<───────────│
     │           │           │           │             │            │            │
     │           │           │           │             │            │  Check     │
     │           │           │           │             │            │  app letter│
     │           │           │           │             │            │───────────>│
     │           │           │           │             │            │<───────────│
     │           │           │           │<────────────────────────│            │
     │           │           │           │             │            │            │
    ─┴─         ─┴─         ─┴─         ─┴─           ─┴─          ─┴─          ─┴─
   [IF NO APPLICATION LETTER]
     │           │           │           │             │            │            │
     │<──────────────────────────────────│             │            │            │
     │  Display: "Application Letter Required"        │            │            │
     │  Buttons: "Check Application Letter Status"    │            │            │
     │           "Update Profile"                     │            │            │
    ─┴─         ─┴─         ─┴─         ─┴─           ─┴─          ─┴─          ─┴─
   [IF HAS APPLICATION LETTER]
     │           │           │           │             │            │            │
     │           │           │           │  Display()  │            │            │
     │           │           │           │────────────>│            │            │
     │<──────────────────────────────────────────────│            │            │
     │  Show Application Form:                        │            │            │
     │  - Resume (required, PDF, max 2MB)             │            │            │
     │  - Cover Letter (optional)                     │            │            │
     │  - Portfolio URL                               │            │            │
     │  - Skills, Certifications                      │            │            │
     │           │           │           │             │            │            │
     │  Fill information details()       │             │            │            │
     │──────────────────────────────────────────────>│            │            │
     │           │           │           │             │            │            │
     │  Click "Apply Now" button()       │             │            │            │
     │──────────────────────────────────────────────>│            │            │
     │           │           │           │             │            │            │
     │           │           │           │             │ POST /apply│            │
     │           │           │           │             │───────────>│            │
     │           │           │           │             │            │            │
     │           │           │           │             │            │ Validate() │
     │           │           │           │             │            │───────────>│
     │           │           │           │             │            │<───────────│
     │           │           │           │             │            │            │
    ─┴─         ─┴─         ─┴─         ─┴─           ─┴─          ─┴─          ─┴─
   [IF VALIDATION FAILED]
     │           │           │           │             │            │            │
     │           │           │           │             │<───────────│            │
     │           │           │           │             │ Error      │            │
     │<──────────────────────────────────────────────│            │            │
     │  Display error: "Invalid format" or "Deadline passed"      │            │
    ─┴─         ─┴─         ─┴─         ─┴─           ─┴─          ─┴─          ─┴─
   [IF VALIDATION PASSED]
     │           │           │           │             │            │            │
     │           │           │           │             │            │  Store()   │
     │           │           │           │             │            │  INSERT    │
     │           │           │           │             │            │───────────>│
     │           │           │           │             │            │<───────────│
     │           │           │           │             │            │ Response() │
     │           │           │           │             │            │            │
     │           │           │           │             │            │  Notify    │
     │           │           │           │             │            │  company   │
     │           │           │           │             │<───────────│            │
     │           │           │           │             │ Success    │            │
     │<──────────────────────────────────────────────│            │            │
     │  Display: "Application submitted successfully"  │            │            │
     │           │           │           │             │            │            │
```

### 2.4 Flow Description

#### Main Flow (Successful Application)

| Step | From | To | Action | Route/Method |
|------|------|-----|--------|--------------|
| 1 | Student | ICMS | Start the system | - |
| 2 | ICMS | Postings Page | Display postings page | GET /student/postings |
| 3 | Postings Page | Controller | Request postings | StudentController@postings |
| 4 | Controller | Database | Query open postings | SELECT * FROM postings WHERE status='open' |
| 5 | Postings Page | Student | Display postings list | - |
| 6 | Student | Postings Page | Click "View" button | - |
| 7 | Postings Page | Posting View | Navigate to detail | GET /student/postings/{id} |
| 8 | Posting View | Controller | Request posting detail | StudentController@postingView |
| 9 | Controller | Database | Check application letter | SELECT * FROM application_letters WHERE student_id=? AND status='sent' |
| 10 | Posting View | Student | Display application form | - |
| 11 | Student | App Form | Fill details | - |
| 12 | Student | App Form | Click "Apply Now" | - |
| 13 | App Form | Controller | Submit application | POST /student/postings/apply |
| 14 | Controller | Database | Validate & Store | INSERT INTO applications |
| 15 | Controller | NotificationService | Notify company admin | notifyCompanyAdminNewApplication() |
| 16 | Controller | Student | Redirect with success | redirect('/student/applications') |

#### Alternative Flow (No Application Letter)

| Step | From | To | Action |
|------|------|-----|--------|
| 9a | Database | Controller | No application letter found |
| 10a | Posting View | Student | Display "Application Letter Required" message |
| 11a | Student | - | Options: "Check Application Letter Status" or "Update Profile" |

#### Alternative Flow (Validation Failed)

| Step | From | To | Action |
|------|------|-----|--------|
| 14a | Controller | Controller | Validation fails (deadline, GPA, duplicate) |
| 15a | Controller | App Form | Return error message |
| 16a | App Form | Student | Display specific error |

### 2.5 Form Fields

| Field | Type | Required | Validation | Max Size |
|-------|------|----------|------------|----------|
| Resume | file (PDF) | Yes | PDF format only | 2MB |
| Cover Letter | file (PDF) | No | PDF format only | 2MB |
| Portfolio URL | text (URL) | No | Valid URL format | 255 chars |
| Skills | array | No | Array of strings | 10 items |
| Certifications | array | No | Array of strings | 10 items |

### 2.6 Validation Rules

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Application Letter | Must exist with status='sent' | "You must have an application letter from your university coordinator" |
| Deadline | application_deadline >= today | "The application deadline for this posting has passed" |
| Duplicate | No existing application for same posting | "You have already applied to this posting" |
| GPA | student.cgpa >= posting.min_gpa | "Your CGPA does not meet the minimum requirement" |
| Resume | Required, PDF, max 2MB | "Resume is required and must be a PDF file" |

### 2.7 Database Tables Involved

| Table | Operations | Fields Used |
|-------|------------|-------------|
| postings | SELECT | posting_id, title, status, application_deadline, min_gpa |
| students | SELECT | student_id, user_id, cgpa |
| application_letters | SELECT | student_id, status |
| applications | SELECT, INSERT | student_id, posting_id, resume, status, submitted_at |

---

## 3. Technical Reference

### 3.1 Controllers

| Controller | Method | Route | Description |
|------------|--------|-------|-------------|
| AuthenticatedSessionController | create() | GET /login | Display login form |
| AuthenticatedSessionController | store() | POST /login | Process login |
| AuthenticatedSessionController | destroy() | POST /logout | Process logout |
| StudentController | postings() | GET /student/postings | List postings |
| StudentController | postingView() | GET /student/postings/{id} | View posting detail |
| StudentController | applyPosting() | POST /student/postings/apply | Submit application |

### 3.2 Frontend Pages

| Page | File Path | Description |
|------|-----------|-------------|
| Login | resources/js/pages/auth/login.tsx | Login form page |
| Browse Postings | resources/js/pages/student/postings.tsx | List of available postings |
| Posting View | resources/js/pages/student/posting-view.tsx | Posting detail with application form |
| Applications | resources/js/pages/student/applications.tsx | Student's applications list |

### 3.3 Button Actions

| Button | Page | Action |
|--------|------|--------|
| "Log in" | Login Page | Submit login form |
| "Forgot password?" | Login Page | Navigate to password reset |
| "View" | Postings Page | Navigate to posting detail |
| "Apply" | Postings Page | Navigate to posting detail |
| "Apply Now" | Posting View | Submit application form |
| "Back to Postings" | Posting View | Navigate back to postings list |
| "Check Application Letter Status" | Posting View | Navigate to /student/application-letter |

### 3.4 Status Values

#### Application Status
- `pending` - Application submitted, awaiting review
- `under_review` - Company is reviewing
- `shortlisted` - Candidate shortlisted
- `accepted` - Offer extended
- `rejected` - Application rejected
- `approved` - Student accepted offer
- `completed` - Internship completed

#### Application Letter Status
- `pending` - Requested, not yet sent
- `sent` - Letter sent to student
- `rejected` - Request rejected

---

## PlantUML Files

The diagrams are available as PlantUML files in:
- `docs/diagrams/sequence-diagrams/login-sequence.puml`
- `docs/diagrams/sequence-diagrams/apply-internship-sequence.puml`

To view these diagrams:
1. **VS Code**: Install "PlantUML" extension
2. **Online**: Paste content at https://www.plantuml.com/plantuml/uml
3. **IntelliJ**: Built-in PlantUML support

---

*Document Version: 1.0*
*Last Updated: January 2026*
*System: ICMS - Internship and Career Management System*

