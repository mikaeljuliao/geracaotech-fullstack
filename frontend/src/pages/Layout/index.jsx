import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Layout({ children, defaultSearchTerm }) {
  return (
    <div className="layout min-h-screen flex flex-col bg-[#f7f7fc] overflow-x-hidden w-full max-w-full">
      <Header defaultSearchTerm={defaultSearchTerm} />
      <main className="layout__content flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
