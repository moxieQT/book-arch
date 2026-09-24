import { ALINA_SERVICES, type AlinaService } from '../data/alinaServices'
import { MANAGER_INFO, type IndividualSession } from '../data/alinaPricing'

/** Главы лендинга: страница читается как книга, у каждой секции свой римский номер */
export const CHAPTERS = [
  { id: 'prologue', roman: 'I', label: 'Пролог' },
  { id: 'philosophy', roman: 'II', label: 'Философия' },
  { id: 'paths', roman: 'III', label: 'Пути' },
  { id: 'folio', roman: 'IV', label: 'Книга' },
  { id: 'codes', roman: 'V', label: 'Коды' },
  { id: 'sessions', roman: 'VI', label: 'Сессии' },
  { id: 'contact', roman: 'VII', label: 'Запись' },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']

export const NAV_LINKS: { id: ChapterId; label: string }[] = [
  { id: 'philosophy', label: 'Подход' },
  { id: 'paths', label: 'Направления' },
  { id: 'folio', label: 'Книга' },
  { id: 'sessions', label: 'Сессии' },
  { id: 'contact', label: 'Контакты' },
]

export const PILLARS = [
  {
    roman: 'I',
    title: 'Живой поток',
    text: 'У каждой программы есть ясная методология, но каждую группу Алина ведёт вживую — подстраиваясь под процессы конкретных людей.',
  },
  {
    roman: 'II',
    title: 'Без костылей',
    text: 'Задача не в том, чтобы привязать к себе. А в том, чтобы вы научились слышать своё сердце и доверять себе без внешних мастеров.',
  },
  {
    roman: 'III',
    title: 'Союз Света и Тени',
    text: 'Тень — не враг и не ошибка, а спящая сила. Её не уничтожают: её признают, и она возвращается ресурсом.',
  },
  {
    roman: 'IV',
    title: 'Голос и тело',
    text: 'Звучание голоса и бережная телесная работа проходят мимо фильтров ума и возвращают ощущение опоры и покоя.',
  },
]

export const STATS = [
  { value: 7, label: 'авторских направлений' },
  { value: 16, label: 'форматов личной работы' },
  { value: 6, label: 'потоков ченнелинга выпущено' },
  { value: 22, label: 'аркана в системе книги' },
  { value: 13, label: 'глав вашей личной книги' },
]

export const MARQUEE_ROWS = [
  ['Таро 5D', 'Ченнелинг', 'Вокальная терапия', 'Женская тантра', 'Тело и дыхание'],
  ['Работа с Тенью', 'Род и сценарии', 'Хроники Акаши', 'Архетипы', 'Эволюция Мастера'],
]

/** Семь авторских направлений (восьмая «услуга» — сама книга — живёт в своей главе) */
export const PATHS: AlinaService[] = ALINA_SERVICES.filter((s) => !s.isBook)

export const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI']

export const FOLIO_STEPS = [
  {
    title: 'Ключ — дата рождения',
    text: 'Книга открывается только по вашей дате: из неё складываются 16 персональных кодов.',
  },
  {
    title: '13 глав о вас',
    text: 'Код Души, Личность, Дар, Предназначение, Тень и Родовая формула — каждая глава раскрывает один аркан.',
  },
  {
    title: 'Свет и Тень рядом',
    text: 'Ресурс аркана и его теневая ловушка на одном развороте — как две стороны одной силы.',
  },
  {
    title: 'Пантеон и вопросы',
    text: 'Высокий и теневой архетипы из мифологий мира и вопросы для самонаблюдения к каждой главе.',
  },
]

/** Позиции, которые показываем в мини-раскладе после ввода даты */
export const CODE_POSITIONS = ['soul', 'personality', 'gift', 'destiny', 'shadow', 'integration'] as const

export const BOOKING_GREETING = 'Здравствуйте, Мария!'

export function telegramLink(message: string) {
  return `${MANAGER_INFO.telegramUrl}?text=${encodeURIComponent(message)}`
}

export function whatsappLink(message: string) {
  return `${MANAGER_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`
}

export function pathBookingMessage(service: AlinaService) {
  return `${BOOKING_GREETING} Хочу узнать подробнее и записаться к Алине на направление: «${service.title}»`
}

export function sessionBookingMessage(s: IndividualSession, optionIdx: number) {
  const o = s.options[optionIdx] ?? s.options[0]
  return `${BOOKING_GREETING} Хочу записаться к Алине на сессию: «${s.title}» (тариф: ${o.label} — ${o.price})`
}

export const LEGAL_DISCLAIMER = `Все услуги, материалы, онлайн-сессии, энергетические практики и консультации, представленные на данном сайте,
  носят исключительно информационно-консультационный, культурно-просветительский и духовно-познавательный характер
  и предназначены исключительно для совершеннолетних лиц (18+). Услуги направлены на самопознание, эмоциональную релаксацию
  и исследование архетипических моделей сознания. Они не являются медицинскими услугами, не заменяют диагностику,
  консультацию или лечение у дипломированных врачей и профильных специалистов здравоохранения.
  Авторские методы не содержат гарантий наступления фиксированных жизненных событий или предсказания будущего.`
