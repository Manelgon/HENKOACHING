const { google } = require('googleapis')
const http = require('http')
const url = require('url')

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3099/callback'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/tasks',
]

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
})

console.log('\n✅ Abre esta URL en el navegador con la cuenta de Jennifer:\n')
console.log(authUrl)
console.log('\nEsperando autorización... (deja esta terminal abierta)\n')

const server = http.createServer(async (req, res) => {
  const { query } = url.parse(req.url, true)
  if (!query.code) return

  res.end('<h2>¡Autorizado! Puedes cerrar esta pestaña.</h2>')
  server.close()

  const { tokens } = await oauth2Client.getToken(query.code)

  console.log('\n🔑 Añade estas variables a tu .env.local:\n')
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
  console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`)
  console.log('\n✅ Listo.\n')
})

server.listen(3099)
