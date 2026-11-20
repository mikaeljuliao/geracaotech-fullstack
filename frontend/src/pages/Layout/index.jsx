import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './styles.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__content">{children}</main>
      <Footer />
    </div>
  );
}
