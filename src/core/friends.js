const { client } = require('./profile');

/**
 * Get user's friends list
 */
async function getFriends(userId) {
    try {
        const response = await client.get(`https://friends.roblox.com/v1/users/${userId}/friends`);
        const friends = response.data.data || [];

        return {
            total_friends: friends.length,
            friends: friends.map(friend => ({
                id: friend.id,
                name: friend.name,
                display_name: friend.displayName
            }))
        };
    } catch (error) {
        console.error('Friends scrape error:', error.message);
        return { total_friends: 0, friends: [] };
    }
}

module.exports = {
    getFriends
};
