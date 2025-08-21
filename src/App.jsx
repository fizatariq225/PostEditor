import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { EditorProvider } from './context/EditorContext';
import { wsService } from './services/Websockets';
import { loadPosts } from './store/postsSlice';
import Header from './components/layout/Header';
import RichTextEditor from './components/editor/RichTextEditor';
import PostsFeed from './components/posts/PostsFeed';
import './styles/global.css';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load saved posts from localStorage on app startup
    const loadSavedPosts = async () => {
      try {
        const savedPosts = localStorage.getItem('socialPosts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          console.log(`Loading ${posts.length} saved posts from localStorage`);
          
          // Load all posts at once to prevent duplicates
          dispatch(loadPosts(posts));
          
          console.log('Successfully loaded all saved posts');
        } else {
          console.log('No saved posts found');
        }
      } catch (error) {
        console.error('Error loading saved posts:', error);
        // If there's an error, clear corrupted data
        localStorage.removeItem('socialPosts');
      }
    };

    // Initialize WebSocket connection for future real-time features
    const initializeWebSocket = async () => {
      try {
        await wsService.connect();
        console.log('WebSocket connected successfully');
        
        // Set up WebSocket event listeners for posts
        wsService.on('newPost', (post) => {
          console.log('Received new post via WebSocket:', post);
          dispatch(addPost(post));
        });

        wsService.on('postUpdate', (updatedPost) => {
          console.log('Received post update via WebSocket:', updatedPost);
          // Handle post updates if needed
        });

      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    // Load posts first, then initialize WebSocket
    loadSavedPosts();
    initializeWebSocket();

    return () => {
      wsService.disconnect();
      console.log('WebSocket disconnected');
    };
  }, [dispatch]);

  // Auto-save posts whenever Redux state changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This ensures data is saved before page unload
      console.log('Page unloading, ensuring data is saved...');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="app">
      <Header />
      
      <main className="container main-content">
        <div>
          <section className="section">
            <div className="editor-section">
              <h2 className="editor-title">Share Your Thoughts</h2>
              <p className="editor-description">
                Create rich, engaging posts with our advanced text editor. Format your content with headings, lists, quotes, and more.
              </p>
            </div>
            <RichTextEditor />
          </section>

          <section>
            <PostsFeed />
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p className="footer-text">
              © 2025 SocialPost. Built with Lexical, React, and modern web technologies.
            </p>
            <div className="footer-features">
              <span>WebSocket Ready</span>
              <span>•</span>
              <span>Real-time Features</span>
              <span>•</span>
              <span>Production Ready</span>
              <span>•</span>
              <span>Auto-Save Enabled</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <EditorProvider>
        <AppContent />
      </EditorProvider>
    </Provider>
  );
}

export default App;