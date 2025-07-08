import Fastify from 'fastify'
import twilio from 'twilio'

// Twilio configuration - you'll need to set these environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER // Format: whatsapp:+1234567890

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Missing required Twilio environment variables:')
  console.error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER')
  console.error('TWILIO_WHATSAPP_NUMBER (optional, for WhatsApp)')
  process.exit(1)
}

const client = twilio(accountSid, authToken)

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// POST route for /mission
fastify.post('/mission', async (request, reply) => {
  const missionData = request.body

  // Log the received mission data
  fastify.log.info('Received mission data:', missionData)

  // Assuming missionData contains a message and an array of phone numbers
  const { message, phoneNumbers } = missionData

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
    } catch (error) {
      fastify.log.warn(`WhatsApp failed for ${number}: ${error.message}`)
      try {
        // Fallback to SMS if WhatsApp fails
        await client.messages.create({
          from: twilioPhoneNumber,
          to: number,
          body: message
        })
        return { number, status: 'SMS sent' }
      } catch (error) {
        fastify.log.error(`SMS failed for ${number}: ${error.message}`)
        return { number, status: 'Failed', error: error.message }
      }
    }}))

  return {
    success: true,
    message: 'Mission processed',
    results
  }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()