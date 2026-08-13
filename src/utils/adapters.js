export function mapProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    full_name: profile.fullName,
    profile_photo: profile.profilePhoto,
    created_at: profile.createdAt
  };
}

export function mapPost(post) {
  if (!post) return null;
  return {
    ...post,
    user_id: post.userId,
    image_url: post.imageUrl,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    profile: mapProfile(post.profile)
  };
}

export function mapComment(comment) {
  if (!comment) return null;
  return {
    ...comment,
    user_id: comment.userId,
    post_id: comment.postId,
    created_at: comment.createdAt,
    profile: mapProfile(comment.profile)
  };
}

export function mapNotification(notification) {
  if (!notification) return null;
  return {
    ...notification,
    user_id: notification.userId,
    actor_id: notification.actorId,
    post_id: notification.postId,
    is_read: notification.isRead,
    created_at: notification.createdAt,
    actor_profile: mapProfile(notification.actorProfile)
  };
}

export function mapFollow(follow) {
  if (!follow) return null;
  return {
    ...follow,
    follower_id: follow.followerId,
    following_id: follow.followingId,
    created_at: follow.createdAt,
    profile: mapProfile(follow.profile)
  };
}
