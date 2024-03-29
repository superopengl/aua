import {
  BellOutlined, CalendarOutlined,
  DashboardOutlined, HeartOutlined, HomeOutlined,
  IdcardOutlined,
  LoginOutlined, LogoutOutlined, MenuOutlined,
  SecurityScanOutlined,
  SnippetsOutlined, TeamOutlined, ToolOutlined,
  UserAddOutlined, UserOutlined, ReconciliationOutlined,
  PicLeftOutlined,
  DropboxSquareFilled
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Image, Layout, Menu, Modal, Typography, Row } from 'antd';
import React from 'react';
import MediaQuery from 'react-responsive';
import { Link, withRouter } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { logout } from 'services/authService';
import styled from 'styled-components';
import { GlobalContext } from '../contexts/GlobalContext';

const { Header } = Layout;
const { Text, Link: TextLink } = Typography;
const DROPBOX_LINK_URL = 'https://www.dropbox.com/sh/7mpky801qf8f46c/AABdTXTaO6vp6aSd9XOVdUQea?dl=0';
const HeaderStyled = styled(Header)`
z-index: 100 !important;
position: fixed;
z-index: 1;
width: 100%;
// background-color: rgba(255,255,255,0.8);
background-color: rgba(255,255,255);
display: flex;
white-space: nowrap;
border: 0;
justify-content: space-between;
border-bottom: 1px solid #f0f0f0;
align-items: center;
box-shadow: 0px 2px 8px #888888;
padding-left: 20px;
padding-right: 20px;

`;

const MenuContianer = styled.div`
float: right;
// border: 0;
margin-bottom: 2px;
min-width: 580px;
`;


const headerHeight = 64;

const HeaderLogo = styled.div`
display: flex;
height: ${headerHeight}px;
`

