import Layout from '../Layout';
import Section from '../../components/Section';
import ProductListing from '../../components/ProductListing';
import Gallery from '../../components/Gallery';
import products from '../../data/products';
import './styles.css';

const slides = [
  { src: '/home-slide-1.jpeg', alt: 'Colecao de moda Digital Store' },
  { src: '/home-slide-2.jpeg', alt: 'Destaque de produtos Digital Store' },
  { src: '/home-slide-3.jpeg', alt: 'Novidades Digital Store' },
];

const collections = [
  { src: '/collection-1.png', alt: 'Colecao em destaque 1' },
  { src: '/collection-2.png', alt: 'Colecao em destaque 2' },
  { src: '/collection-3.png', alt: 'Colecao em destaque 3' },
];

export default function HomePage() {
  return (
    <Layout>
      <div className="home-page">
        <Gallery
          className="home-page__hero"
          images={slides}
          width="1440px"
          height="681px"
        />

        <div className="home-page__content">
          <Section title="Coleções em destaque" titleAlign="center">
            <div className="home-page__collections">
              {collections.map((collection) => (
                <img
                  key={collection.src}
                  src={collection.src}
                  alt={collection.alt}
                />
              ))}
            </div>
          </Section>

          <Section title="Produtos em alta">
            <ProductListing products={products} />
          </Section>
        </div>
      </div>
    </Layout>
  );
}
