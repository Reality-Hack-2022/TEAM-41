import React, { useState } from 'react'
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';

function valuetext(value) {
    return `${value}%`;
}


const marks = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 25,
      label: '25%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 75,
      label: '75%',
    },
    {
      value: 100,
      label: '100%',
    },
  ];
  
const CustomizedSlider = withStyles({
  root: {
      color: '#9DD251',
      height: 8,
      marginBottom: 10
  },
  thumb: {
      height: 24,
      width: 24,
      
      backgroundColor: '#fff',
      border: '2px solid currentColor',
      marginTop: -8,
      marginLeft: -12,
      '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
      },
  },
  active: {},
  valueLabel: {
      left: 'calc(-50% + 4px)',
      color: "white"
  },
  track: {
      height: 8,
      borderRadius: 4,
  },
  rail: {
      height: 8,
      borderRadius: 4,
  },
})(Slider);

const OuroSlider = (props) => {

  const { val, onChange, balance, percent, setPercent } = props

  const p = (parseFloat(val) / balance) * 100

  const handleChange = (event, newValue) => {
    const newBalance = (parseFloat(balance) * newValue / 100).toFixed(4)
    setPercent( parseFloat(val) / parseFloat(balance) * 100 )
    onChange(newBalance)
  };

  return  <CustomizedSlider
              marks={marks}
              value={p}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-custom"
              onChange={handleChange}
              min={0}
              max={100}
          />
}
  
export default OuroSlider
  