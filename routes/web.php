<?php

use App\Http\Controllers\CompanyAdminController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\SystemBroadcastNotification;
use App\Http\Controllers\AdminHomeController;
use App\Http\Controllers\CoordinatorController;
use App\Http\Controllers\CompanySupervisorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentHeadController;
use App\Http\Controllers\FacultyAdvisorController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
// VerifyCsrfToken middleware may be app-level; here we use the framework class for route exemptions
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Broadcast;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::routes(['middleware' => ['web', 'auth']]);


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/apply/{posting_id}', [HomeController::class, 'postingRedirect'])->name('apply.redirect');

// Help routes
Route::get('/help/overview', function () {
    return Inertia::render('help/overview');
})->name('help.overview');

Route::get('/help/rules', function () {
    return Inertia::render('help/rules');
})->name('help.rules');

Route::get('/help/contact', function () {
    $developers = [];
    $jsonPath = storage_path('app/developers.json');
    
    if (file_exists($jsonPath)) {
        $jsonContent = file_get_contents($jsonPath);
        $data = json_decode($jsonContent, true);
        $developers = $data['developers'] ?? [];
    }
    
    return Inertia::render('help/contact', [
        'developers' => $developers,
    ]);
})->name('help.contact');

// Serve public storage files even if the OS/web server blocks symlinks (Windows fallback)
Route::get('/storage/{path}', function (string $path) {
    $disk = Storage::disk('public');
    // Normalize and prevent path traversal
    $normalized = ltrim($path, '/');
    if (!$disk->exists($normalized)) {
        abort(404);
    }
    $absolute = $disk->path($normalized);
    return response()->file($absolute);
})->where('path', '.*');

// Dedicated media prefix to bypass OS/web server static handling precedence
Route::get('/media/{path}', function (string $path) {
    $disk = Storage::disk('public');
    $normalized = ltrim($path, '/');
    // Try exact match on public disk
    if ($disk->exists($normalized)) return response()->file($disk->path($normalized));

    // If missing and no directory provided, try common subfolders
    if (strpos($normalized, '/') === false) {
        foreach (['carousel/', 'home/'] as $prefix) {
            $candidate = $prefix . $normalized;
            if ($disk->exists($candidate)) return response()->file($disk->path($candidate));
            $publicCandidate = public_path('storage/' . $candidate);
            if (file_exists($publicCandidate)) return response()->file($publicCandidate);
        }
    }

    // Fallback: serve from public/storage if files were placed there directly
    $publicStorage = public_path('storage/' . $normalized);
    if (file_exists($publicStorage)) return response()->file($publicStorage);
    abort(404);
})->where('path', '.*');

Route::get('/postings', function () {
    return redirect()->route('login');
})->name('postings.index');

Route::get('/schema-explorer', function () {
    return Inertia::render('SchemaExplorer');
})->name('schema-explorer');


Route::get('/api/schema', function () {
    $path = storage_path('app/db_schema.json');

    if (!file_exists($path)) {
        return response()->json([], 200); // return empty array if file missing
    }

    $json = file_get_contents($path);

    $data = json_decode($json, true);

    if (!is_array($data)) {
        return response()->json([], 200); // return empty array if JSON invalid
    }

    return response()->json($data);
});

