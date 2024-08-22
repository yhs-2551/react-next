import dynamic from "next/dynamic";
import React from "react";

import "react-quill/dist/quill.snow.css"; // 스타일 포함

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}


const stripHTML = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};


export default function QuillEditor({ value, onChange }: QuillEditorProps) {

    const handleChange = (html: string) => {
        const textOnly = stripHTML(html);
        onChange(textOnly);
    };

    return (
        <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <ReactQuill
                style={{ flex: 1, minHeight: "400px" }}
                value={value}
                onChange={handleChange}
                theme='snow'
            />
        </div>
    );
}

