import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Home, Calendar, Clock, MessageSquare, CheckCircle, Star } from 'lucide-react';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [quote, setQuote] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => { if (id && user) fetchQuote(); }, [id, user]);

  async function fetchQuote() {
    try {
      const { data: q } = await supabase.from('quote_requests').select('*').eq('id', id).single();
      setQuote(q);
      const { data: b } = await supabase.from('bids').select('*, provider:profiles!bids_provider_id_fkey(*, provider_profile:provider_profiles(*))').eq('quote_request_id', id).order('amount', { ascending: true });
      setBids(b || []);
    } finally { setLoading(false); }
  }

  // ✅ [새로 추가된 기능] 1:1 채팅 시작 함수
  const handleStartChat = async (bid: any) => {
    if (!user) return;
    try {
      // 1. 이미 이 업체와 열려있는 채팅방이 있는지 확인
      const { data: existingChats } = await supabase
        .from('chats')
        .select('id')
        .eq('consumer_id', user.id)
        .eq('provider_id', bid.provider_id);

      if (existingChats && existingChats.length > 0) {
        // 이미 채팅방이 존재하면 해당 채팅방으로 바로 이동
        navigate(`/consumer/chats/${existingChats[0].id}`);
        return;
      }

      // 2. 채팅방이 없다면 새 채팅방 생성
      const { data: chat, error } = await supabase.from('chats').insert({
        consumer_id: user.id,
        provider_id: bid.provider_id
      }).select().single();

      if (error) throw error;

      // 3. 생성된 채팅방으로 이동
      navigate(`/consumer/chats/${chat.id}`);
    } catch (error) {
      console.error('채팅 연결 오류:', error);
      alert('채팅방을 여는 중 문제가 발생했습니다. (업체를 먼저 선택해야 채팅이 가능할 수 있습니다.)');
    }
  };

  // 기존: 업체를 최종 선택(매칭)하는 함수
  const handleSelectBid = async (bid: any) => {
    if (!user || !quote) return;
    setSelecting(bid.id);
    try {
      // 1. 예약 생성
      const { data: booking } = await supabase.from('bookings').insert({
        quote_request_id: quote.id,
        bid_id: bid.id,
        consumer_id: user.id,
        provider_id: bid.provider_id,
        amount: bid.amount,
        status: 'escrow'
      }).select().single();

      // 2. 채팅방 생성
      const { data: chat } = await supabase.from('chats').insert({
        booking_id: booking.id,
        consumer_id: user.id,
        provider_id: bid.provider_id
      }).select().single();

      // 3. 자동 메시지 전송
      const consumerName = profile?.name || '고객';
      await supabase.from('messages').insert({
        chat_id: chat.id,
        sender_id: user.id,
        content: `안녕하세요! ${consumerName}입니다. 견적이 선택되었습니다. 상담을 진행해주세요.`
      });

      // 4. 입찰 상태 업데이트
      await supabase.from('bids').update({ status: 'accepted' }).eq('id', bid.id);

      // 5. 견적 요청 상태 업데이트
      await supabase.from('quote_requests').update({ status: 'matched' }).eq('id', quote.id);

      // 6. 채팅방으로 이동
      navigate(`/consumer/chats/${chat.id}`);
    } catch (error) {
      console.error('매칭 오류:', error);
      alert('매칭 중 오류가 발생했습니다.');
      setSelecting(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;
  if (!quote) return <div className="text-center py-12">견적을 찾을 수 없습니다. <Link to="/consumer/quotes" className="text-[#005088]">목록으로</Link></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{quote.service_type}</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">주소</p>
              <p className="font-medium text-slate-900">{quote.address}</p>
              {quote.address_detail && <p className="text-sm text-slate-500">{quote.address_detail}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-slate-400" />
            <p className="font-medium text-slate-900">{quote.housing_type} {quote.size}평</p>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <p className="font-medium text-slate-900">{quote.preferred_date}</p>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <p className="font-medium text-slate-900">{quote.preferred_time}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900">입찰 제안 ({bids.length}개)</h2>

      {bids.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">아직 입찰이 없습니다</p>
          <p className="text-sm text-slate-400 mt-2">업체들이 견적을 제안하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bids.map((bid) => {
            const isSelectingThis = selecting === bid.id;
            const isAccepted = bid.status === 'accepted';
            const canSelect = bid.status === 'pending' && quote.status === 'bidding';

            return (
              <div key={bid.id} className={`bg-white rounded-xl border-2 p-6 ${isAccepted ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#005088] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {bid.provider?.provider_profile?.business_name?.[0] || bid.provider?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{bid.provider?.provider_profile?.business_name || bid.provider?.name}</h3>
                        {bid.provider?.provider_profile?.verified && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">인증업체</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {bid.provider?.provider_profile?.rating?.toFixed(1) || '0.0'}점
                        </span>
                        <span>리뷰 {bid.provider?.provider_profile?.review_count || 0}개</span>
                      </div>
                      {bid.comment && (
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm mt-2">
                          {bid.comment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:min-w-[150px] flex flex-col justify-start items-end">
                    <p className="text-2xl font-bold text-[#005088]">{bid.amount?.toLocaleString()}원</p>
                    
                    {/* ✅ 추가된 1:1 채팅하기 버튼 */}
                    <button
                      onClick={() => handleStartChat(bid)}
                      className="mt-3 w-full px-4 py-2 bg-white border border-[#005088] text-[#005088] rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      1:1 채팅하기
                    </button>

                    {/* 기존 선택하기 버튼 */}
                    {canSelect && (
                      <button
                        onClick={() => handleSelectBid(bid)}
                        disabled={selecting !== null}
                        className="mt-2 w-full px-4 py-2.5 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50 transition-colors"
                      >
                        {isSelectingThis ? '매칭 중...' : '선택하기'}
                      </button>
                    )}

                    {isAccepted && (
                      <div className="mt-3 flex items-center justify-end gap-1 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">선택됨</span>
                      </div>
                    )}
                    
                    {bid.status === 'rejected' && (
                      <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                        거절됨
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-100 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-600">
          업체를 선택하면 자동으로 1:1 채팅이 시작되며, 상담을 진행할 수 있습니다.
        </p>
      </div>
    </div>
  );
}