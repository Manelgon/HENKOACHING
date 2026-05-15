import { ImageResponse } from 'next/og'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const alt = 'Henkoaching — Coaching & Mindfulness Empresarial'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  const logo = fs.readFileSync(path.join(process.cwd(), 'public/hk.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9f3ef',
          padding: '60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: '#1f8f9b',
            display: 'flex',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Henkoaching"
          width={780}
          height={476}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { ...size },
  )
}
