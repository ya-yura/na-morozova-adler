export type Room = {
  id: string;
  title: string;
  capacity: number;
  area?: string;
  beds?: string;
  price?: number;
  priceSource?: string;
  priceUrl?: string;
  updatedAt: string;
  image: string;
  imageAlt: string;
  features: string[];
  tags: string[];
};

export const property = {
  name: 'Гостевой дом «На Морозова»',
  shortName: 'На Морозова',
  city: 'Адлер',
  address: 'Краснодарский край, Сочи, Адлер, улица Павлика Морозова, 67',
  phone: '+7 (918) 901-58-88',
  phoneHref: 'tel:+79189015888',
  whatsappHref: 'https://wa.me/79189015888',
  yandexMapsHref: 'https://yandex.ru/maps/org/gostevoy_dom_na_morozova/1139483108/',
  routeHref: 'https://yandex.ru/maps/?rtext=~улица%20Павлика%20Морозова%2C%2067%2C%20Адлер&rtt=auto',
  rating: '4,6',
  ratingsCount: 216,
  beachWalk: '5–7 минут пешком до моря',
  priceUpdatedAt: '20 августа 2026',
  sourceUpdatedAt: '20 августа 2026',
};

const officialCatalogUrl = 'https://gostevoj-dom-na-morozova.clients.site/';
const kudanamoreUrl = 'https://www.kudanamore.ru/adler/hotels/40475/';

const standardFeatures = [
  'собственный санузел',
  'кондиционер',
  'холодильник',
  'телевизор',
  'электрочайник',
  'обеденный стол со стульями',
];

const sharedKitchenFeatures = [...standardFeatures, 'общая гостевая кухня'];

export const rooms: Room[] = [
  {
    id: 'double',
    title: '2-местный номер',
    capacity: 2,
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-40.webp',
    imageAlt: 'Комната с двуспальной кроватью, телевизором и столом',
    features: sharedKitchenFeatures,
    tags: ['2 гостя', 'общая кухня'],
  },
  {
    id: 'double-balcony',
    title: '2-местный номер с балконом',
    capacity: 2,
    price: 3500,
    priceSource: 'официальный каталог',
    priceUrl: 'https://gostevoj-dom-na-morozova.clients.site/service/2-h-mestnyj-nomer-s-balkonom/TYCOON_20894732615',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-16.webp',
    imageAlt: 'Комната с кроватями и выходом на балкон',
    features: [...standardFeatures, 'балкон', 'общая гостевая кухня'],
    tags: ['2 гостя', 'балкон'],
  },
  {
    id: 'triple',
    title: '3-местный номер',
    capacity: 3,
    beds: '2 односпальные кровати и диван',
    price: 3500,
    priceSource: 'официальный каталог',
    priceUrl: 'https://gostevoj-dom-na-morozova.clients.site/service/standartnyi-3-h-mestnyi-nomer/TYCOON_20894727520',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-14.webp',
    imageAlt: 'Просторный 3-местный номер с кроватями и диваном',
    features: sharedKitchenFeatures,
    tags: ['3 гостя', 'общая кухня'],
  },
  {
    id: 'triple-balcony',
    title: '3-местный номер с балконом',
    capacity: 3,
    area: '20 м²',
    beds: 'спальные места — по описанию варианта',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-26.webp',
    imageAlt: '3-местный номер с выходом на балкон',
    features: [...standardFeatures, 'балкон'],
    tags: ['3 гостя', 'балкон'],
  },
  {
    id: 'four',
    title: 'Стандартный 4-местный номер',
    capacity: 4,
    area: '20 м²',
    beds: '2 односпальные кровати и раскладывающийся диван',
    price: 4000,
    priceSource: 'официальный каталог',
    priceUrl: 'https://gostevoj-dom-na-morozova.clients.site/service/standartnyj-4-h-mestnyj-nomer/TYCOON_20894666364',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-12.webp',
    imageAlt: 'Стандартный 4-местный номер с кроватями и диваном',
    features: sharedKitchenFeatures,
    tags: ['4 гостя', 'общая кухня'],
  },
  {
    id: 'four-balcony',
    title: '4-местный номер с балконом',
    capacity: 4,
    area: '22 м²',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-33.webp',
    imageAlt: '4-местный номер с кроватью, диваном и балконом',
    features: [...standardFeatures, 'балкон'],
    tags: ['4 гостя', 'балкон'],
  },
  {
    id: 'family-five',
    title: 'Семейный 5-местный номер',
    capacity: 5,
    area: '30 м²',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-06.webp',
    imageAlt: 'Семейный номер с несколькими спальными местами и диваном',
    features: [...standardFeatures, 'балкон'],
    tags: ['5 гостей', 'семейный формат'],
  },
  {
    id: 'studio-five',
    title: '5-местная студия с кухней',
    capacity: 5,
    area: '35 м²',
    price: 5000,
    priceSource: 'официальный каталог',
    priceUrl: 'https://gostevoj-dom-na-morozova.clients.site/service/5-ti-mestnaya-studiya-s-kuhnej/TYCOON_20894633830',
    updatedAt: property.priceUpdatedAt,
    image: '/images/property-06.webp',
    imageAlt: '5-местная студия с кроватями, диваном и собственной кухней',
    features: [
      'собственный санузел',
      'кондиционер',
      'холодильник',
      'телевизор',
      'электрочайник',
      'балкон',
      'собственная кухня',
      'посуда',
      'обеденный стол со стульями',
    ],
    tags: ['5 гостей', 'своя кухня', 'балкон'],
  },
];

