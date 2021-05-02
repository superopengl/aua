import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography, Space, Row, Col, Descriptions } from 'antd';
import { ServiceInfoCard } from 'components/ServiceInfoCard';

const ServiceTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  color: '#383838';
  text-align: center;
`;

const Container = styled.div`
width: 100%;
max-width: 1600px;
margin-left: auto;
margin-right: auto;
padding: 60px 1rem;
`;

const data = [
  {
    title: 'Outsourcing Bookkeeping',
    sub: 'Need a bookkeeper? Need assistance with MYOB, Xero, Quickbooks or your own software?',
    description: `We provide flexible and also fix contract rate for your business for daily bookkeeping, this service includes:

Entering sales invoices and bills into finance system,
Submitting payment batch for approval,
Matching your invoices with your customer payments,
Bank Reconciliation,
Fix asset recording,
BAS preparation,
Fix problems between different software, database
Simplified filing system,
Debt Collecting, 
Liaising with your accountant,`,
  },
  {
    title: 'Outsourcing Payroll',
    sub: 'Not having professional payroll in your business? Running business exposure under A BIG risk of underpay your employee? Can’t make the deadline to pay Super?',
    description: `Paying your employee at right rate under a right award, paying super before the deadline is more and more important. We outsourcing payroll services including:

Setting up employee correctly in system
Consulting regarding industry award and liaising with HR professionals when is necessary
Reviewing your employment contract
Processing Payrun and sending Payslip
Reporting payroll information to accountant
Calculating superannuation and make payment before deadline
STP payroll information to ATO and finalisation for Year End
SGC Super Guarantee Charge calculation and lodge`,
  },
  {
    title: 'Accounting',
    sub: `Looking for a financial statement? Trying to understand your business performance?
Business is more than just the numbers. Having a solid understanding of your business, financial position, and the market enables you to make business decisions that ultimately improve efficiency and drive profitability. `,
    description: `We are your partners in business; we work in collaboration with you to fully understand your business, keep you informed at all times, and develop a customised strategy to achieve your business goals. We provide accounting services in our firm including:

Reconciliation for balance sheet accounts on your book,
Preparation of BAS, IAS, PAYG instalment, PAYG withholding
Preparing financial statements for the end of year or other special purpose reports,
External and Internal Budget & forecast preparation
Depreciation schedule preparation
Business analysis and performance reviews
Consolidation reports for big group with subsidiaries`,
  },
  {
    title: 'Tax',
    sub: `Our role as professional tax accountant is to help you navigate your way through the complex world of tax, and provide strategic solutions to legally minimise tax and develop an effective tax strategy.
We updates you for list of tax issues and reporting, as well as the laws and ATO rulings how to go with it. You have to pay it, but let’s make sure you don’t pay more than you have to.`,
    description: `We help large companies, SME’s, sole traders, start-up companies and individuals with a range of tax issues. Explore the services we offer:

Individual tax return
Corporate Tax
Good and Services Tax and business activity statement
Capital Gain Tax
Fringe Benefit Tax
Payroll tax
Reconciliation for Integrated Account and Income tax account with your book
Dealing with ATO Audit Reviews
Global Compliance Services
Updating tax registration in ATO for GST, PAYGI, PAYG withholding, etc.`,
  },
  {
    title: 'Mortgage Broking',
    sub: `Whatever you are first home buyer, investor, developer, builder or business owner, we provide services and advice for mortgage broking to you!`,
    description: `
    Home Loans
Business Loans
Refinancing
Construction home loans
First Home Buyers
    `,
  },
  {
    title: 'Corporate Advisory',
    sub: `Providing superior strategic advice, our corporate advisory team is able to help steer you through the options for mergers, acquisitions, restructuring, takeover defence and divestitures.
`,
    description: `Helping potential business owner for the due diligent report before they make decision to sell, buy, merge or extend your business plan.
    We provide service relating to company, trust, partnership and sole trader setting up, suggesting business owner to choose the most suitable structure.

    Maintaining your ASIC records including changing address, changing share structure, shareholders, and director.  

    Providing superior strategic advice, our corporate advisory team is able to help steer you through the options for mergers, acquisitions, restructuring, takeover defence and divestitures.

    IT Support including conversion balance entering of changing accounting system, data migration into different system, setting up new finance system, training staff to utilise system, developing system, design website.
    `,
  },
  {
    title: 'Audit and Insurance',
    sub: `We corporate with independent audit firm designed services according to your business scope. Auditing is governed by local and international audit standards.
`,
    description: `This includes:

    External auditing
    Internal auditing
    Internal control process setting up
    Designing financial policies
    Due diligent report regarding commercial, industry status, finance position, tax compliance, payroll records, operational, etc.
    Government Grants Review and preparation
    `,
  },
  {
    title: '188/132投资移民审计',
    sub: `针对188 & 132 签证的中国大陆申请者，我们提供申请者在中国大陆，或澳州的生意进行审阅服务，我们持有相应资质，并且丰富的经验，及时准确的出具提供澳州各州政府及移民局递交申请的财务报表。`,
    description: `我们承办中国企业主申请澳洲投资移民188/132类签证，针对中国企业进行财务审计，出具符合2400/4400标准的财务报表。具体业务细节欢迎咨询。`,
  }
]

const HomeServiceInfoArea = () => {

  const getCardComponent = (i) => <ServiceInfoCard
    title={data[i].title}
    sub={data[i].sub}
    description={data[i].description}
  />

  const span = {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 12,
    xl: 12,
    xxl: 6
  };


  return <Container>
    <ServiceTitle>Services</ServiceTitle>
    <Row gutter={[30, 30]}>
      <Col {...span}>{getCardComponent(0)}</Col>
      <Col {...span}>{getCardComponent(1)}</Col>
      <Col {...span}>{getCardComponent(2)}</Col>
      <Col {...span}>{getCardComponent(3)}</Col>
      <Col {...span}>{getCardComponent(4)}</Col>
      <Col {...span}>{getCardComponent(5)}</Col>
      <Col {...span}>{getCardComponent(6)}</Col>
      <Col {...span}>{getCardComponent(7)}</Col>
    </Row>
  </Container>
}

HomeServiceInfoArea.propTypes = {};

HomeServiceInfoArea.defaultProps = {};

export default HomeServiceInfoArea;
