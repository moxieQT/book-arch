# АРХИТЕКТУРНОЕ РУКОВОДСТВО ПО ВИЗУАЛУ И 3D: «АРХЕТИПЫ И ТЕНИ»
**Art Direction, Lighting Science & Luxury Editorial Design Specification**
*Версия: 2.0 (Light Luxury Edition)*

---

## 1. Концепция и критика текущего визуала (Audit & Creative Vision)

### 1.1. Аудит текущего состояния: ликвидация мрачных штампов
Предыдущая версия книги использовала стереотипную темную тему:
- **Мрачный индиго/фиолетовый фон (`#0a0a16`, `#14132a`, `#2b2657`)** в сочетании с холодной сиреневой бумагой (`#EFEAF8` -> `#D9D1EC`) создавал ощущение дешевого эзотерического сайта 2000-х годов или неонового таро-бота.
- **Холодное освещение в Three.js:** `HemisphereLight(0x9a93c9)` давал неестественные фиолетовые тени, а точечный свет «свечи» имел холодный оттенок `0xb9a4e0`, противоречащий физике горения.
- **Низкое разрешение текстур (700×940 px)** приводило к мылу и лесенкам на дисплеях Retina при приближении камеры.
- **Плоская векторная графика:** золотые линии рисовались плоским цветом `#C6A76B` без металлического перелива, фаски и тактильного тиснения.

### 1.2. Новая визуальная философия: High-End French Art-Book
Проект переводится в категорию **коллекционного французского арт-бука** (в традициях *Assouline*, *Taschen Private Editions* и *Éditions Gallimard*):
- **Светлая теплая основа:** цвет слоновой кости, шампанского и хлопковой бумаги верже (Laid Paper 140 г/м²).
- **Сусальное золото 22 карата (22k Leaf Gold):** многослойный градиент с бликами и эффектом горячего блинтового тиснения (Deboss / Letterpress).
- **Имперский глубокий винный акцент (`#5C192E`):** дает благородную контрастность, сакральную глубину и дороговизну без скатывания в мрак.
- **Благородные чернила сепии (`#201C24`):** мягкий книжный антрацит, исключающий едкий цифровой черный `#000000`.
- **Освещение залитого солнцем ателье:** естественный свет сквозь высокое арочное окно библиотеки в гармонии с теплым мерцанием свечи (~2200K) на столе из светлого травертина.

---

## 2. Полная цветовая матрица и дизайн-токены (Light Luxury Palette)

### 2.1. Точные цветовые константы

| Элемент / Роль | Точный HEX | RGB / CSS | Эстетическое назначение |
| :--- | :--- | :--- | :--- |
| **Бумага: основа (Primary Paper)** | `#F8F5EE` | `rgb(248, 245, 238)` | Натуральный оттенок хлопка/верже высокой плотности |
| **Бумага: тень (Spine Shade)** | `#EDE7DB` | `rgb(237, 231, 219)` | Мягкое затенение у корешка и по краям листа |
| **Бумага: блик (Paper Highlight)** | `#FDFAF4` | `rgb(253, 250, 244)` | Спекулярное высветление на гребне изгиба страницы |
| **Обложка: основа (Ivory Vellum)** | `#F3EDE2` | `rgb(243, 237, 226)` | Плотный переплет цвета слоновой кости с микрофактурой |
| **Обложка: фаска (Deboss Contour)**| `#DECDB5` | `rgb(222, 205, 181)` | Теневой контур рельефа переплетной крышки |
| **Фон сцены: световое ядро** | `#FAF6EE` | `rgb(250, 246, 238)` | Рассеянный теплый свет в центре вьюпорта |
| **Фон сцены: виньетка** | `#DDD4C5` | `rgb(221, 212, 197)` | Мягкий спад к краям экрана |
| **Стол / Подложка (Travertine)** | `#E8E1D5` | `rgb(232, 225, 213)` | Поверхность стола из травертина/светлого дуба |
| **Сусальное золото: база** | `#C6A76B` | `rgb(198, 167, 107)` | Классическое листовое золото 22k |
| **Сусальное золото: блик** | `#F5E8CB` | `rgb(245, 232, 203)` | Точка максимального зеркального отражения фольги |
| **Сусальное золото: тень** | `#8F723E` | `rgb(143, 114, 62)` | Глубокая бороздка штампа тиснения |
| **Имперский винный (Burgundy)** | `#5C192E` | `rgb(92, 25, 46)` | Буквицы, заглавия, активные элементы UI |
| **Винный: ховер (Hover)** | `#7D2641` | `rgb(125, 38, 65)` | Состояние интерактивности кнопок и карточек |
| **Винный: глубина (Deep)** | `#3D0D1D` | `rgb(61, 13, 29)` | Теневые фасеты и активное нажатие |
| **Чернила: сепия (Primary Ink)** | `#201C24` | `rgb(32, 28, 36)` | Основной книжный текст, типографика заголовков |
| **Чернила: вторичные (Muted Ink)** | `#564F5E` | `rgb(86, 79, 94)` | Подзаголовки, цитаты, авторские маркеры |
| **Чернила: волосковые (Faint)** | `#867E8E` | `rgb(134, 126, 142)` | Пагинация, мелкие маркеры, разделители |

