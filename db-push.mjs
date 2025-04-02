import { exec } from 'child_process';

// Define the DATABASE_URL as an environment variable for the command
const databaseUrl = 'postgresql://car-rent_owner:npg_o2VYey1tzUXS@ep-billowing-art-ab1nuveo-pooler.eu-west-2.aws.neon.tech/car-rent?sslmode=require';

// Run prisma db push with the correct DATABASE_URL
const command = `DATABASE_URL="${databaseUrl}" npx prisma db push`;

console.log('Running command:', command);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Command stderr: ${stderr}`);
  }
  console.log(`Command stdout: ${stdout}`);
  
  // If successful, also run the seed
  console.log('Database schema pushed successfully. Running seed...');
  const seedCommand = `DATABASE_URL="${databaseUrl}" node prisma/seed.mjs`;
  
  exec(seedCommand, (seedError, seedStdout, seedStderr) => {
    if (seedError) {
      console.error(`Error executing seed: ${seedError.message}`);
      return;
    }
    if (seedStderr) {
      console.error(`Seed stderr: ${seedStderr}`);
    }
    console.log(`Seed stdout: ${seedStdout}`);
  });
});