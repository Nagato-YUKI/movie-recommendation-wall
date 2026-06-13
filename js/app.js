/**
 * 影荐墙 - 主逻辑脚本
 * 功能：数据管理、渲染、搜索、筛选、排序、分页、收藏、点赞、评分、留言、Lightbox、懒加载、动效、主题切换、导出
 * 数据来源：js/data.js（全局变量 MOVIES_DATA）
 */

// ============================================
// 常量定义
// ============================================

/** localStorage 收藏数据的键名 */
const STORAGE_KEY_FAVORITES = 'movie_favorites';

/** localStorage 留言数据的键名 */
const STORAGE_KEY_MESSAGES = 'movie_messages';

/** localStorage 点赞数据的键名 */
const STORAGE_KEY_LIKES = 'movie_likes';

/** localStorage 评分数据的键名 */
const STORAGE_KEY_RATINGS = 'movie_ratings';

/** localStorage 主题偏好的键名 */
const THEME_STORAGE_KEY = 'theme_preference';

/** 防抖延迟时间（毫秒） */
const DEBOUNCE_DELAY = 200;

/** 每页显示电影数量 */
const PER_PAGE = 24;

/** 经典地区列表（用于"其他"地区归类） */
const KNOWN_REGIONS = ['美国', '英国', '日本', '韩国', '中国', '法国', '印度', '德国'];

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
  '爱情': 'tag-love',
  '喜剧': 'tag-comedy',
  '战争': 'tag-war',
  '传记': 'tag-biography',
  '历史': 'tag-history',
  '音乐': 'tag-music',
  '恐怖': 'tag-horror',
  '纪录片': 'tag-documentary',
  '运动': 'tag-sport',
};

/** 分类主标签列表（用于筛选） */
const MAIN_CATEGORIES = [
  '科幻', '悬疑', '动画', '剧情', '爱情', '喜剧', '战争', '传记', '历史',
  '冒险', '惊悚', '犯罪', '奇幻', '动作', '家庭', '音乐', '恐怖', '纪录片', '运动',
];

// ============================================
// 状态管理
// ============================================

/** 当前激活的分类筛选 */
let currentCategory = 'all';

/** 当前搜索关键词 */
let currentSearchQuery = '';

/** 当前排序字段 */
let currentSort = 'rank';

/** 当前排序方向（'asc' 或 'desc'） */
let sortOrder = 'desc';

/** 年份区间最小值 */
let yearMin = 2000;

/** 年份区间最大值 */
let yearMax = 2025;

/** 当前激活的地区筛选 */
let currentRegion = 'all';

/** 当前页码（从 1 开始） */
let currentPage = 1;

/** 收藏状态集合（Set 存储 movie id） */
let favoriteSet = new Set();

/** 点赞状态集合（Set 存储 movie id） */
let likeSet = new Set();

/** 用户评分映射（movie id -> rating） */
let ratingMap = {};

/** 点赞计数映射（movie id -> count） */
let likeCounts = {};

/** 防抖定时器 ID */
let debounceTimerId = null;

/** IntersectionObserver 实例 */
let scrollObserver = null;

/** 留言数组 */
let messages = [];

/** Lightbox 当前显示的电影索引 */
let lightboxCurrentIndex = -1;

/** 当前打开的弹窗电影 ID */
let currentModalMovieId = null;

/** 弹窗正在打开的防抖标记（防止双击时 overlay 误触关闭） */
let modalIsOpening = false;

/** 弹窗关闭流程标记（防止竞态：旧 transitionend 误关新弹窗） */
let modalCloseTimer = null;

/** 图片懒加载 IntersectionObserver 实例 */
let lazyImageObserver = null;

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

/** 留言板表单 */
let messageFormEl = null;

/** 留言昵称输入框 */
let messageNicknameEl = null;

/** 留言内容输入框 */
let messageContentEl = null;

/** 留言列表容器 */
let messageListEl = null;

/** 滚动进度条 */
let scrollProgressEl = null;

/** Lightbox 覆盖层 */
let lightboxOverlayEl = null;

/** Lightbox 图片元素 */
let lightboxImageEl = null;

/** Lightbox 标题元素 */
let lightboxCaptionEl = null;

/** Lightbox 关闭按钮 */
let lightboxCloseEl = null;

/** Lightbox 上一张按钮 */
let lightboxPrevEl = null;

/** Lightbox 下一张按钮 */
let lightboxNextEl = null;

/** 电影详情弹窗覆盖层 */
let movieModalOverlayEl = null;

/** 电影详情弹窗内容容器 */
let movieModalContentEl = null;

/** 电影详情弹窗关闭按钮 */
let movieModalCloseEl = null;

/** 电影详情弹窗海报元素 */
let movieModalPosterEl = null;

/** 电影详情弹窗放大查看按钮 */
let movieModalZoomEl = null;

/** 电影详情弹窗标题元素 */
let movieModalTitleEl = null;

/** 电影详情弹窗原名元素 */
let movieModalOriginalTitleEl = null;

/** 电影详情弹窗导演元素 */
let movieModalDirectorEl = null;

/** 电影详情弹窗主演元素 */
let movieModalCastEl = null;

/** 电影详情弹窗年份元素 */
let movieModalYearEl = null;

/** 电影详情弹窗评分徽章元素 */
let movieModalRatingBadgeEl = null;

/** 电影详情弹窗用户评分元素 */
let movieModalUserRatingEl = null;

/** 电影详情弹窗分类元素 */
let movieModalCategoriesEl = null;

/** 电影详情弹窗描述元素 */
let movieModalDescriptionEl = null;

/** 电影详情弹窗台词元素 */
let movieModalQuoteEl = null;

/** 电影详情弹窗外部链接容器 */
let movieModalWatchLinksEl = null;

// ---- 新增 DOM 引用 ----

/** 统计面板：电影总数 */
let statCountEl = null;

/** 统计面板：类型数量 */
let statGenresEl = null;

/** 统计面板：平均评分 */
let statAvgRatingEl = null;

/** 统计面板：年份范围 */
let statYearRangeEl = null;

/** 排序下拉选择器 */
let sortSelectEl = null;

/** 排序方向切换按钮 */
let sortOrderBtnEl = null;

/** 排序方向图标 */
let sortOrderIconEl = null;

/** 排序方向文字 */
let sortOrderLabelEl = null;

