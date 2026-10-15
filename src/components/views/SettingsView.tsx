import { Clock, Calendar, Database, Bell, Users, Shield } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-black mb-2">Settings</h1>
        <p className="text-gray-600">Configure system preferences and attendance rules</p>
      </div>

      <div className="space-y-6">
        {/* Attendance Rules */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#CDFF00] p-2 rounded-lg">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-black">Attendance Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-black mb-2">Working Hours Start</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
              />
            </div>
            <div>
              <label className="block text-black mb-2">Working Hours End</label>
              <input
                type="time"
                defaultValue="17:00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
              />
            </div>
            <div>
              <label className="block text-black mb-2">Grace Period (minutes)</label>
              <input
                type="number"
                defaultValue="15"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
              />
              <p className="text-gray-500 mt-1">Late marking threshold</p>
            </div>
            <div>
              <label className="block text-black mb-2">Minimum Attendance %</label>
              <input
                type="number"
                defaultValue="75"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]"
              />
              <p className="text-gray-500 mt-1">Required for compliance</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoMarkAbsent"
              defaultChecked
              className="w-5 h-5 accent-[#CDFF00]"
            />
            <label htmlFor="autoMarkAbsent" className="text-gray-900">
              Automatically mark absent if no check-in by end of grace period
            </label>
          </div>
        </div>

        {/* Shift Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-black">Shift Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-black mb-1">Morning Shift</h3>
                  <p className="text-gray-600">06:00 AM - 02:00 PM</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
                  Edit
                </button>
              </div>
              <p className="text-gray-600">Assigned: 450 people</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-black mb-1">Day Shift</h3>
                  <p className="text-gray-600">09:00 AM - 05:00 PM</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
                  Edit
                </button>
              </div>
              <p className="text-gray-600">Assigned: 2,156 people</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-black mb-1">Evening Shift</h3>
                  <p className="text-gray-600">02:00 PM - 10:00 PM</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
                  Edit
                </button>
              </div>
              <p className="text-gray-600">Assigned: 241 people</p>
            </div>

            <button className="w-full px-4 py-3 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors">
              Add New Shift
            </button>
          </div>
        </div>

        {/* Holiday Calendar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-black">Holiday Calendar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-900 mb-1">New Year's Day</p>
              <p className="text-gray-600">January 1, 2026</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-900 mb-1">Independence Day</p>
              <p className="text-gray-600">July 4, 2026</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-900 mb-1">Thanksgiving</p>
              <p className="text-gray-600">November 26, 2026</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-900 mb-1">Christmas</p>
              <p className="text-gray-600">December 25, 2026</p>
            </div>
          </div>

          <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Manage Holidays
          </button>
        </div>

        {/* Sync & Backup */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500 p-2 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-black">Sync & Backup Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-black mb-1">Auto Sync Interval</p>
                <p className="text-gray-600">Device data synchronization frequency</p>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]">
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Every hour</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-black mb-1">Backup Schedule</p>
                <p className="text-gray-600">Cloud backup frequency</p>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF00]">
                <option>Every 6 hours</option>
                <option>Every 12 hours</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-blue-900">Last backup: 2 hours ago</p>
                <p className="text-blue-700">Next scheduled backup: 4 hours from now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-black">Notification Preferences</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-black mb-1">Device Offline Alerts</p>
                <p className="text-gray-600">Get notified when devices go offline</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#CDFF00]" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-black mb-1">Low Attendance Alerts</p>
                <p className="text-gray-600">Alert when department attendance falls below threshold</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#CDFF00]" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-black mb-1">Daily Summary Reports</p>
                <p className="text-gray-600">Receive end-of-day attendance summary</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-[#CDFF00]" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Reset to Defaults
          </button>
          <button className="px-8 py-3 bg-black text-[#CDFF00] rounded-lg hover:bg-gray-900 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
