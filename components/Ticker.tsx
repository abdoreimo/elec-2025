
import React from 'react';

const Ticker: React.FC = () => {
    const message = "هذا البرنامج من انجاز الزميلين اولفي عبد الرحمن و لروي حبيب صدقة جارية على ابويهما المتوفين فادعوا لهما بالرحمة و المغفرة ولجميع موتى المسلمين اللهم انصر اخواننا بغزة";

    return (
        <div className="fixed bottom-0 left-0 right-0 h-12 bg-stone-800/90 text-amber-200 overflow-hidden whitespace-nowrap z-50 flex items-center">
            <div className="animate-ticker-rtl inline-block">
                <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
                <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
                 <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
                 <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
            </div>
            <div className="animate-ticker-rtl inline-block">
                <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
                <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
                 <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
                 <span className="mx-8">{message}</span>
                <span className="mx-8 text-amber-400">***</span>
            </div>
            <style>
                {`
                @keyframes ticker-rtl {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-ticker-rtl {
                    animation: ticker-rtl 90s linear infinite;
                }
                `}
            </style>
        </div>
    );
};

export default Ticker;
