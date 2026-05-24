import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, CreditCard, CheckCircle, MessageSquare, Star } from 'lucide-react';

export default function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ongoing' | 'completed'>('ongoing');

  useEffect(() => { if (user) fetchBookings(); }, [user]);

  async function fetchBookings() {
    try {
      const { data } = await supabase.from('bookings').select(`*, quote_request:quote_requests(*), provider:profiles!bookings_provider_id_fkey(*, provider_profile:provider_profiles(*)), chat:chats(id)`).eq('consumer_id', user!.id).order('created_at', { ascending: false });
      setBookings(data || []);
    } finally { setLoading(false); }
  }

  const handlePayment = async (id: string) => {
    await supabase.from('bookings').update({ escrow_status: 'pending', status: 'in_progress' }).eq('id', id);
    fetchBookings();
  };

  const handleComplete = async (b: any) => {
    await supabase.from('bookings').update({ status: 'completed', completed_at: new Date().toISOString(), escrow_status: 'released' }).eq('id', b.id);
    await supabase.from('settlements').insert({ provider_id: b.provider_id, booking_id: b.id, amount: b.amount, status: 'pending' });
    fetchBookings();
  };

  const ongoing = bookings.filter((b) => b.status === 'escrow' || b.status === 'in_progress');
  const completed = bookings.filter((b) => b.status === 'completed');

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">예약 내역</h1>
      <div className="flex gap-2">
        <button onClick={() => setTab('ongoing')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'ongoing' ? 'bg-[#005088] text-white' : 'bg-white text-slate-600'}`}>진행중 ({ongoing.length})</button>
        <button onClick={() => setTab('completed')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'completed' ? 'bg-[#005088] text-white' : 'bg-white text-slate-600'}`}>완료 ({completed.length})</button>
      </div>

      {(tab === 'ongoing' ? ongoing : completed).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-2">{tab === 'ongoing' ? '진행중인 예약이 없습니다' : '완료된 예약이 없습니다'}</h3><p className="text-slate-500">견적을 요청하고 업체와 매칭해 보세요.</p></div>
      ) : (
        <div className="grid gap-4">
          {(tab === 'ongoing' ? ongoing : completed).map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#005088] rounded-full flex items-center justify-center text-white font-bold text-lg">{b.provider?.provider_profile?.business_name?.[0] || b.provider?.name?.[0]}</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{b.provider?.provider_profile?.business_name || b.provider?.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{b.quote_request?.service_type} - {b.quote_request?.address}</p>
                  </div>
                </div>
                <div className="text-right"><p className="text-xl font-bold text-[#005088]">{b.amount?.toLocaleString()}원</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${b.status === 'escrow' ? 'bg-amber-100 text-amber-700' : b.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{b.status === 'escrow' ? '결제 대기' : b.status === 'in_progress' ? '진행중' : '완료'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {b.status === 'escrow' && <button onClick={() => handlePayment(b.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg font-medium hover:bg-[#003d66]"><CreditCard className="w-4 h-4" />안전결제하기</button>}
                {b.status === 'in_progress' && <button onClick={() => handleComplete(b)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"><CheckCircle className="w-4 h-4" />작업 완료 승인</button>}
                {b.status === 'completed' && <Link to={`/consumer/review/${b.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg font-medium hover:bg-[#003d66]"><Star className="w-4 h-4" />리뷰 작성</Link>}
                {b.chat?.[0]?.id && <Link to={`/consumer/chats/${b.chat[0].id}`} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><MessageSquare className="w-4 h-4" />채팅</Link>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
