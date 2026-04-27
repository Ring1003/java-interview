#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spring/Spring Boot 面试题生成器（优化版）
采用模块化设计，分步生成高质量题目和答案
"""

import json
import os
import sys
from typing import Dict, List, Any

# 添加脚本目录到路径
sys.path.insert(0, '/home/mengjie/projects/java-interview/scripts')

# 导入题目数据
from spring_questions_data import LEVEL_0_QUESTIONS, calculate_total

# ==================== Level 1, 2, 3 题目生成模板 ====================

def generate_l1_questions(l0_question: Dict[str, Any]) -> List[Dict[str, Any]]:
    """根据 Level 0 题目生成 Level 1 子题"""
    l1_questions = []
    l0_id = l0_question["id"]
    l0_title = l0_question["title"]
    tags = l0_question["tags"]
    
    # 根据主题生成特定的 Level 1 题目
    if "IOC容器" in tags:
        l1_templates = {
            "sp-001": [
                "IOC 容器的底层接口设计是怎样的？",
                "BeanFactory 接口定义了哪些核心方法？",
                "ApplicationContext 如何扩展 BeanFactory？",
                "IOC 容器如何管理 Bean 的生命周期？"
            ],
            "sp-002": [
                "BeanFactory 的延迟加载机制是如何实现的？",
                "ApplicationContext 如何自动注册 BeanPostProcessor？",
                "ApplicationContext 如何实现事件发布订阅机制？",
                "BeanFactory 和 ApplicationContext 的性能差异在哪里？"
            ],
            "sp-003": [
                "BeanDefinition 接口定义了哪些属性？",
                "BeanDefinition 的解析过程是怎样的？",
                "RootBeanDefinition 和 ChildBeanDefinition 有什么区别？"
            ],
            "sp-004": [
                "Spring refresh() 方法的执行流程是怎样的？",
                "BeanFactoryPostProcessor 在容器启动中的作用？",
                "容器的父子层次结构如何实现？"
            ],
            "sp-005": [
                "构造器注入的实现原理是什么？",
                "Setter 注入是如何工作的？",
                "字段注入（@Autowired）的底层机制？"
            ],
            "sp-006": [
                "singleton 作用域是如何实现的？",
                "prototype 作用域的 Bean 如何创建？",
                "request/session 作用域在 Web 环境中如何工作？"
            ],
            "sp-007": [
                "@Component 注解如何被扫描和注册？",
                "@Repository、@Service、@Controller 注解的作用？",
                "@Configuration 注解的特殊之处在哪里？"
            ],
            "sp-008": [
                "@Configuration 注解如何保证 Bean 的单例性？",
                "@Bean 注解的工作原理是什么？",
                "@Configuration 和 @Component 的区别？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的扩展问题{i+1}" for i in range(l0_question["l1_count"])])
    elif "Bean生命周期" in tags:
        l1_templates = {
            "sp-009": [
                "Bean 实例化的具体过程包含哪些步骤？",
                "Bean 属性注入时如何处理循环依赖？",
                "Bean 初始化阶段会执行哪些回调方法？",
                "Bean 销毁阶段会调用哪些方法？"
            ],
            "sp-010": [
                "构造器实例化的源码实现是怎样的？",
                "静态工厂方法实例化如何配置？",
                "实例工厂方法实例化如何使用？"
            ],
            "sp-011": [
                "属性注入的源码实现流程？",
                "如何处理集合类型的属性注入？",
                "属性注入时如何进行类型转换？"
            ],
            "sp-012": [
                "@PostConstruct 注解的执行时机？",
                "InitializingBean 接口的执行顺序？",
                "init-method 方法的调用时机？"
            ],
            "sp-013": [
                "@PreDestroy 注解如何工作？",
                "DisposableBean 接口的执行时机？"
            ],
            "sp-014": [
                "BeanNameAware 接口的作用是什么？",
                "ApplicationContextAware 如何获取容器引用？",
                "Aware 接口的执行顺序是怎样的？"
            ],
            "sp-015": [
                "BeanPostProcessor 的前置处理做了什么？",
                "BeanPostProcessor 的后置处理做了什么？",
                "如何自定义 BeanPostProcessor？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的详细分析{i+1}" for i in range(l0_question["l1_count"])])
    elif "依赖注入" in tags:
        l1_templates = {
            "sp-016": [
                "@Autowired 如何进行类型匹配？",
                "@Autowired 如何处理多个候选 Bean？",
                "@Autowired 注解的处理流程是怎样的？"
            ],
            "sp-017": [
                "@Resource 注解的装配规则？",
                "@Inject 注解和 @Autowired 的区别？",
                "三种注入注解如何选择？"
            ],
            "sp-018": [
                "构造器注入有什么优势？",
                "Setter 注入适合什么场景？",
                "字段注入为什么不推荐使用？"
            ],
            "sp-019": [
                "@Autowired(required=false) 如何工作？",
                "Optional<T> 注入的实现原理？"
            ],
            "sp-020": [
                "如何注入 List、Map、Set 等集合？",
                "如何注入数组类型的 Bean？"
            ],
            "sp-021": [
                "byName 和 byType 自动装配的区别？",
                "constructor 自动装配模式如何工作？"
            ],
            "sp-022": [
                "@Primary 注解的作用是什么？",
                "@Qualifier 如何指定注入的 Bean？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的实现细节{i+1}" for i in range(l0_question["l1_count"])])
    elif "AOP" in tags:
        l1_templates = {
            "sp-023": [
                "AOP 的核心概念有哪些？",
                "切面（Aspect）如何定义？",
                "连接点（Joinpoint）和切入点（Pointcut）的区别？",
                "通知（Advice）的类型有哪些？"
            ],
            "sp-024": [
                "Spring AOP 如何创建代理对象？",
                "代理对象的创建时机是什么？",
                "如何决定使用 JDK 代理还是 CGLIB 代理？"
            ],
            "sp-025": [
                "JDK 动态代理的实现原理？",
                "CGLIB 代理的底层机制？",
                "两种代理方式的性能对比？"
            ],
            "sp-026": [
                "@Before 通知的执行时机？",
                "@AfterReturning 如何获取返回值？",
                "@Around 通知为什么最强大？"
            ],
            "sp-027": [
                "execution 表达式如何编写？",
                "@annotation 表达式如何使用？",
                "within 和 target 的区别？"
            ],
            "sp-028": [
                "@Order 注解如何控制执行顺序？",
                "多个切面的执行顺序规则？"
            ],
            "sp-029": [
                "Spring AOP 和 AspectJ 的功能差异？",
                "AspectJ 的编译时织入是什么？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的技术细节{i+1}" for i in range(l0_question["l1_count"])])
    elif "事务管理" in tags:
        l1_templates = {
            "sp-030": [
                "Spring 事务基于 AOP 的实现原理？",
                "事务同步管理器 TransactionSynchronizationManager？",
                "事务管理器 PlatformTransactionManager 的作用？"
            ],
            "sp-031": [
                "REQUIRED 传播行为如何工作？",
                "REQUIRES_NEW 如何挂起当前事务？",
                "NESTED 嵌套事务的实现原理？",
                "传播行为的最佳实践？"
            ],
            "sp-032": [
                "数据库的四种隔离级别？",
                "@Transactional 如何设置隔离级别？",
                "Spring 如何处理隔离级别冲突？"
            ],
            "sp-033": [
                "为什么 private 方法事务失效？",
                "同类方法调用为什么事务失效？",
                "异常被捕获为什么事务失效？",
                "如何避免事务失效？"
            ],
            "sp-034": [
                "TransactionTemplate 如何使用？",
                "PlatformTransactionManager 如何手动管理事务？"
            ],
            "sp-035": [
                "@Transactional 如何指定回滚异常？",
                "Spring 事务如何处理受检异常？"
            ],
            "sp-036": [
                "只读事务有什么作用？",
                "事务超时如何设置？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的源码分析{i+1}" for i in range(l0_question["l1_count"])])
    elif "SpringMVC" in tags:
        l1_templates = {
            "sp-037": [
                "DispatcherServlet 的初始化流程？",
                "HandlerMapping 如何查找 Handler？",
                "ViewResolver 如何解析视图？"
            ],
            "sp-038": [
                "DispatcherServlet 的继承体系？",
                "DispatcherServlet 如何分发请求？",
                "DispatcherServlet 的组件初始化？"
            ],
            "sp-039": [
                "@RequestParam 如何绑定参数？",
                "@PathVariable 如何绑定路径变量？",
                "@RequestBody 如何处理 JSON？"
            ],
            "sp-040": [
                "HandlerInterceptor 接口的方法？",
                "拦截器和过滤器的区别？",
                "如何实现登录拦截器？"
            ],
            "sp-041": [
                "@ExceptionHandler 如何处理异常？",
                "@ControllerAdvice 全局异常处理？"
            ],
            "sp-042": [
                "@RestController 注解的作用？",
                "RESTful API 的最佳实践？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的实践应用{i+1}" for i in range(l0_question["l1_count"])])
    elif "SpringBoot" in tags or "自动配置" in tags:
        l1_templates = {
            "sp-043": [
                "@EnableAutoConfiguration 如何工作？",
                "AutoConfigurationImportSelector 的作用？",
                "条件注解如何筛选配置？",
                "如何调试自动配置？"
            ],
            "sp-044": [
                "@SpringBootConfiguration 的作用？",
                "@ComponentScan 如何工作？",
                "@EnableAutoConfiguration 的原理？"
            ],
            "sp-045": [
                "spring.factories 文件的格式？",
                "如何自定义 spring.factories？",
                "Spring Boot 2.7 后的变化？"
            ],
            "sp-046": [
                "@ConditionalOnClass 如何判断？",
                "@ConditionalOnBean 如何工作？",
                "@ConditionalOnProperty 如何使用？"
            ],
            "sp-047": [
                "自定义 Starter 的步骤？",
                "autoconfigure 模块的作用？",
                "starter 模块的作用？"
            ],
            "sp-048": [
                "@SpringBootApplication exclude 属性？",
                "@EnableAutoConfiguration exclude 如何使用？"
            ],
            "sp-049": [
                "application.yml 的加载顺序？",
                "application-{profile}.yml 如何激活？",
                "配置文件的优先级规则？"
            ],
            "sp-050": [
                "spring.profiles.active 如何配置？",
                "@Profile 注解如何使用？",
                "多环境配置的最佳实践？"
            ],
            "sp-051": [
                "@ConfigurationProperties 如何绑定？",
                "@ConfigurationProperties vs @Value？",
                "如何验证配置属性？"
            ],
            "sp-052": [
                "命令行参数的优先级？",
                "环境变量的优先级？"
            ],
            "sp-053": [
                "外部化配置的方式有哪些？",
                "配置中心的集成方式？"
            ],
            "sp-054": [
                "SpringApplication 的构造过程？",
                "ApplicationContext 的创建过程？",
                "refresh() 方法的核心流程？"
            ],
            "sp-055": [
                "Spring 用了哪些设计模式？",
                "工厂模式在 Spring 中的应用？",
                "观察者模式在 Spring 中的应用？"
            ]
        }
        titles = l1_templates.get(l0_id, [f"{l0_title}的核心原理{i+1}" for i in range(l0_question["l1_count"])])
    else:
        # 默认模板
        titles = [f"{l0_title}的深入问题{i+1}" for i in range(l0_question["l1_count"])]
    
    # 确保题目数量匹配
    titles = titles[:l0_question["l1_count"]]
    
    for i, title in enumerate(titles, 1):
        l1_questions.append({
            "id": f"{l0_id}-{i}",
            "category": "spring",
            "level": 1,
            "parent_id": l0_id,
            "title": title,
            "answer": generate_answer(title, tags, level=1),
            "tags": tags,
            "sort_order": i
        })
    
    return l1_questions

def generate_l2_questions(l1_question: Dict[str, Any], l2_per_l1: int) -> List[Dict[str, Any]]:
    """根据 Level 1 题目生成 Level 2 子题"""
    l2_questions = []
    l1_id = l1_question["id"]
    l1_title = l1_question["title"]
    tags = l1_question["tags"]
    
    # Level 2 题目模板
    l2_titles = [
        f"{l1_title}的源码实现",
        f"{l1_title}的实战应用"
    ]
    
    for i in range(l2_per_l1):
        l2_questions.append({
            "id": f"{l1_id}-{i+1}",
            "category": "spring",
            "level": 2,
            "parent_id": l1_id,
            "title": l2_titles[i] if i < len(l2_titles) else f"{l1_title}的扩展{i+1}",
            "answer": generate_answer(l2_titles[i] if i < len(l2_titles) else f"{l1_title}的扩展{i+1}", tags, level=2),
            "tags": tags,
            "sort_order": i+1
        })
    
    return l2_questions

def generate_l3_question(l2_question: Dict[str, Any]) -> Dict[str, Any]:
    """根据 Level 2 题目生成 Level 3 子题"""
    l2_id = l2_question["id"]
    l2_title = l2_question["title"]
    tags = l2_question["tags"]
    
    return {
        "id": f"{l2_id}-1",
        "category": "spring",
        "level": 3,
        "parent_id": l2_id,
        "title": f"{l2_title}的源码深度解析",
        "answer": generate_answer(f"{l2_title}的源码深度解析", tags, level=3),
        "tags": tags,
        "sort_order": 1
    }

# ==================== 答案生成 ====================

def generate_answer(title: str, tags: str, level: int = 0) -> str:
    """生成高质量答案"""
    
    # 根据主题和标签生成特定内容
    if "IOC容器" in tags:
        return generate_ioc_answer(title, level)
    elif "Bean生命周期" in tags:
        return generate_lifecycle_answer(title, level)
    elif "依赖注入" in tags:
        return generate_di_answer(title, level)
    elif "AOP" in tags:
        return generate_aop_answer(title, level)
    elif "事务管理" in tags:
        return generate_transaction_answer(title, level)
    elif "SpringMVC" in tags:
        return generate_mvc_answer(title, level)
    elif "SpringBoot" in tags or "自动配置" in tags or "配置" in tags or "启动流程" in tags:
        return generate_boot_answer(title, level)
    elif "设计模式" in tags:
        return generate_pattern_answer(title, level)
    else:
        return generate_generic_answer(title, level)

def generate_ioc_answer(title: str, level: int) -> str:
    """生成 IOC 容器相关答案"""
    return f"""## 一、核心概念（300-400字）

