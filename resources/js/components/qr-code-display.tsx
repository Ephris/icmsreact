import { QRCodeSVG } from 'qrcode.react';
import { HTMLAttributes, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
    url?: string;
    label?: string;
    showLabel?: boolean;
}

export default function QRCodeDisplay({ 
    size = 150, 
    url,
    label = 'Scan to access ICMS',
    showLabel = true,
    className,
    ...props 
}: QRCodeDisplayProps) {
    // Get the home page URL - use provided URL or default to home page
    const qrUrl = useMemo(() => {
        if (url) {
            return url;
        }
        if (typeof window !== 'undefined') {
            // Use the current origin (home page URL)
            return window.location.origin;
        }
        return '';
    }, [url]);

    if (!qrUrl) {
        return null;
    }

    return (
        <div className={cn('flex flex-col items-center gap-2', className)} {...props}>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <QRCodeSVG
                    value={qrUrl}
                    size={size}
                    level="H"
                    includeMargin={true}
                    fgColor="currentColor"
                    className="text-gray-900 dark:text-gray-100"
                />
            </div>
            {showLabel && (
                <p className="text-xs sm:text-sm text-black dark:text-black text-center font-medium max-w-[180px]">
                    {label}
                </p>
            )}
        </div>
    );
}
