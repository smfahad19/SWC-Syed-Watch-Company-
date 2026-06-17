import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // syedfahad305171@gmail.com
    pass: process.env.EMAIL_PASS, // App Password (16 chars with spaces)
  },
})

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Syed Watch Company" <${process.env.EMAIL_USER}>`, // Professional name
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1',               // High priority
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}>`,
      },
    })
    console.log('✅ Email sent to', to, '- Message ID:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Nodemailer error:', error.message)
    // Fallback: print OTP in console so dev can see
    // The OTP code is not available here, so caller will handle fallback
    return false
  }
}

export default sendEmail