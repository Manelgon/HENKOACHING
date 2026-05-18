import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    }),
)

const OPENAI_API_KEY = env.OPENAI_API_KEY
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
if (!SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

const prompt = `Editorial photograph for a leadership coaching blog. Soft natural daylight falling through a tall window onto an empty wooden meeting table. A single half-empty white ceramic coffee cup sits on a closed leather notebook with a fountain pen resting on top. Two empty modern chairs face each other across the table. Warm neutral palette: beige, oak, soft gray, a touch of muted terracotta. Cinematic depth of field, shallow focus on the notebook, slightly blurred background. Quiet, contemplative, honest mood. No people, no text, no logos, no watermark. Magazine quality, 35mm photography, professional editorial style.`

console.log('Generating image with OpenAI gpt-image-1...')
const res = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size: '1536x1024',
    quality: 'high',
  }),
})

if (!res.ok) {
  const errText = await res.text()
  throw new Error(`OpenAI error ${res.status}: ${errText}`)
}

const json = await res.json()
const b64 = json.data?.[0]?.b64_json
if (!b64) throw new Error('No image data returned')

const buffer = Buffer.from(b64, 'base64')
mkdirSync(resolve(process.cwd(), 'scripts/out'), { recursive: true })
const localPath = resolve(process.cwd(), 'scripts/out/blog-cover.png')
writeFileSync(localPath, buffer)
console.log('Saved local copy at', localPath, 'size:', buffer.length, 'bytes')

const fileName = `blog-covers/${Date.now()}-lideres-que-ya-no-querian-liderar.png`
console.log('Uploading to Supabase Storage path:', fileName)

const uploadRes = await fetch(
  `${SUPABASE_URL}/storage/v1/object/blog/${fileName}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
      'cache-control': '3600',
    },
    body: buffer,
  },
)

if (!uploadRes.ok) {
  const errText = await uploadRes.text()
  throw new Error(`Supabase upload error ${uploadRes.status}: ${errText}`)
}

const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/blog/${fileName}`
console.log('Public URL:', publicUrl)
console.log('DONE')
console.log(JSON.stringify({ publicUrl }))
