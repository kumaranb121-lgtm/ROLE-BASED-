import mongoose from 'mongoose';
import { hashPassword } from './utils/password.js';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Class } from './models/Class.js';
import { Subject } from './models/Subject.js';
import { Timetable } from './models/Timetable.js';
import { connectDB } from './config/db.js';

dotenv.config();

const staffNames = [
  'Dr. Antonidoss A', 'Dr. Kumaresan E', 'Dr. S. Elakkiya', 'Mr. Mohan D', 'Mr. Parthasarthy', 'Mr. D. Prakash',
  'Mrs. Manju M', 'Mrs. Anitha G', 'Mrs. Bibija J', 'Mrs. Vidhya S', 'Mrs. Manodhiya S', 'Mrs. Dhiya V',
  'Mrs. Nandhini B', 'Mrs. Indhumathi', 'Mrs. Malarvizhi S', 'Mrs. R. Roshini', 'Mrs. Vaishnavi J',
  'Ms. T.S. Valarmathi', 'Ms. Amrutha V Girish'
];

const subjectsList = [
  // 2nd Year
  { code: 'CS201', shortName: 'AAD', name: 'Analysis and Design of Algorithms', type: 'Theory' },
  { code: 'CS202', shortName: 'CS', name: 'Computer Systems', type: 'Theory' },
  { code: 'CS203', shortName: 'MCA', name: 'Microprocessor and Computer Architecture', type: 'Theory' },
  { code: 'CS204', shortName: 'DTI', name: 'Design Thinking', type: 'Theory' },
  { code: 'CS205', shortName: 'JAVA', name: 'Java Programming', type: 'Theory' },
  { code: 'CS206', shortName: 'FOE', name: 'Fundamentals of Engineering', type: 'Theory' },
  { code: 'CS207', shortName: 'DOS', name: 'Design of Systems', type: 'Theory' },
  { code: 'CS208', shortName: 'COMM', name: 'Communication Skills', type: 'Comm' },
  { code: 'CS209', shortName: 'PT', name: 'Physical Training', type: 'PT' },
  { code: 'CS210', shortName: 'LIB', name: 'Library', type: 'Library' },
  { code: 'CS211', shortName: 'PLACEMENT', name: 'Placement Training', type: 'Placement' },
  { code: 'CS212', shortName: 'LAB', name: 'Laboratory', type: 'Lab' },
  { code: 'CS213', shortName: 'DTI-LAB', name: 'Design Thinking Lab', type: 'Lab' },
  { code: 'CS214', shortName: 'AAD-LAB', name: 'AAD Lab', type: 'Lab' },
  { code: 'CS215', shortName: 'DOS-LAB', name: 'DOS Lab', type: 'Lab' },
  { code: 'CS216', shortName: 'JAVA-LAB', name: 'Java Lab', type: 'Lab' },
  { code: 'CS217', shortName: 'COMM-LAB', name: 'Communication Lab', type: 'Lab' },

  // 3rd Year
  { code: 'CS301', shortName: 'BCT', name: 'Blockchain Technology', type: 'Theory' },
  { code: 'CS302', shortName: 'BDA', name: 'Big Data Analytics', type: 'Theory' },
  { code: 'CS303', shortName: 'RS/RDS', name: 'Recommender Systems', type: 'Theory' },
  { code: 'CS304', shortName: 'FT', name: 'Financial Technology', type: 'Theory' },
  { code: 'CS305', shortName: 'SCM/PS', name: 'Supply Chain Management', type: 'Theory' },
  { code: 'CS306', shortName: 'OE', name: 'Open Elective', type: 'Theory' },
  { code: 'CS307', shortName: 'MINI', name: 'Mini Project', type: 'Project' },
  { code: 'CS308', shortName: 'BCT-LAB', name: 'Blockchain Lab', type: 'Lab' },
  { code: 'CS309', shortName: 'BDA-LAB', name: 'Big Data Lab', type: 'Lab' },

  // 4th Year
  { code: 'CS401', shortName: 'DVA', name: 'Data Visualization and Analytics', type: 'Theory' },
  { code: 'CS402', shortName: 'SOM', name: 'System Operations and Maintenance', type: 'Theory' },
  { code: 'CS403', shortName: 'ITP', name: 'IT Project Management', type: 'Theory' },
  { code: 'CS404', shortName: 'IOT/DL', name: 'IoT and Deep Learning', type: 'Theory' },
  { code: 'CS405', shortName: 'MATLAB', name: 'MATLAB', type: 'Lab' },
  { code: 'CS406', shortName: 'DVA-LAB', name: 'DVA Lab', type: 'Lab' },
  { code: 'CS407', shortName: 'PROJ-I', name: 'Project Phase I', type: 'Project' },
];

