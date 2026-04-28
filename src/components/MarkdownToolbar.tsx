'use client'

import { useState, useRef, useEffect, useCallback, RefObject } from 'react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import {
  wrapSelection,
  insertLinePrefix,
  insertAtCursor,
  insertLink,
  insertImage,
  TextareaState,
  InsertResult,
} from '@/utils/markdownEditor'

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

/** textarea의 현재 선택 상태를 읽어온다. */
function getState(textarea: HTMLTextAreaElement): TextareaState {
  return {
    value: textarea.value,
    selectionStart: textarea.selectionStart,
    selectionEnd: textarea.selectionEnd,
  }
}

/** 삽입 결과를 textarea에 반영하고 커서를 복원한다. */
function applyResult(textarea: HTMLTextAreaElement, result: InsertResult) {
  textarea.focus()
  textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
}

const SYMBOLS = [
  '©', '®', '™', '°', '±', '×', '÷', '≠', '≤', '≥',
  '∞', '√', 'π', 'Σ', '→', '←', '↑', '↓', '•', '…',
]

interface ToolbarButtonProps {
  onClick: () => void
  title: string
  active?: boolean
  children: React.ReactNode
}

function ToolbarButton({ onClick, title, active, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded text-sm transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />
}

interface LinkModalProps {
  onInsert: (text: string, url: string) => void
  onClose: () => void
  defaultText: string
}

function LinkModal({ onInsert, onClose, defaultText }: LinkModalProps) {
  const [text, setText] = useState(defaultText)
  const [url, setUrl] = useState('')

  return (
    <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
      <p className="text-xs font-medium text-gray-700 mb-2">링크 삽입</p>
      <input
        autoFocus
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="링크 텍스트"
        className="w-full mb-2 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && url) onInsert(text, url)
          if (e.key === 'Escape') onClose()
        }}
        placeholder="https://example.com"
        className="w-full mb-3 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => url && onInsert(text, url)}
          disabled={!url}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
        >
          삽입
        </button>
      </div>
    </div>
  )
}

interface ImageModalProps {
  onInsert: (alt: string, url: string) => void
  onClose: () => void
}

function ImageModal({ onInsert, onClose }: ImageModalProps) {
  const [alt, setAlt] = useState('')
  const [url, setUrl] = useState('')

  return (
    <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
      <p className="text-xs font-medium text-gray-700 mb-2">이미지 삽입</p>
      <input
        autoFocus
        type="text"
        value={alt}
        onChange={e => setAlt(e.target.value)}
        placeholder="대체 텍스트 (선택)"
        className="w-full mb-2 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && url) onInsert(alt || '이미지', url)
          if (e.key === 'Escape') onClose()
        }}
        placeholder="https://example.com/image.jpg"
        className="w-full mb-3 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => url && onInsert(alt || '이미지', url)}
          disabled={!url}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
        >
          삽입
        </button>
      </div>
    </div>
  )
}

type PopoverType = 'emoji' | 'symbol' | 'link' | 'image' | 'heading' | null

export default function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
}: MarkdownToolbarProps) {
  const [openPopover, setOpenPopover] = useState<PopoverType>(null)
  const [linkDefaultText, setLinkDefaultText] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)

  const closePopover = useCallback(() => setOpenPopover(null), [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }
    if (openPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openPopover, closePopover])

  const applyTransform = useCallback(
    (transform: (state: TextareaState) => InsertResult) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const result = transform(getState(textarea))
      onChange(result.value)
      requestAnimationFrame(() => applyResult(textarea, result))
    },
    [textareaRef, onChange]
  )

  const handleWrap = useCallback(
    (prefix: string, suffix: string, placeholder?: string) => {
      applyTransform(s => wrapSelection(s, prefix, suffix, placeholder))
    },
    [applyTransform]
  )

  const handleLinePrefix = useCallback(
    (prefix: string, placeholder?: string) => {
      applyTransform(s => insertLinePrefix(s, prefix, placeholder))
    },
    [applyTransform]
  )

  const handleHeading = useCallback(
    (level: number) => {
      const prefix = '#'.repeat(level) + ' '
      handleLinePrefix(prefix, '제목')
    },
    [handleLinePrefix]
  )

  const handleEmoji = useCallback(
    (emojiData: EmojiClickData) => {
      applyTransform(s => insertAtCursor(s, emojiData.emoji))
      closePopover()
    },
    [applyTransform, closePopover]
  )

  const handleSymbol = useCallback(
    (symbol: string) => {
      applyTransform(s => insertAtCursor(s, symbol))
    },
    [applyTransform]
  )

  const handleLinkOpen = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
    setLinkDefaultText(selected)
    setOpenPopover('link')
  }, [textareaRef])

  const handleLinkInsert = useCallback(
    (text: string, url: string) => {
      applyTransform(s => insertLink(s, url, text))
      closePopover()
    },
    [applyTransform, closePopover]
  )

  const handleImageInsert = useCallback(
    (alt: string, url: string) => {
      applyTransform(s => insertImage(s, url, alt))
      closePopover()
    },
    [applyTransform, closePopover]
  )

  return (
    <div
      ref={toolbarRef}
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border border-gray-200 border-b-0 rounded-t-lg relative"
    >
      {/* 제목 드롭다운 */}
      <div className="relative">
        <ToolbarButton
          onClick={() =>
            setOpenPopover(prev => (prev === 'heading' ? null : 'heading'))
          }
          title="제목"
        >
          <span className="font-bold text-xs">H</span>
        </ToolbarButton>
        {openPopover === 'heading' && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[6rem]">
            {[1, 2, 3, 4].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  handleHeading(level)
                  closePopover()
                }}
                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`font-bold text-gray-800 ${
                    level === 1
                      ? 'text-base'
                      : level === 2
                        ? 'text-sm'
                        : 'text-xs'
                  }`}
                >
                  H{level}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* 굵게 */}
      <ToolbarButton onClick={() => handleWrap('**', '**', '굵은 텍스트')} title="굵게 (Ctrl+B)">
        <strong className="text-xs">B</strong>
      </ToolbarButton>

      {/* 기울임 */}
      <ToolbarButton onClick={() => handleWrap('*', '*', '기울임 텍스트')} title="기울임 (Ctrl+I)">
        <em className="text-xs">I</em>
      </ToolbarButton>

      {/* 취소선 */}
      <ToolbarButton onClick={() => handleWrap('~~', '~~', '취소선 텍스트')} title="취소선">
        <s className="text-xs font-medium">S</s>
      </ToolbarButton>

      {/* 인라인 코드 */}
      <ToolbarButton onClick={() => handleWrap('`', '`', '코드')} title="인라인 코드">
        <code className="text-xs">&lt;/&gt;</code>
      </ToolbarButton>

      <Divider />

      {/* 인용구 */}
      <ToolbarButton onClick={() => handleLinePrefix('> ', '인용 내용')} title="인용구">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </ToolbarButton>

      {/* 순서 없는 목록 */}
      <ToolbarButton onClick={() => handleLinePrefix('- ', '목록 항목')} title="순서 없는 목록">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </ToolbarButton>

      {/* 순서 있는 목록 */}
      <ToolbarButton onClick={() => handleLinePrefix('1. ', '목록 항목')} title="순서 있는 목록">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h11M9 12h11M9 19h11M5 5v.01M5 12v.01M5 19v.01" />
        </svg>
      </ToolbarButton>

      {/* 체크리스트 */}
      <ToolbarButton onClick={() => handleLinePrefix('- [ ] ', '할 일')} title="체크리스트">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* 링크 삽입 */}
      <div className="relative">
        <ToolbarButton onClick={handleLinkOpen} title="링크 삽입">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>
        {openPopover === 'link' && (
          <LinkModal
            defaultText={linkDefaultText}
            onInsert={handleLinkInsert}
            onClose={closePopover}
          />
        )}
      </div>

      {/* 이미지 삽입 */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setOpenPopover(prev => (prev === 'image' ? null : 'image'))}
          title="이미지 삽입"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </ToolbarButton>
        {openPopover === 'image' && (
          <ImageModal onInsert={handleImageInsert} onClose={closePopover} />
        )}
      </div>

      <Divider />

      {/* 이모지 팝오버 */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setOpenPopover(prev => (prev === 'emoji' ? null : 'emoji'))}
          title="이모지 삽입"
          active={openPopover === 'emoji'}
        >
          <span className="text-sm leading-none">😊</span>
        </ToolbarButton>
        {openPopover === 'emoji' && (
          <div className="absolute top-full left-0 mt-1 z-30">
            <EmojiPicker
              onEmojiClick={handleEmoji}
              theme={Theme.LIGHT}
              width={320}
              height={380}
              searchPlaceholder="이모지 검색..."
              lazyLoadEmojis
            />
          </div>
        )}
      </div>

      {/* 기호 팔레트 */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setOpenPopover(prev => (prev === 'symbol' ? null : 'symbol'))}
          title="기호 삽입"
          active={openPopover === 'symbol'}
        >
          <span className="text-xs font-medium">Ω</span>
        </ToolbarButton>
        {openPopover === 'symbol' && (
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-52">
            <p className="text-xs text-gray-500 mb-2 px-1">기호 선택</p>
            <div className="grid grid-cols-5 gap-1">
              {SYMBOLS.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    handleSymbol(sym)
                    closePopover()
                  }}
                  className="w-8 h-8 flex items-center justify-center text-sm rounded hover:bg-gray-100 transition-colors"
                  title={sym}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* value를 소비해 미사용 경고 방지 */}
      <span className="sr-only" aria-hidden="true">{value.length > 0 ? '' : ''}</span>
    </div>
  )
}
