import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiResponse from '../utils/ApiResponse.js';

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json(new ApiResponse(400, 'Email already registered'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: true,
      },
    });

    res.status(201).json(new ApiResponse(201, 'Account created successfully. Please login.', { email: user.email }));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json(new ApiResponse(400, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(new ApiResponse(400, 'Invalid credentials'));
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(
      new ApiResponse(200, 'Login successful', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
};