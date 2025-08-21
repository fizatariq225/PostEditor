import React, { useState, useEffect } from 'react';
import '../../../styles/global.css';

const ImageModal = ({ open, initialUrl = '', onClose, onSubmit }) => {
  const [mode, setMode] = useState('url'); // 'url' or 'upload'
  const [url, setUrl] = useState(initialUrl);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMode('url');
      setUrl(initialUrl || '');
      setFile(null);
      setPreviewUrl('');
      setError('');
      setLoading(false);
    }
  }, [open, initialUrl]);

  const validateImageUrl = (url) => {
    // Basic URL validation for images
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:image/');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl('');
      setError('');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      setError('');
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'url' && url) {
        if (validateImageUrl(url)) {
          onSubmit(url);
        } else {
          setError('Invalid image URL. Must be an image file (jpg, png, gif, webp) or Base64.');
        }
      } else if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const { url } = await response.json();
          if (url && validateImageUrl(url)) {
            onSubmit(url);
          } else {
            console.warn('No valid URL returned from upload, using Base64 fallback');
            if (validateImageUrl(previewUrl)) {
              onSubmit(previewUrl);
            } else {
              setError('Invalid image data from file');
            }
          }
        } catch (error) {
          console.warn('Upload failed, using Base64 fallback:', error);
          if (validateImageUrl(previewUrl)) {
            onSubmit(previewUrl);
          } else {
            setError('Failed to upload file and invalid Base64 data');
          }
        }
      } else {
        setError('Please provide a URL or select a file');
      }
    } catch (error) {
      setError('An error occurred while inserting the image');
      console.error('ImageModal error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h4>Insert Image</h4>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="error" style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className={`toggle-btn ${mode === 'url' ? 'active' : ''}`} onClick={() => setMode('url')}>
              URL
            </button>
            <button className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`} onClick={() => setMode('upload')}>
              Upload
            </button>
          </div>

          {mode === 'url' ? (
            <>
              <input
                className="modal-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                disabled={loading}
              />
              <div className="preview">
                {url ? (
                  <img
                    src={url}
                    alt="preview"
                    style={{ maxWidth: '100%', maxHeight: 160 }}
                    onError={() => setError('Invalid image URL')}
                  />
                ) : (
                  <small>No preview</small>
                )}
              </div>
            </>
          ) : (
            <>
              <input type="file" accept="image/*" className="modal-input" onChange={handleFileChange} disabled={loading} />
              <div className="preview">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{ maxWidth: '100%', maxHeight: 160 }}
                    onError={() => setError('Invalid image file')}
                  />
                ) : (
                  <small>No file chosen</small>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={handleSubmit} disabled={loading || (mode === 'url' ? !url : !file)}>
            {loading ? 'Inserting...' : 'Insert'}
          </button>
          <button className="btn ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;