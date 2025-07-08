# Demo Lecturer Planner

A Fastify API for sending WhatsApp and SMS messages via Twilio.

## Features

- 📱 Send WhatsApp messages first, fallback to SMS
- 🔄 Batch message sending to multiple phone numbers
- 🚀 Deploy-ready for Heroku
- ✅ TypeScript support

## API Endpoints

- `GET /` - Health check and API info
- `POST /mission` - Send messages to multiple numbers

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