/** 年份区间最小滑块 */
let yearRangeMinEl = null;

/** 年份区间最大滑块 */
let yearRangeMaxEl = null;

/** 年份区间标签 */
let yearRangeLabelEl = null;

/** 地区筛选按钮容器 */
let regionFiltersEl = null;

/** 分页：上一页按钮 */
let paginationPrevEl = null;

/** 分页：下一页按钮 */
let paginationNextEl = null;

/** 分页：页码容器 */
let paginationPagesEl = null;

/** 分页：信息文字 */
let paginationInfoEl = null;

/** 导出清单按钮 */
let exportBtnEl = null;

/** 主题切换按钮（桌面端） */
let themeToggleEl = null;

/** 主题切换按钮（移动端） */
let themeToggleMobileEl = null;

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
 * 从 localStorage 读取留言数据
 * @returns {Array<Object>} 留言数组
 */
function loadMessagesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('读取留言数据失败:', error);
    return [];
  }
}

/**
 * 将留言数据写入 localStorage
 * @param {Array<Object>} msgs - 留言数组
 */
function saveMessagesToStorage(msgs) {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
  } catch (error) {
    console.warn('保存留言数据失败:', error);
  }
}

/**
 * 从 localStorage 读取点赞数据
 * @returns {Set<string>} 点赞的电影 ID 集合
 */
function loadLikesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKES);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
    return new Set();
  } catch (error) {
    console.warn('读取点赞数据失败:', error);
    return new Set();
  }
}

/**
 * 将点赞数据写入 localStorage
 * @param {Set<string>} likes - 点赞的电影 ID 集合
 */
function saveLikesToStorage(likes) {
  try {
    const array = Array.from(likes);
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(array));
  } catch (error) {
    console.warn('保存点赞数据失败:', error);
  }
}

/**
 * 从 localStorage 读取评分数据
 * @returns {Object} 评分映射对象
 */
function loadRatingsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATINGS);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (error) {
    console.warn('读取评分数据失败:', error);
    return {};
  }
}

/**
 * 将评分数据写入 localStorage
 * @param {Object} ratings - 评分映射对象
 */
