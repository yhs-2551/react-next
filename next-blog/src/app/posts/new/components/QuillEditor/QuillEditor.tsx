import dynamic from "next/dynamic";
import React, {
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DOMPurify from "dompurify";

// import "react-quill/dist/quill.bubble.css"; // Bubble 테마의 CSS 파일

import "react-quill/dist/quill.snow.css"; // Snow 테마 CSS 파일

// Import the Quill editor dynamically and handle the ref forwarding explicitly
const ReactQuill: any = dynamic(() => import("react-quill"), {
  ssr: false,
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

//React.memo를 통해 props값이 변하지 않으면 QuillEditor의 재렌더링을 막는다. 따라서 BlogForm에서 제목의 내용을 변경해도 QuillEditor에는 제목 관련 Props가 없기 때문에 재렌더링 되지 않는다.
export default React.memo(
  forwardRef(function QuillEditor({ value, onChange }: QuillEditorProps, ref) {
    const quillRef: any = useRef(null);

 

    // 여기서 함수 재생성을 막아야 올바르게 작동함.
    const handleFileSelection = useCallback(() => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "*/*");

      console.log("input >>>", input);
      input.click();

      input.onchange = () => {
        const file = input.files ? input.files[0] : null;

        if (file) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64String = reader.result?.toString();
            // const quill = (document.querySelector(".ql-editor") as any).__blot;
            const quill = quillRef.current?.getEditor();

            console.log("quill >>> ", quill);

            if (quill && base64String) {
              const fileType = file.type.includes("image") ? "image" : "file";

              console.log("filetype >>>" + fileType);

              if (fileType === "image") {
                await quill.insertEmbed(
                  quill.getSelection()?.index || 0,
                  "image",
                  base64String
                );
              } else {
                await quill.insertText(
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
      // quillRef.current가 정의된 후에만 getEditor를 호출
      const checkQuillReady = setTimeout(() => {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          console.log("Quill Editor 로드 완료", editor);
        }
      }, 500); // 500ms 후에 quill이 로드되었는지 체크

      return () => clearTimeout(checkQuillReady);
    }, []);
    return (
      <>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={handleChange}
          theme="snow"
          modules={modules}
        />
        {/* <ReactQuill value={value} onChange={handleChange} theme='bubble' /> */}
      </>
    );
  })
);
