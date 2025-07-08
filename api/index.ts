import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({ 
      hello: 'world', 
      message: 'Lecturer Planner API is running!',
      endpoints: {
        'GET /api': 'This endpoint',
        'POST /api/mission': 'Send WhatsApp/SMS to multiple numbers'
      }
    })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
