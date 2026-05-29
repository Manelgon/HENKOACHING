export type EmailMessage = {
  uid: number
  from: string
  subject: string
  date: Date
  seen: boolean
  snippet: string
}

export type EmailDetail = EmailMessage & {
  bodyHtml: string | null
  bodyText: string | null
}
