import { NavLink } from 'react-router-dom';
import LoginButton from '../login/login';
import LogoutButton from '../login/logout';
import Profile from '../profile/profile';
import './navbar.scss'

function Navbar() {
  const navItems = [
    { path: '/', label: 'This Week!' },
    { path: '/about', label: 'About' },
    { path: '/thisweek', label: 'Archived Weeks'}
  ]

    return (
      <div className="main-navbar flex gap-6">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `navbar-item text-sm font-medium transition-colors duration-150 ${
              isActive 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-300 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}

      <Profile></Profile> 
    </div>
    )
  }
  
  export default Navbar