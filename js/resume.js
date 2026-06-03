/**
 * 简历页面 - 交互脚本
 */

(function () {
  'use strict';

  // ============================================
  // 移动端菜单
  // ============================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      const isExpanded = mobileMenu.classList.contains('hidden') === false;
      if (isExpanded) {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // ============================================
  // 回到顶部按钮
  // ============================================
  const backToTopBtn = document.getElementById('back-to-top');

  function handleScroll() {
    if (!backToTopBtn) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 400) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ============================================
  // 滚动渐入动效
  // ============================================
  function initScrollObserver() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.resume-section').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      }
    );

    document.querySelectorAll('.resume-section').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ============================================
  // 初始化
  // ============================================
  function init() {
    handleScroll();
    initScrollObserver();
    console.log('简历页面初始化完成');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
