import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../redux/actions/authAction'
import { Eye, EyeOff, GraduationCap, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'

const Register = () => {
    const { auth, alert } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const initialState = { 
        fullname: '', username: '', email: '', password: '', cf_password: '', gender: 'male'
    }
    const [userData, setUserData] = useState(initialState)
    const { fullname, username, email, password, cf_password } = userData

    const [typePass, setTypePass] = useState(false)
    const [typeCfPass, setTypeCfPass] = useState(false)

    useEffect(() => {
        if(auth.token) navigate("/")
    }, [auth.token, navigate])

    
    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({...userData, [name]:value})
    }

    const handleSubmit = e => {
        e.preventDefault()
        dispatch(register(userData))
    }

    return (
        <div className="auth_page register_page">
            <div className="auth_bg_pattern" aria-hidden="true" />
            <div className="register_shell">
                <aside className="register_brand">
                    <div className="register_brand_overlay" />
                    <div className="register_brand_content">
                        <div className="register_logo">
                            <img src="/edu.png" alt="Edu Social Logo" style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover' }} />
                            <span>Edu Social</span>
                        </div>
                        <div>
                            <h1>Bắt đầu hành trình học thuật của bạn.</h1>
                            <p>Kết nối với cố vấn, khám phá cộng đồng học tập và dùng AI để học hiệu quả hơn mỗi ngày.</p>
                        </div>
                    </div>
                    <div className="register_quote">
                        <p>"Một nền tảng giúp sinh viên học cùng nhau, hỏi nhanh hơn và duy trì động lực học tập."</p>
                        <div>
                            <span><UsersRound size={16} /></span>
                            <strong>Cộng đồng Edu Social</strong>
                        </div>
                    </div>
                </aside>

                <form className="register_form" onSubmit={handleSubmit}>
                    <div className="register_head">
                        <span><Sparkles size={16} /> Tạo tài khoản học tập</span>
                        <h2>Đăng ký Edu Social</h2>
                        <p>Tham gia mạng xã hội học tập tích hợp Premium AI chatbot.</p>
                    </div>

                    <section className="register_section">
                        <div className="register_grid">
                            <div className="register_field">
                                <label htmlFor="fullname">Họ và tên</label>
                                <input type="text" id="fullname" name="fullname"
                                placeholder="Nguyễn Văn A"
                                onChange={handleChangeInput} value={fullname}
                                className={alert.fullname ? 'is-invalid-mono' : ''} />
                                <small>{alert.fullname ? alert.fullname : ''}</small>
                            </div>

                            <div className="register_field">
                                <label htmlFor="username">Tên người dùng</label>
                                <input type="text" id="username" name="username"
                                placeholder="nguyenvana123"
                                onChange={handleChangeInput} value={username.toLowerCase().replace(/ /g, '')}
                                className={alert.username ? 'is-invalid-mono' : ''} />
                                <small>{alert.username ? alert.username : ''}</small>
                            </div>
                        </div>

                        <div className="register_field">
                            <label htmlFor="exampleInputEmail1">Email học thuật</label>
                            <input type="email" id="exampleInputEmail1" name="email"
                            placeholder="email@university.edu.vn"
                            onChange={handleChangeInput} value={email}
                            className={alert.email ? 'is-invalid-mono' : ''} />
                            <small>{alert.email ? alert.email : ''}</small>
                        </div>
                    </section>

                    <section className="register_section register_secure">
                        <div className="register_section_title">
                            <ShieldCheck size={16} />
                            <span>Bảo mật tài khoản</span>
                        </div>

                        <div className="register_field">
                            <label htmlFor="exampleInputPassword1">Mật khẩu</label>
                            <div className="register_pass">
                                <input type={ typePass ? "text" : "password" }
                                id="exampleInputPassword1"
                                placeholder="••••••••"
                                onChange={handleChangeInput} value={password} name="password"
                                className={alert.password ? 'is-invalid-mono' : ''} />
                                <button type="button" onClick={() => setTypePass(!typePass)} aria-label={typePass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                                    {typePass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <small>{alert.password ? alert.password : 'Ít nhất 6 ký tự, nên gồm chữ và số.'}</small>
                        </div>

                        <div className="register_field">
                            <label htmlFor="cf_password">Xác nhận mật khẩu</label>
                            <div className="register_pass">
                                <input type={ typeCfPass ? "text" : "password" }
                                id="cf_password"
                                placeholder="••••••••"
                                onChange={handleChangeInput} value={cf_password} name="cf_password"
                                className={alert.cf_password ? 'is-invalid-mono' : ''} />
                                <button type="button" onClick={() => setTypeCfPass(!typeCfPass)} aria-label={typeCfPass ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}>
                                    {typeCfPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <small>{alert.cf_password ? alert.cf_password : ''}</small>
                        </div>
                    </section>

                    <section className="register_section">
                        <label className="register_gender_label">Giới tính</label>
                        <div className="register_gender">
                            {[
                                ['male', 'Nam'],
                                ['female', 'Nữ'],
                                ['other', 'Khác']
                            ].map(([value, label]) => (
                                <label key={value} htmlFor={value} className={userData.gender === value ? 'active' : ''}>
                                    <input type="radio" id={value} name="gender"
                                    value={value} checked={userData.gender === value} onChange={handleChangeInput} />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <button type="submit" className="register_submit">
                        Đăng ký tài khoản
                    </button>

                    <p className="register_login_link">
                        Đã có tài khoản? <Link to="/">Đăng nhập</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register
