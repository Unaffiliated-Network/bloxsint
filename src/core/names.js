const { client } = require('./profile');

/**
 * Get previous usernames
 */
async function getPreviousNames(userId) {
    try {
        const response = await client.get(`https://users.roblox.com/v1/users/${userId}/username-history?limit=100`);
        const names = response.data.data || [];

        return names.map(entry => entry.name);
    } catch (error) {
        console.error('Previous names error:', error.message);
        return [];
    }
}

module.exports = {
    getPreviousNames
};
