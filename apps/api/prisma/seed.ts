import { PrismaClient, DeviceCategory, DeviceStatus, DayOfWeek, RoomType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING AUTOMATED SURVEILLANCE INITIALIZATION (V2) ---');

  // 1. Initialize Tactical Sectors (Classrooms)
  const sectors = [
    { name: 'P-11 Classroom', type: RoomType.CLASSROOM },
    { name: 'Laboratory 04', type: RoomType.LAB },
    { name: 'West Parking Zone', type: RoomType.PARKING },
    { name: 'Security Office', type: RoomType.OFFICE },
    { name: 'Main Gate Alpha', type: RoomType.ENTRANCE },
  ];

  for (const s of sectors) {
    await (prisma as any).classroom.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }
  console.log(`[+] SEEDED ${sectors.length} TACTICAL SECTORS`);

  const p11Classroom = await (prisma as any).classroom.findUnique({ where: { name: 'P-11 Classroom' } });
  const entrance = await (prisma as any).classroom.findUnique({ where: { name: 'Main Gate Alpha' } });

  // 2. Enlist Mission Personnel (Users)
  const users = [
    { 
      name: 'Dr. Sarah Vance', 
      email: 's.vance@smartcampus.ai', 
      role: UserRole.TEACHER,
      shiftStart: 8,
      shiftEnd: 18
    },
    { 
      name: 'Officer Smith', 
      email: 'smith@security.ai', 
      role: UserRole.GUARD, // Align with schema UserRole
      shiftStart: 8, 
      shiftEnd: 16 
    },
    { 
      name: 'Admin Command', 
      email: 'admin@smartcampus.ai', 
      role: UserRole.ADMIN,
      shiftStart: 0,
      shiftEnd: 23
    },
  ];

  for (const u of users) {
    await (prisma as any).user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }
  console.log(`[+] ENLISTED ${users.length} PERSONNEL NODES`);

  const sarah = await (prisma as any).user.findUnique({ where: { email: 's.vance@smartcampus.ai' } });

  // 3. Automated Surveillance Nodes (Devices)
  await (prisma as any).device.deleteMany({});
  
  if (p11Classroom && entrance) {
    const devices = [
      {
        name: 'CAM-01 (Classroom)',
        status: DeviceStatus.ONLINE,
        category: DeviceCategory.CAMERA,
        classroomId: p11Classroom.id,
        streamUrl: 'rtsp://internal/cam01',
        ipAddress: '192.168.1.101',
      },
      {
        name: 'CAM-02 (Entrance)',
        status: DeviceStatus.ONLINE,
        category: DeviceCategory.CAMERA,
        classroomId: entrance.id,
        streamUrl: 'rtsp://internal/cam02',
        ipAddress: '192.168.1.102',
      },
    ];

    for (const d of devices) {
      await (prisma as any).device.create({ data: d });
    }
    console.log(`[+] DEPLOYED ${devices.length} SURVEILLANCE NODES`);
  }

  // 4. Tactical Scheduling Synchronization (Assign Sarah to P-11)
  if (sarah && p11Classroom) {
    await (prisma as any).schedule.upsert({
      where: { 
        classroomId_dayOfWeek_startTime: {
          classroomId: p11Classroom.id,
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '08:00',
        }
      },
      update: {},
      create: {
        teacherId: sarah.id,
        classroomId: p11Classroom.id,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '18:00',
      }
    });
    console.log('[+] SYNCHRONIZED TACTICAL SCHEDULE FOR AUTOMATED ROUTING');
  }

  console.log('--- SURVEILLANCE REGISTRY INITIALIZED ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
