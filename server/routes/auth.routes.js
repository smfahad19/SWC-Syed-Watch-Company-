import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { signup, login, logout } from '../controllers/auth.controller.js';
import { googleLogin } from '../controllers/googleAuthController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // token URL mein pass karo — frontend localStorage mein save karega
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  }
);

export default router;