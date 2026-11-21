import footerLogoMark from '../../assets/footer-logo-mark.png';

export default function Logo({ inverted = false }) {
  return (
    <span
      className={`inline-flex w-[253px] max-[600px]:w-auto h-[44px] max-[600px]:h-8 items-center gap-2 max-[600px]:gap-1.5 text-[36px] max-[600px]:text-[20px] font-bold no-underline whitespace-nowrap ${
        inverted ? 'text-white' : 'text-primary'
      }`}
      aria-label="Digital Store"
    >
      <span
        className={`inline-flex w-[32px] h-[32px] max-[600px]:w-6 max-[600px]:h-6 shrink-0 items-center justify-center rounded-[5px] ${
          inverted ? 'bg-transparent' : 'bg-current'
        }`}
        aria-hidden="true"
      >
        {inverted ? (
          <img className="block w-full h-full object-contain" src={footerLogoMark} alt="" />
        ) : (
          <svg
            className="w-[22px] h-[22px] max-[600px]:w-4 max-[600px]:h-4 fill-none stroke-white stroke-[2] [stroke-linecap:round] [stroke-linejoin:round]"
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
