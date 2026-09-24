import bcrypt from 'bcryptjs';
import prisma from './lib/prisma';

async function main() {
  const hashedPassword = await bcrypt.hash('clave123', 12);

  const adminUsers = [
    {
      email: 'admin@csam.edu',
      firstName: 'Profesor',
      lastName: 'Admin',
      nickname: 'Admin CSAM',
    },
    {
      email: 'csamtic2024@gmail.com',
      firstName: 'Profesor',
      lastName: 'TIC',
      nickname: 'Profe CSAM',
    },
  ];

  for (const adminData of adminUsers) {
    const existing = await prisma.user.findUnique({ where: { email: adminData.email } });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
          onboardingCompleted: true,
        },
      });
      console.log(`Updated existing user ${adminData.email} to ADMIN with password 'clave123'.`);
    } else {
      await prisma.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          nickname: adminData.nickname,
          year: 5,
          section: 'A',
          role: 'ADMIN',
          emailVerified: true,
          disclaimerAcceptedAt: new Date(),
          onboardingCompleted: true,
          preferences: {
            create: {
              participationMode: 'FULL',
              showScore: true,
              showInRanking: true,
              theme: 'DARK',
            },
          },
        },
      });
      console.log(`Created new ADMIN user ${adminData.email} with password 'clave123'.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
