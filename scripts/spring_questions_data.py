# -*- coding: utf-8 -*-
"""
Spring/Spring Boot 面试题数据库
目标：625+ 道题目，答案平均 1000+ 字
结构：Level 0: 55 | Level 1: 165 | Level 2: 330 | Level 3: 75
"""

# ========== Level 0 核心主题 (55 道) ==========
LEVEL_0_QUESTIONS = [
    # IOC 容器 (8 道)
    {
        "id": "sp-001",
        "title": "什么是 Spring IOC 容器？它的核心作用是什么？",
        "tags": "IOC容器,核心概念",
        "l1_count": 4,  # Level 1 子题数量
        "l2_per_l1": 2,  # 每个 Level 1 的 Level 2 子题数量
        "has_l3": True   # 是否有 Level 3 子题
    },
    {
        "id": "sp-002",
        "title": "BeanFactory 和 ApplicationContext 有什么区别？",
        "tags": "IOC容器,容器对比",
        "l1_count": 4,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-003",
        "title": "Spring BeanDefinition 的作用和结构是什么？",
        "tags": "IOC容器,BeanDefinition",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-004",
        "title": "Spring 容器的启动流程是怎样的？",
        "tags": "IOC容器,启动流程",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-005",
        "title": "什么是依赖注入（DI）？有哪些注入方式？",
        "tags": "IOC容器,依赖注入",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-006",
        "title": "Spring 中的 Bean 有哪些作用域？",
        "tags": "IOC容器,Bean作用域",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-007",
        "title": "Spring IOC 注解有哪些？常用注解如何使用？",
        "tags": "IOC容器,注解",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-008",
        "title": "@Configuration 注解的作用是什么？",
        "tags": "IOC容器,配置类",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # Bean 生命周期 (7 道)
    {
        "id": "sp-009",
        "title": "Spring Bean 的完整生命周期是怎样的？",
        "tags": "Bean生命周期,核心流程",
        "l1_count": 4,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-010",
        "title": "Spring Bean 实例化的方式有哪些？",
        "tags": "Bean生命周期,实例化",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-011",
        "title": "Spring Bean 属性注入的过程是怎样的？",
        "tags": "Bean生命周期,属性注入",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-012",
        "title": "Spring Bean 初始化阶段会执行哪些操作？",
        "tags": "Bean生命周期,初始化",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-013",
        "title": "Spring Bean 销毁阶段会执行哪些操作？",
        "tags": "Bean生命周期,销毁",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-014",
        "title": "Spring Aware 接口的作用是什么？有哪些常用的 Aware 接口？",
        "tags": "Bean生命周期,Aware接口",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-015",
        "title": "BeanPostProcessor 的作用和执行时机是什么？",
        "tags": "Bean生命周期,BeanPostProcessor",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    
    # 依赖注入 (7 道)
    {
        "id": "sp-016",
        "title": "@Autowired 注解的工作原理是什么？",
        "tags": "依赖注入,@Autowired",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-017",
        "title": "@Resource 和 @Inject 注解有什么区别？",
        "tags": "依赖注入,注解对比",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-018",
        "title": "构造器注入、Setter 注入和字段注入各有什么优缺点？",
        "tags": "依赖注入,注入方式",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-019",
        "title": "Spring 如何处理可选依赖？",
        "tags": "依赖注入,可选依赖",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-020",
        "title": "Spring 如何处理集合类型的注入？",
        "tags": "依赖注入,集合注入",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-021",
        "title": "什么是 Spring 的自动装配？有哪些自动装配模式？",
        "tags": "依赖注入,自动装配",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-022",
        "title": "@Primary 和 @Qualifier 注解的作用是什么？",
        "tags": "依赖注入,限定注解",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # AOP (7 道)
    {
        "id": "sp-023",
        "title": "什么是 Spring AOP？它的核心概念有哪些？",
        "tags": "AOP,核心概念",
        "l1_count": 4,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-024",
        "title": "Spring AOP 的实现原理是什么？",
        "tags": "AOP,实现原理",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-025",
        "title": "JDK 动态代理和 CGLIB 代理有什么区别？",
        "tags": "AOP,代理方式",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-026",
        "title": "Spring AOP 的通知类型有哪些？",
        "tags": "AOP,通知类型",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-027",
        "title": "Spring AOP 的切入点表达式如何编写？",
        "tags": "AOP,切入点表达式",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-028",
        "title": "Spring AOP 多个切面的执行顺序是怎样的？",
        "tags": "AOP,执行顺序",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-029",
        "title": "Spring AOP 和 AspectJ 有什么区别？",
        "tags": "AOP,AOP对比",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # 事务管理 (7 道)
    {
        "id": "sp-030",
        "title": "Spring 事务管理的实现原理是什么？",
        "tags": "事务管理,实现原理",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-031",
        "title": "Spring 事务的传播行为有哪些？各有什么作用？",
        "tags": "事务管理,传播行为",
        "l1_count": 4,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-032",
        "title": "Spring 事务的隔离级别有哪些？",
        "tags": "事务管理,隔离级别",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-033",
        "title": "@Transactional 注解失效的场景有哪些？",
        "tags": "事务管理,失效场景",
        "l1_count": 4,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-034",
        "title": "Spring 如何实现编程式事务管理？",
        "tags": "事务管理,编程式事务",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-035",
        "title": "Spring 事务如何处理异常？",
        "tags": "事务管理,异常处理",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-036",
        "title": "Spring 事务如何实现只读事务和超时设置？",
        "tags": "事务管理,事务属性",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # Spring MVC (6 道)
    {
        "id": "sp-037",
        "title": "Spring MVC 的工作流程是怎样的？",
        "tags": "SpringMVC,工作流程",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-038",
        "title": "DispatcherServlet 的作用是什么？",
        "tags": "SpringMVC,核心组件",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-039",
        "title": "Spring MVC 如何处理请求参数绑定？",
        "tags": "SpringMVC,参数绑定",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-040",
        "title": "Spring MVC 的拦截器如何使用？",
        "tags": "SpringMVC,拦截器",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-041",
        "title": "Spring MVC 如何处理异常？",
        "tags": "SpringMVC,异常处理",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-042",
        "title": "Spring MVC 如何实现 RESTful API？",
        "tags": "SpringMVC,RESTful",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # Spring Boot 自动配置 (6 道)
    {
        "id": "sp-043",
        "title": "Spring Boot 自动配置的原理是什么？",
        "tags": "SpringBoot,自动配置",
        "l1_count": 4,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-044",
        "title": "@SpringBootApplication 注解包含哪些注解？",
        "tags": "SpringBoot,启动注解",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-045",
        "title": "spring.factories 文件的作用是什么？",
        "tags": "SpringBoot,自动配置",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-046",
        "title": "@Conditional 条件注解家族有哪些？",
        "tags": "SpringBoot,条件注解",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-047",
        "title": "如何自定义 Spring Boot Starter？",
        "tags": "SpringBoot,Starter",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-048",
        "title": "Spring Boot 如何排除特定的自动配置？",
        "tags": "SpringBoot,排除配置",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # Spring Boot 配置 (5 道)
    {
        "id": "sp-049",
        "title": "Spring Boot 的配置文件有哪些？加载顺序是什么？",
        "tags": "SpringBoot,配置文件",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-050",
        "title": "Spring Boot 如何实现多环境配置？",
        "tags": "SpringBoot,多环境",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-051",
        "title": "@ConfigurationProperties 注解的作用是什么？",
        "tags": "SpringBoot,配置绑定",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-052",
        "title": "Spring Boot 的配置加载优先级是怎样的？",
        "tags": "SpringBoot,配置优先级",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    {
        "id": "sp-053",
        "title": "Spring Boot 外部化配置有哪些方式？",
        "tags": "SpringBoot,外部化配置",
        "l1_count": 2,
        "l2_per_l1": 2,
        "has_l3": False
    },
    
    # 其他核心主题 (2 道)
    {
        "id": "sp-054",
        "title": "Spring Boot 的启动流程是怎样的？",
        "tags": "SpringBoot,启动流程",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    },
    {
        "id": "sp-055",
        "title": "Spring 中的设计模式有哪些？如何应用的？",
        "tags": "设计模式,核心概念",
        "l1_count": 3,
        "l2_per_l1": 2,
        "has_l3": True
    }
]

# 预计算总题目数量
def calculate_total():
    l0_count = len(LEVEL_0_QUESTIONS)
    l1_count = sum(q["l1_count"] for q in LEVEL_0_QUESTIONS)
    l2_count = sum(q["l1_count"] * q["l2_per_l1"] for q in LEVEL_0_QUESTIONS)
    l3_count = sum(q["l1_count"] * q["l2_per_l1"] for q in LEVEL_0_QUESTIONS if q["has_l3"])
    return {
        "level_0": l0_count,
        "level_1": l1_count,
        "level_2": l2_count,
        "level_3": l3_count,
        "total": l0_count + l1_count + l2_count + l3_count
    }

if __name__ == "__main__":
    stats = calculate_total()
    print(f"Level 0: {stats['level_0']} 题")
    print(f"Level 1: {stats['level_1']} 题")
    print(f"Level 2: {stats['level_2']} 题")
    print(f"Level 3: {stats['level_3']} 题")
    print(f"总计: {stats['total']} 题")
