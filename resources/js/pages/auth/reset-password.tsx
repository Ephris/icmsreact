import { useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Briefcase } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface HomeContent {
    logo?: string;
    background_image?: string;
    background_color?: string;
    title?: string;
}

interface ResetPasswordProps {
    token: string;
    email: string;
    homeContent?: HomeContent | null;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email, homeContent }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });

    const checkPasswordStrength = (password: string) => {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('At least 8 characters');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Lowercase letter');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Uppercase letter');
        }

        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Number');
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Special character');
        }

        return { score, feedback };
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const toImageUrl = (path?: string | null): string | undefined => {
        if (!path) return undefined;
        const trimmed = path.replace(/^\/+/, '');
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('storage/')) return `/media/${trimmed.substring('storage/'.length)}`;
        if (trimmed.startsWith('public/')) return `/media/${trimmed.substring('public/'.length)}`;
        return `/media/${trimmed}`;
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-6"
            style={{ 
                backgroundColor: homeContent?.background_color || undefined,
                backgroundImage: homeContent?.background_image ? `url(${toImageUrl(homeContent.background_image)})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative z-10 w-full max-w-md">
                <Card className="shadow-lg border-none bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl animate-in fade-in zoom-in-95">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-700 dark:to-teal-800 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            {homeContent?.logo ? (
                                <img 
                                    src={toImageUrl(homeContent.logo)} 
                                    alt="Logo" 
                                    className="h-8 w-8 rounded" 
                                />
                            ) : (
                                <Briefcase className="h-8 w-8 text-white" />
                            )}
                            <CardTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Shield className="h-6 w-6" />
                                Set New Password
                            </CardTitle>
                        </div>
                        <p className="text-white/90 text-center">Please enter your new password below</p>
                    </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">Security Notice</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                            Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                        </AlertDescription>
                    </Alert>
                    
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-green-700 dark:text-green-300 font-medium">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-full cursor-not-allowed"
                            readOnly
                        />
                            </div>
                            <InputError message={errors.email} />
                    </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-green-700 dark:text-green-300 font-medium">
                                New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="password"
                                    type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                                    onChange={(e) => {
                                        setData('password', e.target.value);
                                        setPasswordStrength(checkPasswordStrength(e.target.value));
                                    }}
                                    placeholder="Enter your new password"
                                    className="pl-10 pr-10 bg-white dark:bg-gray-900 border-green-500/20 dark:border-green-700/20 rounded-full focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-300 hover:shadow-md"
                            autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            
                            {data.password && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 w-4 rounded ${
                                                        level <= passwordStrength.score
                                                            ? passwordStrength.score <= 2
                                                                ? 'bg-red-500'
                                                                : passwordStrength.score <= 3
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                            : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength.score <= 2 ? 'text-red-500' :
                                            passwordStrength.score <= 3 ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                            {passwordStrength.score <= 2 ? 'Weak' :
                                             passwordStrength.score <= 3 ? 'Fair' : 'Strong'}
                                        </span>
                                    </div>
                                    {passwordStrength.feedback.length > 0 && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Missing:</span> {passwordStrength.feedback.join(', ')}
                                        </div>
                                    )}
                                </div>
                            )}
                        <InputError message={errors.password} />
                    </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-green-700 dark:text-green-300 font-medium">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm your new password"
                                    className="pl-10 pr-10 bg-white dark:bg-gray-900 border-green-500/20 dark:border-green-700/20 rounded-full focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-300 hover:shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                    </div>

                            {data.password_confirmation && (
                                <div className="flex items-center gap-2 text-xs">
                                    {data.password === data.password_confirmation ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Passwords match</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-red-600">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>Passwords don't match</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={processing || !data.password || !data.password_confirmation || data.password !== data.password_confirmation}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-700 dark:to-teal-800 text-white rounded-full hover:from-green-600 hover:to-teal-700 dark:hover:from-green-800 dark:hover:to-teal-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                    Updating Password...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Update Password
                                </>
                            )}
                    </Button>
                    </form>
                </CardContent>
            </Card>
            {/* decorative blobs */}
            <div aria-hidden className="absolute -z-10 top-20 left-16 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 opacity-30 blur-3xl animate-float" />
            <div aria-hidden className="absolute -z-10 bottom-16 right-12 w-40 h-40 rounded-full bg-gradient-to-br from-green-300 via-teal-200 to-emerald-200 opacity-30 blur-2xl animate-scale-pulse" />
            </div>
                </div>
    );
}
