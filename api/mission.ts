import twilio from 'twilio'
import { VercelRequest, VercelResponse } from '@vercel/node'

// Twilio configuration - you'll need to set these environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER // Format: whatsapp:+1234567890

let client: any
if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' })
    return
  }

  if (!client) {
    res.status(500).json({ 
      success: false, 
      error: 'Twilio credentials not configured' 
    })
    return
  }

  const { message, phoneNumbers } = req.body

  if (!message || !phoneNumbers || !Array.isArray(phoneNumbers)) {
    res.status(400).json({
      success: false,
      error: 'Invalid payload. Expected { message: string, phoneNumbers: string[] }'
    })
    return
  }

  try {
    const results = await Promise.all(phoneNumbers.map(async (number: string) => {
      try {
        // Attempt to send a WhatsApp message first
        if (twilioWhatsAppNumber) {
          await client.messages.create({
            from: twilioWhatsAppNumber,
            to: `whatsapp:${number}`,
            body: message
          })
          return { number, status: 'WhatsApp sent' }
        }
      } catch (error: any) {
        console.warn(`WhatsApp failed for ${number}: ${error.message}`)
      }

      try {
        // Fallback to SMS if WhatsApp fails
        await client.messages.create({
          from: twilioPhoneNumber,
          to: number,
          body: message
        })
        return { number, status: 'SMS sent' }
      } catch (error: any) {
        console.error(`SMS failed for ${number}: ${error.message}`)
        return { number, status: 'Failed', error: error.message }
      }
    }))

    res.status(200).json({
      success: true,
      message: 'Mission processed',
      results
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
