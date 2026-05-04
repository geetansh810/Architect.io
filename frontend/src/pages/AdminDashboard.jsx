import { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  Activity,
  UserPlus,
  MapPin,
  Calendar,
  Mail,
  Crown,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCcw,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
  const [searchQuery, setSearchQuery] = useState('');
  const [geoFilter, setGeoFilter] = useState('country'); // 'country' | 'state' | 'city'

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, analyticsRes, usersRes] = await Promise.all([
        api('/admin/stats'),
        api('/admin/analytics'),
        api('/admin/users')
      ]);

      const [statsData, analyticsData, usersData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
        usersRes.json()
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-10 h-10 animate-spin text-brand-500" />
          <p className="font-bold text-[var(--text-muted)]">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeTab === 'users') {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 h-full overflow-y-auto">
        {/* Users Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className="p-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl hover:border-brand-500 transition-all shadow-sm group"
            >
              <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl font-black tracking-tight">User Directory</h1>
              <p className="text-[var(--text-muted)] font-medium">Managing {users.length} registered platform architects.</p>
            </div>
          </div>
          <div className="relative w-full md:w-96">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] focus:border-brand-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Full Users Table */}
        <div className="p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-main)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <th className="pb-4">Architect</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Location</th>
                  <th className="pb-4">Workflows</th>
                  <th className="pb-4">Joined</th>
                  <th className="pb-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-[var(--bg-app)]/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-black">
                          {user.name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin'
                        ? 'bg-brand-500/10 text-brand-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin size={14} className="text-[var(--text-muted)]" />
                        <span className="truncate max-w-[200px]">
                          {user.location?.city}, {user.location?.region}, {user.location?.country}
                        </span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-[var(--text-muted)]" />
                        <span className="font-bold text-sm">{user.workflowCount}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-sm font-medium text-[var(--text-muted)]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-[var(--text-muted)] font-medium italic">
                      No users found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tight">Admin Console</h1>
            <span className="px-3 py-1 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">System Owner</span>
          </div>
          <p className="text-[var(--text-muted)] font-medium">Real-time platform oversight and growth analytics.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl font-bold hover:border-brand-500 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'brand', trend: '+12%' },
          { label: 'Active (7d)', value: stats.activeUsers, icon: Activity, color: 'emerald', trend: '+5%' },
          { label: 'New This Week', value: stats.newUsers, icon: UserPlus, color: 'violet', trend: '+18%' },
          { label: 'Total Workflows', value: stats.totalWorkflows, icon: Layers, color: 'indigo', trend: '+24%' }
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-main)] relative overflow-hidden group shadow-sm"
          >
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <item.icon size={80} />
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 text-${item.color}-500 flex items-center justify-center mb-6`}>
              <item.icon size={24} />
            </div>
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{item.label}</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl font-black">{item.value.toLocaleString()}</h3>
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{item.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signups Chart */}
        <div className="p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-black">User Growth</h3>
            </div>
            <select className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl px-3 py-1.5 text-xs font-bold outline-none">
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.signupsOverTime}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workflow Distribution */}
        <div className="p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-xl font-black">Top Architects</h3>
            </div>
            <p className="text-xs font-bold text-[var(--text-muted)]">Workflows per User</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topWorkflows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-app)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {analytics.topWorkflows.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Locations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Geo Distribution (Donut Chart) */}
        <div className="lg:col-span-1 p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h3 className="text-xl font-black">Geography</h3>
            </div>
          </div>
          <div className="flex bg-[var(--bg-app)] p-1 rounded-xl">
            <button
              onClick={() => setGeoFilter('country')}
              className={`w-1/3 px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${geoFilter === 'country' ? 'bg-brand-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              Country
            </button>
            <button
              onClick={() => setGeoFilter('state')}
              className={`w-1/3 px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${geoFilter === 'state' ? 'bg-brand-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              State
            </button>
            <button
              onClick={() => setGeoFilter('city')}
              className={`w-1/3 px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${geoFilter === 'city' ? 'bg-brand-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              City
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {(geoFilter === 'country' ? analytics.usersByCountry : (geoFilter === 'state' ? analytics.usersByState : analytics.usersByCity)).length > 0 ? (
              <>
                <div className="h-[250px] w-full mb-4 relative mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={geoFilter === 'country' ? analytics.usersByCountry : (geoFilter === 'state' ? analytics.usersByState : analytics.usersByCity)}>
                      <PolarGrid stroke="var(--border-main)" />
                      <PolarAngleAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar
                        name="Users"
                        dataKey="count"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.5}
                        animationDuration={1500}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem', fontWeight: 'bold' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full space-y-3 mt-4">
                  {(geoFilter === 'country' ? analytics.usersByCountry : (geoFilter === 'state' ? analytics.usersByState : analytics.usersByCity)).map((loc, i) => (
                    <div key={loc._id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-app)]/50 border border-transparent hover:border-[var(--border-main)] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-bold text-sm">{loc._id || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black">{loc.count}</span>
                        <span className="text-[10px] font-medium text-[var(--text-muted)]">({((loc.count / stats.totalUsers) * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-[var(--text-muted)] opacity-20" size={32} />
                </div>
                <p className="text-[var(--text-muted)] font-medium italic">No location data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* User Table Section */}
        <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="text-xl font-black">User Directory</h3>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="text-brand-500 font-black text-xs hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-main)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <th className="pb-4">Architect</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Workflows</th>
                  <th className="pb-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-main)]">
                {users.slice(0, 8).map((user) => (
                  <tr key={user.id} className="group">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-black">
                          {user.name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin'
                        ? 'bg-brand-500/10 text-brand-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-[var(--text-muted)]" />
                        <span className="font-bold text-sm">{user.workflowCount}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin size={10} /> {user.location?.city}, {user.location?.region}, {user.location?.country}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm">
        <div className="flex items-center gap-6 mb-6 sm:mb-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Platform Healthy</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Average Response Time</span>
            <span className="font-bold">124ms</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-xs font-black uppercase tracking-widest hover:border-brand-500 transition-all">
            <Clock size={14} /> System Logs
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all">
            <ExternalLink size={14} /> Database Atlas
          </button>
        </div>
      </div>
    </div>
  );
}
