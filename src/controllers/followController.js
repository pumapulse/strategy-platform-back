const { supabase } = require('../config/supabase');

// Toggle follow/unfollow a user
const toggleFollow = async (req, res) => {
  try {
    const followerId = req.userId;
    const { userId: followingId } = req.params;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      return res.json({ following: false, message: 'Unfollowed' });
    } else {
      await supabase
        .from('user_follows')
        .insert({ follower_id: followerId, following_id: followingId });
      return res.json({ following: true, message: 'Following' });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
};

// Get follow status + counts for a user
const getFollowStatus = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const [followingRes, followersRes, isFollowingRes] = await Promise.all([
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('user_follows').select('id').eq('follower_id', currentUserId).eq('following_id', userId).single(),
    ]);

    res.json({
      following: followingRes.count ?? 0,
      followers: followersRes.count ?? 0,
      isFollowing: !!isFollowingRes.data,
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({ error: 'Failed to get follow status' });
  }
};

module.exports = { toggleFollow, getFollowStatus };
