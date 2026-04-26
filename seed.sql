-- Java Interview Questions Database Schema

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  level INTEGER NOT NULL,
  parent_id TEXT,
  title TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Device progress table
CREATE TABLE IF NOT EXISTS device_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  accessed_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(device_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_device ON device_progress(device_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_parent ON questions(parent_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON device_progress(status);


-- Seed Questions

INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-1',
  'java-basics',
  0,
  NULL,
  'HashMap 底层实现原理是什么？',
  'JDK 1.8 采用数组+链表+红黑树实现。当链表长度超过 8 且数组长度达到 64 时，链表会转换为红黑树以提高查询效率。\n\n主要参数：\n- initialCapacity：初始容量，默认 16\n- loadFactor：负载因子，默认 0.75\n- threshold：扩容阈值 = capacity * loadFactor',
  'HashMap,集合',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-1-1',
  'java-basics',
  1,
  'java-basics-1',
  '为什么链表转红黑树的阈值是 8？',
  '基于泊松分布计算。在 hash 良好的情况下，链表长度达到 8 的概率约为 0.00000006，非常小。选择 8 是在时间和空间成本上的权衡。',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-1-1-1',
  'java-basics',
  2,
  'java-basics-1-1',
  '红黑树退化回链表的阈值为什么是 6？',
  '避免在阈值附近频繁转换造成性能抖动。设置为 6 而不是 7 或 8，留有缓冲空间。',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-1-2',
  'java-basics',
  1,
  'java-basics-1',
  'HashMap 的扩容机制是怎样的？',
  '当元素数量超过 threshold 时触发扩容：\n1. 容量翻倍（newCap = oldCap << 1）\n2. 创建新数组\n3. 重新计算每个元素的位置\n\nJDK 1.8 优化：扩容时元素位置要么不变，要么移动到原位置 + oldCap',
  '',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-2',
  'java-basics',
  0,
  NULL,
  'ArrayList 和 LinkedList 的区别？',
  'ArrayList：底层动态数组，随机访问 O(1)，插入删除平均 O(n)\nLinkedList：底层双向链表，随机访问 O(n)，已知位置插入删除 O(1)\n\n使用场景：频繁查询用 ArrayList，频繁插入删除用 LinkedList',
  'ArrayList,LinkedList',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-3',
  'java-basics',
  0,
  NULL,
  'Java 中 String 为什么是不可变的？',
  'String 类被 final 修饰，内部 char[] 也被 final 修饰（JDK 9 后改为 byte[]）。\n\n原因：\n1. 字符串常量池：避免重复创建，节省内存\n2. 线程安全：不可变对象天然线程安全\n3. 哈希值缓存：哈希值可以缓存，提高 HashMap 性能\n4. 安全性：防止被恶意修改',
  'String',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-4',
  'java-basics',
  0,
  NULL,
  'Java 异常体系是怎样的？',
  'Throwable 是所有异常的父类\n├── Error：JVM 无法处理的严重问题（OOM、StackOverflow）\n└── Exception\n    ├── 检查异常：编译时必须处理（IOException、SQLException）\n    └── RuntimeException：运行时异常，编译不强制处理',
  '异常',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-5',
  'java-basics',
  0,
  NULL,
  'Java 泛型的作用和类型擦除？',
  '泛型作用：\n1. 编译时类型检查，避免类型转换错误\n2. 减少强制类型转换代码\n3. 提高代码复用性\n\n类型擦除：Java 泛型是伪泛型，编译后类型信息被擦除。List<String> 编译后变成 List（原始类型）。',
  '泛型',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-6',
  'java-basics',
  0,
  NULL,
  'Java 创建对象的方式有哪些？',
  '1. new 关键字：最常用\n2. 反射：Class.newInstance()、Constructor.newInstance()\n3. clone()：实现 Cloneable 接口\n4. 反序列化：ObjectInputStream.readObject()\n5. Unsafe 类：直接分配内存（不调用构造函数）',
  '反射',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-7',
  'java-basics',
  0,
  NULL,
  'Java 接口和抽象类的区别？',
  '接口：变量只能 public static final，JDK8 前方法全抽象，无构造，可多实现\n抽象类：可任意变量，可有具体方法，有构造，只能单继承\n\n使用场景：接口定义能力（行为），抽象类用于代码复用',
  '接口',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-8',
  'java-basics',
  0,
  NULL,
  'Java equals() 和 hashCode() 的关系？',
  '规定：\n- equals() 相等，hashCode() 必须相等\n- hashCode() 相等，equals() 不一定相等\n\n重写原则：重写 equals() 必须重写 hashCode()，使用相同的属性计算',
  'equals,hashCode',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-9',
  'java-basics',
  0,
  NULL,
  'Java IO 流的分类和常用类？',
  '按方向：输入流、输出流\n按类型：字节流、字符流\n按功能：节点流、处理流\n\n常用类：\n- 字节流：FileInputStream、BufferedInputStream\n- 字符流：FileReader、BufferedReader\n- 对象流：ObjectInputStream',
  'IO',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-10',
  'java-basics',
  0,
  NULL,
  'Java NIO 和 BIO 的区别？',
  'BIO：同步阻塞，一个连接一个线程，适合连接数少的场景\nNIO：同步非阻塞，多路复用，核心是 Channel、Buffer、Selector，适合连接数多的场景\nAIO：异步非阻塞，回调机制，适合连接数多且连接长的场景',
  'IO,NIO',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'java-basics-11',
  'java-basics',
  0,
  NULL,
  'Java 8 新特性有哪些？',
  '1. Lambda 表达式：简洁的函数式写法\n2. 函数式接口：@FunctionalInterface\n3. Stream API：流式数据处理\n4. Optional 类：优雅处理空指针\n5. 默认方法：接口可以有默认实现\n6. 方法引用：ClassName::methodName\n7. 新的日期 API：LocalDate、LocalDateTime',
  'Java8',
  11
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-1',
  'concurrency',
  0,
  NULL,
  'synchronized 关键字的原理？',
  'synchronized 基于对象头中的 Mark Word 实现。\n\n三种形式：\n1. 实例方法：锁当前对象实例\n2. 静态方法：锁 Class 对象\n3. 同步代码块：锁指定对象\n\n锁升级：无锁 → 偏向锁 → 轻量级锁 → 重量级锁（不可逆）',
  'synchronized',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-1-1',
  'concurrency',
  1,
  'concurrency-1',
  '偏向锁、轻量级锁、重量级锁的区别？',
  '偏向锁：假设只有一个线程访问，无竞争时不加锁\n轻量级锁：用 CAS 替换 Mark Word，自旋等待\n重量级锁：基于 Monitor，涉及内核态切换，性能低',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-1-2',
  'concurrency',
  1,
  'concurrency-1',
  'synchronized 和 Lock 的区别？',
  'synchronized：关键字，自动释放锁，不可中断，非公平锁\nLock：接口，手动释放锁，可中断，可选公平/非公平',
  '',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-2',
  'concurrency',
  0,
  NULL,
  'volatile 关键字的作用和原理？',
  '作用：\n1. 可见性：修改后其他线程立即可见\n2. 禁止指令重排序：插入内存屏障\n\n不保证原子性：count++ 不是原子操作\n\n原理：JMM（Java 内存模型）保证，内存屏障（LoadLoad、StoreStore 等）',
  'volatile',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-3',
  'concurrency',
  0,
  NULL,
  'CAS 原理及 ABA 问题？',
  'CAS（Compare And Swap）：比较并交换，无锁编程基础。\n\n流程：读取内存值 V → 计算新值 N → 比较 V 和预期值 A → 相等则更新\n\nABA 问题：线程1读到A，线程2改为B又改为A，线程1CAS成功但已被改过。\n解决：加版本号（AtomicStampedReference）',
  'CAS',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-4',
  'concurrency',
  0,
  NULL,
  'AQS 原理分析？',
  'AQS（AbstractQueuedSynchronizer）是并发包的核心。\n\n核心组件：\n1. state：同步状态（volatile 修饰）\n2. CLH 队列：双向链表存储等待线程\n3. ConditionObject：条件变量\n\n工作流程：尝试获取锁（CAS修改state）→ 失败则加入队列阻塞 → 释放锁后唤醒后继',
  'AQS',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-5',
  'concurrency',
  0,
  NULL,
  '线程池的核心参数和执行流程？',
  '核心参数：\n1. corePoolSize：核心线程数\n2. maximumPoolSize：最大线程数\n3. keepAliveTime：空闲线程存活时间\n4. workQueue：任务队列\n5. handler：拒绝策略\n\n执行流程：核心线程未满创建线程 → 核心线程满入队 → 队列满创建非核心线程 → 最大线程数执行拒绝策略',
  '线程池',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-5-1',
  'concurrency',
  1,
  'concurrency-5',
  '线程池的拒绝策略有哪些？',
  '1. AbortPolicy（默认）：抛异常\n2. CallerRunsPolicy：调用者线程执行\n3. DiscardPolicy：直接丢弃\n4. DiscardOldestPolicy：丢弃最老的任务',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-5-2',
  'concurrency',
  1,
  'concurrency-5',
  '如何合理配置线程池参数？',
  'CPU 密集型：核心线程数 = CPU 核数 + 1\nIO 密集型：核心线程数 = CPU 核数 × 2\n或：线程数 = CPU 核数 × (1 + 等待时间/计算时间)',
  '',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-6',
  'concurrency',
  0,
  NULL,
  'ThreadLocal 的原理和内存泄漏问题？',
  '原理：每个线程持有 ThreadLocalMap，key 是 ThreadLocal 对象（弱引用），value 是线程局部变量。\n\n内存泄漏原因：key 弱引用，GC后key为null，value强引用无法回收。\n解决：使用后调用 remove() 清理',
  'ThreadLocal',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-7',
  'concurrency',
  0,
  NULL,
  'Java 线程的生命周期和状态转换？',
  '状态：NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED\n\n转换：\n- start() → RUNNABLE\n- synchronized → BLOCKED\n- wait() → WAITING\n- sleep(time) → TIMED_WAITING\n- run()结束 → TERMINATED',
  '线程',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-8',
  'concurrency',
  0,
  NULL,
  'wait() 和 sleep() 的区别？',
  'wait()：Object 方法，释放锁，需要唤醒，只能在同步块中调用\nsleep()：Thread 方法，不释放锁，超时自动唤醒，任意位置调用',
  '',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-9',
  'concurrency',
  0,
  NULL,
  'Java 并发包中的常用工具类？',
  '- CountDownLatch：等待N个事件完成\n- CyclicBarrier：N个线程互相等待\n- Semaphore：信号量，控制并发数\n- Exchanger：两个线程交换数据\n- ReentrantLock：可重入锁\n- ReadWriteLock：读写锁',
  '',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'concurrency-10',
  'concurrency',
  0,
  NULL,
  'ConcurrentHashMap 的实现原理？',
  'JDK 1.7：分段锁（Segment）+ 数组 + 链表\nJDK 1.8：CAS + synchronized 锁链表头节点 + 数组 + 链表/红黑树\n\n优化：取消分段锁减小锁粒度，size() 用 LongAdder 统计，扩容时多线程协作',
  'ConcurrentHashMap',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-1',
  'jvm',
  0,
  NULL,
  'JVM 内存模型包含哪些区域？',
  '线程私有：\n- 程序计数器：当前执行的字节码行号\n- 虚拟机栈：栈帧（局部变量表、操作数栈、动态链接、返回地址）\n- 本地方法栈：Native 方法\n\n线程共享：\n- 堆：对象实例、数组\n- 方法区：类信息、常量、静态变量（JDK8后元数据区）',
  '内存模型',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-1-1',
  'jvm',
  1,
  'jvm-1',
  'JDK 8 前后方法区的变化？',
  'JDK7及之前：永久代（PermGen）\nJDK8：元空间（Metaspace）\n\n区别：元空间在本地内存，不占用JVM堆内存，默认无上限（可配置），减少内存溢出风险',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-2',
  'jvm',
  0,
  NULL,
  'JVM 垃圾收集算法有哪些？',
  '1. 标记-清除：效率低，有内存碎片\n2. 标记-整理：移动存活对象，无碎片\n3. 复制算法：分成两块，存活复制到另一块\n4. 分代收集：新生代复制，老年代标记-整理',
  'GC',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-3',
  'jvm',
  0,
  NULL,
  '常见的垃圾收集器？',
  '新生代：Serial（单线程）、ParNew（多线程）、Parallel Scavenge（吞吐量优先）\n老年代：CMS（低延迟并发）、Serial Old、Parallel Old\nG1：区域化分代，可预测停顿时间，JDK9默认',
  'GC',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-3-1',
  'jvm',
  1,
  'jvm-3',
  'CMS 和 G1 的区别？',
  'CMS：老年代收集器，有空间碎片，不可预测停顿\nG1：全堆收集器，无碎片，可预测停顿，Region分区，SATB标记',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-4',
  'jvm',
  0,
  NULL,
  '类加载的过程和类加载器？',
  '加载过程：加载 → 验证 → 准备 → 解析 → 初始化\n\n类加载器：\n- Bootstrap ClassLoader：核心类库\n- Extension ClassLoader：扩展类库\n- Application ClassLoader：应用类路径\n\n双亲委派：先委托父加载器，失败才自己加载',
  '类加载',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-4-1',
  'jvm',
  1,
  'jvm-4',
  '为什么要用双亲委派模型？',
  '1. 安全性：避免核心类被恶意替换\n2. 唯一性：避免重复加载\n3. 层次结构：保证类的加载顺序',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-4-2',
  'jvm',
  1,
  'jvm-4',
  '如何打破双亲委派？',
  '1. 自定义ClassLoader重写loadClass()\n2. SPI机制：JDBC、JNDI\n3. OSGi：模块化动态加载',
  '',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-5',
  'jvm',
  0,
  NULL,
  'JVM 调优常用参数？',
  '内存配置：\n- -Xms：初始堆大小\n- -Xmx：最大堆大小\n- -Xmn：新生代大小\n- -XX:MetaspaceSize：元空间大小\n\nGC配置：\n- -XX:+UseG1GC：使用G1收集器\n- -XX:MaxGCPauseMillis：最大停顿时间\n- -XX:+PrintGCDetails：打印GC详情',
  '调优',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-6',
  'jvm',
  0,
  NULL,
  '如何排查 OOM 问题？',
  '1. 添加参数：-XX:+HeapDumpOnOutOfMemoryError\n2. 使用jmap生成dump文件\n3. MAT或VisualVM分析堆转储\n4. 查找大对象、内存泄漏\n\n常见原因：内存泄漏（未关闭资源）、大对象分配、堆内存不足',
  'OOM',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-7',
  'jvm',
  0,
  NULL,
  'JIT 编译器的作用？',
  'JIT（Just-In-Time）将热点代码编译为本地机器码。\n\n编译器：\n- C1（Client）：编译快，优化少\n- C2（Server）：编译慢，优化多\n- Graal（JDK10+）：新一代编译器\n\n优化技术：方法内联、逃逸分析、循环优化',
  'JIT',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-8',
  'jvm',
  0,
  NULL,
  'JVM 如何判断对象可以被回收？',
  '可达性分析：\n- GC Roots出发向下搜索\n- 不可达对象可被回收\n\nGC Roots：\n- 栈中引用的对象\n- 方法区静态属性引用\n- 方法区常量引用\n- 本地方法栈JNI引用',
  'GC',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-9',
  'jvm',
  0,
  NULL,
  'Java 的四种引用类型？',
  '1. 强引用：Object obj = new Object()，不会回收\n2. 软引用：内存不足时回收，缓存场景\n3. 弱引用：GC时回收，ThreadLocal\n4. 虚引用：无法通过引用获取对象，跟踪回收',
  '引用',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'jvm-10',
  'jvm',
  0,
  NULL,
  '对象在 JVM 中的存储结构？',
  '对象头：\n- Mark Word：哈希、锁信息、GC分代年龄\n- 类型指针：指向类元数据\n\n实例数据：字段数据\n\n对齐填充：保证8字节对齐',
  '',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-1',
  'spring',
  0,
  NULL,
  'Spring IOC 容器的原理？',
  'IOC（Inversion of Control）控制反转：对象创建权交给容器，解耦对象依赖关系。\nDI（依赖注入）是实现手段。\n\n核心容器：BeanFactory、ApplicationContext\n\n注入方式：构造器注入、Setter注入、字段注入（@Autowired）',
  'IOC',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-1-1',
  'spring',
  1,
  'spring-1',
  'BeanFactory 和 ApplicationContext 的区别？',
  'BeanFactory：基础容器，延迟加载，不支持AOP\nApplicationContext：高级容器，立即加载，支持AOP、事件、国际化',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-2',
  'spring',
  0,
  NULL,
  'Spring Bean 的生命周期？',
  '1. 实例化（Instantiation）\n2. 属性赋值（Populate）\n3. 初始化（Initialization）：Aware接口 → BeanPostProcessor → init-method\n4. 使用\n5. 销毁（Destruction）：BeanPostProcessor → destroy-method',
  'Bean生命周期',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-2-1',
  'spring',
  1,
  'spring-2',
  'BeanPostProcessor 的作用？',
  '在Bean初始化前后执行自定义逻辑。\n常见用途：AOP代理创建、属性校验、注解处理',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-3',
  'spring',
  0,
  NULL,
  'Spring AOP 的实现原理？',
  'AOP（Aspect Oriented Programming）面向切面编程。\n\n实现方式：\n1. JDK动态代理：基于接口\n2. CGLIB：基于类，生成子类\n\n核心概念：切面、连接点、切入点、通知、目标对象、代理',
  'AOP',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-3-1',
  'spring',
  1,
  'spring-3',
  'JDK 动态代理和 CGLIB 的区别？',
  'JDK动态代理：基于接口，只能代理接口方法\nCGLIB：基于类，通过继承生成子类，可以代理类方法\n\nSpring默认：有接口用JDK，无接口用CGLIB',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-4',
  'spring',
  0,
  NULL,
  'Spring 事务的原理和传播行为？',
  '原理：AOP + ThreadLocal绑定数据库连接\n\n传播行为：\n- REQUIRED（默认）：有事务就加入，无就新建\n- SUPPORTS：有事务就加入\n- MANDATORY：必须有事务\n- REQUIRES_NEW：新建事务，挂起当前\n- NOT_SUPPORTED：无事务方式运行\n- NEVER：必须无事务\n- NESTED：嵌套事务',
  '事务',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-4-1',
  'spring',
  1,
  'spring-4',
  'Spring 事务失效的场景？',
  '1. 方法不是public\n2. 同类方法调用（绕过代理）\n3. 异常被捕获未抛出\n4. 异常类型不匹配（默认RuntimeException）\n5. 数据库不支持事务',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-5',
  'spring',
  0,
  NULL,
  'Spring 如何解决循环依赖？',
  '三级缓存解决循环依赖：\n- singletonObjects：单例池\n- earlySingletonObjects：早期单例对象（未完成初始化）\n- singletonFactories：单例工厂\n\n流程：A创建 → 发现依赖B → B创建 → 发现依赖A → 从三级缓存获取A的引用 → B完成 → A完成',
  '循环依赖',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-5-1',
  'spring',
  1,
  'spring-5',
  '为什么三级缓存解决不了构造器循环依赖？',
  '构造器注入在实例化阶段就需要依赖对象，此时Bean还未创建，三级缓存中不存在。\n解决：使用@Lazy延迟加载',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-6',
  'spring',
  0,
  NULL,
  'Spring Boot 自动装配原理？',
  '@EnableAutoConfiguration → @Import(AutoConfigurationImportSelector)\n\n流程：\n1. 扫描META-INF/spring.factories\n2. 加载自动配置类\n3. 根据条件注解（@ConditionalOnClass等）筛选\n4. 注册Bean',
  '自动配置',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-7',
  'spring',
  0,
  NULL,
  'Spring 中的设计模式？',
  '1. 工厂模式：BeanFactory\n2. 单例模式：Spring Bean默认单例\n3. 代理模式：AOP\n4. 模板方法模式：JdbcTemplate\n5. 观察者模式：ApplicationEvent\n6. 策略模式：Resource加载\n7. 适配器模式：HandlerAdapter',
  '设计模式',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-8',
  'spring',
  0,
  NULL,
  '@Autowired 和 @Resource 的区别？',
  '@Autowired：Spring注解，默认按类型注入，配合@Qualifier指定名称\n@Resource：JDK注解，默认按名称注入，找不到再按类型',
  '',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-9',
  'spring',
  0,
  NULL,
  'Spring MVC 的工作流程？',
  '1. 请求到达DispatcherServlet\n2. 调用HandlerMapping查找Controller\n3. HandlerAdapter执行Controller\n4. 返回ModelAndView\n5. ViewResolver解析视图\n6. 渲染视图返回响应',
  'MVC',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'spring-10',
  'spring',
  0,
  NULL,
  'Spring Boot 的启动流程？',
  '1. 创建SpringApplication对象\n2. 加载Initializer和Listener\n3. 准备Environment\n4. 创建ApplicationContext\n5. 预处理Context\n6. 刷新Context（自动装配、Bean创建）\n7. 执行Runner',
  '',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-1',
  'mysql',
  0,
  NULL,
  'MySQL 索引的原理（B+树）？',
  'B+树特点：\n1. 非叶子节点只存储键值，不存储数据\n2. 叶子节点存储所有数据，形成链表\n3. 树高度低（通常3层），查询效率高\n\n优势：\n- 范围查询快（叶子节点有序链表）\n- 单节点存储更多键，树更矮\n- 磁盘IO次数少',
  '索引',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-1-1',
  'mysql',
  1,
  'mysql-1',
  '为什么 MySQL 用 B+树而不是 B树？',
  '1. B+树非叶子节点不存数据，单节点存更多键，树更矮\n2. B+树叶子节点形成链表，范围查询更快\n3. B+树所有查询都要到叶子节点，查询效率稳定',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-1-2',
  'mysql',
  1,
  'mysql-1',
  '聚簇索引和非聚簇索引的区别？',
  '聚簇索引：叶子节点存储完整数据，主键索引就是聚簇索引\n非聚簇索引：叶子节点存储主键值，需要回表查询完整数据\n\n覆盖索引：索引包含查询的所有字段，不需要回表',
  '',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-2',
  'mysql',
  0,
  NULL,
  'MySQL 事务的隔离级别？',
  '1. 读未提交（READ UNCOMMITTED）：脏读、不可重复读、幻读\n2. 读已提交（READ COMMITTED）：不可重复读、幻读\n3. 可重复读（REPEATABLE READ）：幻读（MVCC解决）\n4. 串行化（SERIALIZABLE）：无并发问题\n\nMySQL默认：可重复读',
  '事务',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-2-1',
  'mysql',
  1,
  'mysql-2',
  '什么是脏读、不可重复读、幻读？',
  '脏读：读到其他事务未提交的数据\n不可重复读：同一事务两次读取结果不同（修改导致）\n幻读：同一事务两次读取记录数不同（插入/删除导致）',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-3',
  'mysql',
  0,
  NULL,
  'MVCC 多版本并发控制原理？',
  'MVCC：每行数据保存版本链，通过Read View判断可见性。\n\n核心组件：\n- 隐藏字段：trx_id、roll_pointer\n- Undo Log：版本链\n- Read View：活跃事务列表\n\n判断规则：trx_id < min_trx_id → 可见',
  'MVCC',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-4',
  'mysql',
  0,
  NULL,
  'MySQL 的锁机制？',
  '按粒度：全局锁、表锁、行锁\n按类型：共享锁（S）、排他锁（X）、意向锁\n按算法：记录锁、间隙锁、临键锁\n\nInnoDB行锁：\n- 记录锁：锁单条记录\n- 间隙锁：锁间隙，防止插入\n- 临键锁：记录锁+间隙锁',
  '锁',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-4-1',
  'mysql',
  1,
  'mysql-4',
  '什么时候用间隙锁？',
  '在可重复读隔离级别下，防止幻读。\n- 间隙锁锁住一个范围，防止其他事务插入\n- 间隙锁之间不冲突，但与插入意向锁冲突',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-5',
  'mysql',
  0,
  NULL,
  'MySQL 查询优化方法？',
  '1. 使用索引：避免全表扫描\n2. 覆盖索引：避免回表\n3. 索引最左匹配：复合索引按顺序使用\n4. 避免索引失效：不在索引列上做运算\n5. 限制结果集：LIMIT\n6. 优化JOIN：小表驱动大表\n7. 避免SELECT *',
  '优化',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-5-1',
  'mysql',
  1,
  'mysql-5',
  '索引失效的场景？',
  '1. 在索引列上做运算\n2. 使用函数\n3. 类型转换\n4. LIKE以%开头\n5. OR条件有非索引列\n6. 复合索引未按最左匹配',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-6',
  'mysql',
  0,
  NULL,
  'MySQL 分库分表的策略？',
  '分表：\n- 垂直分表：拆分字段到不同表\n- 水平分表：拆分数据到不同表（按ID范围、Hash）\n\n分库：\n- 垂直分库：按业务拆分\n- 氰平分库：数据分散到多个库\n\n问题：跨库JOIN、分布式事务、主键生成',
  '分库分表',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-7',
  'mysql',
  0,
  NULL,
  'Explain 分析 SQL 执行计划？',
  '关键字段：\n- id：执行顺序\n- type：访问类型（const、ref、range、index、ALL）\n- key：使用的索引\n- rows：预估扫描行数\n- Extra：额外信息（Using index覆盖索引）',
  'Explain',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-8',
  'mysql',
  0,
  NULL,
  'MySQL 主从复制原理？',
  '流程：\n1. 主库写入Binlog\n2. 从库IO线程读取Binlog写入Relay Log\n3. 从库SQL线程执行Relay Log\n\n模式：异步复制、半同步复制、全同步复制',
  '主从',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-9',
  'mysql',
  0,
  NULL,
  'Redo Log 和 Undo Log？',
  'Redo Log：重做日志，记录物理修改，保证持久性（崩溃恢复）\nUndo Log：回滚日志，记录逻辑修改，保证原子性（事务回滚）、MVCC版本链',
  '',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'mysql-10',
  'mysql',
  0,
  NULL,
  'MySQL 如何避免死锁？',
  '1. 按相同顺序访问表和行\n2. 避免长事务\n3. 使用合理的索引\n4. 降低隔离级别\n5. 使用乐观锁',
  '死锁',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-1',
  'redis',
  0,
  NULL,
  'Redis 的数据结构和应用场景？',
  '5种基本结构：\n- String：缓存、计数器、分布式锁\n- Hash：对象存储、购物车\n- List：消息队列、关注列表\n- Set：去重、共同关注、抽奖\n- ZSet：排行榜、延时队列\n\n高级结构：HyperLogLog、Geo、Stream、Bitmap',
  '数据结构',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-1-1',
  'redis',
  1,
  'redis-1',
  'Redis ZSet 为什么使用跳表？',
  '1. 查找效率高：O(logN)\n2. 实现简单，比红黑树容易实现\n3. 内存占用合理\n4. 范围查询高效（有序链表遍历）',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-2',
  'redis',
  0,
  NULL,
  'Redis 持久化机制？',
  'RDB：\n- 定时保存数据快照\n- 文件小，恢复快\n- 可能丢失数据\n\nAOF：\n- 记录每个写操作\n- 数据安全，实时持久化\n- 文件大，恢复慢\n\n混合持久化：RDB+AOF（推荐）',
  '持久化',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-3',
  'redis',
  0,
  NULL,
  '缓存穿透、缓存击穿、缓存雪崩？',
  '穿透：查询不存在的key\n- 解决：布隆过滤器、缓存空值\n\n击穿：热点key过期瞬间大量请求\n- 解决：加锁重建、不设置过期时间\n\n雪崩：大量key同时过期\n- 解决：过期时间随机、多级缓存',
  '缓存问题',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-4',
  'redis',
  0,
  NULL,
  'Redis 分布式锁的实现？',
  '基本实现：SET key value NX PX timeout\n\n问题：\n- 锁过期时间不好估算\n- B释放了A的锁\n\nRedisson解决方案：\n- 看门狗自动续期\n- Lua脚本确保原子性\n- Redlock集群锁',
  '分布式锁',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-5',
  'redis',
  0,
  NULL,
  'Redis 集群模式？',
  '主从复制：读写分离，主写从读\n哨兵模式：监控、自动故障转移\nCluster：分片集群，槽位分配，自动迁移\n\nCluster特点：\n- 16384个槽位\n- 无中心节点\n- 自动分片',
  '集群',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-6',
  'redis',
  0,
  NULL,
  'Redis 内存淘汰策略？',
  'volatile：淘汰设置了过期时间的key\n- volatile-lru\n- volatile-lfu\n- volatile-ttl\n- volatile-random\n\nallkeys：淘汰所有key\n- allkeys-lru\n- allkeys-lfu\n- allkeys-random\n\nnoeviction：不淘汰（默认）',
  '',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-7',
  'redis',
  0,
  NULL,
  'Redis 为什么快？',
  '1. 基于内存：无磁盘IO开销\n2. 单线程：无锁竞争、无上下文切换\n3. IO多路复用：epoll\n4. 高效数据结构：跳表、压缩列表\n\nRedis 6.0引入多线程处理网络IO，核心仍是单线程',
  '',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-8',
  'redis',
  0,
  NULL,
  'Redis 事务机制？',
  '通过MULTI、EXEC、WATCH实现。\n\n特点：\n- 批量命令顺序执行\n- 无隔离级别（执行过程其他命令可插入）\n- 不支持回滚（有错误继续执行）\n\nWATCH：乐观锁，检查key是否被修改',
  '事务',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-9',
  'redis',
  0,
  NULL,
  'Redis 和 Memcached 的区别？',
  '数据类型：Redis 5种，Memcached仅String\n持久化：Redis支持，Memcached不支持\n集群：Redis原生支持，Memcached需客户端分片\n线程模型：Redis单线程（6.0多线程IO），Memcached多线程\n消息队列：Redis支持，Memcached不支持',
  '',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'redis-10',
  'redis',
  0,
  NULL,
  'Redis 的大Key问题？',
  '问题：\n- 内存分配消耗大\n- IO阻塞（大value读取）\n- 集群迁移慢\n\n解决：\n- 拆分大Key（如Hash拆分）\n- 使用压缩（压缩算法或数据结构）\n- 避免存储大对象',
  '',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-1',
  'algorithm',
  0,
  NULL,
  '常见排序算法及时间复杂度？',
  '冒泡排序：O(n²)\n选择排序：O(n²)\n插入排序：O(n²)\n快速排序：O(nlogn)\n归并排序：O(nlogn)\n堆排序：O(nlogn)\n\n稳定排序：冒泡、插入、归并\n不稳定排序：选择、快排、堆排',
  '排序',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-1-1',
  'algorithm',
  1,
  'algorithm-1',
  '快速排序的原理和优化？',
  '原理：选择基准，分为小于基准和大于基准两部分，递归排序。\n\n优化：\n- 三数取中选基准\n- 小区间使用插入排序\n- 尾递归优化\n- 三路快排（重复元素多时）',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-2',
  'algorithm',
  0,
  NULL,
  '二叉树遍历方式？',
  '前序遍历：根-左-右\n中序遍历：左-根-右\n后序遍历：左-右-根\n层序遍历：按层从上到下\n\n递归实现简洁，迭代用栈（DFS）或队列（BFS）',
  '树',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-3',
  'algorithm',
  0,
  NULL,
  '二分查找的实现？',
  '条件：有序数组\n\n模板：\nwhile(left <= right) {\n  int mid = left + (right-left)/2;\n  if(nums[mid] == target) return mid;\n  else if(nums[mid] < target) left = mid+1;\n  else right = mid-1;\n}\n\n变体：查找第一个/最后一个等于target的位置',
  '查找',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-4',
  'algorithm',
  0,
  NULL,
  '动态规划的核心思想？',
  '核心：将复杂问题分解为子问题，保存子问题的解避免重复计算。\n\n步骤：\n1. 定义状态\n2. 找状态转移方程\n3. 确定初始条件\n4. 计算顺序\n\n经典题目：爬楼梯、背包问题、最长公共子序列、最长递增子序列',
  'DP',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-5',
  'algorithm',
  0,
  NULL,
  '链表常见操作？',
  '反转链表：迭代或递归\n检测环：快慢指针\n找环入口：快慢指针相遇后从头走\n合并有序链表：双指针\n找中间节点：快慢指针\n删除倒数第N个：快慢指针',
  '链表',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-6',
  'algorithm',
  0,
  NULL,
  '栈和队列的互相实现？',
  '栈实现队列：两个栈，一个入栈，一个出栈，出栈为空时倒入\n队列实现栈：两个队列，倒来倒去，保持一个为空',
  '栈,队列',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-7',
  'algorithm',
  0,
  NULL,
  'BFS 和 DFS 的应用场景？',
  'BFS（广度优先）：\n- 最短路径（无权图）\n- 层序遍历\n- 用队列实现\n\nDFS（深度优先）：\n- 路径搜索\n- 拓扑排序\n- 用栈或递归实现',
  '图',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-8',
  'algorithm',
  0,
  NULL,
  'LRU 缓存实现？',
  '数据结构：HashMap + 双向链表\n\n操作：\n- get：移到链表头部\n- put：存在则更新并移到头部，不存在则插入头部，超出容量删除尾部\n\nJava：LinkedHashMap（accessOrder=true）',
  'LRU',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-9',
  'algorithm',
  0,
  NULL,
  'Top K 问题？',
  '方案：\n1. 排序：O(nlogn)\n2. 堆：维护大小为K的小顶堆，O(nlogk)\n3. 快速选择：基于快排partition，平均O(n)\n\n数据量大时用堆或快速选择',
  'TopK',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'algorithm-10',
  'algorithm',
  0,
  NULL,
  '字符串匹配算法？',
  '暴力匹配：O(mn)\nKMP：O(m+n)，利用next数组跳过已匹配部分\n\nnext数组：最长相同前后缀长度',
  '字符串',
  10
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-1',
  'distributed',
  0,
  NULL,
  'CAP 定理？',
  'CAP只能同时满足两个：\n- Consistency（一致性）：所有节点同一时刻数据一致\n- Availability（可用性）：每个请求都能在合理时间得到响应\n- Partition tolerance（分区容错）：网络分区时系统仍能运行\n\n实际选择：CP（Redis）或 AP（AP系统）',
  'CAP',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-1-1',
  'distributed',
  1,
  'distributed-1',
  '为什么不能同时满足 CAP？',
  '网络分区必然存在（P必须有），此时要在C和A之间选择：\n- 要一致性：拒绝部分请求（放弃可用性）\n- 要可用性：允许部分节点数据不一致（放弃一致性）',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-2',
  'distributed',
  0,
  NULL,
  'BASE 理论？',
  'Basically Available（基本可用）：允许损失部分可用性\nSoft state（软状态）：允许中间状态\nEventually consistent（最终一致性）：经过一段时间后达到一致\n\nBASE是对CAP的补充，追求最终一致性',
  'BASE',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-3',
  'distributed',
  0,
  NULL,
  '分布式锁的实现方式？',
  '基于数据库：唯一索引\n基于Redis：SET NX + Lua脚本\n基于ZooKeeper：临时有序节点\n基于etcd：Raft协议\n\n对比：\n- Redis：性能高，但可能不满足强一致\n- ZooKeeper：强一致，但性能较低\n- etcd：兼顾性能和一致性',
  '分布式锁',
  3
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-4',
  'distributed',
  0,
  NULL,
  '分布式事务解决方案？',
  '2PC（两阶段提交）：协调者、参与者，强一致但阻塞\n3PC：增加准备阶段，减少阻塞\nTCC：Try-Confirm-Cancel，业务侵入\n本地消息表：异步确保，最终一致\n消息事务：MQ事务消息\nSeata：AT、TCC、SAGA模式',
  '分布式事务',
  4
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-4-1',
  'distributed',
  1,
  'distributed-4',
  '2PC 有什么问题？',
  '1. 同步阻塞：参与者在等待协调者指令时锁定资源\n2. 单点故障：协调者宕机导致事务阻塞\n3. 数据不一致：协调者第二阶段发送部分失败',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-5',
  'distributed',
  0,
  NULL,
  '消息队列的作用？',
  '解耦：系统间通过消息通信，降低耦合\n异步：非核心流程异步处理，提高响应速度\n削峰：高峰请求写入队列，后台慢慢处理\n广播：一条消息多个消费者\n\n常见MQ：RabbitMQ、Kafka、RocketMQ',
  '消息队列',
  5
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-5-1',
  'distributed',
  1,
  'distributed-5',
  '如何保证消息不丢失？',
  '生产者：确认机制（ACK）\nBroker：同步刷盘、多副本\n消费者：手动提交offset',
  '',
  1
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-5-2',
  'distributed',
  1,
  'distributed-5',
  '如何保证消息顺序？',
  '单队列单消费者\n分区有序：同一分区内有序（Kafka）\n生产者按Key分片',
  '',
  2
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-6',
  'distributed',
  0,
  NULL,
  'Kafka 和 RabbitMQ 的区别？',
  'Kafka：\n- 高吞吐，适合大数据\n- 消息持久化到磁盘\n- 分区有序\n- 消费者pull模式\n\nRabbitMQ：\n- 低延迟，适合业务消息\n- 支持多种协议\n- 消息优先级、延迟队列\n- push模式',
  '',
  6
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-7',
  'distributed',
  0,
  NULL,
  '分布式 ID 生成方案？',
  'UUID：无序、无业务含义\n数据库自增：单点瓶颈\nRedis自增：依赖Redis\nSnowflake：时间戳+机器ID+序号，有序、高性能\nLeaf：美团方案，双buffer\n',
  '',
  7
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-8',
  'distributed',
  0,
  NULL,
  'ZooKeeper 的作用？',
  '配置管理：集中式配置\n服务注册：服务发现\n分布式锁：临时节点\n集群选举：Leader选举\n\n数据模型：树形结构，ZNode\n一致性协议：ZAB',
  'ZooKeeper',
  8
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-9',
  'distributed',
  0,
  NULL,
  'Raft 协议？',
  'Leader选举：随机超时选举\n日志复制：Leader负责日志同步\n安全性：已提交日志不会被覆盖\n\n角色：Leader、Follower、Candidate',
  'Raft',
  9
);
INSERT INTO questions (id, category, level, parent_id, title, answer, tags, sort_order) VALUES (
  'distributed-10',
  'distributed',
  0,
  NULL,
  '微服务架构的优缺点？',
  '优点：\n- 服务独立部署、扩展\n- 技术栈灵活\n- 故障隔离\n\n缺点：\n- 运维复杂\n- 分布式问题（事务、调用）\n- 服务治理成本\n\n服务治理：注册中心、配置中心、网关、熔断降级',
  '微服务',
  10
);
