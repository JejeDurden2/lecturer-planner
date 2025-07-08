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
  return { hello: 'world' }
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
  const { phoneNumber } = missionData

  if (!phoneNumber) {
    reply.code(400)
    return {
      success: false,
      error: 'Invalid payload. Expected { phoneNumber: string }'
    }
  }
  else {
    try {
      // Attempt to send a WhatsApp message first
      if (twilioWhatsAppNumber) {
        await client.messages.create({
          from: twilioWhatsAppNumber,
          to: `whatsapp:${process.env.JEROME_PHONE_NUMBER}`, // Example WhatsApp number]}`,
          body: "coucou Jerome, c'est un test de mission"
        })
        return { phoneNumber, status: 'WhatsApp sent' }
      }
    } catch (error: any) {
      fastify.log.warn(`WhatsApp failed for ${phoneNumber}: ${error.message}`)
      try {
        // Fallback to SMS if WhatsApp fails
        await client.messages.create({
          from: twilioPhoneNumber,
          to: `${process.env.JEROME_PHONE_NUMBER}`,
          body: "coucou Jerome, c'est un test de mission"
        })
        return { phoneNumber, status: 'SMS sent' }
      } catch (error: any) {
        fastify.log.error(`SMS failed for ${phoneNumber}: ${error.message}`)
        return { phoneNumber, status: 'Failed', error: error.message }
      }
    }
  }
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