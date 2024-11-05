import { NavLink } from 'react-router-dom'
import './navbar.scss'

function Navbar() {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
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
    </div>
    )
  }
  
  export default Navbar