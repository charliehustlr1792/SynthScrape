require("dotenv/config");
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function fetchClerkUserIds() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is missing in the environment.");
  }

  const limit = 100;
  let offset = 0;
  const userIds = [];

  while (true) {
    const url = `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Clerk API error ${response.status}: ${message}`);
    }

    const users = await response.json();
    if (!Array.isArray(users) || users.length === 0) {
      break;
    }

    for (const user of users) {
      if (user && typeof user.id === "string") {
        userIds.push(user.id);
      }
    }

    offset += limit;
  }

  return userIds;
}

async function main() {
  const amount = 1000;
  const add = process.argv.includes("--add");
  const fromClerk = process.argv.includes("--from-clerk");

  if (fromClerk) {
    const userIds = await fetchClerkUserIds();
    if (userIds.length === 0) {
      console.log("No Clerk users found.");
      return;
    }

    if (add) {
      const created = await prisma.userBalance.createMany({
        data: userIds.map((userId) => ({ userId, credits: amount })),
        skipDuplicates: true,
      });
      const updated = await prisma.userBalance.updateMany({
        where: { userId: { in: userIds } },
        data: { credits: { increment: amount } },
      });

      console.log(
        `Incremented ${amount} credits for ${updated.count} Clerk users; created ${created.count} new balances.`
      );
      return;
    }

    const updated = await prisma.userBalance.updateMany({
      where: { userId: { in: userIds } },
      data: { credits: amount },
    });
    const created = await prisma.userBalance.createMany({
      data: userIds.map((userId) => ({ userId, credits: amount })),
      skipDuplicates: true,
    });

    console.log(
      `Set credits to ${amount} for ${updated.count} Clerk users; created ${created.count} new balances.`
    );
    return;
  }

  if (add) {
    const result = await prisma.userBalance.updateMany({
      data: {
        credits: { increment: amount },
      },
    });

    console.log(`Incremented ${amount} credits for ${result.count} users.`);
    return;
  }

  const result = await prisma.userBalance.updateMany({
    data: {
      credits: amount,
    },
  });

  console.log(`Set credits to ${amount} for ${result.count} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
