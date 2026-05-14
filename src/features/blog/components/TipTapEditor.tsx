'use client'

import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { subirImagenBlog } from '@/actions/blog'
import { useAction } from '@/shared/feedback/FeedbackContext'

type Props = {
  value: string
  onChange: (html: string) => void
}

export default function TipTapEditor({ value, onChange }: Props) {
  const runAction = useAction()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl my-4 max-w-full h-auto' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-henko-turquoise underline hover:text-henko-turquoise-light',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder: 'Empieza a escribir tu artículo aquí…',
      }),
      Typography,
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none min-h-[400px] px-5 py-6 font-raleway',
      },
    },
  })

  // Mantener sincronizado el contenido si cambia desde fuera (ej: reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const insertarImagen = useCallback(async () => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const form = new FormData()
      form.set('file', file)
      const result = await runAction(
        'Subiendo imagen',
        () => subirImagenBlog(form),
        { silentSuccess: true },
      )
      if (result.ok && result.data && 'data' in result.data && result.data.data) {
        editor.chain().focus().setImage({ src: result.data.data.url, alt: '' }).run()
      }
    }
    input.click()
  }, [editor, runAction])

  const insertarEnlace = useCallback(() => {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL del enlace', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-2xl bg-white">
        <div className="h-12 border-b border-gray-100 bg-gray-50 rounded-t-2xl" />
        <div className="h-[400px] px-5 py-6" />
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
      <Toolbar editor={editor} onInsertImage={insertarImagen} onInsertLink={insertarEnlace} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({
  editor,
  onInsertImage,
  onInsertLink,
}: {
  editor: Editor
  onInsertImage: () => void
  onInsertLink: () => void
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-gray-100 bg-gray-50">
      <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título grande">H2</Btn>
      <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subtítulo">H3</Btn>
      <Sep />
      <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita"><strong>B</strong></Btn>
      <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva"><em>I</em></Btn>
      <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado"><s>S</s></Btn>
      <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Código"><code className="text-xs">{'</>'}</code></Btn>
      <Sep />
      <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 12h.01M4 18h.01M8 6h13M8 12h13M8 18h13" /></svg>
      </Btn>
      <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2v2H3V5zm0 6h2v2H3v-2zm0 6h2v2H3v-2zM8 5h13v2H8V5zm0 6h13v2H8v-2zm0 6h13v2H8v-2z" /></svg>
      </Btn>
      <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Cita">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h3v6H6v-2c0-1.5.5-2.5 1-4zm8 0h3v6h-4v-2c0-1.5.5-2.5 1-4z" /></svg>
      </Btn>
      <Sep />
      <Btn active={editor.isActive('link')} onClick={onInsertLink} title="Enlace">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </Btn>
      <Btn onClick={onInsertImage} title="Imagen">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().undo().run()} title="Deshacer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l-4-4 4-4m-4 4h11a4 4 0 010 8h-1" /></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} title="Rehacer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14l4-4-4-4m4 4H8a4 4 0 000 8h1" /></svg>
      </Btn>
    </div>
  )
}

function Btn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`min-w-[34px] h-9 px-2 rounded-lg font-raleway text-sm font-medium flex items-center justify-center transition-colors ${
        active ? 'bg-henko-turquoise text-white' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="w-px h-6 bg-gray-200 mx-1" />
}
