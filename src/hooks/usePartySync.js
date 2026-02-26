import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

export const usePartySync = (partyId, userId, playerRef, onTerminate) => {
    const [partyData, setPartyData] = useState(null);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        if (!partyId) return;

        const partyRef = doc(db, "parties", partyId);

        // 1. Listen for changes in the Party document
        const unsub = onSnapshot(partyRef, (docSnap) => {
            if (!docSnap.exists()) {
                // Party was deleted by host or doesn't exist
                if (onTerminate) onTerminate();
                return;
            }

            const data = docSnap.data();
            setPartyData(data);

            // Check if current user is the host
            const hostStatus = data.hostId === userId;
            setIsHost(hostStatus);

            // 2. GUEST LOGIC: Sync with Host
            if (!hostStatus && playerRef.current) {
                const hostTime = data.status?.currentTime || 0;
                const hostPlaying = data.status?.isPlaying || false;
                const myTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;

                // Sync play/pause state
                if (playerRef.current.getPlayerState) {
                    const playerState = playerRef.current.getPlayerState();
                    if (hostPlaying && playerState !== 1) playerRef.current.playVideo();
                    if (!hostPlaying && playerState === 1) playerRef.current.pauseVideo();
                }

                // If host is more than 3 seconds away, force seek
                if (Math.abs(myTime - hostTime) > 3) {
                    if (playerRef.current.seekTo) playerRef.current.seekTo(hostTime, true);
                }
            }
        });

        return () => unsub();
    }, [partyId, userId, playerRef]);

    // 3. HOST LOGIC: Push updates to Firestore
    const updateHostState = async (isPlaying, currentTime) => {
        if (!isHost || !partyId) return;

        const partyRef = doc(db, "parties", partyId);
        try {
            await updateDoc(partyRef, {
                "status.isPlaying": isPlaying,
                "status.currentTime": currentTime,
                "status.lastUpdated": serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to update host state:", err);
        }
    };

    return { partyData, isHost, updateHostState };
};