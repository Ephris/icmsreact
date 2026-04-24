---
name: Balanced A4 Class Diagram
overview: Regenerate the ICMS class diagram with a balanced set of essential attributes (5-8 per class) and key methods, optimized to fit legibly on A4 paper.
todos:
  - id: regenerate-balanced-diagram
    content: Regenerate class diagram with balanced attributes (5-8 per class) for A4 paper
    status: completed
---

# Balanced A4 Class Diagram

## Overview

Regenerate the class diagram with a **balanced** set of attributes (5-8 per class) - enough to understand the data model while remaining readable on A4 paper.

## Page Setup

- Canvas: A4 Landscape (1123 x 794 pixels)
- Class boxes: Compact but with adequate attributes

## Balanced Class Contents

### Core User Classes

| Class | Attributes (5-8) | Methods (2-3) |

|-------|------------------|---------------|

| **User** | user_id, username, email, first_name, last_name, role, department_id, status, avatar | login(), logout(), updateProfile() |

| **Student** | student_id, user_id, department_id, first_name, last_name, cgpa, resume_path, skills, year_of_study | apply(), uploadResume(), getMatchingPostings() |

### Organization Classes

| Class | Attributes (5-8) | Methods (2-3) |

|-------|------------------|---------------|

| **Company** | company_id, name, description, industry, location, contact_email, status, logo | createPosting(), getApplications() |

| **Department** | department_id, name, description, code, faculty, dept_head_id, status | getStudents(), assignHead() |

### Posting and Application Classes

| Class | Attributes (5-8) | Methods (2-3) |

|-------|------------------|---------------|

| **Posting** | posting_id, company_id, title, description, type, location, salary_range, status, application_deadline | publish(), close(), getApplications() |

| **Application** | application_id, student_id, posting_id, resume, cover_letter, status, accepted_at, feedback | submit(), withdraw(), approve() |

### Form and Letter Classes

| Class | Attributes (5-8) | Methods (2-3) |

|-------|------------------|---------------|

| **Form** | form_id, advisor_id, student_id, supervisor_id, title, file_path, type, status | submit(), approve(), reject() |

| **Letter** | letter_id, coordinator_id, student_id, title, file_path, type, status | generate(), download() |

| **ApplicationLetter** | letter_id, department_id, student_id, ref_number, file_path, status, start_date, end_date | generate(), send() |

### Communication Classes

| Class | Attributes (5-8) | Methods (2-3) |

|-------|------------------|---------------|

| **Notification** | notification_id, user_id, sender_id, type, title, message, read, read_at | markAsRead(), send() |

| **Conversation** | id, title, type, is_group, created_by_id, last_message_id | addParticipant(), getMessages() |

| **Message** | id, conversation_id, user_id, body, metadata, edited_at | send(), edit() |

### Analytics and Feedback Classes

| Class | Attributes (5-8) | Methods (2-3) |

|-------|------------------|---------------|

| **Feedback** | feedback_id, advisor_id, student_id, content, rating | submit() |

| **InternshipAnalytics** | analytics_id, student_id, application_id, company_name, duration_days, final_score, status | calculate(), generateReport() |

### Assignment Classes (Simplified)

| Class | Attributes | Methods |

|-------|------------|---------|

| **AdvisorAssignment** | assignment_id, advisor_id, student_id, department_id, status | assign() |

| **CompanyAdminAssignment** | id, company_id, user_id | assign() |

| **DepartmentHeadAssignment** | id, department_id, user_id | assign() |

## Layout

- 16 classes arranged in 4 rows
- Row 1: User, Student, Company, Department
- Row 2: Posting, Application, Form, Letter
- Row 3: Notification, Conversation, Message, ApplicationLetter
- Row 4: Feedback, InternshipAnalytics, AdvisorAssignment, CompanyAdminAssignment, DeptHeadAssignment

## Output