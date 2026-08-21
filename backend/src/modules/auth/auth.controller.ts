import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from './user.model';
import { Tenant } from '../tenant/tenant.model';
import { env } from '../../config/env.config';
import { successResponse, errorResponse } from '../../utils/response';

const generateTokens = (user: any) => {
  const payload = {
    userId: user._id,
    role: user.role,
    schoolId: user.schoolId ? user.schoolId.toString() : null
  };
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] });
  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    return errorResponse(res, 'UNAUTHORIZED', 'Invalid credentials', null, 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 'UNAUTHORIZED', 'Invalid credentials', null, 401);
  }

  if (!user.isActive) {
    return errorResponse(res, 'FORBIDDEN', 'User account is disabled', null, 403);
  }

  if (user.role !== 'SUPERADMIN' && user.schoolId) {
    const tenant = await Tenant.findById(user.schoolId);
    if (!tenant) {
      return errorResponse(res, 'TENANT_NOT_FOUND', 'Associated school not found', null, 404);
    }
    if (tenant.subscriptionStatus !== 'ACTIVE') {
      return errorResponse(res, 'TENANT_SUSPENDED', 'Your school subscription is suspended or unapproved', null, 403);
    }
  }

  const { accessToken, refreshToken } = generateTokens(user);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;

  return successResponse(res, { accessToken, user: userObject }, 'Login successful');
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return errorResponse(res, 'UNAUTHORIZED', 'Refresh token not found', null, 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'UNAUTHORIZED', 'Invalid refresh token', null, 401);
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (error) {
    return errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired refresh token', null, 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken: refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    return errorResponse(res, 'NOT_FOUND', 'User not found', null, 404);
  }

  let tenant = null;
  if (user.schoolId) {
    tenant = await Tenant.findById(user.schoolId);
  }

  return successResponse(res, { user, tenant }, 'User profile retrieved');
};
