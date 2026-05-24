import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Clock } from 'lucide-react';

export default function ChatList() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isProvider = profile?.user_type === 'provider';
  const pathPrefix = isProvider ? '/provider' : '/consumer';

  useEffect(() => { if (user) fetchChats(); }, [user]);

  async function fetchChats() {
    try {
      const field = isProvider ? 'provider_id' : 'consumer_id';
      const { data } = await supabase.from('chats').select(`*, consumer:profiles!chats_consumer_id_fkey(*, provider_profile:provider_profiles(*)), provider:profiles!chats_provider_id_fkey(*, provider_profile:provider_profiles(*)), booking:bookings(*, quote_request:quote_requests(*))`).eq(field, user!.id).order('created_at', { ascending: false });
      setChats(data || []);
    } finally { setLoading(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">채팅</h1>
      {chats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-2">진행중인 채팅이 없습니다</h3><p className="text-slate-500">업체와 매칭되면 채팅이 시작됩니다.</p></div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const other = isProvider ? chat.consumer : chat.provider;
            const name = other?.provider_profile?.business_name || other?.name || '사용자';
            return (
              <Link key={chat.id} to={`${pathPrefix}/chats/${chat.id}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-[#005088]/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#005088] rounded-full flex items-center justify-center text-white font-bold">{name?.[0]}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{name}</h3>
                    <p className="text-xs text-slate-500">{chat.booking?.quote_request?.service_type}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
