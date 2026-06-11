import prisma from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import generateOtp from '../utils/generateOtp.js'
import sendEmail from '../utils/sendEmail.js'
import ApiResponse from '../utils/ApiResponse.js'

// SIGNUP
export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await prisma.user.findUnique({ where: { email } })

        // already verified hai to rokو
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json(new ApiResponse(400, 'Email already registered'))
        }

        // verified nahi hai to purana data hata do fresh start ke liye
        if (existingUser && !existingUser.isVerified) {
            await prisma.otp.deleteMany({ where: { email } })
            await prisma.user.delete({ where: { email } })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: { name, email, password: hashedPassword }
        })

        const code = generateOtp()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await prisma.otp.create({
            data: { email, code, expiresAt }
        })

        const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <tr>
      <td style="padding-bottom:32px;border-bottom:2px solid #000000;">
        <h2 style="margin:0;color:#000000;font-size:20px;letter-spacing:4px;">SYED WATCH COMPANY</h2>
        <p style="margin:4px 0 0;color:#666666;font-size:12px;letter-spacing:2px;">SWC — Official Communication</p>
      </td>
    </tr>

    <tr>
      <td style="padding:32px 0;">
        <p style="margin:0 0 8px;color:#333333;font-size:15px;">Dear ${name},</p>
        <p style="margin:0 0 24px;color:#555555;font-size:14px;line-height:1.8;">
          Thank you for registering with Syed Watch Company. Please use the following One-Time Password to verify your email address and complete your registration.
        </p>

        <p style="margin:0 0 8px;color:#666666;font-size:12px;letter-spacing:2px;">YOUR VERIFICATION CODE</p>
        <h1 style="margin:0 0 8px;color:#000000;font-size:42px;letter-spacing:12px;font-weight:800;">${code}</h1>
        <p style="margin:0 0 24px;color:#999999;font-size:12px;">This code is valid for 10 minutes only.</p>

        <p style="margin:0;color:#555555;font-size:14px;line-height:1.8;">
          If you did not initiate this request, please disregard this email. Your account will remain secure.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:32px;border-top:1px solid #dddddd;">
        <p style="margin:0 0 4px;color:#000000;font-size:13px;font-weight:bold;">Syed Watch Company</p>
        <p style="margin:0;color:#999999;font-size:12px;">This is an automated message. Please do not reply to this email.</p>
      </td>
    </tr>

  </table>
</body>
</html>
`

        await sendEmail({
            to: email,
            subject: 'Verify Your SWC Account',
            html: emailHtml,
        })

        res.status(201).json(new ApiResponse(201, 'OTP sent to your email', { email }))

    } catch (err) {
        next(err)
    }
}

// VERIFY OTP
export const verifyOtp = async (req, res, next) => {
    try {
        const { email, code } = req.body

        const otp = await prisma.otp.findFirst({
            where: {
                email,
                code,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        })

        if (!otp) {
            return res.status(400).json(new ApiResponse(400, 'Invalid or expired OTP'))
        }

        await prisma.otp.update({
            where: { id: otp.id },
            data: { isUsed: true }
        })

        await prisma.user.update({
            where: { email },
            data: { isVerified: true }
        })

        res.status(200).json(new ApiResponse(200, 'Email verified successfully'))

    } catch (err) {
        next(err)
    }
}

// LOGIN
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(400).json(new ApiResponse(400, 'Invalid credentials'))
        }

        if (!user.isVerified) {
            return res.status(400).json(new ApiResponse(400, 'Please verify your email first'))
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json(new ApiResponse(400, 'Invalid credentials'))
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json(new ApiResponse(200, 'Login successful', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }))

    } catch (err) {
        next(err)
    }
}

// LOGOUT
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('token')
        res.status(200).json(new ApiResponse(200, 'Logged out successfully'))
    } catch (err) {
        next(err)
    }
}