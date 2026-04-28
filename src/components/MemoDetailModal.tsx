'use client'

import { useEffect, useCallback, useState } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownViewer from '@/components/MarkdownViewer'
import { summarizeMemoAction } from '@/app/actions/summarizeMemo'

interface MemoDetailModalProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetailModal({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
  }, [memo?.id])

  const handleSummarize = useCallback(async () => {
    if (!memo) return
    setSummaryLoading(true)
    setSummaryError(null)
    setSummary(null)

    try {
      const result = await summarizeMemoAction({ title: memo.title, content: memo.content })

      if (result.error) {
        setSummaryError(result.error)
      } else {
        setSummary(result.summary ?? '')
      }
    } catch {
      setSummaryError('요약 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSummaryLoading(false)
    }
  }, [memo])

  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  useEffect(() => {
    if (!memo) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [memo, onClose])

  if (!memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handlePanelClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2
                id="memo-detail-title"
                className="text-xl font-semibold text-gray-900 break-words"
              >
                {memo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[
                    memo.category as keyof typeof MEMO_CATEGORIES
                  ] || memo.category}
                </span>
                <span className="text-xs text-gray-500">
                  수정 {formatDate(memo.updatedAt)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <MarkdownViewer content={memo.content} />
          </div>

          {memo.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {memo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onEdit(memo)
                onClose()
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              편집
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={handleSummarize}
              disabled={summaryLoading}
              data-testid="summarize-btn"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-violet-200 text-violet-700 text-sm font-medium rounded-lg hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summaryLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  요약 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI 요약
                </>
              )}
            </button>
          </div>

          {summaryError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <svg
                className="mt-0.5 w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {summaryError}
            </div>
          )}

          {summary && (
            <div
              data-testid="summary-result"
              className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3"
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI 요약
              </p>
              <div className="whitespace-pre-wrap text-sm text-violet-900 leading-relaxed">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
