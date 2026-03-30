import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await (prisma as any).siteSetting.findFirst();
    
    if (!settings) {
      // Create default if not exists (fail-safe)
      settings = await (prisma as any).siteSetting.create({
        data: {
          appName: 'PropertyRental',
          footerText: 'Your one-stop destination for finding the perfect property.',
          copyrightText: `© ${new Date().getFullYear()} PropertyRental. All rights reserved.`,
        }
      });
    }

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { appName, footerText, copyrightText, contactEmail, contactPhone, address } = req.body;
    const logo = req.file ? `/public/uploads/site/${req.file.filename}` : undefined;

    const currentSettings = await (prisma as any).siteSetting.findFirst();

    const data: any = {
      appName,
      footerText,
      copyrightText,
      contactEmail,
      contactPhone,
      address,
    };

    if (logo) {
      data.logo = logo;
    }

    let updatedSettings;
    if (currentSettings) {
      updatedSettings = await (prisma as any).siteSetting.update({
        where: { id: currentSettings.id },
        data,
      });
    } else {
      updatedSettings = await (prisma as any).siteSetting.create({
        data,
      });
    }

    res.json(updatedSettings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
