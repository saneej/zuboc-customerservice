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
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Ticket, label: 'Tickets', path: '/tickets' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: BookOpen, label: 'Knowledge Base', path: '/kb' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-slate-300 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img 
                src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
                alt="Zuboc Logo" 
                className="w-full h-full object-contain filter invert"
                referrerPolicy="no-referrer"
              />
            </div>
            {isSidebarOpen && (
              <span className="ml-3 text-white font-semibold text-lg tracking-tight">Zuboc</span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-indigo-600 text-white" 
                      : "hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", !isSidebarOpen && "mx-auto")} />
                  {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className={cn(
              "flex items-center",
              isSidebarOpen ? "px-2" : "justify-center"
            )}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              {isSidebarOpen && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Agent'}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{profile?.role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className={cn(
                "mt-4 w-full flex items-center px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3 font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 mr-4"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="max-w-md w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tickets, customers, articles..."
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-y-4">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
