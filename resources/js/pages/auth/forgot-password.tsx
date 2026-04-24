import { useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, ArrowLeft, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
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

interface Props {
    status?: string;
    homeContent?: HomeContent | null;
}

export default function ForgotPassword({ status, homeContent }: Props) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });
    const [emailSent, setEmailSent] = useState(false);
    const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true, message: '' };
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const validation = validateEmail(data.email);
        setEmailValidation(validation);
        
        if (validation.isValid) {
            post(route('password.email'), {
                onSuccess: () => {
                    setEmailSent(true);
                }
            });
        }
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
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-700 dark:to-pink-800 p-6 rounded-t-2xl">
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
                                <Mail className="h-6 w-6" />
                                Reset Password
                            </CardTitle>
                        </div>
                        <p className="text-white/90 text-center">Enter your email to receive a password reset link</p>
                    </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {emailSent ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Check Your Email
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    We've sent a password reset link to <strong>{data.email}</strong>
                                </p>
                            </div>
                            <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">Important</AlertTitle>
                                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                                    Didn't receive the email? Check your spam folder or try again.
                                </AlertDescription>
                            </Alert>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEmailSent(false)}
                                    className="flex-1"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button asChild className="flex-1">
                                    <TextLink href={route('login')}>
                                        Back to Login
                                    </TextLink>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {status && (
                                <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
                                        {status}
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-purple-700 dark:text-purple-300 font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                                            autoComplete="email"
                            value={data.email}
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                if (emailValidation.message) {
                                                    setEmailValidation(validateEmail(e.target.value));
                                                }
                                            }}
                                            placeholder="Enter your email address"
                                            className={`pl-10 bg-white dark:bg-gray-900 border-purple-500/20 dark:border-purple-700/20 rounded-full focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-300 hover:shadow-md ${
                                                emailValidation.message ? 'border-red-500 focus:ring-red-500' : ''
                                            }`}
                                            aria-label="Enter your email address"
                                        />
                                    </div>
                                    {emailValidation.message && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {emailValidation.message}
                                        </p>
                                    )}
                        <InputError message={errors.email} />
                    </div>

                                <Button 
                                    type="submit" 
                                    disabled={processing || !data.email}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-700 dark:to-pink-800 text-white rounded-full hover:from-purple-600 hover:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                            Sending Reset Link...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Send Reset Link
                                        </>
                                    )}
                        </Button>
                </form>

                            <div className="text-center">
                                <TextLink href={route('login')} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                                    <ArrowLeft className="h-4 w-4 mr-1 inline" />
                                    Back to Login
                                </TextLink>
                </div>
                        </>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}
