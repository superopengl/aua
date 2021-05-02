import { HomeOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { Image } from 'antd';
import { Typography, Row, Col, Space } from 'antd';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import React from 'react';
import styled from 'styled-components';
import HomeRowArea from "./HomeRowArea";

const { Title } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;

a {
  color: #ffffff;

  &:hover {
    text-decoration: underline;
  }
}

.ant-divider {
  border-color: #f0f0f0;
}
`;


class HomeContactArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24
      },
      style: {
        backgroundColor: '#002855',
        color: '#f0f0f0',
      }
    }

    const span = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };

    return (
      <HomeRowArea {...props}>
        <InfoCard >
          <HashAnchorPlaceholder id="about" />
          <Title style={{ color: "#ffffff" }}>Contact</Title>
          <Row style={{ maxWidth: 480, margin: '1rem auto' }} gutter={16}>
            <Col {...span}>
              <MailOutlined style={{ marginRight: 8 }} /><a href="mailto:info@auao.com.au">info@auao.com.au</a>
            </Col>
            <Col {...span}>
              <MailOutlined style={{ marginRight: 8 }} /><a href="mailto:jzhou@auao.com.au">jzhou@auao.com.au</a>
            </Col>
          </Row>
          <Row style={{ maxWidth: 480, margin: '1rem auto' }} gutter={16}>
            <Col {...span}>
              <PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61290615028">+61 2 9061 5028</a>
            </Col>
            <Col {...span}>
              <PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61433388655">+61 433 388 655</a>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <HomeOutlined style={{ marginRight: 8 }} /><a href="https://maps.google.com/?q=Unit 101, 11 Spring St., Chatswood, NSW 2067" target="_blank" rel="noopener noreferrer">
                Unit 101, 11 Spring St., Chatswood, NSW 2067
                </a>
            </Col>
          </Row>
          {/* <Divider /> */}
          <Row style={{ maxWidth: 480, margin: '1rem auto' }}>
            <Col span={24}>
              <a href="https://www.linkedin.com/in/jinlinzhou-auao" target="_blank" rel="noreferrer">
                <Space>

                  <Image src="/images/linkedin-logo.png" width={80} preview={false} />
              https://www.linkedin.com/in/jinlinzhou-auao
              </Space>
              </a>
            </Col>
          </Row>
          <Row style={{maxWidth: 400, margin: 'auto'}} gutter={[30, 30]}>
            <Col span={6}>
              <Space direction="vertical" size="small">
                <Image src="/images/qr-public.jpg" width={80} preview={true} />
                微信公众号
              </Space>
            </Col>
            <Col span={6}>
              <Space direction="vertical" size="small">
                <Image src="/images/qr-wechat.jpg" width={80} preview={true} />
                Wechat
              </Space>
            </Col>
            <Col span={6}>
              <Space direction="vertical" size="small">
                <Image src="/images/qr-channel.jpg" width={80} preview={true} />
                Wechat Channel
              </Space>
            </Col>
            <Col span={6}>
              <Space direction="vertical" size="small">
                <Image src="/images/qr-weibo.jpg" width={80} preview={true} />
                Weibo
              </Space>
            </Col>
          </Row>
        </InfoCard>
      </HomeRowArea>
    );
  }
}

HomeContactArea.propTypes = {};

HomeContactArea.defaultProps = {};

export default HomeContactArea;
