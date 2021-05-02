import React from 'react';
import { Typography } from 'antd';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { PortfolioAvatar } from './PortfolioAvatar';

const { Text } = Typography;

const percentage = {
  'todo': 10,
  'review': 30,
  'held': 50,
  'to_sign': 70,
  'signed': 80,
  'complete': 100,
}

const progressStatus = {
  'todo': 'normal',
  'review': 'normal',
  'held': 'normal',
  'to_sign': 'exception',
  'signed': 'normal',
  'complete': 'success',
}

const tagColor = {
  'todo': 'blue',
  'review': 'gold',
  'held': 'gray',
  'to_sign': 'red',
  'signed': 'blue',
  'complete': 'green',
}

function getLabelFromStatus(status) {
  return <small>{(status || '').replace(/_/g, ' ')}</small>
}

export const TaskStatus = ({ status, shape, name, portfolioId, avatar, ...props }) => {
  const label = getLabelFromStatus(status);
  if (shape === 'circle') {
    return <Progress
      type="circle"
      percent={percentage[status]}
      // steps={4}
      strokeWidth={4}
      strokeColor={tagColor[status]}
      status={progressStatus[status]}
      format={() => avatar ? <PortfolioAvatar value={name} id={portfolioId} size={52} /> : <Text type="secondary"><small>{label}</small></Text>}
      {...props}
    />
  }

  return <Tag color={tagColor[status]}>{label}</Tag>
}

TaskStatus.propTypes = {
  status: PropTypes.string.isRequired,
  name: PropTypes.string,
  portfolioId: PropTypes.string,
  shape: PropTypes.string.isRequired,
  avatar: PropTypes.bool.isRequired,
  width: PropTypes.number,
};

TaskStatus.defaultProps = {
  shape: 'circle',
  avatar: true,
}