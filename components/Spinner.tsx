
import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-solid border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-slate-300">{message}</p>
        </div>
    );
};

export default Spinner;
