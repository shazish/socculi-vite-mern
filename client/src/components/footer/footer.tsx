import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function SocculiFooter() {


  return (

    <Navbar expand="lg" bg="dark" variant="dark" className="socculi-navbar">
      <Container>
        <Navbar.Brand href="#home">Socculi</Navbar.Brand>
        <p className='text-white text-sm'>Last updated: 3/17/25</p>
      </Container>
    </Navbar>
  );
}

export default SocculiFooter;