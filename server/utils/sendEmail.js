import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
    })

    console.log('Email sent:', result)
    return result
  } catch (err) {
    console.error('Email error:', err)
    throw err
  }
}

export default sendEmail