const timetablesData = {
  '2nd': {
    MON: ['AAD', 'CS', 'MCA', 'DTI-LAB', 'DTI-LAB', 'FOE', 'JAVA', 'LIB'],
    TUE: ['MCA', 'DOS', 'AAD', 'CS', 'AAD', 'PLACEMENT', 'PLACEMENT', 'LAB'],
    WED: ['DOS', 'MCA', 'MCA', 'JAVA', 'CS', 'COMM', 'COMM', 'LAB'],
    THU: ['AAD', 'JAVA', 'FOE', 'DTI', 'JAVA', 'CS', 'JAVA', 'DOS'],
    FRI: ['DTI', 'AAD-LAB', 'AAD-LAB', 'DOS-LAB', 'DOS-LAB', 'CS', 'PT', 'DOS']
  },
  '3rd': {
    MON: ['BCT', 'BCT-LAB', 'BCT-LAB', 'BDA', 'RS/RDS', 'FT', 'SCM/PS', 'OE'],
    TUE: ['RS/RDS', 'BDA-LAB', 'BDA-LAB', 'OE', 'BDA', 'SCM/PS', 'BDA', 'LIB'],
    WED: ['SCM/PS', 'MINI', 'MINI', 'BDA', 'RS/RDS', 'RS/RDS', 'BCT', 'OE'],
    THU: ['BDA', 'SCM/PS', 'BCT', 'OE', 'FT', 'BCT', 'BCT', 'FT'],
    FRI: ['FT', 'RS/RDS', 'COMM', 'LAB', 'LAB', 'PLACEMENT', 'PLACEMENT', 'LAB']
  },
  '4th': {
    MON: ['DVA', 'SOM', 'ITP', 'IOT/DL', 'DVA', 'MATLAB', 'MATLAB', 'LAB'],
    TUE: ['SOM', 'DVA', 'ITP', 'DVA-LAB', 'DVA-LAB', 'SOM', 'IOT/DL', 'OE'],
    WED: ['SOM', 'DVA', 'ITP', 'OE', 'OE', 'PLACEMENT', 'PLACEMENT', 'LAB'],
    THU: ['IOT/DL', 'PROJ-I', 'PROJ-I', 'PROJ-I', 'PROJ-I', 'ITP', 'IOT/DL', 'OE'],
    FRI: ['ITP', 'SOM', 'ITP', 'OE', 'SOM', 'DVA', 'IOT/DL', 'DVA']
  }
};

const NO_STAFF_SUBJECTS = ['PLACEMENT', 'LIB', 'PT', 'LAB']; // LAB generic requires no specific single staff here or can be ignored.

