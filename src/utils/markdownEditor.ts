/**
 * textarea에 마크다운 문법을 삽입하는 순수 유틸 함수 모음.
 * DOM에 직접 의존하지 않으며, 외부에서 selectionStart/selectionEnd를 주입받아 결과를 반환한다.
 */

export interface TextareaState {
  value: string
  selectionStart: number
  selectionEnd: number
}

export interface InsertResult {
  value: string
  /** 삽입 후 커서 위치 (start) */
  selectionStart: number
  /** 삽입 후 커서 위치 (end) */
  selectionEnd: number
}

/** 선택 영역을 prefix/suffix로 감싸거나, 선택이 없으면 placeholder를 삽입한다. */
export function wrapSelection(
  state: TextareaState,
  prefix: string,
  suffix: string,
  placeholder = '텍스트'
): InsertResult {
  const { value, selectionStart, selectionEnd } = state
  const before = value.slice(0, selectionStart)
  const selected = value.slice(selectionStart, selectionEnd)
  const after = value.slice(selectionEnd)

  const inner = selected || placeholder
  const newValue = before + prefix + inner + suffix + after

  const newStart = selectionStart + prefix.length
  const newEnd = newStart + inner.length

  return { value: newValue, selectionStart: newStart, selectionEnd: newEnd }
}

/** 커서 위치에 텍스트를 삽입한다. 선택이 있으면 대체한다. */
export function insertAtCursor(
  state: TextareaState,
  text: string
): InsertResult {
  const { value, selectionStart, selectionEnd } = state
  const newValue =
    value.slice(0, selectionStart) + text + value.slice(selectionEnd)
  const newPos = selectionStart + text.length
  return { value: newValue, selectionStart: newPos, selectionEnd: newPos }
}

/** 줄 시작에 접두사를 추가하는 블록 삽입 (헤딩, 인용구, 목록 등). */
export function insertLinePrefix(
  state: TextareaState,
  prefix: string,
  placeholder = '내용'
): InsertResult {
  const { value, selectionStart, selectionEnd } = state

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const lineEnd =
    value.indexOf('\n', selectionEnd) === -1
      ? value.length
      : value.indexOf('\n', selectionEnd)

  const before = value.slice(0, lineStart)
  const line = value.slice(lineStart, lineEnd)
  const after = value.slice(lineEnd)

  const trimmed = line.trimStart()
  const existingPrefix = line.slice(0, line.length - trimmed.length)

  const inner = trimmed || placeholder
  const newLine = existingPrefix + prefix + inner
  const newValue = before + newLine + after

  const contentStart = lineStart + existingPrefix.length + prefix.length
  const contentEnd = contentStart + inner.length

  return {
    value: newValue,
    selectionStart: contentStart,
    selectionEnd: contentEnd,
  }
}

/** 링크 마크다운 삽입: 선택 영역이 있으면 링크 텍스트로 사용 */
export function insertLink(
  state: TextareaState,
  url: string,
  linkText?: string
): InsertResult {
  const { value, selectionStart, selectionEnd } = state
  const selected = value.slice(selectionStart, selectionEnd)
  const text = linkText || selected || '링크 텍스트'
  const markdown = `[${text}](${url})`
  return insertAtCursor(
    { value, selectionStart, selectionEnd },
    markdown
  )
}

/** 이미지 마크다운 삽입 */
export function insertImage(
  state: TextareaState,
  url: string,
  alt = '이미지'
): InsertResult {
  const markdown = `![${alt}](${url})`
  return insertAtCursor(state, markdown)
}
