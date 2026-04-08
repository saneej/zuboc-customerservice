import React from 'react';
import { 
  Building, 
  Mail, 
  Shield, 
  Bell, 
  Globe, 
  Workflow, 
  Database,
  Users,
  CreditCard,
  ChevronRight
} from 'lucide-react';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: Building, label: 'Company Profile', desc: 'Manage your company details and branding' },
      { icon: Mail, label: 'Email Settings', desc: 'Configure support email addresses and templates' },
      { icon: Globe, label: 'Business Hours', desc: 'Set your team working hours and holidays' },
    ]
  },
  {
    title: 'Team & Security',
    items: [
      { icon: Users, label: 'Agents & Teams', desc: 'Manage support agents and department groups' },
      { icon: Shield, label: 'Roles & Permissions', desc: 'Define access levels for different user types' },
      { icon: Bell, label: 'Notifications', desc: 'Configure system and email alert rules' },
    ]
  },
  {
    title: 'Productivity',
    items: [
      { icon: Workflow, label: 'Automations', desc: 'Set up triggers and time-based rules' },
      { icon: Database, label: 'Custom Fields', desc: 'Add extra data fields to tickets and customers' },
      { icon: CreditCard, label: 'Billing', desc: 'Manage your subscription and invoices' },
    ]
  }
];

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure your workspace and team preferences.</p>
      </div>

      <div className="space-y-8">
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              {section.title}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {section.items.map((item) => (
                <button 
                  key={item.label}
                  className="w-full flex items-center p-6 hover:bg-slate-50 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mr-6">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{item.label}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Need help configuring Zuboc?</h3>
          <p className="text-indigo-200 text-sm max-w-md mb-6">
            Our support team is available 24/7 to help you set up your workspace and optimize your workflows.
          </p>
          <button className="px-6 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
            Contact Support
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-700 rounded-full -ml-16 -mb-16 opacity-30 blur-2xl"></div>
      </div>
    </div>
  );
}
