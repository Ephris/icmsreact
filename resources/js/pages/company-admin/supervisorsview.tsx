import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';

interface Supervisor {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  status: string;
  created_at: string;
}

interface Company {
  company_id: number;
  name: string;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null;
}

interface Props {
  supervisor: Supervisor;
  company: Company;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Supervisors', href: '/company-admin/supervisors' },
  { title: 'Supervisor Details', href: null },
];

export default function SupervisorsView({ supervisor, company }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Supervisor - ${supervisor.name}`} />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Supervisor Details - {company.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Email:</p>
                <p className="text-gray-600 dark:text-gray-300">{supervisor.email}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Phone:</p>
                <p className="text-gray-600 dark:text-gray-300">{supervisor.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Specialization:</p>
                <p className="text-gray-600 dark:text-gray-300">{supervisor.specialization || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Status:</p>
                <span
                  className={`inline-flex items-center justify-center capitalize text-white font-semibold px-3 py-1 rounded-full transition-colors duration-200 ${
                    supervisor.status.toLowerCase() === 'active'
                      ? '!bg-green-500 hover:!bg-green-600 dark:!bg-green-600 dark:hover:!bg-green-700'
                      : '!bg-red-500 hover:!bg-red-600 dark:!bg-red-600 dark:hover:!bg-red-700'
                  }`}
                >
                  {supervisor.status}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Created At:</p>
                <p className="text-gray-600 dark:text-gray-300">{new Date(supervisor.created_at).toLocaleString()}</p>
              </div>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Company Name:</p>
                  <p className="text-gray-600 dark:text-gray-300">{company.name}</p>
                </div>
                {company.industry && (
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Industry:</p>
                    <p className="text-gray-600 dark:text-gray-300">{company.industry}</p>
                  </div>
                )}
                {company.location && (
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Location:</p>
                    <p className="text-gray-600 dark:text-gray-300">{company.location}</p>
                  </div>
                )}
                {company.website && (
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Website:</p>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {company.website}
                    </a>
                  </div>
                )}
                {company.description && (
                  <div className="md:col-span-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Description:</p>
                    <p className="text-gray-600 dark:text-gray-300">{company.description}</p>
                  </div>
                )}
              </div>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
              >
                <Link href={`/company-admin/supervisorsedit/${supervisor.user_id}`} aria-label={`Edit supervisor ${supervisor.name}`}>
                  Edit
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/company-admin/supervisors" aria-label="Back to supervisors list">
                  Back to Supervisors
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// import React from 'react';
// import { Head, Link } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { type BreadcrumbItem } from '@/types';

// interface Supervisor {
//   user_id: number;
//   name: string;
//   email: string;
//   phone?: string;
//   specialization?: string;
//   status: string;
//   created_at: string;
// }

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface Props {
//   supervisor: Supervisor;
//   company: Company;
// }

// const breadcrumbs: BreadcrumbItem[] = [
//   { title: 'Dashboard', href: '/company-admin' },
//   { title: 'Supervisors', href: '/company-admin' },
// ];

// export default function SupervisorsView({ supervisor, company }: Props) {
//   return (
//     <AppLayout breadcrumbs={breadcrumbs}>
//       <Head title={`Supervisor - ${supervisor.name}`} />
//       <div className="p-6 space-y-6">
//         <Card className="shadow-md border border-gray-200 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Supervisor Details - {company.name}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <p className="font-semibold text-gray-700 dark:text-gray-200">Email:</p>
//                 <p className="text-gray-600 dark:text-gray-300">{supervisor.email}</p>
//               </div>
//               <div>
//                 <p className="font-semibold text-gray-700 dark:text-gray-200">Phone:</p>
//                 <p className="text-gray-600 dark:text-gray-300">{supervisor.phone || 'N/A'}</p>
//               </div>
//               <div>
//                 <p className="font-semibold text-gray-700 dark:text-gray-200">Specialization:</p>
//                 <p className="text-gray-600 dark:text-gray-300">{supervisor.specialization || 'N/A'}</p>
//               </div>
//               <div>
//                 <p className="font-semibold text-gray-700 dark:text-gray-200">Status:</p>
//                 <Badge variant={supervisor.status === 'active' ? 'default' : 'secondary'} className="capitalize">
//                   {supervisor.status}
//                 </Badge>
//               </div>
//               <div>
//                 <p className="font-semibold text-gray-700 dark:text-gray-200">Created At:</p>
//                 <p className="text-gray-600 dark:text-gray-300">{new Date(supervisor.created_at).toLocaleString()}</p>
//               </div>
//             </div>
//             <Separator className="bg-gray-200 dark:bg-gray-600" />
//             <div className="flex gap-4">
//               <Button
//                 asChild
//                 className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-200"
//               >
//                 <Link href={`/company-admin/supervisorsedit/${supervisor.user_id}`} aria-label={`Edit supervisor ${supervisor.name}`}>
//                   Edit
//                 </Link>
//               </Button>
//               <Button
//                 asChild
//                 variant="outline"
//                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
//               >
//                 <Link href="/company-admin" aria-label="Back to dashboard">
//                   Back to Dashboard
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }

// // 