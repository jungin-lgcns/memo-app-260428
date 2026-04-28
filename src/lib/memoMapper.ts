import { Memo } from '@/types/memo'

export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

export function rowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function memoToRow(
  memo: Omit<Memo, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string },
): Omit<MemoRow, 'id'> & { id?: string } {
  return {
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags,
    created_at: memo.createdAt ?? new Date().toISOString(),
    updated_at: memo.updatedAt ?? new Date().toISOString(),
  }
}
