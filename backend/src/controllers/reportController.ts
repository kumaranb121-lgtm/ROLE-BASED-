import { FastifyRequest, FastifyReply } from 'fastify';
import { Leave } from '../models/Leave.js';
import { Substitution } from '../models/Substitution.js';
import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';

export const getReports = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  if (user.role !== 'HOD') {
    return reply.code(403).send({ message: 'Forbidden' });
  }

  try {
    const totalStaff = await User.countDocuments({ role: 'STAFF' });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const totalSubstitutions = await Substitution.countDocuments();
    
    // Recent attendance stats
    const recentAttendance = await Attendance.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('classId', 'year department');

    const totalAbsentInRecent = recentAttendance.reduce((acc, curr) => acc + curr.absentCount, 0);

    return reply.send({
      totalStaff,
      pendingLeaves,
      totalSubstitutions,
      recentAbsentTotal: totalAbsentInRecent
    });
  } catch (err) {
    return reply.code(500).send({ error: 'Failed to generate report' });
  }
};
