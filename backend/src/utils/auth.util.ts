import { Response } from 'express';
import { generateToken } from './jwt.util';

export const setAuthCookie = (res: Response, user: { id: string; email: string; role: string }) => {
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const formatAuthUser = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status?: string;
  authProvider: string;
  password: string | null;
  createdAt?: Date;
  vendorProfile?: unknown;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  authProvider: user.authProvider,
  hasPassword: !!user.password,
  createdAt: user.createdAt,
  vendorProfile: user.vendorProfile ?? null,
});
