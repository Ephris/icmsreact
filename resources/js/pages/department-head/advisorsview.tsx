import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X } from 'lucide-react';

interface Department {
  department_id: number;
  name: string;
}

interface Advisor {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  status: string;
  students: { student_id: number; name: string }[];
}

interface Props {
  department: Department;
  advisor: Advisor;
  success?: string;
  error?: string;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Advisor Details', href: '' },
];

const AdvisorsView: React.FC<Props> = ({ department, advisor, success, error }) => {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  // Auto-disappear success/error messages after 3 seconds
  useEffect(() => {
    if (showSuccess || showError) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showError]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Advisor Details" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <h1 className="text-2xl font-bold">Advisor Details - {department.name}</h1>
        {showSuccess && success && (
          <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 p-4 rounded-xl flex justify-between items-center">
            <span>{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuccess(false)}
              className="text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
              aria-label="Close success alert"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {showError && error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowError(false)}
              className="text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700"
              aria-label="Close error alert"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="space-y-4">
          <Card className="w-80 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
            <CardHeader>
              <CardTitle>{advisor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="email">
                  <AccordionTrigger>Email</AccordionTrigger>
                  <AccordionContent>{advisor.email}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="phone">
                  <AccordionTrigger>Phone</AccordionTrigger>
                  <AccordionContent>{advisor.phone || 'N/A'}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="specialization">
                  <AccordionTrigger>Specialization</AccordionTrigger>
                  <AccordionContent>{advisor.specialization || 'N/A'}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="status">
                  <AccordionTrigger>Status</AccordionTrigger>
                  <AccordionContent>{advisor.status}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Assigned Students</h2>
            {advisor.students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advisor.students.map((student) => (
                    <TableRow
                      key={student.student_id}
                      className="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500">No students assigned.</p>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
            <Link href={`/department-head/advisors/${advisor.user_id}/edit`}>Edit Advisor</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-gray-600 hover:bg-gray-700 text-white border-none transition-colors duration-200"
          >
            <Link href="/department-head">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdvisorsView;