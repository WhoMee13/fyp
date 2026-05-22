import { Request, Response } from 'express';
import { PrismaClient, AuthProvider } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { validationResult } from 'express-validator';
import { verifyGoogleIdToken } from '../utils/google.util';
import { setAuthCookie, formatAuthUser } from '../utils/auth.util';

const prisma = new PrismaClient();

const userAuthSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  authProvider: true,
  password: true,
  createdAt: true,
  vendorProfile: {
    select: {
      id: true,
      citizenshipId: true,
      frontImagePath: true,
      backImagePath: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.authProvider === AuthProvider.GOOGLE && !existingUser.password) {
        return res.status(400).json({
          error: 'This email is registered with Google. Please sign in with Google.',
        });
      }
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        authProvider: AuthProvider.LOCAL,
      },
      select: userAuthSelect,
    });

    setAuthCookie(res, user);
    res.status(201).json({
      message: 'User registered successfully',
      user: formatAuthUser(user),
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { vendorProfile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    if (!user.password) {
      return res.status(401).json({
        error: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    setAuthCookie(res, user);

    res.json({
      message: 'Login successful',
      user: formatAuthUser(user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google login is not configured on the server' });
    }

    const googleUser = await verifyGoogleIdToken(credential);

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
      },
      include: { vendorProfile: true },
    });

    if (user) {
      if (user.status === 'INACTIVE') {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            authProvider: user.password ? AuthProvider.BOTH : AuthProvider.GOOGLE,
          },
          include: { vendorProfile: true },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          authProvider: AuthProvider.GOOGLE,
          phone: null,
          password: null,
        },
        include: { vendorProfile: true },
      });
    }

    setAuthCookie(res, user);

    res.json({
      message: 'Google sign-in successful',
      user: formatAuthUser(user),
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userAuthSelect,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: formatAuthUser(user) });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.json({ message: 'Password reset functionality - to be implemented with email service' });
};