### 2.2. Формула спектра сусального золота для Canvas 2D
Вместо монохромной заливки применяется 6-точечный линейный металлический градиент:
```typescript
const goldGrad = ctx.createLinearGradient(x1, y1, x2, y2);
goldGrad.addColorStop(0.00, '#8F723E'); // глубокая тень штампа
goldGrad.addColorStop(0.22, '#C6A76B'); // классическое золото
goldGrad.addColorStop(0.48, '#F5E8CB'); // зеркальный спекуляр
goldGrad.addColorStop(0.68, '#DFBE7E'); // теплое сияние
goldGrad.addColorStop(0.88, '#C6A76B'); // основной тон
goldGrad.addColorStop(1.00, '#6E5528'); // замыкающая тень
```

---

## 3. Физика Three.js: Освещение, Материалы и Окружение

### 3.1. Архитектура световой сцены
Вместо холодного темного пространства настраивается студийное теплое освещение:

```
                  [Окно библиотеки / Key Sun Light]
                         (2.8, 5.2, 2.8)
                         Цвет: #FFF7EC, 1.35
                                \
                                 \   [Мерцающая свеча / PointLight]
                                  \       (0.9, 2.1, 1.4)
                                   \      Цвет: #FFAA42, 1.05
                                    v     (нелинейный органический трепет)
             [Книга «Архетипы и Тени»]
                   (0, 0, 0)
                                    ^
                                   /
 [Контровой свет / RimFill]       /
       (-2.2, 1.8, -1.6)         /
       Цвет: #EAD8B5, 0.42      /
                               v
               [Стол: светлый травертин #E8E1D5]
```

1. **HemisphereLight (`0xFFFBF4`, `0xD8CEBE`, 0.72):**
   - Небо: теплый жемчужный оттенок.
   - Земля: мягкий теплый отскок от деревянного/каменного стола. Исключает черные провалы в тенях.
2. **Key DirectionalLight (`0xFFF7EC`, 1.35):**
   - Позиция: `(2.8, 5.2, 2.8)` под углом 55 градусов.
   - Тени: `PCFSoftShadowMap`, `mapSize: 2048x2048`, `bias: -0.00012`, `normalBias: 0.02`, `radius: 3.5`.
   - Границы ортографической камеры теней сжаты до `[-3.8, 3.8]`, что обеспечивает максимальную детализацию тени от корешка.
3. **PointLight мерцающей свечи (`0xFFAA42`, ~2200K):**
   - Позиция: `(0.9, 2.1, 1.4)`, радиус `7.5`, спад `decay: 2.0`.
   - **Формула органического мерцания:** вместо одной синусоиды используется сумма трех несоизмеримых гармоник с микросдвигом координат фитиля:
   ```typescript
   const t = clock.getElapsedTime();
   const flicker = Math.sin(t * 3.1) * 0.045 +
                   Math.sin(t * 7.7) * 0.028 +
                   Math.sin(t * 19.3) * 0.015;
   this.warmLight.intensity = 1.05 + flicker;
   this.warmLight.position.x = 0.9 + Math.sin(t * 4.2) * 0.008;
   this.warmLight.position.y = 2.1 + Math.cos(t * 5.7) * 0.006;
   ```
