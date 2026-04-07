const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- TACTICAL SEED INITIALIZED ---');

  console.log('Available Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
  
  try {
    // 1. Clear existing data in correct order (Dependents first)
    console.log('Clearing old mission data...');
    // Use the model names exactly as they appear in the client
    if (prisma.alert) await prisma.alert.deleteMany();
    if (prisma.schedule) await prisma.schedule.deleteMany();
    if (prisma.device) await prisma.device.deleteMany();
    if (prisma.classroom) await prisma.classroom.deleteMany();
    if (prisma.user) await prisma.user.deleteMany();
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  }

  // 2. Create Tactical Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@smartcampus.ai',
      role: 'ADMIN',
      shiftStart: 0,
      shiftEnd: 23
    }
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Vance',
      email: 'sarah@smartcampus.ai',
      role: 'TEACHER',
      shiftStart: 9,
      shiftEnd: 17
    }
  });

  const smith = await prisma.user.create({
    data: {
      name: 'Officer Smith',
      email: 'smith@smartcampus.ai',
      role: 'GUARD',
      shiftStart: 0,
      shiftEnd: 23 // 24/7 Security for demo
    }
  });

  // 3. Create Tactical Sectors
  const p11 = await prisma.classroom.create({
    data: {
      name: 'P-11',
      type: 'CLASSROOM'
    }
  });

  const gate = await prisma.classroom.create({
    data: {
      name: 'MAIN_GATE',
      type: 'ENTRANCE'
    }
  });

  // 4. Create Tactical Nodes (Devices)
  const cam1 = await prisma.device.create({
    data: {
      name: 'CAM-01',
      category: 'CAMERA',
      status: 'ONLINE',
      classroomId: p11.id,
      locationDesc: 'Front view of Classroom P-11'
    }
  });

  const cam2 = await prisma.device.create({
    data: {
      name: 'CAM-02',
      category: 'CAMERA',
      status: 'ONLINE',
      classroomId: gate.id,
      locationDesc: 'Main Entrance Vehicle Checkpoint'
    }
  });

  // 5. Create Timetable Entry ( Sarah in P-11 )
  // Get current day from system
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = days[new Date().getDay()];

  await prisma.schedule.create({
    data: {
      classroomId: p11.id,
      teacherId: sarah.id,
      dayOfWeek: currentDay,
      startTime: '00:00', // Set to cover all day for testing
      endTime: '23:59'
    }
  });

  console.log('--- MISSION DATA DEPLOYED ---');
  console.log(`[USER] Admin: ${admin.id}`);
  console.log(`[USER] Teacher Sarah: ${sarah.id}`);
  console.log(`[USER] Guard Smith: ${smith.id}`);
  console.log(`[SECTOR] P-11: ${p11.id}`);
  console.log(`[NODE] CAM-01: ${cam1.id}`);
  console.log(`[NODE] CAM-02: ${cam2.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
