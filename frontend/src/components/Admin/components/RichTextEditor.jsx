import React, { useRef, useCallback } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter text..." }) => {
  const editorRef = useRef(null);

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback((e) => {
    onChange(e.currentTarget.innerHTML);
  }, [onChange]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b px-2 py-2 flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200 font-bold"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200 italic"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200 underline"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200 font-semibold"
          title="Heading"
        >
          H
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200"
          title="Paragraph"
        >
          P
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-200 text-red-600"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        className="min-h-[150px] p-3 focus:outline-none focus:ring-2 focus:ring-primary5/20"
        data-placeholder={placeholder}
        style={{
          outline: 'none',
        }}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
