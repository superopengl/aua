import React from 'react';
import HomeRowArea from "./homeAreas/HomeRowArea";
import styled from 'styled-components';
import { Typography, Space, Card } from 'antd';
import { Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const StyledCard = styled(Card)`
.ant-card-head {
  background-color: rgba(0,0,0,0.3);
  // background-color: #003a8c;
  // background-image: linear-gradient(90deg, #003a8c 0%, #00081a 100%);

  .ant-typography {
    color: rgba(255,255,255,1.0);
  }
}

height: 100%;
`;

export const ServiceInfoCard = props => {

  return <div style={{ paddingTop: 30, paddingBottom: 30, height: '100%' }}>
    <Title style={{ textAlign: 'center' }} level={4}>{props.title}</Title>
    <StyledCard
      title={<div style={{ textAlign: 'left' }}>
        <Text
          style={{ whiteSpace: 'pre-line' }}
        >
          {props.sub}
        </Text>
      </div>}
      bordered={true}
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

