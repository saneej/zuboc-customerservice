import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  User as UserIcon,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Ticket, label: 'Tickets', path: '/tickets' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Users, label: 'Team', path: '/team', adminOnly: true },
  { icon: BookOpen, label: 'Knowledge Base', path: '/kb' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const filteredNavItems = navItems.filter(item => !item.adminOnly || profile?.role === 'admin');

  const toggleAvailability = async () => {
    if (!profile) return;
    try {
      const newStatus = !profile.is_available;
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: newStatus })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success(newStatus ? "You are now online" : "You are now on leave");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-zuboc-cream overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-zuboc-plum text-white/70 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-zuboc-plum/10",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-white/10">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img 
                src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
                alt="Zuboc Logo" 
                className="w-full h-full object-contain filter invert brightness-0"
                referrerPolicy="no-referrer"
              />
            </div>
            {isSidebarOpen && <span className="ml-3 font-serif italic text-xl text-white">Desk</span>}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", !isSidebarOpen && "mx-auto")} />
                  {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-white/10">
            <div className={cn(
              "flex items-center",
              isSidebarOpen ? "px-2" : "justify-center"
            )}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-white/40" />
                )}
              </div>
              {isSidebarOpen && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Agent'}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold truncate">{profile?.role}</p>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <div className="mt-4 px-2">
                <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    profile?.is_available 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  )}
                >
                  <div className="flex items-center">
                    {profile?.is_available ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <Coffee className="w-3 h-3 mr-2" />}
                    {profile?.is_available ? 'Online' : 'On Leave'}
                  </div>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    profile?.is_available ? "bg-emerald-400" : "bg-amber-400"
                  )}></div>
                </button>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className={cn(
                "mt-6 w-full flex items-center px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zuboc-plum/5 flex items-center justify-between px-10 flex-shrink-0">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-zuboc-cream text-zuboc-plum/50 mr-6 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="max-w-md w-full relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zuboc-plum/30" />
              <input 
                type="text" 
                placeholder="Search tickets, customers, articles..."
                className="w-full bg-zuboc-cream/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all placeholder:text-zuboc-plum/30"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2.5 rounded-xl hover:bg-zuboc-cream text-zuboc-plum/50 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-zuboc-plum rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
