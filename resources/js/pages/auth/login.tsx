import { useEffect, useState, type FormEventHandler, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Link } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getImageUrl } from '@/utils/imageUtils';
import { AppearanceDropdown } from '@/components/appearance-dropdown';
import QRCodeDisplay from '@/components/qr-code-display';

interface HomeContent {
    logo?: string;
    background_image?: string;
    background_color?: string;
    title?: string;
}

interface Props {
    status?: string;
    homeContent?: HomeContent | null;
}

export default function Login({ status, homeContent }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, [reset]);

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-6"
            style={{ 
                backgroundColor: homeContent?.background_color || undefined,
                backgroundImage: homeContent?.background_image ? `url(${getImageUrl(homeContent.background_image)})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative z-10 w-full max-w-md animate-fade-in animate-scale-in">
                <Card className="shadow-2xl border-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl animate-in fade-in zoom-in-95">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            {homeContent?.logo ? (
                                <img
                                    src={getImageUrl(homeContent.logo)}
                                    alt="Logo"
                                    className="h-30 w-30 rounded-lg shadow-lg"
                                />
                            ) : (
                                <Briefcase className="h-30 w-30 text-white" />
                            )}
                            <CardTitle className="text-3xl font-bold text-white tracking-tight">
                                {homeContent?.title || 'AU HHC ICMS'}
                            </CardTitle>
                        </div>
                        <p className="text-white/90 text-center">Log in to Your Account</p>
                    </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {status && (
                        <Alert className="bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-top-4 duration-500">
                            <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">Success</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-gray-300">{status}</AlertDescription>
                        </Alert>
                    )}
                    {(errors.email || errors.password) && (
                        <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-in fade-in slide-in-from-top-4 duration-500">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Error</AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-gray-300">
                                {errors.email || errors.password}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => reset()}
                                    className="ml-2 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                                    aria-label="Dismiss error message"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={submit} className="grid gap-6" autoComplete="off">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-indigo-700 dark:text-indigo-300 font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                required
                                autoComplete="off"
                                className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md"
                                aria-label="Enter your email address"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-indigo-700 dark:text-indigo-300 font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                    required
                                    autoComplete="off"
                                    className="bg-white dark:bg-gray-900 border-indigo-500/20 dark:border-indigo-700/20 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 hover:shadow-md pr-12"
                                    aria-label="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 accent-indigo-500 rounded-md focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                    aria-label="Remember me"
                                />
                                <Label htmlFor="remember" className="text-indigo-700 dark:text-indigo-300">
                                    Remember me
                                </Label>
                            </div>
                            <Link
                                href={route('password.request')}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-700 dark:to-blue-800 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                            aria-label="Log in to your account"
                        >
                            {processing ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                'Log in'
                            )}
                        </Button>
                    </form>
                </CardContent>
                </Card>
                <div className="mt-8 rounded-2xl p-4 shadow-xl flex flex-col items-center animate-fade-in-up bg-white/90 dark:bg-gray-900/90">
                    <span className="text-indigo-600 dark:text-indigo-300 font-bold">✨ New!</span>
                    <span className="mt-2 text-center text-gray-800 dark:text-gray-200 text-base">
                      Now enjoy real-time notifications, improved security, and ultra-fast login.
                    </span>
                </div>
                {/* Theme Switcher and QR Code Footer */}
                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="rounded-2xl p-4 shadow-xl bg-white/90 dark:bg-gray-900/90 flex flex-col items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center font-medium">Theme</p>
                        <AppearanceDropdown />
                    </div>
                    <div className="rounded-2xl p-4 shadow-xl bg-white/90 dark:bg-gray-900/90">
                        <QRCodeDisplay size={100} />
                    </div>
                </div>
            </div>
            <div aria-hidden className="absolute -z-10 top-24 left-24 w-60 h-60 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-30 blur-3xl animate-float" />
            <div aria-hidden className="absolute -z-10 bottom-12 right-16 w-40 h-40 rounded-full bg-gradient-to-br from-blue-300 via-cyan-200 to-indigo-200 opacity-30 blur-2xl animate-scale-pulse" />
        </div>
    );
}