const { getUserIdFromUsername, scrapeProfile } = require('./profile');
const { getFriends } = require('./friends');
const { getGamesPlayed } = require('./games');
const { getGroups } = require('./groups');
const { getPreviousNames } = require('./names');

/**
 * Main lookup orchestrator
 */
async function performLookup(searchType, searchValue, options = {}, progressCallback = null) {
    const results = {};

    try {
        // Step 1: Get user ID
        progressCallback?.('Resolving user ID...');
        let userId;

        if (searchType === 'username') {
            const userInfo = await getUserIdFromUsername(searchValue);
            if (!userInfo) {
                throw new Error(`Username "${searchValue}" not found`);
            }
            userId = userInfo.id;
            results.roblox_id = userId;
            results.username = userInfo.name;
            progressCallback?.(`Found user: ${userInfo.name} (ID: ${userId})`);
        } else {
            userId = parseInt(searchValue);
            results.roblox_id = userId;
            progressCallback?.(`Looking up user ID: ${userId}`);
        }

        // Step 2: Scrape profile
        progressCallback?.('Fetching profile information...');
        const profileData = await scrapeProfile(userId);
        Object.assign(results, { personal_info: profileData });

        // Step 3: Get friends
        progressCallback?.('Fetching friends list...');
        const friendsData = await getFriends(userId);
        results.friends = friendsData;

        // Step 4: Get games played
        progressCallback?.('Fetching games played...');
        const gameLimit = options.gameLimit || 10;
        const gamesData = await getGamesPlayed(userId, gameLimit);
        results.games_played = gamesData;

        // Step 5: Get groups
        progressCallback?.('Fetching groups...');
        const groupsData = await getGroups(userId);
        results.groups = groupsData.groups;
        if (groupsData.wall_posts.length > 0) {
            results.group_wall_posts = groupsData.wall_posts;
        }

        // Step 6: Get previous names
        progressCallback?.('Fetching username history...');
        const previousNames = await getPreviousNames(userId);
        results.previous_names = previousNames;

        progressCallback?.('Lookup completed successfully!');
        return {
            success: true,
            data: results
        };

    } catch (error) {
        progressCallback?.(`Error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            data: results
        };
    }
}

module.exports = {
    performLookup
};
