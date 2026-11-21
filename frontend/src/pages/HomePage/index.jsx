import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../Layout';
import Section from '../../components/Section';
import ProductListing from '../../components/ProductListing';
import Gallery from '../../components/Gallery';
import { getCategories, getProducts, toProductCard } from '../../services/storeApi';
import sneakerIcon from '../../assets/category-sneaker.png';
import shirtIcon from '../../assets/category-shirt.png';
import pantsIcon from '../../assets/category-pants.png';

const productFields = 'id,enabled,name,price,price_with_discount,category_ids,images';

const heroSlides = [
  { src: '/White-Sneakers-PNG-Clipart%201.png', alt: 'Tênis branco com detalhes vermelhos' },
  { src: '/produc-image-2.jpeg', alt: 'Tenis de colecionador' },
  { src: '/produc-image-1.jpeg', alt: 'Colecao de tenis especiais' },
  { src: '/produc-image-4.jpeg', alt: 'Novidades em calcados' },
];

const collections = [
  {
    title: 'Novo drop Supreme',
    titleLines: ['Novo drop', 'Supreme'],
    src: '/star-wars-storm-trooper-supreme-shirts-supreme-t-shirt-snoopy-clothing-apparel-t-shirt-text-transparent-png-616696%201.png',
  },
  { title: 'Coleção Adidas', titleLines: ['Coleção', 'Adidas'], src: '/ddd%201.png' },
  {
    title: 'Novo Beats Bass',
    titleLines: ['Novo', 'Beats Bass'],
    src: '/d9db11953a2d185d37246bb1f500c957%201.png',
  },
];

