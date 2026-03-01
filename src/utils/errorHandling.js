/**
 * Enterprise Error Handler & Auto-Recovery Engine
 * Adapted from flyx-main for Netplix
 */

export const ErrorTypes = {
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    CORS_BLOCKED: 'CORS_BLOCKED',
    IFRAME_LOAD_ERROR: 'IFRAME_LOAD_ERROR',
    MEDIA_DECRYPT_FAILED: 'MEDIA_DECRYPT_FAILED',
    SOURCE_DEAD: 'SOURCE_DEAD',
    UNKNOWN: 'UNKNOWN'
};

export class MediaErrorHandler {
    constructor(serverList, currentServerId, onSwitchServer, onShowNotification) {
        this.serverList = serverList;
        this.currentServerId = currentServerId;
        this.onSwitchServer = onSwitchServer;
        this.onShowNotification = onShowNotification;
    }

    triggerFailover(errorType = ErrorTypes.UNKNOWN) {
        console.warn(`[Enterprise Auto-Recovery] Initiated due to: ${errorType}`);

        const currentIndex = this.serverList.findIndex(s => s.id === this.currentServerId);

        // Check if there is a next server available in the array
        if (currentIndex !== -1 && currentIndex < this.serverList.length - 1) {
            const nextServer = this.serverList[currentIndex + 1];

            console.log(`[Enterprise Auto-Recovery] Rerouting to Backup Node: ${nextServer.name}`);

            if (this.onShowNotification) {
                this.onShowNotification(`Stream unresponsive. Auto-rerouting to ${nextServer.name}...`, 'warning');
            }

            if (this.onSwitchServer) {
                // Add a tiny delay to allow the notification to be read before the iframe blanks out
                setTimeout(() => {
                    this.onSwitchServer(nextServer.id);
                }, 800);
            }
            return true; // Successfully recovered
        }

        // Out of backup servers
        console.error('[Enterprise Auto-Recovery] FAILED. All backup nodes exhausted.');
        if (this.onShowNotification) {
            this.onShowNotification('Critical Failure: All server nodes are currently down.', 'fatal');
        }
        return false;
    }
}
