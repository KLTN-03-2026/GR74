import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { createPost, updatePost } from '../redux/actions/postAction'
import Icons from './Icons'
import { imageShow, videoShow } from '../utils/mediaShow'
import { getErrorMessage } from '../utils/errorMessage'
import { fileUpload, FILE_ICONS, formatFileSize, getFileType } from '../utils/fileUpload'

const ACCEPTED_IMAGE_VIDEO = "image/*,video/*"
const ACCEPTED_DOCS = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
const MAX_MEDIA_SIZE = 1024 * 1024 * 10  // 10MB
const MAX_FILE_SIZE  = 1024 * 1024 * 25  // 25MB

const StatusModal = () => {
    const { auth, theme, status, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    const [content, setContent]   = useState('')
    const [images, setImages]      = useState([])   // ảnh/video
    const [attachments, setAttachments] = useState([]) // file đính kèm (PDF, Word…)
    const [category, setCategory] = useState('Thảo luận')

    const [stream, setStream] = useState(false)
    const videoRef  = useRef()
    const refCanvas = useRef()
    const [tracks, setTracks] = useState('')

    // --- handlers: media (ảnh/video) ---
    const handleChangeImages = e => {
        const files = [...e.target.files]
        let err = ""
        let newImages = []

        files.forEach(file => {
            if (!file) return (err = "File does not exist.")
            if (file.size > MAX_MEDIA_SIZE) return (err = "Ảnh/video tối đa 10MB mỗi file.")
            newImages.push(file)
        })

        if (err) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } })
        setImages(prev => [...prev, ...newImages])
    }

    const deleteImage = (index) => {
        setImages(prev => { const a = [...prev]; a.splice(index, 1); return a })
    }

    // --- handlers: file đính kèm ---
    const handleChangeFiles = e => {
        const files = [...e.target.files]
        let err = ""
        let newFiles = []

        files.forEach(file => {
            if (!file) return (err = "File không tồn tại.")
            if (file.size > MAX_FILE_SIZE) return (err = `${file.name} vượt quá 25MB.`)
            newFiles.push(file)
        })

        if (err) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } })
        setAttachments(prev => [...prev, ...newFiles])
    }

    const deleteAttachment = (index) => {
        setAttachments(prev => { const a = [...prev]; a.splice(index, 1); return a })
    }

    // --- camera ---
    const handleStream = () => {
        setStream(true)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(mediaStream => {
                    videoRef.current.srcObject = mediaStream
                    videoRef.current.play()
                    setTracks(mediaStream.getTracks()[0])
                }).catch(err => console.log(err))
        }
    }

    const handleCapture = () => {
        const w = videoRef.current.clientWidth
        const h = videoRef.current.clientHeight
        refCanvas.current.setAttribute("width", w)
        refCanvas.current.setAttribute("height", h)
        const ctx = refCanvas.current.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, w, h)
        setImages(prev => [...prev, { camera: refCanvas.current.toDataURL() }])
    }

    const handleStopStream = () => {
        tracks.stop()
        setStream(false)
    }

    // --- submit ---
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Cho phép đăng bài text-only (không cần ảnh hay file)
        if (!content.trim() && images.length === 0 && attachments.length === 0) {
            return dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: "Hãy viết nội dung hoặc đính kèm file trước khi đăng." }
            })
        }

        if (status.onEdit) {
            dispatch(updatePost({ content, images, auth, status }))
        } else {
            dispatch(createPost({ content, images, attachments, category, auth, socket }))
        }

        setContent('')
        setImages([])
        setAttachments([])
        if (tracks) tracks.stop()
        dispatch({ type: GLOBALTYPES.STATUS, payload: false })
    }

    useEffect(() => {
        if (status.onEdit) {
            setContent(status.content)
            setImages(status.images)
        }
    }, [status])

    return (
        <div className="status_modal">
            <form onSubmit={handleSubmit}>
                <div className="status_header">
                    <h5 className="m-0">Tạo bài đăng</h5>
                    <span onClick={() => dispatch({ type: GLOBALTYPES.STATUS, payload: false })}>
                        &times;
                    </span>
                </div>

                <div className="status_body">
                    <textarea
                        name="content"
                        value={content}
                        placeholder={`${auth.user.username}, bạn đang nghĩ gì?`}
                        onChange={e => setContent(e.target.value)}
                        style={{
                            filter: theme ? 'invert(1)' : 'invert(0)',
                            color: theme ? 'white' : '#111',
                            background: theme ? 'rgba(0,0,0,.03)' : '',
                        }}
                    />

                    <div className="d-flex">
                        <div className="flex-fill"></div>
                        <Icons setContent={setContent} content={content} theme={theme} />
                    </div>

                    {/* Preview: ảnh/video */}
                    <div className="show_images">
                        {images.map((img, index) => (
                            <div key={index} id="file_img">
                                {img.camera
                                    ? imageShow(img.camera, theme)
                                    : img.url
                                        ? img.url.match(/video/i)
                                            ? videoShow(img.url, theme)
                                            : imageShow(img.url, theme)
                                        : img.type?.match(/video/i)
                                            ? videoShow(URL.createObjectURL(img), theme)
                                            : imageShow(URL.createObjectURL(img), theme)
                                }
                                <span onClick={() => deleteImage(index)}>&times;</span>
                            </div>
                        ))}
                    </div>

                    {/* Preview: file đính kèm */}
                    {attachments.length > 0 && (
                        <div className="show_media" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                            {attachments.map((file, index) => (
                                <div key={index} id="file_media" style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: '#f0f4ff', borderRadius: '10px',
                                    padding: '8px 12px', position: 'relative',
                                    border: '1px solid #c3c6d7',
                                }}>
                                    <span style={{ fontSize: '1.4rem' }}>
                                        {FILE_ICONS[getFileType(file.type)] || '📎'}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <span
                                        onClick={() => deleteAttachment(index)}
                                        style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}
                                    >
                                        &times;
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Camera stream */}
                    {stream && (
                        <div className="stream position-relative">
                            <video autoPlay muted ref={videoRef} width="100%" height="100%"
                                style={{ filter: theme ? 'invert(1)' : 'invert(0)' }} />
                            <span onClick={handleStopStream}>&times;</span>
                            <canvas ref={refCanvas} style={{ display: 'none' }} />
                        </div>
                    )}

                    {/* Upload buttons & Category select */}
                    <div className="input_images" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {stream ? (
                                <i className="fas fa-camera" onClick={handleCapture} />
                            ) : (
                                <>
                                    <i className="fas fa-camera" onClick={handleStream} />

                                    {/* Upload ảnh/video */}
                                    <div className="file_upload" title="Thêm ảnh/video">
                                        <i className="fas fa-image" />
                                        <input
                                            type="file" name="file" id="file"
                                            multiple accept={ACCEPTED_IMAGE_VIDEO}
                                            onChange={handleChangeImages}
                                        />
                                    </div>

                                    {/* Upload file đính kèm */}
                                    <div className="file_upload" title="Đính kèm PDF, Word, Excel..." style={{ position: 'relative' }}>
                                        <i className="fas fa-paperclip" />
                                        <input
                                            type="file" name="attachment" id="attachment"
                                            multiple accept={ACCEPTED_DOCS}
                                            onChange={handleChangeFiles}
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {!status.onEdit && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Phân loại:</span>
                                <select 
                                    value={category} 
                                    onChange={e => setCategory(e.target.value)}
                                    style={{
                                        border: '1px solid #c3c6d7',
                                        borderRadius: '8px',
                                        padding: '4px 8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        color: '#0b1c30',
                                        outline: 'none',
                                        background: '#f8f9ff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Thảo luận">Thảo luận</option>
                                    <option value="Hỏi đáp">Hỏi đáp</option>
                                    <option value="Tài liệu">Tài liệu</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="status_footer">
                    <button className="btn btn-secondary w-100" type="submit">
                        Đăng bài
                    </button>
                </div>
            </form>
        </div>
    )
}

export default StatusModal
