import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Wallet, Clock, CheckCircle } from 'lucide-react';

export default function ProviderSettlement() {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetch(); }, [user]);

  async function fetch() {
    try {
      const { data } = await supabase.from('settlements').select('*, booking:bookings(*, quote_request:quote_requests(*))').eq('provider_id', user!.id).order('created_at', { ascending: false });
      setSettlements(data || []);
    } finally { setLoading(false); }
  }

  const requestSettlement = async (id: string) => {
    await supabase.from('settlements').update({ status: 'completed' }).eq('id', id);
    fetch();
  };

  const pending = settlements.filter((s) => s.status === 'pending').reduce((sum, s) => sum + (s.amount || 0), 0);
  const completed = settlements.filter((s) => s.status === 'completed').reduce((sum, s) => sum + (s.amount || 0), 0);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">정산 관리</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
          <div><p className="text-sm text-slate-500">정산 대기 금액</p><p className="text-2xl font-bold text-slate-900">{pending.toLocaleString()}원</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="text-sm text-slate-500">정산 완료 금액</p><p className="text-2xl font-bold text-slate-900">{completed.toLocaleString()}원</p></div>
        </div>
      </div>
      {settlements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-2">정산 내역이 없습니다</h3><p className="text-slate-500">작업 완료 후 정산 요청이 생성됩니다.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200"><h2 className="font-bold text-slate-900">정산 내역</h2></div>
          <div className="divide-y divide-slate-100">
            {settlements.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.status === 'completed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>{s.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}</div>
                  <div><p className="font-medium text-slate-900">{s.booking?.quote_request?.service_type}</p><p className="text-sm text-slate-500">{s.booking?.quote_request?.address}</p></div>
                </div>
                <div className="text-right"><p className="font-bold text-slate-900">{s.amount?.toLocaleString()}원</p>{s.status === 'pending' && <button onClick={() => requestSettlement(s.id)} className="mt-1 text-sm text-[#005088] hover:underline">정산 신청</button>}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
