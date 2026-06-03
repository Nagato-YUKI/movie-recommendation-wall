/**
 * 影荐墙 - 主逻辑脚本
 * 功能：数据管理、渲染、搜索、筛选、收藏、动效
 */

// ============================================
// 常量定义
// ============================================

/** localStorage 收藏数据的键名 */
const STORAGE_KEY_FAVORITES = 'movie_favorites';

/** 防抖延迟时间（毫秒） */
const DEBOUNCE_DELAY = 200;

/** 分类标签到 CSS 类名的映射 */
const TAG_CLASS_MAP = {
  '科幻': 'tag-sci-fi',
  '悬疑': 'tag-suspense',
  '动画': 'tag-animation',
  '剧情': 'tag-drama',
  '冒险': 'tag-adventure',
  '惊悚': 'tag-thriller',
  '犯罪': 'tag-crime',
  '奇幻': 'tag-fantasy',
  '动作': 'tag-action',
  '家庭': 'tag-family',
};

/** 分类主标签列表（用于筛选） */
const MAIN_CATEGORIES = ['科幻', '悬疑', '动画', '剧情'];

// ============================================
// 电影数据（硬编码）
// ============================================

/**
 * 8 部电影的完整数据
 * @type {Array<{
 *   id: string,
 *   title: string,
 *   originalTitle: string,
 *   year: number,
 *   director: string,
 *   categories: string[],
 *   rating: number,
 *   description: string,
 *   quote: string,
 *   image: string
 * }>}
 */
const MOVIES_DATA = [
  {
    id: 'movie_1',
    title: '星际穿越',
    originalTitle: 'Interstellar',
    year: 2014,
    director: '克里斯托弗·诺兰',
    categories: ['科幻', '冒险'],
    rating: 9.4,
    description: '地球环境恶化，前飞行员库珀临危受命，穿越虫洞寻找人类新家园。在浩瀚宇宙中，爱与引力跨越维度，成为连接过去与未来的唯一桥梁。诺兰用硬核科幻包裹深情内核，打造了一部关于时间、空间与亲情的史诗。',
    quote: '爱是唯一可以穿越时间的力量。',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_2',
    title: '银翼杀手 2049',
    originalTitle: 'Blade Runner 2049',
    year: 2017,
    director: '丹尼斯·维伦纽瓦',
    categories: ['科幻', '惊悚'],
    rating: 9.2,
    description: '复制人K在追查一个埋藏三十年的秘密时，逐渐逼近关于自身身份的真相。维伦纽瓦以极致的视觉美学重构赛博朋克世界，在霓虹废墟与橙色荒漠间，追问何以为人的终极命题。',
    quote: '每一帧都是壁纸的科幻美学巅峰。',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_3',
    title: '看不见的客人',
    originalTitle: 'Contratiempo',
    year: 2016,
    director: '奥里奥尔·保罗',
    categories: ['悬疑', '犯罪'],
    rating: 9.1,
    description: '企业家艾德里安被指控谋杀情人，他请来金牌女律师为自己辩护。随着对话深入，真相不断被推翻重建，层层反转令人窒息。不到最后一秒，你永远猜不到结局。',
    quote: '43 处反转，最后一刻颠覆所有认知。',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_4',
    title: '窃听风暴',
    originalTitle: 'Das Leben der Anderen',
    year: 2006,
    director: '弗洛里安·亨克尔·冯·多纳斯马',
    categories: ['悬疑', '剧情'],
    rating: 9.3,
    description: '1984 年东德，秘密警察卫斯勒奉命监听剧作家德莱曼，却在监听过程中逐渐被艺术与人性打动，最终选择默默守护。一部关于良知觉醒的冷峻杰作，结尾五分钟足以让人泪崩。',
    quote: '沉默的守护，是最深沉的救赎。',
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_5',
    title: '千与千寻',
    originalTitle: '千と千尋の神隠し',
    year: 2001,
    director: '宫崎骏',
    categories: ['动画', '奇幻'],
    rating: 9.5,
    description: '少女千寻误入神灵世界，为救父母踏上成长之旅。在汤屋的奇幻世界里，她学会独立、勇敢与善良。宫崎骏用瑰丽想象编织的成人童话，关于迷失与找回自我的永恒寓言。',
    quote: '成长，就是一场不回头的前行。',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_6',
    title: '蜘蛛侠：平行宇宙',
    originalTitle: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    director: '鲍勃·佩尔西切蒂 / 彼得·拉姆齐 / 罗德尼·罗斯曼',
    categories: ['动画', '动作'],
    rating: 9.0,
    description: '普通少年迈尔斯被放射性蜘蛛咬伤后，与来自平行宇宙的六位蜘蛛侠联手拯救世界。影片以突破性的漫画视觉风格重新定义动画美学，证明任何人都可以戴上那张面具。',
    quote: '画风炸裂，任何人都可以成为英雄。',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_7',
    title: '肖申克的救赎',
    originalTitle: 'The Shawshank Redemption',
    year: 1994,
    director: '弗兰克·德拉邦特',
    categories: ['剧情', '犯罪'],
    rating: 9.7,
    description: '银行家安迪蒙冤入狱，在肖申克监狱的十九年里，他用一把小锤凿穿高墙，用希望对抗体制化的绝望。当他在暴雨中张开双臂，自由的光芒照亮了每一个被生活困住的人。',
    quote: '希望是美好的，也许是人间至善。',
    image: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?w=600&h=900&fit=crop',
  },
  {
    id: 'movie_8',
    title: '海蒂和爷爷',
    originalTitle: 'Heidi',
    year: 2015,
    director: '阿兰·葛斯彭纳',
    categories: ['剧情', '家庭'],
    rating: 9.3,
    description: '孤儿海蒂被送到阿尔卑斯山与孤僻的爷爷同住，她的纯真与善良融化了爷爷的心，也治愈了富家小姐克拉拉。阿尔卑斯山的壮丽风光与纯粹情感交织，是一部洗涤心灵的温暖之作。',
    quote: '阿尔卑斯的风，吹散所有阴霾。',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop',
  },
];

