import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.1"/>
            <path
                d="M100 30 L170 70 L170 130 L100 170 L30 130 L30 70 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="3"
            />
            <text
                x="100"
                y="120"
                textAnchor="middle"
                fontSize="60"
                fontWeight="bold"
                fill="currentColor"
                fontFamily="Arial, sans-serif"
            >
                IC
            </text>
        </svg>
    );
}
