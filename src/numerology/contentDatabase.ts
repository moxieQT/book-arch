import { getArcana } from './arcanaData'
import { POSITIONS_REGISTRY } from './positions'
import { ALINE_ARCANA_DATA, type ArcanaCompleteData } from './data/alineExtractedData'

export interface ArcanaPositionContent {
  positionId: string
  arcanaId: number
  aspectName: string
  arcanaTitle: string
  roman: string
  coreEssence: string
  resource: string
  shadow: string
  lifeManifestations: {
    relationships: string
    careerAndMoney: string
    bodyAndSelf: string
  }
  innerTask: string
  highArchetype: {
    name: string
    aspect: string
    story?: string
    keyPhrase?: string
    tradition?: string
  }
  shadowArchetype: {
    name: string
    aspect: string
    story?: string
    keyPhrase?: string
    tradition?: string
  }
  reflectionQuestions: string[]
  integration: string
  evaluationQuestion?: string
}

export function getArcanaPositionContent(positionId: string, arcanaId: number): ArcanaPositionContent {
  const posDef = POSITIONS_REGISTRY[positionId] ?? POSITIONS_REGISTRY.soul
  const arcana = getArcana(arcanaId)
  const aData: ArcanaCompleteData | undefined = ALINE_ARCANA_DATA[arcanaId]

  const roman = arcana?.roman ?? (aData?.roman ?? String(arcanaId))
  const arcanaName = arcana?.name ?? (aData?.name ?? `Аркан ${roman}`)
  const arcanaTitle = `${roman} · ${arcanaName}`

  const highFigure = aData?.pantheon?.highFigures?.[0] ?? {
    name: arcana?.archetypeTitle?.split('/')[0]?.trim() ?? arcanaName,
    aspect: arcana?.lightKey ?? 'Светлое проявление',
    story: '',
    keyPhrase: '',
    tradition: 'Мифологическая традиция',
  }

  const shadowFigure = aData?.pantheon?.shadowFigures?.[0] ?? {
    name: `Теневой ${arcanaName}`,
    aspect: arcana?.shadowKey ?? 'Теневое проявление',
    story: '',
    keyPhrase: '',
    tradition: 'Психоаналитическая традиция',
  }

  let coreEssence = ''
  let resource = ''
  let shadow = ''
  let innerTask = ''
  let integration = ''
  let evaluationQuestion = ''
  let reflectionQuestions: string[] = []

  let relationships = aData?.soul?.relationships || `В отношениях Аркан ${arcanaName} проявляется через баланс близости и автономии.`
  let careerAndMoney = aData?.gift?.valueAndMoney || aData?.soul?.workAndMoney || `В реализации раскрывается способность создавать ценность через качества Аркана ${arcanaName}.`
  let bodyAndSelf = aData?.personality?.howSeen || `Тело тонко реагирует на баланс энергии и требует бережного внимания к состоянию.`

  if (positionId === 'soul') {
    coreEssence = aData?.soul?.nature || `Ваша глубинная сущность несет в себе природу Аркана ${arcanaName}. Это ваша подлинная внутренняя сила и способ чувствовать мир.`
    resource = aData?.soul?.resource || aData?.gift?.strength || arcana.lightKey
    shadow = aData?.soul?.shadow || arcana.shadowKey
    innerTask = aData?.soul?.innerTask || `Разрешить собственной природе свободно жить и не предавать свое внутреннее знание.`
    integration = aData?.soul?.integrationKey || `«Я разрешаю себе быть собой. Я доверяю своей внутренней силе и проявляю её без страха».`
    evaluationQuestion = 'Насколько я разрешаю себе быть собой, и насколько эта энергия сейчас свободно живет во мне?'
    reflectionQuestions = aData?.soul?.questions?.length
      ? aData.soul.questions
      : [
          `Насколько свободно я проявляю свою истинную суть в повседневных выборах?`,
          `В чем я до сих пор сдерживаю свой природный импульс из страха осуждения?`,
          `Что изменится в моей жизни, если я прямо сегодня позволю себе быть собой на 100%?`,
        ]
  } else if (positionId === 'personality') {
    coreEssence = aData?.personality?.howSeen
      ? `Как тебя считывают окружающие:
${aData.personality.howSeen}`
      : `Внешний социальный интерфейс Аркана ${arcanaName}: то, как вас впервые воспринимают люди и как вы входите в пространство.`
    resource = aData?.personality?.resource || arcana.lightKey
    shadow = aData?.personality?.shadow || arcana.shadowKey
    innerTask = aData?.personality?.task || `Проявлять себя органично, не превращая социальный образ в глухую броню.`
    integration = aData?.personality?.task || `Соединить внешнее проявление с подлинным внутренним состоянием.`
    evaluationQuestion = aData?.personality?.evalQuestion || 'Насколько свободно и честно я проявляю себя во внешнем мире?'
    reflectionQuestions = [
      'То, как меня видят другие, действительно соответствует тому, что происходит внутри меня?',
      'Не использую ли я свой привычный образ как маску, чтобы скрыть уязвимость?',
      'Где мое проявление естественно, а где я начинаю подстраиваться под чужие ожидания?',
    ]
  } else if (positionId === 'gift') {
    coreEssence = aData?.gift?.gift
      ? `${aData.gift.gift}

Почему ты можешь его не замечать: ${aData.gift.whyNotNotice}`
      : `Ваш врожденный талант и способ создавать ценность по Аркану ${arcanaName}.`
    resource = aData?.gift?.strength
      ? `Сила дара: ${aData.gift.strength}. Где ценен: ${aData.gift.whereValuable}`
      : arcana.lightKey
    shadow = aData?.gift?.obstacles || `Обесценивание привычной легкости («это же может каждый») или использование дара для заслуживания любви.`
    innerTask = aData?.gift?.howUnfold || `Учиться не только делать самой, но и передавать управление дальше, создавая ценность для мира.`
    integration = aData?.gift?.key || `«Мой дар — естественная сила, через которую я создаю ценность для себя и других».`
    evaluationQuestion = aData?.gift?.evalQuestion || 'Насколько я признаю и использую свой врожденный Дар?'
    reflectionQuestions = [
      'Что во мне уже является ресурсом, хотя я могла привыкнуть считать это совершенно обычным?',
      'В каких ситуациях мой природный талант приносит максимальную пользу другим?',
      'Что мешает мне монетизировать и масштабировать этот дар в полную силу?',
    ]
  } else if (positionId === 'destiny') {
    coreEssence = aData?.destiny?.essay || `Вектор предназначения по Аркану ${arcanaName}: направление, в котором ваша жизнь приглашает вас вырасти.`
    resource = aData?.higherPath?.higherVector || arcana.lightKey
    shadow = aData?.shadowLayer?.shadow || `Ловушка ожидания грандиозной миссии или откладывание жизни на «потом».`
    innerTask = `Освоить зрелую октаву ${arcanaName}а и научиться проводить эту созидательную энергию в конкретные материальные результаты.`
    integration = aData?.destiny?.key || `«Я двигаюсь в направлении своего большого вектора и становлюсь автором собственных решений».`
    evaluationQuestion = aData?.destiny?.evalQuestion || 'Насколько я чувствую, что двигаюсь в направлении своего большого внутреннего вектора?'
    reflectionQuestions = [
      'Во что меня постепенно приглашает вырасти моя собственная жизнь?',
      'Что я уже сегодня могу сделать с тем ресурсом, который находится прямо в моих руках?',
      'Какой страх мешает мне сделать следующий шаг в масштабе личности?',
    ]
  } else if (positionId === 'shadow') {
    coreEssence = aData?.shadowLayer?.shadow
      ? `Если Аркан ${arcanaName} стоит в позиции Тени:
${aData.shadowLayer.shadow}`
      : `Вытесненное качество или запрещенная сила по Аркану ${arcanaName}. То, что было когда-то заблокировано, но хранит колоссальный ресурс.`
    resource = aData?.shadowLayer?.resource || aData?.soul?.resource || arcana.lightKey
    shadow = aData?.shadowLayer?.shadow || arcana.shadowKey
    innerTask = `Признать вытесненную силу, снять с неё ярлык «неправильности» и вернуть этот витальный ресурс в сознательную жизнь.`
    integration = aData?.shadowLayer?.resource
      ? `Скрытый ресурс Тени: ${aData.shadowLayer.resource}. Легализуйте эту силу без стыда и чувства вины.`
      : `«Я признаю эту часть себя и возвращаю вытесненную силу в свое сердце».`
    evaluationQuestion = aData?.shadowLayer?.evalQuestion || 'Насколько я уже способна видеть эту часть себя без отрицания и стыда?'
    reflectionQuestions = [
      'Какую часть себя я называю неправильной, хотя именно в ней может находиться моя главная сила?',
      'Что в поведении других людей вызывает во мне самое резкое раздражение или тайную зависть?',
      'Как изменится моя жизнь, если я позволю этой энергии созидать, а не прятаться?',
    ]
  } else if (positionId === 'deep_shadow') {
    coreEssence = aData?.shadowLayer?.deepShadow
      ? `Если Аркан ${arcanaName} стоит в позиции Глубинной Тени:
${aData.shadowLayer.deepShadow}`
      : `Бессознательный слой и автоматический сценарий: программы защиты, включающиеся в моменты кризиса, потери контроля или сильной уязвимости.`
    resource = aData?.shadowLayer?.resource || arcana.lightKey
    shadow = aData?.shadowLayer?.deepShadow || arcana.shadowKey
    innerTask = `Научиться узнавать свой бессознательный сценарий прямо в момент его включения, не давая ему управлять решениями.`
    integration = `Осознанность разрушает автоматизм. Когда сценарий замечен — вы возвращаете себе свободу выбора.`
    evaluationQuestion = 'Насколько хорошо я уже узнаю этот глубинный сценарий в момент его включения?'
    reflectionQuestions = [
      'Что начинает управлять мной, когда я перестаю действовать осознанно?',
      'Какой повторяющийся сюжет я снова и снова проживаю в отношениях или делах?',
      'Что произойдет, если в критический момент я сделаю паузу вместо привычной реакции?',
    ]
  } else if (positionId === 'shadow_guardian') {
    coreEssence = aData?.shadowLayer?.shadowGuardian
      ? `Если Аркан ${arcanaName} стоит в позиции Стража:
${aData.shadowLayer.shadowGuardian}`
      : `Теневой Страж защищает старую идентичность и активируется перед новым масштабом, деньгами, любовью или смелым выбором.`
    resource = `Когда Страж интегрирован — он превращается в тонкое различение, здоровую границу, зрелую осторожность и непоколебимую внутреннюю защиту.`
    shadow = aData?.shadowLayer?.shadowGuardian || arcana.shadowKey
    innerTask = `Не бороться со Стражем, а признать его функцию: понять, от чего он вас бережет, и сделать шаг в расширение без перфекционизма.`
    integration = `Страж ослабевает, когда вы разрешаете себе влиять и расти, не требуя стопроцентного контроля над исходом событий.`
    evaluationQuestion = 'Насколько я умею узнавать своего Стража до того, как он остановит мой выбор?'
    reflectionQuestions = [
      'Что обычно происходит со мной прямо перед тем, как я готова выйти на новый уровень?',
      'От какой уязвимости или старой боли меня бессознательно защищает мой Теневой Страж?',
      'Какой смелый шаг я откладываю, потому что Страж требует идеальных гарантий безопасности?',
    ]
  } else if (positionId === 'higher_vector') {
    coreEssence = aData?.higherPath?.higherVector
      ? `Если Аркан ${arcanaName} стоит в Высшем Векторе:
${aData.higherPath.higherVector}`
      : `Зрелое раскрытие Аркана ${arcanaName}: внутренняя вертикаль и направление духовного взросления.`
    resource = aData?.higherPath?.higherVector || arcana.lightKey
    shadow = `Ловушка духовного идеализма: попытка сразу «играть высшую версию себя» вместо того, чтобы проживать реальный человеческий путь.`
    innerTask = `Соединить изначальную природу с вектором зрелости, действуя из внутренней собранности, а не из напряжения.`
    integration = `Высший Вектор раскрывается через состояние: «Я вижу возможность и умею превратить её в чистое движение жизни».`
    evaluationQuestion = 'Насколько эта зрелая энергия уже присутствует в моих решениях и жизни?'
    reflectionQuestions = [
      'Какой становлюсь я, когда перестаю жить только из автоматических реакций и начинаю осознанно раскрывать свою природу?',
      'В чем я уже сегодня чувствую проявление этой взрослой, мудрой октавы?',
      'Как мой Высший Вектор может служить не только мне, но и пространству вокруг?',
    ]
  } else if (positionId === 'divine_guide') {
    coreEssence = aData?.higherPath?.innerNavigation
      ? `Если Аркан ${arcanaName} стоит во Внутренней Навигации:
${aData.higherPath.innerNavigation}`
      : `Внутренний компас и способ слышать свою истину: как интуитивное ведение возвращает вас к себе после интеграции глубины.`
    resource = aData?.higherPath?.innerNavigation || arcana.lightKey
    shadow = `Передача собственной ответственности знакам, гуру, прогнозам или внешним духовным авторитетам.`
    innerTask = `Слышать внутренний компас и проверять его через конкретное точное действие в материальном мире.`
    integration = `К своему пути вы возвращаетесь через вопрос: «На что я реально могу повлиять сейчас?»`
    evaluationQuestion = 'Насколько я умею слышать внутренний ориентир, не отдавая ему ответственность за решения?'
    reflectionQuestions = [
      'Через какое состояние или действие я лучше всего слышу то, что для меня действительно верно?',
      'Не передаю ли я право выбора чужим подсказкам вместо опоры на собственный компас?',
      'Какой конкретный шаг прямо сейчас вернет меня в состояние ясности?',
    ]
  } else if (positionId === 'integration') {
    coreEssence = `Точка Интеграции объединяет вашего Теневого Стража и Божественного Проводника. В энергиях Аркана ${arcanaTitle} происходит алхимический союз Света и Тени. Вы перестаете воевать с собой и собираете разрозненные грани опыта в единую симфонию зрелости.`
    resource = `Колоссальная высвобожденная витальность: ${aData?.soul?.resource || arcana.lightKey}. Тень становится фундаментом вашей непоколебимой силы.`
    shadow = `Иллюзия «я полностью завершила путь». Интеграция — это не застывший монумент, а живой процесс ежедневного выбора из полноты.`
    innerTask = `Перестать делить себя на «правильное» и «неправильное». Дать каждой грани психики достойную созидательную роль.`
    integration = aData?.soul?.integrationKey || `«Я едина. Мой Свет и моя Тень служат моему созиданию. Я выбираю жизнь во всей её полноте».`
    evaluationQuestion = 'Насколько сейчас мои разные стороны действительно сотрудничают друг с другом?'
    reflectionQuestions = [
      'Какой я становлюсь, когда больше не пытаюсь уничтожить одну часть себя ради другой?',
      'Где в моей жизни противоположности уже соединились в новую гармонию?',
      'Как я могу праздновать свою многогранность прямо сейчас?',
    ]
  } else {
    // РОДОВЫЕ ПОЗИЦИИ (Мужской и Женский род V0.7)
    const isMale = posDef.group === 'ancestral_male'
    const lineKind = posDef.id.includes('spiritual')
      ? 'resource'
      : posDef.id.includes('material')
      ? 'shadow'
      : 'transform'

    if (lineKind === 'resource') {
      coreEssence = `Что передал ${isMale ? 'мужской' : 'женский'} род: по Аркану ${arcanaTitle} передается родовая сила, способ действия, опора, чувственность и природный талант ветви предков.`
      resource = aData?.gift?.gift || aData?.soul?.resource || arcana.lightKey
      shadow = `Опасность забыть о корнях или обесценить то, что предки выстрадали и передали как дар.`
      innerTask = `Принять родовую силу с благодарностью и опереться на неё в своей судьбе.`
      integration = `«Я беру силу, опыт и благословение моего рода. Этот ресурс принадлежит мне по праву рождения».`
      evaluationQuestion = `Насколько я чувствую и принимаю ресурс ${isMale ? 'мужской' : 'женской'} линии рода?`
    } else if (lineKind === 'shadow') {
      coreEssence = `Повторяющийся сценарий ${isMale ? 'мужского' : 'женского'} рода: по Аркану ${arcanaTitle} передавался паттерн напряжения — способ обращения с силой, деньгами, чувствами или безопасностью.`
      resource = aData?.shadowLayer?.resource || arcana.lightKey
      shadow = aData?.shadowLayer?.deepShadow || aData?.shadowLayer?.shadow || arcana.shadowKey
      innerTask = `Увидеть родовую боль без осуждения предков и осознать: вы не обязаны повторять этот сценарий ценой своей жизни.`
      integration = `«Я вижу ваш путь и уважаю вашу судьбу. Но я выбираю не повторять эту боль в своей жизни».`
      evaluationQuestion = `Насколько я свободна от необходимости воспроизводить старые сценарии ${isMale ? 'мужской' : 'женской'} линии?`
    } else {
      coreEssence = `Новая норма ${isMale ? 'мужской' : 'женской'} линии: по Аркану ${arcanaTitle} вы способны завершить старый сценарий рода и утвердить другой способ жизни в материальном мире.`
      resource = aData?.higherPath?.higherVector || aData?.soul?.resource || arcana.lightKey
      shadow = `Ложное чувство вины: «Если я буду жить счастливо и богато, я предам память страдающих предков».`
      innerTask = `Стать тем человеком, через которого род получает новую норму процветания, любви и достоинства.`
      integration = `«Я перевожу силу рода в созидание, радость и новую норму. В моей жизни это станет процветанием».`
      evaluationQuestion = `Насколько я уже выбираю собственный свободный путь, сохраняя при этом силу рода?`
    }

    reflectionQuestions = [
      `Какую силу я унаследовала от предков, даже если раньше её не замечала?`,
      `Какой сценарий я больше не согласна повторять в собственной жизни?`,
      `Какую новую норму я хочу передать дальше своим детям и миру?`,
    ]
  }

  return {
    positionId,
    arcanaId,
    aspectName: posDef.name,
    arcanaTitle,
    roman,
    coreEssence,
    resource,
    shadow,
    lifeManifestations: {
      relationships,
      careerAndMoney,
      bodyAndSelf,
    },
    innerTask,
    highArchetype: {
      name: highFigure.name,
      aspect: highFigure.aspect,
      story: highFigure.story,
      keyPhrase: highFigure.keyPhrase,
      tradition: highFigure.tradition,
    },
    shadowArchetype: {
      name: shadowFigure.name,
      aspect: shadowFigure.aspect,
      story: shadowFigure.story,
      keyPhrase: shadowFigure.keyPhrase,
      tradition: shadowFigure.tradition,
    },
    reflectionQuestions,
    integration,
    evaluationQuestion,
  }
}
