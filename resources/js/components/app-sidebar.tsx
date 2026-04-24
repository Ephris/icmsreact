import { usePage } from '@inertiajs/react';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Briefcase, FileText, LayoutGrid, Trash2, User, Users, FileDown, BarChart } from 'lucide-react';
import AppLogo from './app-logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const footerNavItems: NavItem[] = [
  { title: 'AU Official Website', href: 'https://ambou.edu.et/', icon: LayoutGrid, color: 'text-indigo-500' },
];

export function AppSidebar() {
  const { props, url } = usePage();
  const { auth } = props as { auth: { user: { role: string } }; errors?: unknown; deferred?: unknown };
  const userRole = auth.user.role;
  let mainNavItems: NavItem[] = [];

  if (userRole === 'dept_head') {
    mainNavItems = [
      { title: 'Dashboard', href: '/department-head', icon: LayoutGrid, color: 'text-indigo-500' },
      { title: 'Monitor Department', href: '/department-head/department', icon: Users, color: 'text-blue-500' },
      { title: 'Accepted Applications', href: '/department-head/accepted-applications', icon: FileText, color: 'text-orange-500' },
      { title: 'Completed Applications', href: '/department-head/completed-applications', icon: BarChart, color: 'text-cyan-500' },
      { title: 'Create Students', href: '/department-head/students/create', icon: Users, color: 'text-green-500' },
      { title: 'Create Advisors', href: '/department-head/advisors/create', icon: Users, color: 'text-teal-500' },
      { title: 'Advisor Assignments', href: '/department-head/advisorsassign', icon: FileText, color: 'text-purple-500' },
      { title: 'Profile', href: '/department-head/profile', icon: User, color: 'text-blue-500' },
      { title: 'Chat', href: '/department-head/chat', icon: Users, color: 'text-blue-500' },
      { title: 'Trashed Users', href: '/department-head/trashed', icon: Trash2, color: 'text-red-500' },
    ];
  } else if (userRole === 'company_admin') {
    mainNavItems = [
      { title: 'Dashboard', href: '/company-admin', icon: LayoutGrid, color: 'text-indigo-500' },
      { title: 'Supervisors', href: '/company-admin/supervisors', icon: Users, color: 'text-blue-500' },
      { title: 'Postings', href: '/company-admin/postings', icon: Briefcase, color: 'text-green-500' },
      { title: 'Supervisor Assignments', href: '/company-admin/supervisor-assignments', icon: Users, color: 'text-teal-500' },
      { title: 'Applications', href: '/company-admin/applications', icon: FileText, color: 'text-purple-500' },
      { title: 'Completed Applications', href: '/company-admin/completed-applications', icon: BarChart, color: 'text-cyan-500' },
      { title: 'Profile', href: '/company-admin/profile', icon: User, color: 'text-blue-500' },
      { title: 'Chat', href: '/company-admin/chat', icon: Users, color: 'text-blue-500' },
      { title: 'Trashed Supervisors', href: '/company-admin/supervisorstrashed', icon: Trash2, color: 'text-red-500' },
      { title: 'Trashed Postings', href: '/company-admin/postingstrashed', icon: Trash2, color: 'text-red-500' },
    ];
  } else if (userRole === 'student') {
    mainNavItems = [
      { title: 'Dashboard', href: '/student', icon: LayoutGrid, color: 'text-indigo-500' },
      { title: 'Postings', href: '/student/postings', icon: Briefcase, color: 'text-green-500' },
      { title: 'Applications', href: '/student/applications', icon: FileText, color: 'text-purple-500' },
      { title: 'Application Letter', href: '/student/application-letter', icon: FileDown, color: 'text-orange-500' },
      { title: 'Forms', href: '/student/forms', icon: FileText, color: 'text-teal-500' },
      { title: 'Success Stories', href: '/student/success-stories', icon: FileText, color: 'text-yellow-500' },
      { title: 'Chat', href: '/student/chat', icon: Users, color: 'text-blue-500' },
      { title: 'Profile', href: '/student/profile', icon: User, color: 'text-blue-500' },
    ];
  } else if (userRole === 'advisor') {
    mainNavItems = [
      { title: 'Dashboard', href: '/faculty-advisor', icon: LayoutGrid, color: 'text-indigo-500' },
      { title: 'Students', href: '/faculty-advisor/students', icon: Users, color: 'text-blue-500' },
      { title: 'Applications', href: '/faculty-advisor/applications', icon: FileText, color: 'text-purple-500' },
      { title: 'Analytics', href: '/faculty-advisor/analytics', icon: BarChart, color: 'text-cyan-500' },
      { title: 'Forms', href: '/faculty-advisor/forms', icon: FileText, color: 'text-green-500' },
      { title: 'Create Form', href: '/faculty-advisor/forms/create', icon: FileText, color: 'text-teal-500' },
      { title: 'Profile', href: '/faculty-advisor/profile', icon: User, color: 'text-blue-500' },
      { title: 'Chat', href: '/faculty-advisor/chat', icon: Users, color: 'text-blue-500' },
      { title: 'Trashed Forms', href: '/faculty-advisor/forms/trashed', icon: Trash2, color: 'text-red-500' },
    ];
  } else if (userRole === 'supervisor') {
    mainNavItems = [
      { title: 'Dashboard', href: '/company-supervisor', icon: LayoutGrid, color: 'text-indigo-500' },
      { title: 'Students', href: '/company-supervisor/students', icon: Users, color: 'text-blue-500' },
      { title: 'Analytics', href: '/company-supervisor/analytics', icon: BarChart, color: 'text-cyan-500' },
      { title: 'Forms', href: '/company-supervisor/forms', icon: FileText, color: 'text-green-500' },
      { title: 'Postings', href: '/company-supervisor/postings', icon: Briefcase, color: 'text-purple-500' },
      { title: 'Create Posting', href: '/company-supervisor/postings/create', icon: Briefcase, color: 'text-teal-500' },
      { title: 'Profile', href: '/company-supervisor/profile', icon: User, color: 'text-blue-500' },
      { title: 'Chat', href: '/company-supervisor/chat', icon: Users, color: 'text-blue-500' },
      { title: 'Trashed Postings', href: '/company-supervisor/postings-trashed', icon: Trash2, color: 'text-red-500' },
    ];
  } else if (userRole === 'admin') {
    mainNavItems = [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, color: 'text-indigo-500' },
      { title: 'Departments', href: '/departments', icon: Users, color: 'text-blue-500' },
      { title: 'Users', href: '/users', icon: Users, color: 'text-green-500' },
      { title: 'Companies', href: '/companies', icon: Users, color: 'text-teal-500' },
      { title: 'Manage Homepage', href: '/admin/homepage', icon: FileText, color: 'text-orange-500' },
      { title: 'Approved Success Stories', href: '/admin/approved-success-stories', icon: FileText, color: 'text-yellow-500' },
      { title: 'Deactivations', href: '/admin/deactivations', icon: FileText, color: 'text-red-500' },
      { title: 'Chat', href: '/admin/chat', icon: Users, color: 'text-blue-500' },
      { title: 'Settings', href: '/settings', icon: FileText, color: 'text-green-500' },
      // { title: 'Profile', href: '/profile', icon: User, color: 'text-teal-500' },
    ];
  } else if (userRole === 'coordinator') {
   mainNavItems = [
     { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, color: 'text-indigo-500' },
     { title: 'Track Departments', href: '/coordinator/departments', icon: Users, color: 'text-blue-500' },
     { title: 'Application Letters', href: '/coordinator/application-letters', icon: FileDown, color: 'text-green-500' },
     { title: 'Completed Internships', href: '/coordinator/completed-students', icon: BarChart, color: 'text-cyan-500' },
     { title: 'Chat', href: '/coordinator/chat', icon: Users, color: 'text-teal-500' },
     { title: 'Profile', href: '/coordinator/profile', icon: User, color: 'text-purple-500' },
   ];
  } else {
    mainNavItems = [
     { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, color: 'text-indigo-500' },
      
      { title: 'Applications', href: '/applications', icon: FileText, color: 'text-purple-500' },
    ];
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" variant="inset" className="bg-white dark:bg-gray-900 border-r border-indigo-500/20 dark:border-indigo-700/20 transition-all duration-300">
        <SidebarHeader className="bg-gradient-to-b from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-4 rounded-t-lg transition-all duration-300 hover:shadow-md">
          <Link
            href={userRole === 'dept_head' ? '/department-head' : userRole === 'company_admin' ? '/company-admin' : userRole === 'student' ? '/student' : userRole === 'advisor' ? '/faculty-advisor' : userRole === 'supervisor' ? '/company-supervisor' : userRole === 'admin' ? '/dashboard' : userRole === 'coordinator' ? '/dashboard' : '/dashboard'}
            prefetch
            aria-label="Go to dashboard"
          >
            <AppLogo className="text-white" />
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          {mainNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  prefetch
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-105',
                    url === item.href || url.startsWith(item.href + '/')
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                  aria-label={item.title}
                >
                  {item.icon && (() => {
                    const Icon = item.icon;
                    return <Icon className={cn('h-5 w-5', item.color)} />;
                  })()}
                  <span className="truncate">{item.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-indigo-500 text-white rounded-lg p-2" hidden={url !== item.href && !url.startsWith(item.href + '/')}>
                {item.title}
              </TooltipContent>
            </Tooltip>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-indigo-500/20 dark:border-indigo-700/20">
          {footerNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-105',
                    url === item.href ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                  )}
                  aria-label={item.title}
                >
                  {item.icon && (() => {
                    const Icon = item.icon;
                    return <Icon className={cn('h-5 w-5', item.color)} />;
                  })()}
                  <span className="truncate">{item.title}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-indigo-500 text-white rounded-lg p-2" hidden={url === item.href}>
                {item.title}
              </TooltipContent>
            </Tooltip>
          ))}
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}

