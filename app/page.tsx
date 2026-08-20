'use client';

import { useEffect, useMemo, useState } from 'react';
import { conditions, galleryGroups, property, rooms, sourceLinks, type Room } from './content';

type FinderState = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childAge: string;
  wishes: string[];
  budget: string;
  selectedRoomId: string;
  consent: boolean;
};

const STORAGE_KEY = 'na-morozova-finder-v1';

const initialFinder: FinderState = {
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
  childAge: '',
  wishes: [],
  budget: '',
  selectedRoomId: '',
  consent: false,
};

const wishOptions = [
  { id: 'balcony', label: 'Нужен балкон' },
  { id: 'private-kitchen', label: 'Нужна собственная кухня' },
  { id: 'shared-kitchen', label: 'Достаточно общей кухни' },
  { id: 'family', label: 'Нужен семейный вариант' },
];

const galleryById = new Map(galleryGroups.map((group) => [group.id, group]));

function track(event: string, details: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const target = window as typeof window & { dataLayer?: Array<Record<string, unknown>> };
  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push({ event, ...details });
}

function formatDate(value: string) {
  if (!value) return 'не указаны';
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
}

function formatPrice(price?: number) {
  if (!price) return 'Уточняется';
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
}

function buildWhatsAppMessage(finder: FinderState, room?: Room) {
  const childrenLine = finder.children
    ? `${finder.children} ${finder.children === 1 ? 'ребёнок' : 'детей'}${finder.childAge ? `, возраст: ${finder.childAge}` : ''}`
    : 'без детей';
  const wishes = [
    ...finder.wishes.map((wish) => wishOptions.find((option) => option.id === wish)?.label.toLowerCase()),
    finder.budget ? `ориентир по бюджету до ${finder.budget} ₽ за ночь` : '',
  ].filter(Boolean);

  return [
    'Здравствуйте! Хотим забронировать проживание в гостевом доме «На Морозова».',
    '',
    `Заезд: ${formatDate(finder.checkIn)}`,
    `Выезд: ${formatDate(finder.checkOut)}`,
    `Гости: ${finder.adults} ${finder.adults === 1 ? 'взрослый' : 'взрослых'}, ${childrenLine}`,
    `Пожелания: ${wishes.length ? wishes.join(', ') : 'нет особых пожеланий'}`,
    `Подходящий номер: ${room?.title ?? 'не выбран'}`,
    '',
    room
      ? 'Подскажите, пожалуйста, актуальную стоимость и наличие на эти даты.'
      : 'Помогите, пожалуйста, подобрать подходящий вариант. Подскажите актуальную стоимость и наличие на эти даты.',
  ].join('\n');
}

function roomScore(room: Room, finder: FinderState) {
  let score = Math.abs(room.capacity - (finder.adults + finder.children)) * 12;
  if (finder.wishes.includes('balcony') && !room.features.includes('балкон')) score += 100;
  if (finder.wishes.includes('private-kitchen') && !room.features.includes('собственная кухня')) score += 100;
  if (finder.wishes.includes('shared-kitchen') && !room.features.includes('общая гостевая кухня')) score += 50;
  if (finder.wishes.includes('family') && room.capacity < 3) score += 70;
  if (finder.budget && room.price && room.price > Number(finder.budget)) score += 35;
  if (!room.price) score += 4;
  return score;
}

function getRecommendations(finder: FinderState) {
  const guests = finder.adults + finder.children;
  const suitable = rooms.filter((room) => room.capacity >= guests);
  const pool = suitable.length ? suitable : rooms;
  return [...pool].sort((a, b) => roomScore(a, finder) - roomScore(b, finder)).slice(0, 3);
}

