import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/errors.js';
import { loginUser, registerUser } from './auth.service.js';

function setAuthCookie(res, token) {
  res.cookie('kakeibo_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.validatedBody);
  setAuthCookie(res, result.token);
  res.status(201).json({
    success: true,
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.validatedBody);
  setAuthCookie(res, result.token);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('kakeibo_token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});
