#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JVM 面试题生成器
目标：从14道题扩写到625+道题，答案从100字扩写到800-2000字
"""

import json
from typing import List, Dict, Any

# JVM 知识体系结构
JVM_TOPICS = {
    "内存模型": {
        "level0": [
            ("JVM 内存模型包含哪些区域？", "内存模型"),
        ],
        "subtopics": {
            "程序计数器": {
                "questions": [
                    "程序计数器的作用是什么？",
                    "程序计数器为什么是线程私有的？",
                    "程序计数器会抛出 OOM 吗？",
                    "程序计数器在方法调用时如何变化？",
                    "程序计数器与 CPU PC 寄存器的关系？",
                ]
            },
            "虚拟机栈": {
                "questions": [
                    "虚拟机栈的结构是什么？",
                    "栈帧包含哪些部分？",
                    "局部变量表的作用？",
                    "操作数栈的作用？",
                    "动态链接的作用？",
                    "返回地址的作用？",
                    "虚拟机栈为什么会抛出 StackOverflowError？",
                    "虚拟机栈为什么会抛出 OOM？",
                    "如何调整虚拟机栈大小？",
                    "栈帧之间如何关联？",
                    "局部变量表的存储结构？",
                    "操作数栈的工作原理？",
                    "动态链接的实现机制？",
                    "方法返回地址的存储？",
                    "栈帧的内存分配策略？",
                    "虚拟机栈与本地方法栈的区别？",
                    "栈深度如何影响递归？",
                    "栈溢出的排查方法？",
                    "栈上分配的条件？",
                    "逃逸分析对栈的影响？",
                ]
            },
            "本地方法栈": {
                "questions": [
                    "本地方法栈的作用？",
                    "本地方法栈与虚拟机栈的区别？",
                    "JNI 调用的内存管理？",
                    "本地方法栈溢出场景？",
                ]
            },
            "堆内存": {
                "questions": [
                    "堆内存的作用？",
                    "堆内存的结构？",
                    "新生代与老年代的比例？",
                    "Eden 区的作用？",
                    "Survivor 区的作用？",
                    "为什么有两个 Survivor 区？",
                    "对象分配在堆中的策略？",
                    "大对象直接进入老年代？",
                    "长期存活对象进入老年代？",
                    "堆内存的分配策略？",
                    "堆内存的回收策略？",
                    "堆外内存的使用？",
                    "堆内存碎片问题？",
                    "堆大小的配置参数？",
                    "堆内存的动态扩展？",
                    "对象在堆中的布局？",
                    "TLAB 的作用？",
                    "堆内存的线程安全问题？",
                    "堆内存的监控方法？",
                    "堆内存调优案例？",
                ]
            },
            "方法区": {
                "questions": [
                    "方法区存储什么内容？",
                    "方法区与永久代的区别？",
                    "方法区与元空间的区别？",
                    "运行时常量池的作用？",
                    "方法区的内存回收？",
                    "方法区溢出的场景？",
                    "元空间的内存分配？",
                    "元空间的配置参数？",
                    "方法区的线程安全问题？",
                    "方法区与类加载的关系？",
                ]
            },
            "运行时常量池": {
                "questions": [
                    "运行时常量池的作用？",
                    "字符串常量池的位置变化？",
                    "类常量池与方法区常量池？",
                    "常量池的内存管理？",
                    "intern() 方法的原理？",
                ]
            },
        }
    },
    "垃圾回收": {
        "level0": [
            ("JVM 垃圾收集算法有哪些？", "GC"),
            ("常见的垃圾收集器？", "GC"),
        ],
        "subtopics": {
            "垃圾识别": {
                "questions": [
                    "引用计数法的原理？",
                    "引用计数法的缺点？",
                    "可达性分析的原理？",
                    "GC Roots 包含哪些？",
                    "如何确定对象不可达？",
                    "不可达对象一定会被回收吗？",
                    "对象的 finalize() 方法？",
                    "对象的自我拯救？",
                    "方法区的垃圾回收？",
                    "判断类无用的条件？",
                ]
            },
            "垃圾回收算法": {
                "questions": [
                    "标记-清除算法的原理？",
                    "标记-清除算法的缺点？",
                    "复制算法的原理？",
                    "复制算法的适用场景？",
                    "标记-整理算法的原理？",
                    "标记-整理算法的优点？",
                    "分代收集算法的原理？",
                    "为什么新生代用复制算法？",
                    "为什么老年代用标记-整理？",
                    "三种算法的对比？",
                ]
            },
            "垃圾收集器": {
                "questions": [
                    "Serial 收集器的特点？",
                    "ParNew 收集器的特点？",
                    "Parallel Scavenge 收集器的特点？",
                    "CMS 收集器的特点？",
                    "CMS 的四个阶段？",
                    "CMS 的缺点？",
                    "G1 收集器的特点？",
                    "G1 的 Region 设计？",
                    "G1 的停顿预测模型？",
                    "ZGC 收集器的特点？",
                    "ZGC 的染色指针？",
                    "Shenandoah 收集器的特点？",
                    "各收集器的对比？",
                    "如何选择垃圾收集器？",
                    "GC 性能指标？",
                    "STW 的含义？",
                    "如何减少 STW 时间？",
                    "GC 日志的分析？",
                    "GC 参数调优？",
                    "GC 性能监控？",
                ]
            },
        }
    },
    "类加载": {
        "level0": [
            ("类加载的过程和类加载器？", "类加载"),
        ],
        "subtopics": {
            "类加载过程": {
                "questions": [
                    "类加载的五个阶段？",
                    "加载阶段做了什么？",
                    "验证阶段做了什么？",
                    "准备阶段做了什么？",
                    "解析阶段做了什么？",
                    "初始化阶段做了什么？",
                    "类初始化的时机？",
                    "类加载的触发条件？",
                    "被动引用的例子？",
                    "接口的初始化？",
                ]
            },
            "类加载器": {
                "questions": [
                    "启动类加载器的作用？",
                    "扩展类加载器的作用？",
                    "应用类加载器的作用？",
                    "自定义类加载器的实现？",
                    "双亲委派模型的原理？",
                    "双亲委派模型的好处？",
                    "如何打破双亲委派？",
                    "SPI 机制的实现？",
                    "Tomcat 的类加载机制？",
                    "OSGi 的类加载机制？",
                ]
            },
        }
    },
    "JIT编译": {
        "level0": [
            ("JIT 编译器的作用？", "JIT"),
        ],
        "subtopics": {
            "即时编译": {
                "questions": [
                    "JIT 编译的原理？",
                    "热点代码的判定？",
                    "C1 编译器的特点？",
                    "C2 编译器的特点？",
                    "分层编译策略？",
                    "编译优化的技术？",
                    "方法内联的原理？",
                    "逃逸分析的原理？",
                    "标量替换的原理？",
                    "锁消除的原理？",
                ]
            },
        }
    },
    "内存管理": {
        "level0": [
            ("JVM 如何判断对象可以被回收？", "GC"),
            ("Java 的四种引用类型？", "引用"),
            ("对象在 JVM 中的存储结构？", "对象布局"),
        ],
        "subtopics": {
            "引用类型": {
                "questions": [
                    "强引用的特点？",
                    "软引用的使用场景？",
                    "弱引用的使用场景？",
                    "虚引用的作用？",
                    "ReferenceQueue 的使用？",
                ]
            },
            "对象布局": {
                "questions": [
                    "对象头的结构？",
                    "Mark Word 的内容？",
                    "类型指针的作用？",
                    "实例数据的存储？",
                    "对齐填充的原因？",
                    "对象的内存计算？",
                ]
            },
        }
    },
    "调优与排查": {
        "level0": [
            ("JVM 调优常用参数？", "调优"),
            ("如何排查 OOM 问题？", "OOM"),
        ],
        "subtopics": {
            "JVM参数": {
                "questions": [
                    "-Xms 和 -Xmx 的作用？",
                    "-Xmn 的作用？",
                    "-XX:MetaspaceSize 的作用？",
                    "-XX:+UseG1GC 的作用？",
                    "-XX:MaxGCPauseMillis 的作用？",
                    "-XX:+PrintGCDetails 的作用？",
                    "-XX:+HeapDumpOnOutOfMemoryError？",
                    "常用调优参数组合？",
                ]
            },
            "工具使用": {
                "questions": [
                    "jmap 的使用？",
                    "jstack 的使用？",
                    "jstat 的使用？",
                    "jcmd 的使用？",
                    "jinfo 的使用？",
                    "VisualVM 的使用？",
                    "MAT 的使用？",
                    "Arthas 的使用？",
                ]
            },
            "OOM排查": {
                "questions": [
                    "OOM 的类型？",
                    "堆内存 OOM 的原因？",
                    "栈内存 OOM 的原因？",
                    "元空间 OOM 的原因？",
                    "直接内存 OOM 的原因？",
                    "OOM 的排查步骤？",
                    "Dump 文件分析？",
                    "内存泄漏的排查？",
                ]
            },
        }
    },
}

def generate_question_id(level: int, parent_id: str = None, index: int = 1) -> str:
    """生成题目 ID"""
    if level == 0:
        return f"jvm-{index:03d}"
    elif parent_id:
        return f"{parent_id}-{index}"
    else:
        return f"jvm-{index:03d}"

def build_answer_structure(title: str) -> str:
    """构建答案结构（800-2000字）"""
    return f"""【核心概念】
