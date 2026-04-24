import { Head, Link, router} from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, FileText, Plus, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface Form {
  form_id: string;
  title: string;
  type: string;
  file_path: string;
  filename: string;
  student_name: string;
  supervisor_name: string;
  status: string;
  comments?: string;
  created_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationMeta {
  from: number;
  to: number;
  total: number;
  current_page: number;
  last_page: number;
}

interface FacultyAdvisorFormsProps {
  forms: {
    data: Form[];
    links: PaginationLink[];
    meta: PaginationMeta;
  };
  filters: {
    search?: string;
    type?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

export default function FacultyAdvisorForms({
  forms,
  filters,
  success,
  error,
}: FacultyAdvisorFormsProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [type] = useState(filters.type || 'all');
  const [status] = useState(filters.status || 'all');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    router.get('/faculty-advisor/forms', {
      search: value,
      type,
      status,
      sort_by: sortBy,
      sort_dir: sortDir,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (filterType: string, value: string) => {
    const newFilters = {
      search,
      type: filterType === 'type' ? value : type,
      status: filterType === 'status' ? value : status,
      sort_by: sortBy,
      sort_dir: sortDir,
    };
    
    router.get('/faculty-advisor/forms', newFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (field: string) => {
    const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDir(newSortDir);
    router.get('/faculty-advisor/forms', {
      search,
      type,
      status,
      sort_by: field,
      sort_dir: newSortDir,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (form: Form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      router.delete(`/faculty-advisor/forms/${formToDelete.form_id}`);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

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
      <Head title="Forms" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forms</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage forms for your assigned students
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/faculty-advisor/forms/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/faculty-advisor/forms/trashed">
                <Trash2 className="h-4 w-4 mr-2" />
                Trashed Forms
              </Link>
            </Button>
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
            <CardTitle>Form List</CardTitle>
            <CardDescription>
              Create and manage forms for student evaluations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search forms..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={type} onValueChange={(value) => handleFilter('type', value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="progress_report">Progress Report</SelectItem>
                    <SelectItem value="final_report">Final Report</SelectItem>
                    <SelectItem value="midterm_evaluation">Midterm Evaluation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={(value) => handleFilter('status', value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSort(sortBy)}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-2">
                        Title
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-2">
                        Type
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center gap-2">
                        Created
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No forms found
                      </TableCell>
                    </TableRow>
                  ) : (
                    forms.data.map((form: Form) => (
                      <TableRow key={form.form_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {form.title}
                              </div>
                              {form.comments && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {form.comments}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(form.type)}>
                            {getTypeLabel(form.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {form.student_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {form.supervisor_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(form.status)}>
                            {form.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(form.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/download/form/${form.filename}`} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/faculty-advisor/forms/${form.form_id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/faculty-advisor/forms/${form.form_id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(form)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {forms.data.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {forms.meta?.from} to {forms.meta?.to} of {forms.meta?.total} forms
                </div>
                <div className="flex gap-2">
                  {forms.links.map((link: PaginationLink, index: number) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                    >
                      <div dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Form</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the form "{formToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
