import { useState, useEffect, useMemo } from 'react';
import { CategoryTabs, CategoryBottomTabs } from '../components/CategoryTabs';
import { QuestionCard } from '../components/QuestionCard';
import { SearchBar } from '../components/SearchBar';
import { ProgressBar } from '../components/ProgressBar';
import type { Category, QuestionTree, Progress, ProgressStats } from '../types';
import { getDeviceId } from '../utils/device';
import { buildQuestionTree } from '../utils/tree';

// Mock data for development - will be replaced with API
const mockQuestions: QuestionTree[] = [
  {
    id: '1',
    category: 'java-basics',
    level: 0,
    parent_id: null,
    title: 'HashMap 底层实现原理是什么？',
    answer: 'JDK 1.8 采用数组+链表+红黑树实现。当链表长度超过 8 且数组长度达到 64 时，链表会转换为红黑树以提高查询效率。\n\n主要参数：\n- initialCapacity：初始容量，默认 16\n- loadFactor：负载因子，默认 0.75\n- threshold：扩容阈值 = capacity * loadFactor',
    tags: '集合,HashMap',
    sort_order: 1,
    created_at: new Date().toISOString(),
    children: [
      {
        id: '1-1',
        category: 'java-basics',
        level: 1,
        parent_id: '1',
        title: '为什么链表转红黑树的阈值是 8？',
        answer: '基于泊松分布计算，在 hash 良好的情况下，链表长度达到 8 的概率极低（约 0.00000006）。选择 8 是在时间和空间成本上的权衡。',
        tags: '',
        sort_order: 1,
        created_at: new Date().toISOString(),
        children: [
          {
            id: '1-1-1',
            category: 'java-basics',
            level: 2,
            parent_id: '1-1',
            title: '红黑树退化回链表的阈值为什么是 6？',
            answer: '避免在 6 和 8 之间频繁转换造成性能抖动。设置为 6 而不是 7，留有缓冲空间。',
            tags: '',
            sort_order: 1,
            created_at: new Date().toISOString(),
            children: []
          }
        ]
      },
      {
        id: '1-2',
        category: 'java-basics',
        level: 1,
        parent_id: '1',
        title: 'HashMap 的扩容机制是怎样的？',
        answer: '当元素数量超过 threshold 时触发扩容：\n1. 容量翻倍（newCap = oldCap << 1）\n2. 重新计算每个元素的位置（(e.hash & oldCap) == 0 原地不动，否则移动到新位置）\n3. JDK 1.8 优化：扩容时元素位置要么不变，要么移动到原位置 + oldCap',
        tags: '',
        sort_order: 2,
        created_at: new Date().toISOString(),
        children: []
      }
    ]
  },
  {
    id: '2',
    category: 'java-basics',
    level: 0,
    parent_id: null,
    title: 'ArrayList 和 LinkedList 的区别？',
    answer: '**ArrayList**：\n- 底层是动态数组\n- 随机访问 O(1)，插入删除 O(n)\n- 扩容时创建新数组并复制\n\n**LinkedList**：\n- 底层是双向链表\n- 随机访问 O(n)，插入删除 O(1)（已知位置）\n- 内存占用更高（存储前后指针）\n\n使用场景：\n- 频繁查询用 ArrayList\n- 频繁插入删除用 LinkedList',
    tags: '集合,List',
    sort_order: 2,
    created_at: new Date().toISOString(),
    children: []
  }
];

const mockProgress: Record<string, 'unread' | 'mastered' | 'reviewing'> = {};

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('java-basics');
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState<Record<string, 'unread' | 'mastered' | 'reviewing'>>(mockProgress);
  const [isMobile, setIsMobile] = useState(false);
  
  const deviceId = useMemo(() => getDeviceId(), []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter questions by category and search
  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter(q => {
      const matchesCategory = q.category === activeCategory;
      const matchesSearch = searchQuery 
        ? q.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Calculate stats
  const stats: ProgressStats = useMemo(() => {
    const total = mockQuestions.length;
    let mastered = 0;
    let reviewing = 0;
    
    Object.values(progress).forEach(status => {
      if (status === 'mastered') mastered++;
      if (status === 'reviewing') reviewing++;
    });
    
    return {
      total,
      mastered,
      reviewing,
      unread: total - mastered - reviewing
    };
  }, [progress]);

  const handleStatusChange = (questionId: string, status: 'unread' | 'mastered' | 'reviewing') => {
    setProgress(prev => ({
      ...prev,
      [questionId]: status
    }));
    // TODO: Sync to API
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 bg-white/60 backdrop-blur-sm border-r border-gray-200/50 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">☕ Java 八股文</h1>
            <p className="text-sm text-gray-500">面试题学习系统</p>
          </div>
          
          <div className="mb-6">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          
          <div className="mb-6">
            <ProgressBar stats={stats} />
          </div>
          
          <CategoryTabs 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {mockQuestions.filter(q => q.category === activeCategory)[0]?.title?.split('？')[0] || '题目列表'}
            </h2>
            <p className="text-gray-500 mt-1">共 {filteredQuestions.length} 道题</p>
          </div>
          
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                currentStatus={progress[question.id] || 'unread'}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </main>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 pb-20">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800">☕ Java 八股文</h1>
            <div className="text-sm text-gray-500">
              {stats.mastered}/{stats.total}
            </div>
          </div>
          <SearchBar onSearch={setSearchQuery} />
        </header>
        
        {/* Content */}
        <main className="p-4">
          <div className="mb-4">
            <ProgressBar stats={stats} />
          </div>
          
          <div className="space-y-3">
            {filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                currentStatus={progress[question.id] || 'unread'}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </main>
        
        {/* Bottom Tabs */}
        <CategoryBottomTabs 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
    </div>
  );
}
