import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, Image, MapPin, Home, Calendar } from 'lucide-react';

export default function ChatRoom() {
  const { chatId } = useParams();
  const { user, profile } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProvider = profile?.user_type === 'provider';
  const pathPrefix = isProvider ? '/provider' : '/consumer';

  useEffect(() => { if (chatId && user) { fetchChat(); fetchMessages(); } }, [chatId, user]);

  async function fetchChat() {
    const { data } = await supabase.from('chats').select(`*, consumer:profiles!chats_consumer_id_fkey(*, provider_profile:provider_profiles(*)), provider:profiles!chats_provider_id_fkey(*, provider_profile:provider_profiles(*)), booking:bookings(id, amount, quote_request:quote_requests(*))`).eq('id', chatId).single();
    setChat(data);
  }

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(id, name)').eq('chat_id', chatId).order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    setLoading(false);
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !user) return;
    await supabase.from('messages').insert({ chat_id: chatId, sender_id: user.id, content: newMsg.trim() });
    setNewMsg('');
    fetchMessages();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;
  if (!chat) return <div className="text-center py-12">채팅을 찾을 수 없습니다</div>;

  const other = isProvider ? chat.consumer : chat.provider;
  const name = other?.provider_profile?.business_name || other?.name || '사용자';

  return (
    <div className="flex flex-col h-[calc(100vh-64px-24px-80px)] sm:h-[calc(100vh-64px-24px-40px)] max-w-2xl mx-auto">
      <div className="bg-white border-b border-slate-200 p-4 sticky top-16 sm:top-0 z-10 flex items-center gap-3">
        <Link to={`${pathPrefix}/chats`} className="p-2 -ml-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
        <div><h3 className="font-bold text-slate-900">{name}</h3><p className="text-xs text-slate-500">{chat.booking?.quote_request?.service_type}</p></div>
      </div>
      {chat.booking && (
        <div className="bg-[#005088]/10 border-b border-[#005088]/20 p-4 flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-1 text-slate-600"><Home className="w-4 h-4 text-[#005088]" />{chat.booking.quote_request?.housing_type}</span>
          <span className="flex items-center gap-1 text-slate-600"><MapPin className="w-4 h-4 text-[#005088]" />{chat.booking.quote_request?.address}</span>
          <span className="flex items-center gap-1 text-slate-600"><Calendar className="w-4 h-4 text-[#005088]" />{chat.booking.quote_request?.preferred_date}</span>
          <span className="ml-auto font-bold text-[#005088]">{chat.booking.amount?.toLocaleString()}원</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3">
        {messages.map((m) => {
          const isMe = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? 'bg-[#005088] text-white rounded-br-md' : 'bg-white text-slate-900 rounded-bl-md shadow-sm'}`}>
                <p>{m.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-slate-400'}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="bg-white border-t border-slate-200 p-4 sticky bottom-16 sm:bottom-0 flex items-center gap-2">
        <button type="button" className="p-2 text-slate-400 hover:text-[#005088]"><Image className="w-5 h-5" /></button>
        <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="메시지를 입력하세요..." className="flex-1 px-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#005088]/20" />
        <button type="submit" disabled={!newMsg.trim()} className="p-2 bg-[#005088] text-white rounded-full hover:bg-[#003d66] disabled:opacity-50"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  );
}
