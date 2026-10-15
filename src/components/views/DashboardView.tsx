import { useState, useEffect } from 'react';
import { Users, CheckCircle, Activity, AlertCircle, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../utils/supabase/client';


export function DashboardView() {
  const [kpiData, setKpiData] = useState([
    { label: 'Total Enrolled', value: '...', change: '0%', icon: Users, color: 'bg-blue-600' },
    { label: "Today's Attendance", value: '...', change: '0%', icon: CheckCircle, color: 'bg-[#1E40AF]' },
    { label: 'Total Scans Today', value: '...', change: '0%', icon: Activity, color: 'bg-gray-700' },
    { label: 'Active Devices', value: '...', change: '0%', icon: Wifi, color: 'bg-blue-500' },
  ]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentDevices, setRecentDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Total Enrolled
      const { count: enrolledCount } = await supabase
        .from('people')
        .select('*', { count: 'exact', head: true });

      // 2. Today's Attendance
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAttendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // 3. Devices Status & Scans
      const { data: devicesData } = await supabase
        .from('devices')
        .select('*');
      
      const totalScans = devicesData?.reduce((sum, d) => sum + (d.scans_today || 0), 0) || 0;
      const activeDevices = devicesData?.filter(d => d.status === 'online').length || 0;
      const totalDevices = devicesData?.length || 0;

      setKpiData([
        { label: 'Total Enrolled', value: `${enrolledCount || 0}`, change: '+12%', icon: Users, color: 'bg-blue-600' },
        { label: "Today's Attendance", value: `${todayAttendanceCount || 0}`, change: '92.5%', icon: CheckCircle, color: 'bg-[#1E40AF]' },
        { label: 'Total Scans Today', value: `${totalScans}`, change: '+8%', icon: Activity, color: 'bg-gray-700' },
        { label: 'Active Devices', value: `${activeDevices}/${totalDevices}`, change: '85.7%', icon: Wifi, color: 'bg-blue-500' },
      ]);

      if (devicesData) {
        setRecentDevices(devicesData.slice(0, 4));
        const offlineDevices = devicesData.filter(d => d.status === 'offline');
        const generatedAlerts = offlineDevices.map(d => ({
          type: 'warning', message: `Device ${d.device_id} is offline`
        }));
        if (generatedAlerts.length === 0) {
           generatedAlerts.push({ type: 'success', message: 'All devices are online and synced' });
        }
        setAlerts(generatedAlerts);
      }

      // 4. Mock Chart Data (Requires complex SQL to group by day last 7 days, providing dummy for now)
      setChartData([
        { date: 'Mon', attendance: 2520 },
        { date: 'Tue', attendance: 2680 },
        { date: 'Wed', attendance: 2590 },
        { date: 'Thu', attendance: 2750 },
        { date: 'Fri', attendance: 2634 },
        { date: 'Sat', attendance: 1820 },
        { date: 'Sun', attendance: 950 },
      ]);

      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-black font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-600">Real-time attendance monitoring and system overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 font-medium">{kpi.change}</span>
              </div>
              <p className="text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-black font-semibold text-2xl">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-black font-semibold mb-1">Attendance Trend</h2>
              <p className="text-gray-600">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <TrendingUp className="w-5 h-5" />
              <span>+5.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#1E40AF" 
                strokeWidth={3}
                dot={{ fill: '#1E40AF', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-black font-semibold mb-4">System Alerts</h2>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-amber-50 border-amber-200' 
                    : alert.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                    alert.type === 'warning' 
                      ? 'text-amber-600' 
                      : alert.type === 'success'
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`} />
                  <p className="text-gray-900">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-black font-semibold mb-4">Device Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentDevices.map((device) => (
            <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#1E40AF] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-black font-medium">{device.device_id}</span>
                {device.status === 'online' ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-gray-600 mb-2">{device.location}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-500 text-sm">
                  {device.last_sync ? new Date(device.last_sync).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}