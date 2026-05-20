import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { GraduationCap, HelpCircle, LayoutDashboard, PenLine, Settings, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import Avatar from '../Avatar'

const UserShell = () => {
  const { auth } = useSelector(state => state)
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  if (!auth.token || auth.user?.role === 'admin') return <Outlet />

  const navLinks = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: `/profile/${auth.user?._id}`, icon: <UserRound size={20} />, label: 'My Profile' },
    { to: '/discover', icon: <GraduationCap size={20} />, label: 'Learning Discover' },
    { to: '/message', icon: <UsersRound size={20} />, label: 'Groups & Chat' },
    { to: '/change_password', icon: <Settings size={20} />, label: 'Settings' },
  ]

  const isActive = (to) => {
    if (to === '/') return pathname === '/' || pathname === '/feed'
    if (to.includes('/profile/')) return pathname.startsWith('/profile')
    if (to === '/message') return pathname === '/message' || pathname.startsWith('/message/')
    return pathname === to
  }

  return (
    <div className="user_shell_wrap">
      <aside className="user_shell_left">
        <div className="left-profile">
          <Avatar src={auth.user?.avatar} size="big-avatar" />
          <div>
            <h2>{auth.user?.username}</h2>
            <p>{auth.user?.fullname || 'Edu Social learner'}</p>
          </div>
        </div>

        <nav className="left-nav-links">
          {navLinks.map(({ to, icon, label }) => (
            <Link key={label} className={isActive(to) ? 'active' : ''} to={to}>
              {icon} {label}
            </Link>
          ))}
        </nav>

        <button
          className="left-post-btn"
          type="button"
          onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: true })}
        >
          <PenLine size={18} />
          Start New Post
        </button>

        <div className="left-nav-footer">
          <Link to="/landing"><HelpCircle size={18} /> Help Center</Link>
          <Link to="/landing"><ShieldCheck size={18} /> Privacy</Link>
        </div>
      </aside>

      <div className="user_shell_main">
        <Outlet />
      </div>
    </div>
  )
}

export default UserShell
