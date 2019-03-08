import React from 'react';
import Select from 'react-select';

const selector_factory = ({ prefix, transformer, onChangeFilter }) => {
  const filterStringToValues = fs =>
    fs
      .split(' ')
      .filter(tok => tok.startsWith(prefix))
      .map(tok => ({ label: tok }));

  const handleChange = (selectedOption, obj, currentFilterString) => {
    const onChange = (value, withPrefix = true) =>
      onChangeFilter({ target: { value: (withPrefix ? prefix : '') + value } });
    const { action } = obj;
    const actionTypes = {
      clear: () => onChange('', false),
      'create-option': () => undefined,
      'deselect-option': () => undefined,
      'pop-value': () => undefined,
      'remove-value': ({ removedValue }) =>
        onChange(currentFilterString.replace(removedValue.label, ''), false),
      'select-option': ({ option }) => onChange(option.label),
      'set-value': () => undefined
    };

    actionTypes[action](obj);
  };
  const initial_val = initial_val || [];
  const recolor = base => ({
    ...base,
    background: '#1c1c1c',
    color: 'white',
    highlight: 'rgba(0, 0, 0, .5)',
    width: '100%'
  });
  const selectStyle = {
    singleValue: base => ({ ...base, color: 'white' }),
    valueContainer: recolor,
    menu: recolor
  };
  //handle options
  return ({ filterOption, matches }) => {
    const { label: filterString } = filterOption.length
      ? filterOption[0]
      : { label: '' };
    const value = filterStringToValues(filterString);

    const options = transformer(matches);
    return (
      <Select
        isSearchable
        isMulti
        name={prefix}
        placeholder={prefix}
        styles={selectStyle}
        value={value}
        onChange={(selection, obj) => {
          handleChange(selection, obj, filterString);
        }}
        options={options}
      />
    );
  };
};
export default selector_factory;
