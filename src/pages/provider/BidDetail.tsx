import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Home, Calendar, Clock, Dog, AlertTriangle, ArrowLeft, Send } from 'lucide-react';

export default function BidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState<any>(null);
  const [existingBid, setExistingBid] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (id && user) fetch(); }, [id, user]);

  async function fetch() {
    try {
      const { data: q } = await supabase.from('quote_requests').select('*').eq('id', id).single();
      setQuote(q);
      const { data: b } = await supabase.from('bids').select('*').eq('quote_request_id', id).eq('provider_id', user!.id).maybeSingle();
      if (b) { setExistingBid(b); setAmount(b.amount.toString()); setComment(b.comment || ''); }
    } finally { setLoading(false); }
  }

  const handleSubmit = async () => {
    if (!user || !quote || !amount) return;
    setSubmitting(true);
    try {
      if (existingBid) {
        await supabase.from('bids').update({ amount: parseInt(amount), comment }).eq('id', existingBid.id);
      } else {
        await supabase.from('bids').insert({ quote_request_id: quote.id, provider_id: user.id, amount: parseInt(amount), comment, status: 'pending' });
        if (quote.status === 'pending') await supabase.from('quote_requests').update({ status: 'bidding' }).eq('id', quote.id);
      }
      navigate('/provider/bids');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;
  if (!quote) return <div className="text-center py-12">견적을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4"><Link to="/provider/bids" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link><h1 className="text-2xl font-bold text-slate-900">견적 요청 상세</h1></div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{quote.service_type}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-500">주소</p><p className="font-medium text-slate-900">{quote.address}</p>{quote.address_detail && <p className="text-sm text-slate-500">{quote.address_detail}</p>}</div></div>
          <div className="flex items-center gap-3"><Home className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-500">주거형태</p><p className="font-medium text-slate-900">{quote.housing_type} {quote.size}평</p></div></div>
          <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-500">희망 날짜</p><p className="font-medium text-slate-900">{quote.preferred_date}</p></div></div>
          <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-500">희망 시간</p><p className="font-medium text-slate-900">{quote.preferred_time}</p></div></div>
        </div>
        {(quote.has_pets || quote.has_mold || quote.notes) && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-2">{quote.has_pets && <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"><Dog className="w-4 h-4" />반려동물</span>}{quote.has_mold && <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"><AlertTriangle className="w-4 h-4" />곰팡이</span>}</div>
            {quote.notes && <p className="mt-3 text-slate-600 bg-slate-50 p-3 rounded-lg">{quote.notes}</p>}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-900">{existingBid ? '입찰 수정하기' : '입찰 제안하기'}</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">제안 금액</label>
          <div className="relative max-w-xs"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="금액을 입력하세요" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">원</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">작업 코멘트</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="어떻게 작업할지 설명해 주세요 (선택)" rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none resize-none" />
        </div>
        <button onClick={handleSubmit} disabled={!amount || submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50"><Send className="w-5 h-5" />{submitting ? '제출 중...' : existingBid ? '입찰 수정하기' : '입찰 제출하기'}</button>
      </div>
    </div>
  );
}
