import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalProperties,
      pendingProperties,
      approvedProperties,
      recentProperties,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.property.count({ where: { status: 'APPROVED' } }),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          location: true
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProperties,
        pendingProperties,
        approvedProperties
      },
      recentProperties,
      recentUsers
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, role } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: { properties: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error: any) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

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
          owner: {
            select: {
              id: true,
              name: true,
              email: true
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
    console.error('Get all properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        images: true,
        location: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Property approved successfully',
      property
    });
  } catch (error: any) {
    console.error('Approve property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        images: true,
        location: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Property rejected successfully',
      property
    });
  } catch (error: any) {
    console.error('Reject property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const [
      propertiesByType,
      propertiesByPurpose,
      propertiesByCity,
      monthlyProperties
    ] = await Promise.all([
      prisma.property.groupBy({
        by: ['propertyType'],
        _count: true,
        where: { status: 'APPROVED' }
      }),
      prisma.property.groupBy({
        by: ['purpose'],
        _count: true,
        where: { status: 'APPROVED' }
      }),
      prisma.property.findMany({
        where: { status: 'APPROVED' },
        include: {
          location: {
            select: { city: true }
          }
        }
      }),
      prisma.property.findMany({
        where: { status: 'APPROVED' },
        select: {
          createdAt: true
        }
      })
    ]);

    // Group by city
    const cityStats: Record<string, number> = {};
    propertiesByCity.forEach(prop => {
      const city = prop.location?.city || 'Unknown';
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    // Group by month
    const monthlyStats: Record<string, number> = {};
    monthlyProperties.forEach(prop => {
      const month = new Date(prop.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    res.json({
      propertiesByType,
      propertiesByPurpose,
      propertiesByCity: Object.entries(cityStats).map(([city, count]) => ({ city, count })),
      monthlyProperties: Object.entries(monthlyStats).map(([month, count]) => ({ month, count }))
    });
  } catch (error: any) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

