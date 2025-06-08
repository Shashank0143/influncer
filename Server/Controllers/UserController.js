// Get user profile
export const getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const db = req.app.get('db');

        // Get user using stored procedure
        const [user] = await db.query('CALL GetUserById(?)', [id]);
        if (user[0].length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user[0][0]);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleWare
        const { username, email } = req.body;
        const db = req.app.get('db');

        // Check if user exists
        const [user] = await db.query('CALL GetUserById(?)', [userId]);
        if (user[0].length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user using stored procedure
        await db.query('CALL UpdateUser(?, ?, ?)', [userId, username || user[0][0].username, email || user[0][0].email]);

        // Retrieve updated user
        const [updatedUser] = await db.query('CALL GetUserById(?)', [userId]);

        res.status(200).json({ message: 'User updated successfully!', user: updatedUser[0][0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Follow a user
export const followUser = async (req, res) => {
    try {
        const followerId = req.user.id; // From authMiddleWare
        const followingId = req.params.id;
        const db = req.app.get('db');

        // Prevent self-follow
        if (followerId === parseInt(followingId)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if following user exists
        const [followingUser] = await db.query('CALL GetUserById(?)', [followingId]);
        if (followingUser[0].length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Follow user using stored procedure
        await db.query('CALL FollowUser(?, ?)', [followerId, followingId]);

        res.status(200).json({ message: `You are now following user ${followingId}` });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id; // From authMiddleWare
        const followingId = req.params.id;
        const db = req.app.get('db');

        // Prevent self-unfollow
        if (followerId === parseInt(followingId)) {
            return res.status(400).json({ message: 'Cannot unfollow yourself' });
        }

        // Check if following user exists
        const [followingUser] = await db.query('CALL GetUserById(?)', [followingId]);
        if (followingUser[0].length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Unfollow user using stored procedure
        await db.query('CALL UnfollowUser(?, ?)', [followerId, followingId]);

        res.status(200).json({ message: `You have unfollowed user ${followingId}` });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get followers
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        const db = req.app.get('db');

        // Get followers using stored procedure
        const [followers] = await db.query('CALL GetFollowers(?)', [userId]);

        res.status(200).json(followers[0]);
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get following
export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;
        const db = req.app.get('db');

        // Get following using stored procedure
        const [following] = await db.query('CALL GetFollowing(?)', [userId]);

        res.status(200).json(following[0]);
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: error.message });
    }
};