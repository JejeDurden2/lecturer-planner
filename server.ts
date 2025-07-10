import Fastify from 'fastify'
import twilio from 'twilio'

// Twilio configuration - you'll need to set these environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER // Format: whatsapp:+1234567890

let client: any
if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
  console.log('✅ Twilio client initialized')
} else {
  console.log('⚠️  Twilio credentials not configured - SMS/WhatsApp features will be disabled')
}

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  return { 
    hello: 'world',
    message: 'Lecturer Planner API is running!',
    endpoints: {
      'GET /': 'This endpoint',
      'POST /mission': 'Send WhatsApp/SMS to multiple numbers',
      'POST /sms-webhook': 'Handle incoming SMS responses'
    }
  }
})

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'healthy', timestamp: new Date().toISOString() }
})

// POST route for /mission
fastify.post('/mission', async (request, reply) => {
  if (!client) {
    reply.code(500)
    return {
      success: false,
      error: 'Twilio credentials not configured'
    }
  }

  const missionData = request.body as any

  // Log the received mission data
  fastify.log.info('Received mission data:', missionData)

  // Assuming missionData contains a message and an array of phone numbers
  const { intervenant, mission } = missionData

  if (!intervenant || !mission) {
    reply.code(400)
    return {
      success: false,
      error: 'Invalid payload. Expected { phoneNumber: string }'
    }
  }
  
  else {
    const body = `Bonjour ${intervenant.firstName},\n\n` +
                `Vous avez une nouvelle mission :\n` +
                `Titre : ${mission.title}\n` +
                `Durée : ${mission.duration}\n` +
                `Date de début : ${mission.startDate}\n` +
                `Merci de confirmer votre disponibilité sur ce lien:\n` +
                `${mission.validationUrl}\n`

    try {
      // Attempt to send a WhatsApp message first
      if (twilioWhatsAppNumber) {
        await client.messages.create({
          from: twilioWhatsAppNumber,
          to: `whatsapp:${process.env.STEVEIE_PHONE_NUMBER}`,
          body
        })
        return { intervenant, status: 'WhatsApp sent' }
      }
    } catch (error: any) {
      fastify.log.warn(`WhatsApp failed for ${intervenant.phoneNumber}: ${error.message}`)
      try {
        // Fallback to SMS if WhatsApp fails
        await client.messages.create({
          from: twilioPhoneNumber,
          to: `${process.env.STEVEIE_PHONE_NUMBER}`,
          body
        })
        return { intervenant, status: 'SMS sent' }
      } catch (error: any) {
        fastify.log.error(`SMS failed for ${intervenant.phoneNumber}: ${error.message}`)
        return { intervenant, status: 'Failed', error: error.message }
      }
    }
  }
})

// SMS Webhook endpoint to handle incoming SMS responses
fastify.post('/sms-webhook', async (request, reply) => {
  const body = request.body as any
  
  // Extract information from the webhook
  const from = body.From // Phone number that sent the SMS
  const messageBody = body.Body // Content of the SMS
  const messageSid = body.MessageSid // Unique message ID
  const timestamp = new Date().toISOString()

  console.log('📱 Incoming SMS:', {
    from,
    message: messageBody,
    sid: messageSid,
    timestamp
  })

  // Process the response (you can customize this logic)
  const response = messageBody.toLowerCase().trim()
  let replyMessage = ''

  if (response.includes('oui') || response.includes('yes')) {
    replyMessage = 'Merci ! Votre acceptation a été enregistrée. ✅'
    console.log(`✅ ${from} accepted the mission`)
  } else if (response.includes('non') || response.includes('no')) {
    replyMessage = 'Merci pour votre réponse. Nous prendrons note de votre indisponibilité. ❌'
    console.log(`❌ ${from} declined the mission`)
  } else {
    replyMessage = 'Merci pour votre message. Veuillez répondre par "oui" ou "non" pour confirmer votre disponibilité.'
    console.log(`❓ ${from} sent unclear response: ${messageBody}`)
  }

  // Send automatic reply (optional)
  if (client && replyMessage) {
    try {
      await client.messages.create({
        from: twilioPhoneNumber,
        to: from,
        body: replyMessage
      })
      console.log(`📤 Auto-reply sent to ${from}`)
    } catch (error: any) {
      console.error(`❌ Failed to send auto-reply to ${from}:`, error.message)
    }
  }

  // Return TwiML response (required by Twilio)
  reply.type('text/xml')
  return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()