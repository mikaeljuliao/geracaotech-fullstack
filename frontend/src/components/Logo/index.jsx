import footerLogoMark from '../../assets/footer-logo-mark.png';

export default function Logo({ inverted = false }) {
  return (
    <span
      className={`inline-flex w-[253px] h-[44px] items-center gap-2 text-[36px] font-bold no-underline whitespace-nowrap ${
        inverted ? 'text-white' : 'text-primary'
      }`}
      aria-label="Digital Store"
    >
      <span
        className={`inline-flex w-[32px] h-[32px] items-center justify-center rounded-[5px] ${
          inverted ? 'bg-transparent' : 'bg-current'
        }`}
        aria-hidden="true"
      >
        {inverted ? (
          <img className="block w-full h-full object-contain" src={footerLogoMark} alt="" />
        ) : (
          <svg
            className="w-[22px] h-[22px] fill-none stroke-white stroke-[2] [stroke-linecap:round] [stroke-linejoin:round]"
            viewBox="0 0 24 24"
          >
            <path d="m8 7 5 5-5 5M14 16h4" />
          </svg>
        )}
      </span>
      <span className="font-bold">Digital Store</span>
    </span>
  );
}
