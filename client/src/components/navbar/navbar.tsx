import Profile from '../profile/profile';
import './navbar.scss'
import { Container } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useAuthStatus } from '../../utils/authStatus';

function SocculiNavbar() {
  
  const { isLoggedIn } = useAuthStatus();
  const navItems = [
    { path: '/', label: 'Home' },
    ...(isLoggedIn ? [{ path: '/archived', label: 'Archived Weeks' }] : []),
    { path: '/about', label: 'About' },
    { path: 'https://github.com/shazish/socculi-vite-mern', label: 'Github' },
  ];

  return (

    <Navbar expand="lg" bg="dark" variant="dark" className="socculi-navbar">
      <Container>
        <Navbar.Brand href="#home">Socculi</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto flex align-items-center w-100">
            {navItems.map((item) => (
              <Nav.Link href={item.path}>{item.label}</Nav.Link>
            ))}
            <Nav.Link className='flex-1'><Profile/></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SocculiNavbar;