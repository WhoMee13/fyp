import { Response } from 'express';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Define BookingType locally until Prisma client is updated
type BookingType = 'RENTAL' | 'PURCHASE';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { propertyId, startDate, endDate } = req.body;

    if (!propertyId || !startDate) {
      return res.status(400).json({ error: 'propertyId and startDate are required' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          include: {
            vendorProfile: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (!property.owner.vendorProfile || property.owner.vendorProfile.status !== 'APPROVED') {
      return res.status(400).json({ error: 'This property owner is not an approved vendor' });
    }

    // Check if user is trying to book their own property
    if (property.ownerId === req.user.id) {
      return res.status(400).json({ error: 'You cannot book your own property' });
    }

    const start = new Date(startDate);
    let end: Date | null = null;

    if (property.purpose === 'Rent') {
      if (!endDate) {
        return res.status(400).json({ error: 'endDate is required for rental bookings' });
      }
      end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return res.status(400).json({ error: 'Invalid booking dates' });
      }

      // Check for overlapping rental bookings
      const overlappingRent = await prisma.booking.findFirst({
        where: {
          propertyId: property.id,
          type: 'RENTAL' as BookingType,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } }
          ]
        }
      });
      if (overlappingRent) {
        return res.status(400).json({ error: 'Property is already booked for these dates' });
      }
    } else if (property.purpose === 'Sale') {
      // For sale, check if there's already a pending/confirmed purchase
      const existingSale = await prisma.booking.findFirst({
        where: {
          propertyId: property.id,
          type: 'PURCHASE' as BookingType,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
        }
      });
      if (existingSale) {
        return res.status(400).json({ error: 'Property is currently unavailable for purchase' });
      }
      end = null; // No end date for purchase bookings
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        customerId: req.user.id,
        vendorId: property.ownerId,
        type: property.purpose === 'Rent' ? ('RENTAL' as BookingType) : ('PURCHASE' as BookingType),
        startDate: start,
        endDate: end,
        totalPrice: property.purpose === 'Rent' 
          ? calculateRentalPrice(property.price, start, end!)
          : property.price,
        status: BookingStatus.PENDING
      },
      include: {
        property: {
          include: {
            location: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    });

    res.status(201).json({
      message: property.purpose === 'Sale' ? 'Purchase request created successfully' : 'Booking created successfully',
      booking
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to calculate rental price
function calculateRentalPrice(pricePerMonth: number, startDate: Date, endDate: Date): number {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return (pricePerMonth / 30) * days;
}

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            location: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    });

    res.json({ bookings });
  } catch (error: any) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVendorBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const bookings = await prisma.booking.findMany({
      where: { vendorId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            location: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({ bookings });
  } catch (error: any) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelBookingByVendor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.vendorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (
      booking.status === BookingStatus.CANCELLED_BY_VENDOR ||
      booking.status === BookingStatus.CANCELLED_BY_CUSTOMER
    ) {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED_BY_VENDOR
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updated
    });
  } catch (error: any) {
    console.error('Cancel booking by vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelBookingByCustomer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (
      booking.status === BookingStatus.CANCELLED_BY_VENDOR ||
      booking.status === BookingStatus.CANCELLED_BY_CUSTOMER
    ) {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED_BY_CUSTOMER
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updated
    });
  } catch (error: any) {
    console.error('Cancel booking by customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveBookingByVendor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.vendorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to approve this booking' });
    }

    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({ error: 'Only pending bookings can be approved' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CONFIRMED
      }
    });

    res.json({
      message: 'Booking approved successfully',
      booking: updated
    });
  } catch (error: any) {
    console.error('Approve booking by vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