function CategoryIcon({ type }) {
  // No Figma oficial (Drip Store - Homepage design), o círculo de "Bonés" utiliza o mesmo ícone gráfico de "Calças"
  const imageIcons = {
    shirt: shirtIcon,
    pants: pantsIcon,
    sneaker: sneakerIcon,
    cap: pantsIcon,
  };

  if (imageIcons[type]) {
    return (
      <img
        className={`category-glyph category-glyph--${type} w-16 h-16 object-contain`}
        src={imageIcons[type]}
        alt=""
      />
    );
  }

  const paths = {
    category: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    cap: (
      <>
        <path d="M3 15c1-3.5 4.5-6 9-6s8 2.5 9 6H3Z" />
        <path d="M12 9V6" />
        <path d="M2 15c5 1.2 13 1.2 18 0l2 2H2l0-2Z" />
      </>
    ),
    headphones: (
      <>
        <path d="M3 14v-3a9 9 0 0 1 18 0v3M5 13v-2a7 7 0 0 1 14 0v2" />
        <path d="m4.5 13 2-.5 2 8-2.2.6a1.6 1.6 0 0 1-2-.1l-1.1-5.8a1.8 1.8 0 0 1 1.3-2.2Zm15 0-2-.5-2 8 2.2.6a1.6 1.6 0 0 0 2-.1l1.1-5.8a1.8 1.8 0 0 0-1.3-2.2Z" />
      </>
    ),
  };

  return (
    <svg
      className={`category-glyph category-glyph--${type} w-20 h-20 fill-none stroke-current stroke-[1.2]`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function renderHeroSlide(image) {
  return (
    <div className="home-hero-slide relative grid w-full h-full grid-cols-2 max-[600px]:flex max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:px-5 items-center max-w-[1240px] mx-auto max-[800px]:grid-cols-[1fr_0.8fr]">
      {/* Decorative dot pattern from Figma */}
      <div
        className="absolute top-6 right-4 md:top-14 md:right-0 w-20 h-20 md:w-36 md:h-36 opacity-60 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(var(--warning) 1.5px, transparent 1.5px)',
          backgroundSize: '15px 15px',
        }}
        aria-hidden="true"
      />
      <div className="home-hero-copy relative z-10 max-w-[530px] pr-6 pb-6 max-[800px]:pl-3 max-[600px]:max-w-none max-[600px]:mt-[280px] max-[600px]:p-0 max-[600px]:text-center">
        <p className="m-0 mb-5 max-[600px]:mb-2.5 text-warning font-bold text-base max-[600px]:text-[13px]">
          Melhores ofertas personalizadas
        </p>
        <h1 className="m-0 mb-5 max-[600px]:mb-3 text-dark-gray font-extrabold leading-[1.05] text-[clamp(34px,4vw,64px)] max-[800px]:text-[42px]">
          Queima de<br />estoque Nike <span aria-hidden="true" className="whitespace-nowrap">🔥</span>
        </h1>
        <p className="max-w-[500px] max-[600px]:max-w-[300px] max-[600px]:mx-auto m-0 mb-10 max-[600px]:mb-4 text-dark-gray-3 text-lg max-[600px]:text-xs leading-[1.7] max-[600px]:leading-[1.45]">
          Consequat culpa exercitation mollit nisi exceptuer do do tempor laboris
          eiusmod irure consectetur.
        </p>
        <Link
          className="inline-flex min-w-[220px] max-[600px]:min-w-0 max-[600px]:w-full h-12 max-[600px]:h-11 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold no-underline hover:bg-tertiary transition-colors"
          to="/produtos"
        >
          Ver Ofertas
        </Link>
      </div>
      <img
        className="home-hero-image relative z-0 block w-full h-[500px] max-[800px]:h-[380px] max-[600px]:absolute max-[600px]:top-6 max-[600px]:right-[8%] max-[600px]:w-[84%] max-[600px]:h-[240px] object-contain mix-blend-multiply scale-[1.35] max-[600px]:scale-[1.1] max-[600px]:translate-x-[-20px]"
        src={image.src}
        alt={image.alt}
      />
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    let active = true;

    getCategories({ limit: 5 })
      .then(({ data }) => {
        if (active) setCategories(data);
      })
      .catch((error) => {
        if (active) setCategoriesError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getProducts({ limit: 8, fields: productFields })
      .then(({ data }) => {
        if (active) setApiProducts(data);
      })
      .catch((error) => {
        if (active) setProductsError(error.message);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = apiProducts
    .filter((product) => product.enabled)
    .slice(0, 8)
    .map((product) => toProductCard(product, categories));

  function getIcon(category) {
    const name = category.name.toLocaleLowerCase('pt-BR');
    if (name.includes('camis') || name.includes('shirt')) return 'shirt';
    if (name.includes('calç') || name.includes('pants')) return 'pants';
    if (name.includes('tênis') || name.includes('tenis')) return 'sneaker';
    return 'category';
  }

  const featuredCollectionCategories = [
    { name: 'Camisetas', iconType: 'shirt', search: 'camisetas' },
    { name: 'Calças', iconType: 'pants', search: 'calças' },
    { name: 'Bonés', iconType: 'cap', search: 'bonés' },
    { name: 'Headphones', iconType: 'headphones', search: 'headphones' },
    { name: 'Tênis', iconType: 'sneaker', search: 'tênis' },
  ];

  return (
    <Layout>
      <div className="home-page pb-0 bg-[#f7f7fc]">
        {/* Hero Gallery */}
        <Gallery
          className="home-page__hero [&_.gallery\_\_viewport]:rounded-none [&_.gallery\_\_viewport]:bg-[#f5f5f5] [&_.gallery\_\_indicators]:bottom-14 max-[600px]:[&_.gallery\_\_indicators]:bottom-7 [&_.gallery\_\_indicators]:gap-3 max-[600px]:[&_.gallery\_\_indicators]:gap-2"
          images={heroSlides}
          width="1440px"
          height="681px"
          showArrows={false}
          showIndicators
          renderSlide={renderHeroSlide}
        />

        {/* Body */}
        <div className="home-page__body grid gap-[106px] max-[800px]:gap-16 max-[600px]:gap-[88px] max-w-[1240px] max-[1300px]:w-[calc(100%-64px)] max-[600px]:w-[calc(100%-40px)] mx-auto max-[1300px]:mx-8 max-[600px]:mx-5 py-14 max-[600px]:py-12 pb-[118px] max-[600px]:pb-[72px]">
          {/* Collections grid */}
          <Section title="Coleções em destaque" titleAlign="left">
            <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-3 max-[600px]:gap-2.5">
              {collections.map(({ title, titleLines, src }) => (
                <article
                  className="relative h-[250px] max-[600px]:h-[210px] min-w-0 overflow-hidden rounded-lg bg-[#d9e4f3]"
                  key={src}
                >
                  <span className="absolute z-10 top-8 max-[600px]:top-[18px] left-[30px] max-[600px]:left-5 py-2 px-[18px] max-[600px]:py-[5px] max-[600px]:px-3 rounded-[20px] bg-[#e7ff86] text-dark-gray-2 text-sm max-[600px]:text-xs font-bold">
                    30% OFF
                  </span>
                  <h3
                    className="absolute z-10 top-[76px] max-[600px]:top-[58px] left-[30px] max-[600px]:left-5 w-[48%] m-0 text-dark-gray text-[32px] max-[600px]:text-[22px] font-bold leading-[1.05]"
                    aria-label={title}
                  >
                    {titleLines.map((line, index) => (
                      <span key={line}>{index > 0 && <br />}{line}</span>
                    ))}
                  </h3>
                  <img
                    className="absolute right-[-9%] bottom-[-19%] block w-[68%] h-[138%] max-[800px]:h-[200px] object-contain object-center"
                    src={src}
                    alt=""
                  />
                  <Link
                    className="absolute z-10 bottom-9 max-[600px]:bottom-[18px] left-[30px] max-[600px]:left-5 inline-flex min-w-[154px] max-[600px]:min-w-[145px] h-12 max-[600px]:h-10 items-center justify-center rounded-lg bg-light-gray-3 text-primary text-sm max-[600px]:text-xs font-bold no-underline hover:bg-white transition-colors"
                    to="/produtos"
                  >
                    Comprar
                  </Link>
                </article>
              ))}
            </div>
          </Section>

          {/* Category icons */}
          <Section title="Coleções em destaque" titleAlign="center">
            <div className="flex justify-center max-[600px]:justify-start gap-[46px] max-[800px]:gap-5 max-[600px]:gap-[18px] max-[600px]:overflow-x-auto max-[600px]:py-2.5 max-[600px]:pb-5 [scrollbar-width:none] max-[600px]:[&::-webkit-scrollbar]:hidden">
              {featuredCollectionCategories.map((item, index) => {
                const apiCategory = categories.find((cat) =>
                  cat.name.toLowerCase().includes(item.search.slice(0, 4))
                );
                const targetUrl = apiCategory
                  ? `/produtos?category_ids=${apiCategory.id}`
                  : `/produtos?filter=${encodeURIComponent(item.search)}`;

                return (
                  <Link
                    className={`flex flex-col max-[600px]:shrink-0 items-center gap-4 max-[800px]:gap-3 max-[600px]:gap-2 text-dark-gray-2 text-sm max-[800px]:text-sm max-[600px]:text-[11px] font-semibold no-underline hover:text-primary transition-colors`}
                    key={item.name}
                    to={targetUrl}
                  >
                    <span
                      className={`flex items-center justify-center w-[104px] h-[104px] max-[800px]:w-20 max-[800px]:h-20 max-[600px]:w-[72px] max-[600px]:h-[72px] rounded-full bg-white ${
                        index === 0
                          ? 'shadow-[0_8px_24px_rgba(0,0,0,0.08)] text-primary'
                          : 'text-light-gray'
                      }`}
                    >
                      <CategoryIcon type={item.iconType} />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </Section>

          {/* Products */}
          <Section
            title="Produtos em alta"
            link={{ text: 'Ver todos →', href: '/produtos' }}
          >
            {productsLoading ? (
              <p role="status">Carregando produtos...</p>
            ) : productsError ? (
              <p role="alert">{productsError}</p>
            ) : featuredProducts.length ? (
              <ProductListing products={featuredProducts} />
            ) : (
              <p>Nenhum produto disponível.</p>
            )}
          </Section>
        </div>

        {/* Air Jordan Promotion */}
        <section className="bg-white">
          <div className="grid grid-cols-[1fr_1.2fr] max-[800px]:grid-cols-[0.8fr_1.2fr] max-[600px]:grid-cols-1 items-center gap-10 max-[800px]:gap-8 max-[600px]:gap-4 max-w-[1240px] max-[1300px]:w-[calc(100%-64px)] max-[600px]:w-[calc(100%-40px)] min-h-[555px] mx-auto max-[1300px]:mx-8 max-[600px]:mx-5 py-12 max-[600px]:py-10 max-[600px]:pb-[54px]">
            <div className="grid place-items-center w-[560px] max-[1300px]:w-full max-[600px]:w-[280px] max-[600px]:max-w-full max-[600px]:mx-auto h-[440px] max-[600px]:h-[280px] rounded-full bg-[radial-gradient(circle,#eee6ff_0_58%,transparent_59%)]">
              <img
                className="block w-[102%] h-auto object-contain mix-blend-multiply max-[600px]:[transform:none] [transform:translateX(-5.7%)]"
                src="/special-offer-air-jordan.png"
                alt="Tênis Air Jordan em preto, branco e amarelo"
              />
            </div>
            <div>
              <p className="m-0 mb-5 max-[600px]:mb-3 text-primary max-[600px]:text-warning text-sm max-[600px]:text-xs font-bold">
                Oferta especial
              </p>
              <h2 className="max-w-[600px] m-0 mb-5 max-[600px]:mb-3 text-dark-gray-2 text-5xl max-[800px]:text-4xl max-[600px]:text-2xl leading-[1.12] max-[600px]:leading-[1.2] font-bold">
                Air Jordan edição de colecionador
              </h2>
              <p className="max-w-[620px] m-0 mb-7 max-[600px]:mb-4 text-dark-gray-2 text-base max-[600px]:text-xs leading-[1.7] max-[600px]:leading-[1.5]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip
              </p>
              <Link
                className="inline-flex min-w-[200px] max-[600px]:min-w-0 max-[600px]:w-[196px] h-12 max-[600px]:h-10 items-center justify-center rounded-lg bg-primary text-white text-sm max-[600px]:text-xs font-bold no-underline hover:bg-tertiary transition-colors"
                to="/produtos?filter=tênis"
              >
                Ver Oferta
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