async function seed() {
  await connectDB();
  console.log('Seeding Database with intelligent staff allocator...');
  try {
    const passwordHash = await hashPassword('Password@123');

    // 1. Setup Users
    await User.findOneAndUpdate(
      { username: 'hod' },
      { name: 'Dr. Antony Das', username: 'hod', password: passwordHash, role: 'HOD' },
      { upsert: true, new: true }
    );

    const staffDocs: any[] = [];
    for (const name of staffNames) {
      const username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const staff = await User.findOneAndUpdate(
        { username },
        { name, username, password: passwordHash, role: 'STAFF' },
        { upsert: true, new: true }
      );
      staffDocs.push(staff);
    }

    for (const year of ['1st', '2nd', '3rd', '4th']) {
      await User.findOneAndUpdate(
        { username: `${year.charAt(0)}yearrep` },
        { name: `${year} Year Rep`, username: `${year.charAt(0)}yearrep`, password: passwordHash, role: 'CLASS_REPRESENTATIVE' },
        { upsert: true, new: true }
      );
    }

    // 2. Setup Subjects
    const subjDocs: any = {};
    for (const subj of subjectsList) {
      const s = await Subject.findOneAndUpdate(
        { shortName: subj.shortName },
        subj,
        { upsert: true, new: true }
      );
      subjDocs[subj.shortName] = s._id;
    }

    // 3. Setup Classes
    const c2 = await Class.findOneAndUpdate(
      { year: '2nd', department: 'CSBS' },
      { year: '2nd', department: 'CSBS', classroom: 'CWS02', advisor: staffDocs.find(d => d.name === 'Mrs. Manodhiya S')?._id, effectiveFrom: new Date('2026-07-01') },
      { upsert: true, new: true }
    );
    const c3 = await Class.findOneAndUpdate(
      { year: '3rd', department: 'CSBS' },
      { year: '3rd', department: 'CSBS', classroom: 'CWT02', advisor: staffDocs.find(d => d.name === 'Mrs. Anitha G')?._id, effectiveFrom: new Date('2026-07-01') },
      { upsert: true, new: true }
    );
    const c4 = await Class.findOneAndUpdate(
      { year: '4th', department: 'CSBS' },
      { year: '4th', department: 'CSBS', classroom: 'CWS01', advisor: staffDocs.find(d => d.name === 'Dr. Kumaresan E')?._id, effectiveFrom: new Date('2026-07-01') },
      { upsert: true, new: true }
    );

    const classIds = { '2nd': c2._id, '3rd': c3._id, '4th': c4._id };

    // 4. Staff Allocation Algorithm
    console.log('Calculating conflict-free staff allocations...');
    
    // subjectName -> staffId
    const subjectStaffMap: Record<string, string> = {}; 
    
    // staffId -> Set of `${day}-${period}` to track workload
    const staffSchedule: Record<string, Set<string>> = {};
    staffDocs.forEach(s => staffSchedule[s._id.toString()] = new Set());

    // Group lab and theory (e.g. AAD and AAD-LAB should ideally get the same staff)
    const getBaseSubject = (name: string) => name.replace('-LAB', '');

    const allOccurrences: { subject: string, day: string, period: number }[] = [];
    Object.entries(timetablesData).forEach(([year, schedule]) => {
      Object.entries(schedule).forEach(([day, subjects]) => {
        subjects.forEach((subj, i) => {
          allOccurrences.push({ subject: subj, day, period: i + 1 });
        });
      });
    });

    const uniqueSubjects = [...new Set(allOccurrences.map(o => o.subject))];

    for (const subject of uniqueSubjects) {
      if (NO_STAFF_SUBJECTS.includes(subject)) {
        subjectStaffMap[subject] = null as any;
        continue;
      }

      const occurrences = allOccurrences.filter(o => o.subject === subject);
      let assignedStaffId = null;

      const predefinedStaffMap: Record<string, string> = {
        'CS': 'Dr. Kumaresan E',
        'MCA': 'Mrs. Vidhya S',
        'JAVA': 'Mr. D. Prakash',
        'DOS': 'Mrs. Manodhiya S',
        'AAD': 'Mrs. Bibija J',
        'FOE': 'Mrs. Nandhini B',
        'DTI': 'Mrs. Dhiya V',
        'COMM': 'Dr. S. Elakkiya',
        'JAVA-LAB': 'Mrs. Malarvizhi S',
        'DOS-LAB': 'Mrs. Manodhiya S',
        'AAD-LAB': 'Mrs. Bibija J',
        'DTI-LAB': 'Mrs. Dhiya V',
      };

      if (predefinedStaffMap[subject]) {
        const staffName = predefinedStaffMap[subject];
        const staffDoc = staffDocs.find(s => s.name === staffName);
        if (staffDoc) {
          assignedStaffId = staffDoc._id;
          for (const occ of occurrences) {
            staffSchedule[staffDoc._id.toString()].add(`${occ.day}-${occ.period}`);
          }
        }
      }

      if (!assignedStaffId) {
        // Check if base subject already assigned (e.g. AAD assigned, so AAD-LAB gets same staff if possible)
      const baseSubj = getBaseSubject(subject);
      let preferredStaff = subjectStaffMap[baseSubj];

      // Shuffle staff slightly or order by workload to balance
      const sortedStaff = [...staffDocs].sort((a, b) => staffSchedule[a._id.toString()].size - staffSchedule[b._id.toString()].size);
      
      if (preferredStaff) {
        // Try preferred first
        sortedStaff.unshift(staffDocs.find(s => s._id.toString() === preferredStaff));
      }

      for (const staff of sortedStaff) {
        if (!staff) continue;
        const staffIdStr = staff._id.toString();
        let hasConflict = false;
        
        for (const occ of occurrences) {
          const timeKey = `${occ.day}-${occ.period}`;
          if (staffSchedule[staffIdStr].has(timeKey)) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          assignedStaffId = staff._id;
          for (const occ of occurrences) {
            staffSchedule[staffIdStr].add(`${occ.day}-${occ.period}`);
          }
          break;
        }
      }
      }

      if (assignedStaffId) {
        subjectStaffMap[subject] = assignedStaffId.toString();
        console.log(`Assigned ${staffDocs.find(s=>s._id.toString()===assignedStaffId.toString())?.name} to ${subject}`);
      } else {
        console.warn(`WARNING: Could not find conflict-free staff for ${subject}! Assigned randomly with conflict.`);
        subjectStaffMap[subject] = staffDocs[0]._id.toString();
      }
    }

    // 5. Build Final Timetable
    await Timetable.deleteMany({}); // Clear existing timetables

    for (const [year, schedule] of Object.entries(timetablesData)) {
      const classId = classIds[year as keyof typeof classIds];
      
      for (const [day, subjects] of Object.entries(schedule)) {
        for (let i = 0; i < 8; i++) {
          const shortName = subjects[i];
          const staffId = subjectStaffMap[shortName] || null;
          
          await Timetable.create({
            classId,
            day: day as any,
            period: i + 1,
            subject: subjDocs[shortName] || null,
            staff: staffId,
            isBreak: false,
            breakName: null,
          });
        }
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
