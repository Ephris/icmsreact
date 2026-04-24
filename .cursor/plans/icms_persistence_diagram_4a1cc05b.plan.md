---
name: ICMS Persistence Diagram
overview: Create a simplified Entity-Relationship Diagram (ERD) for the ICMS database in draw.io format, showing all 22 core tables with primary keys, foreign keys, key attributes, and relationships - optimized for A4 paper like the class diagram.
todos:
  - id: create-persistence-diagram
    content: Create ERD persistence diagram with 22 tables, keys, and relationships for A4 paper
    status: completed
---

# ICMS Persistence Diagram (ERD)

## Overview

Create a simplified Entity-Relationship Diagram showing the database schema with tables, keys, key columns, and relationships in draw.io format optimized for A4 landscape.

## Page Setup

- Canvas: A4 Landscape (1169 x 827 pixels)
- Table boxes: Compact with essential columns only

## Tables to Include (22 Core Tables)

### User Management (4 tables)

| Table | Key Columns |

|-------|-------------|

| **users** | PK: user_id, email, role, department_id (FK), status |

| **students** | PK: student_id, FK: user_id, FK: department_id, cgpa, skills |

| **departments** | PK: department_id, name, code, FK: dept_head_id |

| **companies** | PK: company_id, name, industry, status |

### Internship Core (3 tables)

| Table | Key Columns |

|-------|-------------|

| **postings** | PK: posting_id, FK: company_id, FK: supervisor_id, title, status |

| **applications** | PK: application_id, FK: student_id, FK: posting_id, status |

| **internship_analytics** | PK: analytics_id, FK: application_id, final_score |

### Documents (3 tables)

| Table | Key Columns |

|-------|-------------|

| **forms** | PK: form_id, FK: student_id, FK: advisor_id, type, status |

| **letters** | PK: letter_id, FK: student_id, FK: coordinator_id, type |

| **application_letters** | PK: letter_id, FK: student_id, FK: department_id, status |

### Communication (5 tables)

| Table | Key Columns |

|-------|-------------|

| **notifications** | PK: notification_id, FK: user_id, type, read |

| **conversations** | PK: id, title, type, FK: created_by_id |

| **conversation_participants** | PK: id, FK: conversation_id, FK: user_id |

| **messages** | PK: id, FK: conversation_id, FK: user_id, body |

| **message_attachments** | PK: id, FK: message_id, filename |

### Assignment Tables (5 tables)

| Table | Key Columns |

|-------|-------------|

| **advisor_assignments** | PK: id, FK: advisor_id, FK: student_id, FK: dept_id |

| **company_admin_assignments** | PK: id, FK: user_id, FK: company_id |

| **company_supervisor_assignments** | PK: id, FK: supervisor_id, FK: company_id |

| **department_head_assignments** | PK: id, FK: user_id, FK: department_id |

| **supervisor_assignments** | PK: id, FK: supervisor_id, FK: student_id |

### Other (2 tables)

| Table | Key Columns |

|-------|-------------|

| **feedback** | PK: feedback_id, FK: student_id, FK: advisor_id, rating |

| **home_contents** | PK: id, title (CMS content) |

## Relationships (from FK constraints)

```javascript
users 1:1 students
users 1:* notifications
users *:1 departments
students *:1 departments
students 1:* applications
students 1:* forms
companies 1:* postings
postings 1:* applications
applications 1:0..1 internship_analytics
conversations 1:* messages
conversations 1:* conversation_participants
messages 1:* message_attachments
advisor_assignments *:1 users, *:1 students
```

## Visual Style (ERD notation)

- **Blue header** with table name
- **PK** indicator for primary keys
- **FK** indicator for foreign keys
- **Crow's foot notation** for relationships (1, many)
- Compact layout in 4 rows

## Output