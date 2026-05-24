import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send } from 'lucide-react';

export default function WritePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from('community_posts').insert({ author_id: user.id, title: title.trim(), content: content.trim() });
      navigate('/community');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/community" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#005088] mb-6"><ArrowLeft className="w-4 h-4" />목록으로</Link>
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">게시글 작성</h1>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={10} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#005088] focus:ring-2 focus:ring-[#005088]/20 outline-none resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-[#005088] text-white rounded-lg font-bold hover:bg-[#003d66] disabled:opacity-50">
            <Send className="w-5 h-5" />{submitting ? '작성 중...' : '게시하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
