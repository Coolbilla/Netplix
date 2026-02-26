import { db } from '../firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    deleteDoc,
    getDoc
} from 'firebase/firestore';

/**
 * Creates a new watch party session
 */
export const createParty = async (user, media, isPublic = true) => {
    try {
        const partyData = {
            hostId: user.uid,
            hostName: user.displayName || 'Anonymous',
            hostPhoto: user.photoURL,
            createdAt: serverTimestamp(),
            media: {
                id: media.id,
                type: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
                title: media.title || media.name,
                poster: media.poster_path,
            },
            status: {
                isPlaying: false,
                currentTime: 0,
                // Added default TV progress for sync
                season: 1,
                episode: 1,
                lastUpdated: serverTimestamp(),
            },
            settings: {
                isPublic: isPublic,
            },
            members: [
                {
                    uid: user.uid,
                    name: user.displayName,
                    photo: user.photoURL
                }
            ]
        };

        const docRef = await addDoc(collection(db, "parties"), partyData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating party:", error);
        throw error;
    }
};

/**
 * NEW: Updates the current episode/season (Crucial for the error you had)
 */
export const updatePartyEpisode = async (partyId, season, episode) => {
    if (!partyId) return;
    try {
        const partyRef = doc(db, "parties", partyId);
        await updateDoc(partyRef, {
            "status.season": season,
            "status.episode": episode,
            "status.lastUpdated": serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating episode:", error);
    }
};

/**
 * Adds a user to an existing party
 */
export const joinParty = async (partyId, user) => {
    try {
        const partyRef = doc(db, "parties", partyId);
        await updateDoc(partyRef, {
            members: arrayUnion({
                uid: user.uid,
                name: user.displayName,
                photo: user.photoURL
            })
        });
    } catch (error) {
        console.error("Error joining party:", error);
    }
};

/**
 * Removes a user from the party. 
 */
export const leaveParty = async (partyId, user, isHost = false) => {
    if (!partyId || !user) return;
    try {
        const partyRef = doc(db, "parties", partyId);
        const partySnap = await getDoc(partyRef);

        if (!partySnap.exists()) return;

        const data = partySnap.data();
        const members = data.members || [];

        // 1. If I am the last person (or if it's already empty/bugged), delete the room
        if (members.length <= 1) {
            await deleteDoc(partyRef);
            return;
        }

        // 2. If I'm the host, I can either transfer ownership or just leave
        // For now, if host leaves but people remain, we'll just remove the host from members
        // The room stays active but "headless" until we implement transfer logic
        // user requested specific logic: just remove user from list

        await updateDoc(partyRef, {
            members: arrayRemove({
                uid: user.uid,
                name: user.displayName,
                photo: user.photoURL
            })
        });

    } catch (error) {
        console.error("Error leaving party:", error);
    }
};

/**
 * Sends a live emoji reaction
 */
export const sendReaction = async (partyId, emoji) => {
    if (!partyId || !emoji) return;
    try {
        await addDoc(collection(db, "parties", partyId, "reactions"), {
            label: emoji,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error sending reaction:", error);
    }
};