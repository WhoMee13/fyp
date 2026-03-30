import { Response } from 'express';
import { PrismaClient, VendorStatus } from '@prisma/client';
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
    const { page = '1', limit = '20', status, role, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

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

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const adminsCount = await prisma.user.count({
      where: { role: 'ADMIN', status: 'ACTIVE' }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.role === 'ADMIN' && role === 'USER' && adminsCount <= 1) {
      return res.status(400).json({ error: 'At least one active admin must remain' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { owner: { 
            name: { contains: search as string }
          }
        },
        { location: {
            city: { contains: search as string }
          }
        }
      ];
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

export const getVendorApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.vendorProfile.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get vendor applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveVendorApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await prisma.vendorProfile.update({
      where: { id },
      data: {
        status: VendorStatus.APPROVED
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'Vendor application approved successfully',
      profile
    });
  } catch (error: any) {
    console.error('Approve vendor application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectVendorApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await prisma.vendorProfile.update({
      where: { id },
      data: {
        status: VendorStatus.REJECTED
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'Vendor application rejected successfully',
      profile
    });
  } catch (error: any) {
    console.error('Reject vendor application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

