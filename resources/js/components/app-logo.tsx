import AppLogoIcon from './app-logo-icon';
import { usePage } from '@inertiajs/react';

type AppLogoProps = {
  className?: string;
};

const toImageUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;
    const trimmed = path.replace(/^\/+/, '');
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('storage/')) return `/media/${trimmed.substring('storage/'.length)}`;
    if (trimmed.startsWith('public/')) return `/media/${trimmed.substring('public/'.length)}`;
    return `/media/${trimmed}`;
};

export default function AppLogo({ className }: AppLogoProps){
    const { props } = usePage();
    const homeContent = (props as { homeContent?: { logo?: string } })?.homeContent;
    const logoUrl = homeContent?.logo ? toImageUrl(homeContent.logo) : undefined;

    return (
        <div className={`flex flex-col items-center justify-center${className ? ` ${className}` : ''}`}>
            <div className="flex aspect-square size-22 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground mb-2">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-full w-full rounded-md object-contain"
                    />
                ) : (
                    <AppLogoIcon className="size-10 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="grid flex-1 text-center text-sm">
                <span className="truncate leading-tight font-semibold">AUHHC ICMS</span>
            </div>
        </div>
    );
}


