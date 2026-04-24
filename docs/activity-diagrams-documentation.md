# ICMS - Activity Diagrams Documentation

## Internship and Career Management System

---

## Table of Contents

1. [Login Activity Diagram](#1-login-activity-diagram)
2. [Apply for Internship Activity Diagram](#2-apply-for-internship-activity-diagram)
3. [View Notification Activity Diagram](#3-view-notification-activity-diagram)
4. [Technical Reference](#4-technical-reference)

---

## 1. Login Activity Diagram

### 1.1 Overview

The login activity diagram shows the workflow for user authentication in the ICMS system. It covers the complete flow from accessing the login page to being redirected to the role-specific dashboard.

### 1.2 ASCII Activity Diagram

```
                    ┌─────────────┐
                    │ idle state  │ ← Initial State
                    └──────┬──────┘
                           │ Activate
                           ▼
                    ┌─────────────┐
                    │ Start ICMS  │
                    └──────┬──────┘
                           │ Select
                           ▼
                    ┌─────────────┐
                    │ login page  │
                    └──────┬──────┘
                           │ Fill
                           ▼
                    ┌─────────────┐
                    │ Login form  │
                    └──────┬──────┘
                           │
                           ▼
                         ◆───────────────────┐
                    Incorrect               Correct
                         │                    │
            ┌────────────┘                    ▼
            │                          ┌──────────────┐
            │                          │Confirm Login │
            ▼                          └──────┬───────┘
     ┌─────────────┐                          │
     │ Login form  │←─────────────┐           ▼
     └─────────────┘               │    ┌──────────────────┐
                                   │    │Display Home page │
                                   │    └──────┬───────────┘
                                   │           │
                              Retry            ▼
                                        ┌─────────────┐
                                        │  Log out    │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Final state │
                                        └─────────────┘
```

### 1.3 Flow Description

| Step | State/Action | Description | Route |
|------|--------------|-------------|-------|
| 1 | idle state | User is not logged in | - |
| 2 | Start ICMS | User accesses the system | GET / |
| 3 | login page | Display login form | GET /login |
| 4 | Login form | User enters email, password | - |
| 5 | verify | System validates credentials | POST /login |
| 6a | Incorrect | Invalid credentials | - |
| 6b | Correct | Valid credentials | - |
| 7 | Confirm Login | Create session, check role | - |
| 8 | Display Home page | Redirect to dashboard | Role-based URL |
| 9 | Log out | User clicks logout | POST /logout |
| 10 | Final state | Session destroyed | GET / |

### 1.4 Form Elements

| Element | Type | Required | Validation |
|---------|------|----------|------------|
| Email | input[email] | Yes | Valid email format |
| Password | input[password] | Yes | Not empty |
| Remember me | checkbox | No | Boolean |
| "Log in" | button | - | Submit form |
| "Forgot password?" | link | - | Navigate to /forgot-password |

### 1.5 Role-Based Redirects

| Role | Dashboard Route | Page |
|------|----------------|------|
| student | /student | Student Dashboard |
| company_admin | /companyadmin | Company Admin Dashboard |
| supervisor | /company-supervisor | Supervisor Dashboard |
| dept_head | /department-head | Department Head Dashboard |
| advisor | /faculty-advisor | Faculty Advisor Dashboard |
| coordinator | /dashboard | Coordinator Dashboard |
| admin | /dashboard | Admin Dashboard |

---

## 2. Apply for Internship Activity Diagram

### 2.1 Overview

The apply for internship activity diagram shows the complete workflow for a student applying to an internship posting. It includes authentication check, application letter verification, form validation, and submission.

### 2.2 ASCII Activity Diagram

```
                    ○ ← Initial State
                    │
                    ▼
            ┌──────────────┐
            │  start ICM   │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────────┐
            │ internship page  │
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────┐
            │  Login Page  │ ◄─────────────────────┐
            └──────┬───────┘                       │
                   │                               │
       Insert username and password                │
                   │                               │
                   ▼                               │
            ◆─────────────────────────────┐       │
    Invalid username                     Valid    │
    and password                           │      │
         │                                 │      │
         └─────────────────────────────────┼──────┘
                                           │
                                           ▼
                                   ┌───────────────────┐
                                   │  apply form page  │ ◄──────────┐
                                   └──────┬────────────┘            │
                                          │                         │
                             Fill information detail                │
                                          │                         │
                                          ▼                         │
                                    ◆─────────────┐                │
                            Invalid format       Valid format      │
                                    │                 │             │
                                    └─────────────────┼─────────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────┐
                                           │ display successful  │
                                           │     message         │
                                           └──────────┬──────────┘
                                                      │
                                                      ▼
                                                      ○ ← Final State
```

### 2.3 Flow Description

| Step | State/Action | Description | Route |
|------|--------------|-------------|-------|
| 1 | start ICMS | Student accesses system | - |
| 2 | internship page | Browse postings | GET /student/postings |
| 3 | Login Page | Authenticate if needed | GET /login |
| 4 | verify credentials | Check email/password | POST /login |
| 5a | Invalid | Show error, retry | - |
| 5b | Valid | Redirect to postings | - |
| 6 | apply form page | View posting detail | GET /student/postings/{id} |
| 7 | Check application letter | Verify letter exists | - |
| 8a | No letter | Show error message | - |
| 8b | Has letter | Show application form | - |
| 9 | Fill information | Enter resume, skills | - |
| 10 | Validate | Check form data | POST /student/postings/apply |
| 11a | Invalid format | Show validation errors | - |
| 11b | Valid format | Store application | - |
| 12 | successful message | "Application submitted" | - |

### 2.4 Pre-requisites

Before a student can apply:
1. **Must be logged in** - Student role required
2. **Must have Application Letter** - Status must be 'sent'
3. **Posting must be open** - Status = 'open'
4. **Deadline not passed** - application_deadline >= today

### 2.5 Form Elements

| Element | Type | Required | Validation | Max Size |
|---------|------|----------|------------|----------|
| Resume | file input | Yes | PDF only | 2MB |
| Cover Letter | file input | No | PDF only | 2MB |
| Portfolio URL | text input | No | Valid URL | 255 chars |
| Skills | tag input | No | Array | 10 items |
| Certifications | text input | No | Comma-separated | 10 items |
| "Apply Now" | button | - | Submit form | - |

### 2.6 Validation Errors

| Error | Condition | Message |
|-------|-----------|---------|
| No application letter | application_letter.status != 'sent' | "You must have an application letter from your university coordinator" |
| Deadline passed | posting.deadline < today | "The application deadline for this posting has passed" |
| Already applied | existing application | "You have already applied to this posting" |
| GPA not met | student.cgpa < posting.min_gpa | "Your CGPA does not meet the minimum requirement" |
| Invalid resume | Not PDF or > 2MB | "Resume must be a PDF file under 2MB" |

---

## 3. View Notification Activity Diagram

### 3.1 Overview

The notification activity diagram shows how users view and interact with system notifications. This includes checking for new notifications, viewing the notification list, and marking notifications as read.

### 3.2 ASCII Activity Diagram

```
                        ● ← Initial State
                        │
                        ▼
                ┌───────────────┐
                │ initiate file │ (Click notification bell)
                └───────┬───────┘
                        │
                        ▼
              ◆─────────────────────────┐
      No file                      File is Exist
   check it again                       │
         │                              ▼
         │                    ┌──────────────────┐
         │                    │ Notify the user  │
         └───────────────────►└────────┬─────────┘
                                       │
                                       ▼
                             ┌─────────────────────────┐
                             │ display prepared        │
                             │ notification file list  │
                             └────────┬────────────────┘
                                      │
                                      ▼
                         ◆────────────────────────┐
                No file notification        Yes/click on
                         │               File notification
                         │                        │
                         ▼                        ▼
                   ┌───────────┐       ┌─────────────────────┐
                   │  ◉        │       │ display file        │
                   │Final State│       │ notification detail │
                   └───────────┘       └─────────┬───────────┘
                                                 │
                                                 ▼
                                       ┌──────────────────┐
                                       │  download file   │
                                       │ (navigate to URL)│
                                       └─────────┬────────┘
                                                 │
                                                 ▼
                                           ┌───────────┐
                                           │  ◉        │
                                           │Final State│
                                           └───────────┘
```

### 3.3 Flow Description

| Step | State/Action | Description | Route |
|------|--------------|-------------|-------|
| 1 | initiate file | User clicks notification icon | - |
| 2 | Check notifications | Query user notifications | GET /api/notifications |
| 3a | No file | No notifications found | - |
| 3b | File exists | Notifications available | - |
| 4 | Notify user | Update badge count | - |
| 5 | display list | Show notification list | - |
| 6a | No notification | Show empty state | - |
| 6b | Click notification | Select notification | - |
| 7 | display detail | Show full notification | - |
| 8 | Mark as read | Update read status | POST /api/notifications/{id}/read |
| 9 | Navigate | Go to action URL | Varies |

### 3.4 Notification Types

| Type | Icon | Description | Action URL Example |
|------|------|-------------|-------------------|
| application_submitted | 📄 | New application received | /companyadmin/applications/{id} |
| application_accepted | ✅ | Application accepted | /student/applications/{id} |
| application_rejected | ❌ | Application rejected | /student/applications/{id} |
| new_posting | 💼 | New posting available | /student/postings/{id} |
| form_submitted | 📝 | Form needs review | /faculty-advisor/forms/{id} |
| message_received | 💬 | New message | /chat/thread/{id} |

### 3.5 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get all user notifications |
| POST | /api/notifications/{id}/read | Mark notification as read |
| POST | /api/notifications/mark-all-read | Mark all as read |

---

## 4. Technical Reference

### 4.1 Controllers

| Controller | Method | Description |
|------------|--------|-------------|
| AuthenticatedSessionController | create() | Display login form |
| AuthenticatedSessionController | store() | Process login |
| AuthenticatedSessionController | destroy() | Process logout |
| StudentController | postings() | List postings |
| StudentController | postingView() | View posting detail |
| StudentController | applyPosting() | Submit application |
| NotificationController | index() | Get notifications |
| NotificationController | markAsRead() | Mark as read |

### 4.2 Frontend Pages

| Page | File Path | Description |
|------|-----------|-------------|
| Login | resources/js/pages/auth/login.tsx | Login form |
| Browse Postings | resources/js/pages/student/postings.tsx | Postings list |
| Posting View | resources/js/pages/student/posting-view.tsx | Apply form |
| Notifications | resources/js/pages/notifications.tsx | Notifications page |

### 4.3 Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| users | User accounts | user_id, email, password, role, status |
| students | Student profiles | student_id, user_id, cgpa |
| postings | Job postings | posting_id, status, application_deadline |
| applications | Applications | application_id, student_id, posting_id, status |
| application_letters | Coordinator letters | letter_id, student_id, status |
| notifications | User notifications | notification_id, user_id, read, action_url |

---

## PlantUML Files

The diagrams are available as PlantUML files in:
- `docs/diagrams/activity-diagrams/login-activity.puml`
- `docs/diagrams/activity-diagrams/apply-internship-activity.puml`
- `docs/diagrams/activity-diagrams/notification-activity.puml`

To view these diagrams:
1. **VS Code**: Install "PlantUML" extension
2. **Online**: Paste content at https://www.plantuml.com/plantuml/uml
3. **IntelliJ**: Built-in PlantUML support

---

*Document Version: 1.0*
*Last Updated: January 2026*
*System: ICMS - Internship and Career Management System*

