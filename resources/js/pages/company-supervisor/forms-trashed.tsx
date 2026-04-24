import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, FileText, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Form {
  form_id: string;
  title: string;
  type: string;
  student_name: string;
  supervisor_name: string;
  status: string;
  deleted_at: string;
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

interface CompanySupervisorFormsTrashedProps {
  trashedForms: {
    data: Form[];
    links: PaginationLink[];
    meta: PaginationMeta;
  };
  filters: {
    search?: string;
    type?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  success?: string;
  error?: string;
}

export default function CompanySupervisorFormsTrashed({
  trashedForms,
  filters,
  success,
  error,
}: CompanySupervisorFormsTrashedProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [type] = useState(filters.type || 'all');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'deleted_at');
  const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

  const handleSearch = (value: string) => {
    setSearch(value);
    router.get('/company-supervisor/forms/trashed', {
      search: value,
      type,
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
      sort_by: sortBy,
      sort_dir: sortDir,
    };

    router.get('/company-supervisor/forms/trashed', newFilters, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (field: string) => {
    const newSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDir(newSortDir);
    router.get('/company-supervisor/forms/trashed', {
      search,
      type,
      sort_by: field,
      sort_dir: newSortDir,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleRestore = (formId: string) => {
    if (confirm('Are you sure you want to restore this form?')) {
      router.post(`/company-supervisor/forms/${formId}/restore`);
    }
  };

  const handleForceDelete = (formId: string) => {
    if (confirm('Are you sure you want to permanently delete this form?')) {
      router.delete(`/company-supervisor/forms/${formId}/force`);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'evaluation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'other':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'evaluation':
        return 'Evaluation';
      case 'progress':
        return 'Progress';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  return (
    <AppLayout>
      <Head title="Trashed Forms" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trashed Forms</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage deleted forms
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/company-supervisor/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
          </Button>
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
            <CardTitle>Trashed Form List</CardTitle>
            <CardDescription>
              Restore or permanently delete trashed forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trashed forms..."
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
                    <SelectItem value="evaluation">Evaluation</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deleted_at">Deleted Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
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
                    <TableHead>Advisor</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('deleted_at')}>
                      <div className="flex items-center gap-2">
                        Deleted At
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trashedForms.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No trashed forms found
                      </TableCell>
                    </TableRow>
                  ) : (
                    trashedForms.data.map((form: Form) => (
                      <TableRow key={form.form_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {form.title}
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(form.deleted_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(form.form_id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleForceDelete(form.form_id)}
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

            {trashedForms.data.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {trashedForms.meta.from} to {trashedForms.meta.to} of {trashedForms.meta.total} trashed forms
                </div>
                <div className="flex gap-2">
                  {trashedForms.links.map((link: PaginationLink) => (
                    <Button
                      key={link.label}
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
      </div>
    </AppLayout>
  );
}