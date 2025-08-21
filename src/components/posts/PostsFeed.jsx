import React from 'react';
import { useSelector } from 'react-redux';
import PostCard from './PostCard';
import { MessageSquare } from 'lucide-react';

const PostsFeed = () => {
  const { posts, isLoading, error } = useSelector((state) => state.posts);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-posts">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="loading-post">
              <div className="loading-header">
                <div className="loading-avatar"></div>
                <div className="loading-content">
                  <div className="loading-line short"></div>
                  <div className="loading-line medium"></div>
                  <div style={{ marginTop: '16px' }}>
                    <div className="loading-line long"></div>
                    <div className="loading-line partial"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <p>Error loading posts: {error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="posts-feed">
        <div className="empty-state">
          <MessageSquare className="empty-icon" />
          <h3 className="empty-title">No posts yet</h3>
          <p className="empty-description">
            Be the first to share something! Create a post using the editor above to get the conversation started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-feed">
      <div className="feed-header">
        <h2 className="feed-title">Recent Posts</h2>
        <span className="posts-count">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
      </div>
      
      <div className="posts-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostsFeed;