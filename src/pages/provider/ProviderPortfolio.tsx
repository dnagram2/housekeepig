import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Image, X, Pencil } from 'lucide-react';

export default function ProviderPortfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) fetch(); }, [user]);

  async function fetch() {
    try {
      const { data } = await supabase.from('portfolios').select('*').eq('provider_id', user!.id).order('created_at', { ascending: false });
      setItems(data || []);
    } finally { setLoading(false); }
  }

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('portfolios').update({ title, description: desc }).eq('id', editing.id);
      } else {
        await supabase.from('portfolios').insert({ provider_id: user!.id, title, description: desc });
      }
      setShowForm(false); setEditing(null); setTitle(''); setDesc('');
      fetch();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('portfolios').delete().eq('id', id);
    fetch();
  };

  const openEdit = (item: any) => { setEditing(item); setTitle(item.title); setDesc(item.description || ''); setShowForm(true); };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-slate-900">포트폴리오 관리</h1><button onClick={() => { setEditing(null); setTitle(''); setDesc(''); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg"><Plus className="w-4 h-4" />새 포트폴리오</button></div>
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center"><h2 className="font-bold text-slate-900">{editing ? '포트폴리오 수정' : '새 포트폴리오 등록'}</h2><button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-500" /></button></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">제목</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 깨끗해진 오피스텔 입주청소" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">설명</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="작업 내용 설명" rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#005088]"><Image className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500">Before 사진</p></div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#005088]"><Image className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500">After 사진</p></div>
          </div>
          <button onClick={handleSubmit} disabled={!title.trim() || saving} className="w-full py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50">{saving ? '저장 중...' : '저장하기'}</button>
        </div>
      )}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><Image className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-2">포트폴리오가 없습니다</h3><p className="text-slate-500">작업한 현장 사진을 등록하여 고객들에게 보여주세요.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="aspect-square bg-slate-100 relative flex items-center justify-center"><Image className="w-8 h-8 text-slate-300" /><span className="absolute bottom-1 left-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded">Before</span></div>
                <div className="aspect-square bg-slate-100 relative flex items-center justify-center"><Image className="w-8 h-8 text-slate-300" /><span className="absolute bottom-1 right-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded">After</span></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                {item.description && <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm"><Pencil className="w-4 h-4" />수정</button>
                  <button onClick={() => handleDelete(item.id)} className="py-2 px-4 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 text-sm">삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
