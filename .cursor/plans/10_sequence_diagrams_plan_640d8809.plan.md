---
name: 10 Sequence Diagrams Plan
overview: Create 10 professional sequence diagrams in draw.io format following the established visual style (white background, cyan participants, yellow activation boxes, proper alt frames, lifecycle X markers, A4 paper compatible) for all major ICMS use cases.
todos:
  - id: seq-1-apply-internship
    content: Create apply-internship-sequence.drawio
    status: completed
  - id: seq-2-manage-application
    content: Create manage-application-sequence.drawio
    status: completed
    dependencies:
      - seq-1-apply-internship
  - id: seq-3-manage-post
    content: Create manage-post-sequence.drawio
    status: completed
    dependencies:
      - seq-2-manage-application
  - id: seq-4-process-application
    content: Create process-application-sequence.drawio
    status: completed
    dependencies:
      - seq-3-manage-post
  - id: seq-5-create-analytics
    content: Create create-analytics-sequence.drawio
    status: completed
    dependencies:
      - seq-4-process-application
  - id: seq-6-manage-form
    content: Create manage-form-sequence.drawio
    status: completed
    dependencies:
      - seq-5-create-analytics
  - id: seq-7-view-analytics
    content: Create view-analytics-advisor-sequence.drawio
    status: completed
    dependencies:
      - seq-6-manage-form
  - id: seq-8-manage-student-advisor
    content: Create manage-student-advisor-sequence.drawio
    status: completed
    dependencies:
      - seq-7-view-analytics
  - id: seq-9-manage-user
    content: Create manage-user-sequence.drawio
    status: completed
    dependencies:
      - seq-8-manage-student-advisor
  - id: seq-10-generate-letter
    content: Create generate-letter-sequence.drawio
    status: completed
    dependencies:
      - seq-9-manage-user
---

# ICMS Sequence Diagrams - Complete Set

## Overview

Create 10 professional sequence diagrams in draw.io format, following the established visual style from login-logout and chat diagrams. All diagrams will be A4 paper compatible (827x1169), with visible text, proper lifecycle markers (X), and professional UML notation.

## Target Directory

`docs/diagrams/sequence-diagrams/`

## Visual Standards (Applied to All)

- White background, cyan participant boxes (`#B8E6E6`)
- Yellow activation boxes (`#FFFF99`)
- Dark red arrows (`#8B0000`)
- Frame sections with labels
- Alt fragments for conditional flows
- Lifecycle end markers (X)
- Database cylinder shapes
- Duplicate participants at bottom
- Font sizes: 8-10pt for readability

---

## Diagram 1: Apply for Internship with Browse Posting

**File:** `apply-internship-sequence.drawio`**Participants:** User (Student), ICMS, Postings Page, Posting View, Application Form, StudentController, Database**Sections:**

1. Browse Postings - Student views available postings
2. View Posting Details - Student selects and views posting
3. Check Prerequisites - Verify application letter exists
4. Submit Application - Upload resume, submit form, notify company

**Based on:** [StudentController.php](app/Http/Controllers/StudentController.php) lines 269-516---

## Diagram 2: Manage Application (Student)

**File:** `manage-application-sequence.drawio`**Participants:** User (Student), ICMS, Applications Page, Application View, StudentController, Database, NotificationService**Sections:**

1. View Applications - List all student applications
2. View Application Details - See status, feedback, dates
3. Accept/Decline Offer - Student responds to approved application
4. Withdraw Application - Student cancels pending application

**Based on:** [StudentController.php](app/Http/Controllers/StudentController.php) lines 518-720---

## Diagram 3: Manage Post (Company Admin)

**File:** `manage-post-sequence.drawio`**Participants:** User (Company Admin), ICMS, Postings Page, Create/Edit Form, CompanyAdminController, Database, NotificationService**Sections:**

1. View Postings - List company postings
2. Create Posting - Fill form, assign supervisor, publish
3. Edit Posting - Update posting details, change status
4. Close/Delete Posting - Archive or remove posting

