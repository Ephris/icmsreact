# ICMS - User Interface Prototyping Documentation

## Internship and Career Management System

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Common Components](#2-common-components)
3. [Authentication Screens](#3-authentication-screens)
4. [Student Interface](#4-student-interface)
5. [Company Admin Interface](#5-company-admin-interface)
6. [Supervisor Interface](#6-supervisor-interface)
7. [Faculty Advisor Interface](#7-faculty-advisor-interface)
8. [Coordinator Interface](#8-coordinator-interface)
9. [Department Head Interface](#9-department-head-interface)
10. [System Admin Interface](#10-system-admin-interface)
11. [Navigation Flow Diagrams](#11-navigation-flow-diagrams)
12. [Responsive Design Guidelines](#12-responsive-design-guidelines)

---

## 1. Design System Overview

### 1.1 Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **UI Component Library**: Custom components with Tailwind CSS
- **State Management**: React Context / Zustand
- **Routing**: React Router / Inertia.js
- **Icons**: Lucide React
- **Animations**: Framer Motion / CSS Transitions

### 1.2 Color Palette

```
Primary Colors:
┌──────────────────────────────────────────────────────────┐
│  Primary Blue      │  #3B82F6  │  Buttons, Links, CTAs   │
│  Primary Dark      │  #1E40AF  │  Hover states           │
│  Primary Light     │  #DBEAFE  │  Backgrounds            │
└──────────────────────────────────────────────────────────┘

Semantic Colors:
┌──────────────────────────────────────────────────────────┐
│  Success Green     │  #10B981  │  Success states         │
│  Warning Yellow    │  #F59E0B  │  Warnings               │
│  Error Red         │  #EF4444  │  Errors, Rejections     │
│  Info Blue         │  #3B82F6  │  Information            │
└──────────────────────────────────────────────────────────┘

Neutral Colors:
┌──────────────────────────────────────────────────────────┐
│  Gray 900          │  #111827  │  Primary text (light)   │
│  Gray 700          │  #374151  │  Secondary text         │
│  Gray 500          │  #6B7280  │  Muted text             │
│  Gray 200          │  #E5E7EB  │  Borders                │
│  Gray 100          │  #F3F4F6  │  Backgrounds            │
│  White             │  #FFFFFF  │  Cards, surfaces        │
└──────────────────────────────────────────────────────────┘

Dark Mode:
┌──────────────────────────────────────────────────────────┐
│  Background        │  #111827  │  Main background        │
│  Surface           │  #1F2937  │  Cards, panels          │
│  Border            │  #374151  │  Dividers               │
│  Text Primary      │  #F9FAFB  │  Primary text           │
│  Text Secondary    │  #9CA3AF  │  Secondary text         │
└──────────────────────────────────────────────────────────┘
```

### 1.3 Typography

```
Font Family: Inter, system-ui, sans-serif

Type Scale:
┌─────────────────────────────────────────────────────────────┐
│  Display      │  text-4xl  │  36px  │  Page titles          │
│  Heading 1    │  text-3xl  │  30px  │  Section headers      │
│  Heading 2    │  text-2xl  │  24px  │  Card titles          │
│  Heading 3    │  text-xl   │  20px  │  Sub-sections         │
│  Body Large   │  text-lg   │  18px  │  Important text       │
│  Body         │  text-base │  16px  │  Default body         │
│  Small        │  text-sm   │  14px  │  Labels, captions     │
│  XSmall       │  text-xs   │  12px  │  Badges, timestamps   │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Spacing System

```
Spacing Scale (based on 4px):
┌──────────────────────────────────────┐
│  space-1   │  4px   │  Tight gaps    │
│  space-2   │  8px   │  Inline items  │
│  space-3   │  12px  │  Small padding │
│  space-4   │  16px  │  Default gap   │
│  space-6   │  24px  │  Section gap   │
│  space-8   │  32px  │  Large gap     │
│  space-12  │  48px  │  Section break │
│  space-16  │  64px  │  Page sections │
└──────────────────────────────────────┘
```

---

## 2. Common Components

### 2.1 Navigation Components

#### Sidebar Navigation (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🎓 ICMS                                    [👤 User]  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌──────────┬────────────────────────────────────────────┐  │
│  │          │                                            │  │
│  │ 🏠 Home  │              Main Content                  │  │
│  │          │                                            │  │
│  │ 📋 Intern│                                            │  │
│  │ ships    │                                            │  │
│  │          │                                            │  │
│  │ 📄 Apps  │                                            │  │
│  │          │                                            │  │
│  │ 📝 Forms │                                            │  │
│  │          │                                            │  │
│  │ 💬 Msgs  │                                            │  │
│  │          │                                            │  │
│  │ ⚙️ Sett  │                                            │  │
│  │          │                                            │  │
│  └──────────┴────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Header Component
```
┌─────────────────────────────────────────────────────────────┐
│  ☰  ICMS Dashboard           🔍 Search...     🔔 │ 👤 John │
└─────────────────────────────────────────────────────────────┘
     │                              │              │     │
     └─ Mobile menu toggle         │              │     └─ Profile dropdown
                                   └─ Global search│
                                                   └─ Notifications
```

### 2.2 Card Components

#### Standard Card
```
┌─────────────────────────────────────────────────────────────┐
│  Card Title                                    [⋮ Actions]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Card content goes here. Can include text, images,          │
│  forms, tables, or other components.                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [Secondary]  [Primary Button]  │
└─────────────────────────────────────────────────────────────┘
```

#### Posting Card (Internship Listing)
```
┌─────────────────────────────────────────────────────────────┐
│  ┌────┐                                                     │
│  │LOGO│  Company Name                        [💙 Save]      │
│  └────┘  📍 Location  •  💼 Full-time  •  🏢 On-site       │
├─────────────────────────────────────────────────────────────┤
│  **Software Engineer Intern**                               │
│                                                             │
│  Brief description of the internship position...            │
│                                                             │
│  ┌─────────┐ ┌──────┐ ┌────────┐                           │
│  │ React   │ │ Node │ │ Python │                           │
│  └─────────┘ └──────┘ └────────┘                           │
├─────────────────────────────────────────────────────────────┤
│  📅 Deadline: Jan 15  │  💰 $20-25/hr  │  [Apply Now →]    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Form Components

#### Input Field
```
┌─────────────────────────────────────────────────────────────┐
│  Label *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Placeholder text...                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  Helper text or error message                               │
└─────────────────────────────────────────────────────────────┘

States:
- Default: Gray border
- Focus: Blue border with ring
- Error: Red border with error message
- Disabled: Gray background, muted text
```

#### Button Variants
```
┌────────────────────────────────────────────────────────────┐
│  Primary:    [ Primary Action ]  - Blue background         │
│  Secondary:  [ Secondary ]       - Gray background         │
│  Outline:    [ Outline ]         - Border only             │
│  Ghost:      [ Ghost ]           - No background           │
│  Danger:     [ Delete ]          - Red background          │
│  Success:    [ Approve ]         - Green background        │
└────────────────────────────────────────────────────────────┘
```

### 2.4 Status Badges

```
Application Status Badges:
┌────────────────────────────────────────────────────────────┐
│  [● Pending]     - Yellow/Amber                            │
│  [● Under Review] - Blue                                   │
│  [● Shortlisted] - Purple                                  │
│  [● Accepted]    - Green                                   │
│  [● Rejected]    - Red                                     │
│  [● Approved]    - Dark Green                              │
│  [● Withdrawn]   - Gray                                    │
│  [● Expired]     - Dark Gray                               │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Authentication Screens

### 3.1 Login Page
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     ┌─────────────────┐                     │
│                     │    🎓 ICMS      │                     │
│                     │                 │                     │
│                     │ Internship and  │                     │
│                     │ Career Mgmt Sys │                     │
│                     └─────────────────┘                     │
│                                                             │
│               ┌─────────────────────────┐                   │
│               │                         │                   │
│               │  Email or Username      │                   │
│               │  ┌───────────────────┐  │                   │
│               │  │                   │  │                   │
│               │  └───────────────────┘  │                   │
│               │                         │                   │
│               │  Password               │                   │
│               │  ┌───────────────────┐  │                   │
│               │  │ ••••••••••    👁  │  │                   │
│               │  └───────────────────┘  │                   │
│               │                         │                   │
│               │  [ ] Remember me        │                   │
│               │                         │                   │
│               │  [      Log In       ]  │                   │
│               │                         │                   │
│               │  Forgot password?       │                   │
│               │                         │                   │
│               └─────────────────────────┘                   │
│                                                             │
│              Need help? Contact Support                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Password Reset Page
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     🎓 ICMS                                 │
│                                                             │
│               ┌─────────────────────────┐                   │
│               │                         │                   │
│               │    Reset Password       │                   │
│               │                         │                   │
│               │  Enter your email and   │                   │
│               │  we'll send you a       │                   │
│               │  reset link.            │                   │
│               │                         │                   │
│               │  Email Address          │                   │
│               │  ┌───────────────────┐  │                   │
│               │  │ user@example.com  │  │                   │
│               │  └───────────────────┘  │                   │
│               │                         │                   │
│               │  [  Send Reset Link  ]  │                   │
│               │                         │                   │
│               │  ← Back to Login        │                   │
│               │                         │                   │
│               └─────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Student Interface

### 4.1 Student Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, John! 👋                        🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌─────────────┬─────────────┬─────────────┐    │
│          │  │   📊 5      │   ✅ 2      │   ⏳ 3      │    │
│ 💼 Intern│  │Applications │  Interviews │   Pending   │    │
│   ships  │  └─────────────┴─────────────┴─────────────┘    │
│          │                                                  │
│ 📄 Apps  │  Quick Actions                                  │
│          │  ┌─────────────────────────────────────────┐    │
│ 📝 Forms │  │  [🔍 Browse Internships]  [📄 My Apps]  │    │
│          │  │  [📤 Upload Resume]  [✏️ Edit Profile]  │    │
│ 💬 Msgs  │  └─────────────────────────────────────────┘    │
│          │                                                  │
│ 👤 Profile│  Recent Applications                           │
│          │  ┌─────────────────────────────────────────┐    │
│ ⚙️ Sett  │  │ Software Intern - TechCorp   [Pending]  │    │
│          │  │ Applied: Jan 5  | Deadline: Jan 15      │    │
│          │  ├─────────────────────────────────────────┤    │
│          │  │ Data Analyst - DataCo     [Shortlisted] │    │
│          │  │ Applied: Jan 3  | Interview: Jan 10     │    │
│          │  └─────────────────────────────────────────┘    │
│          │                                                  │
│          │  Recommended Internships                        │
│          │  ┌─────────────────────────────────────────┐    │
│          │  │ [Posting Card 1] [Posting Card 2] ...   │    │
│          │  └─────────────────────────────────────────┘    │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 4.2 Browse Internships Page
```
┌─────────────────────────────────────────────────────────────┐
│  Internship Opportunities                      🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Filters  │  ┌─────────────────────────────────────────┐    │
│          │  │ 🔍 Search internships...         [🔍]   │    │
│ 📍 Loc   │  └─────────────────────────────────────────┘    │
│ ☑ Remote │                                                  │
│ ☑ Onsite │  Showing 24 internships            [Sort by ▼]  │
│ ☑ Hybrid │                                                  │
│          │  ┌───────────────────┐ ┌───────────────────┐    │
│ 💼 Type  │  │                   │ │                   │    │
│ ☑ Fulltime│ │  [Posting Card]   │ │  [Posting Card]   │    │
│ ☑ Parttime│ │                   │ │                   │    │
│          │  └───────────────────┘ └───────────────────┘    │
│ 🏭 Industry│                                                │
│ ☑ Tech   │  ┌───────────────────┐ ┌───────────────────┐    │
│ ☐ Finance │ │                   │ │                   │    │
│ ☐ Health │  │  [Posting Card]   │ │  [Posting Card]   │    │
│          │  │                   │ │                   │    │
│ 💰 Salary │  └───────────────────┘ └───────────────────┘    │
│ Min [___] │                                                  │
│ Max [___] │  ┌─────────────────────────────────────┐       │
│          │  │    [1] [2] [3] ... [10]  [Next →]    │       │
│ [Apply]  │  └─────────────────────────────────────┘       │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 4.3 Application Form
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Posting                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Apply for: Software Engineer Intern                        │
│  TechCorp Inc.                                              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Resume *                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 john_doe_resume.pdf              [Change] [✓]   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ✓ Using resume from your profile                          │
│                                                             │
│  Cover Letter *                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Dear Hiring Manager,                               │   │
│  │                                                     │   │
│  │  I am writing to express my interest in...         │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  0/500 words                                               │
│                                                             │
│  Relevant Skills *                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [React ✕] [TypeScript ✕] [Node.js ✕] [+ Add]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Portfolio URL (Optional)                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  https://johndoe.dev                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Additional Documents (Optional)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       📎 Drag & drop files or click to upload       │   │
│  │                                                     │   │
│  │           Supported: PDF, DOC, DOCX (max 5MB)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [✓] I confirm that all information provided is    │   │
│  │      accurate and complete.                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│              [Cancel]     [Submit Application]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Application Status Page
```
┌─────────────────────────────────────────────────────────────┐
│  My Applications                               🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 📊 All   │  [All] [Pending] [Accepted] [Rejected]          │
│          │                                                  │
│          │  ┌─────────────────────────────────────────┐    │
│          │  │  Software Engineer Intern                │    │
│          │  │  TechCorp Inc.  |  📍 San Francisco     │    │
│          │  │                                          │    │
│          │  │  Status: [● Accepted]  ⏰ Offer expires  │    │
│          │  │                          in 4 days 12h   │    │
│          │  │                                          │    │
│          │  │  [ View Details ]  [Accept] [Decline]   │    │
│          │  └─────────────────────────────────────────┘    │
│          │                                                  │
│          │  ┌─────────────────────────────────────────┐    │
│          │  │  Data Analyst Intern                     │    │
│          │  │  DataCo  |  📍 Remote                   │    │
│          │  │                                          │    │
│          │  │  Status: [● Pending]                    │    │
│          │  │  Applied: Jan 3, 2026                   │    │
│          │  │                                          │    │
│          │  │  [ View Details ]  [ Withdraw ]         │    │
│          │  └─────────────────────────────────────────┘    │
│          │                                                  │
│          │  ┌─────────────────────────────────────────┐    │
│          │  │  Marketing Intern                        │    │
│          │  │  AdAgency  |  📍 New York               │    │
│          │  │                                          │    │
│          │  │  Status: [● Rejected]                   │    │
│          │  │  Feedback: Position filled internally   │    │
│          │  │                                          │    │
│          │  │  [ View Details ]                       │    │
│          │  └─────────────────────────────────────────┘    │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 5. Company Admin Interface

### 5.1 Company Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  TechCorp Dashboard                            🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌──────────┬──────────┬──────────┬──────────┐  │
│          │  │ 📋 8     │ 📄 45    │ ✅ 12    │ 👥 5     │  │
│ 📋 Posts │  │ Active   │ Total    │ Accepted │ Current  │  │
│          │  │ Postings │ Applicants│ Offers  │ Interns  │  │
│ 📄 Apps  │  └──────────┴──────────┴──────────┴──────────┘  │
│          │                                                  │
│ 👥 Interns│ [+ Create New Posting]                         │
│          │                                                  │
│ 📊 Analyt│  Recent Applications                            │
│          │  ┌────────────────────────────────────────────┐ │
│ 🏢 Company│  │ Name     │ Position   │ Date    │ Status  │ │
│          │  ├────────────────────────────────────────────┤ │
│ ⚙️ Sett  │  │ John D.  │ SWE Intern │ Jan 5   │ [New]   │ │
│          │  │ Jane S.  │ SWE Intern │ Jan 4   │ [Review]│ │
│          │  │ Bob K.   │ Data Int   │ Jan 3   │ [Short] │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  Posting Performance                            │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │     📈 [Chart: Applications over time]     │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 5.2 Create Posting Form
```
┌─────────────────────────────────────────────────────────────┐
│  Create New Internship Posting                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Basic Information                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Position Title *                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  e.g., Software Engineer Intern                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Description *                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Describe the role, responsibilities, and           │   │
│  │  what the intern will learn...                      │   │
│  │                                                     │   │
│  │  [B] [I] [U] [•] [1.] [🔗]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Type *          [▼]  │  │ Industry *         [▼]   │    │
│  │ Internship           │  │ Technology              │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  Position Details                                           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Location *           │  │ Work Type *        [▼]   │    │
│  │ San Francisco, CA    │  │ Hybrid                   │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Start Date *         │  │ End Date *               │    │
│  │ 📅 Feb 1, 2026      │  │ 📅 Aug 1, 2026          │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Salary Range         │  │ Application Deadline *   │    │
│  │ $20 - $25 /hr        │  │ 📅 Jan 15, 2026         │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  Requirements                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Required Skills *                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [React] [TypeScript] [Node.js] [+ Add Skill]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Experience Level [▼] │  │ Minimum GPA              │    │
│  │ Entry Level          │  │ 3.0                      │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  Assign Supervisor                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Select Supervisor *                           [▼]   │   │
│  │ ○ Sarah Johnson (Engineering)                       │   │
│  │ ○ Mike Chen (Product)                               │   │
│  │ ○ No supervisor (assign later)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│        [Save as Draft]  [Preview]  [Publish Posting]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Review Application
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Applications                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┐  John Doe                    Status: [Pending]   │
│  │ 👤   │  john.doe@university.edu                         │
│  │      │  Computer Science, Senior                        │
│  └──────┘  GPA: 3.8 / 4.0                                  │
│                                                             │
│  Applied for: Software Engineer Intern                      │
│  Applied on: January 5, 2026                               │
│                                                             │
│  [📄 View Resume] [💼 View Portfolio] [🔗 LinkedIn]        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Cover Letter                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dear Hiring Manager,                               │   │
│  │                                                     │   │
│  │  I am writing to express my interest in the        │   │
│  │  Software Engineer Intern position at TechCorp...  │   │
│  │                                                     │   │
│  │  [Read more...]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Skills                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [React ✓] [TypeScript ✓] [Node.js ✓] [Python]     │   │
│  │  [MongoDB] [Git] [AWS]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  Skills match: 3/3 required skills ✓                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Decision                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Internal Notes (not visible to applicant)          │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ Strong candidate, good portfolio...           │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Reject]   [Request More Info]   [Shortlist]   [Accept]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Supervisor Interface

### 6.1 Supervisor Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  My Interns                                    🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌──────────┬──────────┬──────────┬──────────┐  │
│          │  │ 👥 5     │ 📝 3     │ ⏰ 2     │ ✅ 45%   │  │
│ 👥 Interns│ │ Active   │ Pending  │ Due This │ Avg      │  │
│          │  │ Interns  │ Reviews  │ Week     │ Progress │  │
│ 📝 Forms │  └──────────┴──────────┴──────────┴──────────┘  │
│          │                                                  │
│ 📊 Reports│ My Interns                                     │
│          │  ┌────────────────────────────────────────────┐ │
│ 💬 Msgs  │  │ ┌────┐                                     │ │
│          │  │ │ 👤 │ John Doe          [● On Track]     │ │
│ ⚙️ Sett  │  │ └────┘ SWE Intern | Week 4 of 12          │ │
│          │  │        Progress: ████████░░░░ 65%         │ │
│          │  │        [View] [Message] [Evaluate]        │ │
│          │  ├────────────────────────────────────────────┤ │
│          │  │ ┌────┐                                     │ │
│          │  │ │ 👤 │ Jane Smith        [⚠️ Needs Attn]  │ │
│          │  │ └────┘ Data Intern | Week 6 of 12         │ │
│          │  │        Progress: ████░░░░░░░░ 35%         │ │
│          │  │        [View] [Message] [Evaluate]        │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  Pending Approvals                              │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │ • Progress Report - John Doe    [Review]  │ │
│          │  │ • Attendance Form - Jane Smith  [Review]  │ │
│          │  │ • Evaluation Form - Bob King    [Review]  │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 7. Faculty Advisor Interface

### 7.1 Advisor Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Faculty Advisor Dashboard                     🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌──────────┬──────────┬──────────┬──────────┐  │
│          │  │ 👥 15    │ 💼 8     │ 📝 5     │ 📄 12    │  │
│ 👥 Students││ Assigned │ With     │ Pending  │ Active   │  │
│          │  │ Students │ Internsps│ Approvals│ Applicats│  │
│ 📝 Forms │  └──────────┴──────────┴──────────┴──────────┘  │
│          │                                                  │
│ 📊 Progress│ Students Overview                             │
│          │  ┌────────────────────────────────────────────┐ │
│ 💬 Msgs  │  │ [All] [With Internship] [Searching] [Idle] │ │
│          │  ├────────────────────────────────────────────┤ │
│ ⚙️ Sett  │  │ John Doe      │ SWE @TechCorp │ Week 4   │ │
│          │  │ Jane Smith    │ Data @DataCo  │ Week 6   │ │
│          │  │ Bob King      │ Searching...  │ 3 Apps   │ │
│          │  │ Alice Brown   │ No activity   │ ⚠️       │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  Pending Approvals                              │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │ Progress Report - John Doe      [Review]  │ │
│          │  │ Progress Report - Jane Smith    [Review]  │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 8. Coordinator Interface

### 8.1 Coordinator Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Internship Coordinator Dashboard              🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌──────────┬──────────┬──────────┬──────────┐  │
│          │  │ 👥 250   │ 💼 180   │ 📝 15    │ 🏢 45    │  │
│ 👥 Students││ Total    │ Placed   │ Letter   │ Partner  │  │
│          │  │ Students │ Students │ Requests │ Companies│  │
│ 📄 Letters│ └──────────┴──────────┴──────────┴──────────┘  │
│          │                                                  │
│ 📋 Postings│ Quick Actions                                 │
│          │  ┌─────────────────────────────────────────────┐│
│ 👥 Advisors│ │ [📄 Generate Letters] [👥 Assign Advisors] ││
│          │  │ [📊 Generate Report] [📋 Review Postings]   ││
│ 📊 Reports│ └─────────────────────────────────────────────┘│
│          │                                                  │
│ ⚙️ Sett  │  Recent Letter Requests                        │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │ Student      │ Type       │ Date   │Action │ │
│          │  │ John Doe     │ Cover      │ Jan 5  │[Gen]  │ │
│          │  │ Jane Smith   │ Reference  │ Jan 4  │[Gen]  │ │
│          │  │ Bob King     │ Cover      │ Jan 3  │[Done] │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  Placement Statistics                           │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │     📊 [Pie Chart: Placement by Industry]  │ │
│          │  │     Tech: 45% | Finance: 25% | Other: 30%  │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 9. Department Head Interface

### 9.1 Department Head Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Computer Science Department                   🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌──────────┬──────────┬──────────┬──────────┐  │
│          │  │ 👥 500   │ 💼 72%   │ 👨‍🏫 12   │ 🏢 85    │  │
│ 📊 Stats │  │ Total    │ Placement│ Faculty  │ Partner  │  │
│          │  │ Students │ Rate     │ Advisors │ Companies│  │
│ 👨‍🏫 Advisors│└──────────┴──────────┴──────────┴──────────┘  │
│          │                                                  │
│ 👥 Students│ Advisor Workload                              │
│          │  ┌────────────────────────────────────────────┐ │
│ 📋 Reports│ │ Dr. Smith     │ ████████████ 45 students  │ │
│          │  │ Dr. Johnson   │ ████████░░░░ 32 students  │ │
│ ⚙️ Sett  │  │ Dr. Williams  │ ██████░░░░░░ 28 students  │ │
│          │  │ Dr. Brown     │ ████░░░░░░░░ 18 students  │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  Department Performance                         │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │     📈 [Line Chart: Placements by Month]   │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  [Generate Department Report]                   │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 10. System Admin Interface

### 10.1 Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  System Administration                         🔔  👤       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 🏠 Dash  │  ┌──────────┬──────────┬──────────┬──────────┐  │
│          │  │ 👥 1.2K  │ 🏢 150   │ 📋 320   │ 💬 5.4K  │  │
│ 👥 Users │  │ Total    │ Active   │ Active   │ Total    │  │
│          │  │ Users    │ Companies│ Postings │ Messages │  │
│ 🏢 Company│ └──────────┴──────────┴──────────┴──────────┘  │
│          │                                                  │
│ 🏛 Depts │  System Health                                  │
│          │  ┌────────────────────────────────────────────┐ │
│ 📊 Analyt│  │ Server: ✅ Online  |  DB: ✅ Healthy       │ │
│          │  │ Queue: ✅ 0 jobs   |  Disk: 45% used       │ │
│ 📝 Logs  │  └────────────────────────────────────────────┘ │
│          │                                                  │
│ ⚙️ Config│  Recent Activity                               │
│          │  ┌────────────────────────────────────────────┐ │
│ 💾 Backup│  │ 🟢 User "john@email.com" logged in         │ │
│          │  │ 🟡 New company "TechCorp" registered       │ │
│          │  │ 🔴 Failed login attempt for "admin"        │ │
│          │  │ 🟢 Posting #234 published                  │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  Quick Actions                                  │
│          │  [+ Add User] [+ Add Company] [📊 Reports]     │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 10.2 User Management
```
┌─────────────────────────────────────────────────────────────┐
│  User Management                               🔔  👤       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────┐                     │
│  │ 🔍 Search users...                │  [+ Add New User]   │
│  └───────────────────────────────────┘                     │
│                                                             │
│  Filters: [All Roles ▼] [All Status ▼] [All Depts ▼]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ☐ │ Name         │ Email           │ Role    │ Status  ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ☐ │ John Doe     │ john@uni.edu    │ Student │ [Active]││
│  │ ☐ │ Jane Admin   │ jane@tech.com   │ Co.Admin│ [Active]││
│  │ ☐ │ Dr. Smith    │ smith@uni.edu   │ Advisor │ [Active]││
│  │ ☐ │ Bob Manager  │ bob@data.com    │ Superv. │[Inactive]│
│  │ ☐ │ Alice Coord  │ alice@uni.edu   │ Coord.  │ [Active]││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Showing 1-10 of 1,234 users     [◀ Prev] [1][2][3] [Next ▶]│
│                                                             │
│  Bulk Actions: [Activate] [Deactivate] [Delete] [Export]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Navigation Flow Diagrams

### 11.1 Student Navigation Flow
```
                              ┌─────────────┐
                              │   Login     │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │  Dashboard  │
                              └──────┬──────┘
                                     │
         ┌───────────┬───────────┬───┴───┬───────────┬───────────┐
         │           │           │       │           │           │
    ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌▼─────────┐ ┌▼─────────┐
    │ Browse  │ │   My    │ │  Forms  │ │ Messages │ │ Profile  │
    │Postings │ │  Apps   │ │         │ │          │ │ Settings │
    └────┬────┘ └────┬────┘ └────┬────┘ └──────────┘ └──────────┘
         │           │           │
    ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
    │ Posting │ │  App    │ │ Submit  │
    │ Details │ │ Details │ │  Form   │
    └────┬────┘ └────┬────┘ └─────────┘
         │           │
    ┌────▼────┐ ┌────▼────┐
    │  Apply  │ │ Accept/ │
    │  Form   │ │ Decline │
    └─────────┘ └─────────┘
```

### 11.2 Company Admin Navigation Flow
```
                              ┌─────────────┐
                              │   Login     │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │  Dashboard  │
                              └──────┬──────┘
                                     │
         ┌───────────┬───────────┬───┴───┬───────────┬───────────┐
         │           │           │       │           │           │
    ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌▼─────────┐ ┌▼─────────┐
    │Postings │ │  Apps   │ │ Interns │ │Analytics │ │ Company  │
    │ Manage  │ │         │ │         │ │          │ │ Profile  │
    └────┬────┘ └────┬────┘ └─────────┘ └──────────┘ └──────────┘
         │           │
    ┌────▼────┐ ┌────▼────┐
    │ Create  │ │ Review  │
    │ Posting │ │  App    │
    └────┬────┘ └────┬────┘
         │           │
    ┌────▼────┐ ┌────▼────┐
    │ Edit/   │ │Accept/  │
    │ Publish │ │Reject   │
    └─────────┘ └─────────┘
```

---

## 12. Responsive Design Guidelines

### 12.1 Breakpoints
```
┌────────────────────────────────────────────────────────────┐
│  Breakpoint    │  Width        │  Layout                   │
├────────────────────────────────────────────────────────────┤
│  Mobile (sm)   │  < 640px      │  Single column, stacked   │
│  Tablet (md)   │  640-1024px   │  2 columns, collapsed nav │
│  Desktop (lg)  │  1024-1280px  │  Sidebar + content        │
│  Large (xl)    │  > 1280px     │  Wide sidebar + content   │
└────────────────────────────────────────────────────────────┘
```

### 12.2 Mobile Navigation
```
Mobile (< 640px):
┌─────────────────────────┐
│  ☰  ICMS       🔔  👤   │
├─────────────────────────┤
│                         │
│   [Main Content Area]   │
│                         │
│                         │
├─────────────────────────┤
│ 🏠 │ 💼 │ 📄 │ 💬 │ 👤 │  <- Bottom nav
└─────────────────────────┘

Hamburger Menu Opens:
┌─────────────────────────┐
│  ✕  Close               │
├─────────────────────────┤
│  🏠 Dashboard           │
│  💼 Internships         │
│  📄 Applications        │
│  📝 Forms               │
│  💬 Messages            │
│  👤 Profile             │
│  ⚙️ Settings            │
│  ─────────────────────  │
│  🚪 Logout              │
└─────────────────────────┘
```

### 12.3 Touch Target Guidelines
```
Minimum touch target size: 44x44 pixels
Button padding: min 12px vertical, 16px horizontal
Link spacing: min 8px between clickable elements
Form inputs: min height 48px
```

### 12.4 Accessibility Guidelines
```
- All interactive elements must be keyboard accessible
- Focus states must be clearly visible
- Color contrast ratio: minimum 4.5:1 for text
- All images must have alt text
- Form inputs must have associated labels
- Error messages must be descriptive
- Support for screen readers (ARIA labels)
- Reduced motion option for animations
```

---

## Appendix: Component Library Reference

### Button Component
```tsx
<Button 
  variant="primary|secondary|outline|ghost|danger"
  size="sm|md|lg"
  disabled={boolean}
  loading={boolean}
  icon={IconComponent}
>
  Button Text
</Button>
```

### Card Component
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge Component
```tsx
<Badge 
  variant="default|success|warning|error|info"
>
  Status Text
</Badge>
```

### Input Component
```tsx
<Input
  label="Field Label"
  placeholder="Enter value..."
  error="Error message"
  helperText="Helper text"
  required={boolean}
  disabled={boolean}
/>
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
*System: ICMS - Internship and Career Management System*

