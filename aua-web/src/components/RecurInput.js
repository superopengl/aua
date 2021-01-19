import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { Checkbox, Typography, Radio, Space, Select } from 'antd';
import * as moment from 'moment';
import cronstrue from 'cronstrue';
// import 'react-cron-generator/dist/cron-builder.css'

const { Text } = Typography;

const StyledSpace = styled(Space)`
border: 1px solid rgba(217,217,217);
border-radius: 2px;
padding: 11px;
width: 100%;
`;


/**
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
 */
const pattern = /(.+) (.+) (.+) (.+) (.+) (.+)/;

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

export const RecurInput = props => {
  const { value, onChange } = props;

  const [cron, setCron] = React.useState(value);

  const tokens = pattern.exec(cron);
  const monthInfo = tokens[5].split('/');

  const [dayOfMonth, setDayOfMonth] = React.useState(tokens[4]);
  const [everyXMonth, setEveryXMonth] = React.useState(monthInfo[1]);

  const [defaultPeriod, setDefaultPeriod] = React.useState(tokens[6] !== '*' ? 'weekly' : tokens[5].includes('/') ? 'monthly' : 'yearly');

  React.useEffect(() => {
    const tokens = pattern.exec(cron);
    const monthInfo = tokens[5].split('/');
    setMinute(tokens[2]);
    setHour(tokens[3]);
    setDayOfMonth(tokens[4]);
    setMonth(monthInfo[0]);
    setEveryXMonth(monthInfo[1])
    setDayOfWeek(tokens[6]);

    const defaultPeriod = tokens[6] !== '*' ? 'weekly' : tokens[5].includes('/') ? 'monthly' : 'yearly';
    setDefaultPeriod(defaultPeriod);

    const expression = cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true });
    setExpression(expression);

    onChange(cron);
  }, [cron])

  const handleEveryXMonthChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 $4 */${value} $6`));
  }

  const handleDayOfMonthChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 ${value} $5 $6`));
  }

  const handleDayOfWeekChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 $4 $5 ${value}`));
  }

  const handleTimeChange = value => {
    if (!value) return;
    const minute = value.format('m');
    const hour = value.format('H');
    setCron(cron.replace(pattern, `$1 ${minute} ${hour} $4 $5 $6`));
  }

  const handleMonthChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 $4 ${value} $6`));
  }

  const handleChangePeriod = period => {
    switch (period) {
      case 'weekly':
        setCron(cron.replace(pattern, `$1 $2 $3 * * 0`));
        break;
      case 'monthly':
        setCron(cron.replace(pattern, `$1 $2 $3 L */1 *`));
        break;
      case 'yearly':
        setCron(cron.replace(pattern, `$1 $2 $3 1 1 *`));
        break;
      default:
        throw new Error(`Unsupported period ${period}`);
    }
  }

  return (<><StyledSpace direction="vertical" size="middle">

    <Radio.Group type="card" defaultActiveKey={defaultPeriod} onChange={e => handleChangePeriod(e.target.value)}>
      <Radio style={radioStyle} value="yearly">
        Every year
      </Radio>
      <Radio style={radioStyle} value="monthly">
        <div>
          Every <Select style={{ width: 60 }} onChange={handleEveryXMonthChange} value={everyXMonth}>
            <Select.Option value="1">1</Select.Option>
            <Select.Option value="2">2</Select.Option>
            <Select.Option value="3">3</Select.Option>
            <Select.Option value="4">4</Select.Option>
            <Select.Option value="5">5</Select.Option>
            <Select.Option value="6">6</Select.Option>
          </Select> month(s)
        </div>
        <div>
          <Checkbox disabled={!isLastDay} onChange={e => handleIsLastDay(e.target.value)}>Last day of month</Checkbox>
        </div>
      </Radio>
      <Radio style={radioStyle} value="weekly">
        Every <Select style={{ width: 60 }} onChange={handleEveryXMonthChange} value={everyXMonth}>
          <Select.Option value="1">1</Select.Option>
          <Select.Option value="2">2</Select.Option>
          <Select.Option value="3">3</Select.Option>
        </Select> week(s)
      </Radio>
    </Radio.Group>
  </StyledSpace>
  </>)
}

RecurInput.propTypes = {
  value: PropTypes.string.isRequired,
};

RecurInput.defaultProps = {
  value: '0 0 0 L */1 *',
};
