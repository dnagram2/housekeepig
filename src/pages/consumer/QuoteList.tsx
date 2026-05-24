import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Home, Plus, Star } from 'lucide-react';

export default function QuoteList() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchQuotes(); }, [user]);

  async function fetchQuotes() {
    try {
      const { data } = await supabase.from('quote_requests').select('*, bids(*, provider:profiles!bids_provider_id_fkey(*, provider_profile:provider_profiles(*)))').eq('consumer_id', user!.id).order('created_at', { ascending: false });
      setQuotes(data || []);
    } finally { setLoading(false); }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { pending: 'bg-slate-100 text-slate-600', bidding: 'bg-amber-100 text-amber-700', matched: 'bg-[#005088]/10 text-[#005088]', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600' };
    const labels: Record<string, string> = { pending: '대기중', bidding: '입찰중', matched: '매칭완료', completed: '완료', cancelled: '취소' };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">내 견적 관리</h1>
        <Link to="/consumer/quotes/new" className="flex items-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg"><Plus className="w-4 h-4" />새 견적 요청</Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">아직 요청한 견적이 없습니다</h3>
          <p className="text-slate-500 mb-6">새로운 청소 서비스 견적을 요청해 보세요.</p>
          <Link to="/consumer/quotes/new" className="inline-flex items-center gap-2 px-6 py-3 bg-[#005088] text-white rounded-lg font-medium">견적 신청하기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2"><h3 className="text-lg font-bold text-slate-900">{q.service_type}</h3>{getStatusBadge(q.status)}</div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{q.address}</span>
                    <span className="flex items-center gap-1"><Home className="w-4 h-4" />{q.housing_type} {q.size}평</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{q.preferred_date}</span>
                  </div>
                </div>
                <Link to={`/consumer/quotes/${q.id}`} className="text-[#005088] hover:underline">상세보기</Link>
              </div>
              {q.bids?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-3"><span className="font-medium text-[#005088]">{q.bids.length}개</span>의 입찰이 있습니다</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {q.bids.slice(0, 3).map((b: any) => (
                      <div key={b.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#005088]/10 rounded-full flex items-center justify-center"><Star className="w-4 h-4 text-[#005088]" /></div>
                          <div>
                            <div className="font-medium text-slate-900">{b.provider?.provider_profile?.business_name || b.provider?.name}</div>
                            <div className="text-xs text-slate-500">{b.provider?.provider_profile?.rating || 0}점 ({b.provider?.provider_profile?.review_count || 0}리뷰)</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-[#005088]">{b.amount?.toLocaleString()}원</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
