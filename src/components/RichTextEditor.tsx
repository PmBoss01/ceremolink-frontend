'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

function BulletListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zM20 7H8V5h12v2zm0 5H8v-2h12v2zm0 5H8v-2h12v2z" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10h2V4H3v2H1V4h1V3h3v7H3v-0zm0 7h3v1H3v1h3v1H2v-1H1v-2h2v-1H1v-1h3v1zm7-14h11v2H10zm0 7h11v2H10zm0 7h11v2H10z" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v2H3zm3 4h12v2H6zm-3 4h18v2H3zm3 4h12v2H6z" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v2H3zm6 4h12v2H9zm-6 4h18v2H3zm6 4h12v2H9z" />
    </svg>
  );
}

function AlignJustifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5 self-center flex-shrink-0" />;
}

function ToolbarBtn({
  onClick,
  isActive,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded text-sm transition-colors disabled:opacity-30 ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rich-editor focus:outline-none',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync when external value changes (e.g. data loaded from API)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const isPreview = mode === 'preview';

  const headingLevel =
    editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : editor.isActive('heading', { level: 4 }) ? '4'
    : 'p';

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">

        {/* Paragraph / Heading select */}
        <select
          value={headingLevel}
          disabled={isPreview}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(v) as 1 | 2 | 3 | 4 }).run();
            }
          }}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer disabled:opacity-30"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)" disabled={isPreview}>
          <span className="font-bold">B</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)" disabled={isPreview}>
          <span className="italic font-serif">I</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)" disabled={isPreview}>
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough" disabled={isPreview}>
          <span className="line-through">S</span>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List" disabled={isPreview}>
          <BulletListIcon />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List" disabled={isPreview}>
          <NumberedListIcon />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left" disabled={isPreview}>
          <AlignLeftIcon />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center" disabled={isPreview}>
          <AlignCenterIcon />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right" disabled={isPreview}>
          <AlignRightIcon />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify" disabled={isPreview}>
          <AlignJustifyIcon />
        </ToolbarBtn>

        {/* ── Write / Preview toggle (pushed to the right) ── */}
        <div className="ml-auto flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`px-3 py-1.5 transition-colors ${
              mode === 'write'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${
              mode === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* ── Write mode: Tiptap editor ── */}
      <div className={isPreview ? 'hidden' : ''}>
        <EditorContent editor={editor} />
      </div>

      {/* ── Preview mode: rendered HTML exactly as the public page ── */}
      {isPreview && (
        <div className="h-[240px] overflow-y-auto p-4 bg-white">
          {editor.isEmpty ? (
            <p className="text-gray-400 text-sm italic">Nothing to preview yet. Switch to Write and add some content.</p>
          ) : (
            <div
              className="rich-content text-gray-800"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          )}
        </div>
      )}
    </div>
  );
}
