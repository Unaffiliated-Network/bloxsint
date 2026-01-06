const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Configure axios with retry logic
const client = axios.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
});

axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.response?.status === 429;
    }
});

/**
 * Get username from user ID
 */
async function getUsernameFromId(userId) {
    try {
        const response = await client.get(`https://users.roblox.com/v1/users/${userId}`);
        return response.data.name;
    } catch (error) {
        return null;
    }
}

/**
 * Get user ID from username
 */
async function getUserIdFromUsername(username) {
    try {
        const response = await client.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: false
        });

        if (response.data.data && response.data.data.length > 0) {
            return {
                id: response.data.data[0].id,
                name: response.data.data[0].name
            };
        }
        return null;
    } catch (error) {
        throw new Error(`Failed to find username: ${error.message}`);
    }
}

/**
 * Scrape user profile and bio for personal information
 */
async function scrapeProfile(userId) {
    try {
        const response = await client.get(`https://users.roblox.com/v1/users/${userId}`);
        const userData = response.data;

        const bio = userData.description || '';
        const personalInfo = extractPersonalInfo(bio);

        return {
            username: userData.name,
            display_name: userData.displayName,
            description: bio,
            created: userData.created,
            is_banned: userData.isBanned,
            ...personalInfo
        };
    } catch (error) {
        console.error('Profile scrape error:', error.message);
        return {};
    }
}

/**
 * Extract personal information from bio text
 */
function extractPersonalInfo(bio) {
    const info = {};
    const words = bio.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // Check for age (2 digit number)
        if (/^\d{2}$/.test(word)) {
            info.age = word;
        }

        // Check for gender indicators
        const lowerWord = word.toLowerCase();
        if (['he', 'him', 'his'].includes(lowerWord)) {
            info.gender = 'male';
        } else if (['she', 'her', 'hers'].includes(lowerWord)) {
            info.gender = 'female';
        }

        // Check for Discord tag (username#1234)
        if (i > 0 && /^\d{4}$/.test(word)) {
            info.discord = `${words[i - 1]}#${word}`;
        }

        // Check for Discord username ending with 4 digits
        if (/\w+\d{4}$/.test(word)) {
            info.discord = word;
        }
    }

    return info;
}

module.exports = {
    getUsernameFromId,
    getUserIdFromUsername,
    scrapeProfile,
    client
};
