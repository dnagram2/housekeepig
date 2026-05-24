import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Home, Filter, Search } from 'lucide-react';

export default function BidPool() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchQuotes(); }, [user]);

  async function fetchQuotes() {
    try {
      const { data } = await supabase.from('quote_requests').select('*').neq('status', 'cancelled').neq('status', 'completed').order('created_at', { ascending: false });
      setQuotes(data || []);
    } finally { setLoading(false); }
  }

  const filtered = quotes.filter((q) => q.address.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-slate-900">입찰 대기 요청</h1><span className="text-sm text-slate-500">{filtered.length}건</span></div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="지역으로 검색..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><Filter className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-2">견적 요청이 없습니다</h3><p className="text-slate-500">현재 입찰 가능한 견적 요청이 없습니다.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <Link key={q.id} to={`/provider/bids/${q.id}`} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#005088]/50 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 bg-[#005088]/10 text-[#005088] text-xs font-medium rounded">{q.service_type}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${q.status === 'pending' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{q.status === 'pending' ? '입찰대기' : '입찰중'}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span className="truncate">{q.address}</span></div>
                <div className="flex items-center gap-2"><Home className="w-4 h-4 text-slate-400" />{q.housing_type} {q.size}평</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{q.preferred_date}</div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">{q.created_at.split('T')[0]}</span>
                <span className="text-sm text-[#005088] font-medium hover:underline">상세보기</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
