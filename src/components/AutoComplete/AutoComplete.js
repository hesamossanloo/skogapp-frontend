import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function FixedTags() {
  const fixedOptions = [treeData[1]];
  const [value, setValue] = React.useState([...fixedOptions, treeData[13]]);

  return (
    <Autocomplete
      multiple
      id="fixed-tags"
      value={value}
      onChange={(event, newValue) => {
        setValue([
          ...fixedOptions,
          ...newValue.filter((option) => fixedOptions.indexOf(option) === -1),
        ]);
      }}
      options={treeData}
      getOptionLabel={(option) => option.name}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            key={index}
            label={option.name}
            {...getTagProps({ index })}
            disabled={fixedOptions.indexOf(option) !== -1}
          />
        ))
      }
      sx={{
        width: '100%',
        borderColor: '#2b3553',
        color: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'transparent',
        backgroundClip: 'padding-box',
        height: '45px',
        '& .MuiAutocomplete-inputRoot': {
          backgroundColor: 'white', // Change the background color
          borderRadius: '5px', // Change the border radius
        },
      }}
      renderInput={(params) => <TextField {...params} placeholder="SEARCH" />}
    />
  );
}
const treeData = [
  { name: 'Oak', avgHeight: getRandomHeight() },
  { name: 'Maple', avgHeight: getRandomHeight() },
  { name: 'Pine', avgHeight: getRandomHeight() },
  { name: 'Birch', avgHeight: getRandomHeight() },
  { name: 'Willow', avgHeight: getRandomHeight() },
  { name: 'Cedar', avgHeight: getRandomHeight() },
  { name: 'Fir', avgHeight: getRandomHeight() },
  { name: 'Ash', avgHeight: getRandomHeight() },
  { name: 'Poplar', avgHeight: getRandomHeight() },
  { name: 'Spruce', avgHeight: getRandomHeight() },
  { name: 'Cypress', avgHeight: getRandomHeight() },
  { name: 'Redwood', avgHeight: getRandomHeight() },
  { name: 'Beech', avgHeight: getRandomHeight() },
  { name: 'Sycamore', avgHeight: getRandomHeight() },
  { name: 'Hickory', avgHeight: getRandomHeight() },
  { name: 'Cherry', avgHeight: getRandomHeight() },
  { name: 'Dogwood', avgHeight: getRandomHeight() },
  { name: 'Magnolia', avgHeight: getRandomHeight() },
  { name: 'Eucalyptus', avgHeight: getRandomHeight() },
  { name: 'Chestnut', avgHeight: getRandomHeight() },
];

function getRandomHeight() {
  return Math.floor(Math.random() * 100) + 1;
}
