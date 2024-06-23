const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Seed Groups
    const group1 = await prisma.group.create({
        data: {
            name: 'Group 1',
        },
    });

    const group2 = await prisma.group.create({
        data: {
            name: 'Group 2',
        },
    });

    // Seed Users
    const user1 = await prisma.user.create({
        data: {
            username: 'user1',
            email: 'user1@example.com',
            userGroups: {
                create: {
                    group: {
                        connect: { id: group1.id },
                    },
                },
            },
        },
    });

    const user2 = await prisma.user.create({
        data: {
            username: 'user2',
            email: 'user2@example.com',
            userGroups: {
                create: {
                    group: {
                        connect: { id: group2.id },
                    },
                },
            },
        },
    });

    const user3 = await prisma.user.create({
        data: {
            username: 'user3',
            email: 'user3@example.com',
            userGroups: {
                create: {
                    group: {
                        connect: { id: group1.id },
                    },
                },
            },
        },
    });

    console.log({ group1, group2, user1, user2, user3 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
