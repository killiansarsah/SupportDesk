import { useState } from 'react';
import { Search, BookOpen, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { Article } from '../types';
import CustomSelect from './CustomSelect';

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Event Registration Process',
    content: 'To register participants: 1. Fill participant form (Name, Address, Receipt Number) 2. Review payment status 3. Approve/Decline registration 4. Generate QR code 5. Print name tag sticker with QR code',
    category: 'Registration',
    tags: ['registration', 'qr-code', 'payment'],
    author: 'Elira Support Team',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 245,
    helpful: 23,
    notHelpful: 2,
    isPublished: true
  },
  {
    id: '2',
    title: 'QR Code Scanning for Meals',
    content: 'Meal attendance process: 1. Scan participant QR code at meal station 2. System verifies eligibility 3. Check for duplicate scans 4. Allow/Block meal access 5. Log attendance in real-time',
    category: 'Meal Management',
    tags: ['qr-scan', 'meals', 'attendance'],
    author: 'Elira Support Team',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    views: 189,
    helpful: 18,
    notHelpful: 1,
    isPublished: true
  },
  {
    id: '3',
    title: 'Payment Verification Guide',
    content: 'Payment validation steps: 1. Receive payment receipt number 2. Enter receipt in system 3. Verify payment details 4. Mark as Approved/Declined 5. Only approved participants get QR codes',
    category: 'Payment',
    tags: ['payment', 'receipt', 'verification'],
    author: 'Elira Support Team',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-08T09:15:00Z',
    views: 156,
    helpful: 15,
    notHelpful: 0,
    isPublished: true
  },
  {
    id: '4',
    title: 'Troubleshooting QR Code Issues',
    content: 'Common QR code problems: 1. QR not scanning - Check printer quality, clean scanner 2. Duplicate meal claims - System blocks automatically 3. Lost name tag - Use manual override with logged reason 4. Printer issues - Check power supply and connectivity',
    category: 'Troubleshooting',
    tags: ['qr-code', 'printer', 'scanner', 'troubleshooting'],
    author: 'Elira Support Team',
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-05T16:45:00Z',
    views: 203,
    helpful: 19,
    notHelpful: 3,
    isPublished: true
  }
];

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];
  const categoryOptions = categories.map(category => ({ value: category, label: category }));
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFeedback = (articleId: string, isHelpful: boolean) => {
    const updatedArticles = articles.map(article => {
      if (article.id === articleId) {
        const newArticle = {
          ...article,
          helpful: isHelpful ? article.helpful + 1 : article.helpful,
          notHelpful: !isHelpful ? article.notHelpful + 1 : article.notHelpful,
        };
        if (selectedArticle?.id === articleId) {
          setSelectedArticle(newArticle);
        }
        return newArticle;
      }
      return article;
    });
    setArticles(updatedArticles);
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedArticle(null)}
          className="mb-6 back-btn-animate inline-flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors"
          aria-label="Back to Knowledge Base"
        >
          <span className="back-btn-glass back-btn-animate inline-flex items-center justify-center w-9 h-9 rounded-full text-blue-400 shadow-sm">
            <span className="back-icon text-current">←</span>
          </span>
          <span>Back to Knowledge Base</span>
        </button>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {selectedArticle.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">{selectedArticle.title}</h1>
          
          <div className="flex items-center gap-6 text-gray-300 text-sm mb-8">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {selectedArticle.views} views
            </div>
            <div>By {selectedArticle.author}</div>
            <div>{new Date(selectedArticle.createdAt).toLocaleDateString()}</div>
          </div>
          
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </p>
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <p className="text-white mb-4">Was this article helpful?</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleFeedback(selectedArticle.id, true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Yes ({selectedArticle.helpful})
              </button>
              <button
                onClick={() => handleFeedback(selectedArticle.id, false)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                No ({selectedArticle.notHelpful})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Help Center</h1>
        <p className="text-gray-300">Find answers about event registration, QR codes, payments, and meal management</p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="w-full md:w-60">
          <CustomSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            placeholder="Filter category"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                {article.category}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-3">{article.title}</h3>
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {article.content.substring(0, 120)}...
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3" />
                {article.views} views
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-3 h-3" />
                {article.helpful}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No articles found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;