import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ArrowRight, Home, MapPin, Camera, Calendar, CheckCircle, Upload, Dog, AlertTriangle } from 'lucide-react';

const STEPS = [
  { id: 1, label: '서비스 종류', icon: Home },
  { id: 2, label: '주거 정보', icon: MapPin },
  { id: 3, label: '현장 사진', icon: Camera },
  { id: 4, label: '희망 일정', icon: Calendar },
];

export default function QuoteRequestForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    service_type: '' as '입주청소' | '이사청소' | '거주청소' | '',
    address: '',
    address_detail: '',
    housing_type: '' as '아파트' | '빌라' | '단독주택' | '',
    size: 0,
    photos: [] as string[],
    notes: '',
    has_pets: false,
    has_mold: false,
    preferred_date: '',
    preferred_time: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from('quote_requests').insert({
        consumer_id: user.id,
        service_type: formData.service_type,
        address: formData.address,
        address_detail: formData.address_detail,
        housing_type: formData.housing_type,
        size: formData.size,
        photos: formData.photos,
        notes: formData.notes,
        has_pets: formData.has_pets,
        has_mold: formData.has_mold,
        preferred_date: formData.preferred_date || null,
        preferred_time: formData.preferred_time,
        status: 'pending',
      });
      navigate('/consumer/quotes');
    } catch {
      alert('견적 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.service_type !== '';
      case 2: return formData.address && formData.housing_type && formData.size > 0;
      case 3: return true;
      case 4: return formData.preferred_date && formData.preferred_time;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-[#005088] text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="text-xs mt-2 text-slate-600 hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 rounded w-16 ${step > s.id ? 'bg-[#005088]' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">서비스 종류를 선택하세요</h2>
            <div className="grid gap-4">
              {[
                { type: '입주청소', desc: '이사 전 깨끗한 상태로 시작', img: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg' },
                { type: '이사청소', desc: '이사 준비 및 정리정돈', img: 'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg' },
                { type: '거주청소', desc: '주거 공간 정기 청소', img: 'https://images.pexels.com/photos/4239035/pexels-photo-4239035.jpeg' },
              ].map((s) => (
                <button key={s.type} type="button" onClick={() => setFormData({ ...formData, service_type: s.type as typeof formData.service_type })} className={`flex items-center gap-4 p-4 rounded-xl border-2 ${formData.service_type === s.type ? 'border-[#005088] bg-[#005088]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="w-16 h-16 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${s.img})` }} />
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{s.type}</div>
                    <div className="text-sm text-slate-500">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">주거 정보를 입력하세요</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">주소</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="서울특별시 강남구 역삼동 123" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">상세 주소 (선택)</label>
              <input type="text" value={formData.address_detail} onChange={(e) => setFormData({ ...formData, address_detail: e.target.value })} placeholder="101동 1001호" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">주거 형태</label>
              <div className="grid grid-cols-3 gap-4">
                {['아파트', '빌라', '단독주택'].map((t) => (
                  <button key={t} type="button" onClick={() => setFormData({ ...formData, housing_type: t as typeof formData.housing_type })} className={`py-3 rounded-lg border-2 font-medium ${formData.housing_type === t ? 'border-[#005088] bg-[#005088]/5 text-[#005088]' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">평수</label>
              <div className="flex items-center gap-4">
                <input type="number" value={formData.size || ''} onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })} placeholder="25" className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
                <span className="text-slate-500 font-medium">평</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">현장 사진 및 특이사항</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">현장 사진 (선택)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#005088] transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">사진을 업로드하세요</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">특이사항</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="청소가 필요한 특별한 부분이나 요청사항을 입력하세요" rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({ ...formData, has_pets: !formData.has_pets })} className={`flex items-center gap-3 p-4 rounded-xl border-2 ${formData.has_pets ? 'border-[#005088] bg-[#005088]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <Dog className={`w-6 h-6 ${formData.has_pets ? 'text-[#005088]' : 'text-slate-400'}`} />
                <span className="font-medium text-slate-900">반려동물</span>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, has_mold: !formData.has_mold })} className={`flex items-center gap-3 p-4 rounded-xl border-2 ${formData.has_mold ? 'border-[#005088] bg-[#005088]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <AlertTriangle className={`w-6 h-6 ${formData.has_mold ? 'text-[#005088]' : 'text-slate-400'}`} />
                <span className="font-medium text-slate-900">곰팡이</span>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">희망 일정을 선택하세요</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">희망 날짜</label>
              <input type="date" value={formData.preferred_date} onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">희망 시간</label>
              <div className="grid grid-cols-4 gap-2">
                {['오전 9시', '오전 10시', '오전 11시', '오후 12시', '오후 1시', '오후 2시', '오후 3시', '오후 4시'].map((t) => (
                  <button key={t} type="button" onClick={() => setFormData({ ...formData, preferred_time: t })} className={`py-2 rounded-lg border-2 text-sm font-medium ${formData.preferred_time === t ? 'border-[#005088] bg-[#005088]/5 text-[#005088]' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="w-4 h-4" /> 이전
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#005088] text-white font-bold hover:bg-[#003d66] disabled:opacity-50">
              다음 <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!canProceed() || loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#005088] text-white font-bold hover:bg-[#003d66] disabled:opacity-50">
              {loading ? '제출 중...' : '견적 요청하기'} <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
