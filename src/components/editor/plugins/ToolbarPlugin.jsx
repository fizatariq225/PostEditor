import React, { useState, useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND, 
  CAN_REDO_COMMAND,
  $getNodeByKey,
  SELECTION_CHANGE_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getRoot, $createParagraphNode, $createTextNode,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from "@lexical/utils";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list';
import {
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  INSERT_TABLE_COMMAND
} from '@lexical/table';
import { $createLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Undo,
  Redo,
Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Image,
  Table,
  Code,
  Strikethrough
} from 'lucide-react';
import {
  $convertToMarkdownString,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import ReactMarkdown from 'react-markdown';
import { useEditor } from '../../../context/EditorContext';
import { $createImageNode } from './ImageNodePlugin';
import ImageModal from './ImageModal';
import LinkModal from './LinkModal';
import CustomDropdown from './CustomDropdown';
import markdownIcon from "../../../assets/markdown.svg";

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [isLink, setIsLink] = useState(false); 

  const { editorState } = useEditor();
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
  });
  const [blockType, setBlockType] = useState('paragraph');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
 
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [showModal, setShowModal] = useState(false);
const options = [
  { value: "paragraph", label: "Normal", icon: <AlignLeft size={16} /> },
  { value: "h1", label: "Heading 1", icon: <Heading1 size={16} /> },
  { value: "h2", label: "Heading 2", icon: <Heading2 size={16} /> },
  { value: "h3", label: "Heading 3", icon: <Heading3 size={16} /> },
  { value: "bullet", label: "Bullet List", icon: <List size={16} /> },
  { value: "number", label: "Numbered List", icon: <ListOrdered size={16} /> },
  { value: "quote", label: "Quote", icon: <Quote size={16} /> },
];
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update format states
      setActiveFormats({
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        underline: selection.hasFormat('underline'),
        strikethrough: selection.hasFormat('strikethrough'),
        code: selection.hasFormat('code'),
      });

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNodeByKey(elementKey);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }

      // Update link state
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  //  undo/redo implementation
  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  // Track undo/redo availability
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => { setCanUndo(payload); return false; },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => { setCanRedo(payload); return false; },
        1
      )
    );
  }, [editor]);

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

const formatBlock = (type) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      switch (type) {
        case 'h1':
        case 'h2':
        case 'h3':
          $setBlocksType(selection, () => $createHeadingNode(type));
          break;
        case 'quote':
          $setBlocksType(selection, () => $createQuoteNode());
          break;
        case 'paragraph':
          $setBlocksType(selection, () => $createParagraphNode());
          break;
        case 'bullet':
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          break;
        case 'number':
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          break;
      }
    }
  });
};


// Replace your existing handleInsertLink function in ToolbarPlugin with this:

const handleInsertLink = (data) => {
  const { url, anchor, previewMode, previewType, imageMode, imageUrl, filePreview } = data;

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    if (previewMode) {
      // For preview links, determine the source based on preview type
      let src = url;
      if (previewType === 'image') {
        src = imageMode === 'upload' ? filePreview : (imageUrl || url);
      }
      
      // Create LinkPreviewNode with the preview type
      const previewNode = $createLinkPreviewNode(url, src, previewType);
      selection.insertNodes([previewNode]);
    } else {
      // Standard link
      const text = anchor || url;
      const linkNode = $createLinkNode(url);
      linkNode.append($createTextNode(text));
      selection.insertNodes([linkNode]);
    }
  });

  setShowLinkModal(false);
};


  const insertImage = (src, file = null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageSrc = reader.result;
        editor.update(() => {   
          const imageNode = $createImageNode(imageSrc);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          } else {
            $getRoot().append(imageNode);
          }
        });
      };
      reader.readAsDataURL(file);
    } else if (src) {
      editor.update(() => {
        const imageNode = $createImageNode(src);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode]);
        } else {
          $getRoot().append(imageNode);
        }
      });
    }
  };

  const insertTable = () => {
    setShowTableModal(true);
  };

  const handleInsertTableConfirm = () => {
    if (rows < 1 || cols < 1) {
      alert("Rows and columns must be at least 1.");
      return;
    }

    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: cols,
      rows: rows,
      includeHeaders: false,
    });

    editor.update(() => {
      const root = $getRoot();
      const tableNode = root.getLastChild();

      if (tableNode) {
        const rows = tableNode.getChildren();
        if (rows.length > 0) {
          const firstRow = rows[0];
          firstRow.getChildren().forEach((cellNode) => {
            const paragraph = cellNode.getFirstChild();
            if (paragraph) paragraph.setFormat('bold');
          });
        }

        rows.forEach((row) => {
          const firstCell = row.getFirstChild();
          if (firstCell) {
            const paragraph = firstCell.getFirstChild();
            if (paragraph) paragraph.setFormat('bold');
          }
        });
      }
    });
    setShowTableModal(false);
  };