// ============================================
// 状态管理
// ============================================

/** 当前激活的分类筛选 */
let currentCategory = 'all';

/** 当前搜索关键词 */
let currentSearchQuery = '';

/** 收藏状态集合（Set 存储 movie id） */
let favoriteSet = new Set();

/** 防抖定时器 ID */
let debounceTimerId = null;

/** IntersectionObserver 实例 */
let scrollObserver = null;

// ============================================
// DOM 元素引用
// ============================================

/** 电影网格容器 */
let movieGridEl = null;

/** 搜索输入框 */
let searchInputEl = null;

/** 分类筛选按钮容器 */
let categoryFiltersEl = null;

/** 空状态提示 */
let emptyStateEl = null;

/** 结果计数 */
let resultCountEl = null;

/** 回到顶部按钮 */
let backToTopEl = null;

/** 移动端菜单按钮 */
let mobileMenuBtnEl = null;

/** 移动端菜单 */
let mobileMenuEl = null;

// ============================================
// 工具函数
// ============================================

/**
 * 从 localStorage 读取收藏数据
 * @returns {Set<string>} 收藏的电影 ID 集合
 */
function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
    return new Set();
  } catch (error) {
    console.warn('读取收藏数据失败:', error);
    return new Set();
  }
}

/**
 * 将收藏数据写入 localStorage
 * @param {Set<string>} favorites - 收藏的电影 ID 集合
 */