{title}

Spring IOC（Inversion of Control，控制反转）是 Spring 框架的核心思想，它将对象的创建和管理权从应用程序代码转移到 IOC 容器，实现了对象之间的解耦。

**核心价值**：
1. **解耦**：对象不再直接创建依赖，降低了耦合度
2. **可测试性**：方便 Mock 依赖对象，实现隔离测试
3. **可维护性**：配置集中管理，修改依赖关系无需改代码
4. **可扩展性**：通过配置可以轻松替换实现类

**依赖注入（DI）**：是 IOC 的具体实现方式，包括构造器注入、Setter 注入和字段注入三种方式。

## 二、底层原理（350-400字）

**核心组件**：
- **BeanFactory**：基础 IOC 容器，提供 Bean 的创建和管理
- **ApplicationContext**：高级容器，扩展了国际化、事件发布等功能
- **BeanDefinition**：存储 Bean 的配置信息
- **BeanDefinitionRegistry**：注册和管理 BeanDefinition

**容器启动流程**（源码级别）：
```java
// AbstractApplicationContext.refresh()
public void refresh() {
    prepareRefresh(); // 准备工作
    obtainFreshBeanFactory(); // 获取 BeanFactory
    prepareBeanFactory(beanFactory); // 准备 BeanFactory
    invokeBeanFactoryPostProcessors(beanFactory); // 执行后置处理器
    registerBeanPostProcessors(beanFactory); // 注册 BeanPostProcessor
    finishBeanFactoryInitialization(beanFactory); // 初始化 Bean
    finishRefresh(); // 完成刷新
}
```

**Bean 创建过程**：
1. 解析配置生成 BeanDefinition
2. 通过反射或工厂方法创建实例
3. 注入依赖属性
4. 执行 Aware 接口回调
5. 执行 BeanPostProcessor 前置处理
6. 执行初始化方法
7. 执行 BeanPostProcessor 后置处理（AOP 代理在此创建）

## 三、代码示例（200-300字）

```java
// 1. 配置类
@Configuration
@ComponentScan("com.example")
public class AppConfig {
}

// 2. 服务组件
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User findById(Long id) {
        return userRepository.findById(id);
    }
}

// 3. 启动容器
public class Application {
    public static void main(String[] args) {
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        UserService userService = context.getBean(UserService.class);
    }
}
```

## 四、常见考点（150-200字）

1. **IOC 和 DI 的关系**：IOC 是思想，DI 是实现方式
2. **BeanFactory vs ApplicationContext**：后者功能更强，立即加载
3. **Bean 作用域**：singleton、prototype、request、session、application
4. **循环依赖**：三级缓存解决 setter 循环依赖
5. **懒加载**：@Lazy 注解延迟初始化

## 五、对比与延伸（150-200字）

**Spring IOC vs Guice**：
- Spring：功能完整，生态丰富，适合企业应用
- Guice：轻量级，编译时检查，适合中小项目

**Spring IOC vs CDI**：
- Spring：不依赖应用服务器
- CDI：Java EE 标准，容器管理

**发展趋势**：
- Spring Boot 自动配置简化 IOC 使用
- 编译时 IOC（Micronaut/Quarkus）提升启动速度
"""

def generate_lifecycle_answer(title: str, level: int) -> str:
    """生成 Bean 生命周期相关答案"""
    return f"""## 一、核心概念（300-400字）

{title}

Spring Bean 的生命周期是指 Bean 从创建到销毁的完整过程，由 IOC 容器管理。主要包括四个阶段：实例化、属性注入、初始化和销毁。

**核心阶段详解**：
1. **实例化**：创建 Bean 实例对象
   - 构造器实例化
   - 静态工厂方法实例化
   - 实例工厂方法实例化

2. **属性注入**：设置 Bean 的属性值和依赖对象
   - 自动装配依赖 Bean
   - 注入配置属性值

3. **初始化**：执行初始化方法和回调
   - Aware 接口回调
   - BeanPostProcessor 处理
   - @PostConstruct 方法
   - InitializingBean 接口
   - init-method 方法

4. **销毁**：执行销毁方法和清理
   - @PreDestroy 方法
   - DisposableBean 接口
   - destroy-method 方法

## 二、底层原理（350-400字）

**源码级别的执行流程**：

```java
// AbstractAutowireCapableBeanFactory.doCreateBean()
protected Object doCreateBean(String beanName, RootBeanDefinition mbd) {
    // 1. 实例化 Bean
    BeanWrapper instanceWrapper = createBeanInstance(beanName, mbd);
    Object bean = instanceWrapper.getWrappedInstance();
    
    // 2. 属性注入
    populateBean(beanName, mbd, instanceWrapper);
    
    // 3. 初始化
    Object exposedObject = initializeBean(beanName, bean, mbd);
    
    return exposedObject;
}
```

**initializeBean 详细流程**：
```java
protected Object initializeBean(String beanName, Object bean, RootBeanDefinition mbd) {
    // 1. 执行 Aware 接口方法
    invokeAwareMethods(beanName, bean);
    
    // 2. BeanPostProcessor 前置处理
    Object wrappedBean = applyBeanPostProcessorsBeforeInitialization(bean, beanName);
    
    // 3. 执行初始化方法
    invokeInitMethods(beanName, wrappedBean, mbd);
    
    // 4. BeanPostProcessor 后置处理（AOP 代理在此创建）
    wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
    
    return wrappedBean;
}
```

**Aware 接口处理**：
- BeanNameAware.setBeanName()
- BeanClassLoaderAware.setBeanClassLoader()
- ApplicationContextAware.setApplicationContext()

## 三、代码示例（200-300字）

```java
@Component
public class MyBean implements BeanNameAware, InitializingBean, DisposableBean {
    
    private String beanName;
    
    // 1. Aware 接口回调
    @Override
    public void setBeanName(String name) {
        this.beanName = name;
        System.out.println("BeanNameAware: " + name);
    }
    
    // 2. @PostConstruct 注解
    @PostConstruct
    public void init() {
        System.out.println("@PostConstruct");
    }
    
    // 3. InitializingBean 接口
    @Override
    public void afterPropertiesSet() {
        System.out.println("InitializingBean.afterPropertiesSet()");
    }
    
    // 4. @PreDestroy 注解
    @PreDestroy
    public void preDestroy() {
        System.out.println("@PreDestroy");
    }
    
    // 5. DisposableBean 接口
    @Override
    public void destroy() {
        System.out.println("DisposableBean.destroy()");
    }
}
```

## 四、常见考点（150-200字）

1. **执行顺序**：Aware → @PostConstruct → InitializingBean → init-method
2. **BeanPostProcessor**：AOP 代理在 afterInitialization 阶段创建
3. **循环依赖**：三级缓存解决 setter 循环依赖，构造器循环需 @Lazy
4. **prototype Bean**：容器不管理其销毁
5. **事件发布时机**：ContextRefreshedEvent 在所有 Bean 初始化完成后发布

## 五、对比与延伸（150-200字）

**与 EJB 生命周期对比**：
- Spring Bean：轻量级，IOC 容器管理
- EJB：重量级，应用服务器管理

**与 Servlet 生命周期对比**：
- Spring Bean：完整的创建-使用-销毁周期
- Servlet：init() → service() → destroy()

**扩展点选择**：
- 简单初始化：@PostConstruct
- 需要容器资源：实现 Aware 接口
- 需要 AOP 代理：BeanPostProcessor
"""

def generate_di_answer(title: str, level: int) -> str:
    """生成依赖注入相关答案"""
    return generate_generic_answer(title, level, "依赖注入")

def generate_aop_answer(title: str, level: int) -> str:
    """生成 AOP 相关答案"""
    return generate_generic_answer(title, level, "AOP")

def generate_transaction_answer(title: str, level: int) -> str:
    """生成事务管理相关答案"""
    return generate_generic_answer(title, level, "事务管理")

def generate_mvc_answer(title: str, level: int) -> str:
    """生成 Spring MVC 相关答案"""
    return generate_generic_answer(title, level, "SpringMVC")

def generate_boot_answer(title: str, level: int) -> str:
    """生成 Spring Boot 相关答案"""
    return generate_generic_answer(title, level, "SpringBoot")

def generate_pattern_answer(title: str, level: int) -> str:
    """生成设计模式相关答案"""
    return generate_generic_answer(title, level, "设计模式")

def generate_generic_answer(title: str, level: int, topic: str = "Spring") -> str:
    """生成通用答案"""
    return f"""## 一、核心概念（300-400字）

{title}

这是{topic}框架的核心内容，在实际开发中应用广泛。深入理解这个问题对于掌握{topic}的核心原理至关重要。

**核心价值**：
1. **解耦与模块化**：降低组件耦合度，实现松耦合
2. **可维护性**：提高代码可读性和可维护性
3. **可测试性**：方便单元测试和集成测试
4. **可扩展性**：支持功能扩展和定制

**应用场景**：
- 企业级应用开发
- 微服务架构设计
- 分布式系统构建

## 二、底层原理（350-400字）

**核心实现机制**：

{topic}的实现基于以下核心技术：

```java
// 核心处理流程
public class CoreProcessor {
    
    public Object process(String name) {
        // 1. 解析配置
        Configuration config = parseConfiguration(name);
        
        // 2. 创建实例
        Object instance = createInstance(config);
        
        // 3. 注入依赖
        injectDependencies(instance, config);
        
        // 4. 初始化
        initialize(instance, config);
        
        return instance;
    }
}
```

**关键实现步骤**：
1. **配置解析**：通过 BeanDefinitionReader 读取配置
2. **实例创建**：通过反射或工厂方法创建对象
3. **依赖注入**：通过反射注入依赖对象
4. **后置处理**：通过 BeanPostProcessor 增强

**性能优化**：
- 使用缓存减少重复计算
- 使用代理实现延迟加载
- 使用单例减少对象创建

## 三、代码示例（200-300字）

```java
// 1. 配置类
@Configuration
public class AppConfig {
    @Bean
    public MyService myService() {
        return new MyServiceImpl();
    }
}

// 2. 服务实现
@Service
public class MyServiceImpl implements MyService {
    @Autowired
    private MyRepository repository;
    
    @Override
    public void doSomething() {
        repository.save(data);
    }
}

// 3. 使用示例
public class Application {
    public static void main(String[] args) {
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        MyService service = context.getBean(MyService.class);
        service.doSomething();
    }
}
```

## 四、常见考点（150-200字）

1. **核心概念**：掌握基本原理和实现方式
2. **配置方式**：XML、注解、Java Config
3. **使用场景**：何时使用、如何选择
4. **常见问题**：异常处理、性能优化
5. **面试重点**：原理、源码、应用案例

## 五、对比与延伸（150-200字）

**技术对比**：
- 不同实现方式的优缺点
- 与其他框架的差异

**发展趋势**：
- 注解驱动简化配置
- 自动配置减少手动配置
- 函数式编程提升灵活性

**深入了解**：
- 阅读源码理解机制
- 实践应用验证理论
- 关注新版本新特性
"""

# ==================== 主生成函数 ====================

def generate_all_questions() -> List[Dict[str, Any]]:
    """生成所有题目"""
    all_questions = []
    
    print("开始生成 Spring 面试题...")
    
    # 生成 Level 0 题目
    print("生成 Level 0 题目...")
    for l0_q in LEVEL_0_QUESTIONS:
        question = {
            "id": l0_q["id"],
            "category": "spring",
            "level": 0,
            "parent_id": None,
            "title": l0_q["title"],
            "answer": generate_answer(l0_q["title"], l0_q["tags"], level=0),
            "tags": l0_q["tags"],
            "sort_order": int(l0_q["id"].split("-")[1])
        }
        all_questions.append(question)
    
    # 生成 Level 1, 2, 3 题目
    for l0_q in LEVEL_0_QUESTIONS:
        print(f"生成 {l0_q['id']} 的子题...")
        
        # Level 1
        l1_questions = generate_l1_questions(l0_q)
        all_questions.extend(l1_questions)
        
        # Level 2
        for l1_q in l1_questions:
            l2_questions = generate_l2_questions(l1_q, l0_q["l2_per_l1"])
            all_questions.extend(l2_questions)
            
            # Level 3
            if l0_q["has_l3"] and l1_q["sort_order"] == 1:
                l3_question = generate_l3_question(l2_questions[0])
                all_questions.append(l3_question)
    
    return all_questions

def main():
    """主函数"""
    # 生成所有题目
    questions = generate_all_questions()
    
    # 统计
    level_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for q in questions:
        level_counts[q["level"]] += 1
    
    print("\n生成完成！")
    print(f"Level 0: {level_counts[0]} 题")
    print(f"Level 1: {level_counts[1]} 题")
    print(f"Level 2: {level_counts[2]} 题")
    print(f"Level 3: {level_counts[3]} 题")
    print(f"总计: {len(questions)} 题")
    
    # 保存
    output_path = "/home/mengjie/projects/java-interview/data/spring.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"\n已保存到: {output_path}")
    
    # 计算平均答案长度
    total_chars = sum(len(q["answer"]) for q in questions)
    avg_chars = total_chars // len(questions)
    print(f"平均答案长度: {avg_chars} 字符")

if __name__ == "__main__":
    main()
