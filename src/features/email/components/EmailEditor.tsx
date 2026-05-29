'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

type Props = {
  value: string
  onChange: (html: string, text: string) => void
  placeholder?: string
}

const COLORS = ['#111827', '#1f8f9b', '#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b']
const FONT_SIZES = ['12', '14', '16', '18', '20', '24']

export default function EmailEditor({ value, onChange, placeholder = 'Escribe tu mensaje…' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-henko-turquoise underline', target: '_blank', rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
    editorProps: {
      attributes: { class: 'outline-none min-h-[220px] px-4 py-3 font-raleway text-sm text-gray-800 leading-relaxed' },
    },
  })

  // Sincronizar si value se resetea a ''
  const prevValue = useRef(value)
  useEffect(() => {
    if (value === '' && prevValue.current !== '' && editor) {
      editor.commands.clearContent()
    }
    prevValue.current = value
  }, [value, editor])

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      key={title}
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors text-sm ${active ? 'bg-henko-turquoise/15 text-henko-turquoise' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-henko-turquoise transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/80">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Negrita', <strong className="text-xs font-black">B</strong>)}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Cursiva', <em className="text-xs font-semibold">I</em>)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Subrayado', <span className="text-xs underline font-semibold">U</span>)}
        {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Tachado', <span className="text-xs line-through font-semibold">S</span>)}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), 'Izquierda',
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>)}
        {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), 'Centro',
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg>)}
        {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), 'Derecha',
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg>)}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Lista',
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>)}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Lista numerada',
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h14M7 12h14M7 4h14M3 20v-2M3 14v-2M3 6V4" /></svg>)}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Tamaño de fuente */}
        <select
          title="Tamaño de fuente"
          className="text-xs font-raleway border border-gray-200 rounded-lg px-1.5 py-1 bg-white text-gray-600 focus:outline-none focus:border-henko-turquoise"
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setMark('textStyle', { fontSize: `${e.target.value}px` }).run()
          }}
          defaultValue=""
        >
          <option value="" disabled>Tamaño</option>
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
        </select>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Color de texto */}
        <div className="flex items-center gap-0.5">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={`Color ${color}`}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            title="Color personalizado"
            className="w-5 h-5 rounded border-0 cursor-pointer opacity-70 hover:opacity-100"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
