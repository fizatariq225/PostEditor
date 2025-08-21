import { DecoratorNode } from 'lexical';
import React from 'react';

export class LinkPreviewNode extends DecoratorNode {
  __url;
  __image;
  __previewType;

  static getType() {
    return "link-preview";
  }

  static clone(node) {
    return new LinkPreviewNode(node.__url, node.__image, node.__previewType, node.__key);
  }

  constructor(url, image, previewType = 'text', key) {
    super(key);
    this.__url = url;
    this.__image = image;
    this.__previewType = previewType;
  }

  // For HTML export
  exportDOM() {
    const element = document.createElement("div");
    element.className = `link-preview-card link-preview-${this.__previewType}`;

    if (this.__previewType === 'embed') {
      const iframe = document.createElement("iframe");
      iframe.src = this.__url;
      iframe.style.width = "100%";
      iframe.style.height = "300px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
      element.appendChild(iframe);
    } else if (this.__previewType === 'image') {
      const img = document.createElement("img");
      img.src = this.__image;
      img.alt = "preview";
      img.style.maxWidth = "100px";
      img.style.height = "auto";
      img.style.borderRadius = "8px";
      element.appendChild(img);
      
      
      if (this.__url !== this.__image) {
        const link = document.createElement("a");
        link.href = this.__url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = this.__url;
        link.style.display = "block";
        link.style.marginTop = "8px";
        link.style.fontSize = "12px";
        link.style.color = "#666";
        element.appendChild(link);
      }
    } else {
      // Text preview
      const anchor = document.createElement("a");
      anchor.href = this.__url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = this.__url;
      anchor.style.textDecoration = "none";
      anchor.style.color = "#007acc";
      element.appendChild(anchor);
    }

    return { element };
  }

  // For saving in JSON
  exportJSON() {
    return {
      type: "link-preview",
      version: 1,
      url: this.__url,
      image: this.__image,
      previewType: this.__previewType,
    };
  }

  // For restoring from JSON
  static importJSON(serializedNode) {
    const { url, image, previewType } = serializedNode;
    return new LinkPreviewNode(url, image, previewType);
  }

  createDOM() {
    const div = document.createElement("div");
    div.className = "link-preview-node";
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <LinkPreviewComponent 
        url={this.__url} 
        image={this.__image} 
        previewType={this.__previewType} 
      />
    );
  }
}

// Separate React component for better organization
const LinkPreviewComponent = ({ url, image, previewType }) => {
  const [error, setError] = React.useState(false);

  if (previewType === 'embed') {
    return (
      <div className="link-preview-card link-preview-embed">
        {error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <p>Cannot display embed</p>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
              Open link
            </a>
          </div>
        ) : (
          <iframe 
            src={url}
            title="embed-preview"
            style={{
              width: '100%',
              height: '300px',
              border: 'none',
              borderRadius: '8px'
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setError(true)}
            onLoad={(e) => {
              // Check if iframe loaded successfully
              try {
                const iframe = e.target;
                if (!iframe.contentDocument && !iframe.contentWindow) {
                  setError(true);
                }
              } catch (err) {
                // Cross-origin restriction, but iframe might still work
                console.log('Cross-origin iframe restriction - this is normal');
              }
            }}
          />
        )}
      </div>
    );
  }

  if (previewType === 'image') {
    return (
      <div className="link-preview-card link-preview-image">
        <img
          src={image}
          alt="preview"
          style={{
            maxWidth: '100px',
            height: 'auto',
            borderRadius: '8px'
          }}
          onError={(e) => {
            e.currentTarget.style.opacity = '0.4';
          }}
        />
        {url !== image && (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '12px',
              color: '#666',
              textDecoration: 'none'
            }}
          >
            {url}
          </a>
        )}
      </div>
    );
  }

  // Text preview (default)
  return (
    <div className="link-preview-card link-preview-text">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          color: '#007acc',
          fontSize: '14px'
        }}
      >
        {url}
      </a>
    </div>
  );
};

export function $createLinkPreviewNode(url, image, previewType = 'text') {
  return new LinkPreviewNode(url, image, previewType);
}