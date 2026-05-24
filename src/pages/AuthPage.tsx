import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState<'consumer' | 'provider'>('consumer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, name, userType);
      } else {
        await signIn(email, password);
      }
      setTimeout(() => navigate(userType === 'provider' ? '/provider' : '/consumer'), 300);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#005088] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">딱</span>
            </div>
            <span className="text-2xl font-bold text-[#005088]">딸깍</span>
          </Link>
          <p className="text-slate-600">홈서비스 매칭 플랫폼</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 rounded-lg font-medium ${!isSignUp ? 'bg-[#005088] text-white' : 'bg-slate-100 text-slate-600'}`}>
              로그인
            </button>
            <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 rounded-lg font-medium ${isSignUp ? 'bg-[#005088] text-white' : 'bg-slate-100 text-slate-600'}`}>
              회원가입
            </button>
          </div>

          {isSignUp && (
            <div className="flex gap-2 mb-6">
              <button onClick={() => setUserType('consumer')} className={`flex-1 py-3 rounded-lg font-medium ${userType === 'consumer' ? 'bg-[#005088]/10 text-[#005088] border-2 border-[#005088]' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>
                고객으로 가입
              </button>
              <button onClick={() => setUserType('provider')} className={`flex-1 py-3 rounded-lg font-medium ${userType === 'provider' ? 'bg-[#005088]/10 text-[#005088] border-2 border-[#005088]' : 'bg-slate-50 border-2 border-transparent text-slate-600'}`}>
                업체로 가입
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{userType === 'provider' ? '업체명' : '이름'}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" placeholder={userType === 'provider' ? '업체명을 입력하세요' : '이름을 입력하세요'} required />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" placeholder="example@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" placeholder="6자 이상 입력하세요" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50">
              {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
