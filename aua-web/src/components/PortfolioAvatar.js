import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Avatar } from 'antd';
import * as abbreviate from 'abbreviate';
import uniqolor from 'uniqolor';
import { GlobalContext } from 'contexts/GlobalContext';

const { Text } = Typography;

function getLabel(name) {
  const maxLength = 6;
  const words = name.split(/ +/g);
  if(words.length === 1) {
    return abbreviate(name, {length: maxLength}).toUpperCase();
  }
  const initials = words.map(w => w.charAt(0).toUpperCase()).join('');
  return initials.substring(0, maxLength);
}

export const PortfolioAvatar = props => {
  const { value, user, size, style, ...other } = props;
  const context = React.useContext(GlobalContext);

  if(!value) return null;
  // const {backgroundColor, color} = toMaterialStyle(value, 800);
  const {color: backgroundColor, isLight} = uniqolor(`${user || context.user.email},${value}`);
  const color = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
  const name = getLabel(value);
  const fontSize = 28 * size / 64;
  return <div><Avatar
    size={size}
    {...other}
    style={{...style, backgroundColor}}
  >
    <Text style={{fontSize, color}}>{name}</Text>
  </Avatar></div>
}

PortfolioAvatar.propTypes = {
  value: PropTypes.string.isRequired,
  user: PropTypes.string,
  size: PropTypes.number,
};

PortfolioAvatar.defaultProps = {
  size: 60
};
