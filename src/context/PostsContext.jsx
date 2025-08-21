import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PostsContext = createContext();

const postsReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_POSTS':
      return { ...state, posts: action.payload };
    case 'ADD_POST':
      const newState = { ...state, posts: [action.payload, ...state.posts] };
      localStorage.setItem('socialPosts', JSON.stringify(newState.posts));
      return newState;
    case 'TOGGLE_LIKE':
      const updatedPosts = state.posts.map(post =>
        post.id === action.payload
          ? { ...post, isLiked: !post.isLiked, likes: post.likes + (post.isLiked ? -1 : 1) }
          : post
      );
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
      return { ...state, posts: updatedPosts };
    default:
      return state;
  }
};

export const PostsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postsReducer, { posts: [] });

  // Load posts on mount
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem('socialPosts');
      if (savedPosts) {
        const posts = JSON.parse(savedPosts);
        dispatch({ type: 'LOAD_POSTS', payload: posts });
        console.log('Loaded posts from storage:', posts.length);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, []);

  return (
    <PostsContext.Provider value={{ state, dispatch }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};
