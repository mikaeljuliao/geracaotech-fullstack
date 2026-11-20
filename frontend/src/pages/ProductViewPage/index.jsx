import Layout from '../Layout';
import { useParams } from 'react-router-dom';
import BuyBox from '../../components/BuyBox';
import Gallery from '../../components/Gallery';
import ProductListing from '../../components/ProductListing';
import ProductOptions from '../../components/ProductOptions';
import Section from '../../components/Section';
import products from '../../data/products';
import './styles.css';

const productImages = Array.from({ length: 5 }, (_, index) => ({
  src: `/produc-image-${index + 1}.jpeg`,
  alt: `Imagem do produto ${index + 1}`,
}));

const sizes = ['39', '40', '41', '42', '43'];
const colors = ['#C92071', '#1F1F1F', '#B5B6F2'];

export default function ProductViewPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);

  return (
    <Layout>
      {product ? (
        <div className="product-view-page">
          <div className="product-view-page__details">
            <Gallery
              className="product-view-page__gallery"
              images={productImages}
              showThumbs
              width="700px"
              height="570px"
              radius="4px"
            />
            <BuyBox
              name={product.name}
              reference={`DS-${product.id.padStart(4, '0')}`}
              stars="4.7"
              rating="90"
              price={product.price}
              priceDiscount={product.priceDiscount}
              description={`O ${product.name} combina conforto, qualidade e estilo para acompanhar você em todos os momentos.`}
            >
              <div className="product-view-page__option-group">
                <h2>Tamanho</h2>
                <ProductOptions options={sizes} shape="square" type="text" radius="4px" />
              </div>
              <div className="product-view-page__option-group">
                <h2>Cor</h2>
                <ProductOptions options={colors} shape="circle" type="color" />
              </div>
            </BuyBox>
          </div>

          <Section
            title="Produtos recomendados"
            titleAlign="left"
            link={{ text: 'Ver todos', href: '/products' }}
          >
            <ProductListing
              products={products.filter((item) => item.id !== product.id).slice(0, 4)}
            />
          </Section>
        </div>
      ) : (
        <div className="product-view-page__not-found">
          <h1>Produto não encontrado</h1>
        </div>
      )}
    </Layout>
  );
}
