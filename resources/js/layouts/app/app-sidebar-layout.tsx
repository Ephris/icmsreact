import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NotificationProvider } from '@/components/notification-provider';
import { ChatBot } from '@/components/ChatBot';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <NotificationProvider>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent
                    variant="sidebar"
                    className="overflow-x-hidden min-h-screen p-4 md:p-6 bg-gradient-to-br from-indigo-50 via-purple-50/70 to-blue-100 dark:from-gray-800 dark:via-indigo-900/60 dark:to-indigo-950"
                >
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
            <ChatBot position="bottom-right" />
        </NotificationProvider>
    );
}
