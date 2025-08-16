import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Image, 
  BarChart3, 
  HelpCircle, 
  Lightbulb,
  User,
  Clock,
  Filter,
  Search,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  ThumbsUp,
  Eye,
  Bookmark,
  Send
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth } from '../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface Post {
  id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  type: 'method' | 'question' | 'graph' | 'general';
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  views: number;
  tags: string[];
  image?: string;
  replies?: Reply[];
}

interface Reply {
  id: string;
  author: {
    name: string;
    email: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Sarah Chen', email: 'sarah@textile.com' },
    content: 'Just discovered a new dyeing method for achieving deeper blues on cotton. The key is pre-treating with a mild alkaline solution before applying the reactive dye. Results are incredible!',
    type: 'method',
    timestamp: '2024-01-15T10:30:00Z',
    likes: 24,
    comments: 8,
    isLiked: false,
    isBookmarked: false,
    views: 156,
    tags: ['cotton', 'reactive-dye', 'blue', 'pre-treatment'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    replies: []
  },
  {
    id: '2',
    author: { name: 'Ahmed Rahman', email: 'ahmed@dyeworks.com' },
    content: 'Has anyone experienced color bleeding issues with polyester blends? I\'m using disperse dyes at 130°C but getting inconsistent results. Any suggestions?',
    type: 'question',
    timestamp: '2024-01-14T15:45:00Z',
    likes: 12,
    comments: 15,
    isLiked: true,
    isBookmarked: true,
    views: 89,
    tags: ['polyester', 'disperse-dye', 'color-bleeding', 'help-needed'],
    replies: []
  },
  {
    id: '3',
    author: { name: 'Maria Rodriguez', email: 'maria@fabrictech.com' },
    content: 'Monthly production analysis shows 15% improvement in color consistency after implementing the new quality control measures. Here\'s the breakdown:',
    type: 'graph',
    timestamp: '2024-01-13T09:20:00Z',
    likes: 31,
    comments: 6,
    isLiked: false,
    isBookmarked: false,
    views: 203,
    tags: ['analytics', 'quality-control', 'production', 'improvement', 'trending'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    replies: []
  }
];

export function SocialPortal() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<Post['type']>('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Post['type']>('all');
  const [user, setUser] = useState<any>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({});
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || post.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes;
      case 'trending':
        return (b.likes + b.comments + b.views) - (a.likes + a.comments + a.views);
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        email: user?.email || 'anonymous@example.com'
      },
      content: newPostContent,
      type: newPostType,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
      views: 0,
      tags: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsCreatingPost(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleReply = (postId: string) => {
    const content = replyContent[postId];
    if (!content?.trim()) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      author: {
        name: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        email: user?.email || 'anonymous@example.com'
      },
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments + 1,
            replies: [...(post.replies || []), newReply]
          }
        : post
    ));

    setReplyContent({ ...replyContent, [postId]: '' });
  };

  const getPostTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'method': return BookOpen;
      case 'question': return HelpCircle;
      case 'graph': return BarChart3;
      default: return Lightbulb;
    }
  };

  const getPostTypeColor = (type: Post['type']) => {
    switch (type) {
      case 'method': return 'bg-blue-100 text-blue-800';
      case 'question': return 'bg-orange-100 text-orange-800';
      case 'graph': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendingPosts = () => {
    return posts
      .filter(post => post.tags.includes('trending') || post.likes > 20)
      .sort((a, b) => (b.likes + b.comments + b.views) - (a.likes + a.comments + a.views))
      .slice(0, 3);
  };

  const getTopQuestions = () => posts.filter(post => post.type === 'question').slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Social Portal</h1>
          <p className="text-muted-foreground">Connect with fellow textile professionals, share knowledge, and learn from the community.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">342</p>
                <p className="text-sm text-muted-foreground">Methods Shared</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">89%</p>
                <p className="text-sm text-muted-foreground">Problem Solved</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-xl border border-border mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              {!isCreatingPost ? (
                <button
                  onClick={() => setIsCreatingPost(true)}
                  className="w-full text-left p-4 bg-muted rounded-lg text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Share your dyeing methods, ask questions, or post insights...
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(['method', 'question', 'graph', 'general'] as const).map((type) => {
                      const Icon = getPostTypeIcon(type);
                      return (
                        <button
                          key={type}
                          onClick={() => setNewPostType(type)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            newPostType === type
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your knowledge with the community..."
                    className="w-full p-4 border border-border bg-background text-foreground rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingPost(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search posts, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'trending')}
                className="px-3 py-2 border border-border bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'method', 'question', 'graph', 'general'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className={filterType === type ? 'bg-primary hover:bg-primary/90' : ''}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredPosts.map((post, index) => {
              const PostTypeIcon = getPostTypeIcon(post.type);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(post.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                      <PostTypeIcon className="h-3 w-3" />
                      {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-foreground leading-relaxed">{post.content}</p>
                    {post.image && (
                      <div className="mt-4">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full max-w-md rounded-lg border border-border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={`px-2 py-1 text-xs rounded-full ${
                            tag === 'trending' ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <button className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {post.views}
                    </button>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        post.isLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    <button 
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </button>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        post.isBookmarked ? 'text-yellow-600' : 'text-muted-foreground hover:text-yellow-600'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      {/* Existing Replies */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground text-sm">{reply.author.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(reply.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyContent[post.id] || ''}
                            onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                            className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary"
                            onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                          />
                          <Button
                            onClick={() => handleReply(post.id)}
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">No posts found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );