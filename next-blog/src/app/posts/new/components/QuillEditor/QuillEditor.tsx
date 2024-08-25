import dynamic from "next/dynamic";
import React, { useRef } from "react";
import DOMPurify from "dompurify";

import "react-quill/dist/quill.bubble.css"; // Bubble 테마의 CSS 파일 

// import "react-quill/dist/quill.snow.css";  Snow 테마 CSS 파일

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
    
    const handleChange = (html: string) => {
        const sanitizedHtml = DOMPurify.sanitize(html); // HTML을 안전하게 정리
        // const parser = new DOMParser();
        // const doc = parser.parseFromString(sanitizedHtml, "text/html");
        // const textContent = doc.body.textContent || ""; // 텍스트만 추출
        // onChange(textContent);
        onChange(sanitizedHtml)
    };

    return (
        <>
            <ReactQuill value={value} onChange={handleChange} theme='bubble' />
            {/* <ReactQuill value={value} onChange={handleChange} theme='snow' /> */}
        </>
    );
}