4. **Rim/Fill Light (`0xEAD8B5`, 0.42):**
   - Позиция: `(-2.2, 1.8, -1.6)`. Очерчивает золотистым шелковистым бликом дальний край книги.
5. **Атмосферный туман (FogExp2):**
   - Цвет: `0xE6DFD2` (теплая дымка слоновой кости), плотность `0.032`.
6. **Тонирование (Tone Mapping):**
   - `THREE.ACESFilmicToneMapping`, `toneMappingExposure = 1.12`. Предотвращает клиппинг золотых бликов.

### 3.2. Материалы обложки и страниц
Разделение свойств материалов для обложки и внутренних листов:
- **Обложка (Cover Mesh):**
  - `roughness: 0.74` (бархатистая ткань / vellum).
  - `metalness: 0.12` (дает золотому тиснению реагировать на источники света бликами).
- **Страницы (Page Mesh):**
  - `roughness: 0.94` (матовая дорогая бумага верже плотностью 140 г/м²).
  - `metalness: 0.02` (рассеивает свет без синтетического блеска).
  - `side: THREE.DoubleSide`.
- **Стол (Ground Plane):**
  - `roughness: 0.92`, `metalness: 0.03`, цвет `0xE8E1D5`.

### 3.3. Золотые пылинки (Golden Dust Motes)
Вместо угловатых системных точек используется кастомная радиальная текстура мягких пылинок с режимом `AdditiveBlending`:
- Количество: 70–80 частиц.
- Размер: `size: 0.024`.
- Траектория: легкий восходящий дрейф с синусоидальным покачиванием (Brownian motion), создающий ощущение солнечного луча в старинной библиотеке.

---

## 4. Отрисовка на Canvas 2D: Обложка и Разворот

### 4.1. Разрешение и физическое тиснение (Deboss Engine)
- Текстуры создаются в разрешении **1400 × 1880 px** (2x Retina).
- Для имитации **горячего тиснения сусальным золотом** (Hot-Foil Letterpress Deboss) используется комбинированная теневая подложка:
  ```typescript
  ctx.save();
  ctx.shadowColor = 'rgba(70, 50, 35, 0.28)'; // Тень вдавленного штампа
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1.5;
  ctx.shadowOffsetY = 2.5;
  // отрисовка золотого элемента...
  ctx.restore();
  ```

### 4.2. Архитектура обложки «Архетипы и Тени»
```
+-------------------------------------------------------------+
|  [=======================================================]  | <- Внешняя золотая рамка (6px)
|  |  +-------------------------------------------------+  |  |
|  |  | (Угловая виньетка)           (Угловая виньетка) |  |  | <- Внутренняя рамка (1.5px)
|  |  |                                                 |  |  |
|  |  |           LIBER ARCHETYPORUM ET UMBRARUM        |  |  | <- Верхний колонтитул
|  |  |                         ◆                       |  |  |
|  |  |                                                 |  |  |
|  |  |                 АРХЕТИПЫ И ТЕНИ                 |  |  | <- Золотой заголовок (84px)
|  |  |            Книга Души и Чисел Судьбы            |  |  | <- Винный подзаголовок (#5C192E)
|  |  |                                                 |  |  |
|  |  |                     * * *                       |  |  |
|  |  |                 /     |     \                   |  |  |
|  |  |              (  Сакральная    )                 |  |  | <- Астролябия: 24 солнечных луча,
|  |  |              (  Астролябия    )                 |  |  |    звезда гармонии, линза
|  |  |                 \     |     /                   |  |  |    Vesica Piscis, винное ядро
|  |  |                     * * *                       |  |  |
|  |  |                                                 |  |  |
|  |  |       Одиннадцать врат сокровенного знания      |  |  | <- Сепийный эпиграф
|  |  |                                                 |  |  |
|  |  |           EDITIONIS PRIVATAE • MMXXVI           |  |  | <- Издательская марка
|  |  |                                                 |  |  |
|  |  | (Угловая виньетка)           (Угловая виньетка) |  |  |
|  |  +-------------------------------------------------+  |  |
|  [=======================================================]  |
+-------------------------------------------------------------+
```

### 4.3. Архитектура внутреннего разворота страницы
1. **Верхний колонтитул (Running Header):**
   - Римский номер главы: `CAPUT VII` глубоким винным цветом `#5C192E` с разрядкой букв `letter-spacing: 5px`.
   - Тонкая золотая горизонтальная черта с центрированным золотым ромбиком `—— ◆ ——`.
