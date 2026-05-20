import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addFriend, cancelFriendRequest, acceptFriend, rejectFriend, unfriend } from '../redux/actions/profileAction'

/**
 * Trạng thái quan hệ (Friend System):
 *  - 'none'             : chưa kết bạn
 *  - 'request_sent'     : mình đã gửi lời mời (chờ họ chấp nhận)
 *  - 'request_received' : họ đã gửi lời mời (mình cần chấp nhận)
 *  - 'friend'           : đã là bạn bè
 */
const FriendBtn = ({ user }) => {
  const { auth, socket } = useSelector(state => state)
  const dispatch = useDispatch()
  const [load, setLoad] = useState(false)

  // Tính trạng thái quan hệ dựa vào mảng mới
  const userId = user && (user._id || user)
  const isFriend = !!(userId && auth.user.friends?.find(u => {
    const uId = u && (u._id || u)
    return uId && uId === userId
  }))
  const isRequestSent = !!(userId && auth.user.sentRequests?.find(u => {
    const uId = u && (u._id || u)
    return uId && uId === userId
  }))
  const isRequestReceived = !!(userId && auth.user.friendRequests?.find(u => {
    const uId = u && (u._id || u)
    return uId && uId === userId
  }))

  let relation = 'none'
  if (isFriend) relation = 'friend'
  else if (isRequestSent) relation = 'request_sent'
  else if (isRequestReceived) relation = 'request_received'

  const handleAction = async (actionFunc) => {
    if (load) return
    setLoad(true)
    await dispatch(actionFunc({ user, auth, socket }))
    setLoad(false)
  }

  // Styles chung
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    minHeight: '36px', padding: '0 16px', borderRadius: '999px',
    fontSize: '0.84rem', fontWeight: 700, cursor: load ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', border: '1.5px solid',
  }

  if (relation === 'friend') return (
    <button
      onClick={() => handleAction(unfriend)}
      disabled={load}
      style={{
        ...base,
        background: '#eff6ff',
        borderColor: '#93c5fd',
        color: '#1d4ed8',
      }}
      title="Hủy kết bạn"
    >
      <svg style={{ width: 15, height: 15 }} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
      {load ? '...' : 'Bạn bè ✓'}
    </button>
  )

  if (relation === 'request_sent') return (
    <button
      onClick={() => handleAction(cancelFriendRequest)}
      disabled={load}
      style={{
        ...base,
        background: '#f1f5f9',
        borderColor: '#cbd5e1',
        color: '#475569',
      }}
      title="Hủy lời mời kết bạn"
    >
      {load ? '...' : 'Đã gửi lời mời'}
    </button>
  )

  if (relation === 'request_received') return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => handleAction(acceptFriend)}
        disabled={load}
        style={{
          ...base,
          background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
          borderColor: '#1d4ed8',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          padding: '0 12px'
        }}
      >
        Chấp nhận
      </button>
      <button
        onClick={() => handleAction(rejectFriend)}
        disabled={load}
        style={{
          ...base,
          background: '#f1f5f9',
          borderColor: '#cbd5e1',
          color: '#475569',
          padding: '0 12px'
        }}
      >
        Hủy
      </button>
    </div>
  )

  // relation === 'none'
  return (
    <button
      onClick={() => handleAction(addFriend)}
      disabled={load}
      style={{
        ...base,
        background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
        borderColor: '#1d4ed8',
        color: '#fff',
        boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
      }}
    >
      <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      {load ? '...' : 'Kết bạn'}
    </button>
  )
}

export default FriendBtn
