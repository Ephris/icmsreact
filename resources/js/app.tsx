import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';
import { Toaster } from 'sonner';

const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content || '';

const useCustomHost = !!import.meta.env.VITE_PUSHER_HOST;
const echoConfig: {
    broadcaster: 'pusher'
    key: string | undefined
    cluster: string | undefined
    authEndpoint: string
    auth: { headers: Record<string, string> }
    withCredentials: boolean
    wsHost?: string
    wsPort?: number
    forceTLS?: boolean
    enabledTransports?: Array<'ws' | 'wss'>
} = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
        },
    },
    withCredentials: true,
};

if (useCustomHost) {
    echoConfig.wsHost = import.meta.env.VITE_PUSHER_HOST;
    echoConfig.wsPort = Number(import.meta.env.VITE_PUSHER_PORT || 6001);
    echoConfig.forceTLS = (import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https';
    echoConfig.enabledTransports = ['ws', 'wss'];
} else {
    echoConfig.forceTLS = true; // Hosted Pusher via cluster
}

configureEcho(echoConfig);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        // Handle nested paths by replacing dots with slashes and ensuring correct directory structure
        const pagePath = name.replace(/\./g, '/');
        return resolvePageComponent(
            `./pages/${pagePath}.tsx`,
            import.meta.glob(['./pages/*.tsx', './pages/auth/*.tsx', './pages/**/*.tsx'])
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();