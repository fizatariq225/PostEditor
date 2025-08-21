// src/hooks/useLexicalEditor.js
import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function useLexicalEditor() {
  const [editor] = useLexicalComposerContext();
  const [initialEditorState, setInitialEditorState] = useState(null);

  // Load persisted state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("editorState");
    console.log("Loaded state from localStorage:", savedState); 
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setInitialEditorState(parsedState);
      } catch (error) {
        console.error("Failed to parse saved editor state:", error);
      }
    }
  }, []);

  // Save editor state on changes
  const saveEditorState = () => {
    if (editor) {
      editor.getEditorState().read(() => {
        const editorState = editor.getEditorState();
        const serializedState = JSON.stringify(editorState.toJSON());
        console.log("Saving state to localStorage:", serializedState); // Debug log
        localStorage.setItem("editorState", serializedState);
      });
    }
  };

  // Register update listener
  useEffect(() => {
    if (editor) {
      const unregister = editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          saveEditorState();
        });
      });
      return () => unregister();
    }
  }, [editor]);

  return { initialEditorState, saveEditorState };
}