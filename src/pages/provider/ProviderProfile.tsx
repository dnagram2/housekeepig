import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Phone, MapPin, Star, Camera } from 'lucide-react';

const SERVICES = ['입주청소', '이사청소', '거주청소', '입력청소', '에어컨청소', '곰팡이제거'];
const REGIONS = ['서울 강남구', '서울 강동구', '서울 강북구', '서울 강서구', '경기 고양시', '경기 성남시', '경기 용인시', '인천 남동구'];

export default function ProviderProfile() {
  const { user, providerProfile, profile, refreshProfile } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (providerProfile) {
      setBusinessName(providerProfile.business_name || '');
      setDesc(providerProfile.description || '');
      setSpecialties(providerProfile.specialties || []);
      setRegions(providerProfile.service_areas || []);
    }
    if (profile) setPhone(profile.phone || '');
  }, [providerProfile, profile]);

  const handleSave = async () => {
    if (!user || !providerProfile) return;
    setSaving(true);
    try {
      await supabase.from('provider_profiles').update({ business_name: businessName, description: desc, specialties, service_areas: regions }).eq('id', providerProfile.id);
      await supabase.from('profiles').update({ phone, name: businessName }).eq('id', user.id);
      await refreshProfile();
      alert('저장되었습니다.');
    } finally { setSaving(false); }
  };

  const toggle = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">업체 프로필 관리</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-[#005088] rounded-full flex items-center justify-center text-white font-bold text-2xl">{businessName?.[0] || '업'}</div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-50"><Camera className="w-4 h-4 text-slate-600" /></button>
          </div>
          <div>
            <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-slate-900">{businessName || '업체명'}</h2>{providerProfile?.verified && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">인증업체</span>}</div>
            <div className="flex items-center gap-4 mt-1"><span className="flex items-center gap-1 text-sm text-slate-500"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{providerProfile?.rating?.toFixed(1) || '0.0'}점</span><span className="text-sm text-slate-500">리뷰 {providerProfile?.review_count || 0}개</span></div>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1"><Building2 className="w-4 h-4 inline mr-1" />업체명</label><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="업체명을 입력하세요" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">업체 소개</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="업체를 소개해 주세요" rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none resize-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1"><Phone className="w-4 h-4 inline mr-1" />연락처</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-1234-5678" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none" /></div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">전문 분야</label>
          <div className="flex flex-wrap gap-2">{SERVICES.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s, specialties, setSpecialties)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${specialties.includes(s) ? 'bg-[#005088] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
          ))}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2"><MapPin className="w-4 h-4 inline mr-1" />서비스 지역</label>
          <div className="flex flex-wrap gap-2">{REGIONS.map((r) => (
            <button key={r} type="button" onClick={() => toggle(r, regions, setRegions)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${regions.includes(r) ? 'bg-[#005088] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{r}</button>
          ))}</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50">{saving ? '저장 중...' : '저장하기'}</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">고객 리뷰 ({providerProfile?.review_count || 0}개)</h3>
        {providerProfile?.review_count === 0 && <p className="text-slate-500 text-sm">아직 리뷰가 없습니다.</p>}
      </div>
    </div>
  );
}
