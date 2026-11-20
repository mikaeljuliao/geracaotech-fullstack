import { useState } from 'react';
import './styles.css';

export default function ProductOptions({
  options = [],
  radius = '4px',
  shape = 'square',
  type = 'text',
  onChange,
}) {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const optionShape = shape === 'circle' ? 'circle' : 'square';
  const optionType = type === 'color' ? 'color' : 'text';

  function selectOption(option) {
    setSelectedOption(option);
    onChange?.(option);
  }

  return (
    <div className={`product-options product-options--${optionShape}`}>
      {options.map((option, index) => (
        <button
          className={`product-options__option${selectedOption === option ? ' product-options__option--selected' : ''}${optionType === 'color' ? ' product-options__option--color' : ''}`}
          key={`${option}-${index}`}
          type="button"
          onClick={() => selectOption(option)}
          aria-label={optionType === 'color' ? `Selecionar cor ${option}` : `Selecionar ${option}`}
          aria-pressed={selectedOption === option}
          style={{
            borderRadius: optionShape === 'circle' ? '50%' : radius,
            ...(optionType === 'color' ? { backgroundColor: option } : {}),
          }}
        >
          {optionType === 'text' ? option : null}
        </button>
      ))}
    </div>
  );
}
