const { client } = require('./profile');

/**
 * Get user's groups and wall posts
 */
async function getGroups(userId, cookie = null) {
    try {
        const response = await client.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
        const groups = response.data.data || [];

        const groupInfo = groups.map(item => ({
            id: item.group.id,
            name: item.group.name,
            description: item.group.description,
            member_count: item.group.memberCount,
            role: item.role.name
        }));

        // Try to get wall posts if cookie provided
        let wallPosts = [];
        if (cookie && groups.length > 0) {
            try {
                const groupId = groups[0].group.id;
                const postsResponse = await client.get(
                    `https://groups.roblox.com/v2/groups/${groupId}/wall/posts?limit=10`,
                    {
                        headers: { 'Cookie': `.ROBLOSECURITY=${cookie}` }
                    }
                );
                wallPosts = postsResponse.data.data || [];
            } catch (error) {
                // Wall posts require authentication, skip if fails
            }
        }

        return {
            groups: groupInfo,
            wall_posts: wallPosts.map(post => ({
                body: post.body,
                created: post.created,
                updated: post.updated
            }))
        };
    } catch (error) {
        console.error('Groups scrape error:', error.message);
        return { groups: [], wall_posts: [] };
    }
}

module.exports = {
    getGroups
};
