import { NextRequest, NextResponse } from 'next/server'

/**
 * GET
 * Meta Webhook Verification
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook Verified')

    return new NextResponse(challenge, {
      status: 200,
    })
  }

  console.log('❌ Invalid Verify Token')

  return NextResponse.json(
    {
      error: 'Verification failed',
    },
    {
      status: 403,
    },
  )
}

/**
 * POST
 * Incoming WhatsApp Webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('\n================ WHATSAPP WEBHOOK ================\n')
    console.log(JSON.stringify(body, null, 2))
    console.log('\n==================================================\n')

    const value = body?.entry?.[0]?.changes?.[0]?.value

    // Incoming message
    if (value?.messages?.length) {
      console.log('📩 Incoming Message')
      console.log(JSON.stringify(value.messages, null, 2))
    }

    // Delivery status
    if (value?.statuses?.length) {
      console.log('📦 Message Status Update')

      for (const status of value.statuses) {
        console.log(`Status      : ${status.status}`)
        console.log(`Message ID  : ${status.id}`)
        console.log(`Recipient   : ${status.recipient_id}`)

        if (status.errors) {
          console.log('❌ Errors:')
          console.log(JSON.stringify(status.errors, null, 2))
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook Error:', err)

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    )
  }
}
