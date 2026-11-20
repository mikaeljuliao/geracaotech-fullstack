import { Link } from 'react-router-dom';
import Layout from '../Layout';
import Section from '../../components/Section';
import ProductListing from '../../components/ProductListing';
import Gallery from '../../components/Gallery';
import products from '../../data/products';
import sneakerIcon from '../../assets/category-sneaker.png';
import shirtIcon from '../../assets/category-shirt.png';
import pantsIcon from '../../assets/category-pants.png';
import './styles.css';

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

const categories = [
  { label: 'Camisetas', icon: 'shirt', filter: 'camisetas' },
  { label: 'Calças', icon: 'pants', filter: 'calças' },
  { label: 'Bonés', icon: 'pants', filter: 'boné' },
  { label: 'Headphones', icon: 'headphones', filter: 'headphones' },
  { label: 'Tênis', icon: 'sneaker', filter: 'tênis' },
];

const featuredProducts = products.map((product, index) => ({
  ...product,
  name: 'K-Swiss V8 - Masculino',
  image: '/featured-k-swiss.png',
  category: 'Tênis',
  price: 200,
  priceDiscount: index < 2 ? 100 : undefined,
}));

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
          <Section title="Coleções em destaque">
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
              {categories.map((category) => (
                <Link
                  className="home-page__category"
                  key={category.label}
                  to={`/produtos?filter=${encodeURIComponent(category.filter)}`}
                >
                  <span className="home-page__category-icon">
                    <CategoryIcon type={category.icon} />
                  </span>
                  <span>{category.label}</span>
                </Link>
              ))}
            </div>
          </Section>

          <Section
            title="Produtos em alta"
            link={{ text: 'Ver todos →', href: '/produtos' }}
          >
            <ProductListing products={featuredProducts} />
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
