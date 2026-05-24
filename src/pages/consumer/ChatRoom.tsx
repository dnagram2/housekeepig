import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

export default function ChatRoom() {
  const { id } = useParams(); // URL에서 채팅방 ID를 가져옴
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 스크롤을 항상 맨 아래로 내리기 위한 참조
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 초기 진입 시 메시지 불러오기 및 실시간 구독 설정
  useEffect(() => {
    if (!id || !user) return;

    // 1. 기존 메시지 불러오기
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    // 2. Supabase 실시간(Realtime) 구독 설정 (새 메시지가 오면 즉시 화면에 반영)
    const messageSubscription = supabase
      .channel(`chat_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${id}`
        },
        (payload) => {
          // 내가 보낸 메시지가 아닐 때만(또는 모든 새 메시지를) 목록에 추가
          setMessages((prev) => {
            // 중복 추가 방지
            const isExist = prev.find(m => m.id === payload.new.id);
            if (isExist) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    // 컴포넌트가 언마운트될 때 구독 해제
    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [id, user]);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송 함수
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !id) return;

    const messageContent = inputText;
    setInputText(''); // 입력창 미리 비우기 (빠른 반응성을 위해)

    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: id,
        sender_id: user.id,
        content: messageContent,
      });

      if (error) throw error;
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="max-w-2xl mx-auto h-[80vh] flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="font-bold text-slate-900 text-lg">1:1 상담 채팅</h1>
      </div>

      {/* 메시지 목록 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
            인사를 건네며 상담을 시작해보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id; // 내가 보낸 메시지인지 판별

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-[#005088] text-white rounded-tr-sm' // 내 말풍선 (파란색)
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm' // 상대방 말풍선 (흰색)
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        {/* 스크롤을 맨 아래로 내리기 위한 투명한 div */}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="bg-white border-t border-slate-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005088]/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-[#005088] text-white rounded-full hover:bg-[#003d66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}