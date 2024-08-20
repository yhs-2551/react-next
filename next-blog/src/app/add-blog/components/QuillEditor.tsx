import dynamic from "next/dynamic";
import React from "react";

import "react-quill/dist/quill.snow.css"; // 스타일 포함

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <ReactQuill
                style={{ flex: 1, minHeight: "400px" }}
                value={value}
                onChange={onChange}
                theme="snow"
  
            />
        </div>
    );
}