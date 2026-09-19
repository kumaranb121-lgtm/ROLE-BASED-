import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Users, User, GraduationCap, Building2 } from 'lucide-react';

// Hardcoded Student Data as requested
const STUDENT_DATA: Record<string, Array<{ rollNo: string; name: string; gender: 'Male' | 'Female' }>> = {
  '2nd': [
    { rollNo: '714023241001', name: 'AARTHI S', gender: 'Female' },
    { rollNo: '714023241002', name: 'AJAY K', gender: 'Male' },
    { rollNo: '714023241003', name: 'AKASH R', gender: 'Male' },
    { rollNo: '714023241004', name: 'BHAVANA M', gender: 'Female' },
    { rollNo: '714023241005', name: 'CHANDRU S', gender: 'Male' },
    { rollNo: '714023241006', name: 'DEEPAK V', gender: 'Male' },
    { rollNo: '714023241007', name: 'DIVYA P', gender: 'Female' },
    { rollNo: '714023241008', name: 'GOKUL N', gender: 'Male' },
  ],
  '3rd': [
    { rollNo: '714022241001', name: 'ABINAYA T', gender: 'Female' },
    { rollNo: '714022241002', name: 'ARUN PRASATH R', gender: 'Male' },
    { rollNo: '714022241003', name: 'BALAJI K', gender: 'Male' },
    { rollNo: '714022241004', name: 'DEEPIKA S', gender: 'Female' },
    { rollNo: '714022241005', name: 'DINESH KUMAR M', gender: 'Male' },
    { rollNo: '714022241006', name: 'GOWTHAM S', gender: 'Male' },
    { rollNo: '714022241007', name: 'HARINI R', gender: 'Female' },
    { rollNo: '714022241008', name: 'JEEVA K', gender: 'Male' },
  ],
  '4th': [
    { rollNo: '714021241001', name: 'AKILA V', gender: 'Female' },
    { rollNo: '714021241002', name: 'ANAND S', gender: 'Male' },
    { rollNo: '714021241003', name: 'BHARATH M', gender: 'Male' },
    { rollNo: '714021241004', name: 'CHITRA P', gender: 'Female' },
    { rollNo: '714021241005', name: 'DHANUSH R', gender: 'Male' },
    { rollNo: '714021241006', name: 'HARI PRASAD K', gender: 'Male' },
    { rollNo: '714021241007', name: 'JANANI M', gender: 'Female' },
    { rollNo: '714021241008', name: 'KARTHIK S', gender: 'Male' },
  ]
};

export default function MyClass() {
  const { user } = useAuthStore();
  const [yearMatch, setYearMatch] = useState<'2nd' | '3rd' | '4th' | null>(null);

  useEffect(() => {
    if (user?.role === 'CLASS_REPRESENTATIVE') {
      const year = user.name.split(' ')[0]; // extracts "2nd", "3rd", "4th"
      if (['2nd', '3rd', '4th'].includes(year)) {
        setYearMatch(year as any);
      }
    }
  }, [user]);

  if (user?.role !== 'CLASS_REPRESENTATIVE') {
    return <div className="p-10 text-center text-red-500 font-bold">Only Class Representatives can view this page.</div>;
  }

  if (!yearMatch) {
    return <div className="p-10 text-center text-gray-500 font-bold">Could not determine your class year.</div>;
  }

  const students = STUDENT_DATA[yearMatch];
  const boysCount = students.filter(s => s.gender === 'Male').length;
  const girlsCount = students.filter(s => s.gender === 'Female').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAF6F3] rounded-full text-[#7B1D23]">
            <GraduationCap className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4A1115]">My Class Students</h1>
            <p className="text-[#7B1D23]/70 font-medium mt-1">CSBS Department - {yearMatch} Year</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Total Strength</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full"><User className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Boys</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{boysCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#EAE0D9] shadow-sm flex items-center gap-4">
          <div className="p-4 bg-pink-50 text-pink-600 rounded-full"><User className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-[#7B1D23]/60 uppercase tracking-wider">Girls</p>
            <h3 className="text-3xl font-bold text-[#4A1115]">{girlsCount}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAE0D9] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EAE0D9] bg-[#FAF6F3]">
          <h2 className="text-lg font-bold text-[#4A1115] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7B1D23]"></span>
            Student List
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4A1115]">
            <thead className="bg-[#FAF6F3]/50 text-[#7B1D23] uppercase font-bold text-[11px] tracking-wider border-b border-[#EAE0D9]">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Register Number</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Gender</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE0D9]">
              {students.map((student, idx) => (
                <tr key={student.rollNo} className="hover:bg-[#FAF6F3]/30 transition-colors font-medium">
                  <td className="px-6 py-4">{idx + 1}</td>
                  <td className="px-6 py-4">{student.rollNo}</td>
                  <td className="px-6 py-4 font-bold">{student.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${student.gender === 'Male' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>
                      {student.gender}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
