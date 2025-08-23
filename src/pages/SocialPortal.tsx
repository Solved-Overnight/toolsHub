import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Share2, 
  TrendingUp, 
  Users, 
  Eye,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Send,
  MoreHorizontal,
  HelpCircle,
  Lightbulb,
  BarChart3,
  MessageCircle
} from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  type: 'method' | 'question' | 'graph' | 'general';
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  bookmarks: number;
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const SocialPortal: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      content: 'Just discovered a new reactive dyeing method that reduces water consumption by 30%! The key is using a pre-treatment with enzymatic desizing followed by a modified pad-batch process. Has anyone tried similar approaches?',
      type: 'method',
      tags: ['reactive-dye', 'water-saving', 'cotton', 'sustainability'],
      likes: 24,
      comments: 8,
      views: 156,
      bookmarks: 12,
      timestamp: '2 hours ago',
      isLiked: false,
      isBookmarked: false,
      replies: [
        {
          id: 'r1',
          author: 'Mike Johnson',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          content: 'This sounds promising! What was your fixation rate with this method?',
          timestamp: '1 hour ago',
          likes: 3,
          isLiked: false
        }
      ]
    },
    {
      id: '2',
      author: 'David Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      content: 'Need help with color matching for polyester blends. Getting inconsistent results with disperse dyes. Temperature seems optimal at 130°C but color depth varies. Any suggestions?',
      type: 'question',
      tags: ['polyester', 'disperse-dye', 'color-matching', 'troubleshooting'],
      likes: 15,
      comments: 12,
      views: 89,
      bookmarks: 7,
      timestamp: '4 hours ago',
      isLiked: true,
      isBookmarked: false,
      replies: []
    },
    {
      id: '3',
      author: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      content: 'Sharing my latest analysis on dye uptake curves for different fabric weights. Notice how the 200gsm cotton shows significantly better penetration compared to 150gsm. Data collected over 50 batches.',
      type: 'graph',
      tags: ['analytics', 'cotton', 'dye-uptake', 'data-analysis'],
      likes: 31,
      comments: 6,
      views: 203,
      bookmarks: 18,
      timestamp: '6 hours ago',
      isLiked: false,
      isBookmarked: true,
      replies: []
    }
  ]);

  const [newPost, setNewPost] = useState({
    content: '',
    type: 'general' as Post['type'],
    tags: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Post['type']>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

  const communityStats = {
    totalPosts: posts.length,
    totalMembers: 1247,
    activeToday: 89,
    totalLikes: posts.reduce((sum, post) => sum + post.likes, 0)
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content: newPost.content,
      type: newPost.type,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      likes: 0,
      comments: 0,
      views: 0,
      bookmarks: 0,
      timestamp: 'Just now',
      isLiked: false,
      isBookmarked: false,
      replies: []
    };

    setPosts([post, ...posts]);
    setNewPost({ content: '', type: 'general', tags: '' });
    setShowNewPost(false);
  };

  const handleReply = (postId: string) => {
    const content = replyContent[postId];
    if (!content?.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, reply], comments: post.comments + 1 }
        : post
    ));

    setReplyContent({ ...replyContent, [postId]: '' });
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || post.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'trending':
          return (b.views + b.likes * 2) - (a.views + a.likes * 2);
        default:
          return 0; // Keep original order for 'recent'
      }
    });

  const getPostTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'method': return <Lightbulb className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      case 'graph': return <BarChart3 className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: Post['type']) => {
    switch (type) {
      case 'method': return 'bg-green-100 text-green-700 border-green-200';
      case 'question': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'graph': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Portal</h1>
          <p className="text-muted-foreground">Connect with fellow textile professionals, share knowledge, and learn together</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-card-foreground">{communityStats.totalPosts}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl font-bold text-card-foreground">{communityStats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold text-card-foreground">{communityStats.activeToday}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold text-card-foreground">{communityStats.totalLikes}</p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="bg-card p-4 rounded-lg border border-border mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search posts, authors, tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="method">Methods</option>
                      <option value="question">Questions</option>
                      <option value="graph">Graphs</option>
                      <option value="general">General</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="recent">Recent</option>
                      <option value="popular">Popular</option>
                      <option value="trending">Trending</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => setShowNewPost(!showNewPost)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </button>
              </div>
            </div>

            {/* New Post Form */}
            {showNewPost && (
              <div className="bg-card p-6 rounded-lg border border-border mb-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Create New Post</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Post Type</label>
                    <div className="relative">
                      <select
                        value={newPost.type}
                        onChange={(e) => setNewPost({ ...newPost, type: e.target.value as Post['type'] })}
                        className="appearance-none w-full bg-background border border-border rounded-lg px-4 py-2 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="general">General Discussion</option>
                        <option value="method">Dyeing Method</option>
                        <option value="question">Question</option>
                        <option value="graph">Data/Graph</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Content</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Share your thoughts, methods, questions, or insights..."
                      rows={4}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      placeholder="cotton, reactive-dye, sustainability..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreatePost}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Post
                    </button>
                    <button
                      onClick={() => setShowNewPost(false)}
                      className="bg-muted text-muted-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-card-foreground">{post.author}</h3>
                          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getPostTypeColor(post.type)}`}>
                          {getPostTypeIcon(post.type)}
                          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </span>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-card-foreground mb-4 leading-relaxed">{post.content}</p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        {post.bookmarks}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          post.isLiked 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        Like
                      </button>
                      
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Comment
                      </button>
                      
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          post.isBookmarked 
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        Save
                      </button>
                      
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(post.id) && (
                    <div className="border-t border-border bg-muted/30">
                      {/* Existing Replies */}
                      {post.replies.length > 0 && (
                        <div className="p-4 space-y-4">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img
                                src={reply.avatar}
                                alt={reply.author}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="bg-background rounded-lg p-3 border border-border">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-foreground text-sm">{reply.author}</span>
                                    <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                                  </div>
                                  <p className="text-foreground text-sm">{reply.content}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {reply.likes}
                                  </button>
                                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      <div className="p-4 border-t border-border">
                        <div className="flex gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyContent[post.id] || ''}
                              onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                            />
                            <button
                              onClick={() => handleReply(post.id)}
                              className="bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Tags */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-3">Trending Tags</h3>
              <div className="space-y-2">
                {['reactive-dye', 'cotton', 'sustainability', 'color-matching', 'polyester'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">#{tag}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {Math.floor(Math.random() * 50) + 10}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-3">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Chen', posts: 24, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
                  { name: 'David Kumar', posts: 18, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
                  { name: 'Emma Rodriguez', posts: 15, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' }
                ].map((user) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.posts} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-3">Community Guidelines</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Be respectful and professional</p>
                <p>• Share accurate information</p>
                <p>• Use relevant tags</p>
                <p>• Help others learn and grow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPortal;
