import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './styles.css';

export default function Layout({ children, defaultSearchTerm }) {
  return (
    <div className="layout">
      <Header defaultSearchTerm={defaultSearchTerm} />
      <main className="layout__content">{children}</main>
      <Footer />
    </div>
  );
}
