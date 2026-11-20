import { useId } from 'react';
import './styles.css';

export default function FilterGroup({
  title,
  inputType = 'checkbox',
  options = [],
  name,
  selectedValues = [],
  selectedValue = '',
  onChange,
}) {
  const groupId = useId();
  const type = inputType === 'radio' ? 'radio' : 'checkbox';

  return (
    <fieldset className="filter-group">
      <legend className="filter-group__title">{title}</legend>
      <div className="filter-group__options">
        {options.map((option, index) => {
          const value = option.value ?? option.text;
          const id = `${groupId}-${index}`;
          const checked = type === 'radio'
            ? selectedValue === value
            : selectedValues.includes(value);

          return (
            <label className="filter-group__option" htmlFor={id} key={id}>
              <input
                id={id}
                type={type}
                name={name || groupId}
                value={value}
                checked={checked}
                onChange={(event) => onChange?.(value, event.target.checked)}
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
