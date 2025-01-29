import { NavLink } from 'react-router-dom';
import Profile from '../profile/profile';
import './navbar.scss'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function SocculiNavbar() {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    // { path: '/thisweek', label: 'Archived Weeks'}
  ]

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