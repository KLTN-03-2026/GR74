import React from 'react'
import { useSelector } from 'react-redux'

const Carousel = ({images, id}) => {
    const isActive = index => {
        if(index === 0) return "active";
    }

    const getMediaUrl = (img) => {
        if(!img) return ''
        return typeof img === 'string' ? img : img.url || ''
    }

    const { theme } = useSelector(state => state)

    return (
        <div id={`image${id}`} className="carousel slide" data-ride="carousel">
            <ol className="carousel-indicators" style={{zIndex: 1}}>
                {
                    images.map((img, index) => (
                        <li key={index} data-target={`#image${id}`} 
                        data-slide-to={index} className={isActive(index)} />
                    ))
                }
                
            </ol>

            <div className="carousel-inner">
                {
                    images.map((img, index) => {
                        const mediaUrl = getMediaUrl(img)
                        return (
                            <div key={index} className={`carousel-item ${isActive(index)}`}>
                                {
                                    mediaUrl.match(/video/i)
                                    ? <video
                                        controls
                                        src={mediaUrl}
                                        className="d-block w-100"
                                        style={{
                                            filter: theme ? 'invert(1)' : 'invert(0)',
                                            maxHeight: '520px',
                                            objectFit: 'contain',
                                            background: '#000',
                                        }}
                                      />
                                    : <img
                                        src={mediaUrl}
                                        className="d-block w-100"
                                        alt="post media"
                                        style={{
                                            filter: theme ? 'invert(1)' : 'invert(0)',
                                            maxHeight: '520px',
                                            objectFit: 'cover',
                                            width: '100%',
                                        }}
                                      />
                                }
                            </div>
                        )
                    })
                }
                
            </div>
            
            {
                images.length > 1 &&
                <>
                    <a className="carousel-control-prev" href={`#image${id}`} role="button" data-slide="prev"
                    style={{width: '5%'}}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="sr-only">Previous</span>
                    </a>

                    <a className="carousel-control-next" href={`#image${id}`} role="button" data-slide="next"
                    style={{width: '5%'}}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="sr-only">Next</span>
                    </a>
                </>
            }
            
        </div>
    )
}

export default Carousel
