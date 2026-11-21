import { useId } from 'react';

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
    <fieldset className="min-w-0 m-0 p-0 border-0">
      <legend className="mb-3 p-0 text-dark-gray-2 text-[14px] font-bold">{title}</legend>
      <div className="grid gap-2.5">
        {options.map((option, index) => {
          const value = option.value ?? option.text;
          const id = `${groupId}-${index}`;
          const checked = type === 'radio'
            ? selectedValue === value
            : selectedValues.includes(value);

          return (
            <label
              className="flex items-center gap-2.5 text-dark-gray-2 text-[14px] cursor-pointer hover:text-dark-gray select-none"
              htmlFor={id}
              key={id}
            >
              <input
                id={id}
                type={type}
                name={name || groupId}
                value={value}
                checked={checked}
                onChange={(event) => onChange?.(value, event.target.checked)}
                className="w-[22px] h-[22px] flex-shrink-0 m-0 accent-primary cursor-pointer rounded"
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
