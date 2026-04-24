<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use App\Models\CompanyAdminAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = Company::with('admin');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('industry', 'like', "%{$search}%")
                  ->orWhereHas('admin', function ($q) use ($search) {
                      $q->where('users.name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $companies = $query->paginate(6, [
            'company_id',
            'name',
            'description',
            'industry',
            'location',
            'website',
            'company_size',
            'founded_year',
            'contact_email',
            'linkedin_url',
            'status'
        ])->appends(['search' => $search, 'status' => $status]);

        Log::debug('Companies loaded for index:', [
            'companies' => $companies->map(function ($company) {
                return [
                    'company_id' => $company->company_id,
                    'name' => $company->name,
                    'admin' => $company->admin ? ['user_id' => $company->admin->user_id, 'name' => $company->admin->name] : null,
                ];
            })->toArray(),
            'pagination' => [
                'current_page' => $companies->currentPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total(),
                'last_page' => $companies->lastPage(),
            ],
        ]);

        $links = [];
        for ($i = 1; $i <= $companies->lastPage(); $i++) {
            $links[] = [
                'url' => $companies->url($i),
                'label' => (string) $i,
                'active' => $i === $companies->currentPage(),
            ];
        }

        return Inertia::render('companies/index', [
            'companies' => [
                'data' => $companies->map(function ($company) {
                    return [
                        'company_id' => $company->company_id,
                        'name' => $company->name,
                        'description' => $company->description,
                        'industry' => $company->industry,
                        'location' => $company->location,
                        'website' => $company->website,
                        'company_size' => $company->company_size,
                        'founded_year' => $company->founded_year,
                        'contact_email' => $company->contact_email,
                        'linkedin_url' => $company->linkedin_url,
                        'status' => $company->status,
                        'admin' => $company->admin ? ['user_id' => $company->admin->user_id, 'name' => $company->admin->name] : null,
                    ];
                })->toArray(),
                'current_page' => $companies->currentPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total(),
                'last_page' => $companies->lastPage(),
                'links' => $links,
            ],
            'success' => session('success'),
            'error' => session('error'),
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function create()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        return Inertia::render('companies/create', [
            'admins' => User::where('role', 'company_admin')
                ->whereNotExists(function ($query) {
                    $query->select('company_id')
                          ->from('company_admin_assignments')
                          ->whereColumn('company_admin_assignments.user_id', 'users.user_id');
                })
                ->get(['user_id', 'name']),
            'error' => session('error'),
            'success' => session('success'),
        ]);
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'company_size' => 'nullable|string|max:100',
            'founded_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'contact_email' => 'nullable|email|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'user_id' => [
                'nullable',
                'exists:users,user_id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $user = User::where('user_id', $value)->first();
                        if (!$user || $user->role !== 'company_admin') {
                            $fail('The selected user must have the company_admin role.');
                        }
                        if (CompanyAdminAssignment::where('user_id', $value)->exists()) {
                            $fail('This user is already assigned as a company admin.');
                        }
                    }
                },
            ],
            'status' => 'required|in:pending,approved',
        ]);

        try {
            $company = Company::create($validated);
            if ($request->user_id) {
                CompanyAdminAssignment::create([
                    'company_id' => $company->company_id,
                    'user_id' => $request->user_id,
                ]);
            }
            return redirect()->route('companies.index')->with('success', 'Company created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create company:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to create company: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Company $company)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $company->load('admin');
        return Inertia::render('companies/edit', [
            'company' => $company->only('company_id', 'name', 'description', 'industry', 'location', 'website', 'company_size', 'founded_year', 'contact_email', 'linkedin_url', 'status', 'admin'),
            'admins' => User::where('role', 'company_admin')
                ->whereNotExists(function ($query) use ($company) {
                    $query->select('company_id')
                          ->from('company_admin_assignments')
                          ->whereColumn('company_admin_assignments.user_id', 'users.user_id')
                          ->where('company_admin_assignments.company_id', '!=', $company->company_id);
                })
                ->get(['user_id', 'name']),
            'error' => session('error'),
            'success' => session('success'),
        ]);
    }

    public function update(Request $request, Company $company)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'company_size' => 'nullable|string|max:100',
            'founded_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'contact_email' => 'nullable|email|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'user_id' => [
                'nullable',
                'exists:users,user_id',
                function ($attribute, $value, $fail) use ($company) {
                    if ($value) {
                        $user = User::where('user_id', $value)->first();
                        if (!$user || $user->role !== 'company_admin') {
                            $fail('The selected user must have the company_admin role.');
                        }
                        if (CompanyAdminAssignment::where('user_id', $value)
                            ->where('company_id', '!=', $company->company_id)
                            ->exists()) {
                            $fail('This user is already assigned as a company admin.');
                        }
                    }
                },
            ],
            'status' => 'required|in:pending,approved',
        ]);

        try {
            $company->update($validated);
            CompanyAdminAssignment::where('company_id', $company->company_id)->delete();
            if ($request->user_id) {
                CompanyAdminAssignment::create([
                    'company_id' => $company->company_id,
                    'user_id' => $request->user_id,
                ]);
            }
            return redirect()->route('companies.index')->with('success', 'Company updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update company:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to update company: ' . $e->getMessage())->withInput();
        }
    }


    public function destroy(Company $company)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        CompanyAdminAssignment::where('company_id', $company->company_id)->delete();
        $company->delete();
        return redirect()->route('companies.index')->with('success', 'Company deleted successfully.');
    }

    public function trashed()
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $trashedCompanies = Company::onlyTrashed()->with('admin')->get([
            'company_id',
            'name',
            'description',
            'industry',
            'location',
            'website',
            'company_size',
            'founded_year',
            'contact_email',
            'linkedin_url',
            'status',
            'deleted_at'
        ]);
        return Inertia::render('companies/trashed', [
            'trashedCompanies' => $trashedCompanies,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function restore($companyId)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        try {
            $company = Company::onlyTrashed()->findOrFail($companyId);
            $company->restore();
            return redirect()->route('companies.trashed')->with('success', 'Company restored successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to restore company:', ['error' => $e->getMessage()]);
            return redirect()->route('companies.trashed')->with('error', 'Failed to restore company: ' . $e->getMessage());
        }
    }

    public function show(Company $company)
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        $company->load('admin');
        return Inertia::render('companies/show', [
            'company' => $company->only('company_id', 'name', 'description', 'industry', 'location', 'website', 'company_size', 'founded_year', 'contact_email', 'linkedin_url', 'status', 'admin'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }
}