import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react';

export default function WriteReview() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (bookingId && user) fetchBooking(); }, [bookingId, user]);

  async function fetchBooking() {
    try {
      const { data } = await supabase.from('bookings').select(`*, quote_request:quote_requests(*), provider:profiles!bookings_provider_id_fkey(*, provider_profile:provider_profiles(*))`).eq('id', bookingId).single();
      setBooking(data);
    } finally { setLoading(false); }
  }

  const handleSubmit = async () => {
    if (!user || !booking) return;
    setSubmitting(true);
    try {
      await supabase.from('reviews').insert({ booking_id: booking.id, consumer_id: user.id, provider_id: booking.provider_id, rating, content, before_photos: [], after_photos: [] });
      navigate('/consumer/bookings');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;
  if (!booking) return <div className="text-center py-12">예약을 찾을 수 없습니다. <Link to="/consumer/bookings" className="text-[#005088]">목록으로</Link></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4"><Link to="/consumer/bookings" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link><h1 className="text-2xl font-bold text-slate-900">리뷰 작성</h1></div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#005088] rounded-full flex items-center justify-center text-white font-bold">{booking.provider?.provider_profile?.business_name?.[0] || booking.provider?.name?.[0]}</div>
          <div><h3 className="font-bold text-slate-900">{booking.provider?.provider_profile?.business_name || booking.provider?.name}</h3><p className="text-sm text-slate-500">{booking.quote_request?.service_type}</p></div>
          <div className="ml-auto text-right"><p className="text-lg font-bold text-[#005088]">{booking.amount?.toLocaleString()}원</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">평점</label>
          <div className="flex gap-2">{[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className="p-1">
              <Star className={`w-8 h-8 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">리뷰 내용</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="서비스 만족도, 특이사항 등을 작성해주세요" rows={5} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none resize-none" />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><ImageIcon className="w-5 h-5" />Before 사진</button>
          <button className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><ImageIcon className="w-5 h-5" />After 사진</button>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!content.trim() || submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50">
        <Send className="w-5 h-5" />{submitting ? '작성 중...' : '리뷰 제출하기'}
      </button>
    </div>
  );
}
