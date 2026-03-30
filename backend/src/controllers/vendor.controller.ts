import { Response } from 'express';
import { PrismaClient, VendorStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { upload } from '../config/multer.config';

const prisma = new PrismaClient();

export const vendorUploadMiddleware = upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]);

export const applyForVendor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { citizenshipId } = req.body;

    if (!citizenshipId) {
      return res.status(400).json({ error: 'Citizenship ID is required' });
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    } | undefined;

    const frontFile = files?.frontImage?.[0];
    const backFile = files?.backImage?.[0];

    if (!frontFile || !backFile) {
      return res.status(400).json({ error: 'Both front and back images are required' });
    }

    const frontImagePath = `/public/uploads/${frontFile.filename}`;
    const backImagePath = `/public/uploads/${backFile.filename}`;

    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (existingProfile && (existingProfile.status === VendorStatus.PENDING || existingProfile.status === VendorStatus.APPROVED)) {
      return res.status(400).json({
        error: 'You already have an active vendor application. Please wait for review or cancel your application.'
      });
    }

    const profile = await prisma.vendorProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        citizenshipId,
        frontImagePath,
        backImagePath,
        status: VendorStatus.PENDING
      },
      update: {
        citizenshipId,
        frontImagePath,
        backImagePath,
        status: VendorStatus.PENDING
      }
    });

    res.status(existingProfile ? 200 : 201).json({
      message: existingProfile
        ? 'Vendor application resubmitted and set to pending review'
        : 'Vendor application submitted successfully',
      profile
    });
  } catch (error: any) {
    console.error('Apply for vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyVendorProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    res.json({ profile });
  } catch (error: any) {
    console.error('Get my vendor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelMyVendorApplication = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'No vendor application found' });
    }

    if (profile.status !== VendorStatus.PENDING) {
      return res.status(400).json({ error: 'Only pending applications can be cancelled' });
    }

    const updated = await prisma.vendorProfile.update({
      where: { userId: req.user.id },
      data: {
        status: VendorStatus.REJECTED
      }
    });

    res.json({
      message: 'Vendor application cancelled',
      profile: updated
    });
  } catch (error: any) {
    console.error('Cancel vendor application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

