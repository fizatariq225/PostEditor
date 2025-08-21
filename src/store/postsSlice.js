// src/store/postsSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage persistence
const savePostsToStorage = (posts) => {
  try {
    localStorage.setItem('socialPosts', JSON.stringify(posts));
    console.log(`Saved ${posts.length} posts to localStorage`);
  } catch (error) {
    console.error('Error saving posts to storage:', error);
  }
};

const loadPostsFromStorage = () => {
  try {
    const savedPosts = localStorage.getItem('socialPosts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  } catch (error) {
    console.error('Error loading posts from storage:', error);
    return [];
  }
};

// Initial state - start with empty array, posts will be loaded in App.js
const initialState = {
  posts: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Load posts action (called from App.js)
    loadPosts: (state, action) => {
      state.posts = action.payload;
      state.lastUpdated = new Date().toISOString();
      console.log(`Loaded ${action.payload.length} posts into Redux state`);
    },
    
    // Add new post
    addPost: (state, action) => {
      // Check if post already exists (prevent duplicates on app load)
      const existingPost = state.posts.find(post => post.id === action.payload.id);
      if (!existingPost) {
        state.posts.unshift(action.payload); // Add to beginning of array
        state.lastUpdated = new Date().toISOString();
        savePostsToStorage(state.posts); // Auto-save to localStorage
        console.log('New post added and saved:', action.payload.id);
      }
    },
    
    // Update existing post
    updatePost: (state, action) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
        state.lastUpdated = new Date().toISOString();
        savePostsToStorage(state.posts);
        console.log('Post updated and saved:', action.payload.id);
      }
    },
    
    // Delete post
    deletePost: (state, action) => {
      const initialLength = state.posts.length;
      state.posts = state.posts.filter(post => post.id !== action.payload);
      if (state.posts.length < initialLength) {
        state.lastUpdated = new Date().toISOString();
        savePostsToStorage(state.posts);
        console.log('Post deleted and saved:', action.payload);
      }
    },
    
    // Toggle like on post
    toggleLike: (state, action) => {
      const post = state.posts.find(post => post.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        state.lastUpdated = new Date().toISOString();
        savePostsToStorage(state.posts);
        console.log(`Post ${action.payload} like toggled:`, post.isLiked);
      }
    },
    
    // Clear all posts
    clearAllPosts: (state) => {
      state.posts = [];
      state.lastUpdated = new Date().toISOString();
      localStorage.removeItem('socialPosts');
      console.log('All posts cleared');
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Bulk update posts (useful for WebSocket sync)
    bulkUpdatePosts: (state, action) => {
      state.posts = action.payload;
      state.lastUpdated = new Date().toISOString();
      savePostsToStorage(state.posts);
      console.log(`Bulk updated ${action.payload.length} posts`);
    },
  },
});

// Export actions
export const {
  loadPosts,
  addPost,
  updatePost,
  deletePost,
  toggleLike,
  clearAllPosts,
  setLoading,
  setError,
  bulkUpdatePosts,
} = postsSlice.actions;

// Export selectors
export const selectAllPosts = (state) => state.posts.posts;
export const selectPostById = (state, postId) => 
  state.posts.posts.find(post => post.id === postId);
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;
export const selectLastUpdated = (state) => state.posts.lastUpdated;

// Export reducer
export default postsSlice.reducer;