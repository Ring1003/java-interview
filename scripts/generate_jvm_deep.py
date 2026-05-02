#!/usr/bin/env python3
"""
扩充 JVM 题目答案到1000-3000字
"""

import json
from pathlib import Path

DEEP_ANSWERS = {
    "jvm-1": """【核心概念】JVM 内存模型（Java Memory Model, JMM）定义了 Java 程序中各种变量的访问规则，以及在并发环境下如何保证原子性、可见性和有序性。JVM 运行时数据区分为线程私有和线程共享两部分。

【运行时数据区详解】

**线程私有区域（随线程创建和销毁）：**

1. **程序计数器（Program Counter Register）**
   - 当前线程执行的字节码行号指示器
   - 如果执行 native 方法，计数器值为空
   - 唯一不会出现 OutOfMemoryError 的区域

2. **虚拟机栈（Java Virtual Machine Stack）**
   - 描述 Java 方法执行的内存模型
   - 每个方法执行时创建一个栈帧（Stack Frame）
   - 栈帧包含：局部变量表、操作数栈、动态链接、方法返回地址
   - 局部变量表存储基本类型、对象引用、returnAddress 类型
   - StackOverflowError：递归过深，栈帧过多
   - OutOfMemoryError：无法分配新栈（-Xss 参数设置栈容量）

3. **本地方法栈（Native Method Stack）**
   - 为 Native 方法服务
   - HotSpot 将本地方法栈和虚拟机栈合二为一

**线程共享区域：**

1. **堆（Heap）**
   - 所有对象实例和数组都在堆上分配
   - GC 的主要区域，也称"GC 堆"
   - 可细分为：新生代（Eden + Survivor）和老年代
   - -Xms：堆最小值，-Xmx：堆最大值

2. **方法区（Method Area）**
   - 存储：类信息、常量、静态变量、JIT 编译后的代码
   - JDK7 之前：永久代（PermGen），-XX:PermSize、-XX:MaxPermSize
   - JDK8 之后：元空间（Metaspace），使用本地内存，-XX:MetaspaceSize
   - 运行时常量池（Runtime Constant Pool）是方法区的一部分

【代码示例】
```java
// 查看运行时数据区信息
public class MemoryLayout {
    public static void main(String[] args) {
        // 堆内存信息
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / 1024 / 1024;  // 最大可用内存
        long totalMemory = runtime.totalMemory() / 1024 / 1024;  // 当前分配内存
        long freeMemory = runtime.freeMemory() / 1024 / 1024;  // 空闲内存
        
        System.out.println("Max Memory: " + maxMemory + " MB");
        System.out.println("Total Memory: " + totalMemory + " MB");
        System.out.println("Free Memory: " + freeMemory + " MB");
        
        // 使用 JOL 工具查看对象布局
        // System.out.println(ClassLayout.parseClass(Object.class).toPrintable());
    }
}

// 栈溢出示例
public class StackOverflow {
    private int depth = 0;
    
    public void recursive() {
        depth++;
        recursive();  // StackOverflowError
    }
    
    public static void main(String[] args) {
        new StackOverflow().recursive();
    }
}

// 堆溢出示例
public class HeapOOM {
    public static void main(String[] args) {
        List<byte[]> list = new ArrayList<>();
        while (true) {
            list.add(new byte[1024 * 1024]);  // OutOfMemoryError: Java heap space
        }
    }
}
```

【深入分析】方法区的变迁

| 版本 | 实现 | 位置 | 参数 |
|------|------|------|------|
| JDK7及之前 | 永久代 | JVM堆内存 | -XX:PermSize, -XX:MaxPermSize |
| JDK8 | 元空间 | 本地内存 | -XX:MetaspaceSize, -XX:MaxMetaspaceSize |

元空间优势：
- 不占用 JVM 堆内存，减少 Full GC
- 默认无上限（受限于物理内存），降低 OOM 风险
- 类元数据回收更及时

【常见陷阱】
1. 误认为方法区就是永久代
   答：方法区是 JVM 规范，永久代/元空间是具体实现

2. 忽略直接内存溢出
```java
// OutOfMemoryError: Direct buffer memory
ByteBuffer.allocateDirect(1024 * 1024 * 1024);
```

【延伸追问】
1. 字符串常量池在哪里？
   答：JDK6 在方法区，JDK7 移到堆中，JDK8 在堆中

2. 为什么要移除永久代？
   答：永久代大小难以确定，容易 OOM；元空间使用本地内存，更灵活

3. 栈和堆的区别？
   答：栈存储方法调用和局部变量，堆存储对象；栈自动释放，堆需 GC

【实际应用】
1. 调整堆大小：-Xms4g -Xmx4g（生产建议设置相同，避免动态扩展）
2. 调整元空间：-XX:MaxMetaspaceSize=512m（限制最大值）
3. 栈大小：-Xss256k（减少线程栈内存占用，支持更多线程）""",

    "jvm-2": """【核心概念】垃圾收集（Garbage Collection）是 JVM 自动管理内存的机制，自动回收不再使用的对象占用的内存。GC 算法的选择直接影响应用性能。

【三种基本算法】

**1. 标记-清除（Mark-Sweep）**
- 标记：从 GC Roots 出发，标记所有可达对象
- 清除：回收未标记对象
- 缺点：效率低（两次遍历）、内存碎片

**2. 标记-整理（Mark-Compact）**
- 标记后，将存活对象向一端移动
- 优点：无碎片、分配快
- 缺点：移动对象开销大

**3. 复制算法（Copying）**
- 将内存分成两块，每次只用一块
- GC 时将存活对象复制到另一块
- 优点：无碎片、高效
- 缺点：内存利用率低（50%）

【分代收集】

JVM 根据对象生命周期采用不同策略：

```
┌─────────────────────────────────────┐
│             新生代 (Young)           │
│  ┌────────┬────────┬────────┐      │
│  │  Eden  │ S0     │ S1     │      │
│  │  80%   │ 10%    │ 10%    │      │
│  └────────┴────────┴────────┘      │
│  GC算法：复制算法                   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│             老年代 (Old)             │
│                                     │
│  GC算法：标记-整理/标记-清除        │
└─────────────────────────────────────┘
```

**对象晋升规则：**
1. Eden 区满 → Minor GC，存活对象复制到 Survivor
2. Survivor 区对象年龄 +1
3. 年龄达到阈值（默认15）→ 晋升老年代
4. Survivor 区空间不足 → 直接晋升（空间担保）

【代码示例】
```java
// 查看 GC 日志参数
// -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log

public class GCDemo {
    private static final int _1MB = 1024 * 1024;
    
    public static void main(String[] args) {
        byte[] allocation1, allocation2, allocation3, allocation4;
        allocation1 = new byte[2 * _1MB];
        allocation2 = new byte[2 * _1MB];
        allocation3 = new byte[2 * _1MB];
        allocation4 = new byte[4 * _1MB];  // 触发 Minor GC
    }
}

// 对象逃逸分析
public class EscapeAnalysis {
    // 逃逸：对象被方法外引用
    public static StringBuffer escape() {
        StringBuffer sb = new StringBuffer();
        sb.append("escape");
        return sb;  // sb 逃逸
    }
    
    // 不逃逸：可栈上分配
    public static String noEscape() {
        StringBuffer sb = new StringBuffer();
        sb.append("no escape");
        return sb.toString();  // 新 String 对象
    }
}
```

【深入分析】为什么新生代用复制算法？

新生代特点：
1. 对象朝生夕死，存活率低（通常 < 10%）
2. 存活对象少，复制成本低

优化：Eden:S0:S1 = 8:1:1
- 90% 新生代可用（Eden + 一个 Survivor）
- 只有 10% 空间浪费（另一个 Survivor）

老年代特点：
- 存活率高
- 标记-整理算法更适合

【常见陷阱】
1. 误认为 GC 会立刻回收对象
   答：GC 是异步的，对象不可达后不一定立即回收

2. System.gc() 不一定触发 GC
```java
System.gc();  // 只是建议 JVM 进行 GC
System.runFinalization();  // 执行 finalize 方法
```

【延伸追问】
1. 为什么不用引用计数？
   答：循环引用问题，无法回收相互引用的对象

2. 什么是空间担保？
   答：Minor GC 前，检查老年代是否有足够空间容纳新生代存活对象

3. 什么情况对象直接进老年代？
   答：大对象（-XX:PretenureSizeThreshold）、长期存活、动态年龄判定

【实际应用】
1. 新生代比例：-XX:NewRatio=2（老年代:新生代=2:1）
2. Survivor 比例：-XX:SurvivorRatio=8（Eden:S0:S1=8:1:1）
3. 晋升年龄：-XX:MaxTenuringThreshold=15""",

    "jvm-3": """【核心概念】垃圾收集器是 GC 算法的具体实现。不同收集器适用于不同场景，需要根据应用特点选择合适的组合。

【收集器分类】

| 收集器 | 类型 | 工作模式 | 适用场景 |
|--------|------|----------|----------|
| Serial | 新生代 | 单线程 | 客户端模式 |
| ParNew | 新生代 | 多线程 | 服务端 |
| Parallel Scavenge | 新生代 | 多线程 | 吞吐量优先 |
| Serial Old | 老年代 | 单线程 | 客户端模式 |
| CMS | 老年代 | 并发 | 低延迟 |
| G1 | 全堆 | 并发 | 可预测停顿 |

【CMS 收集器详解】

CMS（Concurrent Mark Sweep）是老年代收集器，以获取最短回收停顿时间为目标。

**四个阶段：**
1. 初始标记（STW）：标记 GC Roots 直接关联的对象
2. 并发标记：从 GC Roots 遍历整个对象图
3. 重新标记（STW）：修正并发标记期间变动的对象
4. 并发清除：清除标记的对象

**缺点：**
- CPU 敏感：默认启动线程数 = (CPU核数+3)/4
- 浮动垃圾：并发清理时新产生的垃圾，本次无法回收
- 空间碎片：标记-清除算法导致

```bash
# CMS 参数
-XX:+UseConcMarkSweepGC
-XX:CMSInitiatingOccupancyFraction=75  # 老年代占用75%时触发
-XX:+UseCMSCompactAtFullCollection     # Full GC时压缩整理
-XX:CMSFullGCsBeforeCompaction=0       # 每次Full GC都整理
```

【G1 收集器详解】

G1（Garbage First）是面向服务端的收集器，JDK9 默认。

**核心设计：**
- 将堆划分为多个大小相等的 Region（1MB~32MB）
- 每个 Region 可以是 Eden、Survivor、Old
- 维护优先列表，每次回收价值最大的 Region
- 可预测停顿时间：-XX:MaxGCPauseMillis

**工作模式：**
1. Young GC：新生代 Region 的 GC
2. Mixed GC：新生代 + 部分老年代 Region
3. Full GC：Stop The World（避免触发）

**关键算法：**
- SATB（Snapshot-At-The-Beginning）：并发标记的快照算法
- TAMS（Top at Mark Start）：标记过程中的分配指针

```bash
# G1 参数
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200   # 目标停顿时间
-XX:G1HeapRegionSize=4m    # Region大小
-XX:InitiatingHeapOccupancyPercent=45  # 触发并发标记阈值
```

【代码示例】
```java
// 监控 GC 情况
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;

public class GCMonitor {
    public static void main(String[] args) {
        for (GarbageCollectorMXBean gcBean : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC Name: " + gcBean.getName());
            System.out.println("Collection Count: " + gcBean.getCollectionCount());
            System.out.println("Collection Time: " + gcBean.getCollectionTime() + " ms");
        }
    }
}

// 大对象分配（直接进老年代）
public class PretenureSizeThreshold {
    private static final int _1MB = 1024 * 1024;
    
    public static void main(String[] args) {
        // -XX:PretenureSizeThreshold=3145728 (3MB)
        byte[] allocation = new byte[4 * _1MB];  // 直接进老年代
    }
}
```

【深入分析】CMS vs G1

| 维度 | CMS | G1 |
|------|-----|-----|
| 算法 | 标记-清除 | 标记-整理 + 复制 |
| 碎片 | 有碎片 | 无碎片 |
| Region | 无 | 有 |
| 可预测停顿 | 否 | 是 |
| 适用版本 | JDK5+ | JDK7+ |
| 默认收集器 | 否(JDK8) | 是(JDK9+) |

【常见陷阱】
1. CMS 并发失败
```
[GC (Allocation Failure) ParNew: ... 
[GC (CMS Concurrent Mode Failure): ...
```
原因：老年代没有足够空间容纳浮动垃圾
解决：降低 -XX:CMSInitiatingOccupancyFraction

2. G1 Full GC
原因：对象分配过快，无法及时回收
解决：增加 -XX:InitiatingHeapOccupancyPercent 降低阈值

【延伸追问】
1. ZGC 有什么特点？
   答：JDK11 引入，停顿时间 < 10ms，支持 TB 级堆

2. 如何选择收集器？
   答：响应时间优先选 CMS/G1；吞吐量优先选 Parallel

3. 什么是 SafePoint？
   答：线程暂停点，GC 需要所有线程到达 SafePoint 后才开始

【实际应用】
生产环境推荐：
- JDK8：Parallel 或 CMS
- JDK11+：G1 或 ZGC
- 大堆（>32GB）：ZGC
- 低延迟：ZGC 或 Shenandoah""",

    "jvm-4": """【核心概念】类加载是 Java 程序运行的基础，包括加载、验证、准备、解析、初始化五个阶段。类加载器采用双亲委派模型，保证类的唯一性和安全性。

【加载过程】

```
加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载
```

**各阶段详解：**

1. **加载（Loading）**
   - 通过类全限定名获取二进制字节流
   - 将字节流转化为方法区运行时数据结构
   - 生成 Class 对象，作为访问入口

2. **验证（Verification）**
   - 文件格式验证：魔数 0xCAFEBABE、版本号
   - 元数据验证：是否有父类、是否实现抽象方法
   - 字节码验证：数据流分析
   - 符号引用验证：类是否存在、方法是否可访问

3. **准备（Preparation）**
   - 为静态变量分配内存并设置零值
   - static final 常量直接赋初值

4. **解析（Resolution）**
   - 将符号引用替换为直接引用
   - 类/接口、字段、方法解析

5. **初始化（Initialization）**
   - 执行 <clinit> 方法
   - 初始化静态变量、执行静态代码块
   - 父类先于子类初始化

【类加载器层次】

```
Bootstrap ClassLoader (启动类加载器)
    └── Extension ClassLoader (扩展类加载器)
            └── Application ClassLoader (应用程序类加载器)
                    └── Custom ClassLoader (自定义类加载器)
```

**双亲委派模型流程：**
1. 类加载器收到加载请求
2. 委派给父加载器处理
3. 父加载器无法完成时，子加载器才尝试加载

**优势：**
- 安全性：核心类库无法被篡改
- 唯一性：避免重复加载
- 层次结构清晰

【代码示例】
```java
// 查看类加载器
public class ClassLoaderDemo {
    public static void main(String[] args) {
        ClassLoader loader = ClassLoaderDemo.class.getClassLoader();
        while (loader != null) {
            System.out.println(loader);
            loader = loader.getParent();
        }
        System.out.println("Bootstrap ClassLoader (null)");
    }
}
// 输出：
// sun.misc.Launcher$AppClassLoader@18b4aac2
// sun.misc.Launcher$ExtClassLoader@1540e19d
// Bootstrap ClassLoader (null)

// 自定义类加载器
public class MyClassLoader extends ClassLoader {
    private String classPath;
    
    public MyClassLoader(String classPath) {
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            byte[] data = loadClassData(name);
            return defineClass(name, data, 0, data.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(name);
        }
    }
    
    private byte[] loadClassData(String name) throws IOException {
        String fileName = classPath + name.replace('.', '/') + ".class";
        return Files.readAllBytes(Paths.get(fileName));
    }
}
```

【打破双亲委派】

**场景一：SPI 机制**
```java
// JDBC Driver 加载
// DriverManager 在 rt.jar，由 Bootstrap 加载
// 但需要加载用户提供的 Driver 实现类
Class.forName("com.mysql.jdbc.Driver");  // 打破双亲委派
```

**场景二：Tomcat 类加载**
```
Bootstrap ClassLoader
    └── System ClassLoader
            └── Common ClassLoader
                    ├── WebApp ClassLoader (每个 WebApp 一个)
                    └── Shared ClassLoader
```
Tomcat 自定义加载器实现 WebApp 隔离。

【常见陷阱】
1. 准备阶段不赋初值
```java
public static int value = 123;
// 准备阶段：value = 0
// 初始化阶段：value = 123

public static final int CONSTANT = 123;
// 准备阶段：CONSTANT = 123 (常量)
```

2. 类初始化死锁
```java
class A {
    static final B b = new B();
}
class B {
    static final A a = new A();
}
// A 初始化需要 B，B 初始化需要 A → 死锁
```

【延伸追问】
1. 类初始化时机？
   答：new、反射、子类初始化、main 方法所在类

2. 接口可以初始化吗？
   答：可以，但不会先初始化父接口

3. 如何判断两个 Class 对象相同？
   答：类加载器相同 + 类全限定名相同

【实际应用】
1. JDBC、JNDI 等 SPI 机制
2. Tomcat、Jetty 等 Web 容器隔离
3. OSGi 动态模块系统
4. 热部署、热加载""",
}

def expand_jvm():
    """扩充 JVM 答案"""
    data_dir = Path(__file__).parent.parent / "data"
    input_file = data_dir / "jvm.json"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    for q in questions:
        if q['id'] in DEEP_ANSWERS:
            q['answer'] = DEEP_ANSWERS[q['id']]
            print(f"扩充: {q['id']} - {q['title']}")
    
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"已完成 {len(questions)} 题的答案扩充")

if __name__ == "__main__":
    expand_jvm()
