import { Response } from 'express';
import { PrismaClient, AuthProvider } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { formatAuthUser } from '../utils/auth.util';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        authProvider: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: formatAuthUser(user) });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone } = req.body;

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.authProvider === AuthProvider.GOOGLE && email && email !== currentUser.email) {
      return res.status(400).json({
        error: 'Email cannot be changed for Google-only accounts. Link a password first or contact support.',
      });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== req.user!.id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updateData: Record<string, string | null> = {};
    if (name) updateData.name = name;
    if (email && currentUser.authProvider !== AuthProvider.GOOGLE) {
      updateData.email = email.toLowerCase();
    }
    if (phone !== undefined) updateData.phone = phone || null;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        authProvider: true,
        password: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: formatAuthUser(user),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await hashPassword(newPassword);

    if (!user.password) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          authProvider:
            user.authProvider === AuthProvider.GOOGLE ? AuthProvider.BOTH : user.authProvider,
        },
      });

      return res.json({
        message: 'Password set successfully. You can now sign in with email and password.',
      });
    }

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
