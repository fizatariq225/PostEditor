import React from 'react';
import { OnChangePlugin as LexicalOnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot } from 'lexical';
import { useEditor } from '../../../context/EditorContext';

const OnChangePlugin = ({ onChange }) => {
  const { updateEditorState } = useEditor();

  const handleChange = (editorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      const isEmpty = textContent.trim().length === 0;
      const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

      // ✅ Only update context state, don't touch editor content
      updateEditorState({ isEmpty, wordCount });
    });

    // call external callback (like saving editorState)
    onChange(editorState);
  };

  return <LexicalOnChangePlugin onChange={handleChange} />;
};

export default OnChangePlugin;