// import { usePage } from '@inertiajs/react';
// import { NavFooter } from '@/components/nav-footer';
// import { NavMain } from '@/components/nav-main';
// import { NavUser } from '@/components/nav-user';
// import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
// import { type NavItem } from '@/types';
// import { Link } from '@inertiajs/react';
// import { Briefcase, FileText, LayoutGrid, Trash2, User, Users } from 'lucide-react';
// import AppLogo from './app-logo';

// const footerNavItems: NavItem[] = [{ title: 'Docs', href: 'https://laravel.com/docs', icon: LayoutGrid }];

// export function AppSidebar() {
//   const { props } = usePage();
//   const { auth } = props as { auth: { user: { role: string } }; errors?: unknown; deferred?: unknown };
//   const userRole = auth.user.role;

//   let mainNavItems: NavItem[] = [];

//   if (userRole === 'dept_head') {
//     mainNavItems = [
//       { title: 'Dashboard', href: '/department-head', icon: LayoutGrid },
//       { title: 'Monitor Department', href: '/department-head/department', icon: Users },
//       { title: 'Create Students', href: '/department-head/students/create', icon: Users },
//       { title: 'Create Advisors', href: '/department-head/advisors/create', icon: Users },
//       { title: 'Advisor Assignments', href: '/department-head/advisorsassign', icon: FileText },
//       { title: 'Trashed Users', href: '/department-head/trashed', icon: Trash2 },
//     ];
//   } else if (userRole === 'company_admin') {
//     mainNavItems = [
//       { title: 'Dashboard', href: '/company-admin', icon: LayoutGrid },
//       { title: 'Supervisors', href: '/company-admin/supervisors', icon: Users },
//       { title: 'Postings', href: '/company-admin/postings', icon: Briefcase },
//     { title: 'Supervisor Assignments', href: '/company-admin/supervisor-assignments', icon: Users }, // Changed name and link to index page
//       { title: 'Applications', href: '/company-admin/applications', icon: FileText },
//       { title: 'Trashed Supervisors', href: '/company-admin/supervisorstrashed', icon: Trash2 },
//       { title: 'Trashed Postings', href: '/company-admin/postingstrashed', icon: Trash2 },
//     ];
//   } else if (userRole === 'student') {
//    mainNavItems = [
//          { title: 'Dashboard', href: '/student', icon: LayoutGrid },
//          { title: 'Postings', href: '/student/postings', icon: Briefcase },
//          { title: 'Applications', href: '/student/applications', icon: FileText },
//          { title: 'Profile', href: '/student/profile', icon: User },
//        ];
//   } else {
//     mainNavItems = [
//       { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
//       { title: 'Departments', href: '/departments', icon: Users },
//       { title: 'Users', href: '/users', icon: Users },
//       { title: 'Companies', href: '/companies', icon: Users },
//       { title: 'Applications', href: '/applications', icon: FileText },
//     ];
//   }

//   return (
//     <Sidebar collapsible="icon" variant="inset">
//       <SidebarHeader>
//         <Link href={userRole === 'dept_head' ? '/department-head' : userRole === 'company_admin' ? '/company-admin' : userRole === 'student' ? '/studashboard' : '/dashboard'} prefetch>
//           <AppLogo />
//         </Link>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={mainNavItems} />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavFooter items={footerNavItems} />
//         <NavUser />
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

