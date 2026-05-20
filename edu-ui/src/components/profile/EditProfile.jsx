import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from 'react-redux'
import { checkImage } from '../../utils/imageUpload'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { getErrorMessage } from '../../utils/errorMessage'
import { updateProfileUser } from '../../redux/actions/profileAction'

const EditProfile = ({setOnEdit}) => {
    const initState = {
        fullname: '', mobile: '', address: '', website: '', story: '', gender: ''
    }
    const [userData, setUserData] = useState(initState)
    const { fullname, mobile, address, website, story, gender } = userData

    const [avatar, setAvatar] = useState('')

    const { auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    useEffect(() => {
        setUserData(auth.user)
    }, [auth.user])


    const changeAvatar = (e) => {
        const file = e.target.files[0]

        const err = checkImage(file)
        if(err) return dispatch({
            type: GLOBALTYPES.ALERT, payload: {error: getErrorMessage(err)}
        })

        setAvatar(file)
    }

    const handleInput = e => {
        const { name, value } = e.target
        setUserData({ ...userData, [name]:value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        await dispatch(updateProfileUser({userData, avatar, auth}))
        setOnEdit(false)
    }

    return createPortal(
        <div className="edit_profile">
            <form onSubmit={handleSubmit}>
                <div className="edit_profile_head">
                    <div>
                        <h2>Edit profile</h2>
                        <p>Keep your public profile clear and up to date.</p>
                    </div>
                    <button type="button" className="btn_close" onClick={() => setOnEdit(false)}>
                        &times;
                    </button>
                </div>

                <div className="info_avatar">
                    <img src={avatar ? URL.createObjectURL(avatar) : auth.user.avatar} 
                    alt="avatar" style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                    <span>
                        <i className="fas fa-camera" />
                        <p>Change</p>
                        <input type="file" name="file" id="file_up"
                        accept="image/*" onChange={changeAvatar} />
                    </span>
                </div>

                <div className="edit_profile_grid">
                    <div className="form-group">
                        <label htmlFor="fullname">Full Name</label>
                        <div className="position-relative">
                            <input type="text" className="form-control" id="fullname"
                            name="fullname" value={fullname} onChange={handleInput} />
                            <small className="text-danger position-absolute"
                            style={{top: '50%', right: '10px', transform: 'translateY(-50%)'}}>
                                {fullname.length}/25
                            </small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobile">Mobile</label>
                        <input type="text" name="mobile" value={mobile}
                        className="form-control" onChange={handleInput} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input type="text" name="address" value={address}
                        className="form-control" onChange={handleInput} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="website">Website</label>
                        <input type="text" name="website" value={website}
                        className="form-control" onChange={handleInput} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select name="gender" id="gender" value={gender}
                        className="custom-select text-capitalize"
                        onChange={handleInput}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="form-group edit_profile_story">
                    <label htmlFor="story">Story</label>
                    <textarea name="story" value={story} cols="30" rows="4"
                    className="form-control" onChange={handleInput} />

                    <small className="text-danger d-block text-right">
                        {story.length}/200
                    </small>
                </div>

                <div className="edit_profile_actions">
                    <button type="button" onClick={() => setOnEdit(false)}>Cancel</button>
                    <button type="submit">Save changes</button>
                </div>
            </form>
        </div>,
        document.body
    )
}

export default EditProfile
