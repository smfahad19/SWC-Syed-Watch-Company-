import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { updateUserActivity } from '../utils/activeUsers.js';

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // fallback: Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = { id: user.id, role: user.role };
    updateUserActivity(req.user.id);
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default protect;