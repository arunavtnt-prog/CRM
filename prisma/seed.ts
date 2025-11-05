import { PrismaClient, UserRole, CreatorStatus, CampaignStatus, DealStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@wavelaunch.test',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create operator user
  const operatorUser = await prisma.user.create({
    data: {
      email: 'operator@wavelaunch.test',
      name: 'Operator User',
      passwordHash: hashedPassword,
      role: UserRole.OPERATOR,
    },
  });

  console.log('✅ Created operator user:', operatorUser.email);

  // Create 10 sample creators
  const creatorsData = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0101',
      instagramHandle: '@sarahj',
      tiktokHandle: '@sarahj_official',
      youtubeHandle: '@SarahJohnson',
      status: CreatorStatus.ACTIVE,
      notes: 'Fashion and lifestyle influencer with 500k followers',
      ownerId: adminUser.id,
    },
    {
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1-555-0102',
      instagramHandle: '@mikechen',
      tiktokHandle: '@mikechenofficial',
      youtubeHandle: '@MikeChenTV',
      status: CreatorStatus.ACTIVE,
      notes: 'Tech reviewer and gadget enthusiast',
      ownerId: operatorUser.id,
    },
    {
      name: 'Emma Rodriguez',
      email: 'emma.r@email.com',
      phone: '+1-555-0103',
      instagramHandle: '@emmarodriguez',
      tiktokHandle: '@emma_r',
      status: CreatorStatus.ACTIVE,
      notes: 'Beauty and makeup artist with strong engagement',
      ownerId: adminUser.id,
    },
    {
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1-555-0104',
      instagramHandle: '@davidkim',
      youtubeHandle: '@DavidKimFitness',
      status: CreatorStatus.ACTIVE,
      notes: 'Fitness coach and nutritionist',
      ownerId: operatorUser.id,
    },
    {
      name: 'Lisa Thompson',
      email: 'lisa.t@email.com',
      phone: '+1-555-0105',
      instagramHandle: '@lisathompson',
      tiktokHandle: '@lisa_thompson',
      status: CreatorStatus.PENDING,
      notes: 'Food blogger, pending contract review',
      ownerId: adminUser.id,
    },
    {
      name: 'James Wilson',
      email: 'james.w@email.com',
      phone: '+1-555-0106',
      instagramHandle: '@jameswilson',
      youtubeHandle: '@JamesWilsonTravel',
      status: CreatorStatus.ACTIVE,
      notes: 'Travel vlogger with global audience',
      ownerId: operatorUser.id,
    },
    {
      name: 'Maria Garcia',
      email: 'maria.g@email.com',
      phone: '+1-555-0107',
      instagramHandle: '@mariagarcia',
      tiktokHandle: '@maria_garcia',
      status: CreatorStatus.ACTIVE,
      notes: 'Parenting and family content creator',
      ownerId: adminUser.id,
    },
    {
      name: 'Alex Turner',
      email: 'alex.t@email.com',
      phone: '+1-555-0108',
      instagramHandle: '@alexturner',
      youtubeHandle: '@AlexTurnerGaming',
      status: CreatorStatus.INACTIVE,
      notes: 'Gaming streamer, currently on hiatus',
      ownerId: operatorUser.id,
    },
    {
      name: 'Sophie Anderson',
      email: 'sophie.a@email.com',
      phone: '+1-555-0109',
      instagramHandle: '@sophieanderson',
      tiktokHandle: '@sophie_a',
      status: CreatorStatus.ACTIVE,
      notes: 'Home decor and DIY expert',
      ownerId: adminUser.id,
    },
    {
      name: 'Ryan Martinez',
      email: 'ryan.m@email.com',
      phone: '+1-555-0110',
      instagramHandle: '@ryanmartinez',
      youtubeHandle: '@RyanMartinezMusic',
      status: CreatorStatus.ACTIVE,
      notes: 'Music producer and songwriter',
      ownerId: operatorUser.id,
    },
  ];

  const creators = await Promise.all(
    creatorsData.map((data) => prisma.creator.create({ data }))
  );

  console.log('✅ Created 10 sample creators');

  // Create 3 sample campaigns
  const campaignsData = [
    {
      title: 'Summer Fashion Launch 2024',
      brand: 'Luxe Apparel',
      description: 'Promoting new summer collection with focus on sustainable fashion',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      budget: 50000,
      status: CampaignStatus.ACTIVE,
    },
    {
      title: 'Tech Product Launch - SmartWatch Pro',
      brand: 'TechGear Inc',
      description: 'Launch campaign for new smartwatch targeting fitness enthusiasts',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-09-15'),
      budget: 75000,
      status: CampaignStatus.PLANNING,
    },
    {
      title: 'Holiday Beauty Collection',
      brand: 'Glamour Cosmetics',
      description: 'Holiday season makeup and skincare promotion',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-31'),
      budget: 60000,
      status: CampaignStatus.PLANNING,
    },
  ];

  const campaigns = await Promise.all(
    campaignsData.map((data) => prisma.campaign.create({ data }))
  );

  console.log('✅ Created 3 sample campaigns');

  // Create sample deals connecting campaigns and creators
  const dealsData = [
    {
      campaignId: campaigns[0].id,
      creatorId: creators[0].id,
      value: 5000,
      status: DealStatus.SIGNED,
      signedAt: new Date('2024-05-15'),
      notes: '3 Instagram posts + 2 stories',
    },
    {
      campaignId: campaigns[0].id,
      creatorId: creators[2].id,
      value: 4500,
      status: DealStatus.ACTIVE,
      signedAt: new Date('2024-05-20'),
      notes: '2 Instagram posts + 1 reel',
    },
    {
      campaignId: campaigns[1].id,
      creatorId: creators[1].id,
      value: 7500,
      status: DealStatus.NEGOTIATING,
      notes: 'YouTube review video + unboxing',
    },
    {
      campaignId: campaigns[1].id,
      creatorId: creators[3].id,
      value: 6000,
      status: DealStatus.PENDING,
      notes: 'Fitness challenge featuring the smartwatch',
    },
    {
      campaignId: campaigns[2].id,
      creatorId: creators[2].id,
      value: 5500,
      status: DealStatus.PENDING,
      notes: 'Holiday makeup tutorial series',
    },
  ];

  const deals = await Promise.all(
    dealsData.map((data) => prisma.deal.create({ data }))
  );

  console.log('✅ Created 5 sample deals');

  // Create some activity logs
  const activitiesData = [
    {
      userId: adminUser.id,
      action: 'created',
      entity: 'creator',
      entityId: creators[0].id,
      details: `Created creator: ${creators[0].name}`,
    },
    {
      userId: adminUser.id,
      action: 'created',
      entity: 'campaign',
      entityId: campaigns[0].id,
      details: `Created campaign: ${campaigns[0].title}`,
    },
    {
      userId: operatorUser.id,
      action: 'updated',
      entity: 'deal',
      entityId: deals[0].id,
      details: `Updated deal status to SIGNED`,
    },
  ];

  await Promise.all(
    activitiesData.map((data) => prisma.activity.create({ data }))
  );

  console.log('✅ Created sample activities');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin:');
  console.log('  Email: admin@wavelaunch.test');
  console.log('  Password: Test1234!');
  console.log('\nOperator:');
  console.log('  Email: operator@wavelaunch.test');
  console.log('  Password: Test1234!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
