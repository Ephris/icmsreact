import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { PageProps } from '@inertiajs/core';

declare module '@inertiajs/core' {
  interface PageProps {
    flash?: {
      success?: string;
      error?: string;
    };
  }
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string | null;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
  icon?: React.ElementType;
  color?: string;
};


export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

// Matches `users` table
export interface User {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    specialization?: string;
    email: string;
    role: 'student' | 'coordinator' | 'dept_head' | 'advisor' | 'company_admin' | 'supervisor' | 'admin';
    department_id?: number;
    phone?: string;
    gender?: string;
    status: 'active' | 'inactive';
    avatar?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    student_count: number;
    students: { student_id: number; name: string }[];
    advisorAssignments?: Array<{ advisor_id: number; student_id: number }>;
    companyAssignments?: Array<{ company_id: number; admin_id: number }>; // for company admin assignments
}

// Matches `departments` table
export interface Department {
    department_id: number;
    name: string;
    description?: string;
    code?: string;
    faculty?: string;
    dept_head_id?: number;
    deptHead?: { user_id: number; name: string } | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    status: 'active' | 'inactive';
}

// Matches `students` table
export interface Student {
    student_id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    name: string; // convenience for frontend (first+last)
    username: string;
    email?: string;
    phone?: string;
    status: 'active' | 'inactive';
    cgpa?: number;
    skills?: string[];
    year_of_study?: string;
    certifications?: string[];
    bio?: string;
    resume_path?: string;
  profile_image_path?: string;
  portfolio_url?: string;
    linkedin_url?: string;
    accepted_application_id?: number;
  linkedin_url?: string;
  expected_salary?: string;
  notice_period?: string;
  preferred_locations?: string[];
  graduation_year?: number;
    advisors: { user_id: number; name: string }[];
    created_at?: string;
    updated_at?: string;
}

// Advisor assignment model (DB: advisor_assignments)
export interface AdvisorAssignment {
    assignment_id: number;
    advisor_id: number;
    student_id: number;
    department_id: number;
    assigned_at: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}
export interface Advisor {
    user_id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone?: string;
    specialization?: string;
    status: 'active' | 'inactive';
    students?: { student_id: number; name: string }[];
    student_count?: number;
}

// Matches `companies` table
export interface Company {
    company_id: number;
    name: string;
    description?: string;
    industry?: string;
    location?: string;
    website?: string;
    company_size?: string;
    founded_year?: number;
    contact_email?: string;
    linkedin_url?: string;
    status: 'pending' | 'approved';
    deleted_at?: string;
    admin?: { user_id: number; name: string } | null;
}

export interface DashboardStats {
    studentCount: number;
    advisorCount: number;
    assignmentCount: number;
}

// Matches `company_admin_assignments` table
export interface CompanyAdminAssignment {
    assignment_id: number;
    company_id: number;
    admin_id: number;
    assigned_at: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// For trashed users
export type TrashedUser = {
    user_id: number;
    name: string;
    role: string;
    email: string;
    deleted_at: string;
};

// Pagination type
export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    from: number; // Added
    to: number;   // Added
};

export type CompanyIndexProps = PageProps & {
    companies: Company[];
    success?: string;
    filters?: { search?: string; status?: string };
};

export type CompanyTrashedProps = PageProps & {
    trashedCompanies: Company[];
    success?: string;
    error?: string;
};

