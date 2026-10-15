import { Shield, Lock, Activity, Eye, Database, AlertTriangle } from 'lucide-react';

const rolePermissions = [
  { role: 'Super Admin', users: 5, canEnroll: true, canDelete: true, canViewReports: true, canManageDevices: true },
  { role: 'Admin', users: 12, canEnroll: true, canDelete: false, canViewReports: true, canManageDevices: false },
  { role: 'Supervisor', users: 45, canEnroll: true, canDelete: false, canViewReports: true, canManageDevices: false },
  { role: 'Viewer', users: 23, canEnroll: false, canDelete: false, canViewReports: true, canManageDevices: false },
];

const auditLogs = [
  { id: 1, timestamp: '2025-12-30 14:32:15', user: 'admin@company.com', action: 'Enrolled new person', details: 'Sarah Johnson (P001)', severity: 'info' },
  { id: 2, timestamp: '2025-12-30 14:15:42', user: 'supervisor@company.com', action: 'Exported attendance report', details: 'Date range: Dec 1-30, 2025', severity: 'info' },
  { id: 3, timestamp: '2025-12-30 13:58:21', user: 'admin@company.com', action: 'Modified device settings', details: 'DEV-004 configuration updated', severity: 'warning' },
  { id: 4, timestamp: '2025-12-30 13:22:09', user: 'superadmin@company.com', action: 'Deleted person record', details: 'P892 - Rachel Green', severity: 'critical' },
  { id: 5, timestamp: '2025-12-30 12:45:33', user: 'admin@company.com', action: 'User login', details: 'Successful login from 192.168.1.105', severity: 'info' },
  { id: 6, timestamp: '2025-12-30 12:12:18', user: 'unknown', action: 'Failed login attempt', details: '3 failed attempts from 192.168.1.247', severity: 'warning' },
];

const loginActivity = [
  { user: 'admin@company.com', lastLogin: '2025-12-30 14:32:15', location: '192.168.1.105', status: 'Active' },
  { user: 'supervisor@company.com', lastLogin: '2025-12-30 14:15:42', location: '192.168.1.108', status: 'Active' },
  { user: 'superadmin@company.com', lastLogin: '2025-12-30 13:22:09', location: '192.168.1.101', status: 'Inactive' },
  { user: 'viewer@company.com', lastLogin: '2025-12-29 16:45:22', location: '192.168.1.156', status: 'Inactive' },
];

export function SecurityView() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-black mb-2">Security & Access</h1>
        <p className="text-gray-600">Role-based access control and audit logging</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-[#CDFF00]" />
            <p className="text-gray-600">Security Status</p>
          </div>
          <p className="text-black">Active</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-green-500" />
            <p className="text-gray-600">Data Encryption</p>
          </div>
          <p className="text-black">AES-256</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-blue-500" />
            <p className="text-gray-600">Backup Status</p>
          </div>
          <p className="text-black">2 hours ago</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-purple-500" />
            <p className="text-gray-600">Active Sessions</p>
          </div>
          <p className="text-black">2</p>
        </div>
      </div>

      {/* Role-Based Access Control */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-black mb-4">Role-Based Access Control</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-black">Role</th>
                <th className="px-6 py-4 text-left text-black">Users</th>
                <th className="px-6 py-4 text-left text-black">Enroll</th>
                <th className="px-6 py-4 text-left text-black">Delete</th>
                <th className="px-6 py-4 text-left text-black">View Reports</th>
                <th className="px-6 py-4 text-left text-black">Manage Devices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rolePermissions.map((role) => (
                <tr key={role.role} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-black">{role.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{role.users}</td>
                  <td className="px-6 py-4">
                    {role.canEnroll ? (
                      <div className="w-5 h-5 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">✗</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {role.canDelete ? (
                      <div className="w-5 h-5 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">✗</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {role.canViewReports ? (
                      <div className="w-5 h-5 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">✗</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {role.canManageDevices ? (
                      <div className="w-5 h-5 bg-[#CDFF00] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">✗</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Audit Logs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-[#CDFF00]" />
            <h2 className="text-black">Recent Audit Logs</h2>
          </div>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div 
                key={log.id}
                className={`p-4 rounded-lg border ${
                  log.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  log.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-gray-900">{log.action}</span>
                  {log.severity === 'critical' && (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  {log.severity === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-gray-600 mb-2">{log.details}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{log.user}</span>
                  <span className="text-gray-500">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-500" />
            <h2 className="text-black">Login Activity</h2>
          </div>
          <div className="space-y-3">
            {loginActivity.map((activity, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">{activity.user}</span>
                  <span className={`px-3 py-1 rounded-full ${
                    activity.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">Last login: {activity.lastLogin}</p>
                <p className="text-gray-500">IP: {activity.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biometric Data Protection */}
      <div className="bg-gradient-to-r from-[#CDFF00] to-blue-500 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-black p-3 rounded-lg">
            <Shield className="w-8 h-8 text-[#CDFF00]" />
          </div>
          <div>
            <h2 className="text-black mb-2">Biometric Data Protection</h2>
            <p className="text-gray-900 mb-4">
              All biometric data is encrypted using AES-256 encryption at rest and in transit. 
              Fingerprint templates are stored as mathematical representations, not actual images. 
              Data is backed up every 6 hours to secure cloud storage with 99.99% uptime SLA.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-900 mb-1">Encryption</p>
                <p className="text-black">AES-256</p>
              </div>
              <div>
                <p className="text-gray-900 mb-1">Backup Frequency</p>
                <p className="text-black">Every 6 hours</p>
              </div>
              <div>
                <p className="text-gray-900 mb-1">Compliance</p>
                <p className="text-black">GDPR, ISO 27001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
