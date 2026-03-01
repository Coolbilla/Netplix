import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const TVNavigationContext = createContext();

export const useTVNavigation = () => useContext(TVNavigationContext);

export const TVNavigationProvider = ({ children }) => {
    const [activeId, setActiveId] = useState(null);
    const nodesRef = useRef(new Map());

    // Register an element into the 2D matrix
    const registerNode = useCallback((id, ref, onEnter) => {
        nodesRef.current.set(id, { ref, onEnter });
        // Automatically focus the first item that mounts if nothing is focused
        setActiveId(prev => (prev === null ? id : prev));
    }, []);

    // Remove element if it unmounts (e.g. changing categories)
    const unregisterNode = useCallback((id) => {
        nodesRef.current.delete(id);
        setActiveId(prev => (prev === id ? null : prev));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
            if (!keys.includes(e.key)) return;

            e.preventDefault(); // Stop the whole page from scrolling natively

            if (e.key === 'Enter') {
                if (activeId && nodesRef.current.has(activeId)) {
                    const node = nodesRef.current.get(activeId);
                    if (node.onEnter) node.onEnter();
                    else node.ref.current?.click();
                }
                return;
            }

            if (!activeId || !nodesRef.current.has(activeId)) return;

            const currentRef = nodesRef.current.get(activeId).ref.current;
            if (!currentRef) return;

            const currentRect = currentRef.getBoundingClientRect();
            let bestMatch = null;
            let minDistance = Infinity;

            // SPATIAL GEOMETRY ALGORITHM
            nodesRef.current.forEach(({ ref }, id) => {
                if (id === activeId || !ref.current) return;

                const rect = ref.current.getBoundingClientRect();
                
                // Calculate center points of current focused item and target items
                const cx = currentRect.left + currentRect.width / 2;
                const cy = currentRect.top + currentRect.height / 2;
                const nx = rect.left + rect.width / 2;
                const ny = rect.top + rect.height / 2;

                const dx = nx - cx;
                const dy = ny - cy;

                let isDirectionMatch = false;
                
                // Prioritize items that are directly in the path of the arrow key
                if (e.key === 'ArrowRight' && dx > 0 && Math.abs(dy) <= Math.abs(dx)) isDirectionMatch = true;
                if (e.key === 'ArrowLeft' && dx < 0 && Math.abs(dy) <= Math.abs(dx)) isDirectionMatch = true;
                if (e.key === 'ArrowDown' && dy > 0 && Math.abs(dx) <= Math.abs(dy)) isDirectionMatch = true;
                if (e.key === 'ArrowUp' && dy < 0 && Math.abs(dx) <= Math.abs(dy)) isDirectionMatch = true;

                // Fallback for items that are slightly diagonal
                if (!isDirectionMatch) {
                   if (e.key === 'ArrowRight' && dx > 0) isDirectionMatch = true;
                   if (e.key === 'ArrowLeft' && dx < 0) isDirectionMatch = true;
                   if (e.key === 'ArrowDown' && dy > 0) isDirectionMatch = true;
                   if (e.key === 'ArrowUp' && dy < 0) isDirectionMatch = true;
                }

                if (isDirectionMatch) {
                    // Pythagorean theorem to find the absolute closest item
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestMatch = id;
                    }
                }
            });

            // Snap focus to the closest item and smoothly scroll the screen
            if (bestMatch) {
                setActiveId(bestMatch);
                nodesRef.current.get(bestMatch).ref.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeId]);

    return (
        <TVNavigationContext.Provider value={{ activeId, setActiveId, registerNode, unregisterNode }}>
            {children}
        </TVNavigationContext.Provider>
    );
};
