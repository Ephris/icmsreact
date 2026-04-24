import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Trash } from 'lucide-react';

interface Department {
  department_id: number;
  name: string;
}

interface Student {
  student_id: number;
  name: string;
}

interface Advisor {
  user_id: number;
  name: string;
}

interface Assignment {
  assignment_id: number;
  student_id: number;
  student_name: string;
  advisor_id: number;
  advisor_name: string;
  status: string;
  assigned_at: string;
}

interface Props {
  department: Department | null;
  students: Student[];
  advisors: Advisor[];
  assignments: Assignment[];
  success?: string;
  error?: string;
}

interface FormData {
  advisor_id: string;
  student_ids: string[];
  status: string;
  [key: string]: string | string[];
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/department-head' },
  { title: 'Assign Advisor', href: '/department-head/advisorsassign' },
];

const AdvisorsAssign: React.FC<Props> = ({ department, students, advisors, assignments: initialAssignments, success, error }) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(!!success);
  const [showError, setShowError] = useState<boolean>(!!error);
  const [openDialog, setOpenDialog] = useState<number | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    advisor_id: '',
    student_ids: [],
    status: 'active',
  });

  // Auto-disappear success/error message after 3 seconds
  useEffect(() => {
    if (showSuccess || showError) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showError]);

  const handleCheckboxChange = (studentId: number, checked: boolean) => {
    setData('student_ids', checked
      ? [...data.student_ids, studentId.toString()]
      : data.student_ids.filter(id => id !== studentId.toString())
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/department-head/advisorsassign', {
      onSuccess: () => {
        setShowSuccess(true);
        reset();
      },
      onError: () => setShowError(true),
    });
  };

  const handleDeleteAssignment = (assignment_id: number) => {
    router.delete(`/department-head/advisor-assignments/${assignment_id}`, {
      preserveState: true,
      onSuccess: () => {
        setShowSuccess(true);
        setOpenDialog(null);
      },
      onError: () => {
        setShowError(true);
        setOpenDialog(null);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Assign Advisor" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <h1 className="text-2xl font-bold">Assign Advisor - {department?.name || 'No Department'}</h1>
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
        {showError && (error || Object.values(errors).length > 0) && (
          <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 p-4 rounded-xl flex justify-between items-center">
            <span>{error || Object.values(errors).join(', ')}</span>
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
        {department ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Unassigned Students</label>
                <div className="space-y-2 max-h-64 overflow-y-auto p-2 border rounded-md">
                  {students.length > 0 ? (
                    students.map(student => (
                      <div key={student.student_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${student.student_id}`}
                          checked={data.student_ids.includes(student.student_id.toString())}
                          onCheckedChange={(checked: boolean) => handleCheckboxChange(student.student_id, checked)}
                        />
                        <label htmlFor={`student-${student.student_id}`} className="text-sm">
                          {student.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No unassigned students available.</p>
                  )}
                </div>
                {errors.student_ids && <span className="text-red-600 text-sm">{errors.student_ids}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium">Advisor</label>
                <Select
                  value={data.advisor_id}
                  onValueChange={(value: string) => setData('advisor_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an advisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {advisors.map((advisor) => (
                      <SelectItem key={advisor.user_id} value={advisor.user_id.toString()}>
                        {advisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.advisor_id && <span className="text-red-600 text-sm">{errors.advisor_id}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <Select
                  value={data.status}
                  onValueChange={(value: string) => setData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <span className="text-red-600 text-sm">{errors.status}</span>}
              </div>
              <Button type="submit" disabled={processing}>
                Assign Advisor
              </Button>
            </form>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Current Assignments</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Advisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialAssignments.map((assignment) => (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell>{assignment.student_name}</TableCell>
                      <TableCell>{assignment.advisor_name}</TableCell>
                      <TableCell>{assignment.status}</TableCell>
                      <TableCell>{new Date(assignment.assigned_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Dialog open={openDialog === assignment.assignment_id} onOpenChange={(open) => setOpenDialog(open ? assignment.assignment_id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Delete assignment"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete the assignment for {assignment.student_name} with {assignment.advisor_name}?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setOpenDialog(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteAssignment(assignment.assignment_id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <p>No department assigned. Please contact the administrator.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default AdvisorsAssign;