export const galleryGroups = [
  {
    id: 'rooms',
    label: 'Номера',
    description: 'Фотографии комнат из карточки объекта.',
    items: [
      { image: '/images/property-14.webp', caption: 'Номер с кроватями и диваном', alt: 'Номер с кроватями и диваном' },
      { image: '/images/property-19.webp', caption: 'Номер с обеденной зоной', alt: 'Номер с обеденной зоной' },
      { image: '/images/property-31.webp', caption: 'Комната с двумя кроватями', alt: 'Комната с двумя кроватями' },
      { image: '/images/property-37.webp', caption: 'Комната с раздельными кроватями', alt: 'Комната с раздельными кроватями' },
    ],
  },
  {
    id: 'kitchens',
    label: 'Кухни',
    description: 'Общая гостевая кухня и кухня в студии.',
    items: [
      { image: '/images/property-03.webp', caption: 'Общая гостевая кухня', alt: 'Общая гостевая кухня с плитой и столом' },
      { image: '/images/property-04.webp', caption: 'Общая кухня: рабочая зона', alt: 'Рабочая зона общей кухни с холодильником' },
      { image: '/images/property-07.webp', caption: 'Кухня в студии', alt: 'Кухня в студии с плитой и холодильником' },
    ],
  },
  {
    id: 'bathrooms',
    label: 'Санузлы',
    description: 'Фотографии санузлов в доступных материалах не выделены отдельно.',
    items: [],
  },
  {
    id: 'balconies',
    label: 'Балконы',
    description: 'Балконы и виды из номеров, где они видны на фото.',
    items: [
      { image: '/images/property-01.webp', caption: 'Фасад с балконами', alt: 'Фасад гостевого дома с балконами' },
      { image: '/images/property-02.webp', caption: 'Вид из окна', alt: 'Вид из окна на соседние дома' },
      { image: '/images/property-16.webp', caption: 'Выход на балкон из номера', alt: 'Выход на балкон из номера' },
    ],
  },
  {
    id: 'common',
    label: 'Общие зоны',
    description: 'Фасад и общие пространства, показанные в материалах объекта.',
    items: [
      { image: '/images/property-01.webp', caption: 'Фасад дома', alt: 'Фасад гостевого дома в зелени' },
      { image: '/images/property-04.webp', caption: 'Общая кухня', alt: 'Общая кухня с окнами и обеденной зоной' },
    ],
  },
  {
    id: 'location',
    label: 'Расположение',
    description: 'Фотография окрестной застройки из карточки объекта.',
    items: [
      { image: '/images/property-02.webp', caption: 'Вид из окна на район', alt: 'Вид из окна на район Адлера' },
    ],
  },
] as const;

export const conditions = [
  { label: 'Заезд', value: '14:00', status: 'confirmed' },
  { label: 'Выезд', value: '12:00', status: 'confirmed' },
  { label: 'Дети', value: 'Можно с детьми любого возраста', status: 'confirmed' },
  { label: 'Животные', value: 'Размещение запрещено', status: 'confirmed' },
  { label: 'Курение', value: 'Разрешено в специальных местах', status: 'confirmed' },
  { label: 'Тихие часы', value: '23:00–08:00', status: 'confirmed' },
  { label: 'Оплата', value: 'Наличные', status: 'confirmed' },
  { label: 'Стиральная машина', value: 'Платно — условия уточняются', status: 'needs-check' },
  { label: 'Парковка', value: 'Уточняется владельцем', status: 'needs-check' },
  { label: 'Трансфер', value: 'Уточняется владельцем', status: 'needs-check' },
];

export const sourceLinks = [
  { label: 'Яндекс Карты', href: property.yandexMapsHref },
  { label: 'Официальный каталог', href: officialCatalogUrl },
  { label: 'Куда на море.ру', href: kudanamoreUrl },
];
