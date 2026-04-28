---
name: markdown-viewer-plan
overview: 메모 편집 모달에 마크다운 미리보기 탭을 추가하고, 상세 보기 모달도 같은 렌더러를 재사용해 저장된 메모를 마크다운으로 표시합니다. Context7 기준으로 `react-markdown`과 `remark-gfm` 조합을 권장합니다.
todos:
  - id: install-markdown-libs
    content: "`react-markdown`과 `remark-gfm` 의존성을 추가한다."
    status: completed
  - id: add-markdown-viewer
    content: 공통 `MarkdownViewer` 컴포넌트를 만들고 기본 마크다운 요소 스타일과 링크 정책을 정의한다.
    status: completed
  - id: wire-form-preview
    content: "`MemoForm` 내용 입력 영역에 작성/미리보기 토글을 추가한다."
    status: completed
  - id: wire-detail-rendering
    content: "`MemoDetailModal` 본문을 `MarkdownViewer` 렌더링으로 교체한다."
    status: completed
  - id: verify
    content: 린트와 빌드를 실행하고 핵심 UI 동작을 확인한다.
    status: completed
isProject: false
---

# 마크다운 뷰어 추가 계획

## 라이브러리 선택

- 권장: `react-markdown` + `remark-gfm`
- 이유: Context7에서 확인한 `react-markdown` 공식 문서는 React 컴포넌트로 마크다운 문자열을 안전하게 React 엘리먼트로 렌더링하며, `remarkPlugins={[remarkGfm]}`로 표, 체크박스, 취소선, 자동 링크 같은 GitHub Flavored Markdown을 지원합니다.
- 설치: `npm install react-markdown remark-gfm`
- 보안 기본값: 사용자 입력 메모이므로 raw HTML 렌더링용 `rehype-raw`는 도입하지 않습니다. HTML까지 허용해야 하는 요구가 생기면 `rehype-sanitize`와 함께 별도 검토합니다.

## 구현 방향

- 공통 렌더러 컴포넌트 추가: `[src/components/MarkdownViewer.tsx](src/components/MarkdownViewer.tsx)`
  - `'use client'` 명시
  - `ReactMarkdown`와 `remarkGfm` 사용
  - Tailwind 기반으로 `h1`, `h2`, `p`, `ul`, `ol`, `blockquote`, `code`, `pre`, `table`, `a` 렌더링 스타일 지정
  - 외부 링크는 `target="_blank"`, `rel="noopener noreferrer"` 적용
- 편집 모달 수정: `[src/components/MemoForm.tsx](src/components/MemoForm.tsx)`
  - 내용 영역에 `작성 / 미리보기` 탭 또는 토글 추가
  - `작성` 탭에서는 기존 `textarea` 유지
  - `미리보기` 탭에서는 현재 `formData.content`를 `MarkdownViewer`로 렌더링
  - 내용이 비어 있으면 `미리보기할 내용이 없습니다.` 같은 한국어 빈 상태 표시
- 상세 보기 모달 수정: `[src/components/MemoDetailModal.tsx](src/components/MemoDetailModal.tsx)`
  - 현재 `{memo.content}` 텍스트 표시를 `MarkdownViewer`로 교체
  - 기존 ESC 닫기, 배경 클릭 닫기, 편집/삭제 흐름은 유지
- 필요 시 카드 본문은 기존처럼 3줄 텍스트 미리보기 유지
  - 카드 목록에서 마크다운까지 렌더링하면 그리드 높이와 클릭 영역이 불안정해질 수 있으므로 상세/편집 미리보기에서만 렌더링합니다.

## 검증

- `npm run lint`
- `npm run build`
- 수동 확인 항목: 편집 모달에서 작성/미리보기 전환, 표/체크박스/링크/코드블록 렌더링, ESC 및 배경 클릭 닫기, 상세 모달의 편집/삭제 버튼 유지

