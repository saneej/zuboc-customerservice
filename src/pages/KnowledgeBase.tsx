import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Book, 
  FileText, 
  Folder, 
  ChevronRight, 
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Globe,
  Lock
} from 'lucide-react';

const mockArticles = [
  { id: 1, title: 'How to reset your password', category: 'Account Security', status: 'published', author: 'Sarah M.', views: 1250, updated: '2 days ago' },
  { id: 2, title: 'Setting up custom domains', category: 'Configuration', status: 'published', author: 'Alex K.', views: 840, updated: '5 days ago' },
  { id: 3, title: 'Billing and subscription FAQ', category: 'Billing', status: 'draft', author: 'Sarah M.', views: 0, updated: '1 hour ago' },
  { id: 4, title: 'API Authentication Guide', category: 'Developers', status: 'published', author: 'Alex K.', views: 2100, updated: '1 week ago' },
];

const categories = [
  { name: 'Getting Started', articles: 12, icon: Globe },
  { name: 'Account Security', articles: 5, icon: Lock },
  { name: 'Billing & Payments', articles: 8, icon: FileText },
  { name: 'API & Integrations', articles: 15, icon: Book },
];

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-500">Manage help articles and documentation for your customers.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            View Public Help Center
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('articles')}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-all",
            activeTab === 'articles' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Articles
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-all",
            activeTab === 'categories' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Categories
        </button>
      </div>

      {activeTab === 'articles' ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search articles..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select className="text-sm border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-600">
                <option>All Categories</option>
                {categories.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
              <select className="text-sm border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-600">
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-slate-400 mr-3" />
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {article.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{article.category}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        article.status === 'published' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{article.views.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{article.updated}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <cat.icon className="w-6 h-6" />
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{cat.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{cat.articles} articles in this category</p>
              <div className="mt-6 flex items-center text-indigo-600 text-sm font-bold">
                Manage Articles
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
          <button className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all">
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-bold">Add New Category</span>
          </button>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
