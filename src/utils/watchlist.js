import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

export const toggleWatchlist = async (userId, movie) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // Check if it's already in the list
    const currentList = userSnap.data()?.watchlist || [];
    const isAdded = currentList.find(item => item.id === movie.id);

    if (isAdded) {
        // Remove if it exists
        await updateDoc(userRef, {
            watchlist: arrayRemove(movie)
        });
        return false; // Not in list anymore
    } else {
        // Add if it doesn't
        await updateDoc(userRef, {
            watchlist: arrayUnion({
                id: movie.id,
                title: movie.title || movie.name,
                poster_path: movie.poster_path,
                media_type: movie.media_type || (movie.first_air_date ? 'tv' : 'movie')
            })
        });
        return true; // Added successfully
    }
};