function saveFavoritesToStorage(favorites) {
  try {
    const array = Array.from(favorites);
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(array));
  } catch (error) {
    console.warn('保存收藏数据失败:', error);
  }
}

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
  return function (...args) {
    if (debounceTimerId) {
      clearTimeout(debounceTimerId);
    }
    debounceTimerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 获取分类标签对应的 CSS 类名
 * @param {string} tag - 分类名称
 * @returns {string} CSS 类名
 */
function getTagClass(tag) {
  return TAG_CLASS_MAP[tag] || 'tag-drama';
}

/**
 * 检查电影是否属于某个主分类
 * @param {Object} movie - 电影对象
 * @param {string} category - 主分类名称
 * @returns {boolean}
 */
function movieHasCategory(movie, category) {
  return movie.categories.includes(category);
}

/**
 * 过滤电影列表
 * @returns {Array<Object>} 过滤后的电影数组
 */
function filterMovies() {
  return MOVIES_DATA.filter((movie) => {
    // 分类过滤
    const categoryMatch =
      currentCategory === 'all' || movieHasCategory(movie, currentCategory);

    if (!categoryMatch) {
      return false;
    }

    // 搜索过滤
    if (!currentSearchQuery) {
      return true;
    }

    const query = currentSearchQuery.toLowerCase();
    const titleMatch = movie.title.toLowerCase().includes(query);
    const originalTitleMatch = movie.originalTitle.toLowerCase().includes(query);
    const descMatch = movie.description.toLowerCase().includes(query);
    const directorMatch = movie.director.toLowerCase().includes(query);

    return titleMatch || originalTitleMatch || descMatch || directorMatch;
  });
}

// ============================================
// 渲染函数
// ============================================

/**
 * 渲染单张电影卡片 HTML
 * @param {Object} movie - 电影数据对象
 * @returns {string} HTML 字符串
 */
function renderMovieCard(movie) {
  const isFavorite = favoriteSet.has(movie.id);
  const favoriteClass = isFavorite ? 'text-red-500 is-favorite' : 'text-gray-400';
  const favoriteFill = isFavorite ? 'currentColor' : 'none';
  const favoriteStroke = isFavorite ? 'currentColor' : 'currentColor';
  const favoriteLabel = isFavorite ? `取消收藏《${movie.title}》` : `收藏《${movie.title}》`;

  // 生成分类标签 HTML
  const tagsHtml = movie.categories
    .map((cat) => {
      const tagClass = getTagClass(cat);
      return `<span class="inline-block px-2 py-0.5 rounded text-xs font-medium ${tagClass}">${cat}</span>`;
    })
    .join('');

  return `
    <article class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-card-inner bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
        <!-- 电影配图 -->
        <div class="movie-image-wrapper is-loading">
          <img
            src="${movie.image}"
            alt="${movie.title} 电影海报"
            loading="lazy"
            onload="this.parentElement.classList.remove('is-loading')"
            onerror="this.parentElement.classList.remove('is-loading'); this.src='https://placehold.co/600x900/e5e7eb/9ca3af?text=${encodeURIComponent(movie.title)}'"
          >
          <!-- 收藏按钮 -->
          <button
            type="button"
            class="favorite-btn absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md ${favoriteClass}"
            aria-label="${favoriteLabel}"
            aria-pressed="${isFavorite}"
            data-movie-id="${movie.id}"
          >
            <svg class="w-5 h-5" fill="${favoriteFill}" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <!-- 评分徽章 -->
          <div class="absolute bottom-3 left-3">
            <span class="rating-badge rating-high">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              ${movie.rating}
            </span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="p-4 flex flex-col flex-1">
          <h3 class="movie-title text-lg font-bold text-gray-900 mb-1 line-clamp-1" title="${movie.title}">
            ${movie.title}
          </h3>
          <p class="text-xs text-gray-500 mb-2">
            ${movie.originalTitle} · ${movie.year} · ${movie.director}
          </p>
          <p class="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3 flex-1">
            ${movie.description}
          </p>
          <div class="flex items-center justify-between mt-auto">
            <div class="flex flex-wrap gap-1.5">
              ${tagsHtml}
            </div>
          </div>
          <p class="mt-3 text-xs text-amber-600 font-medium italic border-t border-gray-100 pt-2">
            "${movie.quote}"
          </p>
        </div>
      </div>
    </article>
  `;
}

/**
 * 渲染电影列表
 * @param {Array<Object>} movies - 要渲染的电影数组
 */
function renderMovieList(movies) {
  if (!movieGridEl || !emptyStateEl || !resultCountEl) {
    return;
  }

  // 更新结果计数
  resultCountEl.textContent = `共 ${movies.length} 部`;

  if (movies.length === 0) {
    movieGridEl.innerHTML = '';
    emptyStateEl.classList.remove('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');
  movieGridEl.innerHTML = movies.map(renderMovieCard).join('');

  // 重新绑定收藏按钮事件
  bindFavoriteButtons();

  // 重新观察新渲染的卡片
  observeMovieCards();
}

/**
 * 更新分类按钮的高亮状态
 */
function updateCategoryButtons() {
  if (!categoryFiltersEl) {
    return;
  }

  const buttons = categoryFiltersEl.querySelectorAll('.category-btn');
  buttons.forEach((btn) => {
    const category = btn.dataset.category;
    const isActive = category === currentCategory;

    if (isActive) {
      btn.classList.remove('bg-white/10', 'text-gray-300', 'hover:bg-white/20', 'border', 'border-gray-600/50');
      btn.classList.add('bg-amber-500', 'text-gray-900', 'shadow-lg', 'shadow-amber-500/25');
    } else {
      btn.classList.remove('bg-amber-500', 'text-gray-900', 'shadow-lg', 'shadow-amber-500/25');
      btn.classList.add('bg-white/10', 'text-gray-300', 'hover:bg-white/20', 'border', 'border-gray-600/50');
    }
  });
}

// ============================================
// 事件处理
// ============================================

/**
 * 处理搜索输入
 * @param {Event} event - input 事件对象
 */
function handleSearchInput(event) {
  const value = event.target.value.trim();
  currentSearchQuery = value;
  const filtered = filterMovies();
  renderMovieList(filtered);
}

/**
 * 处理分类按钮点击
 * @param {Event} event - click 事件对象
 */
function handleCategoryClick(event) {
  const button = event.target.closest('.category-btn');
  if (!button) {
    return;
  }

  const category = button.dataset.category;
  if (!category || category === currentCategory) {
    return;
  }

  currentCategory = category;
  updateCategoryButtons();

  const filtered = filterMovies();
  renderMovieList(filtered);
}

/**
 * 处理收藏按钮点击
 * @param {Event} event - click 事件对象
 */
function handleFavoriteClick(event) {
  const button = event.target.closest('.favorite-btn');
  if (!button) {
    return;
  }

  const movieId = button.dataset.movieId;
  if (!movieId) {
    return;
  }

  const isFavorite = favoriteSet.has(movieId);

  if (isFavorite) {
    favoriteSet.delete(movieId);
    button.classList.remove('text-red-500', 'is-favorite');
    button.classList.add('text-gray-400');
    button.setAttribute('aria-pressed', 'false');
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    if (movie) {
      button.setAttribute('aria-label', `收藏《${movie.title}》`);
    }
    // 移除动画类以便下次重新触发
    button.addEventListener(
      'animationend',
      () => button.classList.remove('is-favorite'),
      { once: true }
    );
  } else {
    favoriteSet.add(movieId);
    button.classList.remove('text-gray-400');
    button.classList.add('text-red-500', 'is-favorite');
    button.setAttribute('aria-pressed', 'true');
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    if (movie) {
      button.setAttribute('aria-label', `取消收藏《${movie.title}》`);
    }
  }

  saveFavoritesToStorage(favoriteSet);
}

/**
 * 处理回到顶部按钮点击
 */
function handleBackToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 处理滚动事件（显示/隐藏回到顶部按钮）
 */
function handleScroll() {
  if (!backToTopEl) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop > 400) {
    backToTopEl.classList.add('is-visible');
  } else {
    backToTopEl.classList.remove('is-visible');
  }
}

/**
 * 处理移动端菜单切换
 */
function handleMobileMenuToggle() {
  if (!mobileMenuEl || !mobileMenuBtnEl) {
    return;
  }

  const isExpanded = mobileMenuEl.classList.contains('hidden') === false;
  if (isExpanded) {
    mobileMenuEl.classList.add('hidden');
    mobileMenuBtnEl.setAttribute('aria-expanded', 'false');
  } else {
    mobileMenuEl.classList.remove('hidden');
    mobileMenuBtnEl.setAttribute('aria-expanded', 'true');
  }
}

// ============================================
// 动效相关
// ============================================

/**
 * 初始化 IntersectionObserver 用于滚动渐入动效
 */
function initScrollObserver() {
  if (!window.IntersectionObserver) {
    // 浏览器不支持时静默降级，直接显示所有卡片
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // 仅首次触发，触发后取消观察
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    }
  );
}

