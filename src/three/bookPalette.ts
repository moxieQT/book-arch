/**
 * Luxury Editorial Color & Visual Design System
 * Проект: «Архетипы и Тени» (Archetypes & Shadows)
 * Эстетика: Французский арт-бук, бумага верже, горячее тиснение сусальным золотом.
 */

export const LUXURY_PALETTE = {
  // --- Бумага и страницы ---
  paper: {
    primary: '#F8F5EE',      // Основной тон дорогой хлопковой бумаги верже
    shade: '#EDE7DB',        // Теневой градиент у корешка и по краям
    highlight: '#FDFAF4',    // Мягкий блик на изгибе страницы
    deckleEdge: '#E4DDD0',   // Обрез страницы (состаренная кромка)
    spineShadow: 'rgba(54, 40, 32, 0.08)', // Тень глубокого желобка корешка
  },

  // --- Переплет и обложка ---
  cover: {
    base: '#F3EDE2',         // Благородный оттенок слоновой кости (ivory buckram / vellum)
    embossDark: '#DECDB5',   // Теневой контур фаски обложки
    rimHighlight: '#FAF7F0', // Световая кромка переплетного картона
    innerLining: '#ECE4D5',  // Форзацная бумага
  },

  // --- 3D сцена и окружение ---
  stage: {
    bgCore: '#F2EDE4',       // Световое ядро фона сцены (теплый рассеянный свет)
    bgVignette: '#DDD4C5',   // Мягкое затемнение по краям вьюпорта
    fog: 0xE6DFD2,           // Three.js FogExp2 цвет (атмосферная дымка цвета шампанского)
    fogDensity: 0.035,
    tabletop: 0xE8E1D5,      // Травертин / выбеленный дуб под книгой
  },

  // --- Система сусального золота (22k Leaf Gold) ---
  gold: {
    primary: '#C6A76B',      // Натуральное сусальное золото
    light: '#F3E5C8',        // Спекулярный блик фольги
    bright: '#DFBE7E',       // Отраженный свет полированного золота
    deep: '#8F723E',         // Глубокая насечка клише
    dark: '#5C4820',         // Тень вдавленного штампа (blind deboss)
    particle: 0xD4B574,      // Цвет золотых пылинок в Three.js
  },

  // --- Акцентный королевский тон (Imperial Burgundy) ---
  wine: {
    primary: '#5C192E',      // Глубокий винный (буквицы, акценты, колонтитулы)
    light: '#7D2641',        // Ховер кнопок и акцентных карточек
    deep: '#3D0D1D',         // Нажатое состояние / глубокая тень
    subtle: 'rgba(92, 25, 46, 0.08)', // Фоновые заливки бейджей
  },

  // --- Сепийная типографика и чернила ---
  ink: {
    primary: '#201C24',      // Глубокий сепийный антрацит (основной текст)
    secondary: '#564F5E',    // Подзаголовки, описания глав, подписи
    muted: '#867E8E',        // Нумерация страниц, вспомогательные маркеры
    faint: 'rgba(32, 28, 36, 0.12)', // Волосковые линии и сетка
  },

  // --- UI Панель и стекло (Glassmorphism) ---
  ui: {
    panelBg: 'rgba(248, 245, 238, 0.88)',
    panelBorder: 'rgba(198, 167, 107, 0.32)',
    cardBg: 'rgba(255, 255, 255, 0.82)',
    cardBorder: 'rgba(198, 167, 107, 0.28)',
    cardShadow: '0 8px 24px rgba(70, 55, 45, 0.06)',
    cardHoverShadow: '0 12px 32px rgba(198, 167, 107, 0.18)',
  },
} as const

/**
 * Физические параметры материалов Three.js
 */
export const THREE_MATERIAL_CONFIG = {
  cover: {
    roughness: 0.74,     // Бархатистая текстура переплетного полотна
    metalness: 0.12,     // Позволяет золотым элементам давать благородный отблеск
    bumpScale: 0.002,    // Микрорельеф ткани
  },
  page: {
    roughness: 0.94,     // Матовая хлопковая бумага высокой плотности (140г/м²)
    metalness: 0.02,     // Не бликует, рассеивает падающий свет
    side: 2,             // THREE.DoubleSide
  },
  table: {
    roughness: 0.92,
    metalness: 0.03,
  },
}

/**
 * Параметры света Three.js для создания атмосферы освещенного парижского ателье со свечой
 */
export const THREE_LIGHT_CONFIG = {
  hemisphere: {
    skyColor: 0xFFFBF4,  // Теплый жемчужный небесный свет
    groundColor: 0xD8CEBE, // Отраженный свет теплого деревянного стола
    intensity: 0.72,
  },
  sunKeyLight: {
    color: 0xFFF7EC,     // Мягкий солнечный свет сквозь высокое окно
    intensity: 1.35,
    position: [2.8, 5.2, 2.8] as const,
    shadow: {
      mapSize: 2048,
      bias: -0.00012,
      normalBias: 0.02,
      radius: 3.5,
      cameraBound: 3.8,
    },
  },
  candleLight: {
    color: 0xFFAA42,     // Физическая цветовая температура свечи (~2200K)
    baseIntensity: 1.05,
    distance: 7.5,
    decay: 2.0,
    position: [0.9, 2.1, 1.4] as const,
  },
  rimFillLight: {
    color: 0xEAD8B5,     // Золотистый контровой свет
    intensity: 0.42,
    position: [-2.2, 1.8, -1.6] as const,
  },
  dust: {
    count: 70,
    color: 0xD4B574,
    size: 0.022,
    opacity: 0.42,
  },
}
