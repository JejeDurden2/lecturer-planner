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
                `Durée : ${mission.duration}\n\n` +
                `Date de début : ${mission.startDate}\n` +
                `Merci de confirmer votre disponibilité en répondant par "oui" ou "non".\n\n`

    try {
      // Attempt to send a WhatsApp message first
      if (twilioWhatsAppNumber) {
        await client.messages.create({
          from: twilioWhatsAppNumber,
          to: `whatsapp:${process.env.JEROME_PHONE_NUMBER}`,
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
          to: `${process.env.JEROME_PHONE_NUMBER}`,
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