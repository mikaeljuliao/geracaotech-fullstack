import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Layout({ children, defaultSearchTerm }) {
  return (
    <div className="layout min-h-screen flex flex-col bg-[#f7f7fc]">
      <Header defaultSearchTerm={defaultSearchTerm} />
      <main className="layout__content flex-1">{children}</main>
      <Footer />
    </div>
  );
}
