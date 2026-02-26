import React, { memo } from 'react';
import { getFlixerUrl } from '../utils/cinezo';

const PartyPlayer = memo(({ partyData, isHost }) => {
    if (!partyData || !partyData.media) return null;

    const { media, status } = partyData;
    const currentSeason = status?.season || 1;
    const currentEpisode = status?.episode || 1;

    // Using your utility logic
    const streamUrl = getFlixerUrl(media.id, media.type, currentSeason, currentEpisode);

    return (
        <div className="w-full h-full bg-black">
            <iframe
                id="party-iframe"
                src={streamUrl}
                className="w-full h-full border-none"
                allowFullScreen
                allow="autoplay; encrypted-media"
                scrolling="no"
            />
        </div>
    );
}, (prev, next) => {
    // ONLY re-render the player if the episode or season actually changes
    return (
        prev.partyData?.status?.episode === next.partyData?.status?.episode &&
        prev.partyData?.status?.season === next.partyData?.status?.season &&
        prev.isHost === next.isHost
    );
});

export default PartyPlayer;