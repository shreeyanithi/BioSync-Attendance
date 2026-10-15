import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Download, Filter } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import * as XLSX from 'xlsx';


export function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          check_in_time,
          check_out_time,
          status,
          date,
          people!inner (
            employee_id,
            name,
            department
          )
        `)
        .eq('date', selectedDate);
      
      if (!error && data) {
        setAttendanceData(data);
      } else {
        setAttendanceData([]);
      }
      setLoading(false);
    }
    fetchAttendance();
  }, [selectedDate]);

  const filteredData = attendanceData.filter(record => 
    filterStatus === 'all' || record.status === filterStatus
  );

  const presentCount = attendanceData.filter(r => r.status === 'Present').length;
  const absentCount = attendanceData.filter(r => r.status === 'Absent').length;
  const lateCount = attendanceData.filter(r => r.status === 'Late').length;
  const totalCount = attendanceData.length;
  const attendancePercentage = totalCount > 0 ? ((presentCount + lateCount) / totalCount * 100).toFixed(1) : '0.0';

  // Export exactly the rows currently shown in the table (selected date + status filter).
  const getExportRows = () => filteredData.map((record) => ({
    'Employee ID': record.people?.employee_id || 'N/A',
    'Name': record.people?.name || 'Unknown',
    'Department': record.people?.department || 'Unknown',
    'Check-in Time': record.check_in_time
      ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '-',
    'Check-out Time': record.check_out_time
      ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '-',
    'Status': record.status || '-',
    'Date': record.date || selectedDate,
  }));

  const exportCsv = () => {
    const rows = getExportRows();
    const headers = Object.keys(rows[0] || {
      'Employee ID': '', 'Name': '', 'Department': '', 'Check-in Time': '',
      'Check-out Time': '', 'Status': '', 'Date': '',
    });
    const escapeCsv = (value: unknown) => {
      let text = String(value ?? '');
      // Prevent spreadsheet formula injection for text cells.
      if (/^[=+@\\-\\t\\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = [headers, ...rows.map((row) => headers.map((header) => row[header as keyof typeof row]))]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\\r\\n');
    const blob = new Blob(['\\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BioSync_Attendance_${selectedDate}${filterStatus !== 'all' ? `_${filterStatus}` : ''}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportExcel = () => {
    const rows = getExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 24 }, { wch: 20 }, { wch: 18 },
      { wch: 18 }, { wch: 14 }, { wch: 14 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `BioSync_Attendance_${selectedDate}${filterStatus !== 'all' ? `_${filterStatus}` : ''}.xlsx`);
    setShowExportMenu(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-black font-semibold mb-2">Attendance</h1>
            <p className="text-gray-600">Daily attendance tracking and records</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu((open) => !open)}
              aria-expanded={showExportMenu}
              aria-haspopup="menu"
              className="flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
            {showExportMenu && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-gray-200 bg-white py-2 shadow-lg z-20">
                <button
                  type="button"
                  role="menuitem"
                  onClick={exportCsv}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Download CSV (.csv)
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={exportExcel}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Download Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Total</p>
            <p className="text-black font-semibold text-xl">{totalCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Present</p>
            <div className="flex items-center gap-2">
              <p className="text-black font-semibold text-xl">{presentCount}</p>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Absent</p>
            <div className="flex items-center gap-2">
              <p className="text-black font-semibold text-xl">{absentCount}</p>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Late</p>
            <p className="text-black font-semibold text-xl">{lateCount}</p>
          </div>
          <div className="bg-[#1E40AF] rounded-lg p-4">
            <p className="text-white mb-1 font-medium">Attendance Rate</p>
            <p className="text-white font-semibold text-xl">{attendancePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-black">ID</th>
                <th className="px-6 py-4 text-left text-black">Name</th>
                <th className="px-6 py-4 text-left text-black">Department</th>
                <th className="px-6 py-4 text-left text-black">Check-in Time</th>
                <th className="px-6 py-4 text-left text-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading attendance data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No attendance records found for this date.
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => {
                  const personName = record.people?.name || 'Unknown';
                  const employeeId = record.people?.employee_id || 'N/A';
                  const department = record.people?.department || 'Unknown';
                  const checkInTime = record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{employeeId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1E40AF] rounded-full flex items-center justify-center text-white font-semibold">
                            {personName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <span className="text-gray-900 font-medium">{personName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{department}</td>
                      <td className="px-6 py-4">
                        {checkInTime !== '-' && (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {checkInTime}
                          </div>
                        )}
                        {checkInTime === '-' && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status === 'Present' && <CheckCircle className="w-4 h-4" />}
                          {record.status === 'Absent' && <XCircle className="w-4 h-4" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}