//supervisor
export interface Supervisor {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TrashedSupervisor {
  user_id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  deleted_at?: string;
}

// Added full Posting interface for detail view
export interface Posting {
    posting_id: number;
    title: string;
    description: string; // Explanation: Added to match DB and for detail view display.
    type: 'internship' | 'career';
    status: 'open' | 'closed' | 'draft';
    industry: string;
    location: string;
    salary_range?: string;
    start_date: string;
    end_date?: string;
    application_deadline: string;
    requirements: string;
    skills_required?: string[];
    application_instructions?: string;
    work_type: 'remote' | 'onsite' | 'hybrid';
    benefits?: string;
    experience_level: 'entry' | 'mid' | 'senior';
    min_gpa?: number;
    supervisor_id?: number;
    company: {
    company_id: number;
    name: string;
    };
    supervisor?: {
        user_id: number;
        first_name: string;
        last_name: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

// Added full Application interface for detail view
export interface Application {
    application_id: number;
    student_id: number;
    posting_id: number;
    resume: string; // Path to resume
    cover_letter?: string; // Text or path
    cover_letter_path?: string; // File path
    portfolio?: string;
    skills?: string[];
    certifications?: string[];
    status: 'pending' | 'approved' | 'rejected' | 'accepted' | 'inactive';
    accepted_at?: string;
    feedback?: string;
    student_approved_at?: string;
    offer_expiration?: string;
    created_at: string;
    updated_at: string;
    posting: Posting;
}

// import { LucideIcon } from 'lucide-react';
// import type { Config } from 'ziggy-js';
// import { PageProps  } from '@inertiajs/core';

// declare module '@inertiajs/core' {
//   interface PageProps {
//     flash?: {
//       success?: string;
//       error?: string;
//     };
//   }
// }

// export interface Auth {
//     user: User;
// }

// export interface BreadcrumbItem {
//     title: string;
//     href: string | null;
// }

// export interface NavGroup {
//     title: string;
//     items: NavItem[];
// }

// export interface NavItem {
//     title: string;
//     href: string;
//     icon?: LucideIcon | null;
//     isActive?: boolean;
// }

// export interface SharedData {
//     name: string;
//     quote: { message: string; author: string };
//     auth: Auth;
//     ziggy: Config & { location: string };
//     sidebarOpen: boolean;
//     [key: string]: unknown;
// }

// // Matches `users` table
// export interface User {
//     user_id: number;
//     username: string;
//     name: string;
//     first_name: string;
//     last_name: string;
//     specialization?: string;
//     email: string;
//     role: 'student' | 'advisor' | 'coordinator' | 'dept_head' | 'company_admin' | 'supervisor' | 'admin';
//     department_id?: number;
//     phone?: string;
//     status: 'active' | 'inactive';
//     avatar?: string;
//     created_at: string;
//     updated_at: string;
//     deleted_at?: string | null;
//     student_count: number;
//     students: { student_id: number; name: string }[];
//     advisorAssignments?: Array<{ advisor_id: number; student_id: number }>;
//     companyAssignments?: Array<{ company_id: number; admin_id: number }>; // for company admin assignments
// }

// // Matches `departments` table
// export interface Department {
//     department_id: number;
//     name: string;
//     description?: string;
//     code?: string;
//     faculty?: string;
//     dept_head_id?: number;
//     deptHead?: { user_id: number; name: string } | null;
//     created_at?: string;
//     updated_at?: string;
//     deleted_at?: string | null;
//     status: 'active' | 'inactive';
// }

// // Matches `students` table
// export interface Student {
//     student_id: number;
//     user_id: number;
//     first_name: string;
//     last_name: string;
//     name: string; // convenience for frontend (first+last)
//     username: string;
//     email?: string;
//     phone?: string;
//     status: 'active' | 'inactive';
//     cgpa?: number;
//     skills?: string[];
//     year_of_study?: string;
//     certifications?: string[];
//     bio?: string;
//     portfolio_url?: string;
//     linkedin_url?: string;
//     advisors: { user_id: number; name: string }[];
//     created_at?: string;
//     updated_at?: string;
// }

// // Advisor assignment model (DB: advisor_assignments)
// export interface AdvisorAssignment {
//     assignment_id: number;
//     advisor_id: number;
//     student_id: number;
//     department_id: number;
//     assigned_at: string;
//     status: 'active' | 'inactive';
//     created_at?: string;
//     updated_at?: string;
// }
// export interface Advisor {
//     user_id: number;
//     name: string;
//     first_name: string;
//     last_name: string;
//     username: string;
//     email: string;
//     phone?: string;
//     specialization?: string;
//     status: 'active' | 'inactive';
//     students?: { student_id: number; name: string }[];
//     student_count?: number;
// }

// // Matches `companies` table
// export interface Company {
//     company_id: number;
//     name: string;
//     description?: string;
//     industry?: string;
//     location?: string;
//     website?: string;
//     company_size?: string;
//     founded_year?: number;
//     contact_email?: string;
//     linkedin_url?: string;
//     status: 'pending' | 'approved';
//     deleted_at?: string;
//     admin?: { user_id: number; name: string } | null;
// }

// export interface DashboardStats {
//     studentCount: number;
//     advisorCount: number;
//     assignmentCount: number;
// }

// // Matches `company_admin_assignments` table
// export interface CompanyAdminAssignment {
//     assignment_id: number;
//     company_id: number;
//     admin_id: number;
//     assigned_at: string;
//     status: 'active' | 'inactive';
//     created_at: string;
//     updated_at: string;
// }

// // For trashed users
// export type TrashedUser = {
//     user_id: number;
//     name: string;
//     role: string;
//     email: string;
//     deleted_at: string;
// };

// // Pagination type
// export interface PaginatedResponse<T> {
//     data: T[];
//     current_page: number;
//     last_page: number;
//     per_page: number;
//     total: number;
//     links: Array<{
//     url: string | null;
//     label: string;
//     active: boolean;
//   }>;
//     from: number; // Added
//     to: number;   // Added
// }

// export type CompanyIndexProps = PageProps & {
//     companies: Company[];
//     success?: string;
//     filters?: { search?: string; status?: string };
// };

// export type CompanyTrashedProps = PageProps & {
//     trashedCompanies: Company[];
//     success?: string;
//     error?: string;
// };

// //supervisor
// export interface Supervisor {
//   user_id: number;
//   name: string;
//   email: string;
//   phone?: string;
//   specialization?: string;
//   status: 'active' | 'inactive';
//   created_at?: string;
//   first_name?: string;
//   last_name?: string;
//   username?: string;
// }

// export interface TrashedSupervisor {
//   user_id: number;
//   name: string;
//   email: string;
//   status: 'active' | 'inactive';
//   deleted_at?: string;
// }