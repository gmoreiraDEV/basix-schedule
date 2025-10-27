import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo",
      active: true,
    },
  })

  console.log("✅ Created organization:", org.name)

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@basix.com" },
    update: {},
    create: {
      email: "admin@basix.com",
      password: hashedPassword,
      name: "Administrador",
      role: "owner",
      organizationId: org.id,
    },
  })

  console.log("✅ Created admin user:", admin.email)

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Corte de Cabelo",
        description: "Corte masculino ou feminino",
        duration: 30,
        price: 50.0,
        organizationId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: "Barba",
        description: "Aparar e modelar barba",
        duration: 20,
        price: 30.0,
        organizationId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: "Coloração",
        description: "Coloração completa",
        duration: 90,
        price: 150.0,
        organizationId: org.id,
      },
    }),
  ])

  console.log("✅ Created", services.length, "services")

  // Create professionals
  const professionals = await Promise.all([
    prisma.professional.create({
      data: {
        name: "João Silva",
        email: "joao@basix.com",
        phone: "(11) 98765-4321",
        organizationId: org.id,
      },
    }),
    prisma.professional.create({
      data: {
        name: "Maria Santos",
        email: "maria@basix.com",
        phone: "(11) 98765-4322",
        organizationId: org.id,
      },
    }),
  ])

  console.log("✅ Created", professionals.length, "professionals")

  // Associate services with professionals
  await prisma.serviceProfessional.createMany({
    data: [
      { serviceId: services[0].id, professionalId: professionals[0].id },
      { serviceId: services[1].id, professionalId: professionals[0].id },
      { serviceId: services[0].id, professionalId: professionals[1].id },
      { serviceId: services[2].id, professionalId: professionals[1].id },
    ],
  })

  console.log("✅ Associated services with professionals")

  // Create schedule rules
  const scheduleRules = []
  for (const professional of professionals) {
    // Monday to Friday, 9am to 6pm
    for (let day = 1; day <= 5; day++) {
      scheduleRules.push({
        professionalId: professional.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
      })
    }
  }

  await prisma.scheduleRule.createMany({
    data: scheduleRules,
  })

  console.log("✅ Created", scheduleRules.length, "schedule rules")

  // Create API key
  const apiKey = await prisma.apiKey.create({
    data: {
      name: "Demo API Key",
      key: `bsk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      organizationId: org.id,
    },
  })

  console.log("✅ Created API key:", apiKey.key)

  console.log("\n🎉 Database seeded successfully!")
  console.log("\n📝 Login credentials:")
  console.log("   Email: admin@basix.com")
  console.log("   Password: admin123")
  console.log("\n🔑 API Key:", apiKey.key)
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