Route::middleware(['auth', 'check.user.status'])->group(function () {
    // Quick test route to send a broadcast notification to current user
    Route::post('/api/notify', function() {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->notify(new SystemBroadcastNotification('Test', 'Hello from broadcast', ['ts' => now()->toISOString()]));
        return response()->noContent();
    });
    // Chat API endpoints
    Route::get('/api/conversations', [ConversationController::class, 'index']);
    Route::post('/api/conversations', [ConversationController::class, 'store']);
    Route::get('/api/conversations/{id}', [ConversationController::class, 'show']);
    Route::delete('/api/conversations/{id}', [ConversationController::class, 'destroy']);
    Route::get('/api/chat/users', [ConversationController::class, 'getChatUsers']);
    
    Route::get('/api/messages', [MessageController::class, 'index']);
    Route::post('/api/messages', [MessageController::class, 'store'])->middleware('rate.limit.messages')->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::put('/api/messages/{messageId}', [MessageController::class, 'update'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::delete('/api/messages/{messageId}', [MessageController::class, 'destroy'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/api/messages/read', [MessageController::class, 'markRead'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/api/conversations/{conversationId}/typing', [MessageController::class, 'typing'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/api/messages/{messageId}/upload', [MessageController::class, 'uploadFile'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/api/messages/{messageId}/download/{filename}', [MessageController::class, 'downloadFile']);
    // Pin/unpin conversation message
    Route::post('/api/conversations/{conversationId}/pin/{messageId}', [\App\Http\Controllers\ConversationController::class, 'pinMessage'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
    Route::delete('/api/conversations/{conversationId}/pin', [\App\Http\Controllers\ConversationController::class, 'unpinMessage'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

    // Notification API endpoints
    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::post('/api/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/download/form/{filename}', function ($filename) {
        $path = storage_path('app/public/forms/' . $filename);
        if (!file_exists($path)) {
            abort(404);
        }
        return response()->download($path);
    })->name('form.download');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('departments')->middleware('role:admin')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->name('departments.index');
        Route::get('/create', [DepartmentController::class, 'create'])->name('departments.create');
        Route::post('/', [DepartmentController::class, 'store'])->name('departments.store');
        Route::get('/{department}/edit', [DepartmentController::class, 'edit'])->name('departments.edit');
        Route::put('/{department}', [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
        Route::get('/trashed', [DepartmentController::class, 'trashed'])->name('departments.trashed');
        Route::post('/{department}/restore', [DepartmentController::class, 'restore'])->name('departments.restore');
        Route::get('/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    });

    Route::prefix('companies')->middleware('role:admin')->group(function () {
        Route::get('/', [CompanyController::class, 'index'])->name('companies.index');
        Route::get('/create', [CompanyController::class, 'create'])->name('companies.create');
        Route::post('/', [CompanyController::class, 'store'])->name('companies.store');
        Route::get('/{company}/edit', [CompanyController::class, 'edit'])->name('companies.edit');
        Route::put('/{company}', [CompanyController::class, 'update'])->name('companies.update');
        Route::delete('/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');
        Route::get('/trashed', [CompanyController::class, 'trashed'])->name('companies.trashed');
        Route::post('/{company}/restore', [CompanyController::class, 'restore'])->name('companies.restore');
        Route::get('/{company}', [CompanyController::class, 'show'])->name('companies.show');
    });

    Route::prefix('department-head')->name('department-head.')->middleware('role:department-head')->group(function () {
        Route::get('/', [DepartmentHeadController::class, 'index'])->name('index');
        Route::get('/department', [DepartmentHeadController::class, 'show'])->name('show');
        Route::get('/accepted-applications', [DepartmentHeadController::class, 'acceptedApplications'])->name('acceptedapplications');
        Route::get('/completed-applications', [DepartmentHeadController::class, 'completedApplications'])->name('completed-applications');
        Route::get('/analytics/{analytics_id}', [DepartmentHeadController::class, 'viewAnalytics'])->name('analytics.view');
        Route::post('/analytics/{analytics_id}/jury-score', [DepartmentHeadController::class, 'setDeptHeadScore'])->name('analytics.jury-score');
        Route::get('/students/create', [DepartmentHeadController::class, 'createStudent'])->name('studentscreate');
        Route::post('/students', [DepartmentHeadController::class, 'storeStudent'])->name('storestudent');
        Route::get('/students/{student_id}', [DepartmentHeadController::class, 'viewStudent'])->name('viewstudent');
        Route::get('/students/{student_id}/edit', [DepartmentHeadController::class, 'editStudent'])->name('editstudent');
        Route::put('/students/{student_id}', [DepartmentHeadController::class, 'updateStudent'])->name('updatestudent');
        Route::delete('/students/{student_id}', [DepartmentHeadController::class, 'destroyStudent'])->name('destroystudent');
        Route::get('/advisors/create', [DepartmentHeadController::class, 'createAdvisor'])->name('advisorscreate');
        Route::post('/advisors', [DepartmentHeadController::class, 'storeAdvisor'])->name('storeadvisor');
        Route::get('/advisors/{advisor_id}', [DepartmentHeadController::class, 'viewAdvisor'])->name('viewadvisor');
        Route::get('/advisors/{advisor_id}/edit', [DepartmentHeadController::class, 'editAdvisor'])->name('editadvisor');
        Route::put('/advisors/{advisor_id}', [DepartmentHeadController::class, 'updateAdvisor'])->name('updateadvisor');
        Route::delete('/advisors/{advisor_id}', [DepartmentHeadController::class, 'destroyAdvisor'])->name('destroyadvisor');
        Route::get('/advisorsassign', [DepartmentHeadController::class, 'assignAdvisor'])->name('advisorsassign');
        Route::post('/advisorsassign', [DepartmentHeadController::class, 'storeAdvisorAssignment'])->name('storeadvisorassignment');
        Route::delete('/advisor-assignments/{assignment_id}', [DepartmentHeadController::class, 'destroyAdvisorAssignment'])->name('destroyadvisorassignment');
        Route::get('/trashed', [DepartmentHeadController::class, 'trashed'])->name('trashedusers');
        Route::post('/trashed/{user_id}/restore', [DepartmentHeadController::class, 'restore'])->name('restore');
        Route::delete('/trashed/{user_id}/delete-permanently', [DepartmentHeadController::class, 'deletePermanently'])->name('delete-permanently');
        Route::get('/profile', [DepartmentHeadController::class, 'profileIndex'])->name('profile.index');
        Route::get('/profile/edit', [DepartmentHeadController::class, 'profile'])->name('profile.edit');
        Route::post('/profile', [DepartmentHeadController::class, 'updateProfile'])->name('profile.update');
        Route::get('/chat', function () {
            return Inertia::render('chat/index');
        })->name('chat');
    });
    Route::middleware(['verified'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/trashed', [UserController::class, 'trashed'])->name('users.trashed');
        Route::post('/users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');

        // Admin routes
        Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
            Route::get('/homepage', [AdminHomeController::class, 'index'])->name('homepage.index');
            Route::post('/homepage', [AdminHomeController::class, 'update'])->name('homepage.update');
            Route::post('/success-story/approve', [AdminHomeController::class, 'approveSuccessStory'])->name('success-story.approve');
            Route::post('/success-story/reject', [AdminHomeController::class, 'rejectSuccessStory'])->name('success-story.reject');
            Route::get('/approved-success-stories', [AdminHomeController::class, 'approvedSuccessStories'])->name('approved-success-stories');
            Route::post('/approved-success-stories/delete', [AdminHomeController::class, 'deleteSuccessStory'])->name('approved-success-stories.delete');
            Route::get('/deactivations', [AdminHomeController::class, 'deactivations'])->name('deactivations');
            Route::post('/deactivations/{student_id}/schedule', [AdminHomeController::class, 'scheduleDeactivation'])->name('deactivations.schedule');
            Route::get('/chat', function () {
                return Inertia::render('chat/index');
            })->name('chat');
        });

        // Coordinator routes
        Route::prefix('coordinator')->name('coordinator.')->middleware('role:coordinator')->group(function () {
            Route::get('/departments', [CoordinatorController::class, 'departments'])->name('departments');
            Route::get('/departments/{department_id}/students', [CoordinatorController::class, 'departmentStudents'])->name('departments.students');
            Route::get('/letters', [CoordinatorController::class, 'letters'])->name('letters');
            Route::post('/letters/generate', [CoordinatorController::class, 'generateLetter'])->name('letters.generate');

            // Application Letters routes
            Route::get('/application-letters', [CoordinatorController::class, 'applicationLettersIndex'])->name('application-letters.index');
            Route::get('/application-letters/generate', [CoordinatorController::class, 'applicationLettersGenerate'])->name('application-letters.generate');
            Route::post('/application-letters/generate', [CoordinatorController::class, 'generateApplicationLetters'])->name('application-letters.generate.store');
            Route::post('/application-letters/send', [CoordinatorController::class, 'sendApplicationLetters'])->name('application-letters.send');
            Route::post('/application-letters/{letterId}/send', [CoordinatorController::class, 'sendSingleApplicationLetter'])->name('application-letters.send-single');
            Route::get('/application-letters/{letterId}/view', [CoordinatorController::class, 'viewApplicationLetter'])->name('application-letters.view');
            Route::get('/application-letters/{letterId}/download', [CoordinatorController::class, 'downloadApplicationLetter'])->name('application-letters.download');
            Route::post('/application-letters/{letterId}/approve', [CoordinatorController::class, 'approveApplicationLetter'])->name('application-letters.approve');
            Route::get('/completed-students', [CoordinatorController::class, 'completedStudents'])->name('completed-students');
            Route::get('/profile', [CoordinatorController::class, 'profileIndex'])->name('profile.index');
            Route::get('/profile/edit', [CoordinatorController::class, 'profile'])->name('profile.edit');
            Route::post('/profile', [CoordinatorController::class, 'updateProfile'])->name('profile.update');
            Route::get('/chat', function () {
                return Inertia::render('chat/index');
            })->name('chat');
        });
    });

    Route::prefix('company-admin')->name('companyadmin.')->middleware('role:company-admin')->group(function () {
        Route::get('/', [CompanyAdminController::class, 'index'])->name('index');
       Route::get('/supervisors', [CompanyAdminController::class, 'supervisorsindex'])->name('supervisorsindex');
        Route::get('/supervisorscreate', [CompanyAdminController::class, 'supervisorscreate'])->name('supervisorscreate');
        Route::post('/supervisorsstore', [CompanyAdminController::class, 'supervisorsstore'])->name('supervisorsstore');
        Route::get('/supervisorsview/{user_id}', [CompanyAdminController::class, 'supervisorsview'])->name('supervisorsview');
        Route::get('/supervisorsedit/{user_id}', [CompanyAdminController::class, 'supervisorsedit'])->name('supervisorsedit');
        Route::put('/supervisorsupdate/{user_id}', [CompanyAdminController::class, 'supervisorsupdate'])->name('supervisorsupdate');
        Route::delete('/supervisorsdestroy/{user_id}', [CompanyAdminController::class, 'supervisorsdestroy'])->name('supervisorsdestroy');
        Route::get('/supervisorstrashed', [CompanyAdminController::class, 'supervisorstrashed'])->name('supervisorstrashed');
        Route::post('/supervisorsrestore/{user_id}', [CompanyAdminController::class, 'supervisorsrestore'])->name('supervisorsrestore');

        Route::get('/postings', [CompanyAdminController::class, 'postingsindex'])->name('postingsindex');
        Route::get('/postings/create', [CompanyAdminController::class, 'postingscreate'])->name('postingscreate');
        Route::post('/postings', [CompanyAdminController::class, 'postingsstore'])->name('postingsstore');
        Route::get('/postings/{posting_id}', [CompanyAdminController::class, 'postingsview'])->name('postingsview');
        Route::get('/postings/{posting_id}/edit', [CompanyAdminController::class, 'postingsedit'])->name('postingsedit');
        Route::put('/postings/{posting_id}', [CompanyAdminController::class, 'postingsupdate'])->name('postingsupdate');
        Route::delete('/postings/{posting_id}', [CompanyAdminController::class, 'postingsdestroy'])->name('postingsdestroy');
        Route::get('/postingstrashed', [CompanyAdminController::class, 'postingstrashed'])->name('postingstrashed');
        Route::post('/postings/{posting_id}/restore', [CompanyAdminController::class, 'postingsrestore'])->name('postings.restore');
        Route::get('/supervisors/assign', [CompanyAdminController::class, 'supervisorsassign'])->name('supervisorsassign');
         Route::get('/supervisor-assignments', [CompanyAdminController::class, 'supervisorAssignmentsIndex'])->name('supervisorassignmentsindex'); // Added
        Route::get('/supervisor-assignments/{assignment_id}', [CompanyAdminController::class, 'supervisorAssignmentsView'])->name('supervisorassignmentsview');
        Route::get('/supervisor-assignments/{assignment_id}/edit', [CompanyAdminController::class, 'supervisorAssignmentsEdit'])->name('supervisorassignments.edit');
        Route::put('/supervisor-assignments/{assignment_id}', [CompanyAdminController::class, 'updateSupervisorAssignment'])->name('supervisorassignments.update');
        Route::delete('/supervisor-assignments/{assignment_id}', [CompanyAdminController::class, 'deleteSupervisorAssignment'])->name('supervisorassignments.delete');
        Route::post('/supervisor-assignments', [CompanyAdminController::class, 'storeSupervisorAssignment'])->name('supervisorassignments.store');
       // Application routes
   Route::get('/applications', [CompanyAdminController::class, 'applicationsindex'])->name('applicationsindex');
    Route::get('/applications/{application_id}', [CompanyAdminController::class, 'applicationsview'])->name('applicationsview');
    Route::patch('/applications/{application_id}', [CompanyAdminController::class, 'applicationsupdate'])->name('applicationsupdate');
    Route::get('/accepted-applications', [CompanyAdminController::class, 'acceptedApplications'])->name('acceptedapplications');
    Route::get('/completed-applications', [CompanyAdminController::class, 'completedApplications'])->name('completed-applications');
    Route::get('/analytics/{analytics_id}', [CompanyAdminController::class, 'viewAnalytics'])->name('analytics.view');
    // Application letter routes
    Route::get('/application-letters/{letterId}/view', [CompanyAdminController::class, 'viewApplicationLetter'])->name('application-letters.view');
    Route::get('/application-letters/{letterId}/download', [CompanyAdminController::class, 'downloadApplicationLetter'])->name('application-letters.download');
    Route::get('/profile', [CompanyAdminController::class, 'profileIndex'])->name('profile.index');
    Route::get('/profile/edit', [CompanyAdminController::class, 'profile'])->name('profile.edit');
    Route::post('/profile', [CompanyAdminController::class, 'updateProfile'])->name('profile.update');
    Route::get('/company/edit', [CompanyAdminController::class, 'editCompany'])->name('company.edit');
    Route::post('/company/update', [CompanyAdminController::class, 'updateCompany'])->name('company.update');
    Route::put('/company/update', [CompanyAdminController::class, 'updateCompany'])->name('company.update.put');
    Route::get('/chat', function () {
        return Inertia::render('chat/index');
    })->name('chat');
    });
   // Student routes

 // Student routes
 Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
     Route::get('/', [StudentController::class, 'index'])->name('index'); // Student dashboard
     Route::get('/profile', [StudentController::class, 'profileIndex'])->name('profile.index'); // View profile
     Route::get('/profile/edit', [StudentController::class, 'profile'])->name('profile.edit'); // Edit profile
     Route::post('/profile', [StudentController::class, 'updateProfile'])->name('profile.update');
     Route::get('/postings', [StudentController::class, 'postings'])->name('postings'); // List postings
     Route::get('/postings/{posting_id}', [StudentController::class, 'postingView'])->name('posting.view'); // View posting
     Route::post('/postings/apply', [StudentController::class, 'applyPosting'])->name('posting.apply'); // Apply to posting
     Route::get('/applications', [StudentController::class, 'applications'])->name('applications'); // List applications
     Route::get('/applications/{application_id}', [StudentController::class, 'applicationView'])->name('application.view'); // View application
     Route::post('/applications/{application_id}/accept', [StudentController::class, 'acceptApplication'])->name('application.accept'); // Accept application
     Route::post('/applications/{application_id}/withdraw', [StudentController::class, 'withdrawApplication'])->name('application.withdraw'); // Withdraw application
     Route::get('/forms', [StudentController::class, 'forms'])->name('forms'); // List forms
     Route::get('/forms/{form_id}', [StudentController::class, 'showForm'])->name('forms.show'); // View form
     Route::get('/application-letter', [StudentController::class, 'applicationLetter'])->name('application-letter'); // View application letter
     Route::get('/application-letters/{letterId}/view', [StudentController::class, 'viewApplicationLetter'])->name('application-letters.view'); // View application letter file
     Route::get('/application-letters/{letterId}/download', [StudentController::class, 'downloadApplicationLetter'])->name('application-letters.download'); // Download application letter file
     Route::get('/success-story', [StudentController::class, 'successStoryForm'])->name('success-story'); // Success story form
     Route::get('/success-stories', [StudentController::class, 'successStoryIndex'])->name('success-stories.index'); // Success stories index
     Route::post('/success-story', [StudentController::class, 'storeSuccessStory'])->name('success-story.store'); // Store success story
     Route::get('/success-story/{story_id}/edit', [StudentController::class, 'editSuccessStory'])->name('success-story.edit'); // Edit success story
     Route::put('/success-story/{story_id}', [StudentController::class, 'updateSuccessStory'])->name('success-story.update'); // Update success story
    Route::get('/analytics/{analytics_id}', [StudentController::class, 'viewAnalytics'])->name('analytics.view');
     Route::get('/chat', function () {
         return Inertia::render('chat/index');
     })->name('chat');
 });

Route::prefix('faculty-advisor')->name('faculty-advisor.')->middleware('role:faculty-advisor')->group(function () {
    Route::get('/', [FacultyAdvisorController::class, 'index'])->name('index');
    Route::get('/students', [FacultyAdvisorController::class, 'students'])->name('students');
    Route::get('/applications', [FacultyAdvisorController::class, 'applications'])->name('applications');
    Route::post('/applications/{application_id}/feedback', [FacultyAdvisorController::class, 'provideFeedback'])->name('applications.feedback');
    Route::put('/feedback/{feedback_id}', [FacultyAdvisorController::class, 'editFeedback'])->name('feedback.edit');
    Route::delete('/feedback/{feedback_id}', [FacultyAdvisorController::class, 'deleteFeedback'])->name('feedback.delete');
    Route::get('/forms', [FacultyAdvisorController::class, 'forms'])->name('forms');
    Route::get('/forms/create', [FacultyAdvisorController::class, 'createForm'])->name('forms.create');
    Route::post('/forms', [FacultyAdvisorController::class, 'storeForm'])->name('forms.store');
    Route::get('/forms/trashed', [FacultyAdvisorController::class, 'trashedForms'])->name('forms.trashed');
    Route::get('/forms/{form_id}', [FacultyAdvisorController::class, 'showForm'])->name('forms.show');
    Route::get('/forms/{form_id}/edit', [FacultyAdvisorController::class, 'editForm'])->name('forms.edit');
    Route::put('/forms/{form_id}', [FacultyAdvisorController::class, 'updateForm'])->name('forms.update');
    Route::delete('/forms/{form_id}', [FacultyAdvisorController::class, 'destroyForm'])->name('forms.destroy');
    Route::post('/forms/{form_id}/restore', [FacultyAdvisorController::class, 'restoreForm'])->name('forms.restore');
    Route::delete('/forms/{form_id}/force', [FacultyAdvisorController::class, 'forceDeleteForm'])->name('forms.force-delete');
    Route::get('/profile', [FacultyAdvisorController::class, 'profileIndex'])->name('profile.index');
    Route::get('/profile/edit', [FacultyAdvisorController::class, 'profile'])->name('profile.edit');
    Route::post('/profile', [FacultyAdvisorController::class, 'updateProfile'])->name('profile.update');
    Route::get('/analytics', [FacultyAdvisorController::class, 'analyticsIndex'])->name('analytics.index');
    Route::get('/analytics/{analytics_id}', [FacultyAdvisorController::class, 'viewAnalytics'])->name('analytics.view');
        Route::post('/analytics/{analytics_id}/advisor-score', [FacultyAdvisorController::class, 'setAdvisorScore'])->name('analytics.advisor-score');
    Route::get('/chat', function () {
        return Inertia::render('chat/index');
    })->name('chat');
});

Route::prefix('company-supervisor')->name('company-supervisor.')->middleware('role:company-supervisor')->group(function () {
    Route::get('/', [CompanySupervisorController::class, 'index'])->name('index');
    Route::get('/students', [CompanySupervisorController::class, 'students'])->name('students');
    Route::get('/students/{student_id}', [CompanySupervisorController::class, 'viewStudent'])->name('students.view');
    Route::get('/forms', [CompanySupervisorController::class, 'forms'])->name('forms');
    Route::get('/forms/{form_id}', [CompanySupervisorController::class, 'showForm'])->name('forms.show');
    Route::post('/forms/{form_id}/approve', [CompanySupervisorController::class, 'approveForm'])->name('forms.approve');
    Route::get('/postings', [CompanySupervisorController::class, 'postings'])->name('postings');
    Route::get('/postings/create', [CompanySupervisorController::class, 'createPosting'])->name('postings.create');
    Route::post('/postings', [CompanySupervisorController::class, 'storePosting'])->name('postings.store');
    Route::get('/postings/{posting_id}', [CompanySupervisorController::class, 'showPosting'])->name('postings.show');
    Route::get('/postings/{posting_id}/edit', [CompanySupervisorController::class, 'editPosting'])->name('postings.edit');
    Route::put('/postings/{posting_id}', [CompanySupervisorController::class, 'updatePosting'])->name('postings.update');
    Route::delete('/postings/{posting_id}', [CompanySupervisorController::class, 'deletePosting'])->name('postings.destroy');
    Route::get('/postings-trashed', [CompanySupervisorController::class, 'trashedPostings'])->name('postingstrashed');
    Route::post('/postings/{posting_id}/restore', [CompanySupervisorController::class, 'restorePosting'])->name('postings.restore');
    Route::get('/profile', [CompanySupervisorController::class, 'profileIndex'])->name('profile.index');
    Route::get('/profile/edit', [CompanySupervisorController::class, 'profile'])->name('profile.edit');
    Route::post('/profile', [CompanySupervisorController::class, 'updateProfile'])->name('profile.update');
    Route::get('/analytics', [CompanySupervisorController::class, 'analyticsIndex'])->name('analytics.index');
    Route::get('/analytics/{student_id}/create', [CompanySupervisorController::class, 'createAnalytics'])->name('analytics.create');
    Route::post('/analytics/{student_id}', [CompanySupervisorController::class, 'storeAnalytics'])->name('analytics.store');
    Route::get('/chat', function () {
        return Inertia::render('chat/index');
    })->name('chat');
});
});

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
