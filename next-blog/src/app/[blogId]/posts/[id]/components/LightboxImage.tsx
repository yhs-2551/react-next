// 슬라이드 돌아가는 순서가 실제 브라우저 화면상이랑 안맞긴한데 일단 보류. LightBox기능만 사실상 있으면 되니까

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import NextImage from "next/image";

interface LightboxImageProps {
    unique: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    style?: React.CSSProperties;
    allImages: string[];
}

export const LightboxImage = ({ unique, src, alt, width, height, style, allImages }: LightboxImageProps) => {
    const [open, setOpen] = useState(false);
    const slides = allImages.map((src) => ({ src }));
    const currentIndex = slides.findIndex((slide) => slide.src === src);

    return (
        <>
            <NextImage
                key={unique}
                src={src}
                alt={alt}
                width={width}
                height={height}
                style={style}
                quality={100}
                sizes={`(max-width: 334px) 100vw, ${width}px`}
                loading='lazy'
                onClick={() => setOpen(true)}
            />
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                slides={slides}
                index={currentIndex}
                plugins={[Zoom]}
                zoom={{
                    maxZoomPixelRatio: 3,     // 최대 확대 비율 (3 = 원본 크기의 3배까지 확대 가능)
                    zoomInMultiplier: 2,  // 확대 시 곱해지는 배율 (2 = 클릭할 때마다 2배씩 확대)
                    doubleTapDelay: 300, // 더블탭은 터치스크린 디바이스용
                    doubleClickDelay: 300,
                    doubleClickMaxStops: 2, // 더븤클릭시 2단계씩 확대대
                }}
            />
        </>
    );
};
