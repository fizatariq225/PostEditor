import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

const MarkdownPlugin = ({ markdownMode }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (markdownMode) {
      // RichText → Markdown string
      editor.update(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        // Replace editor content with pure markdown text
        editor.setEditorState(editor.parseEditorState(markdown));
      });
    } else {
      // Markdown → RichText again
      editor.update(() => {
        const root = editor.getEditorState().read(() => null); // clear
        // Here, you would need the markdown string stored earlier
        // Example: reparse from the markdown you converted
        // editor.setEditorState(
        //   editor.parseEditorState(
        //     $convertFromMarkdownString(savedMarkdown, TRANSFORMERS)
        //   )
        // );
      });
    }
  }, [markdownMode, editor]);

  return null;
};

export default MarkdownPlugin;
