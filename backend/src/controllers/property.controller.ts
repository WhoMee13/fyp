import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import path from 'path';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getProperties = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = '1',
      limit = '12',
      city,
      propertyType,
      purpose,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'APPROVED',
      isActive: true
    };

    if (city) {
      where.location = {
        city: { contains: city as string }
      };
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (purpose) {
      where.purpose = purpose;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc'
        },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          },
          location: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        location: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Only show approved properties to non-owners
    if (property.status !== 'APPROVED' && property.ownerId !== (req as AuthRequest).user?.id) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property });
  } catch (error: any) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      propertyType,
      purpose,
      price,
      landSize,
      sizeUnit,
      address,
      city,
      state,
      country,
      latitude,
      longitude
    } = req.body;

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        propertyType,
        purpose,
        price: parseFloat(price),
        landSize: parseFloat(landSize),
        sizeUnit,
        ownerId: req.user!.id,
        images: {
          create: files.map((file, index) => ({
            imageUrl: `/public/uploads/${file.filename}`,
            isPrimary: index === 0
          }))
        },
        location: {
          create: {
            address,
            city,
            state: state || null,
            country: country || 'Nepal',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
          }
        }
      },
      include: {
        images: true,
        location: true
      }
    });

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error: any) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    const {
      title,
      description,
      propertyType,
      purpose,
      price,
      landSize,
      sizeUnit,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      isActive
    } = req.body;

    const files = req.files as Express.Multer.File[];

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { propertyId: id }
    });

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (propertyType) updateData.propertyType = propertyType;
    if (purpose) updateData.purpose = purpose;
    if (price) updateData.price = parseFloat(price);
    if (landSize) updateData.landSize = parseFloat(landSize);
    if (sizeUnit) updateData.sizeUnit = sizeUnit;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    const locationData: any = {};
    if (address) locationData.address = address;
    if (city) locationData.city = city;
    if (state !== undefined) locationData.state = state || null;
    if (country) locationData.country = country || 'Nepal';
    if (latitude) locationData.latitude = parseFloat(latitude);
    if (longitude) locationData.longitude = parseFloat(longitude);

    const updatePayload: any = {
      ...updateData,
      ...(files && files.length > 0 && {
        images: {
          create: files.map((file) => ({
            imageUrl: `/public/uploads/${file.filename}`,
            isPrimary: false
          }))
        }
      })
    };

    if (Object.keys(locationData).length > 0) {
      if (existingLocation) {
        updatePayload.location = {
          update: locationData
        };
      } else {
        updatePayload.location = {
          create: locationData
        };
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updatePayload,
      include: {
        images: true,
        location: true
      }
    });

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProperties = async (req: AuthRequest, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user!.id },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        location: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ properties });
  } catch (error: any) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const contactOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const contactRequest = await prisma.contactRequest.create({
      data: {
        propertyId: id,
        senderId: req.user!.id,
        message
      }
    });

    res.status(201).json({
      message: 'Contact request sent successfully',
      contactRequest
    });
  } catch (error: any) {
    console.error('Contact owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

