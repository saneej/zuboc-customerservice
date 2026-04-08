import React from 'react';
import { 
  Building2, 
  Mail, 
  Clock, 
  Users, 
  Shield, 
  ChevronRight,
  Globe,
  Bell,
  Lock,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { 
        icon: Building2, 
        label: 'Company Profile', 
        description: 'Manage your company details and branding',
        path: '/settings/company'
      },
      { 
        icon: Mail, 
        label: 'Email Settings', 
        description: 'Configure support email addresses and templates',
        path: '/settings/email'
      },
      { 
        icon: Clock, 
        label: 'Business Hours', 
        description: 'Set your team working hours and holidays',
        path: '/settings/hours'
      },
    ]
  },
  {
    title: 'Team & Security',
    items: [
      { 
        icon: Users, 
        label: 'Agents & Teams', 
        description: 'Manage support agents and department groups',
        path: '/team'
      },
      { 
        icon: Shield, 
        label: 'Roles & Permissions', 
        description: 'Define access levels for different user types',
        path: '/settings/roles'
      },
      { 
        icon: Lock, 
        label: 'Security', 
        description: 'Configure SSO, 2FA and security policies',
        path: '/settings/security'
      },
    ]
  },
  {
    title: 'System',
    items: [
      { 
        icon: Bell, 
        label: 'Notifications', 
        description: 'Configure system and desktop notifications',
        path: '/settings/notifications'
      },
      { 
        icon: Database, 
        label: 'Data & Privacy', 
        description: 'Manage data retention and privacy settings',
        path: '/settings/data'
      },
    ]
  }
];

export default function Settings() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-serif italic text-zuboc-plum mb-2">Settings</h1>
        <p className="text-slate-500">Configure and manage your help desk workspace</p>
      </div>

      <div className="space-y-12">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">{section.title}</h2>
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
              {section.items.map((item, idx) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center p-6 hover:bg-slate-50 transition-all group",
                    idx !== section.items.length - 1 && "border-b border-slate-100"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-zuboc-plum/5 group-hover:text-zuboc-plum transition-all">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 mb-0.5">{item.label}</h3>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-zuboc-plum group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
