import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Heart, Search, PenSquare, Clock } from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPosts(); }, [user]);

  async function fetchPosts() {
    try {
      const { data } = await supabase.from('community_posts').select('*, author:profiles!community_posts_author_id_fkey(id, name), comments(count)').order('created_at', { ascending: false });
      if (user) {
        const { data: likes } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id);
        const likedIds = new Set(likes?.map((l) => l.post_id));
        setPosts((data || []).map((p) => ({ ...p, liked_by_user: likedIds.has(p.id), comments: p.comments || [] })));
      } else {
        setPosts(data || []);
      }
    } finally { setLoading(false); }
  }

  const handleLike = async (postId: string) => {
    if (!user) { alert('로그인이 필요합니다.'); return; }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.liked_by_user) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      await supabase.from('community_posts').update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
    }
    fetchPosts();
  };

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#005088] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto"><h1 className="text-3xl font-bold mb-2">커뮤니티</h1><p className="text-slate-200">청소 꿀팁과 경험을 공유해요</p></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="게시글 검색..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-[#005088] outline-none" />
          </div>
          {user && <Link to="/community/write" className="flex items-center gap-2 px-4 py-2 bg-[#005088] text-white rounded-lg"><PenSquare className="w-4 h-4" />글쓰기</Link>}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-900 mb-2">게시글이 없습니다</h3><p className="text-slate-500">첫 번째 게시글을 작성해 보세요.</p></div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <Link key={post.id} to={`/community/${post.id}`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-[#005088]/50 hover:shadow-md transition-all">
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-400"><span>{post.author?.name}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.created_at.split('T')[0]}</span></div>
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.preventDefault(); handleLike(post.id); }} className={`flex items-center gap-1 ${post.liked_by_user ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart className={`w-4 h-4 ${post.liked_by_user ? 'fill-red-500' : ''}`} />{post.likes_count}</button>
                    <span className="flex items-center gap-1 text-slate-400"><MessageSquare className="w-4 h-4" />{post.comments?.[0]?.count || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
