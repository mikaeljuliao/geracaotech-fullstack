import { Link, useParams } from 'react-router-dom';
import BuyBox from '../../components/BuyBox';
import Gallery from '../../components/Gallery';
import ProductListing from '../../components/ProductListing';
import ProductOptions from '../../components/ProductOptions';
import Section from '../../components/Section';
import Layout from '../Layout';
import products from '../../data/products';
import './styles.css';

const galleryBackgrounds = ['#E4E4FE', '#FFE9C7', '#FFC2C4', '#E3D0A7', '#E9E0D3'];
const sneakerImage = '/nike-revolution-6-next-nature.png';
const productDetailOverrides = {
  '1': {
    name: 'Tênis Nike Revolution 6 Next Nature Masculino',
    brand: 'Nike',
    category: 'Tênis',
    subcategory: 'Casual',
    reference: '38416711',
    price: 249.9,
    priceDiscount: 219,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    image: sneakerImage,
  },
};

const relatedProducts = Array.from({ length: 4 }, (_, index) => ({
  id: `related-sneaker-${index + 1}`,
  productPageId: `${index + 2}`,
  name: 'K-Swiss V8 - Masculino',
  image: '/featured-k-swiss.png',
  price: 200,
  ...(index < 2 ? { priceDiscount: 100 } : {}),
  brand: 'K-Swiss',
  category: 'Tênis',
}));

const sizes = ['39', '40', '41', '42', '43'];
const colors = ['#68DDF0', '#F95B63', '#5D5D5D', '#7379C2'];

export default function ProductViewPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const productDetails = product
    ? { ...product, ...productDetailOverrides[id] }
    : null;
  const productImages = productDetails
    ? galleryBackgrounds.map((background, index) => ({
      src: productDetails.image,
      alt: `${productDetails.name} - imagem ${index + 1}`,
      background,
    }))
    : [];
  const productReference = productDetails?.reference
    || productDetails?.id.padStart(8, '0');

  return (
    <Layout defaultSearchTerm={productDetails?.category}>
      {productDetails ? (
        <div className="product-view-page">
          <div className="product-view-page__inner">
            <nav className="product-view-page__breadcrumb" aria-label="Navegação estrutural">
              <ol>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/produtos">Produtos</Link></li>
                <li><Link to="/produtos?filter=tenis">Tênis</Link></li>
                <li><span>{productDetails.brand}</span></li>
                <li><span aria-current="page">{productDetails.name}</span></li>
              </ol>
            </nav>

            <div className="product-view-page__details">
              <Gallery
                className="product-view-page__gallery"
                images={productImages}
                showThumbs
                width="700px"
                height="570px"
                radius="4px"
                renderSlide={(image) => (
                  <div
                    className="product-view-page__slide"
                    style={{ backgroundColor: image.background }}
                  >
                    <img src={image.src} alt={image.alt} />
                  </div>
                )}
              />
              <BuyBox
                name={productDetails.name}
                category={productDetails.subcategory || productDetails.category}
                brand={productDetails.brand}
                reference={productReference}
                stars="4.7"
                rating="90"
                price={productDetails.price}
                priceDiscount={productDetails.priceDiscount}
                description={productDetails.description
                  || `O ${productDetails.name} combina conforto, qualidade e estilo para acompanhar você em todos os momentos.`}
              >
                <div className="product-view-page__option-group">
                  <h2>Tamanho</h2>
                  <ProductOptions
                    key={`sizes-${productDetails.id}`}
                    options={sizes}
                    shape="square"
                    type="text"
                    radius="4px"
                    defaultOption="41"
                  />
                </div>
                <div className="product-view-page__option-group">
                  <h2>Cor</h2>
                  <ProductOptions
                    key={`colors-${productDetails.id}`}
                    options={colors}
                    shape="circle"
                    type="color"
                    defaultOption="#F95B63"
                  />
                </div>
              </BuyBox>
            </div>

            <Section
              title="Produtos Relacionados"
              mobileTitle="Coleções em destaque"
              titleAlign="left"
              link={{ text: 'Ver todos  →', href: '/produtos?filter=tenis' }}
            >
              <ProductListing
                products={id === '1'
                  ? relatedProducts
                  : products.filter((item) => item.id !== productDetails.id).slice(0, 4)}
              />
            </Section>
          </div>
        </div>
      ) : (
        <div className="product-view-page__not-found">
          <h1>Produto não encontrado</h1>
        </div>
      )}
    </Layout>
  );
}
