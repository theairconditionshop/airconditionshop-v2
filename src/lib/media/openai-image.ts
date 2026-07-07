/**
 * Server-only image generation via OpenAI's Image API (gpt-image-1).
 * This is the project's sole image-generation pipeline — call
 * `generateImage()` and pass the returned buffer to the existing Supabase
 * media upload path (see src/app/api/admin/media/route.ts) rather than
 * inventing a parallel storage mechanism.
 * Never import this from a client component — it reads OPENAI_API_KEY
 * (server-only env var) and calls OpenAI directly.
 */
const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations'

export interface GenerateImageOptions {
  prompt: string
  /** Defaults to '1536x1024' — the widest landscape size gpt-image-1 supports, ideal for hero banners. */
  size?: '1024x1024' | '1536x1024' | '1024x1536'
  /** Defaults to 'high' — the highest-quality tier gpt-image-1 offers. */
  quality?: 'high' | 'medium' | 'low'
}

/**
 * Generates an image with OpenAI's gpt-image-1 model and returns raw PNG bytes.
 * Throws if OPENAI_API_KEY is missing or the API call fails.
 */
export async function generateImage({
  prompt,
  size = '1536x1024',
  quality = 'high',
}: GenerateImageOptions): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const res = await fetch(OPENAI_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      quality,
      n: 1,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`OpenAI image generation failed (${res.status}): ${body.slice(0, 500)}`)
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI response contained no image data')

  return Buffer.from(b64, 'base64')
}
