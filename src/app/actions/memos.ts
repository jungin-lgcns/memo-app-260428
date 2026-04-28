'use server'

import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { rowToMemo, MemoRow } from '@/lib/memoMapper'
import { Memo, MemoFormData } from '@/types/memo'

export async function getMemosAction(): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data as MemoRow[]).map(rowToMemo)
}

export async function createMemoAction(formData: MemoFormData): Promise<Memo> {
  const now = new Date().toISOString()
  const id = uuidv4()

  const { data, error } = await supabase
    .from('memos')
    .insert({
      id,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return rowToMemo(data as MemoRow)
}

export async function updateMemoAction(id: string, formData: MemoFormData): Promise<Memo> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  return rowToMemo(data as MemoRow)
}

export async function deleteMemoAction(id: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
