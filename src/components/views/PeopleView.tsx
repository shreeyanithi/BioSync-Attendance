import { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, Fingerprint, Mail, Phone, Calendar } from 'lucide-react';
import { EnrollModal } from '../EnrollModal';
import { supabase } from '../../utils/supabase/client';

export function PeopleView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPeople() {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('enrolled_date', { ascending: false });
      
      if (!error && data) {
        setPeople(data);
      }
      setLoading(false);
    }
    fetchPeople();
  }, []);

  const filteredPeople = people.filter(person => {
    const matchesSearch = (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || person.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const studentsCount = people.filter(p => p.role === 'Student').length;
  const staffCount = people.filter(p => p.role === 'Staff').length;
  const adminCount = people.filter(p => p.role === 'Admin').length;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-black font-semibold mb-2">People & Enrollment</h1>
            <p className="text-gray-600">Manage enrolled individuals and biometric data</p>
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors shadow-sm font-medium"
          >
            <UserPlus className="w-5 h-5" />
            Enroll New Person
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Total Enrolled</p>
            <p className="text-black font-semibold text-xl">{people.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Students</p>
            <p className="text-black font-semibold text-xl">{studentsCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Staff</p>
            <p className="text-black font-semibold text-xl">{staffCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Admins</p>
            <p className="text-black font-semibold text-xl">{adminCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            >
              <option value="all">All Roles</option>
              <option value="Student">Students</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* People List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-black font-semibold">ID</th>
                <th className="px-6 py-4 text-left text-black font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-black font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-black font-semibold">Department</th>
                <th className="px-6 py-4 text-left text-black font-semibold">Biometric ID</th>
                <th className="px-6 py-4 text-left text-black font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-black font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading people data...
                  </td>
                </tr>
              ) : filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No people found.
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{person.employee_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1E40AF] rounded-full flex items-center justify-center text-white font-semibold">
                          {(person.name || 'User').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-gray-900 font-medium">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                        person.role === 'Admin' ? 'bg-gray-700 text-white' :
                        person.role === 'Staff' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {person.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{person.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Fingerprint className="w-4 h-4 text-[#1E40AF]" />
                        {person.biometric_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="text-sm">{person.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span className="text-sm">{person.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {person.enrolled_date ? new Date(person.enrolled_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEnrollModal && (
        <EnrollModal onClose={() => setShowEnrollModal(false)} />
      )}
    </div>
  );
}