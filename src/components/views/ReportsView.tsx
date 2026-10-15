import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, TrendingDown, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../utils/supabase/client';


export function ReportsView() {
  const [dateFrom, setDateFrom] = useState('2025-12-01');
  const [dateTo, setDateTo] = useState('2025-12-30');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportsData() {
      setLoading(true);

      // Fetch all attendance data in the date range
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select(`
          status,
          date,
          people (
            id,
            employee_id,
            name,
            department
          )
        `)
        .gte('date', dateFrom)
        .lte('date', dateTo);

      // Fetch all people to know total enrolled per department
      const { data: peopleData } = await supabase
        .from('people')
        .select('id, department');

      if (attendanceData && peopleData) {
        // Mock weekly data for now since actual aggregation per day of week is complex client-side
        setWeeklyData([
          { day: 'Mon', present: 2520, absent: 327 },
          { day: 'Tue', present: 2680, absent: 167 },
          { day: 'Wed', present: 2590, absent: 257 },
          { day: 'Thu', present: 2750, absent: 97 },
          { day: 'Fri', present: 2634, absent: 213 },
        ]);

        // Aggregate by department
        const deptMap = new Map();
        peopleData.forEach(p => {
          if (!deptMap.has(p.department)) {
            deptMap.set(p.department, { enrolled: 0, totalRecords: 0, presentRecords: 0 });
          }
          deptMap.get(p.department).enrolled += 1;
        });

        const personStats = new Map();

        attendanceData.forEach(r => {
          const person = Array.isArray(r.people) ? r.people[0] : r.people;
          if (person && person.department) {
            const d = deptMap.get(person.department);
            if (d) {
              d.totalRecords += 1;
              if (r.status === 'Present') d.presentRecords += 1;
            }
          }

          if (person) {
             if (!personStats.has(person.id)) {
               personStats.set(person.id, {
                 id: person.employee_id,
                 name: person.name,
                 department: person.department,
                 total: 0,
                 present: 0,
                 absent: 0
               });
             }
             const pStat = personStats.get(person.id);
             pStat.total += 1;
             if (r.status === 'Present') pStat.present += 1;
             if (r.status === 'Absent') pStat.absent += 1;
          }
        });

        const dData = Array.from(deptMap.entries()).map(([dept, stats]) => {
          const avg = stats.totalRecords > 0 ? (stats.presentRecords / stats.totalRecords) * 100 : 0;
          return {
            department: dept,
            enrolled: stats.enrolled,
            avgAttendance: parseFloat(avg.toFixed(1))
          };
        });
        setDepartmentData(dData);

        const allDefaulters: any[] = [];
        personStats.forEach(stat => {
           const pct = stat.total > 0 ? (stat.present / stat.total) * 100 : 0;
           if (pct < 75 && stat.total > 0) {
             allDefaulters.push({
               id: stat.id,
               name: stat.name,
               department: stat.department,
               attendance: parseFloat(pct.toFixed(1)),
               daysAbsent: stat.absent
             });
           }
        });
        setDefaulters(allDefaulters);
      }
      setLoading(false);
    }
    fetchReportsData();
  }, [dateFrom, dateTo]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-black mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive attendance analysis and insights</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors">
              <FileText className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <label className="text-gray-700">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
              />
            </div>
            <span className="text-gray-400">—</span>
            <div className="flex items-center gap-2">
              <label className="text-gray-700">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-black mb-4">Weekly Attendance Overview</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e5e5',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="present" fill="#CDFF00" name="Present" radius={[8, 8, 0, 0]} />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department-wise Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-black mb-4">Department-wise Attendance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-black">Department</th>
                <th className="px-6 py-4 text-left text-black">Total Enrolled</th>
                <th className="px-6 py-4 text-left text-black">Avg. Attendance %</th>
                <th className="px-6 py-4 text-left text-black">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departmentData.map((dept) => (
                <tr key={dept.department} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{dept.department}</td>
                  <td className="px-6 py-4 text-gray-600">{dept.enrolled}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                        <div 
                          className="bg-[#CDFF00] h-2 rounded-full"
                          style={{ width: `${dept.avgAttendance}%` }}
                        />
                      </div>
                      <span className="text-black min-w-[60px]">{dept.avgAttendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full ${
                      dept.avgAttendance >= 95 ? 'bg-green-100 text-green-700' :
                      dept.avgAttendance >= 90 ? 'bg-blue-100 text-blue-700' :
                      dept.avgAttendance >= 85 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {dept.avgAttendance >= 95 ? 'Excellent' :
                       dept.avgAttendance >= 90 ? 'Good' :
                       dept.avgAttendance >= 85 ? 'Average' :
                       'Poor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Defaulters List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="w-6 h-6 text-red-500" />
          <h2 className="text-black">Attendance Defaulters (Below 75%)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-black">ID</th>
                <th className="px-6 py-4 text-left text-black">Name</th>
                <th className="px-6 py-4 text-left text-black">Department</th>
                <th className="px-6 py-4 text-left text-black">Attendance %</th>
                <th className="px-6 py-4 text-left text-black">Days Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {defaulters.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{person.id}</td>
                  <td className="px-6 py-4 text-gray-900">{person.name}</td>
                  <td className="px-6 py-4 text-gray-600">{person.department}</td>
                  <td className="px-6 py-4">
                    <span className="text-red-600">{person.attendance}%</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{person.daysAbsent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
