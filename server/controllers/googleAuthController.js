import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';  // iske liye npm install google-auth-library

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;   // frontend se token bhejega

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Naya user create (verified direct true)
      user = await prisma.user.create({
        data: {
          name,
          email,
          isVerified: true,    // Google se verify ho chuka
          // password nahi dalna — is Google user ke liye null rakh sakte ho, ya dummy
          password: 'google-oauth-no-password',
        },
      });
    } else {
      // Agar pehle se hai, ensure isVerified = true (Google wala)
      if (!user.isVerified) {
        await prisma.user.update({
          where: { email },
          data: { isVerified: true },
        });
        user.isVerified = true;
      }
    }

    // JWT token generate
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Cookie set
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};