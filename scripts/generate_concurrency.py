#!/usr/bin/env python3
"""
扩充并发编程题目答案到1000-3000字
"""

import json
from pathlib import Path

# 深度答案模板
DEEP_ANSWERS = {
    "concurrency-1": {
        "title": "synchronized 关键字的原理？",
        "answer": """【核心概念】synchronized 是 Java 内置的互斥锁机制，用于保证多线程访问共享资源时的线程安全。它基于对象的监视器（Monitor）实现，每个 Java 对象都可以作为锁。synchronized 具有原子性、可见性和可重入性三个核心特性。

【底层原理】synchronized 的实现依赖 JVM 的对象头 Mark Word。对象头包含：
- 锁状态标志（2位）：无锁、偏向锁、轻量级锁、重量级锁
- 哈希码（25位）：对象hashCode
- 分代年龄（4位）：GC年龄
- 偏向线程ID（23位）：偏向锁持有者
- 锁记录指针（30位）：轻量级锁

锁升级过程（JDK6优化后）：
1. 无锁 → 偏向锁：第一个线程获取锁时，CAS将线程ID写入Mark Word
2. 偏向锁 → 轻量级锁：发生竞争时，撤销偏向锁，CAS替换Mark Word为锁记录指针
3. 轻量级锁 → 重量级锁：自旋超过一定次数（默认10次），膨胀为重量级锁

重量级锁基于操作系统的 Mutex Lock 实现，涉及用户态与内核态切换，开销较大。

【代码示例】
```java
// 1. 实例方法锁 - 锁当前对象实例
public synchronized void instanceMethod() {
    // 等价于 synchronized(this) { ... }
}

// 2. 静态方法锁 - 锁 Class 对象
public static synchronized void staticMethod() {
    // 等价于 synchronized(ClassName.class) { ... }
}

// 3. 同步代码块 - 锁指定对象
public void blockLock() {
    synchronized(this) {
        // 临界区代码
    }
}

// 4. 锁对象监视器
private final Object lock = new Object();
public void customLock() {
    synchronized(lock) {
        // 使用自定义锁对象
    }
}
```

【对比分析】与 ReentrantLock 对比：

| 特性 | synchronized | ReentrantLock |
|------|--------------|---------------|
| 实现层面 | JVM 关键字 | Java API |
| 锁释放 | 自动释放 | 手动 unlock() |
| 公平性 | 非公平锁 | 可选公平/非公平 |
| 中断响应 | 不支持 | lockInterruptibly() |
| 条件变量 | 单一条件 | 多个 Condition |
| 锁状态查询 | 不支持 | isLocked() 等 |
| 死锁检测 | JVM 检测 | 需编程处理 |

【常见陷阱】
1. 锁对象被替换：如果同步块中的对象引用被修改，锁会失效
```java
String lock = "lock";
synchronized(lock) {
    lock = "newLock"; // 锁对象变了！
}
```

2. 静态变量同步问题：静态方法锁的是 Class 对象，不是实例
```java
class Counter {
    static int count = 0;
    public synchronized void increment() {
        count++; // 这个锁不住！需要锁 Counter.class
    }
}
```

3. 等待超时陷阱：wait() 必须在 synchronized 块中
```java
// 错误！
obj.wait(); // IllegalMonitorStateException

// 正确
synchronized(obj) {
    obj.wait();
}
```

【延伸追问】
1. synchronized 锁升级后能降级吗？
   答：不能。锁只能升级，不能降级。这是 JVM 的设计决策，因为降级的场景很少且实现复杂。

2. 为什么 synchronized 是非公平锁？
   答：非公平锁性能更高。线程唤醒后立即尝试获取锁，无需排队。虽然可能导致"饥饿"，但实际中很少发生。

3. 对象头中的锁信息什么时候写入？
   答：偏向锁在线程首次获取锁时写入；轻量级锁在 CAS 成功时替换；重量级锁指向 monitor 对象。

4. synchronized 和 volatile 的区别？
   答：synchronized 保证原子性、可见性、有序性；volatile 只保证可见性和有序性（禁止重排序），不保证原子性。

【实际应用】
在项目中，synchronized 常用于：
1. 单例模式的双重检查锁定（需要配合 volatile）
2. 简单的线程安全计数器
3. 保护临界区代码

注意：在高并发场景下，优先考虑 java.util.concurrent 包中的原子类和并发容器，性能更好。""",
        "keyPoints": ["Monitor", "Mark Word", "锁升级", "可重入性"],
    },
    
    "concurrency-2": {
        "title": "volatile 关键字的作用和原理？",
        "answer": """【核心概念】volatile 是 Java 提供的轻量级同步机制，用于保证变量的可见性和禁止指令重排序。相比 synchronized，volatile 更轻量但功能有限，不保证原子性。

**可见性**：当一个线程修改 volatile 变量，其他线程能立即看到最新值。
**禁止重排序**：通过内存屏障防止指令重排序优化。

【底层原理】volatile 的实现依赖 Java 内存模型（JMM）和 CPU 缓存一致性协议。

**JMM 内存模型**：
- 主内存：所有线程共享的内存区域
- 工作内存：每个线程私有的内存副本
- volatile 变量读写时强制刷新到主内存

**内存屏障类型**：
1. LoadLoad：Load1 → Load2，确保 Load1 先于 Load2
2. StoreStore：Store1 → Store2，确保 Store1 先于 Store2
3. LoadStore：Load → Store，确保 Load 先于 Store
4. StoreLoad：Store → Load，确保 Store 先于 Load（全能屏障）

volatile 写操作：StoreStore → 写入 → StoreLoad
volatile 读操作：LoadLoad → 读取 → LoadStore

【代码示例】
```java
// 1. 状态标志位 - 最常见用途
private volatile boolean shutdown = false;

public void shutdown() {
    shutdown = true;
}

public void doWork() {
    while (!shutdown) {
        // 工作循环
    }
}

// 2. 双重检查锁定单例
public class Singleton {
    private static volatile Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {                    // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) {            // 第二次检查
                    instance = new Singleton();    // volatile 防止重排序
                }
            }
        }
        return instance;
    }
}

// 3. volatile 不保证原子性 - 错误示例
private volatile int counter = 0;

public void increment() {
    counter++;  // 不是原子操作！读-改-写三步
}

// 正确做法
private AtomicInteger counter = new AtomicInteger(0);
public void increment() {
    counter.incrementAndGet();  // CAS 保证原子性
}
```

【深入分析】为什么 volatile 不能保证原子性？

count++ 看似一行代码，实际分为三步：
1. 读取 count 的值到工作内存
2. 工作内存中 count + 1
3. 将新值写回主内存

volatile 只保证第3步对其他线程可见，但不保证这三步作为原子操作执行。两个线程可能同时读到旧值，各自加1后写回，最终结果少了一次增量。

【常见陷阱】
1. 误用 volatile 保证原子性
```java
// 错误！多线程下 counter 会少计数
volatile int counter = 0;
for (int i = 0; i < 1000; i++) {
    new Thread(() -> counter++).start();
}
```

2. 复合操作问题
```java
volatile Map<String, String> map = new HashMap<>();
// volatile 只保证 map 引用的可见性
// 不保证 map.put() 的线程安全
map.put("key", "value");  // 仍需同步！
```

【延伸追问】
1. volatile 和 synchronized 的选择？
   答：简单状态标志用 volatile；复合操作、需要原子性用 synchronized 或 Lock。

2. 为什么双重检查锁定需要 volatile？
   答：instance = new Singleton() 分三步：分配内存、初始化对象、引用指向内存。步骤2和3可能重排序，导致其他线程获取到未初始化的对象。

3. volatile 能代替锁吗？
   答：不能。volatile 只保证单个变量的可见性，不能保证多个变量的操作一致性。

4. Happens-Before 规则中 volatile 的作用？
   答：volatile 写操作 Happens-Before 后续的 volatile 读操作，保证可见性传递。

【实际应用】
1. 线程状态标志（如 shutdown、running）
2. 单例模式的双重检查锁定
3. 读多写少的场景（用 CopyOnWriteArrayList 替代）
4. 作为触发器，保证之前的操作对其他线程可见""",
        "keyPoints": ["可见性", "内存屏障", "JMM", "Happens-Before"],
    },

    "concurrency-3": {
        "title": "CAS 原理及 ABA 问题？",
        "answer": """【核心概念】CAS（Compare And Swap）是一种无锁编程技术，基于硬件指令实现原子操作。它是 Java 并发包的基础，许多并发类如 AtomicInteger、ReentrantLock 都依赖 CAS。

CAS 包含三个操作数：
- V：内存值
- A：预期值
- B：新值

当且仅当 V == A 时，才将 V 更新为 B。整个过程是原子操作，由 CPU 指令保证。

【底层原理】CAS 在不同 CPU 架构上有不同实现：
- x86：cmpxchg 指令 + lock 前缀
- ARM：ldxr/stxr 独占加载/存储指令

Java 中通过 Unsafe 类调用本地方法：
```java
// Unsafe 类的 CAS 方法
public final boolean compareAndSwapInt(Object o, long offset, int expected, int x);
```

JVM 会根据操作系统选择对应的本地实现，最终调用 CPU 的原子指令。

【代码示例】
```java
import java.util.concurrent.atomic.AtomicInteger;

public class CASTest {
    // AtomicInteger 的 CAS 实现
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        // 自旋 CAS
        int prev, next;
        do {
            prev = count.get();
            next = prev + 1;
        } while (!count.compareAndSet(prev, next));
    }
    
    // 更优雅的方式
    public void incrementSimple() {
        count.incrementAndGet();  // 内部也是 CAS
    }
}

// 模拟 CAS 实现
class SimulatedCAS {
    private int value;
    
    public synchronized int compareAndSwap(int expected, int newValue) {
        int oldValue = value;
        if (oldValue == expected) {
            value = newValue;
        }
        return oldValue;
    }
}
```

【ABA 问题】问题描述：线程1读取值为A，线程2将A改为B又改为A，线程1的CAS操作会成功，但值已被修改过。

场景示例：
```java
// ABA 问题场景：栈操作
class Stack {
    private Node head;
    
    public void pop() {
        Node oldHead = head;          // 读取 head = A
        Node newHead = oldHead.next;  // newHead = B
        // 此时另一线程 pop A, pop B, push A
        // 栈变成 A -> C -> ...
        CAS(head, oldHead, newHead);  // CAS 成功！但栈结构已错误
    }
}
```

解决方案：加版本号
```java
import java.util.concurrent.atomic.AtomicStampedReference;

public class ABASolution {
    private AtomicStampedReference<Integer> ref = 
        new AtomicStampedReference<>(100, 0);
    
    public void update() {
        int[] stamp = new int[1];
        Integer oldRef = ref.get(stamp);
        int oldStamp = stamp[0];
        
        // 其他线程修改
        ref.compareAndSet(100, 101, oldStamp, oldStamp + 1);
        ref.compareAndSet(101, 100, oldStamp + 1, oldStamp + 2);
        
        // CAS 失败！版本号不匹配
        ref.compareAndSet(oldRef, 200, oldStamp, oldStamp + 1);
    }
}
```

【深入分析】CAS 的优缺点

优点：
1. 无锁设计，不阻塞线程
2. 性能高，无上下文切换开销
3. 适合读多写少场景

缺点：
1. ABA 问题：需要版本号解决
2. 循环时间长开销大：自旋失败会消耗 CPU
3. 只能保证一个共享变量的原子性

【常见陷阱】
1. 忘记处理 CAS 失败情况
```java
// 错误：没有循环重试
if (!atomicInt.compareAndSet(old, new)) {
    // 需要处理失败！
}
```

2. 多变量 CAS 不存在
```java
// 想原子更新多个变量？
int a, b;
// CAS 只能操作一个变量！需要用 AtomicReference 包装对象
```

【延伸追问】
1. CAS 和 synchronized 性能对比？
   答：低竞争时 CAS 性能更好；高竞争时 CAS 自旋消耗大量 CPU，synchronized 可能更好。

2. Java 9+ 对 CAS 有什么改进？
   答：引入 VarHandle 类，比 Unsafe 更安全、更规范的内存操作 API。

3. LongAdder 为什么比 AtomicLong 快？
   答：LongAdder 使用分散热点技术，多个 Cell 存储值，减少 CAS 竞争。

【实际应用】
1. 原子类：AtomicInteger、AtomicLong、AtomicReference
2. 并发容器：ConcurrentHashMap 的 putVal
3. 锁实现：ReentrantLock 的 tryAcquire
4. 数据库乐观锁：version 字段 + CAS 思想""",
        "keyPoints": ["无锁", "原子操作", "ABA问题", "AtomicStampedReference"],
    },

    "concurrency-4": {
        "title": "AQS 原理分析？",
        "answer": """【核心概念】AQS（AbstractQueuedSynchronizer）是 Java 并发包的核心基石，由 Doug Lea 设计。它提供了一个框架，用于构建锁和同步器，如 ReentrantLock、CountDownLatch、Semaphore 都基于 AQS 实现。

AQS 核心思想：
- 使用 volatile int state 表示同步状态
- 使用 CLH 队列（双向链表）存储等待线程
- 提供独占模式和共享模式

【底层原理】AQS 的核心数据结构：

```java
public abstract class AbstractQueuedSynchronizer {
    // 同步状态，volatile 保证可见性
    private volatile int state;
    
    // 等待队列头节点（延迟初始化）
    private transient volatile Node head;
    
    // 等待队列尾节点
    private transient volatile Node tail;
    
    // Node 节点结构
    static final class Node {
        volatile Node prev;       // 前驱节点
        volatile Node next;       // 后继节点
        volatile Thread thread;   // 等待的线程
        volatile int waitStatus;  // 状态：CANCELLED、SIGNAL、CONDITION、PROPAGATE
    }
}
```

**锁获取流程**：
1. tryAcquire() 尝试获取锁（CAS 修改 state）
2. 获取失败，addWaiter() 将当前线程加入队列
3. acquireQueued() 自旋尝试获取锁
4. 失败则 shouldParkAfterFailedAcquire() 判断是否需要阻塞
5. parkAndCheckInterrupt() 调用 LockSupport.park() 阻塞线程

**锁释放流程**：
1. tryRelease() 尝试释放锁
2. 修改 state 为 0
3. unparkSuccessor() 唤醒后继节点

【代码示例】
```java
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

// 自定义独占锁
class Mutex {
    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire(int arg) {
            return compareAndSetState(0, 1);  // CAS 获取锁
        }
        
        @Override
        protected boolean tryRelease(int arg) {
            setState(0);  // 释放锁
            return true;
        }
        
        @Override
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }
    }
    
    private final Sync sync = new Sync();
    
    public void lock() {
        sync.acquire(1);
    }
    
    public void unlock() {
        sync.release(1);
    }
}

// 使用 ReentrantLock 查看 AQS 内部
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

【深入分析】CLH 队列的变体

原始 CLH 队列是单向链表，AQS 做了改进：

1. **双向链表**：prev 指针方便处理取消节点
2. **阻塞而非自旋**：未获取锁的线程会被 park，减少 CPU 消耗
3. **公平性**：新线程可以选择是否尝试插队（公平锁 vs 非公平锁）

**公平锁 vs 非公平锁**：
- 公平锁：新线程必须排队，先来先得
- 非公平锁：新线程先尝试 CAS，失败再排队

非公平锁性能更好，因为减少了线程切换，但可能导致"饥饿"。

【常见陷阱】
1. 忘记释放锁
```java
lock.lock();
// 异常导致 unlock 未执行！
doSomething();
lock.unlock();
```

正确做法：
```java
lock.lock();
try {
    doSomething();
} finally {
    lock.unlock();  // 始终在 finally 中释放
}
```

2. Condition 使用错误
```java
Condition condition = lock.newCondition();
// 必须先获取锁
condition.await();  // IllegalMonitorStateException!

// 正确
lock.lock();
try {
    while (!conditionMet) {
        condition.await();
    }
} finally {
    lock.unlock();
}
```

【延伸追问】
1. AQS 为什么用双向链表？
   答：单向链表删除节点需要遍历找到前驱，双向链表可以直接操作，O(1) 复杂度。

2. 独占模式和共享模式的区别？
   答：独占模式只有一个线程能获取锁（如 ReentrantLock）；共享模式允许多个线程同时获取（如 CountDownLatch、Semaphore）。

3. Condition 和 Object.wait/notify 的区别？
   答：Condition 支持多个等待队列、可中断等待、超时等待，更灵活。

【实际应用】
1. ReentrantLock：可重入独占锁
2. ReentrantReadWriteLock：读写分离锁
3. CountDownLatch：倒计时器
4. Semaphore：信号量
5. CyclicBarrier：循环栅栏

自定义同步器时继承 AQS，只需实现 tryAcquire/tryRelease 方法。""",
        "keyPoints": ["state", "CLH队列", "独占/共享模式", "Condition"],
    },

    "concurrency-5": {
        "title": "线程池的核心参数和执行流程？",
        "answer": """【核心概念】线程池（ThreadPoolExecutor）是 Java 并发包提供的线程管理工具，它通过复用线程、控制并发数来提高性能。合理配置线程池是高并发编程的关键技能。

【7大核心参数】
```java
public ThreadPoolExecutor(
    int corePoolSize,          // 核心线程数
    int maximumPoolSize,       // 最大线程数
    long keepAliveTime,        // 空闲线程存活时间
    TimeUnit unit,             // 时间单位
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,         // 线程工厂
    RejectedExecutionHandler handler     // 拒绝策略
)
```

**参数详解**：
1. corePoolSize：核心线程数，即使空闲也不会被回收（除非设置 allowCoreThreadTimeOut）
2. maximumPoolSize：最大线程数，当队列满时创建临时线程，最多到此值
3. keepAliveTime：非核心线程空闲超过此时间会被回收
4. workQueue：等待执行的任务队列
5. threadFactory：创建线程的工厂，可自定义线程名称、优先级等
6. handler：饱和时的拒绝策略

【执行流程】
```
提交任务
    ↓
核心线程数未满？
    ├─ 是 → 创建核心线程执行任务
    └─ 否 → 尝试加入队列
              ↓
         队列未满？
              ├─ 是 → 加入队列等待
              └─ 否 → 尝试创建非核心线程
                        ↓
                   达到最大线程数？
                        ├─ 是 → 执行拒绝策略
                        └─ 否 → 创建非核心线程执行
```

【4种拒绝策略】
```java
// 1. AbortPolicy（默认）- 抛异常
throw new RejectedExecutionException("Task rejected");

// 2. CallerRunsPolicy - 调用者线程执行
public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    if (!e.isShutdown()) {
        r.run();  // 在提交任务的线程中执行
    }
}

// 3. DiscardPolicy - 静默丢弃
public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    // 什么都不做
}

// 4. DiscardOldestPolicy - 丢弃最老的任务
public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    if (!e.isShutdown()) {
        e.getQueue().poll();  // 丢弃队首
        e.execute(r);          // 重新提交
    }
}
```

【代码示例】
```java
import java.util.concurrent.*;

// 推荐的线程池创建方式
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                         // corePoolSize
    20,                         // maximumPoolSize
    60L,                        // keepAliveTime
    TimeUnit.SECONDS,           // 时间单位
    new LinkedBlockingQueue<>(1000),  // 有界队列！
    new ThreadFactoryBuilder()
        .setNameFormat("worker-%d")
        .setDaemon(false)
        .build(),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 使用
executor.submit(() -> {
    // 任务逻辑
});

// 优雅关闭
executor.shutdown();
if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
    executor.shutdownNow();
}

// 不推荐！ Executors 静态方法的问题
// FixedThreadPool 和 SingleThreadPool：队列无界，可能 OOM
// CachedThreadPool：线程数无界，可能 OOM
// ScheduledThreadPool：队列无界，可能 OOM
```

【参数配置建议】

**CPU 密集型**（计算多，IO少）：
```java
int cores = Runtime.getRuntime().availableProcessors();
corePoolSize = cores + 1;  // 避免上下文切换
workQueue = new LinkedBlockingQueue<>(200);
```

**IO 密集型**（网络/文件 IO 多）：
```java
int cores = Runtime.getRuntime().availableProcessors();
corePoolSize = cores * 2;  // 或使用公式
// 线程数 = CPU核数 * (1 + 平均等待时间/平均计算时间)
workQueue = new LinkedBlockingQueue<>(500);
```

【常见陷阱】
1. 使用 Executors 创建线程池
```java
// 危险！队列无界，可能 OOM
ExecutorService executor = Executors.newFixedThreadPool(10);

// 安全做法
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10, 10, 0L, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<>(1000)  // 有界队列
);
```

2. 忘记关闭线程池
```java
// 错误：程序无法退出
executor.submit(task);

// 正确：注册关闭钩子
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    executor.shutdown();
}));
```

3. 任务队列过大
```java
// 错误：任务堆积，响应延迟
new LinkedBlockingQueue<>();  // 无界！

// 正确：设置合理容量
new LinkedBlockingQueue<>(1000);
```

【延伸追问】
1. 核心线程能被回收吗？
   答：默认不能。设置 allowCoreThreadTimeOut(true) 后可以。

2. 如何监控线程池状态？
   答：使用 executor.getActiveCount()、getQueue().size()、getCompletedTaskCount() 等方法。

3. shutdown() 和 shutdownNow() 的区别？
   答：shutdown() 等待已提交任务执行完；shutdownNow() 尝试中断正在执行的任务。

【实际应用】
1. Web 服务器请求处理
2. 异步任务处理
3. 定时任务调度
4. 批量数据处理

监控指标：活跃线程数、队列大小、完成任务数、拒绝任务数。设置告警阈值。""",
        "keyPoints": ["7大参数", "4种拒绝策略", "有界队列", "优雅关闭"],
    },

    "concurrency-6": {
        "title": "ThreadLocal 的原理和内存泄漏问题？",
        "answer": """【核心概念】ThreadLocal 提供线程局部变量，每个线程都有独立的变量副本，互不干扰。常用于数据库连接、用户上下文、日期格式化等场景。

【底层原理】ThreadLocal 的数据结构：
```
Thread
  └── ThreadLocalMap (Thread 的成员变量)
        └── Entry extends WeakReference<ThreadLocal<?>>
              ├── key: ThreadLocal 对象 (弱引用)
              └── value: 线程局部变量值 (强引用)
```

关键点：
1. ThreadLocalMap 是 Thread 类的成员变量
2. Entry 的 key 是 ThreadLocal 的弱引用
3. Entry 的 value 是强引用

```java
// Thread 类源码
public class Thread {
    ThreadLocal.ThreadLocalMap threadLocals = null;
}

// ThreadLocalMap.Entry
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;  // 强引用！
    Entry(ThreadLocal<?> k, Object v) {
        super(k);  // key 是弱引用
        value = v;
    }
}
```

【内存泄漏原因】

泄漏链路：
```
ThreadLocal ref → ThreadLocal 对象 (强引用)
                          ↓
ThreadLocalMap.Entry.key → ThreadLocal (弱引用)
ThreadLocalMap.Entry.value → 数据 (强引用)
```

1. ThreadLocal 外部强引用被置为 null
2. GC 时，Entry 的 key（弱引用）被回收，变为 null
3. 但 value 仍是强引用，无法回收
4. 如果线程长期存活（如线程池中的线程），value 无法释放

【代码示例】
```java
// 正确使用模式
private static final ThreadLocal<SimpleDateFormat> dateFormat = 
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

public String formatDate(Date date) {
    try {
        return dateFormat.get().format(date);
    } finally {
        dateFormat.remove();  // 必须清理！
    }
}

// 用户上下文示例
public class UserContext {
    private static final ThreadLocal<User> currentUser = new ThreadLocal<>();
    
    public static void setUser(User user) {
        currentUser.set(user);
    }
    
    public static User getUser() {
        return currentUser.get();
    }
    
    public static void clear() {
        currentUser.remove();  // 请求结束时清理
    }
}

// Web 过滤器中自动清理
public class UserContextFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        try {
            UserContext.setUser(getUserFromRequest(req));
            chain.doFilter(req, res);
        } finally {
            UserContext.clear();  // 必须清理
        }
    }
}
```

【深入分析】为什么 key 用弱引用？

如果 key 用强引用：
- ThreadLocal 外部引用置为 null
- 但 Entry.key 仍引用 ThreadLocal
- ThreadLocal 无法回收
- 整个 Entry 无法回收

使用弱引用：
- 外部引用置为 null
- GC 时 key 被回收，变为 null
- get/set/remove 时会清理 key 为 null 的 Entry
- 如果不调用这些方法，value 仍会泄漏

【内存泄漏解决方案】

1. **及时调用 remove()**：最佳实践
```java
try {
    threadLocal.set(value);
    // 使用
} finally {
    threadLocal.remove();  // 必须清理
}
```

2. **使用 try-finally 模式**：确保清理
3. **线程池场景特别注意**：线程会被复用，必须清理

【常见陷阱】
1. 在线程池中忘记清理
```java
// 错误！线程池线程会被复用
executor.submit(() -> {
    UserContext.setUser(user);
    // 处理逻辑
    // 没有 remove()！下次复用时可能读到脏数据
});

// 正确
executor.submit(() -> {
    try {
        UserContext.setUser(user);
        // 处理逻辑
    } finally {
        UserContext.remove();
    }
});
```

2. ThreadLocal 作为实例变量
```java
// 危险！每个实例一个 ThreadLocal，可能导致内存泄漏
public class BadExample {
    private ThreadLocal<Object> local = new ThreadLocal<>();
}

// 正确：使用 static final
public class GoodExample {
    private static final ThreadLocal<Object> local = new ThreadLocal<>();
}
```

【延伸追问】
1. ThreadLocal 和 synchronized 的区别？
   答：ThreadLocal 是空间换时间，每个线程独立副本；synchronized 是时间换空间，共享变量加锁。

2. InheritableThreadLocal 有什么用？
   答：子线程可以继承父线程的 ThreadLocal 值。但线程池场景需使用 TransmittableThreadLocal。

3. ThreadLocal 在 Spring 中的应用？
   答：RequestContextHolder、TransactionSynchronizationManager、LocaleContextHolder 都使用 ThreadLocal。

【实际应用】
1. 数据库连接管理：每个线程独立连接
2. 用户会话上下文：存储当前用户信息
3. 日期格式化：SimpleDateFormat 非线程安全，用 ThreadLocal 隔离
4. 事务管理：Spring 事务与线程绑定
5. 请求追踪：存储 traceId 等 MDC 信息""",
        "keyPoints": ["ThreadLocalMap", "弱引用", "内存泄漏", "remove()"],
    },
}

def expand_concurrency():
    """扩充并发编程答案"""
    data_dir = Path(__file__).parent.parent / "data"
    input_file = data_dir / "concurrency.json"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    # 扩充答案
    for q in questions:
        if q['id'] in DEEP_ANSWERS:
            deep = DEEP_ANSWERS[q['id']]
            q['answer'] = deep['answer']
            print(f"扩充: {q['id']} - {q['title']}")
    
    # 写回文件
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"已完成 {len(questions)} 题的答案扩充")

if __name__ == "__main__":
    expand_concurrency()
