---
name: Fix Application Letter View Download
overview: Fix 403 Forbidden errors when company admins and students try to view or download application letters by creating dedicated routes and controller methods with proper authorization checks.
todos:
  - id: "1"
    content: Add viewApplicationLetter and downloadApplicationLetter methods to CompanyAdminController with proper authorization
    status: completed
  - id: "2"
    content: Add viewApplicationLetter and downloadApplicationLetter methods to StudentController with proper authorization
    status: completed
  - id: "3"
    content: Add routes for company admin application letter view/download in web.php
    status: completed
  - id: "4"
    content: Add routes for student application letter view/download in web.php
    status: completed
  - id: "5"
    content: Update company admin frontend (applicationsview.tsx) to use new routes instead of direct storage URLs
    status: completed
  - id: "6"
    content: Update student frontend (application-letter.tsx) to use new routes instead of coordinator routes
    status: completed
---

# Fix Application Letter View/Download Issue

## Problem Analysis

The issue occurs because:

1. **Company Admin Side**: Uses direct storage URLs (`/storage/application_letters/...`) which return 403 Forbidden
2. **Student Side**: Tries to access coordinator-only routes (`/coordinator/application-letters/{id}/view`) which are protected by `role:coordinator` middleware
3. **Missing Routes**: No dedicated routes for company admin and students to access application letters with proper authorization

## Solution

### 1. Add Controller Methods

**CompanyAdminController** (`app/Http/Controllers/CompanyAdminController.php`):

- Add `viewApplicationLetter($letterId)` method that:
- Verifies user is company_admin
- Checks the letter belongs to a student who applied to the admin's company
- Returns the file using `response()->file()`
- Add `downloadApplicationLetter($letterId)` method with same authorization logic

**StudentController** (`app/Http/Controllers/StudentController.php`):

- Add `viewApplicationLetter($letterId)` method that:
- Verifies user is student
- Checks the letter belongs to the authenticated student
- Returns the file using `response()->file()`
- Add `downloadApplicationLetter($letterId)` method with same authorization logic

### 2. Add Routes

**web.php** (`routes/web.php`):

- Add routes in company-admin group:
- `GET /company-admin/application-letters/{letterId}/view`
- `GET /company-admin/application-letters/{letterId}/download`
- Add routes in student group:
- `GET /student/application-letters/{letterId}/view`
- `GET /student/application-letters/{letterId}/download`

### 3. Update Frontend Components

**Company Admin** (`resources/js/pages/company-admin/applicationsview.tsx`):

- Change view link from `application.application_letter.file_path` to `/company-admin/application-letters/${application.application_letter.letter_id}/view`
- Change download link from `application.application_letter.file_path` to `/company-admin/application-letters/${application.application_letter.letter_id}/download`

**Student** (`resources/js/pages/student/application-letter.tsx`):

- Change view link from `/coordinator/application-letters/${applicationLetter.letter_id}/view` to `/student/application-letters/${applicationLetter.letter_id}/view`
- Change download link from `/coordinator/application-letters/${applicationLetter.letter_id}/download` to `/student/application-letters/${applicationLetter.letter_id}/download`

### 4. Authorization Logic

**Company Admin Authorization**:

- Verify the application letter belongs to a student who has an application to a posting from the company admin's company
- Query: `ApplicationLetter` -> `Student` -> `Application` -> `Posting` -> check `company_id`

**Student Authorization**:

- Verify the application letter's `student_id` matches the authenticated student's `student_id`

## Files to Modify

1. `app/Http/Controllers/CompanyAdminController.php` - Add view/download methods
2. `app/Http/Controllers/StudentController.php` - Add view/download methods
3. `routes/web.php` - Add new routes
4. `resources/js/pages/company-admin/applicationsview.tsx` - Update links
5. `resources/js/pages/student/application-letter.tsx` - Update links