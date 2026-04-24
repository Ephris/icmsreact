import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Register() {
    useEffect(() => {
        // Redirect to login since public registration is not available
        // User registration is handled by department heads for students
        router.visit('/login');
    }, []);

    return null;
}