export default function Home() {
  const [finder, setFinder] = useState<FinderState>(() => {
    if (typeof window === 'undefined') return initialFinder;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialFinder, ...JSON.parse(saved) } : initialFinder;
    } catch {
      return initialFinder;
    }
  });
  const [step, setStep] = useState(1);
  const [galleryId, setGalleryId] = useState('rooms');
  const [consentError, setConsentError] = useState('');
  const [dateError, setDateError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finder));
    } catch {
      // Local persistence is optional.
    }
  }, [finder]);

  const recommendations = useMemo(() => getRecommendations(finder), [finder]);
  const selectedRoom = rooms.find((room) => room.id === finder.selectedRoomId);
  const activeGallery = galleryById.get(galleryId) ?? galleryGroups[0];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const startFinder = () => {
    track('finder_start');
    setStep(1);
    scrollTo('finder');
  };

  const updateGuestCount = (key: 'adults' | 'children', delta: number) => {
    setFinder((current) => ({
      ...current,
      [key]: Math.max(key === 'adults' ? 1 : 0, current[key] + delta),
    }));
    track('guest_composition_change', { guestType: key, delta });
  };

  const goNext = () => {
    if (finder.checkIn && finder.checkOut && finder.checkOut < finder.checkIn) {
      setDateError('Дата выезда должна быть позже даты заезда.');
      return;
    }
    setDateError('');
    const nextStep = Math.min(4, step + 1);
    setStep(nextStep);
    track(`finder_step_${nextStep}_complete`);
    if (nextStep === 4) scrollTo('recommendations');
  };

  const goBack = () => {
    setStep((current) => Math.max(1, current - 1));
    setDateError('');
  };

  const chooseRoom = (room: Room) => {
    setFinder((current) => ({ ...current, selectedRoomId: room.id }));
    setConsentError('');
    track('room_select', { roomId: room.id, roomName: room.title });
    requestAnimationFrame(() => scrollTo('request'));
  };

  const toggleWish = (wish: string) => {
    setFinder((current) => ({
      ...current,
      wishes: current.wishes.includes(wish)
        ? current.wishes.filter((item) => item !== wish)
        : [...current.wishes, wish],
    }));
    track('finder_preference_change', { preference: wish });
  };

  const openWhatsApp = () => {
    if (!finder.consent) {
      setConsentError('Поставьте галочку согласия — после этого откроется WhatsApp с готовым запросом.');
      scrollTo('request');
      return;
    }
    const message = buildWhatsAppMessage(finder, selectedRoom);
    track('whatsapp_click', { roomId: selectedRoom?.id ?? null, hasDates: Boolean(finder.checkIn && finder.checkOut) });
    window.open(`${property.whatsappHref}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    track('form_submit', { roomId: selectedRoom?.id ?? null });
    openWhatsApp();
  };

  const handleRouteClick = () => track('route_build');
  const handlePhoneClick = () => track('phone_click');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.name,
    telephone: '+79189015888',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'улица Павлика Морозова, 67',
      addressLocality: 'Сочи, Адлер',
      addressRegion: 'Краснодарский край',
      addressCountry: 'RU',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      ratingCount: 216,
    },
    sameAs: [property.yandexMapsHref],
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="На Морозова — в начало"><span className="brand-mark" aria-hidden="true">НМ</span><span><strong>На Морозова</strong><small>гостевой дом · Адлер</small></span></a>
          <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Основная навигация"><a href="#rooms" onClick={() => setMobileMenuOpen(false)}>Номера</a><a href="#how" onClick={() => setMobileMenuOpen(false)}>Как это работает</a><a href="#location" onClick={() => setMobileMenuOpen(false)}>Локация</a></nav>
          <div className="header-actions"><a className="phone-link" href={property.phoneHref} onClick={handlePhoneClick}>{property.phone}</a><button className="menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-label="Открыть меню" onClick={() => setMobileMenuOpen((open) => !open)}><span /><span /></button></div>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title"><div className="hero-image" aria-hidden="true" /><div className="hero-wash" aria-hidden="true" /><div className="container hero-content"><div className="hero-copy"><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Адлер · улица Павлика Морозова, 67</p><h1 id="hero-title">Подберём номер в Адлере под ваши даты и состав гостей</h1><p className="hero-lead">Гостевой дом «На Морозова» — спокойное размещение рядом с морем. Выберите даты, количество гостей и важные условия — мы уточним подходящий номер, наличие и стоимость.</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={startFinder}>Подобрать номер <span aria-hidden="true">↘</span></button><a className="button button-ghost" href={property.phoneHref} onClick={handlePhoneClick}>Позвонить</a><a className="button button-whatsapp" href={property.whatsappHref} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'hero' })}>Написать в WhatsApp</a></div></div><div className="hero-aside"><a className="rating-card" href={property.yandexMapsHref} target="_blank" rel="noreferrer" onClick={() => track('reviews_open')}><span className="rating-number">{property.rating}</span><span className="rating-stars" aria-hidden="true">★★★★★</span><span className="rating-caption">{property.ratingsCount} оценок в Яндекс Картах <span aria-hidden="true">↗</span></span></a><div className="hero-note"><span aria-hidden="true">◌</span><span>{property.beachWalk}</span></div></div></div><div className="container hero-meta"><span>Варианты для 2–5 гостей</span><span>Собственная и общая кухня</span><span>Наличие подтверждает владелец</span></div></section>

        <section className="section finder-section" id="finder" aria-labelledby="finder-title"><div className="container"><div className="section-heading finder-heading"><div><p className="eyebrow">01 · быстрый подбор</p><h2 id="finder-title">Соберём запрос за минуту</h2></div><p>Даты можно оставить пустыми, если вы пока ориентируетесь. Точная стоимость и наличие подтверждаются владельцем.</p></div><div className="finder-shell"><aside className="step-rail" aria-label="Шаги подбора">{[['01', 'Даты'], ['02', 'Гости'], ['03', 'Пожелания'], ['04', 'Варианты']].map(([number, label], index) => <button className={`step-tab ${step === index + 1 ? 'is-active' : ''} ${step > index + 1 ? 'is-done' : ''}`} key={number} type="button" onClick={() => setStep(index + 1)}><span>{number}</span><strong>{label}</strong>{step > index + 1 && <b aria-label="готово">✓</b>}</button>)}<div className="step-rail-note"><span aria-hidden="true">↳</span> Без регистрации и длинных анкет</div></aside><div className="finder-body">
          {step === 1 && <div className="finder-step"><div className="step-intro"><span className="step-kicker">Шаг 1 из 4</span><h3>На какие даты планируете поездку?</h3><p>Если даты ещё не определились, переходите дальше без них.</p></div><div className="field-grid two-columns"><label className="field"><span>Заезд</span><input type="date" value={finder.checkIn} onChange={(event) => setFinder((current) => ({ ...current, checkIn: event.target.value }))} /></label><label className="field"><span>Выезд</span><input type="date" value={finder.checkOut} onChange={(event) => setFinder((current) => ({ ...current, checkOut: event.target.value }))} /></label></div>{dateError && <p className="form-error" role="alert">{dateError}</p>}<div className="step-footer"><span className="muted">Точная сумма не показывается без подтверждения дат.</span><button className="button button-dark" type="button" onClick={goNext}>Дальше <span aria-hidden="true">→</span></button></div></div>}
          {step === 2 && <div className="finder-step"><div className="step-intro"><span className="step-kicker">Шаг 2 из 4</span><h3>Кто поедет?</h3><p>Количество детей можно указать без обязательной регистрации.</p></div><div className="guest-grid"><GuestCounter label="Взрослые" value={finder.adults} onChange={(delta) => updateGuestCount('adults', delta)} /><GuestCounter label="Дети" value={finder.children} onChange={(delta) => updateGuestCount('children', delta)} /></div><label className="field field-short"><span>Возраст детей <em>необязательно</em></span><input inputMode="numeric" placeholder="Например, 4 и 8 лет" value={finder.childAge} onChange={(event) => setFinder((current) => ({ ...current, childAge: event.target.value }))} /></label><div className="step-footer"><button className="button button-text" type="button" onClick={goBack}>← Назад</button><button className="button button-dark" type="button" onClick={goNext}>Дальше <span aria-hidden="true">→</span></button></div></div>}
          {step === 3 && <div className="finder-step"><div className="step-intro"><span className="step-kicker">Шаг 3 из 4</span><h3>Что важно учесть?</h3><p>Отметьте только то, что действительно влияет на выбор номера.</p></div><div className="wish-grid">{wishOptions.map((option) => <label className={`wish-option ${finder.wishes.includes(option.id) ? 'is-selected' : ''}`} key={option.id}><input type="checkbox" checked={finder.wishes.includes(option.id)} onChange={() => toggleWish(option.id)} /><span className="wish-check" aria-hidden="true">{finder.wishes.includes(option.id) ? '✓' : '+'}</span><span>{option.label}</span></label>)}</div><label className="field field-short"><span>Ориентир по бюджету <em>необязательно</em></span><div className="input-with-suffix"><input inputMode="numeric" placeholder="Сумма за номер в сутки" value={finder.budget} onChange={(event) => setFinder((current) => ({ ...current, budget: event.target.value.replace(/\D/g, '') }))} /><span>₽</span></div></label><div className="step-footer"><button className="button button-text" type="button" onClick={goBack}>← Назад</button><button className="button button-dark" type="button" onClick={goNext}>Показать варианты <span aria-hidden="true">→</span></button></div></div>}
          {step === 4 && <div className="finder-step" id="recommendations"><div className="step-intro recommendation-intro"><div><span className="step-kicker">Шаг 4 из 4</span><h3>Вот что можно рассмотреть</h3><p>Подбор учитывает состав гостей и отмеченные пожелания. Наличие уточним у владельца.</p></div><button className="button button-text" type="button" onClick={goBack}>Изменить параметры</button></div><div className="mini-recommendations">{recommendations.map((room) => <MiniRoomCard key={room.id} room={room} selected={room.id === finder.selectedRoomId} onSelect={() => chooseRoom(room)} />)}</div><div className="recommendation-footnote"><span aria-hidden="true">i</span><span>Цена в карточках — за номер в сутки. Итоговая стоимость зависит от дат проживания и подтверждается владельцем.</span></div></div>}
        </div></div><form className="request-panel" id="request" onSubmit={handleSubmit}><div className="request-copy"><span className="step-kicker">Готовый запрос владельцу</span><h3>{selectedRoom ? selectedRoom.title : 'Не уверены, какой номер выбрать?'}</h3><p>{selectedRoom ? 'Параметры уже собраны. Откройте WhatsApp — сообщение подставится автоматически.' : 'Отправьте даты, состав гостей и пожелания — администратор поможет подобрать вариант.'}</p></div><div className="request-summary"><div><span>Период</span><strong>{finder.checkIn || finder.checkOut ? `${formatDate(finder.checkIn)} — ${formatDate(finder.checkOut)}` : 'не указан'}</strong></div><div><span>Гости</span><strong>{finder.adults} взрослых{finder.children ? ` · ${finder.children} детей` : ''}</strong></div><div><span>Номер</span><strong>{selectedRoom?.title ?? 'подберём вместе'}</strong></div></div><div className="request-actions"><label className="consent"><input type="checkbox" checked={finder.consent} onChange={(event) => { setFinder((current) => ({ ...current, consent: event.target.checked })); setConsentError(''); }} /><span>Согласен(на) на обработку данных для ответа по заявке.</span></label>{consentError && <p className="form-error" role="alert">{consentError}</p>}<div className="action-row"><button className="button button-whatsapp" type="submit">Написать в WhatsApp <span aria-hidden="true">↗</span></button><a className="button button-outline" href={property.phoneHref} onClick={handlePhoneClick}>Позвонить</a></div></div></form></div></section>

        <section className="section rooms-section" id="rooms" aria-labelledby="rooms-title"><div className="container"><div className="section-heading"><div><p className="eyebrow">02 · каталог</p><h2 id="rooms-title">Номера под разный состав гостей</h2></div><p>Выбирайте карточку напрямую, если уже знаете, что вам подходит. Цены — за номер в сутки.</p></div><div className="rooms-grid">{rooms.map((room) => <RoomCard key={room.id} room={room} selected={room.id === finder.selectedRoomId} onSelect={() => chooseRoom(room)} />)}</div><p className="catalog-note"><span aria-hidden="true">↗</span> Цены взяты из официального каталога, где они опубликованы, и проверены {property.priceUpdatedAt}. Для остальных категорий стоимость уточняется владельцем, чтобы не показывать устаревшую сумму.</p></div></section>

        <section className="trust-section" aria-labelledby="trust-title"><div className="container trust-layout"><div className="trust-score"><p className="eyebrow eyebrow-light">03 · отзывы гостей</p><h2 id="trust-title">Спокойный формат, о котором рассказывают гости</h2><div className="big-rating"><strong>{property.rating}</strong><span><span className="rating-stars" aria-hidden="true">★★★★★</span><small>{property.ratingsCount} оценок в Яндекс Картах</small></span></div><a className="button button-light" href={property.yandexMapsHref} target="_blank" rel="noreferrer" onClick={() => track('reviews_open')}>Смотреть отзывы <span aria-hidden="true">↗</span></a></div><div className="trust-signals"><ReviewSignal number="01" title="Море в пешей доступности" text="В отзывах и описании объекта гости отмечают близость к морю — ориентир 5–7 минут пешком." /><ReviewSignal number="02" title="Подходит для семей" text="Гости рассказывают о проживании с детьми и семейных вариантах размещения." /><ReviewSignal number="03" title="Есть техника и кухня" text="В описаниях номеров указаны кондиционер, холодильник, телевизор, электрочайник и общая кухня; в студии — собственная кухня." /></div></div></section>

        <section className="section how-section" id="how" aria-labelledby="how-title"><div className="container"><div className="section-heading"><div><p className="eyebrow">04 · без лишних шагов</p><h2 id="how-title">Как это работает</h2></div><p>Никакой регистрации: только те данные, которые нужны владельцу, чтобы ответить по делу.</p></div><div className="how-grid"><HowStep number="01" title="Указываете даты и гостей" text="Можно оставить даты пустыми, если вы пока присматриваетесь." /><HowStep number="02" title="Отмечаете важное" text="Балкон, собственная кухня, семейный формат или бюджет." /><HowStep number="03" title="Получаете варианты" text="Подбор показывает 2–3 подходящих категории и их различия." /><HowStep number="04" title="Отправляете запрос" text="В WhatsApp уходит структурированное сообщение, а не пустой чат." /></div></div></section>

        <section className="section conditions-section" aria-labelledby="conditions-title"><div className="container conditions-layout"><div className="section-heading"><div><p className="eyebrow">05 · условия</p><h2 id="conditions-title">Что важно знать до бронирования</h2></div><p>Подтверждённые правила показываем сразу. Если в источнике нет точного ответа, оставляем «уточняется».</p></div><div className="conditions-grid">{conditions.map((condition) => <div className={`condition ${condition.status === 'needs-check' ? 'is-pending' : ''}`} key={condition.label}><span>{condition.label}</span><strong>{condition.value}</strong>{condition.status === 'needs-check' && <small>у владельца</small>}</div>)}</div></div></section>

        <section className="section gallery-section" aria-labelledby="gallery-title"><div className="container"><div className="section-heading"><div><p className="eyebrow">06 · реальные фото</p><h2 id="gallery-title">Посмотрите, как всё устроено</h2></div><p>Фотографии из карточки объекта. Категории разделены, чтобы не смешивать номера и общие зоны.</p></div><div className="gallery-tabs" role="tablist" aria-label="Категории фотографий">{galleryGroups.map((group) => <button key={group.id} className={galleryId === group.id ? 'is-active' : ''} type="button" role="tab" aria-selected={galleryId === group.id} onClick={() => setGalleryId(group.id)}>{group.label}</button>)}</div><div className="gallery-caption"><span>{activeGallery.description}</span><a href="https://www.kudanamore.ru/adler/hotels/40475/" target="_blank" rel="noreferrer">Источник фотографий ↗</a></div>{activeGallery.items.length ? <div className="gallery-grid">{activeGallery.items.map((item) => <figure key={item.image}><img src={item.image} alt={item.alt} loading="lazy" /><figcaption>{item.caption}</figcaption></figure>)}</div> : <div className="gallery-empty"><span aria-hidden="true">⌁</span><p>Отдельные фотографии этой категории не выделены в доступных материалах. Уточните детали у владельца перед бронированием.</p></div>}</div></section>

        <section className="location-section" id="location" aria-labelledby="location-title"><div className="container location-layout"><div className="location-copy"><p className="eyebrow eyebrow-light">07 · локация</p><h2 id="location-title">Адлер, улица Павлика Морозова, 67</h2><p>Дом находится в центральной части Адлера. До моря — 5–7 минут пешком по описанию объекта. В отзывах также упоминаются магазины, аптеки и остановка поблизости; точный маршрут лучше построить от вашей точки.</p><div className="address-block"><span className="address-icon" aria-hidden="true">⌖</span><div><strong>{property.address}</strong><small>{property.phone}</small></div></div><div className="location-actions"><a className="button button-light" href={property.routeHref} target="_blank" rel="noreferrer" onClick={handleRouteClick}>Построить маршрут <span aria-hidden="true">↗</span></a><a className="text-link text-link-light" href={property.yandexMapsHref} target="_blank" rel="noreferrer">Открыть Яндекс Карты</a></div></div><div className="map-card"><iframe title="Карта гостевого дома «На Морозова»" src="https://yandex.ru/map-widget/v1/?text=улица%20Павлика%20Морозова%2C%2067%2C%20Адлер&z=16" loading="lazy" /><div className="map-label"><span className="map-pin" aria-hidden="true" /><span>На Морозова<br /><small>Павлика Морозова, 67</small></span></div></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-top"><div><a className="brand brand-footer" href="#top"><span className="brand-mark" aria-hidden="true">НМ</span><span><strong>На Морозова</strong><small>гостевой дом · Адлер</small></span></a><p className="footer-description">Подбор номера под ваши даты и состав гостей — с понятными условиями и готовым запросом владельцу.</p></div><div className="footer-contact"><span>Связаться напрямую</span><a href={property.phoneHref} onClick={handlePhoneClick}>{property.phone}</a><a href={property.whatsappHref} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'footer' })}>WhatsApp ↗</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} «На Морозова»</span><span>Источники: {sourceLinks.map((source, index) => <span key={source.href}>{index > 0 && ' · '}<a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></span>)}</span></div></footer>
      <div className="mobile-bar" aria-label="Быстрые действия"><button type="button" onClick={startFinder}><span aria-hidden="true">⌕</span>Подобрать</button><a href={property.whatsappHref} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click', { source: 'mobile_bar' })}><span aria-hidden="true">◌</span>WhatsApp</a><a href={property.phoneHref} onClick={handlePhoneClick}><span aria-hidden="true">⌕</span>Позвонить</a></div>
    </>
  );
}

function GuestCounter({ label, value, onChange }: { label: string; value: number; onChange: (delta: number) => void }) {
  return <div className="guest-counter"><span>{label}</span><div><button type="button" aria-label={`Уменьшить: ${label}`} onClick={() => onChange(-1)}>−</button><strong>{value}</strong><button type="button" aria-label={`Увеличить: ${label}`} onClick={() => onChange(1)}>+</button></div></div>;
}

function MiniRoomCard({ room, selected, onSelect }: { room: Room; selected: boolean; onSelect: () => void }) {
  return <article className={`mini-room-card ${selected ? 'is-selected' : ''}`}><img src={room.image} alt={room.imageAlt} loading="lazy" /><div className="mini-room-content"><div className="room-meta"><span>до {room.capacity} {room.capacity === 1 ? 'гостя' : 'гостей'}</span>{room.area && <span>{room.area}</span>}</div><h4>{room.title}</h4><div className="mini-tags">{room.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="mini-price"><strong>{formatPrice(room.price)}</strong><span>за номер в сутки</span></div><button className="button button-small" type="button" onClick={onSelect}>{selected ? 'Выбрано' : 'Выбрать'} <span aria-hidden="true">→</span></button></div></article>;
}

function RoomCard({ room, selected, onSelect }: { room: Room; selected: boolean; onSelect: () => void }) {
  return <article className={`room-card ${selected ? 'is-selected' : ''}`}><div className="room-image-wrap"><img src={room.image} alt={room.imageAlt} loading="lazy" /><span className="room-capacity">до {room.capacity} гостей</span>{selected && <span className="selected-badge">Выбрано ✓</span>}</div><div className="room-card-body"><div className="room-title-row"><div><p className="room-eyebrow">{room.area ?? 'Площадь уточняется'}</p><h3>{room.title}</h3></div><span className="room-arrow" aria-hidden="true">↗</span></div>{room.beds && <p className="room-beds">Спальные места: {room.beds}</p>}<ul className="feature-list">{room.features.slice(0, 6).map((feature) => <li key={feature}><span aria-hidden="true">·</span>{feature}</li>)}</ul><div className="room-price-row"><div><strong>{formatPrice(room.price)}</strong><span>за номер в сутки</span></div>{room.price ? <small>обновлено {room.updatedAt}</small> : <small>стоимость уточняется<br />у владельца</small>}</div><button className={`button ${selected ? 'button-selected' : 'button-outline'}`} type="button" onClick={onSelect}>{selected ? 'Номер выбран' : 'Выбрать этот номер'} <span aria-hidden="true">→</span></button></div></article>;
}

function ReviewSignal({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="review-signal"><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>;
}

function HowStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="how-step"><span className="how-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="how-line" aria-hidden="true" /></article>;
}
