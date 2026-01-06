const { client } = require('./profile');

/**
 * Get recently played games
 */
async function getGamesPlayed(userId, limit = 10) {
    try {
        const response = await client.get(
            `https://games.roblox.com/v2/users/${userId}/games?limit=${limit}&sortOrder=Desc`
        );

        const games = response.data.data || [];

        return games.map(game => ({
            id: game.id,
            name: game.name,
            description: game.description,
            creator: game.creator?.name,
            created: game.created,
            updated: game.updated,
            playing: game.placeVisits,
            visits: game.placeVisits,
            max_players: null // v2 doesn't always provide this in list view
        }));
    } catch (error) {
        console.error('Games scrape error:', error.message);
        return [];
    }
}

module.exports = {
    getGamesPlayed
};
