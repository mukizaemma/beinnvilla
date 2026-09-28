import { resendAdapter } from '@payloadcms/email-resend'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'

export function createEmailAdapter() {
  const defaultFromAddress = process.env.RESEND_FROM || 'bookings@beinnvilla.com'
  const defaultFromName = process.env.RESEND_FROM_NAME || 'BE Inn Villa'

  if (process.env.RESEND_API_KEY) {
    return resendAdapter({
      defaultFromAddress,
      defaultFromName,
      apiKey: process.env.RESEND_API_KEY,
    })
  }

  return nodemailerAdapter({
    defaultFromAddress,
    defaultFromName,
    skipVerify: true,
    transport: nodemailer.createTransport({ jsonTransport: true }),
  })
}
