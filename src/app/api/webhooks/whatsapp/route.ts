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

    console.log('📩 Incoming WhatsApp Webhook\n', JSON.stringify(body, null, 2))

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error(err)

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
