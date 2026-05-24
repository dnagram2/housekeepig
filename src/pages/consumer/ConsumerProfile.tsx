import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Camera, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConsumerProfile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) { setName(profile.name || ''); setPhone(profile.phone || ''); }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ name, phone }).eq('id', user.id);
      await refreshProfile();
      alert('저장되었습니다.');
    } finally { setSaving(false); }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">내 정보</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-[#005088] rounded-full flex items-center justify-center">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-10 h-10 text-white" />}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-50"><Camera className="w-4 h-4 text-slate-600" /></button>
          </div>
          <div><h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2><p className="text-slate-500">{profile?.email}</p></div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1"><Mail className="w-4 h-4 inline mr-1" />이메일</label>
            <input type="email" value={profile?.email || ''} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1"><Phone className="w-4 h-4 inline mr-1" />연락처</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50">{saving ? '저장 중...' : '저장하기'}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">계정</h3>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"><LogOut className="w-5 h-5" />로그아웃</button>
      </div>
    </div>
  );
}
