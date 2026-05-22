import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting initialization...');

  // Create admin user
  const adminEmail = 'admin@property.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        phone: '9800000000',
        role: 'ADMIN',
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      }
    });
    console.log('✅ Admin user created:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  }

  // Create vendor user
  const vendorEmail = 'vendor@property.com';
  const vendorPassword = 'vendor123';

  const existingVendor = await prisma.user.findUnique({
    where: { email: vendorEmail }
  });

  if (existingVendor) {
    console.log('✅ Vendor user already exists');
  } else {
    const hashedPassword = await bcrypt.hash(vendorPassword, 10);
    const vendor = await prisma.user.create({
      data: {
        name: 'Vendor User',
        email: vendorEmail,
        password: hashedPassword,
        phone: '9800000001',
        role: 'VENDOR',
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      }
    });
    console.log('✅ Vendor user created:');
    console.log(`   Email: ${vendorEmail}`);
    console.log(`   Password: ${vendorPassword}`);
  }

  // Create customer
  const customerEmail = 'customer@property.com';
  const customerPassword = 'customer123';

  const existingCustomer = await prisma.user.findUnique({
    where: { email: customerEmail }
  });

  if (existingCustomer) {
    console.log('✅ Customer user already exists');
  } else {
    const hashedPassword = await bcrypt.hash(customerPassword, 10);
    const customer = await prisma.user.create({
      data: {
        name: 'Customer user',
        email: customerEmail,
        password: hashedPassword,
        phone: '9800000002',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      }
    });
    console.log('✅ Customer user created:');
    console.log(`   Email: ${customerEmail}`);
    console.log(`   Password: ${customerPassword}`);
  }

  // Create initial site settings
  const existingSettings = await prisma.siteSetting.findFirst();
  if (!existingSettings) {
    await prisma.siteSetting.create({
      data: {
        appName: 'PropertyRental',
        logo: null,
        footerText: 'Your one-stop destination for finding the perfect property. Buy, rent, and manage properties with ease.',
        copyrightText: `© ${new Date().getFullYear()} PropertyRental. All rights reserved.`,
        contactEmail: 'support@propertyrental.com',
        contactPhone: '+977-1-4444444',
        address: 'Kathmandu, Nepal'
      }
    });
    console.log('✅ Initial site settings created');
  } else {
    console.log('✅ Site settings already exist');
  }


  console.log('\n  Initialization complete!');
  console.log('    Start the server: npm run dev / pnpm dev');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

