import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography, Space, Row, Col, Descriptions } from 'antd';
import { ServiceInfoCard } from 'components/ServiceInfoCard';
import { Image } from 'antd';
import { Divider } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { useMediaQuery } from 'react-responsive';


const { Paragraph, Title } = Typography;
const ServiceTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  color: '#383838';
  text-align: center;
`;



const Container = styled.div`
width: 100%;
margin: 0;
padding: 0;
background-color: #001640;
background-image: linear-gradient(45deg, #001640, #00081a 100%);
`;

const InnerContainer = styled.div`
width: 100%;
max-width: 1600px;
margin-left: auto;
margin-right: auto;
padding: 60px 1rem;
display: flex;
justify-content: center;

.ant-typography {
  color: rgba(255,255,255,0.75);
}

.ant-divider {
  border-color: rgba(255,255,255,0.75);
}
`;



const HomeBossArea = prop => {

  const isTabletOrMobileDevice = useMediaQuery({
    query: '(max-device-width: 600px)'
  })

  const span1 = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  const span2 = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  const span3 = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 8,
    xl: 8,
    xxl: 8
  };
  return <Container>
    <InnerContainer>
      <Space style={{ maxWidth: 1200, alignItems: 'center' }} direction={isTabletOrMobileDevice ? 'vertical' : 'horizontal'} size="large">
        {/* <Image width={200} src="/images/avatar-zhou.jpg" preview={false} /> */}
        <Avatar src="/images/avatar-zhou.jpg" size={240} />
        <div>
          <Space style={{ alignItems: 'center', width: '100%' }} direction={isTabletOrMobileDevice ? 'vertical' : 'horizontal'}>
            <Title style={{ margin: 0 }}>Jinlin Zhou</Title>
            <Space>

              <Image src="/images/cpa.jpg" height="auto" width={80} preview={true} />
              <Image src="/images/registered.jpg" height="auto" width={58} preview={true} />
            </Space>
          </Space>
          <Divider />
          <Paragraph>
            Hi, I am the sole principal, public practitioner in AU Accounting Office. I have been working as accountant since 2005 both in Australia and overseas. My own firm has been set up in 2016.
        </Paragraph>
          <Paragraph>
            I like reading, sports, swimming, most of time if I am not working, you probably can find me nowhere but at home, watching soap opera or creating my own artworks.
</Paragraph>
          <Paragraph>
            I have a lovely family and living in Northshore, hope somewhere, sometime, we just walk by on the street or catching up for a coffee.
</Paragraph>
        </div>
      </Space>
    </InnerContainer>
  </Container>
}

HomeBossArea.propTypes = {};

HomeBossArea.defaultProps = {};

export default HomeBossArea;