2. **Монументальный архетипический знак / Число:**
   - Высота 320 px, Cormorant Garamond SemiBold.
   - Ядро: королевский винный `#5C192E`.
   - Контур: двойная обводка градиентом сусального золота с эффектом тиснения.
3. **Заголовок и текст:**
   - Заголовок: `#201C24` (глубокая сепия), 52 px.
   - Текст: `#564F5E` (мягкий антрацит), 34 px, интерлиньяж 54 px, оптическое центрирование и поля по канонам Альда Мануция.
4. **Интерактивные карты архетипов:**
   - Карточки цвета слоновой кости (`rgba(255, 255, 255, 0.85)`) с золотым филигранным кантом (1.6 px).
   - Числа карт в винном тоне `#5C192E`, подписи — благородная сепия.
5. **Нижний колонтитул (Folio):**
   - Номер страницы: `— 1 —`, `— 2 —` курсивом Cormorant с оптической центровкой.

---

## 5. UI-Панель и Интерактивные Карточки

### 5.1. Светлая тема в стиле редакторского глассморфизма
Панель под сценой оформляется как манускрипт на подставке из полированного алебастра:
- **Фон панели:** `rgba(248, 245, 238, 0.92)` с сильным матовым размытием `backdrop-filter: blur(24px) saturate(160%)`.
- **Верхний бордюр:** деликатный золотой кант `1px solid rgba(198, 167, 107, 0.35)` со световым внутренним бликом `inset 0 1px 0 rgba(255, 255, 255, 0.9)`.
- **Интерактивные карточки:**
  - Базовый фон: белая слоновая кость `rgba(255, 255, 255, 0.88)` с золотой капиллярной каймой `rgba(198, 167, 107, 0.28)`.
  - Число архетипа: глубокий винный `#5C192E`.
  - Эффект при наведении: мягкий подъем `translateY(-2px)`, золотое свечение `box-shadow: 0 10px 28px rgba(198, 167, 107, 0.2)`.
- **Кнопки управления (CTA):**
  - Главная кнопка («Открыть книгу» / «Далее»): благородный градиент императорского вина `linear-gradient(135deg, #5C192E 0%, #421120 100%)` с золотой окантовкой `rgba(198, 167, 107, 0.45)` и светлым шрифтом `#F8F5EE`.
  - Второстепенная кнопка («Назад»): прозрачная подложка, тонкая золотая рамка, винный текст.

### 5.2. Адаптивность и мобильный опыт (Mobile First Luxury)
1. **Динамическая высота 3D сцены:**
   - Десктоп: `height: 520px`.
   - Планшеты/смартфоны: `height: clamp(340px, 46vh, 480px)`.
2. **Автокомпенсация угла обзора камеры (FOV):**
   При соотношении сторон экрана `< 1.0` (портретная ориентация смартфона) камера автоматически увеличивает FOV:
   ```typescript
   const aspect = w / h;
   this.camera.fov = aspect < 1.0 ? 52 : 42;
   this.camera.updateProjectionMatrix();
   ```
   Это гарантирует, что разворот книги не обрезается по бокам на экранах iPhone и Android.
3. **Сенсорные жесты и тактильный отклик (Haptic Feedback):**
   - Поддержка горизонтального свайпа для перелистывания страниц.
   - Микровибрация смартфона (`navigator.vibrate(14)`) в момент завершения переворота страницы для создания физического ощущения тактильного контакта с бумагой.
4. **Адаптивная типографика:**
   Использование флюидных шрифтов `clamp()` для плавного масштабирования на экранах от 360px до 1920px.

---

## 6. Готовые модули и интеграция

В репозиторий проекта добавлены готовые протестированные модули:
1. `src/three/bookPalette.ts` — централизованная типизированная палитра и параметры света.
2. `src/three/luxuryTextures.ts` — Canvas 2D движок генерации обложки и разворотов страниц в разрешении 1400×1880 px с тиснением и сакральной геометрией.
3. Готовый блок стилей для `src/App.css` (см. раздел ниже).

---

## 7. Готовый фрагмент стилей: `src/App.css` (Luxury Light Theme)

