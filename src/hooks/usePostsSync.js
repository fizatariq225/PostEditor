import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../store/postsSlice';

export const usePostsSync = (websocket) => {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.posts.posts);

  useEffect(() => {
    // Load posts from localStorage on mount
    try {
      const savedPosts = localStorage.getItem('socialPosts');
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        // Dispatch each post to Redux
        parsedPosts.forEach(post => dispatch(addPost(post)));
      }
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    // Save posts to localStorage whenever posts change
    if (posts.length > 0) {
      localStorage.setItem('socialPosts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (websocket) {
      // WebSocket event listeners
      websocket.on('newPost', (post) => {
        dispatch(addPost(post));
      });

      websocket.on('connect', () => {
        console.log('WebSocket connected, syncing posts...');
        // Optionally sync with server
      });
    }
  }, [websocket, dispatch]);
};