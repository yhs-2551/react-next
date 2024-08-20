import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // 스타일 포함

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {

    return (
        <ReactQuill
            value={value}
            onChange={onChange}
            theme="snow"
            placeholder="글 내용을 입력하세요."
        />
    );
}