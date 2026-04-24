---
name: Full ICMS Class Diagram
overview: Create a comprehensive draw.io class diagram for the ICMS system including ALL 23 models from the codebase with their actual attributes and methods, displayed in the visual style of the reference image (blue swimlane boxes, typed attributes, UML relationships).
todos:
  - id: create-full-drawio
    content: Create comprehensive draw.io class diagram with all 23 models, attributes, methods, and relationships
    status: completed
---

# Full ICMS Class Diagram Generation

## Overview

Generate a comprehensive draw.io (.drawio) UML class diagram covering **all 23 models** from the ICMS codebase, with actual attributes and methods from the code, displayed in the visual style of your reference image.

## All Entities from Codebase

### Core User/Account Models

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **User** | `app/Models/User.php` | user_id, username, name, first_name, last_name, specialization, email, role, department_id, phone, gender, status, avatar, password, remember_token, created_by | getName(), student(), department(), advisorAssignments(), companyAdminAssignments(), forms() |

| **Student** | `app/Models/Student.php` | student_id, user_id, department_id, first_name, last_name, cgpa, resume_path, profile_image, portfolio_url, skills, certifications, year_of_study, university_id, bio, accepted_application_id, linkedin_url, expected_salary, notice_period, preferred_locations, graduation_year | user(), department(), applications(), forms(), getMatchingPostings(), hasApprovedApplication() |

### Organization Models

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **Company** | `app/Models/Company.php` | company_id, name, description, industry, location, website, company_size, founded_year, contact_email, linkedin_url, status, logo | admin(), supervisorAssignments(), supervisors() |

| **Department** | `app/Models/Department.php` | department_id, name, description, code, faculty, dept_head_id, status | deptHead(), students(), advisorAssignments(), departmentHeadAssignments() |

### Posting & Application Models

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **Posting** | `app/Models/Posting.php` | posting_id, company_id, supervisor_id, title, description, type, industry, location, salary_range, start_date, end_date, application_deadline, requirements, work_type, benefits, experience_level, status, skills_required, application_instructions, min_gpa | company(), supervisor(), applications() |

| **Application** | `app/Models/Application.php` | application_id, student_id, posting_id, resume, cover_letter, portfolio, skills, certifications, status, accepted_at, feedback, student_approved_at, offer_expiration, cover_letter_path, submitted_at, source, last_updated_by | student(), posting(), lastUpdatedBy(), feedbacks(), analytics(), approveByStudent(), isWithinApprovalWindow() |

### Form & Letter Models

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **Form** | `app/Models/Form.php` | form_id, advisor_id, student_id, supervisor_id, title, file_path, type, status, comments | advisor(), student(), supervisor() |

| **Letter** | `app/Models/Letter.php` | letter_id, coordinator_id, student_id, title, file_path, type, status | coordinator(), student() |

| **ApplicationLetter** | `app/Models/ApplicationLetter.php` | letter_id, department_id, student_id, ref_number, start_date, end_date, file_path, status, sent_at, viewed_at, generated_by | department(), student(), generatedBy() |

### Communication Models

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **Notification** | `app/Models/Notification.php` | notification_id, type, title, message, user_id, sender_id, data, action_url, action_text, icon, read, read_at | user(), sender(), markAsRead(), markAsUnread(), scopeUnread(), scopeRead() |

| **Conversation** | `app/Models/Conversation.php` | id, is_group, type, title, created_by_id, last_message_id, pinned_message_id | creator(), participants(), messages(), pinned() |

| **ConversationParticipant** | `app/Models/ConversationParticipant.php` | id, conversation_id, user_id, role, joined_at, last_read_message_id, pinned, muted | conversation(), user() |

| **Message** | `app/Models/Message.php` | id, conversation_id, user_id, body, reply_to_message_id, metadata, edited_at | conversation(), user(), attachments() |

| **MessageAttachment** | `app/Models/MessageAttachment.php` | id, message_id, disk, path, filename, mime, size | message() |

| **MessageRead** | `app/Models/MessageRead.php` | id | - |

### Analytics & Feedback Models

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **Feedback** | `app/Models/Feedback.php` | feedback_id, advisor_id, student_id, content, rating | advisor(), student() |

| **InternshipAnalytics** | `app/Models/InternshipAnalytics.php` | analytics_id, student_id, application_id, supervisor_id, posting_id, posting_title, company_name, location, industry, work_type, start_date, end_date, duration_days, form_id, form_type, form_title, supervisor_comments, status, submitted_at, advisor_score, advisor_score_out_of, dept_head_score, dept_head_score_out_of, final_score, advisor_evaluation, dept_head_evaluation | student(), application(), supervisor(), posting(), form() |

### Assignment Models (Junction Tables)

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **AdvisorAssignment** | `app/Models/AdvisorAssignment.php` | assignment_id, advisor_id, student_id, department_id, assigned_at, status | advisor(), student(), department() |

| **CompanyAdminAssignment** | `app/Models/CompanyAdminAssignment.php` | id, company_id, user_id | company(), user() |

| **CompanySupervisorAssignment** | `app/Models/CompanySupervisorAssignment.php` | assignment_id, supervisor_id, company_id, assigned_at, status | supervisor(), company() |

| **DepartmentHeadAssignment** | `app/Models/DepartmentHeadAssignment.php` | id, department_id, user_id | department(), user() |

| **SupervisorAssignment** | `app/Models/SupervisorAssignment.php` | assignment_id, supervisor_id, student_id, posting_id, assigned_at, status | supervisor(), student(), posting() |

### Content Model

| Model | Source File | Attributes | Methods |

|-------|-------------|------------|---------|

| **HomeContent** | `app/Models/HomeContent.php` | id, title, description, background_image, logo, about_title, about_description, phone, email, location, social_media, carousel_images, footer_text, etc. | - |

## Relationships (from Eloquent definitions)

```javascript
User 1--0..1 Student
User 1--* Notification (receives)
User 0..1--* Notification (sends)
User *--0..1 Department
Student *--1 Department
Student 1--* Application
Student 1--* Form
Student 1--0..1 ApplicationLetter
Company 1--* Posting
Company 1--* CompanyAdminAssignment
Company 1--* CompanySupervisorAssignment
Posting *--1 Company
Posting 1--* Application
Posting *--0..1 User (supervisor)
Application *--1 Student
Application *--1 Posting
Application 1--0..1 InternshipAnalytics
Form *--1 Student
Form *--0..1 User (advisor)
Form *--0..1 User (supervisor)
Conversation 1--* Message
Conversation 1--* ConversationParticipant
Message *--1 Conversation
Message 1--* MessageAttachment
AdvisorAssignment *--1 User (advisor)
AdvisorAssignment *--1 Student
AdvisorAssignment *--1 Department
Feedback *--1 Student
Feedback *--1 User (advisor)
```

## Visual Style (matching reference image)

- **Blue swimlane boxes** (`#1f84b7`) with white text headers
- **Attributes**: `-attributeName:Type` format (private notation)
- **Methods**: `+methodName():ReturnType` format (public notation)
- **Filled diamond arrows** for composition relationships
- **Open arrows** for associations
- **Cardinality labels** (1, *, 0..1, 0..*) on all relationship lines

## Output

Create file: [`docs/diagrams/class-diagram.drawio`](docs/diagrams/class-diagram.drawio)