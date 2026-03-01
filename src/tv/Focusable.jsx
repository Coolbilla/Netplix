import React, { useEffect, useRef, useId } from 'react';
import { useTVNavigation } from './TVNavigationProvider';

const Focusable = ({ children, onEnter, onClick, className = '', activeClass = 'tv-focused', id: propId }) => {
    const generatedId = useId();
    const id = propId || generatedId; 
    const ref = useRef(null);
    const { activeId, registerNode, unregisterNode, setActiveId } = useTVNavigation();

    useEffect(() => {
        // Register this component into the spatial matrix on load
        registerNode(id, ref, onEnter || onClick);
        return () => unregisterNode(id);
    }, [id, registerNode, unregisterNode, onEnter, onClick]);

    const isFocused = activeId === id;

    return (
        <div
            ref={ref}
            className={`transition-all duration-300 outline-none ${className} ${isFocused ? activeClass : ''}`}
            onMouseEnter={() => setActiveId(id)} // Syncs standard mouse users with the TV focus
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Focusable;
