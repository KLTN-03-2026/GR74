import React from 'react'
import { useSelector } from 'react-redux'

const Avatar = ({src, size}) => {
    const { theme } = useSelector(state => state)

    const handleImageError = (e) => {
        e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Fy2CcEklNju2NfUSaKt7cRAwVJRhwZkS2w&s';
    }

    const defaultAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Fy2CcEklNju2NfUSaKt7cRAwVJRhwZkS2w&s';

    return (
        <img 
            src={src || defaultAvatar} 
            alt="avatar" 
            className={size}
            onError={handleImageError}
            style={{ filter: `${theme ? 'invert(1)' : 'invert(0)'}`, objectFit: 'cover' }} 
        />
    )
}

export default Avatar
