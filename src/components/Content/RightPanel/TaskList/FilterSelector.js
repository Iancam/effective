import React from 'react';
import Select from 'react-select';
import { isFunction } from 'lodash';
import { uniqBy } from 'lodash';
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

const usersInMatches = match => {
  return uniqBy(matches, m => m.assigned_to)
    .filter(match => {
      return match.assigned_to;
    })
    .map(match => {
      return { label: match.assigned_to, value: match };
    })
    .filter(({ label }) => label);
};

const statusesInMatches = matches => {
  const thing = uniqBy(matches, match => match.status).map(match => ({
    label: match.status,
    value: match
  }));
  return thing;
};

const selector_factory = ({ prefix, options, onChangeFilter }) => {
  const filterStringToValues = fs =>
    fs
      .split(' ')
      .filter(tok => tok.startsWith(prefix) && tok.length !== prefix.length);

  const handleChange = (selectedOption, obj, currentFilterString) => {
    const onChange = (value, withPrefix = true) =>
      onChangeFilter({ target: { value: (withPrefix ? prefix : '') + value } });
    const { action } = obj;
    const actionTypes = {
      clear: () => onChange('', false),
      'create-option': () => undefined,
      'deselect-option': () => undefined,
      'pop-value': () => undefined,
      'remove-value': ({ removedValue }) => {
        const withoutVal = currentFilterString.replace(removedValue.label, '');
        console.log(withoutVal);

        onChange(withoutVal, false);
      },
      'select-option': ({ option }) => onChange(option.label),
      'set-value': () => undefined
    };

    actionTypes[action](obj);
  };

  //handle options
  return ({ filterOption, matches }) => {
    const { label: filterString } = filterOption.length
      ? filterOption[0]
      : { label: '' };

    const value = filterStringToValues(filterString).map(tok => ({
      label: tok.replace(prefix, '')
    }));
    const derivedOptions = isFunction(options) ? options(matches) : options;

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
        options={derivedOptions}
      />
    );
  };
};
export default selector_factory;
