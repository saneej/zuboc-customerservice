import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Open Tickets', value: '0', change: '0%', trend: 'up', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: '0', change: '0%', trend: 'down', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved Today', value: '0', change: '0%', trend: 'up', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'SLA Breaches', value: '0', change: '0%', trend: 'down', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const { data: tickets, error } = await supabase.from('tickets').select('status, created_at');
      if (error) throw error;

      const openCount = tickets.filter(t => t.status === 'open' || t.status === 'new').length;
      const pendingCount = tickets.filter(t => t.status === 'pending').length;
      const resolvedToday = tickets.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return t.status === 'resolved' && t.created_at.startsWith(today);
      }).length;

      setStats([
        { label: 'Open Tickets', value: openCount.toString(), change: '+0%', trend: 'up', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending', value: pendingCount.toString(), change: '0%', trend: 'down', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Resolved Today', value: resolvedToday.toString(), change: '+0%', trend: 'up', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'SLA Breaches', value: '0', change: '0%', trend: 'down', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
      ]);

      // Generate chart data (last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: days[d.getDay()],
          date: d.toISOString().split('T')[0],
          tickets: 0,
          resolved: 0
        };
      });

      tickets.forEach(t => {
        const ticketDate = t.created_at.split('T')[0];
        const day = last7Days.find(d => d.date === ticketDate);
        if (day) {
          day.tickets++;
          if (t.status === 'resolved') day.resolved++;
        }
      });

      setChartData(last7Days);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-zuboc-plum/20 mb-4" />
        <p className="text-zuboc-plum/40 font-light">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Dashboard</h1>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-zuboc-plum rounded-lg text-sm font-medium text-white hover:bg-zuboc-plum/90 transition-colors shadow-sm">
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                stat.trend === 'up' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Ticket Volume Trends</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTickets)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">Sarah Miller</span> replied to <span className="text-indigo-600 font-medium">#4521</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
