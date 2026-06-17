import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { updateUserActivity } from '../utils/activeUsers.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = { id: user.id, role: user.role };
    updateUserActivity(req.user.id);   // 👈 track activity
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default protect;