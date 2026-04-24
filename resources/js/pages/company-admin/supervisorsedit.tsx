import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { X, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import { BreadcrumbItem } from '@/types';

interface Supervisor {
  user_id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  specialization?: string;
  gender?: string;
  status: string;
}

interface Company {
  company_id: number;
  name: string;
}

interface Props {
  supervisor: Supervisor;
  company: Company;
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/company-admin' },
  { title: 'Supervisors', href: '/company-admin/supervisors' },
  { title: 'Edit Supervisor', href: null },
];

export default function SupervisorsEdit({ supervisor, company, success: initialSuccess, error: initialError }: Props) {
  const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
  const [showError, setShowError] = useState(!!initialError);
  const { data, setData, put, processing, errors } = useForm({
    first_name: supervisor.first_name,
    last_name: supervisor.last_name,
    email: supervisor.email,
    username: supervisor.username,
    phone: supervisor.phone || '',
    specialization: supervisor.specialization || '',
    gender: supervisor.gender || '',
    status: supervisor.status,
  });

  useEffect(() => {
    if (initialSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialSuccess]);

  useEffect(() => {
    if (initialError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialError]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/company-admin/supervisorsupdate/${supervisor.user_id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Supervisor - ${supervisor.name}`} />
      <div className="p-6 space-y-6">
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl transform transition-transform duration-300 hover:scale-[1.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Edit Supervisor - {company.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {showSuccess && initialSuccess && (
              <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 flex justify-between items-center">
                  {initialSuccess}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
                    aria-label="Dismiss success message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {showError && initialError && (
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 flex justify-between items-center">
                  {initialError}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                    aria-label="Dismiss error message"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name" className="font-semibold text-gray-700 dark:text-gray-200">First Name</Label>
                  <Input
                    id="first_name"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    placeholder="First Name"
                    className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                    aria-invalid={!!errors.first_name}
                  />
                  {errors.first_name && <span className="text-red-500 text-sm mt-1">{errors.first_name}</span>}
                </div>
                <div>
                  <Label htmlFor="last_name" className="font-semibold text-gray-700 dark:text-gray-200">Last Name</Label>
                  <Input
                    id="last_name"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    placeholder="Last Name"
                    className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                    aria-invalid={!!errors.last_name}
                  />
                  {errors.last_name && <span className="text-red-500 text-sm mt-1">{errors.last_name}</span>}
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Email"
                    className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                </div>
                <div>
                  <Label htmlFor="username" className="font-semibold text-gray-700 dark:text-gray-200">Username</Label>
                  <Input
                    id="username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    placeholder="Username"
                    className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && <span className="text-red-500 text-sm mt-1">{errors.username}</span>}
                </div>
                <div>
                  <Label htmlFor="phone" className="font-semibold text-gray-700 dark:text-gray-200">Phone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="Phone"
                    className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
                </div>
                <div>
                  <Label htmlFor="specialization" className="font-semibold text-gray-700 dark:text-gray-200">Specialization</Label>
                  <Input
                    id="specialization"
                    value={data.specialization}
                    onChange={(e) => setData('specialization', e.target.value)}
                    placeholder="Specialization"
                    className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                    aria-invalid={!!errors.specialization}
                  />
                  {errors.specialization && <span className="text-red-500 text-sm mt-1">{errors.specialization}</span>}
                </div>
                <div>
                  <Label htmlFor="gender" className="font-semibold text-gray-700 dark:text-gray-200">Gender</Label>
                  <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                    <SelectTrigger
                      id="gender"
                      className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                      aria-label="Select supervisor gender"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <span className="text-red-500 text-sm mt-1">{errors.gender}</span>}
                </div>
                <div>
                  <Label htmlFor="status" className="font-semibold text-gray-700 dark:text-gray-200">Status</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger
                      id="status"
                      className="mt-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                      aria-label="Select supervisor status"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <span className="text-red-500 text-sm mt-1">{errors.status}</span>}
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700" />
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-700 dark:hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                >
                  Update Supervisor
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/company-admin/supervisors" aria-label="Cancel and return to supervisors list">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// import React, { useEffect, useState } from 'react';
// import { Head, useForm } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';
// import { FormEventHandler } from 'react';
// import { Link } from '@inertiajs/react';
// import { Separator } from '@/components/ui/separator';
// import { X } from 'lucide-react';

// interface Supervisor {
//   user_id: number;
//   first_name: string;
//   last_name: string;
//   name: string;
//   email: string;
//   username: string;
//   phone?: string;
//   specialization?: string;
//   status: string;
// }

// interface Company {
//   company_id: number;
//   name: string;
// }

// interface Props {
//   supervisor: Supervisor;
//   company: Company;
//   success?: string;
//   error?: string;
// }

// export default function SupervisorsEdit({ supervisor, company, success: initialSuccess, error: initialError }: Props) {
//   const [showSuccess, setShowSuccess] = useState(!!initialSuccess);
//   const [showError, setShowError] = useState(!!initialError);
//   const { data, setData, put, processing, errors } = useForm({
//     first_name: supervisor.first_name,
//     last_name: supervisor.last_name,
//     email: supervisor.email,
//     username: supervisor.username,
//     phone: supervisor.phone || '',
//     specialization: supervisor.specialization || '',
//     status: supervisor.status,
//   });

//   useEffect(() => {
//     if (initialSuccess) {
//       setShowSuccess(true);
//       const timer = setTimeout(() => setShowSuccess(false), 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [initialSuccess]);

//   useEffect(() => {
//     if (initialError) {
//       setShowError(true);
//       const timer = setTimeout(() => setShowError(false), 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [initialError]);

//   const handleSubmit: FormEventHandler = (e) => {
//     e.preventDefault();
//     put(`/company-admin/supervisorsupdate/${supervisor.user_id}`);
//   };

//   return (
//     <AppLayout>
//       <Head title={`Edit Supervisor - ${supervisor.name}`} />
//       <div className="p-6">
//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold">Edit Supervisor - {company.name}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {showSuccess && initialSuccess && (
//               <div className="bg-green-100 p-4 rounded-lg flex justify-between items-center">
//                 <span>{initialSuccess}</span>
//                 <Button variant="ghost" onClick={() => setShowSuccess(false)} aria-label="Close success message">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//             {showError && initialError && (
//               <div className="bg-red-100 p-4 rounded-lg flex justify-between items-center">
//                 <span>{initialError}</span>
//                 <Button variant="ghost" onClick={() => setShowSuccess(false)} aria-label="Close error message">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//             <Separator />
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <Label htmlFor="first_name" className="font-semibold">First Name</Label>
//                   <Input
//                     id="first_name"
//                     value={data.first_name}
//                     onChange={(e) => setData('first_name', e.target.value)}
//                     placeholder="First Name"
//                     className="mt-1"
//                     aria-invalid={!!errors.first_name}
//                   />
//                   {errors.first_name && <span className="text-red-500 text-sm mt-1">{errors.first_name}</span>}
//                 </div>
//                 <div>
//                   <Label htmlFor="last_name" className="font-semibold">Last Name</Label>
//                   <Input
//                     id="last_name"
//                     value={data.last_name}
//                     onChange={(e) => setData('last_name', e.target.value)}
//                     placeholder="Last Name"
//                     className="mt-1"
//                     aria-invalid={!!errors.last_name}
//                   />
//                   {errors.last_name && <span className="text-red-500 text-sm mt-1">{errors.last_name}</span>}
//                 </div>
//                 <div>
//                   <Label htmlFor="email" className="font-semibold">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={data.email}
//                     onChange={(e) => setData('email', e.target.value)}
//                     placeholder="Email"
//                     className="mt-1"
//                     aria-invalid={!!errors.email}
//                   />
//                   {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
//                 </div>
//                 <div>
//                   <Label htmlFor="username" className="font-semibold">Username</Label>
//                   <Input
//                     id="username"
//                     value={data.username}
//                     onChange={(e) => setData('username', e.target.value)}
//                     placeholder="Username"
//                     className="mt-1"
//                     aria-invalid={!!errors.username}
//                   />
//                   {errors.username && <span className="text-red-500 text-sm mt-1">{errors.username}</span>}
//                 </div>
//                 <div>
//                   <Label htmlFor="phone" className="font-semibold">Phone</Label>
//                   <Input
//                     id="phone"
//                     value={data.phone}
//                     onChange={(e) => setData('phone', e.target.value)}
//                     placeholder="Phone"
//                     className="mt-1"
//                     aria-invalid={!!errors.phone}
//                   />
//                   {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
//                 </div>
//                 <div>
//                   <Label htmlFor="specialization" className="font-semibold">Specialization</Label>
//                   <Input
//                     id="specialization"
//                     value={data.specialization}
//                     onChange={(e) => setData('specialization', e.target.value)}
//                     placeholder="Specialization"
//                     className="mt-1"
//                     aria-invalid={!!errors.specialization}
//                   />
//                   {errors.specialization && <span className="text-red-500 text-sm mt-1">{errors.specialization}</span>}
//                 </div>
//                 <div>
//                   <Label htmlFor="status" className="font-semibold">Status</Label>
//                   <Select value={data.status} onValueChange={(value) => setData('status', value)}>
//                     <SelectTrigger id="status" className="mt-1">
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="active">Active</SelectItem>
//                       <SelectItem value="inactive">Inactive</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {errors.status && <span className="text-red-500 text-sm mt-1">{errors.status}</span>}
//                 </div>
//               </div>
//               <Separator />
//               <div className="flex gap-4">
//                 <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">Update Supervisor</Button>
//                 <Link href="/company-admin">
//                   <Button variant="outline">Cancel</Button>
//                 </Link>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }