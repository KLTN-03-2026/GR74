import React, { useState } from 'react'
import Carousel from '../../Carousel'
import { FILE_ICONS, formatFileSize } from '../../../utils/fileUpload'

// Phân loại: ảnh/video vs file đính kèm
const isMediaFile = (img) => {
    if (!img) return false
    const url = img.url || ''
    const ft  = img.fileType || ''
    if (ft === 'pdf' || ft === 'docx' || ft === 'xlsx' || ft === 'pptx' || ft === 'raw') return false
    if (url.match(/\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i)) return false
    return true
}

const FileAttachment = ({ file }) => {
    const icon = FILE_ICONS[file.fileType] || '📎'
    const name = file.name || (file.url ? file.url.split('/').pop().split('?')[0] : 'Tệp đính kèm')
    const label = file.fileType?.toUpperCase() || 'FILE'

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#f0f4ff', borderRadius: '12px',
                padding: '10px 14px', margin: '4px 0',
                border: '1px solid #c3c6d7', textDecoration: 'none',
                transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dce9ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#f0f4ff'}
        >
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: 0, fontSize: '0.82rem', fontWeight: 700,
                    color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                    {name}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                    {label}
                    {file.size ? ` · ${formatFileSize(file.size)}` : ''}
                </p>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Tải xuống ↓
            </span>
        </a>
    )
}

const CardBody = ({post, theme}) => {
    const [readMore, setReadMore] = useState(false)

    const mediaFiles = (post.images || []).filter(isMediaFile)
    const fileAttachments = (post.images || []).filter(img => !isMediaFile(img))

    return (
        <div className="card_body">
            <div className="card_body-content"
                style={{
                    filter: theme ? 'invert(1)' : 'invert(0)',
                    color: theme ? 'white' : '#111',
                }}>
                <span>
                    {post.content.length < 60
                        ? post.content
                        : readMore ? post.content + ' ' : post.content.slice(0, 60) + '.....'}
                </span>
                {post.content.length > 60 &&
                    <span className="readMore" onClick={() => setReadMore(!readMore)}>
                        {readMore ? 'Thu gọn' : 'Xem thêm'}
                    </span>
                }
            </div>

            {/* Carousel ảnh/video */}
            {mediaFiles.length > 0 && <Carousel images={mediaFiles} id={post._id} />}

            {/* File đính kèm */}
            {fileAttachments.length > 0 && (
                <div style={{ padding: '4px 0' }}>
                    {fileAttachments.map((file, i) => (
                        <FileAttachment key={i} file={file} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CardBody
