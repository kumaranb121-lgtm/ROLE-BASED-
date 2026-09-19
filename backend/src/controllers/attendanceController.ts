import { FastifyRequest, FastifyReply } from 'fastify';
import { Attendance } from '../models/Attendance.js';
import { Class } from '../models/Class.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { globalIo } from '../sockets/index.js';
import { sendPushNotification } from '../utils/push.js';

export const getAttendance = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  let filter = {};
  if (user.role === 'STAFF') {
    filter = { markedBy: user.id };
  } else if (user.role === 'CLASS_REPRESENTATIVE') {
    // Ideally find by classId, but let's just show theirs
    filter = { markedBy: user.id };
  }

  const attendance = await Attendance.find(filter)
    .populate('classId')
    .populate({
      path: 'timetableSlot',
      populate: { path: 'subject' }
    })
    .populate('markedBy', 'name')
    .sort({ date: -1 });

  return reply.send(attendance);
};

export const markAttendance = async (request: FastifyRequest, reply: FastifyReply) => {
  const { classId, timetableSlot, date, presentCount, absentCount, absentRollNos } = request.body as any;
  const user = (request as any).user;

  const attendance = new Attendance({
    classId,
    timetableSlot,
    date,
    markedBy: user.id,
    presentCount,
    absentCount,
    absentRollNos
  });

  await attendance.save();

  // Notify HOD if absent count is high (e.g. > 10)
  if (absentCount > 10) {
    const hods = await User.find({ role: 'HOD' });
    for (const hod of hods) {
      const notification = await Notification.create({
        user: hod._id,
        type: 'high_absenteeism',
        content: `High absenteeism reported (${absentCount} absent)`,
        relatedId: attendance._id
      });
      
      if (globalIo) {
        globalIo.to(`role:hod`).emit('new_notification', notification);
      }
      
      await sendPushNotification(hod.id, {
        title: 'High Absenteeism Alert',
        body: `${absentCount} students absent in a recent class`,
        url: '/attendance'
      });
    }
  }

  return reply.code(201).send(attendance);
};
