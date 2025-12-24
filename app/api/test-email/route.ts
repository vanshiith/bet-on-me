import { NextResponse } from 'next/server'
import { sendEmail, generateReminderEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

/**
 * Test endpoint to send a sample email
 * Usage: GET /api/test-email
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send test email
    const userName = userData.email.split('@')[0]
    const testHabits = ['Morning Workout', 'Read for 30 minutes', 'Meditate']

    const html = generateReminderEmail(userName, testHabits)

    const result = await sendEmail({
      to: userData.email,
      subject: '🎯 Test Email from BetOnMe',
      html,
    })

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      sentTo: userData.email,
      message: result.success
        ? 'Test email sent successfully! Check your inbox.'
        : 'Failed to send email. Check server logs.',
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
