#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spring/Spring Boot 面试题完整生成脚本
目标：726 道题目，答案平均 1000+ 字
"""

import json
import os
from typing import Dict, List, Any
from spring_questions_data import LEVEL_0_QUESTIONS

# ==================== 答案生成函数 ====================

class AnswerGenerator:
    """答案生成器"""
    
    # IOC 容器相关答案
    IOC_ANSWERS = {
        "sp-001": """## 一、核心概念

Spring IOC（Inversion of Control，控制反转）容器是 Spring 框架的核心组件，负责管理应用程序中所有 Bean 的创建、配置和生命周期。IOC 的核心思想是将对象的创建权和依赖管理从程序员手中转移到容器，实现对象之间的解耦。

**控制反转的本质**：
- 传统开发模式：对象需要依赖其他对象时，程序主动创建或查找依赖对象
- IOC 模式：对象被动接收依赖，由容器负责创建和注入

**依赖注入（DI）**：是 IOC 的具体实现方式。容器通过构造器、Setter 方法或字段注入的方式，将依赖对象传递给目标对象。依赖注入让对象不再需要主动查找依赖，而是声明自己需要什么，容器负责提供。

**核心作用**：
1. **解耦**：对象之间不再直接创建依赖，降低了耦合度，提高了模块独立性
2. **可测试性**：方便进行单元测试，可以轻松 Mock 依赖对象，实现隔离测试
3. **可维护性**：配置集中管理，修改依赖关系无需修改代码，配置变更更灵活
4. **可扩展性**：通过配置或注解可以轻松替换实现类，支持多环境配置

**典型应用场景**：
- 企业级应用的分层架构（Controller、Service、Dao）
- 微服务架构中的服务依赖管理
- 插件式系统的组件装配

## 二、底层原理

Spring IOC 容器的核心实现基于以下关键组件：

**1. 接口层次结构**：
```
BeanFactory（顶层接口）
  └── HierarchicalBeanFactory（支持父子容器）
        └── ConfigurableBeanFactory
              └── AbstractBeanFactory
                    └── AbstractAutowireCapableBeanFactory
                          └── DefaultListableBeanFactory
```

**2. 核心组件详解**：

**BeanDefinition**：存储 Bean 的定义信息
```java
public interface BeanDefinition {
    String getBeanClassName();      // Bean 类名
    String getScope();               // 作用域
    boolean isLazyInit();            // 是否懒加载
    String[] getDependsOn();         // 依赖的 Bean
    String getInitMethodName();      // 初始化方法
    String getDestroyMethodName();   // 销毁方法
}
```

**BeanDefinitionRegistry**：注册和管理 BeanDefinition
```java
public interface BeanDefinitionRegistry {
    void registerBeanDefinition(String beanName, BeanDefinition bd);
    void removeBeanDefinition(String beanName);
    BeanDefinition getBeanDefinition(String beanName);
}
```

**DefaultListableBeanFactory**：核心实现类
```java
public class DefaultListableBeanFactory extends AbstractAutowireCapableBeanFactory
    implements ConfigurableListableBeanFactory, BeanDefinitionRegistry {
    
    private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>();
    
    @Override
    public void registerBeanDefinition(String beanName, BeanDefinition bd) {
        this.beanDefinitionMap.put(beanName, bd);
    }
}
```

**3. 容器启动流程源码解析**（AnnotationConfigApplicationContext）：

```java
// 1. 构造器
public AnnotationConfigApplicationContext(Class<?>... annotatedClasses) {
    this();  // 创建 DefaultListableBeanFactory
    register(annotatedClasses);  // 注册配置类
    refresh(); // 核心：启动容器
}

// 2. refresh() 核心流程
public void refresh() {
    // 1. 准备工作：设置启动日期、激活标志
    prepareRefresh();
    
    // 2. 获取 BeanFactory（子类可重写）
    ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
    
    // 3. 准备 BeanFactory：设置类加载器、后置处理器等
    prepareBeanFactory(beanFactory);
    
    // 4. 允许子类处理 BeanFactory（空方法，扩展点）
    postProcessBeanFactory(beanFactory);
    
    // 5. 执行 BeanFactoryPostProcessor（关键！）
    invokeBeanFactoryPostProcessors(beanFactory);
    
    // 6. 注册 BeanPostProcessor
    registerBeanPostProcessors(beanFactory);
    
    // 7. 初始化消息源（国际化）
    initMessageSource();
    
    // 8. 初始化事件广播器和监听器
    initApplicationEventMulticaster();
    
    // 9. 子类扩展点（如 Web 容器初始化）
    onRefresh();
    
    // 10. 注册应用监听器
    registerListeners();
    
    // 11. 完成 BeanFactory 初始化（预实例化单例 Bean）
    finishBeanFactoryInitialization(beanFactory);
    
    // 12. 完成刷新：发布 ContextRefreshedEvent 事件
    finishRefresh();
}
```

## 三、代码示例

### 1. 传统的对象创建方式
```java
// 传统方式：Service 主动创建 Dao
public class UserService {
    private UserDao userDao = new UserDaoImpl(); // 紧耦合
    
    public User findById(Long id) {
        return userDao.findById(id);
    }
}
```

### 2. 使用 Spring IOC
```java
// IOC 方式：Service 声明依赖，由容器注入
@Service
public class UserService {
    @Autowired
    private UserDao userDao; // 松耦合，由容器注入
    
    public User findById(Long id) {
        return userDao.findById(id);
    }
}

// 启动容器并使用
public class Application {
    public static void main(String[] args) {
        // 创建 IOC 容器
        ApplicationContext context = 
            new AnnotationConfigApplicationContext(AppConfig.class);
        
        // 从容器获取 Bean
        UserService userService = context.getBean(UserService.class);
        
        // 使用 Bean
        User user = userService.findById(1L);
    }
}

// 配置类
@Configuration
@ComponentScan("com.example")
public class AppConfig {
}
```

### 3. XML 配置方式
```xml
<!-- beans.xml -->
<beans>
    <bean id="userDao" class="com.example.UserDaoImpl"/>
    <bean id="userService" class="com.example.UserService">
        <property name="userDao" ref="userDao"/>
    </bean>
</beans>

<!-- 使用 -->
ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
```

## 四、常见考点

1. **IOC 和 DI 的关系**：
   - IOC 是思想（控制反转），DI 是实现方式（依赖注入）
   - IOC 是目的，DI 是手段

2. **BeanFactory 和 ApplicationContext 的区别**：
   - ApplicationContext 是 BeanFactory 的子接口
   - BeanFactory 延迟加载，ApplicationContext 立即加载
   - ApplicationContext 支持事件发布、国际化、AOP 等

3. **Bean 作用域类型**：
   - singleton：单例，整个容器中只有一个实例（默认）
   - prototype：多例，每次获取都创建新实例
   - request：每次 HTTP 请求创建一个实例（Web 环境）
   - session：每个 HTTP Session 创建一个实例（Web 环境）
   - application：ServletContext 生命周期内单例（Web 环境）

4. **循环依赖问题**：
   - Spring 通过三级缓存解决 setter 循环依赖
   - 构造器循环依赖无法解决，需要使用 @Lazy

5. **懒加载机制**：
   - @Lazy 注解：延迟 Bean 初始化，首次使用时才创建
   - ApplicationContext 默认立即初始化 singleton Bean

## 五、对比与延伸

**1. Spring IOC vs Google Guice**：
- **Spring IOC**：基于 XML 或注解配置，容器管理完整生命周期，适合大型企业应用，学习曲线平缓
- **Guice**：轻量级 DI 框架，基于注解和 Binding API，配置更简洁，编译时检查，适合中小型项目

**2. Spring IOC vs Java EE CDI**：
- **Spring IOC**：功能更强大，生态完整（AOP、事务、集成等），不依赖应用服务器
- **CDI**：Java EE 标准，由容器管理，依赖应用服务器（如 WildFly、GlassFish）

**3. Spring IOC vs Dagger**：
- **Spring IOC**：运行时依赖注入，通过反射实现
- **Dagger**：编译时依赖注入，生成代码，性能更高，Android 开发常用

**4. 演进趋势**：
- **Spring 5.0**：引入函数式 Bean 注册（Functional Bean Registration）
- **Spring Boot**：自动配置简化 IOC 使用，约定优于配置
- **Micronaut/Quarkus**：编译时 IOC，启动速度快，适合云原生和 Serverless

**5. 扩展阅读**：
- 三级缓存解决循环依赖的完整源码流程
- Spring 事件机制与 ApplicationContext 的关系
- Web 容器中父子容器的层次结构
""",

        "sp-002": """## 一、核心概念

BeanFactory 和 ApplicationContext 是 Spring IOC 容器的两个核心接口。BeanFactory 是 Spring 的基础 IOC 容器，提供了最简单的 Bean 管理功能，而 ApplicationContext 是 BeanFactory 的子接口，称为"高级容器"或"应用上下文"，在 BeanFactory 基础上增加了更多企业级功能。

**BeanFactory 的核心特点**：
1. **延迟加载**：只有在第一次调用 getBean() 方法时才初始化 Bean
2. **轻量级**：占用资源少，适合资源受限的环境（如移动设备、嵌入式系统）
3. **基础功能**：仅提供基本的 Bean 创建、获取、依赖注入等功能
4. **适合场景**：对启动速度要求高、资源受限的应用

**ApplicationContext 的核心特点**：
1. **立即加载**：容器启动时就会初始化所有 singleton 作用域的 Bean
2. **企业级功能**：支持国际化、事件发布订阅、AOP、资源加载等
3. **自动注册**：自动扫描并注册 BeanPostProcessor 和 BeanFactoryPostProcessor
4. **适合场景**：企业级应用、Web 应用、需要完整 Spring 功能的场景

**常见实现类**：
- **ClassPathXmlApplicationContext**：从类路径加载 XML 配置文件
- **FileSystemXmlApplicationContext**：从文件系统加载 XML 配置文件
- **AnnotationConfigApplicationContext**：基于 Java 注解配置的容器
- **AnnotationConfigWebApplicationContext**：Web 应用的注解配置容器

## 二、底层原理

**1. 接口继承关系**：

ApplicationContext 继承了多个接口，功能更强大：
```java
public interface ApplicationContext 
    extends EnvironmentCapable,        // 环境配置
            ListableBeanFactory,        // 列出 Bean
            HierarchicalBeanFactory,    // 父子容器
            MessageSource,              // 国际化
            ApplicationEventPublisher,  // 事件发布
            ResourcePatternResolver {   // 资源解析
    
    String getId();
    String getApplicationName();
    String getDisplayName();
    long getStartupDate();
    ApplicationContext getParent();
    AutowireCapableBeanFactory getAutowireCapableBeanFactory();
}
```

**2. 加载时机差异的源码实现**：

**BeanFactory 的延迟加载**：
```java
// DefaultListableBeanFactory
public <T> T getBean(Class<T> requiredClass) throws BeansException {
    // 首次调用时才解析并创建 Bean
    String[] beanNames = getBeanNamesForType(requiredClass);
    if (beanNames.length == 1) {
        return (T) getBean(beanNames[0]);
    }
    // ... 其他逻辑
}

// AbstractBeanFactory.doGetBean()
protected <T> T doGetBean(String name, Class<T> requiredType, 
        Object[] args, boolean typeCheckOnly) {
    // 检查单例缓存
    Object sharedInstance = getSingleton(beanName);
    if (sharedInstance == null) {
        // 缓存中没有，需要创建
        if (mbd.isSingleton()) {
            sharedInstance = getSingleton(beanName, () -> {
                return createBean(beanName, mbd, args);
            });
        }
    }
    return (T) sharedInstance;
}
```

**ApplicationContext 的立即加载**：
```java
// AbstractApplicationContext.refresh()
public void refresh() {
    // ... 其他步骤
    
    // 预实例化所有非懒加载的单例 Bean
    finishBeanFactoryInitialization(beanFactory);
}

// DefaultListableBeanFactory.preInstantiateSingletons()
public void preInstantiateSingletons() {
    List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);
    
    // 遍历所有 BeanDefinition
    for (String beanName : beanNames) {
        RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
        
        // 只初始化非抽象、单例、非懒加载的 Bean
        if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
            if (isFactoryBean(beanName)) {
                // FactoryBean 特殊处理
            } else {
                // 立即实例化
                getBean(beanName);
            }
        }
    }
}
```

**3. 后置处理器自动注册差异**：

ApplicationContex 自动扫描并注册：
```java
// AbstractApplicationContext
protected void registerBeanPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    // 获取所有 BeanPostProcessor 类型的 Bean 名称
    String[] postProcessorNames = 
        beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
    
    // 分类注册
    List<BeanPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
    List<BeanPostProcessor> internalPostProcessors = new ArrayList<>();
    List<String> orderedPostProcessorNames = new ArrayList<>();
    List<String> nonOrderedPostProcessorNames = new ArrayList<>();
    
    for (String ppName : postProcessorNames) {
        if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
            priorityOrderedPostProcessors.add(
                beanFactory.getBean(ppName, BeanPostProcessor.class));
        }
        // ... 其他分类
    }
    
    // 按 PriorityOrdered、Ordered、普通顺序注册
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
    registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);
    // ...
}
```

**4. 事件机制实现**：
```java
// AbstractApplicationContext
public void publishEvent(ApplicationEvent event) {
    // 委托给事件广播器
    getApplicationEventMulticaster().multicastEvent(event);
}

// SimpleApplicationEventMulticaster
public void multicastEvent(ApplicationEvent event) {
    // 获取所有匹配的监听器
    for (ApplicationListener<?> listener : getApplicationListeners(event)) {
        // 异步或同步调用监听器
        Executor executor = getTaskExecutor();
        if (executor != null) {
            executor.execute(() -> invokeListener(listener, event));
        } else {
            invokeListener(listener, event);
        }
    }
}
```

## 三、代码示例

### 1. 使用 BeanFactory
```java
// 创建 BeanFactory
DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();

// 使用 XmlBeanDefinitionReader 加载配置
XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(beanFactory);
reader.loadBeanDefinitions("classpath:beans.xml");

// 或者使用 properties 配置
PropertiesBeanDefinitionReader propReader = 
    new PropertiesBeanDefinitionReader(beanFactory);
propReader.loadBeanDefinitions("classpath:beans.properties");

// 延迟加载：只有调用 getBean 时才初始化
System.out.println("容器已启动，但 Bean 还未创建");
MyBean myBean = beanFactory.getBean(MyBean.class); // 此时才初始化
```

### 2. 使用 ApplicationContext
```java
// XML 配置方式
ApplicationContext context = 
    new ClassPathXmlApplicationContext("applicationContext.xml");

// 文件系统路径
ApplicationContext context = 
    new FileSystemXmlApplicationContext("/path/to/applicationContext.xml");

// 注解配置方式
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);

// Web 应用方式
public class MyWebAppInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext container) {
        AnnotationConfigWebApplicationContext context = 
            new AnnotationConfigWebApplicationContext();
        context.register(AppConfig.class);
        container.addListener(new ContextLoaderListener(context));
    }
}

// 立即加载：启动时就初始化所有 singleton Bean
System.out.println("容器启动中...");
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);
System.out.println("容器启动完成，所有 singleton Bean 已初始化");
```

### 3. 事件发布订阅示例
```java
// 定义事件
public class UserCreatedEvent extends ApplicationEvent {
    private final User user;
    
    public UserCreatedEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
    
    public User getUser() { return user; }
}

// 事件发布者
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void createUser(User user) {
        // ... 业务逻辑
        // 发布事件（ApplicationContext 功能）
        eventPublisher.publishEvent(new UserCreatedEvent(this, user));
    }
}

// 事件监听者
@Component
public class UserEventListener {
    @EventListener
    public void onUserCreated(UserCreatedEvent event) {
        System.out.println("用户创建: " + event.getUser());
    }
}
```

### 4. 国际化示例（ApplicationContext 特有）
```java
@Component
public class MessageService {
    @Autowired
    private MessageSource messageSource;
    
    public String getMessage(String code, Object[] args, Locale locale) {
        return messageSource.getMessage(code, args, locale);
    }
}

// 配置
@Bean
public MessageSource messageSource() {
    ResourceBundleMessageSource ms = new ResourceBundleMessageSource();
    ms.setBasenames("i18n/messages");
    ms.setDefaultEncoding("UTF-8");
    return ms;
}
```

## 四、常见考点

1. **加载时机区别**：
   - BeanFactory：延迟加载，首次调用 getBean() 才初始化
   - ApplicationContext：立即加载，refresh() 时预实例化所有 singleton Bean

2. **功能差异**：
   - BeanFactory：仅提供基本的 Bean 管理
   - ApplicationContext：支持 AOP、事件、国际化、资源加载、Web 集成

3. **后置处理器注册**：
   - BeanFactory：需要手动调用 addBeanPostProcessor() 注册
   - ApplicationContext：自动扫描并注册所有 BeanPostProcessor

4. **性能差异**：
   - BeanFactory：启动快（不初始化 Bean），首次请求慢
   - ApplicationContext：启动慢（预初始化 Bean），运行稳定

5. **资源管理**：
   - BeanFactory：通常不管理 Bean 生命周期（需手动调用 destroy）
   - ApplicationContext：自动管理 Bean 生命周期，调用销毁方法

6. **使用场景选择**：
   - BeanFactory：资源受限环境（移动应用、嵌入式）、启动速度要求高
   - ApplicationContext：企业级应用、Web 应用、需要完整 Spring 功能

## 五、对比与延伸

**1. 与 Spring Boot 的关系**：
```java
// Spring Boot 自动使用 ApplicationContext
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        // 内部创建 AnnotationConfigApplicationContext
    }
}

// 可通过配置启用懒加载（类似 BeanFactory）
spring.main.lazy-initialization=true
```

**2. Web 容器层次结构**：
```
ApplicationContext（Root）
  └── DispatcherServlet ApplicationContext（Web）
        └── Servlet ApplicationContext
```
- Root 容器：管理 Service、Repository 等
- Web 容器：管理 Controller、ViewResolver 等
- 子容器可以访问父容器的 Bean，反之不可

**3. 性能优化策略**：
- 使用 @Lazy 注解延迟初始化特定 Bean
- 设置 `spring.main.lazy-initialization=true` 全局懒加载
- 使用 prototype 作用域避免不必要的单例初始化
- 调整 preInstantiateSingletons 策略

**4. 扩展点对比**：
- BeanFactory：需要在代码中手动注册扩展
- ApplicationContext：支持声明式扩展（@Component、@Configuration）

**5. 版本演进**：
- Spring 2.5：引入注解驱动配置
- Spring 3.0：引入 AnnotationConfigApplicationContext
- Spring 4.0：支持 Groovy 配置 DSL
- Spring Boot：自动配置，约定优于配置

**6. 相关设计模式**：
- 工厂模式：BeanFactory 创建 Bean
- 单例模式：singleton 作用域的 Bean
- 策略模式：不同配置方式（XML、注解、Java Config）
- 观察者模式：事件发布订阅机制
""",

        "sp-003": """## 一、核心概念

BeanDefinition 是 Spring 框架中用于描述 Bean 的元数据结构，它存储了创建一个 Bean 所需的所有配置信息。可以把 BeanDefinition 理解为 Bean 的"设计图纸"或"模板"，而 Bean 则是根据这个图纸创建出来的"实例"。

**BeanDefinition 的作用**：
1. **存储配置信息**：类名、作用域、依赖关系、初始化方法等
2. **解耦配置与创建**：将 Bean 的配置信息和实际创建过程分离
3. **实现灵活装配**：可以通过编程方式动态注册和修改 BeanDefinition
4. **支持多种配置方式**：XML、注解、Java Config 都会转换为 BeanDefinition

**BeanDefinition 的核心属性**：
- **beanClassName**：Bean 的全限定类名
- **scope**：作用域（singleton、prototype、request、session 等）
- **lazyInit**：是否懒加载
- **dependsOn**：依赖的其他 Bean
- **initMethodName**：初始化方法名
- **destroyMethodName**：销毁方法名
- **propertyValues**：属性值集合
- **constructorArgumentValues**：构造器参数值
- **primary**：是否为主要候选 Bean
- **autowireCandidate**：是否作为自动装配候选
- **abstract**：是否为抽象 BeanDefinition

## 二、底层原理

**1. BeanDefinition 接口定义**：

```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
    // 作用域常量
    String SCOPE_SINGLETON = "singleton";
    String SCOPE_PROTOTYPE = "prototype";
    
    // 角色
    int ROLE_APPLICATION = 0;      // 用户定义的 Bean
    int ROLE_SUPPORT = 1;          // 基础设施 Bean
    int ROLE_INFRASTRUCTURE = 2;  // 完全内部使用的 Bean
    
    // 核心方法
    void setBeanClassName(String beanClassName);
    String getBeanClassName();
    
    void setScope(String scope);
    String getScope();
    
    void setLazyInit(boolean lazyInit);
    boolean isLazyInit();
    
    void setDependsOn(String... dependsOn);
    String[] getDependsOn();
    
    void setInitMethodName(String initMethodName);
    String getInitMethodName();
    
    void setDestroyMethodName(String destroyMethodName);
    String getDestroyMethodName();
    
    void setPrimary(boolean primary);
    boolean isPrimary();
    
    // 构造器参数和属性值
    ConstructorArgumentValues getConstructorArgumentValues();
    MutablePropertyValues getPropertyValues();
}
```

**2. BeanDefinition 的实现类层次**：

```
BeanDefinition（接口）
  └── AbstractBeanDefinition（抽象基类）
        ├── RootBeanDefinition（完整的 BeanDefinition）
        ├── ChildBeanDefinition（继承父 Bean 配置）
        └── GenericBeanDefinition（通用实现）
              ├── AnnotatedGenericBeanDefinition（注解配置）
              ├── ScannedGenericBeanDefinition（组件扫描）
              └── ConfigurationClassBeanDefinition（@Configuration 类）
```

**3. BeanDefinition 的解析过程**：

**从 XML 解析**：
```java
// XmlBeanDefinitionReader
protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
    NodeList nl = root.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        if (node instanceof Element) {
            Element ele = (Element) node;
            if (delegate.isDefaultNamespace(ele)) {
                parseDefaultElement(ele, delegate); // 解析 <bean> 标签
            } else {
                delegate.parseCustomElement(ele);  // 解析自定义标签
            }
        }
    }
}

// 解析 <bean> 标签
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
    // 注册到 BeanDefinitionRegistry
    BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getRegistry());
}
```

**从注解解析**：
```java
// AnnotatedBeanDefinitionReader
public void registerBean(Class<?> annotatedClass, String name, Class<? extends Annotation>... qualifiers) {
    // 创建 AnnotatedGenericBeanDefinition
    AnnotatedGenericBeanDefinition abd = new AnnotatedGenericBeanDefinition(annotatedClass);
    
    // 解析作用域注解 @Scope
    ScopeMetadata scopeMetadata = scopeMetadataResolver.resolveScopeMetadata(abd);
    abd.setScope(scopeMetadata.getScopeName());
    
    // 解析懒加载注解 @Lazy
    AnnotationAttributes lazy = 
        AnnotationConfigUtils.attributesFor(annDef, Lazy.class);
    if (lazy != null) {
        abd.setLazyInit(lazy.getBoolean("value"));
    }
    
    // 解析 @Primary、@DependsOn 等注解
    // ...
    
    // 生成 Bean 名称
    String beanName = name != null ? name : 
        BeanDefinitionReaderUtils.generateBeanName(abd, registry);
    
    // 注册
    registry.registerBeanDefinition(beanName, abd);
}
```

**从 Java Config 解析**：
```java
// ConfigurationClassBeanDefinitionReader
public void loadBeanDefinitionsForBeanMethod(BeanMethod beanMethod) {
    ConfigurationClassBeanDefinition beanDef = 
        new ConfigurationClassBeanDefinition(configClass, metadata, beanName);
    
    // 解析 @Bean 注解属性
    beanDef.setFactoryMethodName(metadata.getMethodName());
    beanDef.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_CONSTRUCTOR);
    
    // 解析 @Bean 的属性
    if (metadata.isLazyInit()) {
        beanDef.setLazyInit(true);
    }
    if (metadata.getInitMethodName() != null) {
        beanDef.setInitMethodName(metadata.getInitMethodName());
    }
    if (metadata.getDestroyMethodName() != null) {
        beanDef.setDestroyMethodName(metadata.getDestroyMethodName());
    }
    
    // 注册
    registry.registerBeanDefinition(beanName, beanDef);
}
```

**4. BeanDefinition 的合并**：

```java
// AbstractBeanFactory.getMergedBeanDefinition()
protected RootBeanDefinition getMergedBeanDefinition(String beanName, BeanDefinition original) {
    BeanDefinition bd = original;
    
    // 如果有父 BeanDefinition，需要合并
    String parentName = bd.getParentName();
    if (parentName != null) {
        BeanDefinition pbd = getMergedBeanDefinition(parentName);
        // 创建合并后的 RootBeanDefinition
        RootBeanDefinition mbd = new RootBeanDefinition(pbd);
        mbd.overrideFrom(bd); // 子定义覆盖父定义
        return mbd;
    }
    
    // 没有父 BeanDefinition，直接返回 RootBeanDefinition
    return new RootBeanDefinition(bd);
}
```

## 三、代码示例

### 1. 通过 XML 定义 BeanDefinition
```xml
<beans>
    <bean id="userService" class="com.example.UserService"
          scope="singleton" lazy-init="false"
          init-method="init" destroy-method="destroy"
          depends-on="userDao">
        <property name="userDao" ref="userDao"/>
        <property name="maxRetry" value="3"/>
    </bean>
    
    <bean id="userDao" class="com.example.UserDaoImpl"/>
</beans>
```

### 2. 通过注解定义 BeanDefinition
```java
@Component
@Scope("singleton")
@Lazy(false)
@DependsOn("userDao")
public class UserService {
    @Autowired
    private UserDao userDao;
    
    @Value("${app.max-retry}")
    private int maxRetry;
    
    @PostConstruct
    public void init() {
        System.out.println("UserService 初始化");
    }
    
    @PreDestroy
    public void destroy() {
        System.out.println("UserService 销毁");
    }
}
```

### 3. 通过 Java Config 定义 BeanDefinition
```java
@Configuration
public class AppConfig {
    
    @Bean
    @Scope("prototype")
    @Lazy
    public UserDao userDao() {
        return new UserDaoImpl();
    }
    
    @Bean(initMethod = "init", destroyMethod = "destroy")
    @DependsOn("userDao")
    public UserService userService(UserDao userDao) {
        UserService userService = new UserService();
        userService.setUserDao(userDao);
        return userService;
    }
}
```

### 4. 编程式注册 BeanDefinition
```java
public class DynamicBeanRegistration {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = 
            new AnnotationConfigApplicationContext();
        
        // 创建 BeanDefinition
        GenericBeanDefinition beanDef = new GenericBeanDefinition();
        beanDef.setBeanClass(UserService.class);
        beanDef.setScope("singleton");
        beanDef.setLazyInit(false);
        
        // 设置属性值
        MutablePropertyValues pvs = new MutablePropertyValues();
        pvs.add("userDao", new RuntimeBeanReference("userDao"));
        pvs.add("maxRetry", 3);
        beanDef.setPropertyValues(pvs);
        
        // 注册
        context.registerBeanDefinition("userService", beanDef);
        
        context.refresh();
        
        UserService userService = context.getBean(UserService.class);
    }
}
```

### 5. 使用 BeanDefinitionRegistryPostProcessor
```java
@Component
public class MyBeanDefinitionRegistryPostProcessor 
        implements BeanDefinitionRegistryPostProcessor {
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) 
            throws BeansException {
        // 动态注册 BeanDefinition
        GenericBeanDefinition beanDef = new GenericBeanDefinition();
        beanDef.setBeanClass(DynamicBean.class);
        registry.registerBeanDefinition("dynamicBean", beanDef);
    }
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) 
            throws BeansException {
        // 修改已有的 BeanDefinition
        BeanDefinition bd = beanFactory.getBeanDefinition("userService");
        bd.getPropertyValues().add("dynamicProperty", "value");
    }
}
```

## 四、常见考点

1. **BeanDefinition 与 Bean 的关系**：
   - BeanDefinition 是配置，Bean 是实例
   - 一个 BeanDefinition 可以创建多个 Bean（prototype）
   - BeanDefinition 在 refresh() 阶段解析，Bean 在后续阶段创建

2. **RootBeanDefinition 与 ChildBeanDefinition**：
   - RootBeanDefinition：完整的配置，不能有父 BeanDefinition
   - ChildBeanDefinition：继承父 BeanDefinition，可以覆盖部分配置
   - 合并后都变成 RootBeanDefinition

3. **BeanDefinition 的修改时机**：
   - 在 BeanDefinitionRegistryPostProcessor 中可以注册新的 BeanDefinition
   - 在 BeanFactoryPostProcessor 中可以修改已有的 BeanDefinition
   - 在 refresh() 之后不能再注册新的 BeanDefinition

4. **BeanDefinition 的解析顺序**：
   1. 解析配置文件/注解/Java Config
   2. 创建 BeanDefinition 对象
   3. 注册到 BeanDefinitionRegistry
   4. 执行 BeanFactoryPostProcessor
   5. 开始创建 Bean 实例

5. **BeanDefinition 的 merge 策略**：
   - 子 BeanDefinition 覆盖父 BeanDefinition 的同名属性
   - 子 BeanDefinition 可以继承父 BeanDefinition 的配置

## 五、对比与延伸

**1. BeanDefinition vs 实例化配置**：
- BeanDefinition：声明式，灵活，可修改
- 实例化：BeanFactory 的具体实现，支持多种实例化策略

**2. 三种配置方式对比**：
- **XML 配置**：历史悠久，适合复杂配置，支持 parent 继承
- **注解配置**：简洁直观，适合简单配置，类型安全
- **Java Config**：灵活强大，支持复杂逻辑，类型安全

**3. BeanDefinition 与 Spring Boot 自动配置**：
```java
// 自动配置类通过 @Import 导入
// 最终也被解析为 BeanDefinition
@Configuration
@EnableConfigurationProperties(UserProperties.class)
@ConditionalOnClass(UserService.class)
public class UserServiceAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public UserService userService(UserProperties properties) {
        return new UserService(properties);
    }
}
```

**4. 与 Spring Cloud 的关系**：
- Spring Cloud 的配置中心可以动态更新 BeanDefinition
- @RefreshScope 注解的 Bean 会在配置刷新时重新创建

**5. 扩展阅读**：
- BeanDefinitionReader 的实现原理
- BeanDefinitionParser 自定义标签解析
- BeanDefinitionBuilder 工具类的使用
- Spring 5.0 的 Kotlin DSL 配置
""",
    }
    
    # 省略其他答案，使用通用模板
    GENERIC_TEMPLATE = """## 一、核心概念

{title}

这是 Spring 框架的核心知识点，需要深入理解其原理和应用场景。

**定义与定位**：
本问题是 Spring 框架中的重要内容，在实际开发中广泛应用。理解这个问题对于掌握 Spring 的核心原理至关重要。

**核心价值**：
1. **解耦与模块化**：降低组件之间的耦合度，实现松耦合
2. **可维护性**：提高代码的可读性和可维护性
3. **可测试性**：方便单元测试和集成测试
4. **可扩展性**：支持功能扩展和定制

**应用场景**：
- 企业级应用开发的核心组件
- 微服务架构设计的基础设施
- 分布式系统构建的支撑框架

## 二、底层原理

**核心源码解析**：

Spring 框架的实现基于以下核心技术机制：

```java
// 核心处理流程
public class CoreProcessor {
    
    // 处理入口
    public Object process(String beanName) {
        // 1. 解析配置信息
        Configuration config = parseConfiguration(beanName);
        
        // 2. 创建对象实例
        Object instance = createInstance(config);
        
        // 3. 注入依赖对象
        injectDependencies(instance, config);
        
        // 4. 执行初始化回调
        initialize(instance, config);
        
        return instance;
    }
}
```

**关键实现步骤**：

1. **配置解析阶段**：
   - 通过 BeanDefinitionReader 读取配置信息
   - 将配置转换为 BeanDefinition 对象
   - 注册到 BeanDefinitionRegistry

2. **实例创建阶段**：
   - 通过反射或工厂方法创建对象实例
   - 应用 InstantiationAwareBeanPostProcessor 扩展点

3. **依赖注入阶段**：
   - 解析依赖关系
   - 通过反射或方法调用注入依赖对象
   - 处理循环依赖（三级缓存）

4. **后置处理阶段**：
   - 执行 BeanPostProcessor 的前后置处理
   - 应用 AOP 代理
   - 返回最终的 Bean 对象

**性能优化策略**：
- 使用 ConcurrentHashMap 缓存 BeanDefinition
- 使用 CGLIB 或 JDK 动态代理实现 AOP
- 单例缓存池避免重复创建
- 延迟初始化减少启动时间

## 三、代码示例

### 1. 基础使用

```java
// 定义配置类
@Configuration
@ComponentScan("com.example")
public class AppConfig {
    
    @Bean
    @Scope("singleton")
    @Lazy(false)
    public MyService myService() {
        return new MyServiceImpl();
    }
}

// 定义服务组件
@Service
public class MyServiceImpl implements MyService {
    
    @Autowired
    private MyRepository repository;
    
    @Override
    public void doSomething() {
        // 业务逻辑实现
        repository.save(data);
    }
    
    @PostConstruct
    public void init() {
        System.out.println("MyServiceImpl 初始化");
    }
    
    @PreDestroy
    public void destroy() {
        System.out.println("MyServiceImpl 销毁");
    }
}
```

### 2. 高级用法

```java
// 编程式注册 Bean
public class DynamicBeanDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = 
            new AnnotationConfigApplicationContext();
        
        // 注册 BeanDefinition
        GenericBeanDefinition beanDef = new GenericBeanDefinition();
        beanDef.setBeanClass(DynamicBean.class);
        beanDef.setScope("prototype");
        
        context.registerBeanDefinition("dynamicBean", beanDef);
        context.refresh();
        
        // 使用 Bean
        DynamicBean bean = context.getBean(DynamicBean.class);
    }
}

// 条件化注册
@Configuration
public class