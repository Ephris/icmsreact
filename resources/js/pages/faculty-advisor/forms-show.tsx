import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download } from 'lucide-react';

interface Form {
  form_id: string;
  title: string;
  type: string;
  student_name: string;
  supervisor_name: string;
  status: string;
  description: string;
  file_path: string;
  filename: string;
  created_at: string;
}

interface FacultyAdvisorFormsShowProps {
  form: Form;
  success?: string;
  error?: string;
}

export default function FacultyAdvisorFormsShow({
  form,
  success,
  error,
}: FacultyAdvisorFormsShowProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'progress_report':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'final_report':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'midterm_evaluation':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'progress_report':
        return 'Progress Report';
      case 'final_report':
        return 'Final Report';
      case 'midterm_evaluation':
        return 'Midterm Evaluation';
      default:
        return type;
    }
  };

  return (
    <AppLayout>
      <Head title="View Form" />
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/faculty-advisor/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">View Form</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Details of the selected form
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Form Details
            </CardTitle>
            <CardDescription>
              View the details of the form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
                <p className="text-gray-900 dark:text-white">{form.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                <Badge className={getTypeBadgeColor(form.type)}>{getTypeLabel(form.type)}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Student</h3>
                <p className="text-gray-900 dark:text-white">{form.student_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Supervisor</h3>
                <p className="text-gray-900 dark:text-white">{form.supervisor_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <Badge className={getStatusBadgeColor(form.status)}>{form.status}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                <p className="text-gray-900 dark:text-white">{new Date(form.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="text-gray-900 dark:text-white">{form.description || 'No description provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File</h3>
                <Button variant="outline" asChild>
                  <a href={`/download/form/${form.filename}`} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="outline" asChild>
                <Link href={`/faculty-advisor/forms/${form.form_id}/edit`}>Edit Form</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/faculty-advisor/forms">Back to Forms</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
// import { Head, Link } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { ArrowLeft, FileText, Download, User, Calendar, MessageSquare } from 'lucide-react';

// interface Form {
//   form_id: string;
//   title: string;
//   type: string;
//   file_path: string;
//   student_name: string;
//   supervisor_name: string;
//   status: string;
//   comments?: string;
//   description?: string;
//   created_at: string;
//   updated_at: string;
// }

// interface FacultyAdvisorFormsShowProps {
//   form: Form;
//   success?: string;
//   error?: string;
// }

// export default function FacultyAdvisorFormsShow({
//   form,
//   success,
//   error,
// }: FacultyAdvisorFormsShowProps) {
//   const getTypeBadgeColor = (type: string) => {
//     switch (type.toLowerCase()) {
//       case 'progress_report':
//         return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
//       case 'final_report':
//         return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
//       case 'midterm_evaluation':
//         return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
//       default:
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
//     }
//   };

//   const getStatusBadgeColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'approved':
//         return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
//       case 'rejected':
//         return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
//       default:
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
//     }
//   };

//   const getTypeLabel = (type: string) => {
//     switch (type.toLowerCase()) {
//       case 'progress_report':
//         return 'Progress Report';
//       case 'final_report':
//         return 'Final Report';
//       case 'midterm_evaluation':
//         return 'Midterm Evaluation';
//       default:
//         return type;
//     }
//   };

//   return (
//     <AppLayout>
//       <Head title={`Form: ${form.title}`} />
      
//       <div className="space-y-6">
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="icon" asChild>
//             <Link href="/faculty-advisor/forms">
//               <ArrowLeft className="h-4 w-4" />
//             </Link>
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               Form details and information
//             </p>
//           </div>
//         </div>

//         {success && (
//           <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
//             <p className="text-green-800 dark:text-green-200">{success}</p>
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
//             <p className="text-red-800 dark:text-red-200">{error}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5 text-blue-500" />
//                   Form Information
//                 </CardTitle>
//                 <CardDescription>
//                   Basic details about this form
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Form Type</label>
//                     <div className="mt-1">
//                       <Badge className={getTypeBadgeColor(form.type)}>
//                         {getTypeLabel(form.type)}
//                       </Badge>
//                     </div>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
//                     <div className="mt-1">
//                       <Badge className={getStatusBadgeColor(form.status)}>
//                         {form.status}
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>

//                 {form.description && (
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
//                     <p className="mt-1 text-sm text-gray-900 dark:text-white">{form.description}</p>
//                   </div>
//                 )}

//                 <div>
//                   <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Attached File</label>
//                   <div className="mt-2 flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
//                     <FileText className="h-8 w-8 text-gray-400" />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                         {form.file_path.split('/').pop()}
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         Click to download
//                       </p>
//                     </div>
//                     <Button size="sm" asChild>
//                       <a href={form.file_path} target="_blank" rel="noopener noreferrer">
//                         <Download className="h-4 w-4 mr-1" />
//                         Download
//                       </a>
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {form.comments && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <MessageSquare className="h-5 w-5 text-yellow-500" />
//                     Supervisor Comments
//                   </CardTitle>
//                   <CardDescription>
//                     Feedback from the company supervisor
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-sm text-gray-900 dark:text-white">{form.comments}</p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <User className="h-5 w-5 text-green-500" />
//                   Student Information
//                 </CardTitle>
//                 <CardDescription>
//                   Details about the assigned student
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Student Name</label>
//                     <p className="text-sm text-gray-900 dark:text-white">{form.student_name}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supervisor</label>
//                     <p className="text-sm text-gray-900 dark:text-white">{form.supervisor_name}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Calendar className="h-5 w-5 text-purple-500" />
//                   Timeline
//                 </CardTitle>
//                 <CardDescription>
//                   Important dates for this form
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
//                     <p className="text-sm text-gray-900 dark:text-white">
//                       {new Date(form.created_at).toLocaleDateString()} at {new Date(form.created_at).toLocaleTimeString()}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
//                     <p className="text-sm text-gray-900 dark:text-white">
//                       {new Date(form.updated_at).toLocaleDateString()} at {new Date(form.updated_at).toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Actions</CardTitle>
//                 <CardDescription>
//                   Available actions for this form
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <Button variant="outline" className="w-full justify-start" asChild>
//                   <Link href={`/faculty-advisor/forms/${form.form_id}/edit`}>
//                     Edit Form
//                   </Link>
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start" asChild>
//                   <a href={form.file_path} target="_blank" rel="noopener noreferrer">
//                     <Download className="h-4 w-4 mr-2" />
//                     Download File
//                   </a>
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// }
