
import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 1 1 9 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 5.25a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 9.75h1.5v4.5h-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h-1.5v4.5h1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 0 1-3-3V9.75a3 3 0 0 1 6 0v3a3 3 0 0 1-3 3Z" />
    </svg>
);

export default TrophyIcon;