**Based on:** [CompanyAdminController.php](app/Http/Controllers/CompanyAdminController.php) lines 500-729---

## Diagram 4: Process Application (Company Admin/Supervisor)

**File:** `process-application-sequence.drawio`**Participants:** User (Company Admin), ICMS, Applications Page, Application View, CompanyAdminController, Database, NotificationService, Student**Sections:**

1. View Applications - List applications for company
2. Review Application - View details, resume, cover letter
3. Approve/Reject Application - Update status with feedback
4. Assign Supervisor - Link accepted student to supervisor

**Based on:** [CompanyAdminController.php](app/Http/Controllers/CompanyAdminController.php) lines 948-1227---

## Diagram 5: Create Analytics (Supervisor)

**File:** `create-analytics-sequence.drawio`**Participants:** User (Supervisor), ICMS, Analytics Page, Create Form, CompanySupervisorController, Database, NotificationService, Advisor, DeptHead**Sections:**

1. View Completed Students - List students ready for evaluation
2. Create Analytics Form - Upload form, add comments
3. Submit Analytics - Create record, update application status
4. Notify Stakeholders - Alert advisor, dept_head, student

**Based on:** [CompanySupervisorController.php](app/Http/Controllers/CompanySupervisorController.php) lines 910-1100---

## Diagram 6: Manage Form (Advisor)

**File:** `manage-form-sequence.drawio`**Participants:** User (Advisor), ICMS, Forms Page, Create/Edit Form, FacultyAdvisorController, Database, NotificationService, Supervisor**Sections:**

1. View Forms - List advisor's forms
2. Create Form - Select student, supervisor, upload file
3. Update Form - Edit details, replace file
4. Delete Form - Remove form from system

**Based on:** [FacultyAdvisorController.php](app/Http/Controllers/FacultyAdvisorController.php) lines 248-477---

## Diagram 7: View Analytics (Advisor)

**File:** `view-analytics-advisor-sequence.drawio`**Participants:** User (Advisor), ICMS, Analytics Page, Analytics View, FacultyAdvisorController, Database, NotificationService**Sections:**

1. View Pending Analytics - List analytics awaiting score
2. View Analytics Details - See student, form, supervisor comments
3. Submit Score - Enter advisor score and evaluation
4. Notify Dept Head - Alert about completed advisor evaluation

**Based on:** [FacultyAdvisorController.php](app/Http/Controllers/FacultyAdvisorController.php) lines 717-760---

## Diagram 8: Manage Student and Advisor (Dept Head)

**File:** `manage-student-advisor-sequence.drawio`**Participants:** User (Dept Head), ICMS, Students Page, Advisors Page, Assignment Form, DepartmentHeadController, Database, NotificationService**Sections:**

1. View Students - List department students
2. View Advisors - List department advisors
3. Assign Advisor to Student - Create assignment
4. Update/Remove Assignment - Modify existing assignments

**Based on:** [DepartmentHeadController.php](app/Http/Controllers/DepartmentHeadController.php) lines 409-790---

## Diagram 9: Manage User (Admin)

**File:** `manage-user-sequence.drawio`**Participants:** User (Admin), ICMS, Users Page, Create/Edit Form, UserController, Database**Sections:**

1. View Users - List coordinators, dept_heads, company_admins
2. Create User - Fill form with role, credentials
3. Edit User - Update user details, status
4. Deactivate User - Set status to inactive

**Based on:** [UserController.php](app/Http/Controllers/UserController.php) lines 1-175---

## Diagram 10: Generate Letter (Coordinator)

**File:** `generate-letter-sequence.drawio`**Participants:** User (Coordinator), ICMS, Letters Page, Generate Form, CoordinatorController, Database, PDF Service, NotificationService, Student**Sections:**

1. View Departments - List departments with students
2. Select Students - Choose students for letter generation
3. Generate Letters - Create PDF, save to storage