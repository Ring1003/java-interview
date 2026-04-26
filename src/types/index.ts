export interface Question {
  id: string;
  category: string;
  level: number;
  parent_id: string | null;
  title: string;
  answer: string;
  tags: string;
  sort_order: number;
  created_at: string;
}

export interface QuestionTree extends Question {
  children: QuestionTree[];
}

export interface Progress {
  id: number;
  device_id: string;
  question_id: string;
  status: 'unread' | 'mastered' | 'reviewing';
  accessed_at: string;
  updated_at: string;
}

export interface ProgressStats {
  total: number;
  mastered: number;
  reviewing: number;
  unread: number;
}

export type Category = 
  | 'java-basics'
  | 'concurrency'
  | 'jvm'
  | 'spring'
  | 'mysql'
  | 'redis'
  | 'algorithm'
  | 'distributed';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'java-basics',
    name: 'Java 基础',
    icon: '☕',
    description: '数据类型、集合、异常处理、IO流、反射、泛型'
  },
  {
    id: 'concurrency',
    name: '并发编程',
    icon: '🔄',
    description: '线程、synchronized、volatile、Lock、线程池、AQS'
  },
  {
    id: 'jvm',
    name: 'JVM',
    icon: '⚙️',
    description: '内存模型、GC、类加载、JIT、调优参数'
  },
  {
    id: 'spring',
    name: 'Spring',
    icon: '🍃',
    description: 'IOC、AOP、Bean生命周期、事务、自动配置'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: '🗄️',
    description: '索引、事务、MVCC、锁机制、SQL优化'
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: '🔴',
    description: '数据结构、持久化、缓存问题、分布式锁'
  },
  {
    id: 'algorithm',
    name: '算法',
    icon: '📊',
    description: '排序、树、图、动态规划、手撕代码'
  },
  {
    id: 'distributed',
    name: '分布式',
    icon: '🌐',
    description: '消息队列、微服务、分布式事务、CAP'
  }
];
