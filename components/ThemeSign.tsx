
import React from 'react';

interface ThemeSignProps {
    theme: string;
}

const ThemeSign: React.FC<ThemeSignProps> = ({ theme }) => {
    return (
        <div className="relative w-full max-w-lg h-40 flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-yellow-400 transform -skew-y-2 rounded-lg shadow-lg border-4 border-black"></div>
            <div className="relative text-center p-2">
                 <h2 className="text-black font-anton text-2xl md:text-3xl uppercase tracking-wide" style={{ textShadow: '1px 1px 0px #fff' }}>
                    {theme}
                </h2>
            </div>
        </div>
    );
};

export default ThemeSign;
