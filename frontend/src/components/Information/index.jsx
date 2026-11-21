import { Link } from 'react-router-dom';

export default function Information({ title, informations = [] }) {
  return (
    <div className="min-w-0">
      <h2 className="m-0 mb-5 text-white text-[18px] font-semibold">{title}</h2>
      <ul className="m-0 p-0 list-none grid gap-3">
        {informations.map((item, index) => (
          <li key={`${item.text}-${index}`}>
            <Link
              className="text-white/80 text-[14px] no-underline hover:text-white transition-colors"
              to={item.link}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
