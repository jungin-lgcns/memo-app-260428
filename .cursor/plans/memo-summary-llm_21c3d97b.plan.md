---
name: memo-summary-llm
overview: 메모 상세보기 모달에 Gemini 기반 요약 버튼과 결과 UI를 추가하고, API 키가 클라이언트에 노출되지 않도록 Next.js Route Handler에서 `@google/genai`를 호출합니다.
todos:
  - id: add-summary-api
    content: "`src/app/api/memos/summarize/route.ts`에 Gemini 요약 API Route Handler 추가"
    status: completed
  - id: wire-detail-ui
    content: "`MemoDetailModal`에 요약 버튼, 로딩/에러/결과 상태와 API 호출 로직 추가"
    status: completed
  - id: verify-summary
    content: 린트 및 기본 동작 검증
    status: completed
isProject: false
---

# 메모 LLM 요약 기능 계획

## 적용 방향

- 기존 상세보기 컴포넌트인 `[src/components/MemoDetailModal.tsx](src/components/MemoDetailModal.tsx)`에 `요약하기` 버튼, 로딩 상태, 에러 메시지, 요약 결과 영역을 추가합니다.
- 새 서버 API 라우트 `[src/app/api/memos/summarize/route.ts](src/app/api/memos/summarize/route.ts)`를 만들어 클라이언트가 `{ title, content }`를 POST하면 한국어 요약을 JSON으로 반환하게 합니다.
- Context7 확인 결과 `@google/genai`는 `GoogleGenAI`를 생성한 뒤 `ai.models.generateContent({ model, contents, config })`를 호출하고 `response.text`로 결과를 읽는 방식입니다. API 키는 서버 환경 변수 `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`를 사용합니다.

## 핵심 구현

- API 라우트는 `request.json()`으로 입력을 읽고, 빈 본문은 `400`, 키 누락은 `500`, 모델 호출 실패는 `502` 수준의 JSON 에러로 반환합니다.
- 모델은 빠른 요약에 적합한 `gemini-2.5-flash`를 기본으로 사용하고, `maxOutputTokens`와 낮은 `temperature`를 설정해 짧고 안정적인 한국어 요약을 유도합니다.
- 프롬프트는 제목과 본문을 함께 전달하며, 출력은 2-4개 핵심 bullet 또는 짧은 단락 형태로 제한합니다.
- `MemoDetailModal`은 기존 `'use client'` 구조를 유지하고, `fetch('/api/memos/summarize')` 호출 결과를 상태로 관리합니다. 메모가 바뀌면 이전 요약/에러 상태를 초기화합니다.

## 검증

- `npm run lint` 또는 현재 ESLint 설정에 맞는 검사로 타입/린트 오류를 확인합니다.
- 필요 시 개발 서버에서 메모 상세보기 열기 → 요약하기 클릭 → 로딩/성공/에러 UI를 수동 확인합니다.

