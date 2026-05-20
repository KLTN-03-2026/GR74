import React from 'react'
import { Link } from 'react-router-dom'
import Menu from './Menu'
import Search from './Search'

const Header = () => {

    return (
        <div className="header">
            <nav className="navbar navbar-expand-lg navbar-light 
            justify-content-between align-middle">

                <Link to="/" className="logo">
                    <h1 className="navbar-brand text-uppercase p-0 m-0 d-flex align-items-center"
                    onClick={() => window.scrollTo({top: 0})}>
                        <img src="/edu.png" alt="Edu Social Logo" style={{ width: '34px', height: '34px', borderRadius: '10px', marginRight: '10px', objectFit: 'cover', boxShadow: '0 10px 24px rgba(37, 99, 235, 0.28)' }} />
                        Edu Social
                    </h1>
                </Link>

                <Search />

                <Menu />
            </nav>
        </div>
    )
}

export default Header
