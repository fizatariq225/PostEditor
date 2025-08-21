// src/components/editor/RichTextEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { $getRoot, $createParagraphNode } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import OnChangePlugin from "./plugins/OnChangePlugin";
import MarkdownPlugin from "./plugins/MarkdownPlugin";
import { ImageNode } from "./plugins/ImageNodePlugin";
import {  LinkPreviewNode } from "./plugins/LinkPreviewNode";

import { useDispatch } from "react-redux";
import { addPost } from "../../store/postsSlice";
import { v4 as uuidv4 } from "uuid";
import { Send } from "lucide-react";
import "../../styles/global.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const theme = {
  paragraph: "prose-paragraph",
  heading: {
    h1: "prose-h1",
    h2: "prose-h2",
    h3: "prose-h3",
  },
  quote: "prose-quote",
  list: {
    nested: {
      listitem: "prose-list-nested",
    },
    ol: "prose-ol",
    ul: "prose-ul",
    listitem: "prose-li",
  },
  text: {
    bold: "prose-bold",
    italic: "prose-italic",
    underline: "prose-underline",
    strikethrough: "prose-strikethrough",
    code: "prose-code",
  },
  code: "prose-code-block",
  link: "prose-link",
  table: "prose-table",
  tableCell: "prose-table-cell",
  tableRow: "prose-table-row",
  image: "prose-image",
};

// Custom function to extract content with images
function extractContentWithImages(editor) {
  let htmlContent = '';
  let textContent = '';
  
  editor.getEditorState().read(() => {
    const root = $getRoot();
    textContent = root.getTextContent();
    
    // Generate HTML using Lexical's built-in function
    htmlContent = $generateHtmlFromNodes(editor, null);
    
    // If images or previews aren't included, manually process nodes
    if (!htmlContent.includes('<img') && !htmlContent.includes('link-preview-card')) {
      const children = root.getChildren();
      const htmlParts = [];
      
      children.forEach((child) => {
        if (child.getType() === 'image') {
          // ✅ Handle ImageNode manually
          const src = child.getSrc ? child.getSrc() : child.__src;
          const alt = child.getAltText ? child.getAltText() : child.__alt || '';
          const width = child.getWidth ? child.getWidth() : child.__width || 'auto';
          const height = child.getHeight ? child.getHeight() : child.__height || 'auto';
          
          htmlParts.push(
            `<img src="${src}" alt="${alt}" style="width: ${width}; height: ${height}; max-width: 100%;" />`
          );

        } else if (child.getType() === 'link-preview') {
          // ✅ Handle LinkPreviewNode manually
          const url = child.__url;
          const image = child.__image;
          htmlParts.push(`
            <div class="link-preview-card">
              <a href="${url}" target="_blank" rel="noopener noreferrer">
                <img src="${image}" alt="preview" style="width:40px;height:40px;margin-right:8px;" />
                ${url}
              </a>
            </div>
          `);

        } else if (child.getType() === 'paragraph') {
          // ✅ existing paragraph logic
          const childChildren = child.getChildren();
          let paragraphContent = '';
          
          childChildren.forEach((grandChild) => {
            if (grandChild.getType() === 'image') {
              const src = grandChild.getSrc ? grandChild.getSrc() : grandChild.__src;
              const alt = grandChild.getAltText ? grandChild.getAltText() : grandChild.__alt || '';
              const width = grandChild.getWidth ? grandChild.getWidth() : grandChild.__width || 'auto';
              const height = grandChild.getHeight ? grandChild.getHeight() : grandChild.__height || 'auto';
              
              paragraphContent += `<img src="${src}" alt="${alt}" style="width: ${width}; height: ${height}; max-width: 100%;" />`;
            } else if (grandChild.getType() === 'link') {
              const url = grandChild.getURL ? grandChild.getURL() : grandChild.__url;
              const linkText = grandChild.getTextContent();
              const target = grandChild.getTarget ? grandChild.getTarget() : grandChild.__target || '_blank';
              const rel = target === '_blank' ? 'noopener noreferrer' : '';
              
              paragraphContent += `<a href="${url}" target="${target}" rel="${rel}" class="prose-link">${linkText}</a>`;
            } else {
              const text = grandChild.getTextContent();
              if (grandChild.hasFormat && grandChild.hasFormat('bold')) {
                paragraphContent += `<strong>${text}</strong>`;
              } else if (grandChild.hasFormat && grandChild.hasFormat('italic')) {
                paragraphContent += `<em>${text}</em>`;
              } else if (grandChild.hasFormat && grandChild.hasFormat('underline')) {
                paragraphContent += `<u>${text}</u>`;
              } else if (grandChild.hasFormat && grandChild.hasFormat('strikethrough')) {
                paragraphContent += `<del>${text}</del>`;
              } else if (grandChild.hasFormat && grandChild.hasFormat('code')) {
                paragraphContent += `<code class="prose-code">${text}</code>`;
              } else {
                paragraphContent += text;
              }
            }
          });
          
          if (paragraphContent) {
            htmlParts.push(`<p>${paragraphContent}</p>`);
          }

        } else if (child.getType() === 'heading') {
          const level = child.getTag();
          const text = child.getTextContent();
          htmlParts.push(`<${level}>${text}</${level}>`);

        } else if (child.getType() === 'quote') {
          const text = child.getTextContent();
          htmlParts.push(`<blockquote>${text}</blockquote>`);

        } else if (child.getType() === 'list') {
          const tag = child.getListType() === 'number' ? 'ol' : 'ul';
          const items = child.getChildren().map(item => `<li>${item.getTextContent()}</li>`).join('');
          htmlParts.push(`<${tag}>${items}</${tag}>`);

        } else {
          const text = child.getTextContent();
          if (text) {
            htmlParts.push(`<p>${text}</p>`);
          }
        }
      });
      
      if (htmlParts.length > 0) {
        htmlContent = htmlParts.join('');
      }
    }
  });
  
  return { htmlContent, textContent };
}


