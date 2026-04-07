import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../controllers/classroom.controller';
import { getDevices, createDevice, updateDevice, deleteDevice } from '../controllers/device.controller';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { getSchedules, resolveCurrentTeacher, createSchedule, deleteSchedule } from '../controllers/schedule.controller';
import { getAlerts, updateAlertStatus } from '../controllers/alert.controller';
import { checkRole, requireAuth } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/login', login);

// Classroom Routes
router.get('/classrooms', requireAuth, getClassrooms);
router.post('/classrooms', checkRole(['admin', 'super_admin']), createClassroom);
router.put('/classrooms/:id', checkRole(['admin', 'super_admin']), updateClassroom);
router.delete('/classrooms/:id', checkRole(['super_admin']), deleteClassroom);

// Device Routes
router.get('/devices', requireAuth, getDevices);
router.post('/devices', checkRole(['admin', 'super_admin']), createDevice);
router.put('/devices/:id', checkRole(['admin', 'super_admin']), updateDevice);
router.delete('/devices/:id', checkRole(['super_admin']), deleteDevice);

// User Routes
router.get('/users', requireAuth, getUsers);
router.post('/users', checkRole(['admin', 'super_admin']), createUser);
router.put('/users/:id', checkRole(['admin', 'super_admin']), updateUser);
router.delete('/users/:id', checkRole(['super_admin']), deleteUser);

// Schedule Routes
router.get('/schedules', requireAuth, getSchedules);
router.get('/schedules/current-teacher', requireAuth, resolveCurrentTeacher);
router.post('/schedules', checkRole(['admin', 'super_admin']), createSchedule);
router.delete('/schedules/:id', checkRole(['super_admin']), deleteSchedule);

// Alert Routes
router.get('/alerts', requireAuth, getAlerts);
router.patch('/alerts/:id/status', checkRole(['admin', 'super_admin']), updateAlertStatus);

export default router;
