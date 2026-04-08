import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  ArrowLeft, 
  Loader2,
  Globe,
  Camera,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workspace, setWorkspace] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    address: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchWorkspace();
  }, []);

  async function fetchWorkspace() {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setWorkspace(data);
      setFormData({
        name: data.name || '',
        website: data.settings?.website || '',
        address: data.settings?.address || '',
        logo_url: data.settings?.logo_url || ''
      });
    } catch (error: any) {
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: formData.name,
          settings: {
            ...workspace.settings,
            website: formData.website,
            address: formData.address,
            logo_url: formData.logo_url
          }
        })
        .eq('id', workspace.id);

      if (error) throw error;
      toast.success('Company profile updated');
    } catch (error: any) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zuboc-plum/20" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/settings" className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-zuboc-plum transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-serif italic text-zuboc-plum">Company Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-zuboc-plum text-white rounded-2xl font-bold text-sm hover:bg-zuboc-plum/90 transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center space-x-8 mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-zuboc-plum/30 transition-all">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-zuboc-plum transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Company Branding</h2>
            <p className="text-xs text-slate-500">Upload your company logo and customize your workspace identity</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Company Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all"
              placeholder="Zuboc Desk Inc."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Website URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all"
                placeholder="https://zuboc.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Office Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
              <textarea 
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all resize-none"
                placeholder="123 Business Ave, Suite 100\nDubai, UAE"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
