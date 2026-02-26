import { useEffect } from 'react';

export const useBackButtonInterceptor = (isOpen, closeFunction) => {
    useEffect(() => {
        // If the modal or player isn't open, do nothing
        if (!isOpen) return;

        // Push a "fake" state into the browser's history stack
        window.history.pushState({ trapped: true }, '');

        // The function that intercepts the back button press
        const handlePopState = () => {
            closeFunction();
        };

        window.addEventListener('popstate', handlePopState);

        // Cleanup when the UI closes
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, closeFunction]);
};