function EditorContent({ initialEditorState, onPost }) {
  const [editor] = useLexicalComposerContext();
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Initialize editor with saved state
  useEffect(() => {
    if (editor && !isEditorReady) {
      const initializeEditor = () => {
        try {
          if (initialEditorState) {
            const parsedState = editor.parseEditorState(initialEditorState);
            editor.setEditorState(parsedState);
            console.log("Editor initialized with saved state");
          }
          setIsEditorReady(true);
        } catch (error) {
          console.error("Error initializing editor:", error);
          setIsEditorReady(true);
        }
      };

      setTimeout(initializeEditor, 100);
    }
  }, [editor, initialEditorState, isEditorReady]);

  useEffect(() => {
    if (editor && isEditorReady) {
      const unregister = editor.registerUpdateListener(({ editorState }) => {
        try {
          const serializedState = JSON.stringify(editorState.toJSON());
          localStorage.setItem("editorState", serializedState);
          console.log("Auto-saved editor state");
        } catch (error) {
          console.error("Error saving editor state:", error);
        }
      });
      return () => unregister();
    }
  }, [editor, isEditorReady]);

  const handlePostClick = () => {
    if (!editor) return;

    try {
      // Use custom extraction function for better image support
      const { htmlContent, textContent } = extractContentWithImages(editor);
      
      if (!textContent.trim() && !htmlContent.includes('<img')) {
        console.log("No content to post");
        return;
      }

      // Get the full editor state for complete preservation
      const editorStateJSON = editor.getEditorState().toJSON();
      
      const newPost = {
        id: uuidv4(),
        content: textContent || "Image post", 
        htmlContent: htmlContent,
        editorState: editorStateJSON,
        author: {
          name: "Fiza Tariq",
          avatar: "https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
        },
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      console.log("Creating post with formatted content:", {
        textContent,
        htmlContent,
        hasImage: htmlContent.includes('<img'),
        editorState: editorStateJSON
      });

      onPost(newPost);

      // Clear editor after posting
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
        
        // Save empty state
        const emptyState = editor.getEditorState();
        localStorage.setItem("editorState", JSON.stringify(emptyState.toJSON()));
        console.log("Editor cleared after posting");
      });

    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="editor-content">
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor-input" />}
        placeholder={<div className="editor-placeholder">What's on your mind?</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <div className="editor-footer">
        <div className="editor-hint">Start typing or add images to create your post...</div>
        <button
          onClick={handlePostClick}
          disabled={!editor || !isEditorReady}
          className="post-button"
        >
          <Send />
          Post It
        </button>
      </div>
    </div>
  );
}

const RichTextEditor = () => {
  const dispatch = useDispatch();
  const [currentEditorState, setCurrentEditorState] = useState(null);
  const [markdownMode, setMarkdownMode] = useState(false);
  
  const [initialEditorState] = useState(() => {
    try {
      const savedState = localStorage.getItem("editorState");
      console.log("Loading initial state from localStorage");
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error("Error loading saved state:", error);
      return null;
    }
  });

  const initialConfig = {
    namespace: "social-editor",
    theme,
    onError: (error) => {
      console.error("Lexical error:", error);
    },
    nodes: [
      ImageNode,
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      LinkPreviewNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    editorState: null,
  };

  const handlePost = (newPost) => {

    try {
      dispatch(addPost(newPost));
      console.log("Post successfully created and dispatched:", newPost);
    } catch (error) {
      console.error("Error dispatching post:", error);
    }
  };

  return (
    <div className="editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <div>
          <HistoryPlugin />
          <ToolbarPlugin
            markdownMode={markdownMode}
            setMarkdownMode={setMarkdownMode}
          />
          <EditorContent
            initialEditorState={initialEditorState}
            onPost={handlePost}
          />
        </div>
        <ListPlugin />
        <LinkPlugin />
  
        <TablePlugin />
        <MarkdownPlugin markdownMode={markdownMode} />
        <OnChangePlugin onChange={setCurrentEditorState} />
      </LexicalComposer>
    </div>
  );
};

export default RichTextEditor;