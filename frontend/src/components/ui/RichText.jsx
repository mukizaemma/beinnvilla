import { asHtml } from '@lib/richText'

export default function RichText({ value, className }) {
  const html = asHtml(value)
  if (!html) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
