import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Clock, Star, ArrowRight, CheckCircle, Users, Briefcase, FileText, MessageSquare, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'quotes' | 'chats' | 'community'>('home');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab !== 'home') {
      fetchData();
    }
  }, [user, activeTab]);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      if (activeTab === 'quotes') {
        const { data } = await supabase
          .from('quote_requests')
          .select('*, bids(count)')
          .eq('consumer_id', user.id)
          .order('created_at', { ascending: false });
        setQuotes(data || []);
      } else if (activeTab === 'chats') {
        const { data } = await supabase
          .from('chats')
          .select(`*, provider:profiles!chats_provider_id_fkey(*, provider_profile:provider_profiles(*))`)
          .eq('consumer_id', user.id)
          .order('created_at', { ascending: false });
        setChats(data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: Clock, title: '빠른 견적 비교', description: '여러 업체의 견적을 한눈에 비교하세요' },
    { icon: Shield, title: '안전결제 시스템', description: '작업 완료 후에만 대금이 지급됩니다' },
    { icon: Star, title: '검증된 업체', description: '리뷰와 평점으로 믿을 수 있는 업체를 선택하세요' },
  ];

  const stats = [
    { label: '등록 업체', value: '2,500+', icon: Briefcase },
    { label: '완료된 서비스', value: '15,000+', icon: CheckCircle },
    { label: '이용 고객', value: '8,000+', icon: Users },
    { label: '평균 만족도', value: '4.8/5', icon: Star },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-600',
      bidding: 'bg-amber-100 text-amber-700',
      matched: 'bg-[#005088]/10 text-[#005088]',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-600'
    };
    const labels: Record<string, string> = {
      pending: '대기중',
      bidding: '입찰중',
      matched: '매칭완료',
      completed: '완료',
      cancelled: '취소'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#005088] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">딱</span>
              </div>
              <span className="text-xl font-bold text-[#005088]">딸깍</span>
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <Link to="/consumer" className="px-4 py-2 bg-[#005088] text-white rounded-lg hover:bg-[#003d66]">
                  대시보드
                </Link>
              ) : (
                <Link to="/auth" className="px-4 py-2 bg-[#005088] text-white rounded-lg hover:bg-[#003d66]">
                  로그인
                </Link>
              )}
            </div>
          </div>

          {/* Tab Menu */}
          <div className="flex border-t border-slate-100">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === 'home'
                  ? 'border-[#005088] text-[#005088] bg-[#005088]/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span className="font-medium">홈</span>
            </button>
            <button
              onClick={() => {
                if (!user) navigate('/auth');
                else setActiveTab('quotes');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === 'quotes'
                  ? 'border-[#005088] text-[#005088] bg-[#005088]/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">내 견적</span>
            </button>
            <button
              onClick={() => {
                if (!user) navigate('/auth');
                else setActiveTab('chats');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === 'chats'
                  ? 'border-[#005088] text-[#005088] bg-[#005088]/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">채팅</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === 'community'
                  ? 'border-[#005088] text-[#005088] bg-[#005088]/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">커뮤니티</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#005088] to-[#003d66] text-white py-16 px-4">
              <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                  내 집에 맞는 청소 서비스를
                </h1>
                <h2 className="text-2xl sm:text-3xl text-[#7dd3fc] mb-6">딸깍에서 찾아보세요</h2>
                <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
                  업체들이 경쟁해서 제안하는 역경매 시스템으로 최적의 가격과 서비스를 선택하세요
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to={user ? "/consumer/quotes/new" : "/auth"}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#005088] rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" /> 견적 신청하기
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
                  >
                    업체로 파트너십 신청
                  </Link>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-4 bg-white">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center p-4">
                      <stat.icon className="w-8 h-8 mx-auto mb-2 text-[#005088]" />
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-slate-500 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How it works */}
            <section className="py-16 px-4 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">이용 방법</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { step: '1', title: '견적 요청', description: '필요한 서비스 정보를 입력하세요' },
                    { step: '2', title: '견적 비교', description: '여러 업체의 제안을 비교하세요' },
                    { step: '3', title: '매칭 및 서비스', description: '원하는 업체와 안전하게 결제하세요' },
                  ].map((item, i) => (
                    <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm">
                      <div className="w-12 h-12 bg-[#005088] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                        {item.step}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                      {i < 2 && (
                        <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2">
                          <ArrowRight className="w-8 h-8 text-[#005088]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Why Ttakkak */}
            <section className="py-16 px-4 bg-white">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">왜 딸깍인가요?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((f, i) => (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 bg-[#005088]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <f.icon className="w-8 h-8 text-[#005088]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                      <p className="text-slate-600">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 bg-[#005088]">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
                <p className="text-slate-200 mb-8">딸깍과 함께 최고의 서비스를 최적의 가격에 이용하세요</p>
                <Link
                  to={user ? "/consumer/quotes/new" : "/auth"}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#005088] rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  지금 시작하기 <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 bg-slate-900 text-slate-400">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-[#005088] font-bold text-sm">딱</span>
                  </div>
                  <span className="text-xl font-bold text-white">딸깍</span>
                </div>
                <p>© 2024 딸깍. All rights reserved.</p>
              </div>
            </footer>
          </>
        )}

        {activeTab === 'quotes' && user && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">내 견적 관리</h1>
              <Link
                to="/consumer/quotes/new"
                className="flex items-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg hover:bg-[#003d66]"
              >
                <Sparkles className="w-4 h-4" />새 견적 신청
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" />
              </div>
            ) : quotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">아직 요청한 견적이 없습니다</h3>
                <p className="text-slate-500 mb-6">새로운 청소 서비스 견적을 요청해 보세요.</p>
                <Link
                  to="/consumer/quotes/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#005088] text-white rounded-lg font-medium"
                >
                  <Sparkles className="w-4 h-4" />견적 신청하기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((q) => (
                  <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{q.service_type}</h3>
                          {getStatusBadge(q.status)}
                        </div>
                        <p className="text-sm text-slate-500">{q.address} · {q.housing_type} {q.size}평</p>
                        <p className="text-sm text-slate-400 mt-1">희망일정: {q.preferred_date}</p>
                      </div>
                      <Link
                        to={`/consumer/quotes/${q.id}`}
                        className="px-4 py-2 bg-[#005088] text-white rounded-lg text-sm font-medium hover:bg-[#003d66]"
                      >
                        상세보기
                      </Link>
                    </div>
                    {q.bids && q.bids[0]?.count > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-sm text-[#005088] font-medium">
                          입찰 {q.bids[0].count}건 도착! 상세보기에서 확인하세요
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && user && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">채팅</h1>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" />
              </div>
            ) : chats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">진행중인 채팅이 없습니다</h3>
                <p className="text-slate-500">업체와 매칭되면 채팅이 시작됩니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => {
                  const name = chat.provider?.provider_profile?.business_name || chat.provider?.name || '업체';
                  return (
                    <Link
                      key={chat.id}
                      to={`/consumer/chats/${chat.id}`}
                      className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-[#005088]/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#005088] rounded-full flex items-center justify-center text-white font-bold">
                          {name[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{name}</h3>
                          <p className="text-xs text-slate-500">클릭하여 채팅하기</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">커뮤니티</h1>
              {user && (
                <Link
                  to="/community/write"
                  className="flex items-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg"
                >
                  글쓰기
                </Link>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">커뮤니티</h3>
              <p className="text-slate-500 mb-4">청소 꿀팁과 경험을 공유해요</p>
              <Link to="/community" className="inline-flex items-center gap-2 text-[#005088] font-medium hover:underline">
                커뮤니티 바로가기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
