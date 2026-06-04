/**
 * 影荐墙 - 主逻辑脚本
 * 功能：数据管理、渲染、搜索、筛选、收藏、点赞、评分、留言、Lightbox、懒加载、动效
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
  '爱情': 'tag-love',
  '喜剧': 'tag-comedy',
  '战争': 'tag-war',
  '传记': 'tag-biography',
  '历史': 'tag-history',
};

/** 分类主标签列表（用于筛选） */
const MAIN_CATEGORIES = ['科幻', '悬疑', '动画', '剧情', '爱情', '喜剧', '战争', '传记', '历史'];

// ============================================
// 电影数据（硬编码）
// ============================================

/**
 * 13 部电影的完整数据
 * @type {Array<{
 *   id: string,
 *   title: string,
 *   originalTitle: string,
 *   year: number,
 *   director: string,
 *   cast: string[],
 *   categories: string[],
 *   rating: number,
 *   description: string,
 *   quote: string,
 *   image: string,
 *   detailUrl: string
 * }>}
 */
const MOVIES_DATA = [
  {
    id: 'movie_1',
    title: '星际穿越',
    originalTitle: 'Interstellar',
    year: 2014,
    director: '克里斯托弗·诺兰',
    cast: ['马修·麦康纳', '安妮·海瑟薇', '杰西卡·查斯坦', '迈克尔·凯恩'],
    categories: ['科幻', '冒险'],
    rating: 9.4,
    description: '地球环境恶化，前飞行员库珀临危受命，穿越虫洞寻找人类新家园。在浩瀚宇宙中，爱与引力跨越维度，成为连接过去与未来的唯一桥梁。诺兰用硬核科幻包裹深情内核，打造了一部关于时间、空间与亲情的史诗。',
    quote: '爱是唯一可以穿越时间的力量。',
    image: 'images/movie_1.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/157398.html',
  },
  {
    id: 'movie_2',
    title: '银翼杀手 2049',
    originalTitle: 'Blade Runner 2049',
    year: 2017,
    director: '丹尼斯·维伦纽瓦',
    cast: ['瑞恩·高斯林', '哈里森·福特', '安娜·德·阿玛斯', '杰瑞德·莱托'],
    categories: ['科幻', '惊悚'],
    rating: 9.2,
    description: '复制人K在追查一个埋藏三十年的秘密时，逐渐逼近关于自身身份的真相。维伦纽瓦以极致的视觉美学重构赛博朋克世界，在霓虹废墟与橙色荒漠间，追问何以为人的终极命题。',
    quote: '每一帧都是壁纸的科幻美学巅峰。',
    image: 'images/movie_2.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/213509.html',
  },
  {
    id: 'movie_3',
    title: '看不见的客人',
    originalTitle: 'Contratiempo',
    year: 2016,
    director: '奥里奥尔·保罗',
    cast: ['马里奥·卡萨斯', '阿娜·瓦格纳', '何塞·科罗纳多', '巴巴拉·莱涅'],
    categories: ['悬疑', '犯罪'],
    rating: 9.1,
    description: '企业家艾德里安被指控谋杀情人，他请来金牌女律师为自己辩护。随着对话深入，真相不断被推翻重建，层层反转令人窒息。不到最后一秒，你永远猜不到结局。',
    quote: '43 处反转，最后一刻颠覆所有认知。',
    image: 'images/movie_3.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/251332.html',
  },
  {
    id: 'movie_4',
    title: '窃听风暴',
    originalTitle: 'Das Leben der Anderen',
    year: 2006,
    director: '弗洛里安·亨克尔·冯·多纳斯马',
    cast: ['乌尔里希·穆埃', '塞巴斯蒂安·科赫', '马蒂娜·格德克', '乌尔里希·图库尔'],
    categories: ['悬疑', '剧情'],
    rating: 9.3,
    description: '1984 年东德，秘密警察卫斯勒奉命监听剧作家德莱曼，却在监听过程中逐渐被艺术与人性打动，最终选择默默守护。一部关于良知觉醒的冷峻杰作，结尾五分钟足以让人泪崩。',
    quote: '沉默的守护，是最深沉的救赎。',
    image: 'images/movie_4.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/158893.html',
  },
  {
    id: 'movie_5',
    title: '千与千寻',
    originalTitle: '千と千尋の神隠し',
    year: 2001,
    director: '宫崎骏',
    cast: ['柊瑠美', '入野自由', '夏木真理', '菅原文太'],
    categories: ['动画', '奇幻'],
    rating: 9.5,
    description: '少女千寻误入神灵世界，为救父母踏上成长之旅。在汤屋的奇幻世界里，她学会独立、勇敢与善良。宫崎骏用瑰丽想象编织的成人童话，关于迷失与找回自我的永恒寓言。',
    quote: '成长，就是一场不回头的前行。',
    image: 'images/movie_5.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/183018.html',
  },
  {
    id: 'movie_6',
    title: '蜘蛛侠：平行宇宙',
    originalTitle: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    director: '鲍勃·佩尔西切蒂 / 彼得·拉姆齐 / 罗德尼·罗斯曼',
    cast: ['沙梅克·摩尔', '杰克·约翰逊', '海莉·斯坦菲尔德', '马赫沙拉·阿里'],
    categories: ['动画', '动作'],
    rating: 9.0,
    description: '普通少年迈尔斯被放射性蜘蛛咬伤后，与来自平行宇宙的六位蜘蛛侠联手拯救世界。影片以突破性的漫画视觉风格重新定义动画美学，证明任何人都可以戴上那张面具。',
    quote: '画风炸裂，任何人都可以成为英雄。',
    image: 'images/movie_6.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/147224.html',
  },
  {
    id: 'movie_7',
    title: '肖申克的救赎',
    originalTitle: 'The Shawshank Redemption',
    year: 1994,
    director: '弗兰克·德拉邦特',
    cast: ['蒂姆·罗宾斯', '摩根·弗里曼', '鲍勃·冈顿', '威廉姆·赛德勒'],
    categories: ['剧情', '犯罪'],
    rating: 9.7,
    description: '银行家安迪蒙冤入狱，在肖申克监狱的十九年里，他用一把小锤凿穿高墙，用希望对抗体制化的绝望。当他在暴雨中张开双臂，自由的光芒照亮了每一个被生活困住的人。',
    quote: '希望是美好的，也许是人间至善。',
    image: 'images/movie_7.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/154389.html',
  },
  {
    id: 'movie_8',
    title: '海蒂和爷爷',
    originalTitle: 'Heidi',
    year: 2015,
    director: '阿兰·葛斯彭纳',
    cast: ['阿努克·斯特芬', '伊莎贝尔·奥特曼', '莉莲·奈福', '布鲁诺·甘茨'],
    categories: ['剧情', '家庭'],
    rating: 9.3,
    description: '孤儿海蒂被送到阿尔卑斯山与孤僻的爷爷同住，她的纯真与善良融化了爷爷的心，也治愈了富家小姐克拉拉。阿尔卑斯山的壮丽风光与纯粹情感交织，是一部洗涤心灵的温暖之作。',
    quote: '阿尔卑斯的风，吹散所有阴霾。',
    image: 'images/movie_8.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/173902.html',
  },
  {
    id: 'movie_9',
    title: '泰坦尼克号',
    originalTitle: 'Titanic',
    year: 1997,
    director: '詹姆斯·卡梅隆',
    cast: ['莱昂纳多·迪卡普里奥', '凯特·温斯莱特', '比利·赞恩', '凯西·贝茨'],
    categories: ['爱情', '剧情'],
    rating: 9.5,
    description: '穷画家杰克与贵族少女露丝在豪华邮轮上相遇，跨越阶级的爱情在冰山撞击的生死关头绽放出永恒光芒。卡梅隆用史诗般的叙事与震撼视效，谱写了一曲关于爱与牺牲的千古绝唱。',
    quote: '你跳，我就跳。',
    image: 'images/movie_9.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/152057.html',
  },
  {
    id: 'movie_10',
    title: '大话西游之大圣娶亲',
    originalTitle: 'A Chinese Odyssey Part Two',
    year: 1995,
    director: '刘镇伟',
    cast: ['周星驰', '朱茵', '莫文蔚', '蔡少芬'],
    categories: ['喜剧', '爱情', '奇幻'],
    rating: 9.2,
    description: '至尊宝为救白晶晶穿越回五百年前，却与紫霞仙子展开一段注定悲剧的宿命之恋。无厘头笑料包裹深情内核，结尾城墙上的一吻成为华语影史最经典的遗憾与成全。',
    quote: '曾经有一份真诚的爱情放在我面前……',
    image: 'images/movie_10.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/210566.html',
  },
  {
    id: 'movie_11',
    title: '辛德勒的名单',
    originalTitle: "Schindler's List",
    year: 1993,
    director: '史蒂文·斯皮尔伯格',
    cast: ['连姆·尼森', '本·金斯利', '拉尔夫·费因斯', '卡罗琳·古多尔'],
    categories: ['战争', '传记', '历史'],
    rating: 9.6,
    description: '二战期间，德国商人辛德勒在克拉科夫开设工厂，倾家荡产拯救了上千名犹太人的生命。斯皮尔伯格用黑白影像记录下人性在黑暗年代的光辉，红衣女孩的一抹色彩刺痛了整个世界。',
    quote: '凡救一命，即救全世界。',
    image: 'images/movie_11.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/158259.html',
  },
  {
    id: 'movie_12',
    title: '美丽人生',
    originalTitle: 'La vita è bella',
    year: 1997,
    director: '罗伯托·贝尼尼',
    cast: ['罗伯托·贝尼尼', '尼可莱塔·布拉斯基', '乔治·坎塔里尼', '朱斯蒂诺·杜拉诺'],
    categories: ['喜剧', '战争', '爱情'],
    rating: 9.5,
    description: '犹太青年圭多用乐观与幽默为儿子在纳粹集中营中编织了一场最温柔的谎言，将残酷的现实化作赢取坦克的游戏。父爱如山，在至暗时刻依然守护住孩子心中最纯净的阳光。',
    quote: '早安！公主！',
    image: 'images/movie_12.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/224409.html',
  },
  {
    id: 'movie_13',
    title: '至暗时刻',
    originalTitle: 'Darkest Hour',
    year: 2017,
    director: '乔·赖特',
    cast: ['加里·奥德曼', '克里斯汀·斯科特·托马斯', '莉莉·詹姆斯', '本·门德尔森'],
    categories: ['传记', '历史', '剧情'],
    rating: 8.7,
    description: '二战初期，温斯顿·丘吉尔在内外交困中临危受命，以钢铁般的意志带领英国走出投降阴影，坚定走向抵抗法西斯的道路。加里·奥德曼神级演技还原了这位传奇首相最艰难的历史抉择。',
    quote: '没有最终的成功，也没有致命的失败，最可贵的是继续前进的勇气。',
    image: 'images/movie_13.jpg',
    detailUrl: 'https://www.xiaobaotv.com/vod/detail/155744.html',
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

/** 电影详情弹窗外部链接元素 */
let movieModalDetailLinkEl = null;

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
            class="like-btn absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md ${likeClass}"
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

  // 重新渲染该卡片的评分区域
  const card = document.querySelector(`.movie-card[data-movie-id="${movieId}"]`);
  if (card) {
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    if (movie) {
      // 为了简单，直接重新渲染整个列表
      const filtered = filterMovies();
      renderMovieList(filtered);
    }
  }
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
    movieModalQuoteEl.textContent = `“${movie.quote}”`;
  }

  // 填充外部链接
  if (movieModalDetailLinkEl) {
    movieModalDetailLinkEl.href = movie.detailUrl;
  }

  // 显示弹窗
  if (movieModalOverlayEl) {
    movieModalOverlayEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      movieModalOverlayEl.classList.add('active');
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
  // 等待过渡动画完成后隐藏
  const onTransitionEnd = () => {
    movieModalOverlayEl.classList.add('hidden');
    currentModalMovieId = null;
    movieModalOverlayEl.removeEventListener('transitionend', onTransitionEnd);
  };
  movieModalOverlayEl.addEventListener('transitionend', onTransitionEnd);
  // 兜底：如果 transitionend 未触发，300ms 后强制隐藏
  setTimeout(() => {
    if (!movieModalOverlayEl.classList.contains('hidden') && !movieModalOverlayEl.classList.contains('active')) {
      movieModalOverlayEl.classList.add('hidden');
      currentModalMovieId = null;
    }
  }, 300);

  // 恢复 body 滚动
  document.body.style.overflow = '';
}

/**
 * 处理弹窗覆盖层点击（点击背景关闭）
 * @param {MouseEvent} event - 鼠标事件
 */
function handleModalOverlayClick(event) {
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
 */
function bindMovieCardClicks() {
  if (!movieGridEl) {
    return;
  }

  movieGridEl.addEventListener('click', (event) => {
    const card = event.target.closest('.movie-card');
    if (!card) {
      return;
    }

    // 如果点击的是收藏/点赞/分享/评分/放大查看按钮，则不打开弹窗
    const isActionButton = event.target.closest('.favorite-btn')
      || event.target.closest('.like-btn')
      || event.target.closest('.share-btn')
      || event.target.closest('.star-btn')
      || event.target.closest('.lightbox-trigger');

    if (isActionButton) {
      return;
    }

    const movieId = card.dataset.movieId;
    if (movieId) {
      openMovieModal(movieId);
    }
  });
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
  movieModalDetailLinkEl = document.getElementById('movie-modal-detail-link');
}

/**
 * 应用初始化
 */
function init() {
  // 缓存 DOM 引用
  cacheElements();

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

  // 初始渲染全部电影
  renderMovieList(MOVIES_DATA);

  // 初始渲染留言列表
  renderMessageList();

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
