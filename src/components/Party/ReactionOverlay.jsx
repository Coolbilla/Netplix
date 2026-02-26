import React, { useEffect, useState } from 'react';

const ReactionOverlay = ({ reactions }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
            {reactions.map((r) => (
                <FloatingEmoji key={r.id} emoji={r.label} />
            ))}
        </div>
    );
};

const FloatingEmoji = ({ emoji }) => {
    const [style, setStyle] = useState({
        left: `${Math.random() * 80 + 10}%`,
        bottom: '-10%',
        opacity: 1,
        transform: 'scale(1)',
        transition: 'all 3s ease-out'
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setStyle(prev => ({
                ...prev,
                bottom: '100%',
                opacity: 0,
                transform: `scale(2) rotate(${Math.random() * 40 - 20}deg)`,
            }));
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={style} className="absolute text-4xl select-none">
            {emoji}
        </div>
    );
};

export default ReactionOverlay;