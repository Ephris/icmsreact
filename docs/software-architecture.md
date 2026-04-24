# ICMS - Software Architecture Documentation

## Internship and Career Management System

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Monolithic MVC Architecture](#2-monolithic-mvc-architecture)
3. [Architecture Components](#3-architecture-components)
4. [Technology Stack](#4-technology-stack)
5. [Request Flow](#5-request-flow)
6. [Real-time Communication](#6-real-time-communication)
7. [Architecture Benefits](#7-architecture-benefits)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Comparison with Alternative Architectures](#9-comparison-with-alternative-architectures)

---

## 1. Architecture Overview

> **📁 Architecture Diagrams Available (Draw.io format):**
> - [Software Architecture Overview](diagrams/architecture/software-architecture-overview.drawio)
> - [MVC Pattern Diagram](diagrams/architecture/mvc-pattern-diagram.drawio)
> - [Request Flow Diagram](diagrams/architecture/request-flow-diagram.drawio)
> - [Real-time Communication Diagram](diagrams/architecture/realtime-communication-diagram.drawio)
> - [Technology Stack Diagram](diagrams/architecture/technology-stack-diagram.drawio)
> - [Architecture Comparison Diagram](diagrams/architecture/architecture-comparison-diagram.drawio)
> - [Deployment Diagram](diagrams/architecture/deployment-diagram.drawio)

### 1.1 Proposed Software Architecture

ICMS (Internship and Career Management System) is built using a **Monolithic MVC (Model-View-Controller) Architecture** with a modern frontend stack. This architecture pattern combines the traditional MVC design pattern with contemporary web technologies to deliver a seamless single-page application (SPA) experience while maintaining the simplicity and reliability of a monolithic deployment.

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │   Web Browser   │  │  React 19 + TS  │  │   Tailwind CSS + shadcn/ui     │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────────────┘  │
│           │                    │                                                 │
│           └────────────────────┼─────────────────────────────────────────────────│
│                                │                                                 │
│                    ┌───────────▼───────────┐                                     │
│                    │  Inertia.js Client    │                                     │
│                    │  (Page Management)    │                                     │
│                    └───────────┬───────────┘                                     │
└────────────────────────────────┼─────────────────────────────────────────────────┘
                                 │ XHR Requests (JSON)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MONOLITHIC APPLICATION SERVER (Laravel 12)                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           MVC PATTERN                                     │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │   Routes    │──│   Middleware    │──│   Role-Based Controllers    │   │   │
│  │  │  (web.php)  │  │  (Auth, CSRF)   │  │  (Student, Admin, etc.)     │   │   │
│  │  └─────────────┘  └─────────────────┘  └──────────────┬──────────────┘   │   │
│  │                                                        │                  │   │
│  │         ┌──────────────────────────────────────────────┼──────────────┐   │   │
│  │         │                                              │              │   │   │
│  │         ▼                                              ▼              │   │   │
│  │  ┌─────────────────┐                        ┌─────────────────────┐   │   │   │
│  │  │  Inertia.js     │                        │   Eloquent Models   │   │   │   │
│  │  │  (View Layer)   │                        │   (Data Access)     │   │   │   │
│  │  └─────────────────┘                        └──────────┬──────────┘   │   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                            │                     │
│  ┌────────────────────────────┐  ┌────────────────────────────────────────┐     │
│  │      SERVICE LAYER         │  │         REAL-TIME LAYER                │     │
│  ├────────────────────────────┤  ├────────────────────────────────────────┤     │
│  │  • NotificationService     │  │  • Laravel Events                      │     │
│  │  • AuditLogger             │  │  • Pusher Broadcasting                 │     │
│  │  • FileValidator           │  │  • Laravel Echo                        │     │
│  │  • ContactsResolver        │  │  • WebSocket Channels                  │     │
│  └────────────────────────────┘  └────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DATA LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │   MySQL/MariaDB     │  │    File Storage     │  │      Cache Layer        │  │
│  │   (Primary DB)      │  │    (Documents)      │  │   (Sessions, Data)      │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Why Monolithic MVC Architecture?

The Monolithic MVC Architecture was chosen for ICMS due to its alignment with the project's requirements:

| Requirement | How Monolithic MVC Addresses It |
|-------------|--------------------------------|
| Rapid Development | Single codebase, shared types between frontend and backend |
| Team Size | Suitable for small to medium development teams |
| Deployment Simplicity | Single deployable unit reduces operational complexity |
| User Experience | SPA-like experience via Inertia.js without API complexity |
| Security | Server-side routing and validation, no exposed API endpoints |
| Maintainability | Clear separation of concerns within MVC pattern |

---

## 2. Monolithic MVC Architecture

### 2.1 Definition

A **Monolithic MVC Architecture** is a software design pattern where:

- **Monolithic**: The entire application is built as a single, unified codebase that is deployed as one unit. All components (frontend views, backend logic, data access) are packaged together.

- **MVC (Model-View-Controller)**: A design pattern that separates the application into three interconnected components:
  - **Model**: Manages data, business logic, and database interactions
  - **View**: Handles the presentation layer and user interface
  - **Controller**: Processes user input and coordinates between Model and View

### 2.2 ICMS MVC Implementation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MVC PATTERN IN ICMS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────┐         ┌───────────────────┐                       │
│   │                   │         │                   │                       │
│   │       VIEW        │◄────────│    CONTROLLER     │                       │
│   │                   │         │                   │                       │
│   │  • React Pages    │         │  • StudentController                      │
│   │  • UI Components  │         │  • CompanyAdminController                 │
│   │  • Layouts        │         │  • CoordinatorController                  │
│   │  • Tailwind CSS   │         │  • DepartmentHeadController               │
│   │                   │         │  • FacultyAdvisorController               │
│   └───────────────────┘         │  • CompanySupervisorController            │
│           ▲                     │                   │                       │
│           │                     └─────────┬─────────┘                       │
│           │                               │                                  │
│           │     ┌─────────────────────────▼─────────────────────────┐       │
│           │     │                                                    │       │
│           │     │                     MODEL                          │       │
│           │     │                                                    │       │
│           │     │  ┌──────────────────────────────────────────────┐ │       │
│           │     │  │              Eloquent Models                  │ │       │
│           │     │  ├──────────────────────────────────────────────┤ │       │
│           │     │  │  User          │  Student       │  Company   │ │       │
│           │     │  │  Application   │  Posting       │  Form      │ │       │
│           │     │  │  Department    │  Notification  │  Message   │ │       │
│           │     │  │  Conversation  │  Feedback      │  Letter    │ │       │
│           │     │  │  InternshipAnalytics            │  ...       │ │       │
│           │     │  └──────────────────────────────────────────────┘ │       │
│           │     │                                                    │       │
│           │     └────────────────────────────────────────────────────┘       │
│           │                               │                                  │
│           │                               ▼                                  │
│           │                     ┌─────────────────┐                         │
│           └─────────────────────│    DATABASE     │                         │
│              (Data for display) │     (MySQL)     │                         │
│                                 └─────────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture Components

### 3.1 Model Layer (Eloquent ORM)

The Model layer handles all data-related logic using Laravel's Eloquent ORM. Each model represents a database table and encapsulates business logic.

| Model | Description | Key Relationships |
|-------|-------------|-------------------|
| `User` | Core user authentication and profile | HasOne Student, HasMany Notifications |
| `Student` | Student-specific data and academic info | BelongsTo User, HasMany Applications |
| `Company` | Partner company information | HasMany Postings, HasMany Supervisors |
| `Department` | Academic departments | HasMany Students, HasOne DepartmentHead |
| `Posting` | Internship/job postings | BelongsTo Company, HasMany Applications |
| `Application` | Student applications to postings | BelongsTo Student, BelongsTo Posting |
| `Form` | Documents and evaluations | BelongsTo Student, BelongsTo Advisor |
| `Conversation` | Chat conversations | HasMany Messages, HasMany Participants |
| `Message` | Chat messages | BelongsTo Conversation, BelongsTo Sender |
| `Notification` | System notifications | BelongsTo User |
| `InternshipAnalytics` | Performance tracking data | BelongsTo Application |

**Model Location**: `app/Models/`

### 3.2 View Layer (React + Inertia.js)

The View layer consists of React components rendered via Inertia.js. This provides a modern SPA experience while keeping server-side routing.

```
resources/js/
├── pages/                      # Page Components (Views)
│   ├── admin/                  # Admin dashboard pages
│   ├── student/                # Student portal pages
│   ├── company-admin/          # Company admin pages
│   ├── company-supervisor/     # Supervisor pages
│   ├── coordinator/            # Coordinator pages
│   ├── department-head/        # Department head pages
│   ├── faculty-advisor/        # Faculty advisor pages
│   ├── chat/                   # Real-time chat pages
│   └── auth/                   # Authentication pages
│
├── components/                 # Reusable UI Components
│   ├── ui/                     # Base UI components (shadcn/ui)
│   ├── animations/             # Animation components
│   └── ChatBot/                # AI chatbot component
│
├── layouts/                    # Layout Templates
│   ├── app-layout.tsx          # Main application layout
│   └── auth-layout.tsx         # Authentication layout
│
└── hooks/                      # Custom React Hooks
    ├── useNotifications.ts     # Notification handling
    └── useConversationRealtime.ts  # Real-time chat
```

### 3.3 Controller Layer

Controllers handle HTTP requests, process business logic, and return Inertia responses. ICMS uses **role-based controllers** for clear separation of concerns.

| Controller | Responsibility | User Role |
|------------|----------------|-----------|
| `StudentController` | Student dashboard, applications, forms | Student |
| `CompanyAdminController` | Company management, postings, supervisors | Company Admin |
| `CompanySupervisorController` | Student supervision, evaluations | Supervisor |
| `CoordinatorController` | Department oversight, letters | Coordinator |
| `DepartmentHeadController` | Department management, advisors | Dept. Head |
| `FacultyAdvisorController` | Student guidance, forms approval | Advisor |
| `AdminHomeController` | System administration, homepage CMS | Admin |
| `ConversationController` | Chat conversations management | All Users |
| `MessageController` | Real-time messaging | All Users |
| `NotificationController` | System notifications | All Users |

**Controller Location**: `app/Http/Controllers/`

### 3.4 Service Layer

The service layer contains reusable business logic that can be shared across multiple controllers.

| Service | Purpose |
|---------|---------|
| `NotificationService` | Handles notification creation and delivery |
| `AuditLogger` | Logs system actions for auditing |
| `FileValidator` | Validates uploaded files |
| `ContactsResolver` | Resolves user contacts for messaging |

**Service Location**: `app/Services/`

---

## 4. Technology Stack

### 4.1 Complete Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ICMS TECHNOLOGY STACK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FRONTEND                                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  React 19   │ │ TypeScript  │ │ Tailwind 4  │ │  shadcn/ui + Radix UI   ││
│  │  (UI Lib)   │ │  (Types)    │ │   (CSS)     │ │    (Components)         ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Inertia.js  │ │ Laravel Echo│ │  Recharts   │ │      Lucide Icons       ││
│  │  (Bridge)   │ │ (WebSocket) │ │  (Charts)   │ │       (Icons)           ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
│                                                                              │
│  BACKEND                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Laravel 12  │ │ Eloquent    │ │ Inertia.js  │ │    Laravel Events       ││
│  │ (Framework) │ │   (ORM)     │ │  (Server)   │ │   (Broadcasting)        ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                            │
│  │   Pusher    │ │   DomPDF    │ │    Ziggy    │                            │
│  │ (WebSocket) │ │   (PDFs)    │ │  (Routes)   │                            │
│  └─────────────┘ └─────────────┘ └─────────────┘                            │
│                                                                              │
│  DATA & INFRASTRUCTURE                                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   MySQL     │ │File Storage │ │    Vite     │ │        PHP 8.2+         ││
│  │ (Database)  │ │  (Files)    │ │  (Build)    │ │       (Runtime)         ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack Table

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | | | |
| UI Framework | React | 19.0 | Component-based user interface |
| Type System | TypeScript | 5.7 | Static type checking |
| CSS Framework | Tailwind CSS | 4.0 | Utility-first styling |
| UI Components | shadcn/ui + Radix | Latest | Accessible component library |
| Icons | Lucide React | Latest | Icon system |
| Charts | Recharts | 2.15 | Data visualization |
| **Bridge** | | | |
| SPA Adapter | Inertia.js | 2.0 | Server-driven SPA |
| Route Helper | Ziggy | 2.4 | Laravel routes in JavaScript |
| **Backend** | | | |
| Framework | Laravel | 12.0 | PHP MVC framework |
| ORM | Eloquent | (Laravel) | Database abstraction |
| PDF Generation | DomPDF | 3.1 | Document generation |
| **Real-time** | | | |
| WebSocket | Pusher | 7.2 | Real-time messaging |
| Client | Laravel Echo | 2.2 | WebSocket client |
| **Database** | | | |
| RDBMS | MySQL/MariaDB | 8.0+/10.5+ | Primary data storage |
| **Build Tools** | | | |
| Bundler | Vite | 6.0 | Frontend build tool |
| **Runtime** | | | |
| Server | PHP | 8.2+ | Backend runtime |

---

## 5. Request Flow

### 5.1 Standard Page Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PAGE REQUEST FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

 USER                    BROWSER                     SERVER                   DB
  │                         │                           │                      │
  │  1. Click Link          │                           │                      │
  │ ───────────────────────>│                           │                      │
  │                         │                           │                      │
  │                         │  2. XHR Request           │                      │
  │                         │  (Inertia Protocol)       │                      │
  │                         │ ─────────────────────────>│                      │
  │                         │                           │                      │
  │                         │                           │  3. Route Matching   │
  │                         │                           │ ────────────────────>│
  │                         │                           │                      │
  │                         │                           │  4. Middleware       │
  │                         │                           │  (Auth, CSRF)        │
  │                         │                           │                      │
  │                         │                           │  5. Controller       │
  │                         │                           │  Method Execution    │
  │                         │                           │                      │
  │                         │                           │  6. Eloquent Query   │
  │                         │                           │ ─────────────────────>
  │                         │                           │                      │
  │                         │                           │  7. Data Retrieved   │
  │                         │                           │ <─────────────────────
  │                         │                           │                      │
  │                         │  8. Inertia Response      │                      │
  │                         │  (Page Component + Props) │                      │
  │                         │ <─────────────────────────│                      │
  │                         │                           │                      │
  │                         │  9. React Renders         │                      │
  │                         │  Component with Props     │                      │
  │                         │                           │                      │
  │  10. Updated UI         │                           │                      │
  │ <───────────────────────│                           │                      │
  │                         │                           │                      │
```

### 5.2 Detailed Request Flow Example

**Example: Student Viewing Application List**

```
Step 1: User clicks "My Applications" link
        ↓
Step 2: Inertia.js intercepts click, sends XHR to /student/applications
        ↓
Step 3: Laravel Router matches route to StudentController@applications
        ↓
Step 4: Middleware stack executes:
        • auth (verify user is logged in)
        • check.user.status (verify account is active)
        ↓
Step 5: StudentController::applications() executes:
        • Retrieves authenticated user
        • Fetches student record
        • Queries applications with relationships
        ↓
Step 6: Controller returns Inertia::render():
        return Inertia::render('student/applications', [
            'applications' => $applications,
            'student' => $student
        ]);
        ↓
Step 7: Inertia.js receives JSON response:
        {
            "component": "student/applications",
            "props": { "applications": [...], "student": {...} }
        }
        ↓
Step 8: React component receives props and renders UI
```

### 5.3 Form Submission Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FORM SUBMISSION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

 USER                    REACT                      LARAVEL                   DB
  │                         │                           │                      │
  │  1. Fill Form           │                           │                      │
  │ ───────────────────────>│                           │                      │
  │                         │                           │                      │
  │  2. Submit              │                           │                      │
  │ ───────────────────────>│                           │                      │
  │                         │                           │                      │
  │                         │  3. Inertia POST          │                      │
  │                         │  with FormData            │                      │
  │                         │ ─────────────────────────>│                      │
  │                         │                           │                      │
  │                         │                           │  4. Validation       │
  │                         │                           │  (FormRequest)       │
  │                         │                           │                      │
  │                         │                           │  5. Controller       │
  │                         │                           │  Business Logic      │
  │                         │                           │                      │
  │                         │                           │  6. Model::create()  │
  │                         │                           │ ─────────────────────>
  │                         │                           │                      │
  │                         │                           │  7. Record Created   │
  │                         │                           │ <─────────────────────
  │                         │                           │                      │
  │                         │                           │  8. Event Dispatch   │
  │                         │                           │  (Notifications)     │
  │                         │                           │                      │
  │                         │  9. Redirect Response     │                      │
  │                         │ <─────────────────────────│                      │
  │                         │                           │                      │
  │  10. Success Message    │                           │                      │
  │ <───────────────────────│                           │                      │
  │                         │                           │                      │
```

---

## 6. Real-time Communication

### 6.1 Real-time Architecture

ICMS implements real-time features using Laravel Events, Pusher, and Laravel Echo.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COMMUNICATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

                         PUSHER CLOUD
                    ┌─────────────────────┐
                    │                     │
                    │  WebSocket Server   │
                    │                     │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  Browser 1  │     │  Browser 2  │     │  Browser N  │
    │ (Student)   │     │ (Advisor)   │     │   (...)     │
    │             │     │             │     │             │
    │ Laravel Echo│     │ Laravel Echo│     │ Laravel Echo│
    └─────────────┘     └─────────────┘     └─────────────┘
           ▲                   ▲                   ▲
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    │   LARAVEL SERVER    │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │ Event Classes │  │
                    │  │ • MessageSent │  │
                    │  │ • Typing      │  │
                    │  │ • Notification│  │
                    │  └───────────────┘  │
                    │         │           │
                    │         ▼           │
                    │  ┌───────────────┐  │
                    │  │  Broadcasting │  │
                    │  │    Driver     │  │
                    │  │   (Pusher)    │  │
                    │  └───────────────┘  │
                    │                     │
                    └─────────────────────┘
```

### 6.2 Real-time Events

| Event | Channel Type | Purpose |
|-------|--------------|---------|
| `MessageSent` | Private | New chat message notification |
| `MessageEdited` | Private | Message edit notification |
| `MessageDeleted` | Private | Message deletion notification |
| `Typing` | Private | Typing indicator |
| `MessageReadEvent` | Private | Message read receipt |
| `NotificationReceived` | Private | System notification |
| `NotificationRead` | Private | Notification read status |

---

## 7. Architecture Benefits

### 7.1 Benefits of Monolithic MVC for ICMS

| Benefit | Description | Impact on ICMS |
|---------|-------------|----------------|
| **Single Deployment** | One codebase, one deployment process | Simplified CI/CD, reduced operational complexity |
| **Type-Safe Data** | Props passed directly from PHP to React | No API serialization errors, IDE autocompletion |
| **Server-Side Routing** | Routes defined in Laravel, not React | Better SEO, secure route handling, no client-side route exposure |
| **Shared Validation** | Laravel validation shared with frontend | Consistent error handling, DRY principle |
| **Rapid Development** | No API layer to maintain | Faster feature development, reduced boilerplate |
| **Simplified Authentication** | Session-based auth, no token management | More secure, simpler implementation |
| **Real-time Integration** | Laravel Events + Pusher seamlessly integrated | Native real-time support without separate services |

### 7.2 Scalability Approach

While monolithic, ICMS can scale effectively:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCALABILITY STRATEGY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  HORIZONTAL SCALING                    VERTICAL SCALING
  ───────────────────                   ────────────────────
  
  ┌─────────────────┐                   ┌─────────────────────┐
  │  Load Balancer  │                   │  Increase Server    │
  └────────┬────────┘                   │  Resources          │
           │                            │  • CPU              │
     ┌─────┼─────┐                      │  • RAM              │
     ▼     ▼     ▼                      │  • Storage          │
  ┌─────┐┌─────┐┌─────┐                 └─────────────────────┘
  │App 1││App 2││App N│
  └─────┘└─────┘└─────┘                 DATABASE SCALING
     │     │     │                      ────────────────────
     └─────┼─────┘                      
           ▼                            ┌─────────────────────┐
  ┌─────────────────┐                   │  • Read Replicas    │
  │  Shared MySQL   │                   │  • Connection Pool  │
  │  (Primary)      │                   │  • Query Caching    │
  └─────────────────┘                   └─────────────────────┘
```

---

## 8. Deployment Architecture

### 8.1 Deployment Diagram Overview

The ICMS deployment architecture describes how software components are deployed across hardware nodes.

> **📁 See:** [Deployment Diagram](diagrams/architecture/deployment-diagram.drawio)

### 8.2 Hardware Nodes

| Node | Type | Description |
|------|------|-------------|
| **Client Device** | End-user Computer/Mobile | Web browser running React application |
| **Application Server** | Web Server | Hosts Laravel application, PHP runtime, Inertia.js |
| **Database Server** | Database Server | MySQL/MariaDB database engine |
| **File Storage** | Storage Server | Document and media file storage |
| **Pusher Cloud** | External Service | WebSocket server for real-time features |

### 8.3 Software Components per Node

#### Client Device
```
<<device>> Client
├── <<artifact>> Web Browser (Chrome, Firefox, Safari, Edge)
├── <<artifact>> React 19 + TypeScript Runtime
└── <<component>> User Role Modules
    ├── STUDENT
    ├── ADMIN
    ├── COORDINATOR
    ├── DEPT_HEAD
    ├── ADVISOR
    ├── COMPANY_ADMIN
    └── SUPERVISOR
```

#### Application Server
```
<<device>> Application Server
├── <<artifact>> Laravel 12 + Inertia.js + PHP 8.2
└── <<component>> Application Modules
    ├── User Management
    ├── Authentication
    ├── Posting Management
    ├── Application Management
    ├── Chat Management
    ├── Notification Management
    ├── Form Management
    ├── Analytics Management
    ├── Department Management
    ├── Company Management
    ├── Letter Generation (DomPDF)
    ├── Feedback Management
    ├── Event Broadcasting
    ├── File Management
    ├── Audit Logger
    └── PDF Generation
```

#### Database Server
```
<<device>> Database Server
├── <<artifact>> MySQL 8.0+ / MariaDB 10.5+
└── <<component>> Database Tables
    ├── users
    ├── students
    ├── postings
    ├── applications
    ├── messages
    ├── conversations
    ├── notifications
    ├── forms
    ├── companies
    ├── departments
    └── + 15 more tables
```

#### File Storage
```
<<device>> File Storage
├── <<artifact>> Local File System
└── <<component>> Storage Directories
    ├── Documents (PDFs, Letters)
    ├── Images (Avatars, Logos)
    └── Resumes/Forms (Uploads)
```

### 8.4 Communication Protocols

| From | To | Protocol | Description |
|------|-----|----------|-------------|
| Client | Application Server | HTTP/HTTPS | Web requests, Inertia.js XHR |
| Application Server | Database Server | MySQL Protocol | Eloquent ORM queries |
| Application Server | File Storage | File I/O | Document read/write operations |
| Application Server | Pusher Cloud | HTTP API | Event broadcasting |
| Pusher Cloud | Client | WebSocket | Real-time notifications, chat |

### 8.5 Deployment Configuration

```
Production Environment:
├── Web Server: Nginx / Apache
├── PHP: 8.2+ with required extensions
├── Node.js: For building frontend assets
├── Database: MySQL 8.0+ or MariaDB 10.5+
├── SSL: HTTPS enabled
└── Environment Variables:
    ├── APP_ENV=production
    ├── APP_DEBUG=false
    ├── DB_CONNECTION=mysql
    ├── BROADCAST_DRIVER=pusher
    └── PUSHER_* credentials
```

---

## 9. Comparison with Alternative Architectures

### 8.1 Architecture Comparison Table

| Aspect | Monolithic MVC (ICMS) | Three-Tier (REST API) | Microservices |
|--------|----------------------|----------------------|---------------|
| **Complexity** | Low | Medium | High |
| **Deployment** | Single unit | 2 deployments (API + SPA) | Many deployments |
| **Team Size** | Small-Medium | Medium | Large |
| **Development Speed** | Fast | Medium | Slow initially |
| **Scalability** | Vertical + Limited Horizontal | Horizontal per tier | Independent per service |
| **Data Consistency** | Strong (single DB) | Strong | Eventual (distributed) |
| **Testing** | Simpler | Moderate | Complex |
| **Real-time** | Integrated | Separate concern | Separate service |
| **API Versioning** | Not needed | Required | Required per service |

### 8.2 Why Not Three-Tier (REST API)?

| Consideration | Three-Tier Approach | ICMS Decision |
|---------------|---------------------|---------------|
| API Maintenance | Requires separate API versioning | Not needed with Inertia.js |
| Type Safety | Manual type sync between API and frontend | Automatic with Inertia props |
| Authentication | Token-based (JWT/OAuth) | Simple session-based |
| Development Speed | Slower (two codebases) | Faster (single codebase) |

### 8.3 Why Not Microservices?

| Consideration | Microservices Approach | ICMS Decision |
|---------------|------------------------|---------------|
| Team Size | Requires large, specialized teams | Not suitable for project scope |
| Operational Overhead | High (container orchestration, service mesh) | Unnecessary complexity |
| Data Consistency | Challenging with distributed data | Single database is sufficient |
| Network Latency | Inter-service communication overhead | Not a concern with monolith |

### 8.4 Conclusion

The **Monolithic MVC Architecture** with Laravel + Inertia.js + React is the optimal choice for ICMS because:

1. **Project Scale**: ICMS is a departmental system with predictable user load
2. **Development Team**: Suitable for the available team size and expertise
3. **Feature Requirements**: Real-time features are easily integrated
4. **Maintenance**: Single codebase simplifies long-term maintenance
5. **Performance**: Adequate for expected concurrent users
6. **Security**: Server-side routing provides inherent security benefits

---

## Appendix A: Directory Structure

```
icmsreact/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # MVC Controllers (role-based)
│   │   ├── Middleware/         # Request middleware
│   │   └── Requests/           # Form request validation
│   ├── Models/                 # Eloquent models
│   ├── Services/               # Business logic services
│   ├── Events/                 # Laravel events
│   ├── Notifications/          # Notification classes
│   └── Policies/               # Authorization policies
├── resources/
│   ├── js/
│   │   ├── pages/              # React page components (Views)
│   │   ├── components/         # Reusable React components
│   │   ├── layouts/            # Layout templates
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utility functions
│   └── css/                    # Stylesheets
├── routes/
│   ├── web.php                 # Web routes
│   ├── auth.php                # Authentication routes
│   └── channels.php            # Broadcast channels
├── database/
│   ├── migrations/             # Database migrations
│   └── seeders/                # Data seeders
└── config/                     # Application configuration
```

---

## Appendix B: Role-Based Access Matrix

| Feature | Student | Advisor | Supervisor | Dept. Head | Coordinator | Company Admin | Admin |
|---------|:-------:|:-------:|:----------:|:----------:|:-----------:|:-------------:|:-----:|
| View Postings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Apply to Postings | ✓ | | | | | | |
| Manage Students | | ✓ | ✓ | ✓ | ✓ | | ✓ |
| Approve Forms | | ✓ | ✓ | | | | |
| Create Postings | | | ✓ | | | ✓ | ✓ |
| Manage Company | | | | | | ✓ | ✓ |
| Manage Department | | | | ✓ | | | ✓ |
| Generate Letters | | | | | ✓ | | ✓ |
| System Admin | | | | | | | ✓ |

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*System: ICMS - Internship and Career Management System*

