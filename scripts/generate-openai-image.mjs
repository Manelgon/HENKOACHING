import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve('.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const apiKey = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error('OPENAI_API_KEY not found');

const prompt = `Minimalist abstract butterfly (mariposa) drawn in elegant continuous calligraphic black ink lines on pure white background, in the style of a sophisticated hand-drawn brand logo. The butterfly is suggested with loose flowing organic strokes forming the wings and body — NOT cartoonish, NOT childish, NOT cute, NOT illustrated with faces or eyes. Just an abstract elegant ink line drawing with confident calligraphic brush strokes, slightly irregular and hand-made, asymmetric and artistic. Inside the wings, a few areas are filled with soft translucent flat watercolor shapes in elegant adult colors: teal turquoise #1f8f9b as dominant, light mint #addbd2, with tiny accents of dusty lavender #958cba and soft yellow #eddc88. The colored shapes are simple geometric organic blobs, like brushstrokes inside the ink outline (same aesthetic as a minimalist editorial logo where colored shapes peek through black ink letterforms). Lots of empty white negative space, large clear area in the center and right for text overlay. Butterfly positioned on the left. Adult, sophisticated, refined, editorial, premium coaching brand aesthetic. Absolutely no text, no letters, no words, no eyes, no face. Flat 2D vector-style illustration.`;

const res = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size: '1536x1024',
    quality: 'high',
  }),
});

if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}

const data = await res.json();
const b64 = data.data[0].b64_json;
const outPath = path.resolve('public/images/hero-mariposa-logo.png');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
console.log('Saved:', outPath);
