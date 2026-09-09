export interface ArchetypeFigure {
  id: string
  name: string
  tradition: string
  type: 'high' | 'shadow' | 'threshold'
  aspect: string
  description: string
  status: 'approved' | 'candidate' | 'mandatory'
}

export interface ArcanaPantheon {
  arcanaId: number
  highFigures: ArchetypeFigure[]
  shadowFigures: ArchetypeFigure[]
}

export const PANTHEON_DATA: Record<number, ArcanaPantheon> = {
  1: {
    arcanaId: 1,
    highFigures: [
      {
        id: 'hermes-trismegistus',
        name: 'Гермес Трисмегист',
        tradition: 'Герметизм / Египет',
        type: 'high',
        aspect: 'Мастер Слова и первичных космических законов',
        description: 'Связующее звено между небом и землей, проводник изначальной созидательной воли.',
        status: 'approved',
      },
      {
        id: 'thoth',
        name: 'Тот',
        tradition: 'Древний Египет',
        type: 'high',
        aspect: 'Бог мудрости, письма и счета',
        description: 'Упорядочиватель мыслей и владыка творящего глагола.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'loki-trickster',
        name: 'Локи (Трикстер)',
        tradition: 'Скандинавская мифология',
        type: 'shadow',
        aspect: 'Искажение истины ради забавы или власти',
        description: 'Интеллектуальная манипуляция, иллюзионизм и расщепление доверия.',
        status: 'approved',
      },
    ],
  },
  2: {
    arcanaId: 2,
    highFigures: [
      {
        id: 'isis-veiled',
        name: 'Исида под Покрывалом',
        tradition: 'Древний Египет',
        type: 'high',
        aspect: 'Хранительница сокровенных тайн и интуиции',
        description: 'Лунная богиня, знающая тайные имена богов и держащая свиток закона.',
        status: 'mandatory',
      },
      {
        id: 'shekhinah',
        name: 'Шехина',
        tradition: 'Каббалистическая традиция',
        type: 'high',
        aspect: 'Божественное женское присутствие в мире',
        description: 'Обитель святости, чистое отражение небесного света в земных водах.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'hecate-dark-moon',
        name: 'Геката (Тёмная Луна)',
        tradition: 'Древняя Греция',
        type: 'shadow',
        aspect: 'Лабиринт невысказанного и морок подсознания',
        description: 'Холодное молчание, парализующая тайна и удушающая пассивность.',
        status: 'approved',
      },
    ],
  },
  3: {
    arcanaId: 3,
    highFigures: [
      {
        id: 'demeter',
        name: 'Деметра / Великая Мать',
        tradition: 'Элевсинские мистерии',
        type: 'high',
        aspect: 'Щедрое плодородие и безусловное питание жизни',
        description: 'Сила, которая взращивает зерно и благословляет чувственное цветение материи.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'kali-devouring',
        name: 'Кали (в аспекте Пожирающей Матери)',
        tradition: 'Ведическая традиция',
        type: 'shadow',
        aspect: 'Удушающая опека и ревность к автономии',
        description: 'Мать, которая не отпускает рожденное ею дитя, требуя подчинения.',
        status: 'approved',
      },
    ],
  },
  4: {
    arcanaId: 4,
    highFigures: [
      {
        id: 'zeus-sovereign',
        name: 'Зевс Покровитель / Суверен',
        tradition: 'Древняя Греция',
        type: 'high',
        aspect: 'Устроитель космического порядка и щит рода',
        description: 'Мудрый правитель, держащий баланс закона и защищающий границы владений.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'cronus-devouring',
        name: 'Кронос / Ригидный Тиран',
        tradition: 'Древняя Греция',
        type: 'shadow',
        aspect: 'Страх утери власти и подавление живого',
        description: 'Пожирание нового из панического страха быть свергнутым.',
        status: 'approved',
      },
    ],
  },
  5: {
    arcanaId: 5,
    highFigures: [
      {
        id: 'chiron-mentor',
        name: 'Хирон (Мудрый Кентавр)',
        tradition: 'Греческая мифология',
        type: 'high',
        aspect: 'Раненый целитель и великий учитель героев',
        description: 'Передача сакрального опыта через принятие собственной уязвимости.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'grand-inquisitor',
        name: 'Великий Инквизитор',
        tradition: 'Архетипы Достоевского',
        type: 'shadow',
        aspect: 'Догматизм и подмена веры жесткой системой правил',
        description: 'Уничтожение живого духа ради сохранения буквы закона и авторитета.',
        status: 'approved',
      },
    ],
  },
  6: {
    arcanaId: 6,
    highFigures: [
      {
        id: 'psyche-eros',
        name: 'Психея и Эрос',
        tradition: 'Античный миф',
        type: 'high',
        aspect: 'Сакральный алхимический брак Души и Любви',
        description: 'Пройти через испытания неведения к сознательному вечному союзу.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'narcissus',
        name: 'Нарцисс',
        tradition: 'Греческая мифология',
        type: 'shadow',
        aspect: 'Неспособность любить другого, плен собственного отражения',
        description: 'Поиск идеала, приводящий к изоляции и страху подлинной близости.',
        status: 'approved',
      },
    ],
  },
  7: {
    arcanaId: 7,
    highFigures: [
      {
        id: 'hanuman-warrior',
        name: 'Хануман (Воин Пути)',
        tradition: 'Ведическая традиция',
        type: 'high',
        aspect: 'Абсолютная преданность, сила, преодоление препятствий и служение высшей цели',
        description: 'Великий преданный, способный перепрыгнуть океан и двигать горы во имя миссии.',
        status: 'mandatory',
      },
      {
        id: 'arjuna',
        name: 'Арджуна на Колеснице Кришны',
        tradition: 'Бхагавад-гита',
        type: 'high',
        aspect: 'Удержание поводьев чувств в битве жизни',
        description: 'Воин духа, действующий без привязанности к плодам победы.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'ares-blind-rage',
        name: 'Арес / Слепой Завоеватель',
        tradition: 'Древняя Греция',
        type: 'shadow',
        aspect: 'Агрессивное продавливание и выгорание в борьбе',
        description: 'Движение ради самоутверждения, сметающее всё на пути и сеющее разруху.',
        status: 'approved',
      },
    ],
  },
  8: {
    arcanaId: 8,
    highFigures: [
      {
        id: 'maat-feather',
        name: 'Маат (Владычица Истины)',
        tradition: 'Древний Египет',
        type: 'high',
        aspect: 'Космический баланс, перо правды и взвешивание сердец',
        description: 'Изначальный мировой порядок, где правда не может быть подкуплена или искажена.',
        status: 'approved',
      },
      {
        id: 'themis',
        name: 'Фемида',
        tradition: 'Древняя Греция',
        type: 'high',
        aspect: 'Божественное правосудие и беспристрастность',
        description: 'Весы в руке и повязка на глазах — неподкупное зрение высшего закона.',
        status: 'approved',
      },
      {
        id: 'lady-portia',
        name: 'Леди Порция',
        tradition: 'Эзотерическая традиция',
        type: 'high',
        aspect: 'Богиня Справедливости и Божественной Милости',
        description: 'Соединение строгости закона с милосердием прощения.',
        status: 'candidate',
      },
      {
        id: 'tyr',
        name: 'Тюр',
        tradition: 'Скандинавский пантеон',
        type: 'high',
        aspect: 'Честь, клятва и жертвенность ради порядка',
        description: 'Бог Тинга, положивший руку в пасть Фенрира ради спасения мироздания.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'nemesis-retribution',
        name: 'Немезида (Тень Неотвратимости)',
        tradition: 'Древняя Греция',
        type: 'shadow',
        aspect: 'Энергия последствий, воздаяния и восстановления меры через сокрушение гордыни',
        description: 'Беспощадное кармическое зеркало, карающее высокомерие без капли сострадания.',
        status: 'approved',
      },
    ],
  },
  9: {
    arcanaId: 9,
    highFigures: [
      {
        id: 'gautama-buddha',
        name: 'Гаутама Будда',
        tradition: 'Буддийская традиция',
        type: 'high',
        aspect: 'Внутреннее пробуждение, созерцание и выход из автоматизма',
        description: 'Обретение просветления под деревом Бодхи и зажжение внутреннего неугасимого светильника.',
        status: 'mandatory',
      },
      {
        id: 'lao-tzu',
        name: 'Лао-цзы',
        tradition: 'Даосизм',
        type: 'high',
        aspect: 'Мудрость недеяния (У-вэй) и следование Дао',
        description: 'Старец, ушедший на запад на черном буйволе, оставив книгу высшей мудрости.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'diogenes-cynic',
        name: 'Циничный Затворник / Диоген в бочке',
        tradition: 'Античность',
        type: 'shadow',
        aspect: 'Высокомерное отчуждение от людей и обесценивание тепла',
        description: 'Побег в интеллектуальное превосходство от страха быть отвергнутым миром.',
        status: 'approved',
      },
    ],
  },
  10: {
    arcanaId: 10,
    highFigures: [
      {
        id: 'tyche-fortuna',
        name: 'Тюхе / Фортуна Потока',
        tradition: 'Античность',
        type: 'high',
        aspect: 'Рог изобилия и чуткость к каиросу (моменту удачи)',
        description: 'Умение скользить на гребне перемен и доверять благому замыслу Вселенной.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'ananke-fatalism',
        name: 'Ананке (Неотвратимый Рок)',
        tradition: 'Греческая мифология',
        type: 'shadow',
        aspect: 'Бессильный фатализм и страх перед переменами',
        description: 'Ощущение себя беспомощной щепкой в водовороте бессмысленных случайностей.',
        status: 'approved',
      },
    ],
  },
  11: {
    arcanaId: 11,
    highFigures: [
      {
        id: 'durga-lion',
        name: 'Дурга на Льве',
        tradition: 'Ведическая традиция',
        type: 'high',
        aspect: 'Непобедимая благость, побеждающая демонов кротостью и силой',
        description: 'Богиня-воительница, соединившая сияние всех богов для защиты мироздания.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'berserker-rage',
        name: 'Берсерк / Подавленный Зверь',
        tradition: 'Северная традиция',
        type: 'shadow',
        aspect: 'Неконтролируемая ярость либо полный паралич воли',
        description: 'Раскол между разумом и инстинктом, ведущий к вспышкам самоуничтожения.',
        status: 'approved',
      },
    ],
  },
  12: {
    arcanaId: 12,
    highFigures: [
      {
        id: 'odin-yggdrasil',
        name: 'Один на Иггдрасиле',
        tradition: 'Скандинавская мифология',
        type: 'high',
        aspect: 'Добровольное посвящение ради обретения рун мудрости',
        description: 'Девять ночей висения на Древе Мира ради преображения земного взгляда в знание тайн.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'eternal-victim',
        name: 'Вечная Жертва',
        tradition: 'Психоаналитический архетип',
        type: 'shadow',
        aspect: 'Манипуляция через страдание и добровольный паралич',
        description: 'Отказ от авторства своей жизни в обмен на моральное право обвинять других.',
        status: 'approved',
      },
    ],
  },
  13: {
    arcanaId: 13,
    highFigures: [
      {
        id: 'phoenix-fire',
        name: 'Феникс Возрождающийся',
        tradition: 'Древний Египет / Античность',
        type: 'high',
        aspect: 'Преображение сквозь пламя очищения',
        description: 'Сжигание старых крыльев ради рождения в непреходящем теле света.',
        status: 'approved',
      },
      {
        id: 'persephone-queen',
        name: 'Персефона — Царица Подземного Царства',
        tradition: 'Элевсин',
        type: 'high',
        aspect: 'Владычица глубин и перерождения семени',
        description: 'Проводник между миром живых и сокровищницей предков.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'thanatos-destructive',
        name: 'Танатос / Ледяное Оцепенение',
        tradition: 'Греческая традиция',
        type: 'shadow',
        aspect: 'Тяга к разрушению и панический ужас финала',
        description: 'Цепляние за разлагающееся прошлое из страха сделать шаг в новое.',
        status: 'approved',
      },
    ],
  },
  14: {
    arcanaId: 14,
    highFigures: [
      {
        id: 'archangel-raphael',
        name: 'Архангел Рафаил (Исцелитель Божий)',
        tradition: 'Авраамическая традиция',
        type: 'high',
        aspect: 'Золотое исцеление, мир в душе и божественная соразмерность',
        description: 'Смешивание эликсиров жизни с точностью космических пропорций.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'stagnant-marsh',
        name: 'Застойные Воды / Безволие',
        tradition: 'Психологический архетип',
        type: 'shadow',
        aspect: 'Гнилой компромисс и смерть страсти',
        description: 'Попытка угодить всем, стирающая индивидуальность в безликую серую массу.',
        status: 'approved',
      },
    ],
  },
  15: {
    arcanaId: 15,
    highFigures: [
      {
        id: 'pan-vital',
        name: 'Пан Пробужденный / Дионис',
        tradition: 'Древняя Греция',
        type: 'high',
        aspect: 'Священный экстаз жизни, природный магнетизм и свобода желаний',
        description: 'Осознание материи как храма божественного духа без чувства стыда.',
        status: 'approved',
      },
      {
        id: 'lucifer-lightbearer',
        name: 'Люцифер (в исконном смысле Светоносца / Прометея)',
        tradition: 'Мистериальная традиция',
        type: 'high',
        aspect: 'Огонь пробуждения индивидуального разума',
        description: 'Смелость преодолеть инфантильный рай ради зрелой земной силы.',
        status: 'candidate',
      },
    ],
    shadowFigures: [
      {
        id: 'baphomet-chains',
        name: 'Бафомет / Владыка Зависимостей',
        tradition: 'Оккультная традиция',
        type: 'shadow',
        aspect: 'Слепая одержимость золотом, властью и чувственными цепями',
        description: 'Иллюзия обладания, которая превращает человека в раба собственных аппетитов.',
        status: 'approved',
      },
    ],
  },
  16: {
    arcanaId: 16,
    highFigures: [
      {
        id: 'shiva-nataraja',
        name: 'Шива Натараджа (Космический Танцор)',
        tradition: 'Ведическая традиция',
        type: 'high',
        aspect: 'Разрушение иллюзии майи ради освобождения духа',
        description: 'Танец разрушения отживших миров, расчищающий пространство для нового творения.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'babylonian-builder',
        name: 'Строитель Вавилона / Гордец',
        tradition: 'Библейский миф',
        type: 'shadow',
        aspect: 'Бессмысленное упрямство и катастрофа закостенелого эго',
        description: 'Создание иллюзорных крепостей, погребающих под своими обломками душу.',
        status: 'approved',
      },
    ],
  },
  17: {
    arcanaId: 17,
    highFigures: [
      {
        id: 'saraswati',
        name: 'Сарасвати',
        tradition: 'Ведическая традиция',
        type: 'high',
        aspect: 'Поток искусств, чистого вдохновения и созидательной верности пути',
        description: 'Богиня на белом лебеде с виной в руках, проводящая небесную гармонию на землю.',
        status: 'approved',
      },
      {
        id: 'astrea-star',
        name: 'Астрея (Звездная Дева)',
        tradition: 'Античность',
        type: 'high',
        aspect: 'Чистота идеала и свет золотого века',
        description: 'Небесная дева, сияющая путеводной звездой для странников духа.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'cold-mirage',
        name: 'Холодный Мираж',
        tradition: 'Психологический архетип',
        type: 'shadow',
        aspect: 'Бесплодное витание в облаках и высокомерная недосягаемость',
        description: 'Жизнь в мечтах без готовности сделать хоть один шаг по реальной земле.',
        status: 'approved',
      },
    ],
  },
  18: {
    arcanaId: 18,
    highFigures: [
      {
        id: 'selene-chariot',
        name: 'Селена (Серебряная Ладья)',
        tradition: 'Древняя Греция',
        type: 'high',
        aspect: 'Глубокая интуиция, пророческие сны и контакт с первозданной памятью',
        description: 'Серебряный свет, освещающий тайные тропы ночного моря бессознательного.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'lilith-night-terrors',
        name: 'Лилит (в аспекте Ночных Мороков)',
        tradition: 'Древнееврейский миф',
        type: 'shadow',
        aspect: 'Паранойя, тревожные наваждения и страх перед призраками прошлого',
        description: 'Блуждание в тумане сомнений, искажающее реальность в зловещий кошмар.',
        status: 'approved',
      },
    ],
  },
  19: {
    arcanaId: 19,
    highFigures: [
      {
        id: 'apollo-helios',
        name: 'Аполлон / Гелиос',
        tradition: 'Древняя Греция',
        type: 'high',
        aspect: 'Ясность сознания, творческий гений и щедрое тепло жизни',
        description: 'Бог света и гармонии, разгоняющий тьму невежества золотыми стрелами истины.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'phaethon-scorcher',
        name: 'Фаэтон / Ослепленный Гордец',
        tradition: 'Античный миф',
        type: 'shadow',
        aspect: 'Нарциссическое самолюбование и выжигание близких своим эго',
        description: 'Неумение управлять солнечной колесницей, оборачивающееся пожаром для окружающих.',
        status: 'approved',
      },
    ],
  },
  20: {
    arcanaId: 20,
    highFigures: [
      {
        id: 'archangel-gabriel',
        name: 'Архангел Гавриил с Трубой',
        tradition: 'Авраамическая традиция',
        type: 'high',
        aspect: 'Зов пробуждения, раскрытие родовых узлов и освобождение от оков прошлого',
        description: 'Голос, призывающий душу выйти из склепа старых обид в вечную жизнь правды.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'relentless-accuser',
        name: 'Неумолимый Обвинитель',
        tradition: 'Психоаналитический архетип',
        type: 'shadow',
        aspect: 'Груз родовой вины, проклятия и застревание в непрощении предков',
        description: 'Бесконечный суд над собой и родителями, блокирующий право на счастье.',
        status: 'approved',
      },
    ],
  },
  21: {
    arcanaId: 21,
    highFigures: [
      {
        id: 'sophia-universal',
        name: 'София Премудрость Божья',
        tradition: 'Гностицизм / Христианский мистицизм',
        type: 'high',
        aspect: 'Космический венец, архитектура Вселенной и интеграция всех планов бытия',
        description: 'Священный танец творения в центре уробороса, знающий исток и финал всех вещей.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'golden-cage',
        name: 'Золотая Клетка / Страх Финала',
        tradition: 'Психологический архетип',
        type: 'shadow',
        aspect: 'Страх сделать завершающий шаг в неизвестность',
        description: 'Уютная замкнутость в достигнутом, препятствующая переходу на новый квантовый уровень.',
        status: 'approved',
      },
    ],
  },
  22: {
    arcanaId: 22,
    highFigures: [
      {
        id: 'dionysus-divine-child',
        name: 'Божественный Шут / Дитя Света',
        tradition: 'Мистерии Орфея',
        type: 'high',
        aspect: 'Чистая первозданная свобода, прыжок веры в бездну и квантовое доверие',
        description: 'Странник без дорожного мешка, для которого весь мир — распахнутый дом чудес.',
        status: 'approved',
      },
    ],
    shadowFigures: [
      {
        id: 'blind-wanderer',
        name: 'Безумный Бродяга / Саботажник',
        tradition: 'Психоанализ',
        type: 'shadow',
        aspect: 'Инфантильный побег от последствий и разрушение начатого',
        description: 'Отказ взрослеть, маскирующийся под свободу и обрекающий на вечный хаос.',
        status: 'approved',
      },
    ],
  },
}

export function getPantheonForArcana(arcanaId: number): ArcanaPantheon {
  return (
    PANTHEON_DATA[arcanaId] ?? {
      arcanaId,
      highFigures: [],
      shadowFigures: [],
    }
  )
}
