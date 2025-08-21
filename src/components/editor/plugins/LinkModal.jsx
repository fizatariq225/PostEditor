import React, { useState, useEffect } from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { $createLinkPreviewNode } from "./LinkPreviewNode";
import '../../../styles/global.css';
import {Link2,Text, ToggleLeft, ToggleRight } from "lucide-react";
const LinkModal = ({ open, initialUrl = '', initialAnchor = '', onClose, onSubmit }) => {
  const [editor] = useLexicalComposerContext(); 
  const [url, setUrl] = useState(initialUrl);
  const [anchor, setAnchor] = useState(initialAnchor);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewType, setPreviewType] = useState('text'); // Default to 'text'
  const [imageMode, setImageMode] = useState('url');
  const [imageUrl, setImageUrl] = useState('');
  const [filePreview, setFilePreview] = useState('');

  useEffect(() => {
    if (open) {
      setUrl(initialUrl || '');
      setAnchor(initialAnchor || '');
      setPreviewMode(false);
      setPreviewType('text'); // Default to text
      setImageMode('url');
      setImageUrl(initialUrl || '');
      setFilePreview('');
    }
  }, [open, initialUrl, initialAnchor]);

  if (!open) return null;

  const handleFileChange = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) {
      setFilePreview('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleInsert = () => {
    const finalUrl = (url || '').trim();
    const finalAnchor = (anchor || '').trim();
    
    if (previewMode) {
      let embedSrc = finalUrl;
      let displayUrl = finalUrl;
      
      // Handle iframe HTML input
      if (isIframeHtml(finalUrl)) {
        const extractedUrl = extractUrlFromIframe(finalUrl);
        if (extractedUrl) {
          embedSrc = extractedUrl;
          displayUrl = extractedUrl;
        }
      }
      
      let src = embedSrc;
      if (previewType === 'image') {
        src = imageMode === 'upload' ? filePreview : imageUrl || embedSrc;
      }
      
      editor.update(() => {
        const previewNode = $createLinkPreviewNode(displayUrl, src, previewType);
        $insertNodes([previewNode]);
      });
    } else {
      onSubmit?.({
        url: finalUrl,
        anchor: finalAnchor,
      });
    }

    onClose();
  };

  // Helper function to extract URL from iframe HTML
  const extractUrlFromIframe = (iframeHtml) => {
    const match = iframeHtml.match(/src\s*=\s*["']([^"']+)["']/i);
    return match ? match[1] : null;
  };

  // Helper function to check if input is iframe HTML
  const isIframeHtml = (input) => {
    return input.trim().toLowerCase().startsWith('<iframe');
  };

  const PreviewArea = () => {
    if (previewType === 'image') {
      const src = imageMode === 'upload' ? filePreview : (imageUrl || url);
      if (!src) return <div className="link-preview-empty">Enter URL or upload a file to preview</div>;
      return (
        <div className="link-preview-image">
          <img src={src} alt="preview" onError={(e) => { e.currentTarget.style.opacity = 0.4; }} />
        </div>
      );
    }

    if (previewType === 'text') {
      return (
        <div className="link-preview-text">
          <div className="link-preview-anchor">{anchor || url}</div>
          <div className="link-preview-url">{url}</div>
        </div>
      );
    }

    // Handle embed preview
    if (!url) return <div className="link-preview-empty">Enter a URL or paste iframe HTML to preview</div>;
    
    let embedSrc = url;
    
    // If it's iframe HTML, extract the src
    if (isIframeHtml(url)) {
      const extractedUrl = extractUrlFromIframe(url);
      if (extractedUrl) {
        embedSrc = extractedUrl;
      } else {
        return <div className="link-preview-empty">Could not extract URL from iframe</div>;
      }
    }

    return (
      <div className="link-preview-embed">
        <iframe 
          src={embedSrc} 
          title="embed-preview" 
          width="100%"
          height="200"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h4>{previewMode ? 'Preview Link' : 'Standard Link'}</h4>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* URL Input with Icon */}
          <div className="input-group">
            <div className="input-icon">
              {/* <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6.5 9.5L9.5 6.5M9.5 9.5L6.5 6.5M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> */}
                <Link2 size={18}/>
            </div>
            <input
              className="modal-input with-icon"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={previewMode && previewType === 'embed' ? 'https:// or paste iframe HTML' : 'https://'}
            />
          </div>

          {/* Anchor Text Input (only for standard link) */}
          {!previewMode && (
            <div className="input-group">
              <div className="input-icon">
                {/* <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6H12M4 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg> */}
                <Text size={18}/>
              </div>
              <input
                className="modal-input with-icon"
                value={anchor}
                onChange={(e) => setAnchor(e.target.value)}
                placeholder="Enter anchor text"
              />
            </div>
          )}

          {/* Preview Mode Toggle Buttons */}
        {/* Preview Mode Toggle Buttons with Labels */}
        {previewMode && (
          <div className="preview-type-icons">
            <button
              className={`toggle-icon ${previewType === 'text' ? 'active' : ''}`}
              onClick={() => setPreviewType('text')}
            >
               <span className="label">Text</span>
              {previewType === 'text' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
             
            </button>
        
            <button
              className={`toggle-icon ${previewType === 'image' ? 'active' : ''}`}
              onClick={() => setPreviewType('image')}
            >
                <span className="label">Image</span>
              {previewType === 'image' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            
            </button>
        
            <button
              className={`toggle-icon ${previewType === 'embed' ? 'active' : ''}`}
              onClick={() => setPreviewType('embed')}
            >
               <span className="label">Embed</span>
              {previewType === 'embed' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
             
            </button>
          </div>
        )}

          {/* Image Mode Options (only for image preview) */}
          {previewMode && previewType === 'image' && (
            <>
              <div className="image-mode-selector">
                <button className={`toggle-btn ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>Use URL</button>
                <button className={`toggle-btn ${imageMode === 'upload' ? 'active' : ''}`} onClick={() => setImageMode('upload')}>Upload</button>
              </div>

              {imageMode === 'url' ? (
                <div className="input-group">
                  <input className="modal-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" />
                </div>
              ) : (
                <div className="input-group">
                  <input className="modal-input" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
              )}
            </>
          )}

          {/* Preview Area */}
          {previewMode && (
            <div className="link-preview">
              <PreviewArea />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button 
            className="btn secondary" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Convert to Standard Link' : 'Convert to Preview Link'}
          </button>
          
          <div className="action-buttons">
            <button className="btn ghost" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6.5 9.5L9.5 6.5M9.5 9.5L6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="btn primary" onClick={handleInsert}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 5L6.5 10.5L4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;