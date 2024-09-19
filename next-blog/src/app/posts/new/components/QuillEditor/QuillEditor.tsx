import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

// import "react-quill/dist/quill.bubble.css"; // Bubble 테마의 CSS 파일

import "react-quill/dist/quill.snow.css"; // Snow 테마 CSS 파일

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

//React.memo를 통해 props값이 변하지 않으면 QuillEditor의 재렌더링을 막는다. 따라서 BlogForm에서 제목의 내용을 변경해도 QuillEditor에는 제목 관련 Props가 없기 때문에 재렌더링 되지 않는다.
export default React.memo(function QuillEditor({
  value,
  onChange,
}: QuillEditorProps) {
  const quillRef = useRef<any>(null); // Quill 인스턴스를 참조하는 useRef

  console.log("실행행행해 외부앻ㅇ");
  // 여기서 함수 재생성을 막아야 올바르게 작동함. 
  const handleFileSelection = useCallback(() => {
    console.log("실행행행해앻ㅇ");

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "*/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result?.toString();
          const quill = quillRef.current?.getEditor(); // Quill 인스턴스 안전하게 참조
          if (quill && base64String) {
            const fileType = file.type.includes("image") ? "image" : "file";
            if (fileType === "image") {
              quill.insertEmbed(
                quill.getSelection()?.index || 0,
                "image",
                base64String
              );
            } else {
              quill.insertText(
                quill.getSelection()?.index || 0,
                `${file.name} 첨부됨`, // 문자열 리터럴로 수정
                "file",
                base64String
              );
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  // [{"header": [1, 2, 3, 4, 5, 6, false]}],
  // ["bold", "italic", "underline"],
  // [{ "list": "ordered" }, { "list": "bullet" }],
  // ["link", "image"],
  // [{ "align": [] }],
  // [{ 'color': [] }, { 'background': [] }],
  // ["clean"]
  // ],

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
      handlers: {
        image: handleFileSelection, // 이미지 핸들러 적용
      },
    },
  };

  const handleChange = (html: string) => {
    const sanitizedHtml = DOMPurify.sanitize(html); // HTML을 안전하게 정리
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(sanitizedHtml, "text/html");
    // const textContent = doc.body.textContent || ""; // 텍스트만 추출
    // onChange(textContent);
    onChange(sanitizedHtml);
  };

  useEffect(() => {
    if (quillRef.current) {
      console.log("ㅊ기화");
    }
  });

  return (
    <>
      <ReactQuill
        value={value}
        onChange={handleChange}
        theme="snow"
        modules={modules}
      />
      {/* <ReactQuill value={value} onChange={handleChange} theme='bubble' /> */}
    </>
  );
});
