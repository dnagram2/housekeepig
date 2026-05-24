import { Link } from 'react-router-dom';
import { Sparkles, FileText, MessageSquare, Users, ArrowRight } from 'lucide-react';

export default function ConsumerHome() {
  const actions = [
    { icon: Sparkles, title: '새 견적 요청', desc: '청소 서비스 견적 요청', link: '/consumer/quotes/new', bg: 'bg-[#005088]' },
    { icon: FileText, title: '내 견적 관리', desc: '요청한 견적과 입찰 확인', link: '/consumer/quotes', bg: 'bg-emerald-600' },
    { icon: MessageSquare, title: '채팅', desc: '업체와 실시간 상담', link: '/consumer/chats', bg: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#005088] to-[#003d66] rounded-2xl p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">환영합니다!</h1>
        <p className="text-slate-200 mb-6">우리집에 맞는 청소 전문가를 찾아보세요.</p>
        <Link to="/consumer/quotes/new" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#005088] rounded-lg font-bold">
          <Sparkles className="w-5 h-5" /> 견적 신청하기
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {actions.map((a, i) => (
          <Link key={i} to={a.link} className="group bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
            <div className={`w-12 h-12 ${a.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <a.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{a.title}</h3>
            <p className="text-slate-500 text-sm">{a.desc}</p>
          </Link>
        ))}
      </div>

      <Link to="/community" className="flex items-center justify-between bg-slate-100 rounded-xl p-6 hover:bg-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#005088]/10 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-[#005088]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">커뮤니티 참여하기</h3>
            <p className="text-sm text-slate-500">다른 고객들과 정보를 공유하세요</p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-slate-400" />
      </Link>
    </div>
  );
}