function saveRatingsToStorage(ratings) {
  try {
    localStorage.setItem(STORAGE_KEY_RATINGS, JSON.stringify(ratings));
  } catch (error) {
    console.warn('保存评分数据失败:', error);
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

// ============================================
// 数据统计
// ============================================

/**
 * 计算并渲染数据统计面板
 */
function calculateStats() {
  if (!statCountEl || !statGenresEl || !statAvgRatingEl || !statYearRangeEl) {
    return;
  }

  // 电影总数
  statCountEl.textContent = MOVIES_DATA.length;

  // 类型数量（去重）
  const genreSet = new Set();
  MOVIES_DATA.forEach((movie) => {
    movie.categories.forEach((cat) => genreSet.add(cat));
  });
  statGenresEl.textContent = genreSet.size;

  // 平均评分（一位小数）
  const totalRating = MOVIES_DATA.reduce((sum, movie) => sum + movie.rating, 0);
  const avgRating = (totalRating / MOVIES_DATA.length).toFixed(1);
  statAvgRatingEl.textContent = avgRating;

  // 年份范围
  const years = MOVIES_DATA.map((movie) => movie.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  statYearRangeEl.textContent = `${minYear}-${maxYear}`;

  console.log('数据统计面板已更新：', {
    总数: MOVIES_DATA.length,
    类型数: genreSet.size,
    平均分: avgRating,
    年份范围: `${minYear}-${maxYear}`,
  });
}

// ============================================
// 排名徽章
// ============================================

/**
 * 获取排名徽章的样式类名
 * @param {number} rank - 排名（1-100）
 * @returns {{ bgClass: string, textClass: string }}
 */
function getRankBadgeStyle(rank) {
  if (rank === 1) {
    return { bgClass: 'bg-amber-500/90', textClass: 'text-white' };
  }
  if (rank <= 3) {
    return { bgClass: 'bg-gray-300/80', textClass: 'text-gray-800' };
  }
  return { bgClass: 'bg-gray-500/70', textClass: 'text-white' };
}

// ============================================
// 排序功能
// ============================================

/**
 * 对电影数组进行排序
 * @param {Array<Object>} movies - 电影数组
 * @returns {Array<Object>} 排序后的新数组
 */
function sortMovies(movies) {
  const sorted = [...movies];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (currentSort) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'year':
        comparison = a.year - b.year;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title, 'zh');
        break;
      default:
        comparison = a.rank - b.rank;
    }

    // 如果主排序字段相同，按 rank 作为次要排序
    if (comparison === 0 && currentSort !== 'rank') {
      comparison = a.rank - b.rank;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * 处理排序方式变更
 */
function handleSortChange() {
  if (!sortSelectEl) {
    return;
  }
  currentSort = sortSelectEl.value;
  currentPage = 1;
  refreshMovieDisplay();
  console.log('排序方式切换为:', currentSort, '方向:', sortOrder);
}

/**
 * 处理排序方向切换
 */
function handleSortOrderToggle() {
  sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';

  if (sortOrderIconEl) {
    sortOrderIconEl.innerHTML = sortOrder === 'asc' ? '&uarr;' : '&darr;';
  }
  if (sortOrderLabelEl) {
    sortOrderLabelEl.textContent = sortOrder === 'asc' ? '升序' : '降序';
  }

  currentPage = 1;
  refreshMovieDisplay();
  console.log('排序方向切换为:', sortOrder);
}

// ============================================
// 年份区间筛选
// ============================================

/**
 * 处理年份区间变更
 */
function handleYearRangeChange() {
  if (!yearRangeMinEl || !yearRangeMaxEl || !yearRangeLabelEl) {
    return;
  }

  let min = parseInt(yearRangeMinEl.value, 10);
  let max = parseInt(yearRangeMaxEl.value, 10);

  // 确保 min <= max
  if (min > max) {
    if (yearRangeMinEl === document.activeElement) {
      yearRangeMaxEl.value = min;
      max = min;
    } else {
      yearRangeMinEl.value = max;
      min = max;
    }
  }

  yearMin = min;
  yearMax = max;
  yearRangeLabelEl.textContent = `${yearMin} - ${yearMax}`;

  currentPage = 1;
  refreshMovieDisplay();
}

// ============================================
// 地区筛选
// ============================================

/**
 * 更新地区筛选按钮的高亮状态
 */
function updateRegionButtons() {
  if (!regionFiltersEl) {
    return;
  }

  const buttons = regionFiltersEl.querySelectorAll('.region-btn');
  buttons.forEach((btn) => {
    const region = btn.dataset.region;
    const isActive = region === currentRegion;

    if (isActive) {
      btn.classList.remove('bg-white/10', 'text-gray-300', 'hover:bg-white/20', 'border', 'border-gray-600/50');
      btn.classList.add('bg-amber-500', 'text-gray-900', 'shadow-lg', 'shadow-amber-500/25');
    } else {
      btn.classList.remove('bg-amber-500', 'text-gray-900', 'shadow-lg', 'shadow-amber-500/25');
      btn.classList.add('bg-white/10', 'text-gray-300', 'hover:bg-white/20', 'border', 'border-gray-600/50');
    }
  });
}

/**
 * 处理地区按钮点击
 * @param {Event} event - click 事件对象
 */
function handleRegionClick(event) {
  const button = event.target.closest('.region-btn');
  if (!button) {
    return;
  }

  const region = button.dataset.region;
  if (!region || region === currentRegion) {
    return;
  }

  currentRegion = region;
  updateRegionButtons();
  currentPage = 1;
  refreshMovieDisplay();
  console.log('地区筛选切换为:', currentRegion);
}

// ============================================
// 筛选核心逻辑
// ============================================

/**
 * 过滤电影列表（分类 + 搜索 + 年份区间 + 地区）
 * @returns {Array<Object>} 过滤后的电影数组
 */
/**
 * 文本规范化：移除标点符号和特殊字符，转小写
 * @param {string} str - 原始文本
 * @returns {string} 规范化后的文本
 */
function normalizeText(str) {
  return str
    .toLowerCase()
    .replace(/[·•‧・･—\-—\s,，、。．.：:；;！!？?()（）【】\[\]《》""''""'']/g, '');
}

/**
 * 模糊匹配：检查 query 中的字符是否按顺序出现在 target 中
 * @param {string} query - 搜索关键词
 * @param {string} target - 被搜索文本
 * @returns {boolean} 是否匹配
 */
function fuzzyMatch(query, target) {
  const q = normalizeText(query);
  const t = normalizeText(target);

  if (!q) return true;

  // 1. 直接包含匹配（规范化后）
  if (t.includes(q)) {
    return true;
  }

  // 2. 顺序字符匹配：query 的每个字符按顺序出现在 target 中
  //    允许中间跳过字符，容忍缺字和错字
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
    }
  }
  if (qi === q.length) {
    return true;
  }

  // 3. 反向顺序匹配（用户可能把字序写反）
  qi = 0;
  for (let ti = t.length - 1; ti >= 0 && qi < q.length; ti--) {
    if (t[ti] === q[qi]) {
      qi++;
    }
  }
  return qi === q.length;
}

function filterMovies() {
  return MOVIES_DATA.filter((movie) => {
    // 分类过滤
    const categoryMatch =
      currentCategory === 'all' || movieHasCategory(movie, currentCategory);

    if (!categoryMatch) {
      return false;
    }

    // 搜索过滤（模糊匹配）
    if (currentSearchQuery) {
      const query = currentSearchQuery.toLowerCase();
      const titleMatch = fuzzyMatch(query, movie.title);
      const originalTitleMatch = fuzzyMatch(query, movie.originalTitle);
      const descMatch = fuzzyMatch(query, movie.description);
      const directorMatch = fuzzyMatch(query, movie.director);

      if (!(titleMatch || originalTitleMatch || descMatch || directorMatch)) {
        return false;
      }
    }

    // 年份区间过滤
    if (movie.year < yearMin || movie.year > yearMax) {
      return false;
    }

    // 地区过滤
    if (currentRegion !== 'all') {
      if (currentRegion === '其他') {
        // "其他" 匹配不在经典地区列表中的所有地区
        if (KNOWN_REGIONS.includes(movie.region)) {
          return false;
        }
      } else {
        if (movie.region !== currentRegion) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * 统一刷新显示（筛选 + 排序 + 分页后渲染）
 */
function refreshMovieDisplay() {
  const filtered = filterMovies();
  const sorted = sortMovies(filtered);
  const paginated = paginateMovies(sorted);
  renderMovieList(paginated);
  renderPagination(sorted.length, currentPage);
}

// ============================================
// 分页功能
// ============================================

/**
 * 从电影数组中截取当前页的电影
 * @param {Array<Object>} movies - 过滤并排序后的电影数组
 * @returns {Array<Object>} 当前页的电影数组
 */
function paginateMovies(movies) {
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  return movies.slice(startIndex, endIndex);
}

/**
 * 渲染分页器
 * @param {number} totalItems - 总电影数量
 * @param {number} page - 当前页码
 */
function renderPagination(totalItems, page) {
  if (!paginationPrevEl || !paginationNextEl || !paginationPagesEl || !paginationInfoEl) {
    return;
  }

  const totalPages = Math.ceil(totalItems / PER_PAGE) || 1;

  // 更新信息文字
  paginationInfoEl.textContent = `第 ${page} 页 / 共 ${totalPages} 页`;

  // 更新上一页/下一页按钮状态
  paginationPrevEl.disabled = page <= 1;
  paginationNextEl.disabled = page >= totalPages;

  // 渲染页码按钮
  let pagesHtml = '';

  // 计算显示的页码范围（最多显示 7 个页码按钮）
  let startPage = Math.max(1, page - 3);
  let endPage = Math.min(totalPages, page + 3);

  // 调整范围确保始终显示 7 个（如果总数够的话）
  if (endPage - startPage < 6) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 6);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 6);
    }
  }

  // 第一页
  if (startPage > 1) {
    pagesHtml += `<button type="button" class="pagination-page-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" data-page="1" aria-label="第1页">1</button>`;
    if (startPage > 2) {
      pagesHtml += `<span class="px-1 text-gray-400 text-sm">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === page;
    const activeClass = isActive
      ? 'bg-amber-500 text-white shadow-md'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    pagesHtml += `<button type="button" class="pagination-page-btn px-3 py-1.5 rounded-lg text-sm font-medium ${activeClass} transition-colors" data-page="${i}" aria-label="第${i}页" ${isActive ? 'aria-current="page"' : ''}>${i}</button>`;
  }

  // 最后一页
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pagesHtml += `<span class="px-1 text-gray-400 text-sm">...</span>`;
    }
    pagesHtml += `<button type="button" class="pagination-page-btn px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" data-page="${totalPages}" aria-label="第${totalPages}页">${totalPages}</button>`;
  }

  paginationPagesEl.innerHTML = pagesHtml;

  // 绑定页码按钮点击事件
  const pageButtons = paginationPagesEl.querySelectorAll('.pagination-page-btn');
  pageButtons.forEach((btn) => {
    btn.addEventListener('click', handlePageClick);
  });
}

/**
 * 处理页码按钮点击
 * @param {Event} event - click 事件对象
 */
function handlePageClick(event) {
  const button = event.target.closest('.pagination-page-btn');
  if (!button) {
    return;
  }

  const page = parseInt(button.dataset.page, 10);
  if (!page || page === currentPage) {
    return;
  }

  currentPage = page;
  refreshMovieDisplay();

  // 平滑滚动到电影列表区域
  const movieSection = document.getElementById('movie-section');
  if (movieSection) {
    movieSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  console.log('切换到第', currentPage, '页');
}

/**
 * 处理上一页按钮点击
 */
function handlePaginationPrev() {
  if (currentPage <= 1) {
    return;
  }
  currentPage -= 1;
  refreshMovieDisplay();

  const movieSection = document.getElementById('movie-section');
  if (movieSection) {
    movieSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * 处理下一页按钮点击
 */
function handlePaginationNext() {
  const filtered = filterMovies();
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  if (currentPage >= totalPages) {
    return;
  }
  currentPage += 1;
  refreshMovieDisplay();

  const movieSection = document.getElementById('movie-section');
  if (movieSection) {
    movieSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================
// 主题切换
// ============================================

/**
 * 获取当前主题
 * @returns {'dark'|'light'}
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

/**
 * 应用主题到 DOM
 * @param {'dark'|'light'} theme - 主题名称
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons(theme);
}

/**
 * 更新主题切换按钮中的图标
 * @param {'dark'|'light'} theme - 当前主题
 */
function updateThemeIcons(theme) {
  // 暗色模式显示月亮图标，亮色模式显示太阳图标
  const moonIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  const sunIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;

  const iconHtml = theme === 'dark' ? moonIcon : sunIcon;
  const label = theme === 'dark' ? '切换亮色主题' : '切换暗色主题';

  if (themeToggleEl) {
    themeToggleEl.innerHTML = iconHtml;
    themeToggleEl.setAttribute('aria-label', label);
  }
  if (themeToggleMobileEl) {
    // 移动端按钮中有文字，需要保留"切换主题"文字
    themeToggleMobileEl.innerHTML = `${iconHtml} 切换主题`;
    themeToggleMobileEl.setAttribute('aria-label', label);
  }
}

/**
 * 处理主题切换
 */
function handleThemeToggle() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  applyTheme(newTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  } catch (error) {
    console.warn('保存主题偏好失败:', error);
  }

  console.log('主题切换为:', newTheme);
}

/**
 * 初始化主题（从 localStorage 读取偏好）
 */
function initTheme() {
  let theme = 'dark'; // 默认暗色

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      theme = stored;
    }
  } catch (error) {
    console.warn('读取主题偏好失败:', error);
  }

  applyTheme(theme);
  console.log('主题初始化:', theme);
}

// ============================================
// 导出清单
// ============================================

/**
 * 处理导出清单按钮点击
 */
function handleExport() {
  const filtered = filterMovies();
  const sorted = sortMovies(filtered);

  if (sorted.length === 0) {
    showToast('没有可导出的电影');
    return;
  }

  // 格式：排名. 中文片名（英文片名） - 评分/10 - 年份
  const lines = sorted.map((movie) => {
    return `${movie.rank}. ${movie.title}（${movie.originalTitle}） - ${movie.rating}/10 - ${movie.year}`;
  });

  const text = lines.join('\n');

  copyToClipboard(text, `已复制 ${sorted.length} 部电影清单到剪贴板`);
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {string} successMessage - 成功提示消息
 */
function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

/**
 * 兜底复制方案（使用 textarea）
 * @param {string} text - 要复制的文本
 * @param {string} successMessage - 成功提示消息
 */
function fallbackCopy(text, successMessage) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('复制失败，请手动复制');
  }
  document.body.removeChild(textarea);
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
  const favoriteLabel = isFavorite ? `取消收藏《${movie.title}》` : `收藏《${movie.title}》`;

  const isLiked = likeSet.has(movie.id);
  const likeClass = isLiked ? 'text-amber-500 is-liked' : 'text-gray-400';
  const likeCount = likeCounts[movie.id] || 0;

  const userRating = ratingMap[movie.id] || 0;
  const starsHtml = [1, 2, 3, 4, 5].map((star) => {
    const filled = star <= userRating;
    return `<button type="button" class="star-btn ${filled ? 'is-filled' : 'is-empty'}" data-movie-id="${movie.id}" data-star="${star}" aria-label="${star}星">
      <svg class="w-4 h-4" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    </button>`;
  }).join('');

  // 生成分类标签 HTML
  const tagsHtml = movie.categories
    .map((cat) => {
      const tagClass = getTagClass(cat);
      return `<span class="inline-block px-2 py-0.5 rounded text-xs font-medium ${tagClass}">${cat}</span>`;
    })
    .join('');

  // 排名徽章
  const rankBadgeStyle = getRankBadgeStyle(movie.rank);
  const rankBadgeHtml = `
    <div class="rank-badge absolute top-2 left-2 z-10 flex items-center justify-center w-8 h-8 rounded-full ${rankBadgeStyle.bgClass} ${rankBadgeStyle.textClass} text-xs font-bold shadow-md backdrop-blur-sm" title="排名 #${movie.rank}" aria-label="排名第${movie.rank}">
      #${movie.rank}
    </div>`;

  return `
    <article class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-card-inner bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
        <!-- 电影配图 -->
        <div class="movie-image-wrapper is-loading">
          <img
            class="lazy-image"
            data-src="${movie.image}"
            alt="${movie.title} 电影海报"
            onload="this.parentElement.classList.remove('is-loading')"
            onerror="this.parentElement.classList.remove('is-loading'); this.src='https://placehold.co/600x900/e5e7eb/9ca3af?text=${encodeURIComponent(movie.title)}'"
          >
          ${rankBadgeHtml}
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
          <!-- 分享按钮 -->
          <button
            type="button"
            class="share-btn absolute top-3 right-12 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-gray-400 hover:text-amber-500"
            aria-label="分享《${movie.title}》"
            data-movie-id="${movie.id}"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
          <!-- 点赞按钮 -->
          <button
            type="button"
            class="like-btn absolute top-3 left-12 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md ${likeClass}"
            aria-label="点赞《${movie.title}》"
            aria-pressed="${isLiked}"
            data-movie-id="${movie.id}"
          >
            <svg class="w-5 h-5" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <span class="like-count text-xs font-bold ml-0.5">${likeCount}</span>
          </button>
          <!-- 放大查看按钮 -->
          <button
            type="button"
            class="lightbox-trigger absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-gray-500 hover:text-amber-500"
            aria-label="放大查看《${movie.title}》海报"
            data-movie-id="${movie.id}"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
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
          <!-- 用户评分 -->
          <div class="star-rating flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
            <span class="text-xs text-gray-400 mr-1">我的评分:</span>
            ${starsHtml}
            ${userRating > 0 ? `<span class="text-xs text-amber-600 font-medium">${userRating}分</span>` : ''}
          </div>
          <p class="mt-2 text-xs text-amber-600 font-medium italic border-t border-gray-100 pt-2">
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

  // 更新结果计数（使用过滤后的总数，而非当前页数量）
  const filtered = filterMovies();
  resultCountEl.textContent = `共 ${filtered.length} 部`;

  if (movies.length === 0) {
    movieGridEl.innerHTML = '';
    emptyStateEl.classList.remove('hidden');
    // 隐藏分页器
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
    return;
  }

  emptyStateEl.classList.add('hidden');
  // 显示分页器
  const paginationContainer = document.getElementById('pagination-container');
  if (paginationContainer) {
    paginationContainer.style.display = '';
  }

  movieGridEl.innerHTML = movies.map(renderMovieCard).join('');

  // 重新绑定收藏按钮事件
  bindFavoriteButtons();

  // 重新绑定分享按钮事件
  bindShareButtons();

  // 重新绑定点赞按钮事件
  bindLikeButtons();

  // 重新绑定评分按钮事件
  bindRatingButtons();

  // 重新绑定卡片点击打开弹窗事件
  bindMovieCardClicks();

  // 重新观察新渲染的卡片
  observeMovieCards();

  // 重新观察懒加载图片
  observeLazyImages();
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

/**
 * 渲染留言列表
 */
function renderMessageList() {
  if (!messageListEl) {
    return;
  }

  if (messages.length === 0) {
    messageListEl.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <p>暂无留言，快来发表第一条留言吧！</p>
      </div>
    `;
    return;
  }

  const html = messages.slice().reverse().map((msg) => {
    const date = new Date(msg.timestamp);
    const timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `
      <div class="message-item">
        <div class="message-header">
          <span class="message-nickname">${escapeHtml(msg.nickname)}</span>
          <span class="message-time">${timeStr}</span>
        </div>
        <p class="message-content">${escapeHtml(msg.content)}</p>
      </div>
    `;
  }).join('');

  messageListEl.innerHTML = html;
}

/**
 * HTML 转义，防止 XSS
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
  currentPage = 1;
  refreshMovieDisplay();
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
  currentPage = 1;
  updateCategoryButtons();
  refreshMovieDisplay();
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
 * 处理点赞按钮点击
 * @param {Event} event - click 事件对象
 */
function handleLikeClick(event) {
  const button = event.target.closest('.like-btn');
  if (!button) {
    return;
  }

  const movieId = button.dataset.movieId;
  if (!movieId) {
    return;
  }

  const isLiked = likeSet.has(movieId);
  const countEl = button.querySelector('.like-count');

  if (isLiked) {
    likeSet.delete(movieId);
    button.classList.remove('text-amber-500', 'is-liked');
    button.classList.add('text-gray-400');
    button.setAttribute('aria-pressed', 'false');
    likeCounts[movieId] = Math.max(0, (likeCounts[movieId] || 0) - 1);
  } else {
    likeSet.add(movieId);
    button.classList.remove('text-gray-400');
    button.classList.add('text-amber-500', 'is-liked');
    button.setAttribute('aria-pressed', 'true');
    likeCounts[movieId] = (likeCounts[movieId] || 0) + 1;
  }

  if (countEl) {
    countEl.textContent = likeCounts[movieId] || 0;
  }

  saveLikesToStorage(likeSet);
}

/**
 * 处理评分按钮点击
 * @param {Event} event - click 事件对象
 */
function handleRatingClick(event) {
  const button = event.target.closest('.star-btn');
  if (!button) {
    return;
  }

  const movieId = button.dataset.movieId;
  const star = parseInt(button.dataset.star, 10);
  if (!movieId || !star) {
    return;
  }

  // 如果点击的是当前评分，则取消评分
  if (ratingMap[movieId] === star) {
    delete ratingMap[movieId];
  } else {
    ratingMap[movieId] = star;
  }

  saveRatingsToStorage(ratingMap);

  // 重新渲染
  refreshMovieDisplay();
}

/**
 * 处理留言提交
 * @param {Event} event - submit 事件对象
 */
function handleMessageSubmit(event) {
  event.preventDefault();

  if (!messageNicknameEl || !messageContentEl) {
    return;
  }

  const nickname = messageNicknameEl.value.trim();
  const content = messageContentEl.value.trim();

  if (!nickname) {
    showToast('请输入昵称');
    return;
  }

  if (!content) {
    showToast('请输入留言内容');
    return;
  }

  const message = {
    id: Date.now().toString(),
    nickname,
    content,
    timestamp: Date.now(),
  };

  messages.push(message);
  saveMessagesToStorage(messages);
  renderMessageList();

  messageNicknameEl.value = '';
  messageContentEl.value = '';
  showToast('留言提交成功！');
}

/**
 * 处理回到顶部按钮点击
 */
function handleBackToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 处理滚动事件（显示/隐藏回到顶部按钮、更新进度条）
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

  handleScrollProgress();
}

/**
 * 处理滚动进度条
 */
function handleScrollProgress() {
  if (!scrollProgressEl) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgressEl.style.width = `${progress}%`;
}

/**
 * 处理分享按钮点击
 * @param {Event} event - click 事件对象
 */
function handleShareClick(event) {
  const button = event.target.closest('.share-btn');
  if (!button) {
    return;
  }

  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('链接已复制到剪贴板');
    }).catch(() => {
      showToast('复制失败，请手动复制');
    });
  } else {
    showToast('复制失败，请手动复制');
  }
}

/**
 * 显示 Toast 通知
 * @param {string} message - 提示消息
 */
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2000);
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
// Lightbox 相关
// ============================================

/**
 * 打开 Lightbox 显示指定电影
 * @param {string} movieId - 电影 ID
 */
function openLightbox(movieId) {
  const index = MOVIES_DATA.findIndex((m) => m.id === movieId);
  if (index === -1) {
    return;
  }

  lightboxCurrentIndex = index;
  showLightboxAtIndex(index);
}

/**
 * 关闭 Lightbox
 */
function closeLightbox() {
  if (!lightboxOverlayEl) {
    return;
  }

  lightboxOverlayEl.classList.add('hidden');
  lightboxOverlayEl.classList.remove('active');
  lightboxCurrentIndex = -1;
}

/**
 * 在 Lightbox 中显示指定索引的电影
 * @param {number} index - 电影索引
 */
function showLightboxAtIndex(index) {
  if (!lightboxOverlayEl || !lightboxImageEl || !lightboxCaptionEl) {
    return;
  }

  const movie = MOVIES_DATA[index];
  if (!movie) {
    return;
  }

  // 使用更高分辨率的图片（将 w=600 替换为 w=1200）
  const highResImage = movie.image.replace('w=600', 'w=1200');
  lightboxImageEl.src = highResImage;
  lightboxImageEl.alt = `${movie.title} 电影海报`;
  lightboxCaptionEl.textContent = movie.title;

  lightboxOverlayEl.classList.remove('hidden');
  // 使用 requestAnimationFrame 确保 hidden 移除后再添加 active，触发过渡动画
  requestAnimationFrame(() => {
    lightboxOverlayEl.classList.add('active');
  });
}

/**
 * 处理 Lightbox 上一张
 */
function handleLightboxPrev() {
  if (lightboxCurrentIndex === -1) {
    return;
  }

  let newIndex = lightboxCurrentIndex - 1;
  if (newIndex < 0) {
    newIndex = MOVIES_DATA.length - 1;
  }
  lightboxCurrentIndex = newIndex;
  showLightboxAtIndex(newIndex);
}

/**
 * 处理 Lightbox 下一张
 */
function handleLightboxNext() {
  if (lightboxCurrentIndex === -1) {
    return;
  }

  let newIndex = lightboxCurrentIndex + 1;
  if (newIndex >= MOVIES_DATA.length) {
    newIndex = 0;
  }
  lightboxCurrentIndex = newIndex;
  showLightboxAtIndex(newIndex);
}

/**
 * 处理 Lightbox 键盘事件
 * @param {KeyboardEvent} event - 键盘事件
 */
function handleLightboxKeydown(event) {
  if (!lightboxOverlayEl || lightboxOverlayEl.classList.contains('hidden')) {
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeLightbox();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    handleLightboxPrev();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    handleLightboxNext();
  }
}

/**
 * 处理 Lightbox 覆盖层点击（点击背景关闭）
 * @param {MouseEvent} event - 鼠标事件
 */
function handleLightboxOverlayClick(event) {
  if (event.target === lightboxOverlayEl) {
    closeLightbox();
  }
}

// ============================================
// 电影详情弹窗相关
// ============================================

/**
 * 打开电影详情弹窗
 * @param {string} movieId - 电影 ID
 */
function openMovieModal(movieId) {
  const movie = MOVIES_DATA.find((m) => m.id === movieId);
  if (!movie) {
    return;
  }

  currentModalMovieId = movieId;

  // 填充海报
  if (movieModalPosterEl) {
    movieModalPosterEl.src = movie.image;
    movieModalPosterEl.alt = `${movie.title} 电影海报`;
  }

  // 填充标题
  if (movieModalTitleEl) {
    movieModalTitleEl.textContent = movie.title;
  }

  // 填充原名
  if (movieModalOriginalTitleEl) {
    movieModalOriginalTitleEl.textContent = `${movie.originalTitle} · ${movie.year}`;
  }

  // 填充导演
  if (movieModalDirectorEl) {
    movieModalDirectorEl.textContent = movie.director;
  }

  // 填充主演
  if (movieModalCastEl) {
    movieModalCastEl.textContent = movie.cast.join(' / ');
  }

  // 填充年份
  if (movieModalYearEl) {
    movieModalYearEl.textContent = String(movie.year);
  }

  // 填充评分徽章
  if (movieModalRatingBadgeEl) {
    movieModalRatingBadgeEl.innerHTML = `
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
      ${movie.rating}
    `;
  }

  // 填充用户评分
  if (movieModalUserRatingEl) {
    const userRating = ratingMap[movie.id] || 0;
    const starsHtml = [1, 2, 3, 4, 5].map((star) => {
      const filled = star <= userRating;
      return `<button type="button" class="star-btn ${filled ? 'is-filled' : 'is-empty'}" data-movie-id="${movie.id}" data-star="${star}" aria-label="${star}星">
        <svg class="w-5 h-5" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      </button>`;
    }).join('');
    const ratingText = userRating > 0 ? `<span class="text-sm text-amber-600 font-medium ml-2">${userRating}分</span>` : '';
    movieModalUserRatingEl.innerHTML = `<span class="text-sm text-gray-400 mr-2">我的评分:</span>${starsHtml}${ratingText}`;

    // 绑定弹窗内的评分按钮事件
    const modalStarBtns = movieModalUserRatingEl.querySelectorAll('.star-btn');
    modalStarBtns.forEach((btn) => {
      btn.addEventListener('click', handleRatingClick);
    });
  }

  // 填充分类标签
  if (movieModalCategoriesEl) {
    const tagsHtml = movie.categories
      .map((cat) => {
        const tagClass = getTagClass(cat);
        return `<span class="inline-block px-2 py-0.5 rounded text-xs font-medium ${tagClass}">${cat}</span>`;
      })
      .join('');
    movieModalCategoriesEl.innerHTML = tagsHtml;
  }

  // 填充描述
  if (movieModalDescriptionEl) {
    movieModalDescriptionEl.textContent = movie.description;
  }

  // 填充台词
  if (movieModalQuoteEl) {
    movieModalQuoteEl.textContent = `"${movie.quote}"`;
  }

  // 填充外部观看链接列表
  if (movieModalWatchLinksEl) {
    const watchUrls = getWatchUrlsForMovie(movie.id);
    const linkIcon = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>';
    const html = watchUrls.map(item => {
      if (item.url) {
        return `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="watch-link-btn" title="在 ${item.siteName} 观看《${movie.title}》">${linkIcon} ${item.siteName}</a>`;
      }
      return `<span class="watch-link-unavailable" title="${movie.title} 在 ${item.siteName} 暂无资源">${item.siteName} 无资源</span>`;
    }).join('');
    movieModalWatchLinksEl.innerHTML = html;
  }

  // 取消任何正在进行的关闭流程（防止旧 transitionend 误关新弹窗）
  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
  }

  // 显示弹窗（防双击关闭：打开后 350ms 内忽略 overlay 点击）
  if (movieModalOverlayEl) {
    modalIsOpening = true;
    movieModalOverlayEl.classList.remove('hidden');
    // 清理上一次关闭遗留的 transitionend 监听器（这是闪退 Bug 的根因！）
    requestAnimationFrame(() => {
      movieModalOverlayEl.classList.add('active');
      // 过渡动画完成后允许 overlay 点击关闭
      setTimeout(() => {
        modalIsOpening = false;
      }, 350);
    });
  }

  // 禁用 body 滚动
  document.body.style.overflow = 'hidden';
}

/**
 * 关闭电影详情弹窗
 */
function closeMovieModal() {
  if (!movieModalOverlayEl) {
    return;
  }

  movieModalOverlayEl.classList.remove('active');

  // 取消之前未完成的关闭定时器
  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
  }

  // 等待过渡动画完成后隐藏（用定时器而非 transitionend 事件，避免竞态条件）
  modalCloseTimer = setTimeout(() => {
    modalCloseTimer = null;
    if (!movieModalOverlayEl.classList.contains('active')) {
      movieModalOverlayEl.classList.add('hidden');
      currentModalMovieId = null;
    }
  }, 350);

  // 恢复 body 滚动
  document.body.style.overflow = '';
}

/**
 * 处理弹窗覆盖层点击（点击背景关闭）
 * @param {MouseEvent} event - 鼠标事件
 */
function handleModalOverlayClick(event) {
  // 弹窗正在打开过程中，忽略 overlay 点击（防止双击关闭）
  if (modalIsOpening) {
    return;
  }
  if (event.target === movieModalOverlayEl) {
    closeMovieModal();
  }
}

/**
 * 处理弹窗键盘事件
 * @param {KeyboardEvent} event - 键盘事件
 */
function handleModalKeydown(event) {
  if (!movieModalOverlayEl || movieModalOverlayEl.classList.contains('hidden')) {
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeMovieModal();
  }
}

/**
 * 绑定电影卡片点击打开弹窗事件（事件委托）
 * 使用命名函数引用防止重复绑定
 */
let cardClickHandler = null;

function bindMovieCardClicks() {
  if (!movieGridEl) {
    return;
  }

  // 移除旧的事件监听器，防止重复绑定
  if (cardClickHandler) {
    movieGridEl.removeEventListener('click', cardClickHandler);
  }

  cardClickHandler = (event) => {
    const card = event.target.closest('.movie-card');
    if (!card) {
      return;
    }

    // 如果点击的是收藏/点赞/分享/评分/放大查看按钮/排名徽章，则不打开弹窗
    const isActionButton = event.target.closest('.favorite-btn')
      || event.target.closest('.like-btn')
      || event.target.closest('.share-btn')
      || event.target.closest('.star-btn')
      || event.target.closest('.lightbox-trigger')
      || event.target.closest('.rank-badge');

    if (isActionButton) {
      return;
    }

    event.stopPropagation();

    const movieId = card.dataset.movieId;
    if (movieId) {
      openMovieModal(movieId);
    }
  };

  movieGridEl.addEventListener('click', cardClickHandler);
}

/**
 * 绑定 Lightbox 相关事件
 */
function bindLightboxEvents() {
  // 电影卡片上的放大查看按钮点击打开 Lightbox（事件委托）
  if (movieGridEl) {
    movieGridEl.addEventListener('click', (event) => {
      const trigger = event.target.closest('.lightbox-trigger');
      if (trigger) {
        const movieId = trigger.dataset.movieId;
        if (movieId) {
          openLightbox(movieId);
        }
      }
    });
  }

  // 弹窗内的放大查看按钮
  if (movieModalZoomEl) {
    movieModalZoomEl.addEventListener('click', () => {
      if (currentModalMovieId) {
        openLightbox(currentModalMovieId);
      }
    });
  }

  // 关闭按钮
  if (lightboxCloseEl) {
    lightboxCloseEl.addEventListener('click', closeLightbox);
  }

  // 左右导航
  if (lightboxPrevEl) {
    lightboxPrevEl.addEventListener('click', handleLightboxPrev);
  }
  if (lightboxNextEl) {
    lightboxNextEl.addEventListener('click', handleLightboxNext);
  }

  // 点击背景关闭
  if (lightboxOverlayEl) {
    lightboxOverlayEl.addEventListener('click', handleLightboxOverlayClick);
  }

  // 键盘事件
  document.addEventListener('keydown', handleLightboxKeydown);
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
 * 初始化图片懒加载 IntersectionObserver
 */
function initLazyImageObserver() {
  if (!window.IntersectionObserver) {
    // 浏览器不支持时直接加载所有图片
    const images = document.querySelectorAll('.lazy-image');
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }

  lazyImageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          lazyImageObserver.unobserve(img);
        }
      });
    },
    {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0,
    }
  );
}

/**
 * 观察所有懒加载图片元素
 */
function observeLazyImages() {
  if (!lazyImageObserver) {
    return;
  }

  const images = document.querySelectorAll('.lazy-image');
  images.forEach((img) => {
    lazyImageObserver.observe(img);
  });
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
 * 绑定分享按钮点击事件
 */
function bindShareButtons() {
  const buttons = document.querySelectorAll('.share-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleShareClick);
  });
}

/**
 * 绑定点赞按钮点击事件
 */
function bindLikeButtons() {
  const buttons = document.querySelectorAll('.like-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleLikeClick);
  });
}

/**
 * 绑定评分按钮点击事件
 */
function bindRatingButtons() {
  const buttons = document.querySelectorAll('.star-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', handleRatingClick);
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

  // 留言板提交
  if (messageFormEl) {
    messageFormEl.addEventListener('submit', handleMessageSubmit);
  }

  // ---- 新增事件绑定 ----

  // 排序选择器
  if (sortSelectEl) {
    sortSelectEl.addEventListener('change', handleSortChange);
  }

  // 排序方向切换
  if (sortOrderBtnEl) {
    sortOrderBtnEl.addEventListener('click', handleSortOrderToggle);
  }

  // 年份区间滑块
  if (yearRangeMinEl) {
    yearRangeMinEl.addEventListener('input', handleYearRangeChange);
  }
  if (yearRangeMaxEl) {
    yearRangeMaxEl.addEventListener('input', handleYearRangeChange);
  }

  // 地区筛选
  if (regionFiltersEl) {
    regionFiltersEl.addEventListener('click', handleRegionClick);
  }

  // 分页按钮
  if (paginationPrevEl) {
    paginationPrevEl.addEventListener('click', handlePaginationPrev);
  }
  if (paginationNextEl) {
    paginationNextEl.addEventListener('click', handlePaginationNext);
  }

  // 导出清单
  if (exportBtnEl) {
    exportBtnEl.addEventListener('click', handleExport);
  }

  // 主题切换
  if (themeToggleEl) {
    themeToggleEl.addEventListener('click', handleThemeToggle);
  }
  if (themeToggleMobileEl) {
    themeToggleMobileEl.addEventListener('click', handleThemeToggle);
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
  messageFormEl = document.getElementById('message-form');
  messageNicknameEl = document.getElementById('message-nickname');
  messageContentEl = document.getElementById('message-content');
  messageListEl = document.getElementById('message-list');
  scrollProgressEl = document.getElementById('scroll-progress');

  // Lightbox 元素
  lightboxOverlayEl = document.getElementById('lightbox-overlay');
  lightboxImageEl = document.getElementById('lightbox-image');
  lightboxCaptionEl = document.getElementById('lightbox-caption');
  lightboxCloseEl = document.getElementById('lightbox-close');
  lightboxPrevEl = document.getElementById('lightbox-prev');
  lightboxNextEl = document.getElementById('lightbox-next');

  // 电影详情弹窗元素
  movieModalOverlayEl = document.getElementById('movie-modal-overlay');
  movieModalContentEl = document.getElementById('movie-modal-content');
  movieModalCloseEl = document.getElementById('movie-modal-close');
  movieModalPosterEl = document.getElementById('movie-modal-poster');
  movieModalZoomEl = document.getElementById('movie-modal-zoom');
  movieModalTitleEl = document.getElementById('movie-modal-title');
  movieModalOriginalTitleEl = document.getElementById('movie-modal-original-title');
  movieModalDirectorEl = document.getElementById('movie-modal-director');
  movieModalCastEl = document.getElementById('movie-modal-cast');
  movieModalYearEl = document.getElementById('movie-modal-year');
  movieModalRatingBadgeEl = document.getElementById('movie-modal-rating-badge');
  movieModalUserRatingEl = document.getElementById('movie-modal-user-rating');
  movieModalCategoriesEl = document.getElementById('movie-modal-categories');
  movieModalDescriptionEl = document.getElementById('movie-modal-description');
  movieModalQuoteEl = document.getElementById('movie-modal-quote');
  movieModalWatchLinksEl = document.getElementById('movie-modal-watch-links');

  // ---- 新增 DOM 引用 ----
  statCountEl = document.getElementById('stat-count');
  statGenresEl = document.getElementById('stat-genres');
  statAvgRatingEl = document.getElementById('stat-avg-rating');
  statYearRangeEl = document.getElementById('stat-year-range');

  sortSelectEl = document.getElementById('sort-select');
  sortOrderBtnEl = document.getElementById('sort-order-btn');
  sortOrderIconEl = document.getElementById('sort-order-icon');
  sortOrderLabelEl = document.getElementById('sort-order-label');

  yearRangeMinEl = document.getElementById('year-range-min');
  yearRangeMaxEl = document.getElementById('year-range-max');
  yearRangeLabelEl = document.getElementById('year-range-label');

  regionFiltersEl = document.getElementById('region-filters');

  paginationPrevEl = document.getElementById('pagination-prev');
  paginationNextEl = document.getElementById('pagination-next');
  paginationPagesEl = document.getElementById('pagination-pages');
  paginationInfoEl = document.getElementById('pagination-info');

  exportBtnEl = document.getElementById('export-btn');

  themeToggleEl = document.getElementById('theme-toggle');
  themeToggleMobileEl = document.getElementById('theme-toggle-mobile');
}

/**
 * 应用初始化
 */
function init() {
  // 缓存 DOM 引用
  cacheElements();

  // 初始化主题
  initTheme();

  // 计算并渲染数据统计面板
  calculateStats();

  // 从 localStorage 加载收藏数据
  favoriteSet = loadFavoritesFromStorage();

  // 从 localStorage 加载点赞数据
  likeSet = loadLikesFromStorage();

  // 从 localStorage 加载评分数据
  ratingMap = loadRatingsFromStorage();

  // 从 localStorage 加载留言数据
  messages = loadMessagesFromStorage();

  // 初始化滚动观察器
  initScrollObserver();

  // 初始化图片懒加载观察器
  initLazyImageObserver();

  // 绑定事件
  bindEvents();

  // 绑定 Lightbox 事件
  bindLightboxEvents();

  // 绑定弹窗关闭按钮事件
  if (movieModalCloseEl) {
    movieModalCloseEl.addEventListener('click', closeMovieModal);
  }

  // 绑定弹窗覆盖层点击事件
  if (movieModalOverlayEl) {
    movieModalOverlayEl.addEventListener('click', handleModalOverlayClick);
  }

  // 绑定弹窗键盘事件
  document.addEventListener('keydown', handleModalKeydown);

  // 初始渲染（使用 refreshMovieDisplay 支持排序+分页）
  refreshMovieDisplay();

  // 初始渲染留言列表
  renderMessageList();

  // 初始化回到顶部按钮状态
  handleScroll();

  console.log('影荐墙初始化完成（100部数据，排序/分页/主题/导出/地区/年份筛选已启用）');
}

// DOM 加载完成后执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}