const HomeHeaderRaw = props => {
  const [visible, setVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [current, setCurrent] = React.useState();

  const { user, role, setUser, notifyCount } = context;
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const isAgent = role === 'agent';
  const isGuest = role === 'guest';
  const canChangePassword = !isGuest && user?.loginType === 'local';

  const handleLogout = () => {
    Modal.confirm({
      title: "Logout",
      content: <>Do you want to log out <Text code>{user.email}</Text></>,
      async onOk() {
        await logout();
        setVisible(false);
        setUser(null);
        history.push('/');
      },
      maskClosable: true,
      okButtonProps: {
        danger: true,
        ghost: true,
      },
      okText: 'Yes, log me out!',
      onCancel() {
      },
    });
  }

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const history = props.history;

  const handleClick = (e) => {
    setCurrent(e.key);
  }

  return (
    <HeaderStyled>
      <HeaderLogo>
        <HashLink to="/">
          <img alt="AUAO logo" src="/images/header-logo.png" width="auto" height="60" style={{ padding: '2px 0 2px 0' }}></img>
        </HashLink>
        {/* {isAdmin && <Text>Admin</Text>} */}
        <MediaQuery minDeviceWidth={760}>
          <div style={{ display: 'flex', alignItems: 'baseline', flexDirection: 'column', marginTop: -10, marginLeft: 32, position: 'relative' }}>
            <Text style={{ position: 'absolute', top: 28, left: -6 }} type="secondary"><i>Affordable & Customisable Business Resource Planning System for SMB</i></Text>
            <Row gutter={12}>
              <Text type="secondary"><i>Partner with</i></Text>
              <TextLink href="https://login.xero.com/identity/user/login" target="_blank" style={{ marginLeft: 8 }}>
                <Image preview={false} src="/images/xero.png" width={60} />
              </TextLink>
              <TextLink href="https://www.myob.com/au" target="_blank" style={{ marginLeft: 8 }}>
                <Image preview={false} src="/images/mjob.png" width={70} />
              </TextLink>
            </Row>
          </div>
        </MediaQuery>
      </HeaderLogo>
      <MediaQuery minDeviceWidth={1101}>
        <MenuContianer>
          <Menu
            onClick={handleClick}
            selectedKeys={[current]}
            mode="horizontal" style={{ border: 0 }}>
            {isGuest && <Menu.Item key="home"><HashLink to="/#home">Home</HashLink></Menu.Item>}
            {isGuest && <Menu.Item key="services"><HashLink to="/#services">Services</HashLink></Menu.Item>}
            {isGuest && <Menu.Item key="resources"><TextLink href={DROPBOX_LINK_URL} target='_blank'>Dropbox Resources</TextLink></Menu.Item>}
            {/* {isGuest && <Menu.Item key="team"><HashLink to="/#team">Team</HashLink></Menu.Item>} */}
            {isGuest && <Menu.Item key="blog"><HashLink to="/blogs">Blog</HashLink></Menu.Item>}
            {isGuest && <Menu.Item key="signin"><Link to="/signon">Sign On</Link></Menu.Item>}
            {isGuest && <Menu.Item key="login"><Link to="/login">Log In</Link></Menu.Item>}
            {/* {(isAdmin || isAgent) && <Menu.Item key="board"><Link to="/board">Board</Link></Menu.Item>} */}
            {isClient && <Menu.Item key="landing"><Link to="/landing">Dashboard</Link></Menu.Item>}
            {!isGuest && <Menu.Item key="task"><Link to="/tasks">Tasks</Link></Menu.Item>}
            {isClient && <Menu.Item key="portfolio"><Link to="/portfolios">Portfolios</Link></Menu.Item>}
            {/* {isAdmin && <Menu.Item key="clients"><Link to="/clients">Users</Link></Menu.Item>} */}
            {/* {isAdmin && <Menu.Item key="admin"><Link to="/admin">Admin</Link></Menu.Item>} */}
            {!isGuest && <Menu.Item key="message"><Link to="/message"><Badge count={notifyCount} showZero={false} offset={[10, 0]}>Messages</Badge></Link></Menu.Item>}
            {isAdmin && <Menu.SubMenu key="settings" title="Settings">
              <Menu.Item key="task_template"><Link to="/task_template">Task Templates</Link></Menu.Item>
              <Menu.Item key="doc_template"><Link to="/doc_template">Doc Templates</Link></Menu.Item>
              <Menu.Item key="recurring"><Link to="/recurring">Recurring</Link></Menu.Item>
              <Menu.Item key="user"><Link to="/user">Users</Link></Menu.Item>
              <Menu.Item key="blog_admin"><HashLink to="/blogs/admin">Blog</HashLink></Menu.Item>
              <Menu.Item key="stats"><Link to="/stats">Statistics</Link></Menu.Item>
            </Menu.SubMenu>}
            {!isGuest && <Menu.SubMenu key="me" title={<Avatar size={40} icon={<UserOutlined style={{ fontSize: 20 }} />} style={{ backgroundColor: isAdmin ? '#FF4D4F' : isAgent ? '#000000' : '#183e91' }} />}>
              {/* {isAdmin && <Menu.Item key="impersonate"><Link to="/impersonate">Impersonate</Link></Menu.Item>} */}
              <Menu.Item key="profile"><Link to="/profile">Profile</Link></Menu.Item>
              {canChangePassword && <Menu.Item key="changePassword"><Link to="/change_password">Change Password</Link></Menu.Item>}
              <Menu.Item key="logout" onClick={handleLogout}>Log Out</Menu.Item>
            </Menu.SubMenu>}
          </Menu>

        </MenuContianer>
        {/* <Tag>{user?.memberId}</Tag> */}
      </MediaQuery>
      <MediaQuery maxDeviceWidth={1100}>
        <Badge count={notifyCount} showZero={false} ><Button type="default" onClick={showDrawer}>
          <MenuOutlined />
        </Button></Badge>
        <Drawer
          placement="right"
          closable={true}
          onClose={onClose}
          visible={visible}
          width={290}
          bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <Menu
            onClick={handleClick}
            selectedKeys={[current]}
            mode="inline"
            style={{ border: 0 }}
          >
            {isGuest && <Menu.Item key="login"><LoginOutlined /> <Link to="/login">Log In</Link></Menu.Item>}
            {isGuest && <Menu.Item key="signin"><UserAddOutlined /> <Link to="/signon">Sign On</Link></Menu.Item>}
            {/* {isAdmin && <Menu.Item key="admin"><SettingOutlined /> <Link to="/admin">Admin</Link></Menu.Item>} */}
            {/* {(isAdmin || isAgent) && <Menu.Item key="board"><DashboardOutlined /> <Link to="/board">Board</Link></Menu.Item>} */}
            {isClient && <Menu.Item key="landing"><DashboardOutlined /> <Link to="/landing">Dashboard</Link></Menu.Item>}
            {!isGuest && <Menu.Item key="task"><SnippetsOutlined /> <Link to="/tasks">Task</Link></Menu.Item>}
            {isClient && <Menu.Item key="portfolio"><IdcardOutlined /> <Link to="/portfolios">Portfolios</Link></Menu.Item>}
            {isAdmin && <Menu.Item key="task_template"><ToolOutlined /> <Link to="/task_template">Task Template</Link></Menu.Item>}
            {isAdmin && <Menu.Item key="doc_template"><ReconciliationOutlined /> <Link to="/doc_template">Doc Template</Link></Menu.Item>}
            {isAdmin && <Menu.Item key="recurring"><CalendarOutlined /> <Link to="/recurring">Recurring</Link></Menu.Item>}
            {/* {isAdmin && <Menu.Item key="clients"><SettingOutlined /> <Link to="/clients">Users</Link></Menu.Item>} */}
            {isAdmin && <Menu.Item key="user"><TeamOutlined /> <Link to="/user">User</Link></Menu.Item>}
            {!isGuest && <Menu.Item key="message"><BellOutlined /> <Link to="/message">Messages <Badge count={notifyCount} showZero={false} /></Link></Menu.Item>}
            {(isAdmin || isAgent) && <Menu.Item key="stats"><DashboardOutlined /> <Link to="/stats">Statistics</Link></Menu.Item>}
            {/* {isAdmin && <Menu.Item key="impersonate"><SkinOutlined /> <Link to="/impersonate">Impersonate</Link></Menu.Item>} */}
            {!isGuest && <Menu.Item key="profile"><UserOutlined /> <Link to="/profile">Profile</Link></Menu.Item>}
            {canChangePassword && <Menu.Item key="changePassword"><SecurityScanOutlined /> <Link to="/change_password">Change Password</Link></Menu.Item>}
            {isGuest && <Menu.Item key="home"><HomeOutlined /> <HashLink to="/#home" onClick={onClose}>Home</HashLink></Menu.Item>}
            {isGuest && <Menu.Item key="services"><HeartOutlined /> <HashLink to="/#services" onClick={onClose}>Services</HashLink></Menu.Item>}
            {isGuest && <Menu.Item key="resources"><DropboxSquareFilled/> <TextLink href={DROPBOX_LINK_URL} target='_blank' onClick={onClose}>Dropbox Resources</TextLink></Menu.Item>}
            {/* {isGuest && <Menu.Item key="team"><TeamOutlined /> <HashLink to="/#team" onClick={onClose}>Team</HashLink></Menu.Item>} */}
            {isGuest && <Menu.Item key="blog"><PicLeftOutlined /> <Link to="/blogs">Blog</Link></Menu.Item>}
            {!isGuest && <Menu.Item key="logout" onClick={handleLogout}><LogoutOutlined />{isAdmin ? ' Admin' : isAgent ? ' Agent' : null} Log Out</Menu.Item>}
          </Menu>
        </Drawer>
      </MediaQuery>

    </HeaderStyled>
  );
}

HomeHeaderRaw.propTypes = {};

HomeHeaderRaw.defaultProps = {};

export const HomeHeader = withRouter(HomeHeaderRaw);

export default HomeHeader;