（此处需要扩写 200-400 字，介绍该问题的核心概念和定义）

【底层原理】
（此处需要扩写 200-400 字，深入讲解实现原理和机制）

【代码示例/命令】
（此处需要扩写 100-300 字，提供具体的代码示例或命令）

【常见考点】
（此处需要扩写 100-200 字，列举常见的面试考点）

【对比/延伸】
（此处需要扩写 100-200 字，对比相关知识点或延伸学习）"""

def generate_level1_questions(level0_data: Dict, global_index: int) -> List[Dict]:
    """生成 Level 1 题目"""
    questions = []
    
    # 从知识体系中提取 Level 1 题目
    for topic_name, topic_data in JVM_TOPICS.items():
        if "subtopics" in topic_data:
            for subtopic_name, subtopic_data in topic_data["subtopics"].items():
                if "questions" in subtopic_data:
                    for i, question in enumerate(subtopic_data["questions"][:5], 1):  # 每个子主题取前5个
                        questions.append({
                            "id": f"jvm-{global_index:03d}-{i}",
                            "category": "jvm",
                            "level": 1,
                            "parent_id": level0_data.get("id", f"jvm-{global_index:03d}"),
                            "title": question,
                            "answer": build_answer_structure(question),
                            "tags": topic_name,
                            "sort_order": i
                        })
                        if len(questions) >= 330:  # Level 1 目标
                            return questions
    
    return questions

def main():
    """主函数"""
    # 读取现有数据
    with open('/home/mengjie/projects/java-interview/data/jvm.json', 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    
    print(f"现有题目数: {len(existing_data)}")
    
    # 这里只是示例，实际需要生成完整的题目库
    # 由于题目数量庞大，建议分批生成
    
    print("请使用完整版本的生成器...")

if __name__ == "__main__":
    main()
