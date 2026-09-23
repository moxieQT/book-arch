export interface RiskRule {
  id: string
  pattern: RegExp
  category: 'advertising_law' | 'medical_law' | 'fraud_prevention' | 'consumer_rights'
  severity: 'high' | 'medium' | 'low'
  title: string
  dangerExplanation: string
  safeReplacement: string
}

export const LEGAL_RULES: RiskRule[] = [
  {
    id: 'heal_organs',
    pattern: /исцелен(ие|ия|ием)\s+(систем\s+)?органов|лечен(ие|ия|ием)\s+орган/gi,
    category: 'medical_law',
    severity: 'high',
    title: 'Обещание медицинского исцеления органов (ФЗ № 323-ФЗ)',
    dangerExplanation:
      'Использование терминов «исцеление органов» без лицензии Минздрава РФ квалифицируется как незаконное целительство или безлицензионная медицинская деятельность (ст. 6.2 КоАП РФ).',
    safeReplacement: 'вибрационная гармонизация психоэмоционального состояния и снятие соматического напряжения'
  },
  {
    id: 'disease_cure',
    pattern: /лечени(е|я)|излечени(е|я)|исцел(ю|ит|им)\s+от\s+болезн|снять\s+диагноз/gi,
    category: 'medical_law',
    severity: 'high',
    title: 'Прямые заявления о лечении заболеваний',
    dangerExplanation:
      'Любое обещание излечения болезней нарушает ст. 7 ФЗ «О рекламе» и ст. 50 ФЗ № 323-ФЗ.',
    safeReplacement: 'практика глубокой релаксации и гармонизации самочувствия'
  },
  {
    id: 'magic_curse',
    pattern: /снят(ие|ь)\s+порч[иеу]|сглаз[аеу]?|родов(ое|ого)\s+проклят(ие|ия)|приворот[ае]?/gi,
    category: 'fraud_prevention',
    severity: 'high',
    title: 'Использование терминов «порча», «сглаз», «приворот» (риск ст. 159 УК РФ)',
    dangerExplanation:
      'Взимание денег под предлогом снятия порчи или наведения приворота активно преследуется по ст. 159 УК РФ («Мошенничество») и является главным триггером законопроекта о запрете тарологов.',
    safeReplacement: 'исследование деструктивных психологических установок и работа с повторяющимися родовыми сценариями'
  },
  {
    id: 'guaranteed_future',
    pattern: /гарантир(ованно|ую|уем)\s+будущ|100%\s+предсказан|точно\s+узна(ете|ть)\s+будущ/gi,
    category: 'advertising_law',
    severity: 'high',
    title: 'Обещание гарантированного предсказания будущего',
    dangerExplanation:
      'Прямое обещание предопределенного будущего подпадает под законопроекты Госдумы о запрете услуг тарологов и нарушает ст. 10 Закона о защите прав потребителей.',
    safeReplacement: 'символический анализ вероятностей и точек личного выбора в текущей динамике'
  },
  {
    id: 'love_return_guarantee',
    pattern: /верн(у|ем)\s+муж[ая]|возврат\s+партнер[ая]|100%\s+люб(овь|ви)/gi,
    category: 'consumer_rights',
    severity: 'high',
    title: 'Гарантии влияния на волю третьего лица',
    dangerExplanation:
      'Обещание вернуть партнера нарушает ЗоЗПП (недостоверная реклама, невозможность исполнения обязательства).',
    safeReplacement: 'разбор динамики созависимых отношений и обретение внутренней устойчивости'
  },
  {
    id: 'magic_cleaning_sale',
    pattern: /больш(ая|ую)\s+чистк(а|у)\s+за\s+\d+|прода(м|ем)\s+ритуальн(ую|ой)\s+чистк/gi,
    category: 'advertising_law',
    severity: 'medium',
    title: 'Публичная прямая продажа «ритуальной чистки»',
    dangerExplanation:
      'Прямая реклама магических чисток в открытом доступе привлекает внимание надзорных органов (ФАС РФ). Чистка допустима только как индивидуальное решение после личной диагностики.',
    safeReplacement: 'индивидуальное энергетическое центрирование по результатам предварительного диалога'
  },
  {
    id: 'money_channel_open',
    pattern: /откры(ть|тие)\s+денежн(ого)?\s+канал[ае]|разбогате(ете|ешь)\s+после\s+сесси/gi,
    category: 'consumer_rights',
    severity: 'medium',
    title: 'Обещание обогащения или открытия денежного канала',
    dangerExplanation:
      'Финансовые обещания в эзотерике часто становятся предметом жалоб в Роспотребнадзор и судебных исков о компенсации.',
    safeReplacement: 'проработка ограничивающих установок в теме финансов и проявленности'
  }
]

export interface AuditResult {
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  hasDisclaimer: boolean
  matchedRules: {
    rule: RiskRule
    matchedText: string
  }[]
  recommendations: string[]
}

export function auditTextLegalRisks(text: string): AuditResult {
  const matches: { rule: RiskRule; matchedText: string }[] = []

  for (const rule of LEGAL_RULES) {
    const found = text.match(rule.pattern)
    if (found) {
      matches.push({
        rule,
        matchedText: found[0]
      })
    }
  }

  const hasDisclaimer =
    /не\s+является\s+медицинск|информационно-консультационн|самопознани|18\+|для\s+совершеннолетних/i.test(
      text
    )

  let score = 100
  for (const m of matches) {
    if (m.rule.severity === 'high') score -= 25
    else if (m.rule.severity === 'medium') score -= 15
    else score -= 8
  }

  if (!hasDisclaimer && text.length > 80) {
    score -= 15
  }

  score = Math.max(0, Math.min(100, score))

  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (score < 60) riskLevel = 'high'
  else if (score < 85) riskLevel = 'medium'

  const recommendations: string[] = []
  if (matches.length > 0) {
    recommendations.push(
      `Обнаружено ${matches.length} опасных формулировок, вызывающих юридические риски по законодательству РФ.`
    )
  }
  if (!hasDisclaimer && text.length > 80) {
    recommendations.push(
      'Рекомендуется добавить обязательную правовую оговорку (дисклеймер) о том, что услуга носит информационно-консультационный характер и не заменяет медицинскую помощь.'
    )
  }
  if (matches.some((m) => m.rule.category === 'medical_law')) {
    recommendations.push(
      'КРИТИЧНО: Исключите любые упоминания «исцеления органов» и «лечения». Замените на гармонизацию психоэмоционального фона.'
    )
  }
  if (matches.some((m) => m.rule.category === 'fraud_prevention')) {
    recommendations.push(
      'ВАЖНО: Исключите слова «порча», «сглаз», «приворот». Замените на психологические и архетипические термины.'
    )
  }

  return {
    score,
    riskLevel,
    hasDisclaimer,
    matchedRules: matches,
    recommendations
  }
}
