import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography, Avatar } from 'antd';

const { Title } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
// margin-top: 2rem;
padding: 1rem;
// border: 1px solid #eeeeee;

p {
  text-align: left;
}
`;



const StyledAvatar = (props) => <Avatar
  style={{
    marginBottom: '1rem',
    border: '1px solid #dddddd'
  }}
  size={240} src={props.src} />


class HomeTeamArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 8,
        xl: 8,
        xxl: 8
      },
      style: {
        backgroundImage: 'linear-gradient(180deg, #f5f5f5, #ffffff)',
        // color: '#f0f0f0',
      }
    }

    return (
      <HomeRowArea {...props} title="Team">
        <InfoCard >
          <StyledAvatar src="/images/avatar-chaire.jpg" />
          <section>
            <p>
              Hi, I am Claire. I have been in Australia for more than 5 years, been working in our firm for more
              than 3 years. With my life experience of crossing Australia in the past where I worked, I loved
              and I enjoyed.</p>
            <p>
              I am usually busy with numbers and paper works. Thank you if you can call me or text me or
              even come to see me!
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <StyledAvatar src="/images/avatar-pei.jpg" />
          <section>
            <p>
              Hi, I am is Pei. I graduated from the University of Sydney and I am a self-motivated CPA
              candidate as well I have been working as an accountant since I graduated and I am happy to join
              our team. I am responsible for the bookkeeping, corporate accounting, and taxation matters.
            </p>
            <p>I am fond of the work-life balance style of our firm. When not in the office, you can find me
            spending time with my family or playing the flute.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <StyledAvatar src="/images/avatar-orange.jpg" />
          <section>
            <p>
              Hi, I’m Orange. I originally from Malaysia. I have 4 years work experience in audit firm. I love to
              explore culture and try different kind of food. My passion is singing. Feel free to join me if you
              love singing too.
            </p>
            <p>
              I’m a blogger, I love to record every moments of my life in my blog.
            </p>
          </section>
        </InfoCard>

      </HomeRowArea >
    );
  }
}

HomeTeamArea.propTypes = {};

HomeTeamArea.defaultProps = {};

export default HomeTeamArea;