```css
:root {
  /* Эстетика: Французский арт-бук, слоновая кость, сусальное золото, винный акцент */
  --bg: #F2EDE4;
  --bg-stage: radial-gradient(ellipse at 50% 40%, #FAF6EE 0%, #E8DFD0 75%, #DCD2C1 100%);
  --panel: rgba(248, 245, 238, 0.92);
  --panel-card: rgba(255, 255, 255, 0.88);
  --border: rgba(198, 167, 107, 0.35);
  --border-subtle: rgba(198, 167, 107, 0.18);
  --gold: #C6A76B;
  --gold-dim: #8F723E;
  --gold-light: #F3E5C8;
  --wine: #5C192E;
  --wine-hover: #7D2641;
  --wine-pressed: #421120;
  --ink: #201C24;
  --ink-secondary: #564F5E;
  --dim: #867E8E;
  --err: #9E2A2B;
  --shadow-luxury: 0 16px 40px rgba(60, 45, 30, 0.08);
  --shadow-card: 0 4px 16px rgba(70, 55, 45, 0.05);
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  -webkit-font-smoothing: antialiased;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  box-shadow: var(--shadow-luxury);
  background: var(--panel);
}

.stage {
  position: relative;
  width: 100%;
  height: clamp(340px, 50vh, 520px);
  background: var(--bg-stage);
  overflow: hidden;
}

.stage canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.hint {
  position: absolute;
  top: 18px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dim);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.panel {
  background: var(--panel);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  padding: 26px 32px 30px;
  min-height: 220px;
  position: relative;
}

.cover-screen {
  max-width: 440px;
  margin: 0 auto;
  text-align: center;
}

.cover-screen h2 {
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--wine);
  letter-spacing: 0.02em;
}

.cover-screen p.sub {
  margin: 0 0 20px;
  font-size: 15px;
  color: var(--ink-secondary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
}

.date-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

input[type='date'] {
  background: #FFFFFF;
  border: 1px solid var(--border);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 15px;
  padding: 10px 14px;
  border-radius: 6px;
  min-width: 175px;
  color-scheme: light;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type='date']:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(198, 167, 107, 0.25);
}

button {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, var(--wine) 0%, var(--wine-pressed) 100%);
  color: #F8F5EE;
  border: 1px solid rgba(198, 167, 107, 0.5);
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(92, 25, 46, 0.22);
  transition: all 0.2s ease;
}

button:hover {
  background: linear-gradient(135deg, var(--wine-hover) 0%, var(--wine) 100%);
  box-shadow: 0 6px 20px rgba(92, 25, 46, 0.32), 0 0 0 1px var(--gold);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0) scale(0.98);
}

button:disabled {
  opacity: 0.4;
  cursor: default;
  box-shadow: none;
  background: #C8C0B2;
  border-color: #DDD4C6;
  color: #7D7466;
}

.read-screen {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.read-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.chapter-count {
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--wine);
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.restart-link {
  font-size: 13px;
  color: var(--dim);
  background: none;
  border: none;
  box-shadow: none;
  text-decoration: underline;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.restart-link:hover {
  color: var(--wine);
  background: none;
  box-shadow: none;
}

.chapter-title {
  font-size: 26px;
  font-weight: 600;
  margin: 0;
  color: var(--ink);
  letter-spacing: 0.01em;
}

.chapter-text {
  font-size: 18px;
  line-height: 1.7;
  color: var(--ink-secondary);
  margin: 0;
  max-width: 680px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 12px;
  max-width: 700px;
}

.card {
  background: var(--panel-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--gold);
  box-shadow: 0 8px 24px rgba(198, 167, 107, 0.18);
}

.card .num {
  font-size: 34px;
  font-weight: 600;
  color: var(--wine);
  line-height: 1;
}

.card .label {
  font-size: 13px;
  color: var(--ink-secondary);
  margin-top: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.read-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.read-nav button {
  min-width: 105px;
}

.read-nav button:first-child {
  background: transparent;
  color: var(--wine);
  border: 1px solid var(--border);
  box-shadow: none;
}

.read-nav button:first-child:hover {
  background: rgba(198, 167, 107, 0.1);
  border-color: var(--gold);
}

@media (max-width: 600px) {
  .panel {
    padding: 18px 16px 22px;
  }
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```
