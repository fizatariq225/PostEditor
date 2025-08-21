import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export const EditorProvider = ({ children }) => {
  const [editorState, setEditorState] = useState({
    isEmpty: true,
    wordCount: 0,
    canUndo: false,
    canRedo: false,
  });
  
  const [isConnected, setIsConnected] = useState(false);

  const updateEditorState = (updates) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  };

  return (
    <EditorContext.Provider 
      value={{ 
        editorState, 
        updateEditorState, 
        isConnected, 
        setIsConnected 
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};