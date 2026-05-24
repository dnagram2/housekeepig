import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, MessageSquare, User, LogOut, Briefcase, LayoutDashboard, Wallet, Award, Users, MessageCircle, Settings, ChevronRight } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isProvider = profile?.user_type === 'provider';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const consumerNavItems = [
    { path: '/consumer', icon: Home, label: '홈' },
    { path: '/consumer/quotes', icon: FileText, label: '견적요청' },
    { path: '/consumer/bookings', icon: Briefcase, label: '예약내역' },
    { path: '/consumer/chats', icon: MessageSquare, label: '채팅' },
    { path: '/consumer/profile', icon: User, label: '내정보' },
  ];

  const providerNavItems = [
    { path: '/provider', icon: LayoutDashboard, label: '대시보드' },
    { path: '/provider/bids', icon: FileText, label: '입찰관리' },
    { path: '/provider/bookings', icon: Briefcase, label: '진행건' },
    { path: '/provider/chats', icon: MessageCircle, label: '채팅' },
    { path: '/provider/settlement', icon: Wallet, label: '정산' },
    { path: '/provider/portfolio', icon: Award, label: '포트폴리오' },
    { path: '/provider/profile', icon: Settings, label: '프로필' },
  ];

  const navItems = isProvider ? providerNavItems : consumerNavItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to={isProvider ? '/provider' : '/consumer'} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#005088] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">딱</span>
              </div>
              <span className="text-xl font-bold text-[#005088]">딸깍</span>
            </Link>
            <div className="flex items-center gap-3">
              {profile && (
                <span className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="font-medium">{profile.name}</span>
                  <span className="px-2 py-0.5 bg-[#005088]/10 text-[#005088] rounded text-xs">
                    {isProvider ? '업체' : '고객'}
                  </span>
                </span>
              )}
              <Link to="/community" className="text-slate-600 hover:text-[#005088]">
                <Users className="w-5 h-5" />
              </Link>
              <button onClick={handleSignOut} className="text-slate-600 hover:text-slate-900">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#005088]' : 'text-slate-500'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="hidden sm:fixed sm:flex sm:flex-col sm:w-56 sm:h-[calc(100vh-64px)] sm:top-16 sm:left-0 sm:bg-white sm:border-r sm:border-slate-200 sm:z-30 sm:py-4 sm:px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-2 px-3 py-2.5 mx-1 mb-1 rounded font-medium transition-colors ${isActive ? 'bg-[#005088] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 mr-0.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <style>{`@media (min-width: 640px) { main { margin-left: 224px; } }`}</style>
    </div>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#005088] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">딱</span>
              </div>
              <span className="text-xl font-bold text-[#005088]">딸깍</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/community" className="text-slate-600 hover:text-[#005088]">커뮤니티</Link>
              <Link to="/auth" className="px-4 py-2 bg-[#005088] text-white rounded-lg hover:bg-[#003d66]">로그인</Link>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
