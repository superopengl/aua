import React from 'react';
import HomeRowArea from "./homeAreas/HomeRowArea";
import styled from 'styled-components';
import { Typography, Space, Card } from 'antd';
import { Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const StyledCard = styled(Card)`

`;

export const ServiceInfoCard = props => {

  return <div style={{paddingTop: 30, paddingBottom: 30}}>
<Title style={{ textAlign: 'center' }} level={4}>{props.title}</Title>
    <StyledCard
      title={<div style={{ textAlign: 'center' }}>
        <Text
          style={{ whiteSpace: 'pre-line' }}
        >
          {props.sub}
        </Text>
      </div>}
      bordered={false}
      type="inner"
    // style={{ width: '100%' }}
    >
      <Paragraph
        style={{ whiteSpace: 'pre-line' }}
      >
        {props.description}
      </Paragraph>
    </StyledCard >
  </div>
}

