import React, { useState, useEffect } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import Row from './Row'; // We are reusing your existing Row component!




const DiscoveryFeed = ({ user, handlePlay, onMoreInfo }) => {
    const [recommended, setRecommended] = useState([]);

    useEffect(() => {
        // If they aren't logged in or haven't watched anything yet, kill the engine.
        if (!user?.history || user.history.length === 0) return;

        const fetchAlgorithm = async () => {
            try {
                // 1. Grab their 3 most recently watched movies/shows
                const seedItems = user.history.slice(0, 3);

                // 2. Fetch recommendations for ALL of them at the exact same time
                const promises = seedItems.map(item => {
                    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    return neuralFetch(`/${type}/${item.id}/recommendations?language=en-US&page=1`);
                });

                const responses = await Promise.all(promises);

                // 3. Dump all the results into one giant array
                let allRecs = [];
                responses.forEach(res => {
                    if (res.data?.results) {
                        allRecs = [...allRecs, ...res.data.results];
                    }
                });

                // 4. The Filter: Remove duplicates (if two movies recommend the same thing) and drop missing posters
                const uniqueRecs = Array.from(
                    new Map(allRecs.filter(m => m.poster_path).map(item => [item.id, item])).values()
                );

                // 5. The Shuffle: Randomize the array so the row feels fresh every time they refresh the app
                const shuffled = uniqueRecs.sort(() => 0.5 - Math.random()).slice(0, 20);

                setRecommended(shuffled);
            } catch (error) {
                console.error("Discovery Engine Failed:", error);
            }
        };

        fetchAlgorithm();
    }, [user]);

    // Don't render the row at all if the engine didn't find anything
    if (!user || recommended.length === 0) return null;

    return (
        <Row
            title="Top Picks For You"
            staticData={recommended}
            user={user}
            onSelectMedia={handlePlay}
            onInfoClick={onMoreInfo}
        />
    );
};

export default DiscoveryFeed;