import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Briefcase, Wallet, TrendingUp, Clock, Star } from 'lucide-react';

export default function ProviderHome() {
  const { user, providerProfile, profile } = useAuth();
  const [stats, setStats] = useState({ bids: 0, inProgress: 0, completed: 0, earnings: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetch(); }, [user]);

  async function fetch() {
    try {
      const { data: requests } = await supabase.from('quote_requests').select('*, consumer:profiles!quote_requests_consumer_id_fkey(name)').in('status', ['pending', 'bidding']).order('created_at', { ascending: false }).limit(5);
      setRecent(requests || []);
      const [bidsRes, bookingsRes] = await Promise.all([
        supabase.from('bids').select('id', { count: 'exact' }).eq('provider_id', user!.id).eq('status', 'pending'),
        supabase.from('bookings').select('amount, status').eq('provider_id', user!.id),
      ]);
      const inProgress = bookingsRes.data?.filter((b) => b.status === 'in_progress').length || 0;
      const completed = bookingsRes.data?.filter((b) => b.status === 'completed').length || 0;
      const earnings = bookingsRes.data?.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.amount || 0), 0) || 0;
      setStats({ bids: bidsRes.count || 0, inProgress, completed, earnings });
    } finally { setLoading(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#005088] to-[#003d66] rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">반갑습니다, {providerProfile?.business_name || profile?.name}님!</h1>
        <p className="text-slate-300 text-sm mb-4">{providerProfile?.verified ? '인증된 업체로 활동 중입니다' : '새로운 견적 요청이 들어왔습니다'}</p>
        <div className="flex items-center gap-6 text-sm">
          <div><span className="text-slate-300">평점</span><p className="text-lg font-bold">{providerProfile?.rating?.toFixed(1) || '0.0'}</p></div>
          <div><span className="text-slate-300">리뷰</span><p className="text-lg font-bold">{providerProfile?.review_count || 0}개</p></div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ icon: FileText, label: '입찰 대기', value: stats.bids, bg: 'bg-amber-500', link: '/provider/bids' }, { icon: Briefcase, label: '진행중', value: stats.inProgress, bg: 'bg-[#005088]', link: '/provider/bookings' }, { icon: TrendingUp, label: '완료', value: stats.completed, bg: 'bg-emerald-600', link: '/provider/bookings' }, { icon: Wallet, label: '총 수익', value: `${stats.earnings?.toLocaleString()}원`, bg: 'bg-violet-600', link: '/provider/settlement' }].map((c, i) => (
          <Link key={i} to={c.link} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg">
            <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center mb-3`}><c.icon className="w-5 h-5 text-white" /></div>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-slate-900">최근 견적 요청</h2><Link to="/provider/bids" className="text-sm text-[#005088] hover:underline">전체보기</Link></div>
        {recent.length === 0 ? (
          <div className="text-center py-8"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">현재 입찰 가능한 견적 요청이 없습니다</p></div>
        ) : (
          <div className="space-y-3">
            {recent.map((r) => (
              <Link key={r.id} to={`/provider/bids/${r.id}`} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#005088]/10 rounded-lg flex items-center justify-center"><Briefcase className="w-5 h-5 text-[#005088]" /></div>
                  <div><h3 className="font-medium text-slate-900">{r.service_type}</h3><p className="text-sm text-slate-500">{r.address}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-medium text-slate-900">{r.size}평</p><p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{r.preferred_date}</p></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
