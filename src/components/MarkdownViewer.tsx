'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownViewerProps {
  content: string
  emptyMessage?: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 pb-1 border-b border-gray-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-2 pb-1 border-b border-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-900 mt-3 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-3">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-300 pl-4 py-1 my-3 text-gray-600 italic bg-blue-50 rounded-r-md">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className)
    if (isBlock) {
      return (
        <code
          className="block bg-gray-900 text-gray-100 rounded-lg px-4 py-3 text-sm font-mono overflow-x-auto"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        className="bg-gray-100 text-rose-600 rounded px-1.5 py-0.5 text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-3 rounded-lg overflow-x-auto">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50 text-gray-700">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200 text-gray-700">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold border-b border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-4 py-2">{children}</td>,
  hr: () => <hr className="my-4 border-gray-200" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="line-through text-gray-500">{children}</del>
  ),
  input: ({ type, checked, ...props }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-1.5 accent-blue-600 cursor-default"
          {...props}
        />
      )
    }
    return <input type={type} {...props} />
  },
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      className="max-w-full h-auto rounded-lg my-3 border border-gray-100"
      loading="lazy"
    />
  ),
}

export default function MarkdownViewer({
  content,
  emptyMessage = '미리보기할 내용이 없습니다.',
}: MarkdownViewerProps) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-gray-400 italic">{emptyMessage}</p>
    )
  }

  return (
    <div className="prose-sm max-w-none text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
