import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Heart, MessageSquare, Clock, Send } from 'lucide-react';

export default function CommunityPostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => { if (id) fetch(); }, [id, user]);

  async function fetch() {
    try {
      const { data } = await supabase.from('community_posts').select('*, author:profiles!community_posts_author_id_fkey(id, name)').eq('id', id).single();
      setPost(data);
      const { data: commentsData } = await supabase.from('post_comments').select('*, author:profiles!post_comments_author_id_fkey(id, name)').eq('post_id', id).order('created_at', { ascending: true });
      setComments(commentsData || []);
      if (user) {
        const { data: likeData } = await supabase.from('post_likes').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle();
        setLiked(!!likeData);
      }
    } finally { setLoading(false); }
  }

  const handleLike = async () => {
    if (!user) { alert('로그인이 필요합니다.'); return; }
    if (liked) {
      await supabase.from('post_likes').delete().match({ post_id: id, user_id: user.id });
      await supabase.from('community_posts').update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', id);
      setLiked(false);
      setPost({ ...post, likes_count: Math.max(0, post.likes_count - 1) });
    } else {
      await supabase.from('post_likes').insert({ post_id: id, user_id: user.id });
      await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', id);
      setLiked(true);
      setPost({ ...post, likes_count: post.likes_count + 1 });
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    await supabase.from('post_comments').insert({ post_id: id, author_id: user.id, content: newComment.trim() });
    setNewComment('');
    fetch();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;
  if (!post) return <div className="text-center py-12">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/community" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#005088] mb-6"><ArrowLeft className="w-4 h-4" />목록으로</Link>
        <article className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6"><span>{post.author?.name}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.created_at.split('T')[0]}</span></div>
          <div className="prose prose-slate max-w-none mb-6"><p className="whitespace-pre-wrap">{post.content}</p></div>
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />{post.likes_count}</button>
            <span className="flex items-center gap-1 text-slate-400"><MessageSquare className="w-5 h-5" />{comments.length}</span>
          </div>
        </article>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">댓글 ({comments.length})</h2>
          {comments.length === 0 ? (
            <p className="text-slate-500 text-center py-8">첫 번째 댓글을 작성해 보세요.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><span className="font-medium text-slate-900">{c.author?.name}</span><span className="text-xs text-slate-400">{c.created_at.split('T')[0]}</span></div>
                  <p className="text-slate-700">{c.content}</p>
                </div>
              ))}
            </div>
          )}
          {user ? (
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력하세요..." className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none" onKeyPress={(e) => e.key === 'Enter' && handleComment()} />
              <button onClick={handleComment} disabled={!newComment.trim()} className="px-4 py-2 bg-[#005088] text-white rounded-lg hover:bg-[#003d66] disabled:opacity-50"><Send className="w-5 h-5" /></button>
            </div>
          ) : (
            <p className="text-center text-slate-500"><Link to="/auth" className="text-[#005088] hover:underline">로그인</Link> 후 댓글을 작성할 수 있습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
