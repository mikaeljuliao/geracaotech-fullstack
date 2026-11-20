import { Link } from 'react-router-dom';
import './styles.css';

export default function Information({ title, informations = [] }) {
  return (
    <section className="information">
      <h2 className="information__title">{title}</h2>
      <ul className="information__list">
        {informations.map((item) => (
          <li key={`${item.text}-${item.link}`}>
            <Link to={item.link}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
