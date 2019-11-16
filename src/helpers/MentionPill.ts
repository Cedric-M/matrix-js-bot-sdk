import { MatrixClient } from "../MatrixClient";
import { Permalinks } from "./Permalinks";
import { LogService } from "..";

/**
 * Represents a system for generating a mention pill for an entity.
 * @category Utilities
 */
export class MentionPill {

    private constructor(private entityPermalink: string, private displayName: string) {
    }

    /**
     * The HTML component of the mention.
     */
    public get html(): string {
        return `<a href="${this.entityPermalink}">${this.displayName}</a>`;
    }

    /**
     * The plain text component of the mention.
     */
    public get text(): string {
        return this.displayName;
    }

    /**
     * Creates a new mention for a user in an optional room.
     * @param {string} userId The user ID the mention is for.
     * @param {String} inRoomId Optional room ID the user is being mentioned in, for the aesthetics of the mention.
     * @param {MatrixClient} client Optional client for creating a more pleasing mention.
     * @returns {Promise<MentionPill>} Resolves to the user's mention.
     */
    public static async forUser(userId: string, inRoomId: string = null, client: MatrixClient = null): Promise<MentionPill> {
        const permalink = Permalinks.forUser(userId);

        let displayName = userId;
        try {
            if (client) {
                let profile = null;

                if (inRoomId) {
                    profile = await client.getRoomStateEvent(inRoomId, "m.room.member", userId);
                }
                if (!profile) {
                    profile = await client.getUserProfile(userId);
                }

                if (profile['displayname']) {
                    displayName = profile['displayname'];
                }
            }
        } catch (e) {
            LogService.warn("MentionPill", "Error getting profile", e);
        }

        return new MentionPill(permalink, displayName);
    }
}