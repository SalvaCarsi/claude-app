import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("pppppp", 10);

  await prisma.user.upsert({
    where: { email: "ppp@ppp.ppp" },
    update: { password: hashedPassword },
    create: {
      email: "ppp@ppp.ppp",
      password: hashedPassword,
    },
  });

  console.log("Seed completado: usuario ppp@ppp.ppp creado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
