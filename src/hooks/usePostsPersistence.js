import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

export const usePostsPersistence = () => {
  const posts = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    try {
      localStorage.setItem('socialPosts', JSON.stringify(posts));
      console.log('Posts saved to localStorage:', posts.length);
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  }, [posts]);

  // Load posts from localStorage on mount
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem('socialPosts');
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        // If you have a loadPosts action, dispatch it here
        console.log('Posts loaded from localStorage:', parsedPosts.length);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, [dispatch]);
};