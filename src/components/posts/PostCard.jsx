import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit3, Trash2, Check, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toggleLike, updatePost, deletePost } from '../../store/postsSlice.js';
import '../../styles/global.css';
// Import your RichTextEditor component
import RichTextEditor from '../editor/RichTextEditor.jsx'; 
const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Key to force RichTextEditor re-render
  
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = () => {
    dispatch(toggleLike(post.id));
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    // Set the current HTML content for editing
    setEditContent(post.htmlContent);
    setIsEditing(true);
    setShowMenu(false);
    // Force RichTextEditor to re-render with new content
    setEditorKey(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    // Clear the editor by incrementing key
    setEditorKey(prev => prev + 1);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      dispatch(updatePost({
        id: post.id,
        htmlContent: editContent,
        isEdited: true,
        editedAt: new Date().toISOString()
      }));
      
      setIsEditing(false);
      setEditContent('');
      // Clear the editor by incrementing key
      setEditorKey(prev => prev + 1);
    }
  };

  const handleContentChange = (content) => {
    setEditContent(content);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    dispatch(deletePost(post.id));
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <article className="post-card">
        <div className="post-header">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="post-avatar"
          />
          
          <div className="post-content">
            <div className="post-meta">
              <div>
                <h3 className="post-author">{post.author.name}</h3>
                <p className="post-time">
                  {formatTimeAgo(post.timestamp)}
                  {post.isEdited && (
                    <span className="edited-indicator"> • edited</span>
                  )}
                </p>
              </div>
              
              <div className="post-menu-container" ref={menuRef}>
                <button 
                  className="post-menu"
                  onClick={handleMenuToggle}
                  aria-label="Post options"
                >
                  <MoreHorizontal />
                </button>
                
                {showMenu && (
                  <div className="post-menu-dropdown">
                    <button 
                      className="menu-item"
                      onClick={handleEdit}
                    >
                      <Edit3 size={16} />
                      <span>Edit</span>
                    </button>
                    <button 
                      className="menu-item delete"
                      onClick={handleDelete}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="edit-section">
                <div className="rich-text-edit-container">
                  <RichTextEditor
                    key={`editor-${post.id}-${editorKey}`}
                    value={editContent}
                    onChange={handleContentChange}
                    placeholder="Edit your post..."
                    minHeight="120px"
                    className="post-edit-editor"
                    style={{
                      width: '100%',
                      maxWidth: '100%'
                    }}
                    editorStyle={{
                      width: '100%',
                      maxWidth: '100%'
                    }}
                  />
                </div>
                
                <div className="edit-actions">
                  <button 
                    className="edit-button save"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim()}
                  >
                    <Check size={16} />
                    Save Changes
                  </button>
                  <button 
                    className="edit-button cancel"
                    onClick={handleCancelEdit}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="post-text prose"
                dangerouslySetInnerHTML={{ __html: post.htmlContent }}
              />
            )}

            <div className="post-actions">
              <button
                onClick={handleLike}
                className={`action-button ${post.isLiked ? 'liked' : ''}`}
              >
                <Heart />
                <span>{post.likes}</span>
              </button>

              <button className="action-button">
                <MessageCircle />
                <span>Comment</span>
              </button>

              <button className="action-button">
                <Share2 />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="modal-button cancel"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="modal-button delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;