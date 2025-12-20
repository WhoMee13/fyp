import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const NEPAL_LOCATIONS = [
  {
    city: 'Kathmandu',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.7172,
    longitude: 85.3240
  },
  {
    city: 'Pokhara',
    state: 'Gandaki',
    country: 'Nepal',
    latitude: 28.2096,
    longitude: 83.9856
  },
  {
    city: 'Lalitpur',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.6710,
    longitude: 85.3258
  },
  {
    city: 'Bharatpur',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.6783,
    longitude: 84.4349
  },
  {
    city: 'Biratnagar',
    state: 'Koshi',
    country: 'Nepal',
    latitude: 26.4525,
    longitude: 87.2718
  },
  {
    city: 'Birgunj',
    state: 'Madhesh',
    country: 'Nepal',
    latitude: 27.0000,
    longitude: 84.8667
  },
  {
    city: 'Butwal',
    state: 'Lumbini',
    country: 'Nepal',
    latitude: 27.7000,
    longitude: 83.4500
  },
  {
    city: 'Dharan',
    state: 'Koshi',
    country: 'Nepal',
    latitude: 26.8147,
    longitude: 87.2845
  },
  {
    city: 'Hetauda',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.4283,
    longitude: 85.0322
  },
  {
    city: 'Janakpur',
    state: 'Madhesh',
    country: 'Nepal',
    latitude: 26.7288,
    longitude: 85.9254
  },
  {
    city: 'Nepalgunj',
    state: 'Lumbini',
    country: 'Nepal',
    latitude: 28.0500,
    longitude: 81.6167
  },
  {
    city: 'Itahari',
    state: 'Koshi',
    country: 'Nepal',
    latitude: 26.6667,
    longitude: 87.2833
  },
  {
    city: 'Bhaktapur',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.6710,
    longitude: 85.4298
  },
  {
    city: 'Dhulikhel',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.6167,
    longitude: 85.5500
  },
  {
    city: 'Chitwan',
    state: 'Bagmati',
    country: 'Nepal',
    latitude: 27.5292,
    longitude: 84.3542
  }
];

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
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('✅ Admin user created:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  }

  // Note: Locations are stored per property, so we don't create a separate locations table
  // This is just for reference - locations will be created when properties are added
  console.log('✅ Nepal locations reference data ready');
  console.log(`   ${NEPAL_LOCATIONS.length} locations available`);

  console.log('\n✨ Initialization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run migrations: npx prisma migrate dev');
  console.log('   2. Start the server: npm run dev');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

