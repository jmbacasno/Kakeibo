import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies?.kakeibo_token) {
      token = req.cookies.kakeibo_token;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please sign in.', 401));
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      return next(new AppError('Invalid or expired session token. Please sign in again.', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return next(new AppError('Account no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
