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
import './styles.css';

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
  const imageIcons = {
    shirt: shirtIcon,
    pants: pantsIcon,
    sneaker: sneakerIcon,
  };

  if (imageIcons[type]) {
    return (
      <img
        className={`home-page__category-glyph home-page__category-glyph--${type}`}
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
      className={`home-page__category-glyph home-page__category-glyph--${type}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function renderHeroSlide(image) {
  return (
    <div className="home-page__hero-slide">
      <div className="home-page__hero-copy">
        <p className="home-page__hero-eyebrow">Melhores ofertas personalizadas</p>
        <h1>Queima de<br />estoque Nike <span aria-hidden="true">🔥</span></h1>
        <p className="home-page__hero-description">
          Consequat culpa exercitation mollit nisi exceptuer do do tempor laboris
          eiusmod irure consectetur.
        </p>
        <Link className="home-page__button" to="/produtos">Ver Ofertas</Link>
      </div>
      <img className="home-page__hero-image" src={image.src} alt={image.alt} />
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
      <div className="home-page">
        <Gallery
          className="home-page__hero"
          images={heroSlides}
          width="1440px"
          height="681px"
          showArrows={false}
          showIndicators
          renderSlide={renderHeroSlide}
        />

        <div className="home-page__body">
          <Section title="Coleções em destaque" titleAlign="left">
            <div className="home-page__collections">
              {collections.map(({ title, titleLines, src }) => (
                <article className="home-page__collection" key={src}>
                  <span className="home-page__discount">30% OFF</span>
                  <h3 className="home-page__collection-title" aria-label={title}>
                    {titleLines.map((line, index) => (
                      <span key={line}>{index > 0 && <br />}{line}</span>
                    ))}
                  </h3>
                  <img src={src} alt="" />
                  <Link className="home-page__collection-button" to="/produtos">
                    Comprar
                  </Link>
                </article>
              ))}
            </div>
          </Section>

          <Section title="Coleções em destaque" titleAlign="center">
            <div className="home-page__categories">
              {featuredCollectionCategories.map((item, index) => {
                const apiCategory = categories.find((cat) =>
                  cat.name.toLowerCase().includes(item.search.slice(0, 4))
                );
                const targetUrl = apiCategory
                  ? `/produtos?category_ids=${apiCategory.id}`
                  : `/produtos?filter=${encodeURIComponent(item.search)}`;

                return (
                  <Link
                    className="home-page__category"
                    key={item.name}
                    to={targetUrl}
                  >
                    <span className="home-page__category-icon">
                      <CategoryIcon type={item.iconType} />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </Section>

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

        <section className="home-page__promotion">
          <div className="home-page__promotion-inner">
            <div className="home-page__promotion-art">
              <img src="/special-offer-air-jordan.png" alt="Tênis Air Jordan em preto, branco e amarelo" />
            </div>
            <div className="home-page__promotion-copy">
              <p>Oferta especial</p>
              <h2>Air Jordan edição de colecionador</h2>
              <p className="home-page__promotion-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip
              </p>
              <Link className="home-page__button" to="/produtos?filter=tênis">
                Ver Oferta
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
