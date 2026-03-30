import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth.middleware';

const prisma = new PrismaClient();

export const requireApprovedVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendorProfile || vendorProfile.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Vendor approval required to manage properties' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