const insertList = (listType) => {
  if (blockType !== listType) {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined); 
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }
};
 

  const toggleMarkdown = () => {
    editor.update(() => {
      const root = $getRoot();

      if (!isMarkdown) {
        // RichText -> Markdown
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        root.clear();
        root.append($createParagraphNode().append($createTextNode(markdown)));
      } else {
        // Markdown -> RichText
        const markdownText = root.getTextContent();
        root.clear();
        $convertFromMarkdownString(markdownText, TRANSFORMERS);
      }
    });

    setIsMarkdown(!isMarkdown);
  };

  return (
    <div className="editor-toolbar">
      {/* Block Type Selector */}
    <div className="toolbar-group">
  <CustomDropdown
    // className="toolbar-select"
    value={blockType}
    options={options}
    onChange={(e) => {
      const value = e.target.value;

      if (value === "bullet" || value === "number") {
        insertList(value);
        setBlockType(value);
      } else {
        formatBlock(value);
        setBlockType(value);
      }
    }}
  />
</div>

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="toolbar-button"
          title="Undo (Ctrl+Z)"
        >
          <Undo />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="toolbar-button"
          title="Redo (Ctrl+Y)"
        >
          <Redo />
        </button>
      </div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          onClick={() => formatText('bold')}
          className={`toolbar-button ${activeFormats.bold ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold />
        </button>
        <button
          onClick={() => formatText('italic')}
          className={`toolbar-button ${activeFormats.italic ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic />
        </button>
        <button
          onClick={() => formatText('underline')}
          className={`toolbar-button ${activeFormats.underline ? 'active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <Underline />
        </button>
        <button
          onClick={() => formatText('strikethrough')}
          className={`toolbar-button ${activeFormats.strikethrough ? 'active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough />
        </button>
        <button
          onClick={() => formatText('code')}
          className={`toolbar-button ${activeFormats.code ? 'active' : ''}`}
          title="Inline Code"
        >
          <Code />
        </button>
      </div>

      {/* Alignment */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          title="Align Left"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        >
          <AlignLeft />
        </button>
        <button
          className="toolbar-button"
          title="Align Center"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        >
          <AlignCenter />
        </button>
        <button
          className="toolbar-button"
          title="Align Right"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        >
          <AlignRight />
        </button>
      </div>

      {/* Links and Media */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          title="Insert Link"
          onClick={() => setShowLinkModal(true)}
        >
          <Link2 />
        </button>

        <LinkModal
          open={showLinkModal}
          initialUrl=""
          initialAnchor=""
          onClose={() => setShowLinkModal(false)}
          onSubmit={handleInsertLink}
        />
        
        <button
          className="toolbar-button"
          title="Insert Image"
          onClick={() => setShowModal(true)}
        >
          <Image />
        </button>
        
        <ImageModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={insertImage}
        />

        <button
          className="toolbar-button"
          title="Insert Table"
          onClick={insertTable}
        >
          <Table />
        </button>
      </div>
      
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={toggleMarkdown}>
          <img src={markdownIcon} alt="Markdown" className="markdown-icon" />
          {/* {isMarkdown ? : } */}
        </button>
      </div>
 
      {showTableModal && (
        <div className="table-modal">
          <div className="table-modal-content">
            <h4>Insert Table</h4>
            <label>
              Rows:
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                min="1"
              />
            </label>
            <label>
              Columns:
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                min="1"
              />
            </label>
            <div className="table-modal-actions">
              <button onClick={handleInsertTableConfirm}>OK</button>
              <button onClick={() => setShowTableModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolbarPlugin;