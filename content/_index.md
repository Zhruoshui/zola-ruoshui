+++
template = "homepage.html"
+++

<style>
.homepage-wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 1.3rem 1.6rem 1rem;
}

.homepage-hero {
    text-align: center;
    padding: 0;
}

.homepage-hero-title {
    font-size: 2.05rem;
    margin: 0 0 0.4rem;
    letter-spacing: 0.02em;
}

.homepage-hero-subtitle {
    font-size: 0.98rem;
    line-height: 1.5;
    margin: 0 auto 0.6rem;
    max-width: 52rem;
}

.homepage-hero-meta {
    font-size: 0.9rem;
    color: var(--text-1);
}

.homepage-visual {
    margin: 0.9rem auto 0.8rem;
    display: flex;
    justify-content: center;
}

.homepage-badges {
    margin-top: 0.55rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    font-size: 0.78rem;
    justify-content: center;
}

.homepage-badges span {
    padding: 0.18rem 0.55rem;
    border-radius: 999px;
    background: var(--bg-1);
    border: 1px solid var(--bg-2);
    color: var(--text-1);
}

.homepage-visual img {
    width: min(720px, 100%);
    max-height: 260px;
    display: block;
    border-radius: 18px;
    object-fit: cover;
    background: var(--bg-1);
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
}

.homepage-sections {
    margin-top: 0.8rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
}

.homepage-card {
    padding: 0.85rem 0.95rem;
    border-radius: 14px;
    border: 1px solid var(--bg-2);
    background: var(--bg-1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.homepage-card h2 {
    font-size: 0.88rem;
    margin: 0 0 0.5rem;
    letter-spacing: 0.06em;
    color: var(--primary-color);
}

.homepage-card ul {
    margin: 0;
    padding-left: 1rem;
}

.homepage-card li {
    margin-bottom: 0.3rem;
    font-size: 0.88rem;
    line-height: 1.45;
    color: var(--text-1);
}

.homepage-card li:last-child {
    margin-bottom: 0;
}

@media (max-width: 960px) {
    .homepage-sections {
        grid-template-columns: 1fr;
    }
}

:root.dark .homepage-card {
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.35);
}

:root.dark .homepage-visual img {
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.4);
}
</style>

<div class="homepage-wrap">
    <div class="homepage-hero">
        <h1 class="homepage-hero-title">工程实践与系统笔记</h1>
        <div class="homepage-badges">
            <span>嵌入式系统启动流程与驱动</span>
            <span>操作系统内核</span>
            <span>嵌入式AI及工程化</span>
            <span>嵌入式调试链路与构建</span>
        </div>
    </div>
    <div class="homepage-visual">
        <img src="/images/linux.png" alt="background" loading="lazy" />
    </div>
    <div class="homepage-sections">
        <section class="homepage-card">
            <h2>写作目的</h2>
            <ul>
                <li>以项目为牵引，把工程实践拆成可复现的步骤与结论</li>
                <li>记录嵌入式与系统开发的底层原理（启动、内核、驱动、调试、编译链）</li>
                <li>跟进 嵌入式领域如何引入Vibe Coding</li>
                <li>沉淀高频开发技能与工具方法，形成可检索的知识库</li>
            </ul>
        </section>
        <section class="homepage-card">
            <h2>关注方向</h2>
            <ul>
                <li>嵌入式与 Linux 系统开发</li>
                <li>大模型与工程化实践</li>
                <li>工具链、调试与开发效率</li>
                <li>读书与资料整理（可检索）</li>
            </ul>
        </section>
        <section class="homepage-card">
            <h2>功能分布</h2>
            <ul>
                <li><a href="/posts">文章</a>：日常博客文章</li>
                <li><a href="/tags">标签</a>：自动生成的内容索引</li>
                <li><a href="/projects">项目</a>：项目地址合集</li>
                <li><a href="/talks">演讲</a>：B 站发布的视频</li>
                <li>搜索与主题切换：导航栏右侧</li>
            </ul>
        </section>
    </div>
</div>
