import { useState, useEffect } from 'react';
import { Wifi, WifiOff, MapPin, Activity, Settings, Plus } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';


export function DevicesView() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('name');
      
      if (error) {
        setFetchError(error.message);
      }
      
      if (!error && data) {
        setDevices(data);
      }
      setLoading(false);
    }
    fetchDevices();
  }, []);

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const totalScans = devices.reduce((sum, d) => sum + (d.scans_today || 0), 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-black font-semibold mb-2">Devices</h1>
            <p className="text-gray-600">Manage and monitor biometric scanners</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors font-medium">
            <Plus className="w-5 h-5" />
            Register Device
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-gray-600 mb-1">Total Devices</p>
            <p className="text-black font-semibold text-xl">{devices.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-green-500" />
              <p className="text-gray-600">Online</p>
            </div>
            <p className="text-black font-semibold text-xl">{onlineDevices}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <WifiOff className="w-4 h-4 text-red-500" />
              <p className="text-gray-600">Offline</p>
            </div>
            <p className="text-black font-semibold text-xl">{offlineDevices}</p>
          </div>
          <div className="bg-[#1E40AF] rounded-lg p-4">
            <p className="text-white mb-1 font-medium">Total Scans Today</p>
            <p className="text-white font-semibold text-xl">{totalScans.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Device Grid */}
      {fetchError ? (
        <div className="flex justify-center p-12 text-red-500 font-medium border border-red-200 bg-red-50 rounded-xl">Error fetching from Supabase: {fetchError}</div>
      ) : loading ? (
        <div className="flex justify-center p-12 text-gray-500">Loading devices...</div>
      ) : devices.length === 0 ? (
        <div className="flex justify-center p-12 text-gray-500">No devices found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
                device.status === 'online' 
                  ? 'border-green-200 hover:border-[#1E40AF]' 
                  : 'border-red-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-black mb-1">{device.name}</h3>
                  <p className="text-gray-600">{device.device_id}</p>
                </div>
                <div className={`p-2 rounded-lg ${
                  device.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {device.status === 'online' ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full ${
                  device.status === 'online' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {device.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{device.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>{device.scans_today || 0} scans today</span>
                </div>
              </div>

              {/* Model */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-gray-600 mb-1">Model</p>
                <p className="text-black">{device.model}</p>
              </div>

              {/* Sync Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-gray-600 mb-1">Last Heartbeat</p>
                  <p className="text-gray-900">{device.last_heartbeat ? new Date(device.last_heartbeat).toLocaleTimeString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Sync</p>
                  <p className="text-gray-900">{device.last_sync ? new Date(device.last_sync).toLocaleTimeString() : 'N/A'}</p>
                </div>
              </div>

              {/* Actions */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}