import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Security helpers for seed
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'hex'
);
const HMAC_SECRET = process.env.HMAC_SECRET || 'unimarket-hmac-secret-for-hash-lookups-dev';

function encryptIdNumber(idNumber: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(idNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

function hashIdNumber(idNumber: string): string {
  return crypto.createHmac('sha256', HMAC_SECRET).update(idNumber.trim().toUpperCase()).digest('hex');
}

async function main() {
  console.log('🌱 Starting UniMarket Database Seed...');

  // 1. Clean existing records in reverse dependency order for idempotency
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.ratingReview.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.request.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userVerification.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records (idempotent reset).');

  // Prevent hardcoded demo password in production environments without explicit override
  if (process.env.NODE_ENV === 'production' && !process.env.DEMO_USER_PASSWORD) {
    throw new Error('DEMO_USER_PASSWORD environment variable must be explicitly defined in production');
  }
  const demoPassword = process.env.DEMO_USER_PASSWORD || 'Password123!';
  const defaultPasswordHash = await bcrypt.hash(demoPassword, 10);

  // 2. Create Users
  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aau.edu.et',
      phone: '+251900000001',
      passwordHash: defaultPasswordHash,
      firstName: 'Admin',
      lastName: 'Moderator',
      userType: 'staff',
      role: 'admin',
      verificationStatus: 'verified',
      profile: {
        create: {
          bio: 'Campus marketplace administration and student safety oversight.',
          address: 'AAU Main Campus, Sidist Kilo, Administration Building',
          averageRating: 5.0,
          totalRatings: 0,
        },
      },
    },
  });

  // Student 1: Abebe Bikila (AAU 4-Kilo Senior)
  const abebe = await prisma.user.create({
    data: {
      email: 'abebe.bikila@aau.edu.et',
      phone: '+251911223344',
      passwordHash: defaultPasswordHash,
      firstName: 'Abebe',
      lastName: 'Bikila',
      userType: 'student',
      role: 'user',
      verificationStatus: 'verified',
      profile: {
        create: {
          bio: '4th year Computer Science student at AAU 4-Kilo. Clean gadgets, academic books, and tech help.',
          address: 'AAU 4-Kilo Campus, Block 42, Room 302',
          averageRating: 4.9,
          totalRatings: 14,
          totalTransactions: 16,
          totalReviews: 14,
        },
      },
      verifications: {
        create: {
          type: 'student_id',
          idNumberEncrypted: encryptIdNumber('UGR/1234/14'),
          idNumberHash: hashIdNumber('UGR/1234/14'),
          universityCode: 'AAU',
          status: 'verified',
          documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Student 2: Chaltu Kebede (AAU 6-Kilo Software Eng)
  const chaltu = await prisma.user.create({
    data: {
      email: 'chaltu.kebede@aau.edu.et',
      phone: '+251922334455',
      passwordHash: defaultPasswordHash,
      firstName: 'Chaltu',
      lastName: 'Kebede',
      userType: 'student',
      role: 'user',
      verificationStatus: 'verified',
      profile: {
        create: {
          bio: 'Software Engineering student at 6-Kilo. Open to exchanging study guides and design equipment.',
          address: 'AAU 6-Kilo Campus, Dorm Block B',
          averageRating: 5.0,
          totalRatings: 9,
          totalTransactions: 10,
          totalReviews: 9,
        },
      },
      verifications: {
        create: {
          type: 'student_id',
          idNumberEncrypted: encryptIdNumber('ETR/5678/14'),
          idNumberHash: hashIdNumber('ETR/5678/14'),
          universityCode: 'AAU',
          status: 'verified',
          documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Service Provider: Tadesse Laptop & Mobile Repair
  const tadesse = await prisma.user.create({
    data: {
      email: 'tadesse.repair@gmail.com',
      phone: '+251933445566',
      passwordHash: defaultPasswordHash,
      firstName: 'Tadesse',
      lastName: 'Worku',
      userType: 'provider',
      role: 'user',
      verificationStatus: 'verified',
      profile: {
        create: {
          bio: 'Certified technician offering laptop repair, OS formatting, and phone screen replacements for students with student discounts.',
          address: 'King George VI St, Across AAU 6-Kilo Gate 2',
          averageRating: 4.8,
          totalRatings: 28,
          totalTransactions: 32,
          totalReviews: 28,
        },
      },
      verifications: {
        create: {
          type: 'business_license',
          idNumberEncrypted: encryptIdNumber('BL-AA-998877'),
          idNumberHash: hashIdNumber('BL-AA-998877'),
          businessName: 'Tadesse Tech & Electronics Repair',
          businessCategory: 'Electronics & Repairs',
          status: 'verified',
          documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Unverified Student: Dawit Alemu (Freshman)
  const dawit = await prisma.user.create({
    data: {
      email: 'dawit.alemu@aau.edu.et',
      phone: '+251944556677',
      passwordHash: defaultPasswordHash,
      firstName: 'Dawit',
      lastName: 'Alemu',
      userType: 'student',
      role: 'user',
      verificationStatus: 'unverified',
      profile: {
        create: {
          bio: '1st year pre-engineering student looking to get set up on campus.',
          address: 'AAU Freshmen Dorms',
        },
      },
    },
  });

  // Pending Verification Student: Hiwot Tsegaye (For Admin review demo)
  const hiwot = await prisma.user.create({
    data: {
      email: 'hiwot.tsegaye@aau.edu.et',
      phone: '+251955667788',
      passwordHash: defaultPasswordHash,
      firstName: 'Hiwot',
      lastName: 'Tsegaye',
      userType: 'student',
      role: 'user',
      verificationStatus: 'pending',
      profile: {
        create: {
          bio: 'Economics department, 2nd year. Campus book club coordinator.',
          address: 'AAU Sidist Kilo Campus',
        },
      },
      verifications: {
        create: {
          type: 'student_id',
          idNumberEncrypted: encryptIdNumber('ECN/8899/15'),
          idNumberHash: hashIdNumber('ECN/8899/15'),
          universityCode: 'AAU',
          status: 'pending',
          documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
        },
      },
    },
  });

  console.log('👥 Created 6 demo users (Admin, Abebe, Chaltu, Tadesse, Dawit, Hiwot).');

  // 3. Create Sample Listings across ALL 7 transaction types
  const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  // Type 1: SELL - Scientific Calculator
  const listingCasio = await prisma.listing.create({
    data: {
      createdById: abebe.id,
      title: 'Original Casio fx-991EX ClassWiz Scientific Calculator',
      description: 'Barely used genuine Casio ClassWiz calculator. Ideal for engineering, math, and physics courses. High-resolution spreadsheet display and solar dual power.',
      category: 'Electronics',
      transactionType: 'sell',
      price: 1850.00,
      currency: 'ETB',
      quantityAvailable: 1,
      images: [
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600',
        'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600',
      ],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 4-Kilo Science Library entrance',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 1: SELL - Textbook
  const listingCLRS = await prisma.listing.create({
    data: {
      createdById: abebe.id,
      title: 'Introduction to Algorithms (CLRS 3rd Edition) - Hardcover',
      description: 'Comprehensive computer science textbook. Clean pages with minimal pencil underlines. Essential for DSA and competitive programming.',
      category: 'Academic Books',
      transactionType: 'sell',
      price: 1200.00,
      currency: 'ETB',
      quantityAvailable: 1,
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 4-Kilo Department of Computer Science',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 1: SELL - Dorm Essential
  const listingStove = await prisma.listing.create({
    data: {
      createdById: chaltu.id,
      title: 'Single Coil Mini Electric Stove (Mitchad) - 1000W',
      description: 'Compact reliable electric hot plate for boiling water, tea, and quick meals. Energy efficient and tested safe.',
      category: 'Dorm Essentials',
      transactionType: 'sell',
      price: 950.00,
      currency: 'ETB',
      quantityAvailable: 2,
      images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 6-Kilo Dormitory Gate',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 2: RENT - Stationery / Architecture drafting set
  const listingDrawingSet = await prisma.listing.create({
    data: {
      createdById: chaltu.id,
      title: 'Rotring Engineering Drawing Board (A3) + T-Square & Set Squares',
      description: 'Complete architecture/engineering drafting board with clamp system and set squares. Available for semester rental or outright sale.',
      category: 'Stationery',
      transactionType: 'rent',
      price: 450.00,
      currency: 'ETB',
      quantityAvailable: 1,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 6-Kilo Engineering Building',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 3: LEND - Study Lamp
  const listingDormLend = await prisma.listing.create({
    data: {
      createdById: abebe.id,
      title: 'LED Rechargeable Study Desk Lamp (USB-C Rechargeable)',
      description: 'Lending my spare study lamp for exam week. 3 color temperatures, lasts 8 hours during power outages.',
      category: 'Dorm Essentials',
      transactionType: 'lend',
      price: 0.00,
      currency: 'ETB',
      quantityAvailable: 1,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 4-Kilo Campus',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 4: SERVICE - Laptop diagnostics & OS install
  const listingRepairService = await prisma.listing.create({
    data: {
      createdById: tadesse.id,
      title: 'Student Laptop Diagnostics, Thermal Paste & Clean Windows Install',
      description: 'Full hardware maintenance, fan dust cleaning, Arctic MX-4 thermal paste re-application, and genuine Windows 11 / Ubuntu dual boot configuration with student ID discount.',
      category: 'Services',
      transactionType: 'service',
      price: 500.00,
      currency: 'ETB',
      quantityAvailable: 10,
      images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: '6-Kilo, Next to Commercial Bank of Ethiopia',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 5: EXCHANGE - Mechanical Keyboard for Type-C Multiport Hub
  const listingExchange = await prisma.listing.create({
    data: {
      createdById: chaltu.id,
      title: 'Redragon Mechanical Keyboard (Blue Switches) - Exchange for Type-C Hub',
      description: 'Tactile RGB mechanical keyboard in excellent condition. Looking to exchange for an Anker or Baseus multi-port USB-C / HDMI hub for my MacBook.',
      category: 'Electronics',
      transactionType: 'exchange',
      price: 0.00,
      currency: 'ETB',
      quantityAvailable: 1,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 6-Kilo Software Engineering Lab',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 6: FOOD - Fresh Dorm Shiro & Teff Injera Weekly Bundle
  const listingFood = await prisma.listing.create({
    data: {
      createdById: abebe.id,
      title: 'Fresh Campus Dorm Shiro & Teff Injera Weekly Pack',
      description: 'Aromatic home-prepared spiced berbere shiro powder pack and 10 fresh teff injera delivered directly to AAU 4-Kilo or 6-Kilo dormitory gates every Monday.',
      category: 'Food & Groceries',
      transactionType: 'food',
      price: 350.00,
      currency: 'ETB',
      quantityAvailable: 5,
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 4-Kilo Main Gate',
      expiresAt: sixtyDaysLater,
    },
  });

  // Type 7: TRANSPORT - Morning Campus Ride Share
  const listingTransport = await prisma.listing.create({
    data: {
      createdById: abebe.id,
      title: 'Morning Campus Ride Share: 6-Kilo to 4-Kilo / Sidist Kilo',
      description: 'Shared taxi/bajaj cost split every weekday morning at 7:45 AM sharp from 6-Kilo dorm gate to Sidist Kilo and 4-Kilo campuses. Reliable, fast, and student-budget friendly.',
      category: 'Transport',
      transactionType: 'transport',
      price: 25.00,
      currency: 'ETB',
      quantityAvailable: 3,
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600'],
      availabilityStatus: 'available',
      status: 'active',
      address: 'AAU 6-Kilo Main Gate',
      expiresAt: sixtyDaysLater,
    },
  });

  console.log('📦 Created 9 campus marketplace listings covering ALL 7 transaction types (sell, rent, lend, service, exchange, food, transport).');

  // 4. Create Buyer Demands / Requests (Product, Service, Exchange)
  const requestBooks = await prisma.request.create({
    data: {
      createdById: chaltu.id,
      title: 'Looking for Gilbert Strang: Linear Algebra and Its Applications',
      description: 'Need textbook for Applied Mathematics course. Physical copy preferred, 4th edition.',
      category: 'Academic Books',
      type: 'product',
      budgetMin: 500.00,
      budgetMax: 1000.00,
      address: 'AAU 6-Kilo Campus',
    },
  });

  const requestTutoring = await prisma.request.create({
    data: {
      createdById: dawit.id,
      title: 'Need 2-week tutoring for C++ Object Oriented Programming',
      description: 'Freshman struggling with pointers, references, and OOP basics. Looking for an upperclassman tutor for 3 sessions a week.',
      category: 'Services',
      type: 'service',
      budgetMin: 800.00,
      budgetMax: 1500.00,
      address: 'AAU Main Library Sidist Kilo',
    },
  });

  const requestExchange = await prisma.request.create({
    data: {
      createdById: abebe.id,
      title: 'Exchange: 2nd Year Electrical Engineering Textbooks for Arduino Starter Kit',
      description: 'Have circuits and signals textbooks in great condition. Looking for an Arduino Uno or sensor starter kit for semester project.',
      category: 'Academic Books',
      type: 'exchange',
      exchangeHave: 'Signals & Systems 2nd Edition Textbook and Digital Logic Design Notes',
      exchangeWant: 'Arduino Uno R3 starter kit with breadboard, sensors, and jumper wires',
      address: 'AAU 4-Kilo Department of Electrical and Computer Engineering',
    },
  });

  console.log('🔍 Created student demand requests across product, service, and exchange types.');

  // 5. Create a Completed Deal with Two-Sided Confirmation, Telebirr Payment, and Mutual Reviews
  const completedDeal = await prisma.transaction.create({
    data: {
      listingId: listingCasio.id,
      buyerId: chaltu.id,
      sellerId: abebe.id,
      title: 'Original Casio fx-991EX ClassWiz Scientific Calculator',
      transactionType: 'sell',
      status: 'completed',
      amount: 1850.00,
      currency: 'ETB',
      quantity: 1,
      buyerConfirmed: true,
      sellerConfirmed: true,
      buyerConfirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      sellerConfirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiresAt: sixtyDaysLater,
      payment: {
        create: {
          method: 'transfer',
          status: 'recorded',
          notes: 'Telebirr transfer completed at handover.',
        },
      },
    },
  });

  // Post-deal Rating from Chaltu to Abebe
  await prisma.ratingReview.create({
    data: {
      transactionId: completedDeal.id,
      reviewerId: chaltu.id,
      revieweeId: abebe.id,
      rating: 5,
      comment: 'Excellent seller! The Casio calculator is 100% authentic and in mint condition. Met on time right outside the 4-Kilo library. Highly recommend!',
    },
  });

  // Post-deal Rating from Abebe to Chaltu
  await prisma.ratingReview.create({
    data: {
      transactionId: completedDeal.id,
      reviewerId: abebe.id,
      revieweeId: chaltu.id,
      rating: 5,
      comment: 'Very polite and punctual student buyer. Smooth Telebirr payment. A+ campus peer!',
    },
  });

  // 6. Create an Active (Pending) Transaction for Live Showcase
  const pendingDeal = await prisma.transaction.create({
    data: {
      listingId: listingCLRS.id,
      buyerId: chaltu.id,
      sellerId: abebe.id,
      title: 'Introduction to Algorithms (CLRS 3rd Edition) - Hardcover',
      transactionType: 'sell',
      status: 'pending',
      amount: 1200.00,
      currency: 'ETB',
      quantity: 1,
      buyerConfirmed: false,
      sellerConfirmed: false,
      expiresAt: sixtyDaysLater,
      notes: 'Meeting planned on Tuesday 4:00 PM at 4-Kilo Gate 1.',
    },
  });

  // 7. Create Messages (Chat Thread between Abebe and Chaltu for Polling Demo)
  await prisma.message.createMany({
    data: [
      {
        senderId: chaltu.id,
        recipientId: abebe.id,
        listingId: listingCLRS.id,
        transactionId: pendingDeal.id,
        content: 'Selam Abebe! Is the CLRS Algorithms book still available for 1,200 ETB?',
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        senderId: abebe.id,
        recipientId: chaltu.id,
        listingId: listingCLRS.id,
        transactionId: pendingDeal.id,
        content: 'Selam Chaltu! Yes, it is available. I kept it in pristine condition.',
        isRead: true,
        createdAt: new Date(Date.now() - 50 * 60 * 1000),
      },
      {
        senderId: chaltu.id,
        recipientId: abebe.id,
        listingId: listingCLRS.id,
        transactionId: pendingDeal.id,
        content: 'Awesome. Can we meet tomorrow afternoon near the 4-Kilo CS department?',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  });

  // 8. Create a Sample Report for Admin Moderation Demo
  await prisma.report.create({
    data: {
      reporterId: abebe.id,
      reportType: 'user',
      targetId: dawit.id,
      category: 'spam',
      description: 'Account sent duplicate spam inquiries about electronics across multiple posts.',
      status: 'submitted',
    },
  });

  // 9. Create an Admin Audit Log Entry
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'PLATFORM',
      targetId: admin.id,
      details: { environment: 'development', version: '1.0.0-mvp' },
    },
  });

  console.log('✅ UniMarket Database Seed completed successfully!');
  console.log('\n--- DEMO CREDENTIALS ---');
  console.log(`Default Password: ${demoPassword}`);
  console.log('1. Admin:    admin@aau.edu.et          (Campus Administrator)');
  console.log('2. Student:  abebe.bikila@aau.edu.et   (Verified Seller, AAU 4-Kilo)');
  console.log('3. Student:  chaltu.kebede@aau.edu.et  (Verified Buyer, AAU 6-Kilo)');
  console.log('4. Provider: tadesse.repair@gmail.com  (Verified Laptop Technician)');
  console.log('5. Student:  dawit.alemu@aau.edu.et    (Unverified Freshman)');
  console.log('6. Student:  hiwot.tsegaye@aau.edu.et  (Pending ID Verification)');
  console.log('------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
