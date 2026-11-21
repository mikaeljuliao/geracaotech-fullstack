import { useState } from 'react';

export default function ProductOptions({
  options = [],
  radius = '4px',
  shape = 'square',
  type = 'text',
  defaultOption,
  onChange,
}) {
  const [selectedOption, setSelectedOption] = useState(defaultOption ?? options[0]);
  const optionShape = shape === 'circle' ? 'circle' : 'square';
  const optionType = type === 'color' ? 'color' : 'text';

  function selectOption(option) {
    setSelectedOption(option);
    onChange?.(option);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option, index) => {
        const isSelected = selectedOption === option;

        return (
          <button
            key={`${option}-${index}`}
            type="button"
            onClick={() => selectOption(option)}
            aria-label={optionType === 'color' ? `Selecionar cor ${option}` : `Selecionar ${option}`}
            aria-pressed={isSelected}
            className={`inline-flex items-center justify-center p-0 cursor-pointer transition-colors ${
              optionShape === 'circle' ? 'w-[31px] h-[31px] rounded-full' : 'w-[46px] h-[46px]'
            } ${
              optionType === 'color'
                ? isSelected
                  ? 'border-2 border-primary shadow-[0_0_0_2px_white_inset]'
                  : 'border-transparent'
                : isSelected
                ? 'border-2 border-primary bg-primary text-white text-[24px] font-bold'
                : 'border border-light-gray-2 bg-white text-dark-gray-2 text-[24px] font-bold'
            }`}
            style={{
              borderRadius: optionShape === 'circle' ? '50%' : radius,
              ...(optionType === 'color' ? { backgroundColor: option } : {}),
            }}
          >
            {optionType === 'text' ? option : null}
          </button>
        );
      })}
    </div>
  );
}
