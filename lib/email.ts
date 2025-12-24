import { Resend } from 'resend'

/**
 * Email notification system using Resend
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // If no API key is configured, log instead
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 Email would be sent (no API key configured):')
    console.log('To:', to)
    console.log('Subject:', subject)
    return { success: true, messageId: 'no-api-key' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'BetOnMe <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

export function generateReminderEmail(userName: string, pendingHabits: string[]) {
  const habitList = pendingHabits.map(h => `<li style="margin: 8px 0;">${h}</li>`).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 BetOnMe</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000000; margin-top: 0;">Hi ${userName}!</h2>

          <p style="color: #000000; font-size: 16px;">
            Don't forget to check in your habits for today! You have <strong>${pendingHabits.length}</strong> pending habit${pendingHabits.length !== 1 ? 's' : ''} waiting:
          </p>

          <ul style="color: #000000; padding-left: 20px;">
            ${habitList}
          </ul>

          <p style="color: #000000;">
            Remember, missing a habit means your stake goes to charity! ✨
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/today"
               style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Check In Now
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            You're receiving this because you have active habits in BetOnMe.<br>
            Manage your notification preferences in Settings.
          </p>
        </div>
      </body>
    </html>
  `
}

export function generateDeadlineSoonEmail(userName: string, pendingHabits: string[], hoursLeft: number) {
  const habitList = pendingHabits.map(h => `<li style="margin: 8px 0;">${h}</li>`).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Deadline Approaching!</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000000; margin-top: 0;">Final reminder, ${userName}!</h2>

          <p style="color: #000000; font-size: 18px; font-weight: 600;">
            You have <strong style="color: #ef4444;">${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}</strong> left to check in!
          </p>

          <p style="color: #000000; font-size: 16px;">
            These habits are still pending:
          </p>

          <ul style="color: #000000; padding-left: 20px;">
            ${habitList}
          </ul>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #991b1b; margin: 0; font-weight: 600;">
              Don't lose your streak! Check in now to avoid penalties.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/today"
               style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Check In Now
            </a>
          </div>
        </div>
      </body>
    </html>
  `
}

export function generateStreakMilestoneEmail(userName: string, streakDays: number) {
  const milestone = streakDays >= 100 ? '💯 Century!' :
                   streakDays >= 30 ? '👑 Month!' :
                   streakDays >= 7 ? '🔥 Week!' : '🎯'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #000000; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${milestone} Achievement Unlocked!</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000000; margin-top: 0; text-align: center;">Congratulations, ${userName}!</h2>

          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 72px; margin-bottom: 20px;">${milestone}</div>
            <p style="color: #000000; font-size: 24px; font-weight: 600; margin: 10px 0;">
              ${streakDays} Day Streak!
            </p>
          </div>

          <p style="color: #000000; font-size: 16px; text-align: center;">
            You've maintained your habits for <strong>${streakDays} consecutive days</strong>. That's incredible consistency! 🎉
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #065f46; margin: 0;">
              Keep up the amazing work! Every day you're building stronger habits and better routines.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics"
               style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Your Progress
            </a>
          </div>
        </div>
      </body>
    </html>
  `
}
