export function ApproachSection() {
  const pillars = [
    {
      num: 'I',
      title: 'Индивидуальное ведение в потоке',
      desc: 'Несмотря на четкую методологию уроков, каждый процесс и группу я веду в живом потоке, ювелирно сонастраиваясь с процессами каждого человека.'
    },
    {
      num: 'II',
      title: 'Отказ от внешних костылей',
      desc: 'Моя задача — не привязать вас к себе, а научить слышать свое сердце, доверять своей системе и обходиться без помощи мастеров в дальнейшем.'
    },
    {
      num: 'III',
      title: 'Священный союз Света и Тени',
      desc: 'Тень — это не враг и не ошибка. Это спящая сила. Мы учимся признавать ее, трансформировать страхи и возвращать целостность.'
    },
    {
      num: 'IV',
      title: 'Чистота звука и бережность тела',
      desc: 'Голосовые вибрации и мягкая соматическая работа позволяют миновать блоки ума и напрямую исцелять системы органов и ткани тела.'
    }
  ]

  return (
    <section className="approach-section" id="approach">
      <div className="portal-container">
        <div className="approach-section__header">
          <div className="approach-section__tag">ФИЛОСОФИЯ И МЕТОДОЛОГИЯ</div>
          <h2 className="approach-section__title">
            Четыре столпа <br />
            <span>авторского подхода Алины</span>
          </h2>
          <p className="approach-section__subtitle">
            Фундамент, на котором строятся все программы: от звуковых погружений до обучения ченнелингу и проекта «Эволюция Мастера».
          </p>
        </div>

        <div className="approach-grid">
          {pillars.map((p) => (
            <div key={p.num} className="approach-card">
              <div className="approach-card__num">{p.num}</div>
              <h3 className="approach-card__title">{p.title}</h3>
              <p className="approach-card__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
