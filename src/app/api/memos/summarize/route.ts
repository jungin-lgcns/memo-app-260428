import { GoogleGenAI } from '@google/genai'

interface SummarizeRequestBody {
  title: string
  content: string
}

export async function POST(request: Request) {
  let body: SummarizeRequestBody

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '요청 본문을 파싱할 수 없습니다.' }, { status: 400 })
  }

  const { title, content } = body

  if (!title?.trim() && !content?.trim()) {
    return Response.json({ error: '메모 제목 또는 내용이 필요합니다.' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' },
      { status: 500 },
    )
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `다음 메모를 한국어로 간결하게 요약해 주세요. 핵심 내용만 2~4개의 bullet 포인트로 작성하세요.

제목: ${title}

내용:
${content}`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    })

    const summary = response.text ?? ''

    if (!summary) {
      return Response.json({ error: '요약 결과를 받을 수 없습니다.' }, { status: 502 })
    }

    return Response.json({ summary })
  } catch (error) {
    console.error('Gemini API 호출 실패:', error)
    return Response.json({ error: 'AI 요약 중 오류가 발생했습니다.' }, { status: 502 })
  }
}
