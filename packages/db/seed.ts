import { prisma } from './dist/index.js';

async function main() {
  await prisma.availableTrigger.createMany({
    data: [
      { id: 'webhook-trigger',  name: 'Webhook',     image: 'https://via.placeholder.com/150x150.png?text=Webhook' },
      { id: 'schedule-trigger', name: 'Schedule',    image: 'https://via.placeholder.com/150x150.png?text=Schedule' },
      { id: 'github-trigger',   name: 'GitHub Push', image: 'https://via.placeholder.com/150x150.png?text=GitHub' },
      { id: 'form-trigger',     name: 'Form Submit', image: 'https://via.placeholder.com/150x150.png?text=Form' },
    ],
    skipDuplicates: true,
  });

  await prisma.availableAction.createMany({
    data: [
      { id: 'mail-action',    name: 'Send Email',           image: 'https://via.placeholder.com/150x150.png?text=Email' },
      { id: 'solana-action',  name: 'Send Solana',          image: 'https://via.placeholder.com/150x150.png?text=Solana' },
      { id: 'slack-action',   name: 'Send Slack Message',   image: 'https://via.placeholder.com/150x150.png?text=Slack' },
      { id: 'discord-action', name: 'Send Discord Message', image: 'https://via.placeholder.com/150x150.png?text=Discord' },
      { id: 'http-action',    name: 'HTTP Request',         image: 'https://via.placeholder.com/150x150.png?text=HTTP' },
      { id: 'log-action',     name: 'Log to Console',       image: 'https://via.placeholder.com/150x150.png?text=Log' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded triggers and actions successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
