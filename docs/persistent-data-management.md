# ICMS - Persistent Data Management Documentation

## Internship and Career Management System

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Entity-Relationship Diagram](#2-entity-relationship-diagram)
3. [Data Dictionary](#3-data-dictionary)
4. [Relationships and Constraints](#4-relationships-and-constraints)
5. [Indexing Strategy](#5-indexing-strategy)
6. [Data Integrity Rules](#6-data-integrity-rules)
7. [Backup and Recovery](#7-backup-and-recovery)
8. [Data Migration Strategy](#8-data-migration-strategy)

---

## 1. Database Overview

### 1.1 Database Technology
- **Database System**: MySQL 8.0+ / MariaDB 10.5+
- **ORM**: Laravel Eloquent
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

### 1.2 Database Schema Summary

| Category | Tables | Description |
|----------|--------|-------------|
| User Management | 5 | Users, Students, Role Assignments |
| Organization | 3 | Departments, Companies, Assignments |
| Internship | 3 | Postings, Applications, Analytics |
| Communication | 5 | Messages, Conversations, Notifications |
| Documents | 3 | Forms, Letters, Application Letters |
| System | 3 | Cache, Jobs, Home Content |

### 1.3 Table Count
**Total Tables: 22**

---

## 2. Entity-Relationship Diagram

### 2.1 Core Entities Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ICMS Entity Relationships                          │
└─────────────────────────────────────────────────────────────────────────────┘

                            ┌───────────────┐
                            │   USERS       │
                            │───────────────│
                            │ PK: user_id   │
                            │ FK: dept_id   │
                            └───────┬───────┘
                                    │
           ┌────────────┬───────────┼───────────┬────────────┐
           │            │           │           │            │
           ▼            ▼           ▼           ▼            ▼
    ┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ STUDENT  │  │DEPT_HEAD │ │ ADVISOR  │ │ CO_ADMIN │ │SUPERVISOR│
    │ASSIGNMENT│  │ASSIGNMENT│ │ASSIGNMENT│ │ASSIGNMENT│ │ASSIGNMENT│
    └────┬─────┘  └──────────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
         │                          │            │            │
         ▼                          ▼            ▼            ▼
    ┌──────────┐              ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ STUDENTS │              │DEPARTMENT│ │ COMPANIES│ │ POSTINGS │
    │──────────│              │──────────│ │──────────│ │──────────│
    │PK:student│              │PK:dept_id│ │PK:comp_id│ │PK:post_id│
    │FK:user_id│◄─────────────│FK:head_id│ └────┬─────┘ │FK:comp_id│
    │FK:dept_id│              └──────────┘      │       │FK:sup_id │
    └────┬─────┘                    ▲           │       └────┬─────┘
         │                         │           │            │
         │                         │           │            │
         ▼                         │           ▼            ▼
    ┌──────────┐              ┌────┴─────┐          ┌──────────┐
    │APPLICAT- │              │ ADVISOR  │          │APPLICAT- │
    │  IONS    │◄─────────────│ASSIGNMENT│          │  IONS    │
    │──────────│              └──────────┘          │──────────│
    │PK:app_id │                                    │PK:app_id │
    │FK:stud_id│                                    │FK:post_id│
    │FK:post_id│                                    │FK:stud_id│
    └────┬─────┘                                    └──────────┘
         │
         ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │INTERN-   │     │  FORMS   │     │ FEEDBACK │
    │ANALYTICS │     │──────────│     │──────────│
    │──────────│     │PK:form_id│     │PK:fb_id  │
    │PK:anal_id│     │FK:stud_id│     │FK:stud_id│
    │FK:app_id │     │FK:adv_id │     │FK:sup_id │
    └──────────┘     │FK:sup_id │     └──────────┘
                     └──────────┘
```

### 2.2 Communication Module

```
    ┌──────────────┐
    │CONVERSATIONS │
    │──────────────│
    │PK: conv_id   │
    └──────┬───────┘
           │
    ┌──────┴───────┐
    │              │
    ▼              ▼
┌──────────┐  ┌──────────┐
│CONV_PART-│  │ MESSAGES │
│ICIPANTS  │  │──────────│
│──────────│  │PK:msg_id │
│PK:part_id│  │FK:conv_id│
│FK:conv_id│  │FK:send_id│
│FK:user_id│  └────┬─────┘
└──────────┘       │
                   ├─────────────┐
                   ▼             ▼
             ┌──────────┐  ┌──────────┐
             │MSG_READS │  │MSG_ATTACH│
             │──────────│  │──────────│
             │FK:msg_id │  │FK:msg_id │
             │FK:user_id│  └──────────┘
             └──────────┘
```

---

## 3. Data Dictionary

### 3.1 Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(255) | UNIQUE, NOT NULL | Login username |
| `name` | VARCHAR(255) | NULL | Display name |
| `first_name` | VARCHAR(255) | NULL | User's first name |
| `last_name` | VARCHAR(255) | NULL | User's last name |
| `specialization` | VARCHAR(255) | NULL | Area of expertise |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| `role` | ENUM | NOT NULL | student, coordinator, dept_head, advisor, company_admin, supervisor, admin |
| `department_id` | BIGINT UNSIGNED | FK, NULL | Reference to departments |
| `phone` | VARCHAR(255) | NULL | Contact phone number |
| `gender` | ENUM | NULL | male, female, other |
| `status` | ENUM | DEFAULT 'active' | active, inactive, suspended, pending |
| `avatar` | VARCHAR(255) | NULL | Profile picture path |
| `email_verified_at` | TIMESTAMP | NULL | Email verification timestamp |
| `password` | VARCHAR(255) | NOT NULL | Hashed password |
| `remember_token` | VARCHAR(100) | NULL | Session remember token |
| `created_by` | BIGINT UNSIGNED | FK, NULL | Admin who created account |
| `account_deactivation_date` | DATE | NULL | Scheduled deactivation |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

---

### 3.2 Students Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `student_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique student identifier |
| `user_id` | BIGINT UNSIGNED | FK, UNIQUE, NOT NULL | Reference to users table |
| `department_id` | BIGINT UNSIGNED | FK, NOT NULL | Student's department |
| `first_name` | VARCHAR(100) | NOT NULL | Student's first name |
| `last_name` | VARCHAR(100) | NOT NULL | Student's last name |
| `university_id` | VARCHAR(255) | NULL | University ID number |
| `cgpa` | FLOAT | NULL | Cumulative GPA |
| `resume_path` | VARCHAR(255) | NULL | Resume file path |
| `profile_image` | VARCHAR(255) | NULL | Profile picture |
| `profile_image_path` | VARCHAR(255) | NULL | Legacy image path |
| `portfolio_url` | VARCHAR(255) | NULL | Portfolio website URL |
| `skills` | JSON | NULL | Array of skills |
| `certifications` | JSON | NULL | Array of certifications |
| `year_of_study` | VARCHAR(50) | NULL | Current year of study |
| `bio` | TEXT | NULL | Student biography |
| `accepted_application_id` | BIGINT UNSIGNED | FK, NULL | Approved internship |
| `linkedin_url` | VARCHAR(255) | NULL | LinkedIn profile URL |
| `expected_salary` | DECIMAL(10,2) | NULL | Expected salary |
| `notice_period` | INT | NULL | Notice period in days |
| `preferred_locations` | JSON | NULL | Preferred work locations |
| `graduation_year` | INT | NULL | Expected graduation year |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

---

### 3.3 Companies Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `company_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique company identifier |
| `name` | VARCHAR(255) | NOT NULL | Company name |
| `description` | TEXT | NULL | Company description |
| `industry` | VARCHAR(255) | NULL | Industry sector |
| `location` | VARCHAR(255) | NULL | Primary location |
| `website` | VARCHAR(255) | NULL | Company website URL |
| `company_size` | VARCHAR(255) | NULL | Size category |
| `founded_year` | INT | NULL | Year founded |
| `contact_email` | VARCHAR(255) | NULL | Contact email |
| `linkedin_url` | VARCHAR(255) | NULL | LinkedIn page URL |
| `status` | ENUM | DEFAULT 'active' | active, inactive |
| `logo` | VARCHAR(255) | NULL | Company logo path |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

---

### 3.4 Departments Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `department_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique department identifier |
| `name` | VARCHAR(255) | NOT NULL | Department name |
| `description` | TEXT | NULL | Department description |
| `code` | VARCHAR(50) | NULL | Department code |
| `faculty` | VARCHAR(255) | NULL | Faculty/School name |
| `dept_head_id` | BIGINT UNSIGNED | FK, NULL | Department head user |
| `status` | ENUM | DEFAULT 'active' | active, inactive |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

---

### 3.5 Postings Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `posting_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique posting identifier |
| `company_id` | BIGINT UNSIGNED | FK, NOT NULL | Company offering position |
| `supervisor_id` | BIGINT UNSIGNED | FK, NULL | Assigned supervisor |
| `title` | VARCHAR(255) | NOT NULL | Position title |
| `description` | TEXT | NOT NULL | Full description |
| `type` | ENUM | NOT NULL | internship, career |
| `industry` | VARCHAR(255) | NOT NULL | Industry category |
| `location` | VARCHAR(255) | NOT NULL | Work location |
| `salary_range` | VARCHAR(255) | NULL | Compensation range |
| `start_date` | DATE | NOT NULL | Internship start date |
| `end_date` | DATE | NULL | Internship end date |
| `application_deadline` | DATE | NOT NULL | Application deadline |
| `requirements` | TEXT | NOT NULL | Position requirements |
| `work_type` | ENUM | NOT NULL | remote, onsite, hybrid |
| `benefits` | TEXT | NULL | Position benefits |
| `experience_level` | ENUM | NOT NULL | entry, mid, senior |
| `status` | ENUM | DEFAULT 'draft' | open, closed, draft, filled |
| `skills_required` | JSON | NULL | Required skills array |
| `application_instructions` | TEXT | NULL | How to apply |
| `min_gpa` | FLOAT | NULL | Minimum GPA requirement |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

---

### 3.6 Applications Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `application_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique application identifier |
| `student_id` | BIGINT UNSIGNED | FK, NOT NULL | Applying student |
| `posting_id` | BIGINT UNSIGNED | FK, NOT NULL | Target posting |
| `resume` | TEXT | NOT NULL | Resume content/path |
| `cover_letter` | TEXT | NULL | Cover letter content |
| `cover_letter_path` | VARCHAR(255) | NULL | Cover letter file path |
| `portfolio` | TEXT | NULL | Portfolio URL/content |
| `skills` | JSON | NULL | Relevant skills |
| `certifications` | JSON | NULL | Relevant certifications |
| `status` | ENUM | DEFAULT 'pending' | pending, under_review, shortlisted, accepted, rejected, approved, withdrawn, expired, completed |
| `feedback` | TEXT | NULL | Company feedback |
| `accepted_at` | TIMESTAMP | NULL | Offer acceptance time |
| `student_approved_at` | TIMESTAMP | NULL | Student approval time |
| `offer_expiration` | TIMESTAMP | NULL | Offer expiry (120 hours) |
| `submitted_at` | TIMESTAMP | NULL | Submission timestamp |
| `source` | VARCHAR(255) | NULL | Application source |
| `last_updated_by` | BIGINT UNSIGNED | FK, NULL | Last editor user |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |

**Unique Constraint**: (`student_id`, `posting_id`) - One application per student per posting

---

### 3.7 Forms Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `form_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique form identifier |
| `advisor_id` | BIGINT UNSIGNED | FK, NULL | Faculty advisor |
| `student_id` | BIGINT UNSIGNED | FK, NOT NULL | Student submitter |
| `supervisor_id` | BIGINT UNSIGNED | FK, NULL | Company supervisor |
| `title` | VARCHAR(255) | NOT NULL | Form title |
| `file_path` | VARCHAR(255) | NULL | Uploaded file path |
| `type` | ENUM | NOT NULL | evaluation, progress_report, completion, attendance |
| `status` | ENUM | DEFAULT 'pending' | pending, approved, rejected |
| `comments` | TEXT | NULL | Approver comments |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

---

### 3.8 Notifications Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `notification_id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Unique notification identifier |
| `type` | VARCHAR(255) | NOT NULL | Notification type |
| `title` | VARCHAR(255) | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification content |
| `user_id` | BIGINT UNSIGNED | FK, NOT NULL | Recipient user |
| `sender_id` | BIGINT UNSIGNED | FK, NULL | Sender user |
| `data` | JSON | NULL | Additional data payload |
| `action_url` | VARCHAR(255) | NULL | Click action URL |
| `action_text` | VARCHAR(255) | NULL | Action button text |
| `icon` | VARCHAR(255) | NULL | Notification icon |
| `read` | BOOLEAN | DEFAULT false | Read status |
| `read_at` | TIMESTAMP | NULL | Time when read |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |

---

### 3.9 Assignment Tables

#### Advisor Assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `assignment_id` | BIGINT UNSIGNED | PK | Unique assignment identifier |
| `advisor_id` | BIGINT UNSIGNED | FK, NOT NULL | Faculty advisor user |
| `student_id` | BIGINT UNSIGNED | FK, NOT NULL | Assigned student |
| `department_id` | BIGINT UNSIGNED | FK, NOT NULL | Department |
| `assigned_at` | TIMESTAMP | NULL | Assignment date |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |

**Unique Constraint**: (`advisor_id`, `student_id`)

#### Company Admin Assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `assignment_id` | BIGINT UNSIGNED | PK | Unique assignment identifier |
| `user_id` | BIGINT UNSIGNED | FK, NOT NULL | Admin user |
| `company_id` | BIGINT UNSIGNED | FK, NOT NULL | Managed company |
| `assigned_at` | TIMESTAMP | NULL | Assignment date |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |

#### Company Supervisor Assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `assignment_id` | BIGINT UNSIGNED | PK | Unique assignment identifier |
| `supervisor_id` | BIGINT UNSIGNED | FK, NOT NULL | Supervisor user |
| `company_id` | BIGINT UNSIGNED | FK, NOT NULL | Company |
| `assigned_at` | TIMESTAMP | NULL | Assignment date |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

#### Department Head Assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `assignment_id` | BIGINT UNSIGNED | PK | Unique assignment identifier |
| `user_id` | BIGINT UNSIGNED | FK, NOT NULL | Department head user |
| `department_id` | BIGINT UNSIGNED | FK, NOT NULL | Department |
| `assigned_at` | TIMESTAMP | NULL | Assignment date |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |

---

### 3.10 Internship Analytics Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `analytics_id` | BIGINT UNSIGNED | PK | Unique analytics identifier |
| `application_id` | BIGINT UNSIGNED | FK, NOT NULL | Related application |
| `company_id` | BIGINT UNSIGNED | FK, NULL | Company |
| `start_date` | DATE | NULL | Internship start |
| `end_date` | DATE | NULL | Internship end |
| `hours_completed` | INT | DEFAULT 0 | Hours worked |
| `tasks_completed` | INT | DEFAULT 0 | Tasks finished |
| `performance_score` | FLOAT | NULL | Performance rating |
| `out_of_overall` | FLOAT | NULL | Overall score max |
| `out_of_technical` | FLOAT | NULL | Technical score max |
| `out_of_soft` | FLOAT | NULL | Soft skills score max |
| `technical_score` | FLOAT | NULL | Technical skills score |
| `soft_skills_score` | FLOAT | NULL | Soft skills score |
| `overall_score` | FLOAT | NULL | Combined score |
| `created_at` | TIMESTAMP | NULL | Record creation time |
| `updated_at` | TIMESTAMP | NULL | Last update time |

---

## 4. Relationships and Constraints

### 4.1 Primary Relationships

```sql
-- User to Student (One-to-One)
students.user_id → users.user_id (UNIQUE)

-- User to Department (Many-to-One)
users.department_id → departments.department_id

-- Student to Department (Many-to-One)
students.department_id → departments.department_id

-- Posting to Company (Many-to-One)
postings.company_id → companies.company_id

-- Posting to Supervisor (Many-to-One)
postings.supervisor_id → users.user_id

-- Application to Student (Many-to-One)
applications.student_id → students.student_id

-- Application to Posting (Many-to-One)
applications.posting_id → postings.posting_id

-- Form to Student (Many-to-One)
forms.student_id → students.student_id

-- Form to Advisor (Many-to-One)
forms.advisor_id → users.user_id

-- Form to Supervisor (Many-to-One)
forms.supervisor_id → users.user_id
```

### 4.2 Foreign Key Actions

| Relationship | ON DELETE | ON UPDATE |
|--------------|-----------|-----------|
| users → departments | SET NULL | CASCADE |
| students → users | CASCADE | CASCADE |
| students → departments | CASCADE | CASCADE |
| postings → companies | CASCADE | CASCADE |
| postings → users (supervisor) | SET NULL | CASCADE |
| applications → students | CASCADE | CASCADE |
| applications → postings | CASCADE | CASCADE |
| forms → students | CASCADE | CASCADE |
| forms → users | SET NULL | CASCADE |
| notifications → users | CASCADE | CASCADE |

### 4.3 Cascade Delete Behavior

When deleting:
- **User**: Deletes associated student record, notifications, messages
- **Student**: Deletes applications, forms, feedback
- **Company**: Deletes postings, admin/supervisor assignments
- **Posting**: Deletes applications
- **Department**: Deletes student associations, advisor assignments

---

## 5. Indexing Strategy

### 5.1 Primary Indexes (Automatic)

All primary keys have clustered indexes:
- `users.user_id`
- `students.student_id`
- `companies.company_id`
- `departments.department_id`
- `postings.posting_id`
- `applications.application_id`
- etc.

### 5.2 Secondary Indexes

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department_id);

-- Students table indexes
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_students_accepted ON students(accepted_application_id);

-- Postings table indexes
CREATE INDEX idx_postings_company ON postings(company_id);
CREATE INDEX idx_postings_status ON postings(status);
CREATE INDEX idx_postings_deadline ON postings(application_deadline);
CREATE INDEX idx_postings_industry ON postings(industry);
CREATE INDEX idx_postings_location ON postings(location);

-- Applications table indexes
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_posting ON applications(posting_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE UNIQUE INDEX idx_applications_unique ON applications(student_id, posting_id);

-- Notifications table indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Messages table indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

### 5.3 Full-Text Indexes

```sql
-- For search functionality
CREATE FULLTEXT INDEX idx_postings_search 
ON postings(title, description, requirements);

CREATE FULLTEXT INDEX idx_companies_search 
ON companies(name, description);

CREATE FULLTEXT INDEX idx_students_search 
ON students(first_name, last_name, bio);
```

---

## 6. Data Integrity Rules

### 6.1 Business Rules

| Rule ID | Rule Description | Implementation |
|---------|-----------------|----------------|
| BR-001 | Student can have only ONE approved application | Application constraint + trigger |
| BR-002 | Application deadline must be before posting start date | Application validation |
| BR-003 | Offer expires 120 hours after acceptance | Automatic timestamp calculation |
| BR-004 | Student GPA must meet posting min_gpa | Application validation |
| BR-005 | One company admin per company | Assignment unique constraint |
| BR-006 | Forms require approval workflow | Status state machine |
| BR-007 | Soft delete for audit trail | deleted_at column |
| BR-008 | Password must be hashed | Eloquent mutator |

### 6.2 Validation Rules (Model Level)

```php
// User validation
'username' => 'required|string|unique:users',
'email' => 'required|email|unique:users',
'role' => 'required|in:student,coordinator,dept_head,advisor,company_admin,supervisor,admin',
'password' => 'required|min:8',

// Student validation
'user_id' => 'required|exists:users,user_id|unique:students',
'department_id' => 'required|exists:departments,department_id',
'cgpa' => 'nullable|numeric|between:0,4',

// Posting validation
'title' => 'required|string|max:255',
'company_id' => 'required|exists:companies,company_id',
'application_deadline' => 'required|date|after:today',
'start_date' => 'required|date|after:application_deadline',

// Application validation
'student_id' => 'required|exists:students,student_id',
'posting_id' => 'required|exists:postings,posting_id',
'resume' => 'required',
```

### 6.3 Database Triggers (Conceptual)

```sql
-- Auto-set offer expiration when application accepted
DELIMITER //
CREATE TRIGGER set_offer_expiration
BEFORE UPDATE ON applications
FOR EACH ROW
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        SET NEW.accepted_at = NOW();
        SET NEW.offer_expiration = DATE_ADD(NOW(), INTERVAL 120 HOUR);
    END IF;
END //
DELIMITER ;

-- Prevent multiple approved applications
DELIMITER //
CREATE TRIGGER check_single_approval
BEFORE UPDATE ON applications
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        DECLARE existing_count INT;
        SELECT COUNT(*) INTO existing_count 
        FROM applications 
        WHERE student_id = NEW.student_id 
        AND status = 'approved' 
        AND application_id != NEW.application_id;
        
        IF existing_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Student already has an approved application';
        END IF;
    END IF;
END //
DELIMITER ;
```

---

## 7. Backup and Recovery

### 7.1 Backup Strategy

| Backup Type | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Full Backup | Daily (2 AM) | 30 days | mysqldump / pg_dump |
| Incremental | Every 6 hours | 7 days | Binary log backup |
| Transaction Log | Continuous | 48 hours | Real-time replication |

### 7.2 Backup Commands

```bash
# Full database backup
mysqldump -u root -p --single-transaction \
  --routines --triggers \
  icms_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
mysqldump -u root -p icms_database | gzip > backup_$(date +%Y%m%d).sql.gz

# Laravel backup command (if using spatie/laravel-backup)
php artisan backup:run

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/icms"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/icms_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +30 -delete
```

### 7.3 Recovery Procedures

```bash
# Restore from backup
mysql -u root -p icms_database < backup_20260109.sql

# Point-in-time recovery
mysqlbinlog --start-datetime="2026-01-09 00:00:00" \
  --stop-datetime="2026-01-09 12:00:00" \
  /var/lib/mysql/mysql-bin.* | mysql -u root -p

# Laravel migration rollback and re-run
php artisan migrate:rollback
php artisan migrate
php artisan db:seed
```

---

## 8. Data Migration Strategy

### 8.1 Laravel Migrations

Migrations are located in `database/migrations/` and follow the naming convention:
`YYYY_MM_DD_HHMMSS_description.php`

### 8.2 Migration Commands

```bash
# Run all pending migrations
php artisan migrate

# Rollback last batch
php artisan migrate:rollback

# Rollback all migrations
php artisan migrate:reset

# Rollback and re-run all migrations
php artisan migrate:refresh

# Drop all tables and re-run migrations
php artisan migrate:fresh

# Run with seeding
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status

# Create new migration
php artisan make:migration create_table_name
php artisan make:migration add_column_to_table --table=table_name
```

### 8.3 Seeder Strategy

```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=UserSeeder

# Seeder classes location
database/seeders/
├── DatabaseSeeder.php       # Main seeder
├── UserSeeder.php           # User data
├── DepartmentSeeder.php     # Department data
├── CompanySeeder.php        # Company data
├── PostingSeeder.php        # Sample postings
└── StudentSeeder.php        # Student data
```

### 8.4 Production Migration Best Practices

1. **Always backup before migration**
2. **Test migrations on staging first**
3. **Use transactions for data migrations**
4. **Create rollback scripts**
5. **Document schema changes**
6. **Schedule migrations during low traffic**

```php
// Example safe migration with transaction
public function up(): void
{
    DB::transaction(function () {
        Schema::table('users', function (Blueprint $table) {
            $table->string('new_column')->nullable();
        });
        
        // Data migration
        DB::table('users')
            ->whereNull('new_column')
            ->update(['new_column' => 'default_value']);
    });
}
```

---

## Appendix A: Complete Table List

| # | Table Name | Description |
|---|------------|-------------|
| 1 | users | User accounts and authentication |
| 2 | students | Student profiles and academic info |
| 3 | departments | Academic departments |
| 4 | companies | Partner companies |
| 5 | postings | Internship/job postings |
| 6 | applications | Student applications |
| 7 | forms | Documents and evaluations |
| 8 | letters | Generated letters |
| 9 | application_letters | Application letter requests |
| 10 | feedback | Supervisor/student feedback |
| 11 | notifications | System notifications |
| 12 | conversations | Chat conversations |
| 13 | conversation_participants | Conversation members |
| 14 | messages | Chat messages |
| 15 | message_reads | Message read status |
| 16 | message_attachments | Message file attachments |
| 17 | advisor_assignments | Student-advisor links |
| 18 | company_admin_assignments | Company admin links |
| 19 | company_supervisor_assignments | Company supervisor links |
| 20 | department_head_assignments | Department head links |
| 21 | supervisor_assignments | Intern-supervisor links |
| 22 | internship_analytics | Internship tracking data |
| 23 | home_contents | CMS content management |
| 24 | cache | Application cache |
| 25 | jobs | Queue jobs |

---

## Appendix B: Enum Values Reference

### User Roles
- `student` - Student user
- `coordinator` - Internship coordinator
- `dept_head` - Department head
- `advisor` - Faculty advisor
- `company_admin` - Company administrator
- `supervisor` - Company supervisor
- `admin` - System administrator

### Application Status
- `pending` - Awaiting review
- `under_review` - Being reviewed
- `shortlisted` - Shortlisted for interview
- `accepted` - Offer extended
- `rejected` - Application rejected
- `approved` - Student accepted offer
- `withdrawn` - Student withdrew
- `expired` - Offer expired
- `completed` - Internship completed

### Posting Status
- `draft` - Not published
- `open` - Accepting applications
- `closed` - Manually closed
- `filled` - Position filled

### Form Types
- `evaluation` - Performance evaluation
- `progress_report` - Progress report
- `completion` - Completion certificate
- `attendance` - Attendance record

### Form Status
- `pending` - Awaiting approval
- `approved` - Approved
- `rejected` - Rejected

---

*Document Version: 1.0*
*Last Updated: January 2026*
*System: ICMS - Internship and Career Management System*

