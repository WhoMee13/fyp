import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Define ListingStatus locally until Prisma client is updated
type ListingStatus = 'ACTIVE' | 'SOLD_OUT' | 'RENTED_OUT';
const LISTING_STATUS_VALUES: ListingStatus[] = ['ACTIVE', 'SOLD_OUT', 'RENTED_OUT'];

export const updatePropertyListingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { listingStatus } = req.body;

    if (!LISTING_STATUS_VALUES.includes(listingStatus)) {
      return res.status(400).json({ error: 'Invalid listing status' });
    }

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    // Validate status changes based on property purpose
    if (property.purpose === 'Sale' && listingStatus === 'RENTED_OUT') {
      return res.status(400).json({ error: 'Cannot set sale property as rented out' });
    }

    if (property.purpose === 'Rent' && listingStatus === 'SOLD_OUT') {
      return res.status(400).json({ error: 'Cannot set rental property as sold out' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { listingStatus },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        location: true
      }
    });

    res.json({
      message: 'Property listing status updated successfully',
      property: updatedProperty
    });
  } catch (error: any) {
    console.error('Update property listing status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVendorProperties = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      page = '1',
      limit = '10',
      listingStatus,
      propertyType,
      purpose
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      ownerId: req.user.id
    };

    if (listingStatus) {
      where.listingStatus = listingStatus;
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (purpose) {
      where.purpose = purpose;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          },
          location: true,
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] }
            },
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
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
    console.error('Get vendor properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPropertyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view these bookings' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bookings });
  } catch (error: any) {
    console.error('Get property bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