/**
 * 观察所有电影卡片元素
 */
function observeMovieCards() {
  if (!scrollObserver) {
    return;
  }

  const cards = document.querySelectorAll('.movie-card');
  cards.forEach((card) => {
    scrollObserver.observe(card);
  });
}

// ============================================
// 事件绑定
// ============================================

/**
 * 绑定收藏按钮点击事件
 */
function bindFavoriteButtons() {
  const buttons = document.querySelectorAll('.favorite-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleFavoriteClick);
  });
}

/**
 * 绑定所有事件监听器
 */
function bindEvents() {
  // 搜索输入（防抖）
  if (searchInputEl) {
    searchInputEl.addEventListener('input', debounce(handleSearchInput, DEBOUNCE_DELAY));
  }

  // 分类筛选
  if (categoryFiltersEl) {
    categoryFiltersEl.addEventListener('click', handleCategoryClick);
  }

  // 回到顶部
  if (backToTopEl) {
    backToTopEl.addEventListener('click', handleBackToTop);
  }

  // 滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true });

  // 移动端菜单
  if (mobileMenuBtnEl) {
    mobileMenuBtnEl.addEventListener('click', handleMobileMenuToggle);
  }
}

// ============================================
// 初始化
// ============================================

/**
 * 获取 DOM 元素引用
 */
function cacheElements() {
  movieGridEl = document.getElementById('movie-grid');
  searchInputEl = document.getElementById('search-input');
  categoryFiltersEl = document.getElementById('category-filters');
  emptyStateEl = document.getElementById('empty-state');
  resultCountEl = document.getElementById('result-count');
  backToTopEl = document.getElementById('back-to-top');
  mobileMenuBtnEl = document.getElementById('mobile-menu-btn');
  mobileMenuEl = document.getElementById('mobile-menu');
}

/**
 * 应用初始化
 */
function init() {
  // 缓存 DOM 引用
  cacheElements();

  // 从 localStorage 加载收藏数据
  favoriteSet = loadFavoritesFromStorage();

  // 初始化滚动观察器
  initScrollObserver();

  // 绑定事件
  bindEvents();

  // 初始渲染全部电影
  renderMovieList(MOVIES_DATA);

  // 初始化回到顶部按钮状态
  handleScroll();

  console.log('影荐墙初始化完成');
}

// DOM 加载完成后执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
