# Demo Lecturer Planner

A Fastify API for sending WhatsApp and SMS messages via Twilio.

## Features

- 📱 Send WhatsApp messages first, fallback to SMS
- 🔄 Batch message sending to multiple phone numbers
- 🚀 Deploy-ready for Heroku
- ✅ TypeScript support

## API Endpoints

- `GET /` - Health check and API info
- `GET /health` - Simple health check
- `POST /mission` - Send messages to multiple numbers
- `POST /sms-webhook` - Handle incoming SMS responses (Twilio webhook)

### POST /mission

Send WhatsApp/SMS messages to multiple phone numbers.

**Request Body:**
```json
{
  "message": "Your message here",
  "phoneNumbers": ["+1234567890", "+1987654321"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mission processed",
  "results": [
    { "number": "+1234567890", "status": "WhatsApp sent" },
    { "number": "+1987654321", "status": "SMS sent" }
  ]
}
```

## Environment Variables

Set these environment variables in your Heroku app:

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (for SMS)
- `TWILIO_WHATSAPP_NUMBER` - Your Twilio WhatsApp number (optional, format: `whatsapp:+1234567890`)

## Deploying to Heroku

1. **Install Heroku CLI** (if not already installed):
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**:
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
   heroku config:set TWILIO_PHONE_NUMBER=your_phone_number
   heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+your_whatsapp_number
   ```

5. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Test your deployment**:
   ```bash
   curl https://your-app-name.herokuapp.com/
   ```

## Setting Up SMS Response Handling

To handle SMS responses with your Twilio trial account:

### 1. Configure Twilio Webhook

1. Go to your [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** > **Manage** > **Active numbers**
3. Click on your Twilio phone number
4. In the **Messaging** section, set the webhook URL to:
   ```
   https://your-app-name.herokuapp.com/sms-webhook
   ```
5. Set the HTTP method to **POST**
6. Save the configuration

### 2. Trial Account Limitations

⚠️ **Important**: With a Twilio trial account:
- You can only send/receive SMS to/from **verified phone numbers**
- All messages will have a "Sent from your Twilio trial account" prefix
- Add phone numbers in **Verified Caller IDs** section

### 3. How SMS Responses Work

When someone replies to your SMS:
- The webhook receives the response automatically
- Responses with "oui"/"yes" = ✅ Acceptance 
- Responses with "non"/"no" = ❌ Decline
- Other responses = ❓ Request clarification
- An automatic reply is sent based on the response

### 4. Testing SMS Responses

1. Send a mission SMS to a verified number
2. Reply with "oui" or "non" from that number
3. Check your Heroku logs: `heroku logs --tail`
4. You should see the response processed and auto-reply sent

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (create a `.env` file):
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_phone_number
   TWILIO_WHATSAPP_NUMBER=whatsapp:+your_whatsapp_number
   ```

3. **Build and run**:
   ```bash
   npm run dev
   ```

4. **Test locally**:
   ```bash
   curl http://localhost:3000/
   ```

### Testing Webhooks Locally (Optional)

To test SMS responses during local development:

1. **Install ngrok** (to expose your local server):
   ```bash
   brew install ngrok
   ```

2. **Start your local server**:
   ```bash
   npm run dev
   ```

3. **In another terminal, expose your local server**:
   ```bash
   ngrok http 3000
   ```

4. **Configure Twilio webhook** with the ngrok URL:
   ```
   https://your-ngrok-id.ngrok.io/sms-webhook
   ```

## Testing the Mission Endpoint

```bash
curl -X POST https://your-app-name.herokuapp.com/mission \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from the lecturer planner!",
    "phoneNumbers": ["+1234567890"]
  }'
```

## Project Structure

```
├── server.ts          # Main server file
├── package.json       # Node.js dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── Procfile          # Heroku process configuration
└── README.md         # This file
```
