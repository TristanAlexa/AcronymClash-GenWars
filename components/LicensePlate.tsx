
import React from 'react';
import { Region } from '../types';

interface LicensePlateProps {
    region: Region;
    text: string;
    slogan?: string;
    type: 'acronym' | 'submission';
}

const plateStyles: Record<Region, { container: string, region: string, main: string, slogan: string, font: string, regionFont: string }> = {
    Ontario: {
        container: 'bg-white text-blue-900 border-gray-400',
        region: 'text-blue-800',
        main: 'text-blue-900',
        slogan: 'text-blue-700',
        font: 'font-mono',
        regionFont: 'font-bebas'
    },
    California: {
        container: 'bg-white text-black border-red-600',
        region: 'text-red-600 font-serif italic',
        main: 'text-blue-800',
        slogan: 'text-gray-500',
        font: 'font-sans',
        regionFont: 'font-serif'
    },
    'New York': {
        container: 'bg-yellow-400 text-blue-800 border-blue-800',
        region: 'text-blue-800',
        main: 'text-blue-800',
        slogan: 'text-blue-800',
        font: 'font-sans',
        regionFont: 'font-roboto-condensed'
    },
    Quebec: {
        container: 'bg-gradient-to-b from-sky-300 to-white text-blue-900 border-gray-400',
        region: 'text-blue-900',
        main: 'text-blue-900',
        slogan: 'text-sky-600',
        font: 'font-sans',
        regionFont: 'font-roboto-condensed'
    },
    Illinois: {
        container: 'bg-gradient-to-b from-sky-200 via-white to-red-300 text-blue-900 border-gray-600',
        region: 'text-red-700',
        main: 'text-blue-900',
        slogan: 'text-blue-800',
        font: 'font-sans',
        regionFont: 'font-roboto-condensed'
    },
    Georgia: {
        container: 'bg-gradient-to-b from-orange-300 via-white to-green-300 text-black border-gray-600',
        region: 'text-green-800',
        main: 'text-black',
        slogan: 'text-orange-700',
        font: 'font-serif',
        regionFont: 'font-serif'
    },
};

const regionSlogans: Record<Region, string> = {
    Ontario: 'Yours To Discover',
    California: 'DMV',
    'New York': 'Excelsior',
    Quebec: 'Je me souviens',
    Illinois: 'Land of Lincoln',
    Georgia: 'Peach State'
}


const LicensePlate: React.FC<LicensePlateProps> = ({ region, text, slogan, type }) => {
    const style = plateStyles[region] || plateStyles.Ontario;
    const plateSlogan = slogan || regionSlogans[region];

    const isAcronym = type === 'acronym';

    return (
        <div className={`w-full max-w-sm h-auto aspect-[2/1] rounded-md shadow-lg p-2 flex flex-col justify-between relative border-2 ${style.container}`}>
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-300 border border-gray-400"></div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-300 border border-gray-400"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-300 border border-gray-400"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-300 border border-gray-400"></div>
            
            <div className={`text-center ${style.region} ${style.regionFont} ${isAcronym ? 'text-2xl' : 'text-xl'} uppercase tracking-widest`}>
                {region}
            </div>
            
            <div className={`text-center font-bold flex-grow flex items-center justify-center ${style.main} ${style.font}`}>
                 <span className={`${isAcronym ? 'text-7xl sm:text-8xl tracking-widest' : 'text-2xl sm:text-3xl tracking-wide leading-tight px-2'}`}>
                     {text}
                 </span>
            </div>

            <div className={`text-center font-semibold ${style.slogan} ${isAcronym ? 'text-md' : 'text-sm'} uppercase`}>
                {plateSlogan}
            </div>
        </div>
    );
};

export default LicensePlate;
