// "use client";

// import "@/app/posts/new/components/CKEditor/CustomCKEditor.css";

// import React, { useEffect, useRef } from "react";
// import { CKEditor } from "@ckeditor/ckeditor5-react";

// import {
//     ClassicEditor,
//     Bold,
//     Essentials,
//     Italic,
//     Mention,
//     Paragraph,
//     Undo,
//     Autoformat,
//     BlockQuote,
//     CloudServices,
//     Heading,
//     ImageCaption,
//     ImageResize,
//     ImageStyle,
//     ImageToolbar,
//     ImageUpload,
//     LinkImage,
//     Image,
//     ImageInsert,
//     ImageInsertViaUrl,
//     Base64UploadAdapter,
//     Indent,
//     IndentBlock,
//     Link,
//     List,
//     MediaEmbed,
//     PasteFromOffice,
//     PictureEditing,
//     Table,
//     TableColumnResize,
//     TableToolbar,
//     TextTransformation,
//     Underline,
//     Autosave,
//     Code,
//     Strikethrough,
//     Subscript,
//     Superscript,
//     CodeBlock,
//     Title,
//     Clipboard,
//     FindAndReplace,
//     Font,
//     FontFamily,
//     Highlight,
//     HorizontalLine,
//     GeneralHtmlSupport,
//     HtmlComment,
//     HtmlEmbed,
//     FullPage,
//     AutoLink,
//     TodoList,
//     AdjacentListsSupport,
//     Markdown,
//     PageBreak,
//     PasteFromMarkdownExperimental,
//     RemoveFormat,
//     StandardEditingMode,
//     SelectAll,
//     ShowBlocks,
//     SourceEditing,
//     SpecialCharacters,
//     SpecialCharactersEssentials,
//     Style,
//     TableProperties,
//     TableCellProperties,
//     TableCaption,
//     Alignment,
//     TextPartLanguage,
//     WordCount,
//     ImageResizeEditing,
//     ImageResizeHandles,
//     AutoImage,
//     SimpleUploadAdapter,
//     ButtonView,
//     DropdownView,
// } from "ckeditor5";
// import { Editor, PluginConstructor } from "@ckeditor/ckeditor5-core";

// import "ckeditor5/ckeditor5.css";

// //Mermaid라는것도 있는데 flowchart 그리게 해줌.
// const editorPlugins: Array<string | PluginConstructor<Editor>> = [
//     Autoformat,
//     TextTransformation,
//     Autosave,
//     Bold,
//     Code,
//     Italic,
//     Strikethrough,
//     Subscript,
//     Superscript,
//     Underline,
//     Indent,
//     IndentBlock,
//     BlockQuote,
//     CodeBlock,
//     // Title, // 에디터 내에 제목 부분이랑 본문 영역을 나눠줌 글쎄 굳이 필요 없어서 주석 처리
//     Clipboard, // 드래그 앤 드랍 기능
//     FindAndReplace,
//     Font,
//     FontFamily,
//     Heading,
//     Highlight,
//     HorizontalLine,
//     GeneralHtmlSupport,
//     HtmlComment,
//     HtmlEmbed,
//     FullPage,
//     Link,
//     AutoLink,
//     List,
//     TodoList,
//     AdjacentListsSupport,
//     Markdown,
//     Essentials, // 에디터 플레이스 홀더 기능. 원하는 곳 css로 선택하고 그 위치에 placeholder를 넣어주면 됨.
//     MediaEmbed,
//     Mention,
//     PageBreak,
//     PasteFromOffice,
//     PasteFromMarkdownExperimental,
//     RemoveFormat,
//     StandardEditingMode, // toolbar의 restrictedEditingException와 관련이 있음
//     SelectAll,
//     ShowBlocks,
//     SourceEditing,
//     SpecialCharacters,
//     SpecialCharactersEssentials,
//     Style, // 미리 정의된 스타일 적용 가능. 따로 설정 필요
//     Table, // 테이블도 따로 설정 더 필요 나중에 필요하면 사용
//     TableToolbar,
//     TableProperties,
//     TableCellProperties,
//     TableColumnResize,
//     TableCaption,
//     Alignment,
//     TextPartLanguage, // 원하는 언어 커스터마이징으로 설정 가능
//     Undo,
//     Paragraph,
//     WordCount, // 단어와 문자 수 세기
//     // Image, 반응형 이미지 기능도 추가 가능. 근데 NEXT 도 Image 태그로 최적화할 수 있지 않나. 일단 나중에 후자를 사용 해보기
//     Image,
//     ImageUpload,
//     ImageInsertViaUrl,
//     ImageCaption,
//     ImageResize,
//     AutoImage,
//     ImageInsert,
//     ImageResizeEditing,
//     ImageResizeHandles,
//     ImageStyle,
//     ImageToolbar,
//     LinkImage,
//     Base64UploadAdapter,
//     SimpleUploadAdapter,
// ];
// const toolbarItems = [
//     // "undo",
//     // "redo",
//     "heading",

//     "fontFamily",
//     "fontSize",
//     "fontColor",
//     "fontBackgroundColor",
//     "highlight",

//     "bold",
//     "italic",

//     // 텍스트 스타일링
//     {
//         label: "TextStyle",
//         withText: true,
//         items: ["underline", "strikethrough", "subscript", "superscript", "horizontalLine", "blockQuote"],
//     },

//     // 링크 및 임베드
//     "insertImage",
//     "mediaEmbed",
//     "htmlEmbed",
//     "link",

//     // 정렬 및 서식
//     "alignment",
//     "resizeImage", // 커스터마이징을 통해 드랍다운 만들어서 이미지 원하는 크기로 조정 기능 추가 가능.

//     // 리스트
//     {
//         label: "List",
//         items: ["bulletedList", "numberedList", "todoList"],
//     },
//     // 테이블 및 페이지
//     {
//         label: "Table&Page",
//         items: ["insertTable", "pageBreak"],
//     },

//     "code",
//     "codeBlock",

//     "removeFormat",
//     "findAndReplace",

//     // 편집 도구
//     {
//         label: "View&Edit",
//         items: ["selectAll", "showBlocks", "sourceEditing", "restrictedEditingException", "specialCharacters", "textPartLanguage"],
//     },

// ];

// //readonly 모드 구현하면 툴바 숨기고 글만 보게 해줌 리드온리 모드 추가.
// // editor crash할때 즉 에디터가 의도치 않게 멈출 때 데이터 손실을 막아주는 watchdog라는 기능도 있는데 추가 예정.
// // 이 기능은 특히 긴 글을 작성하거나 복잡한 작업을 할 때 중요한데, 충돌로 인해 작성 중이던 내용이 날아가지 않도록 하여 사용자 경험을 개선할 수 있다.
// function CustomCKEditor() {
//     const editorRef = useRef<ClassicEditor | null>(null);
//     const toolbarContainerRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         const toolbarContainer = document.querySelector(".ck-toolbar-container");
//         if (toolbarContainer) {
//             toolbarContainerRef.current = toolbarContainer as HTMLDivElement;
//         }
//     }, []);

//     const handleEditorReady = (editor: ClassicEditor) => {

//         console.log("editor is ready to use!", editor);

//         editorRef.current = editor;

//         if (toolbarContainerRef.current) {
//             const defaultToolbar = editorRef.current.ui.view.toolbar.element;
//             if (defaultToolbar) {
//                 toolbarContainerRef.current.appendChild(defaultToolbar);
//             }
//         }


      
//     };

//     return (
//         <CKEditor
//             editor={ClassicEditor}
//             config={{
//                 plugins: editorPlugins,
//                 // extraPlugins: [CustomUploadAdapterPlugin],
//                 toolbar: {
//                     items: toolbarItems,
//                 },
//                 mention: {
//                     feeds: [
//                         {
//                             marker: "@",
//                             feed: ["@apple", "@banana", "@cherry"],
//                             minimumCharacters: 1,
//                         },
//                     ],
//                 },
//                 initialData: "",
//                 image: {
//                     toolbar: [
//                         // 'ckboxImageEdit', // 유료
//                         "imageStyle:alignLeft",
//                         "|",
//                         "imageStyle:alignCenter",
//                         "|",
//                         "imageStyle:alignRight",
//                         // '|',
//                         // 'imageStyle:full',
//                         "|",
//                         "toggleImageCaption",
//                         "|",
//                         "imageTextAlternative",
//                         "|",
//                         "linkImage",
//                     ],
//                     styles: {
//                         options: [
//                             // 'full',              // 전체 너비
//                             {
//                                 name: "alignLeft", // 왼쪽 정렬 스타일
//                                 title: "Align Left",
//                                 className: "image-align-left",
//                                 modelElements: ["imageBlock", "imageInline"],
//                                 icon: "left",
//                             },
//                             {
//                                 name: "alignCenter", // 가운데 정렬 스타일
//                                 title: "Align Center",
//                                 className: "image-align-center",
//                                 modelElements: ["imageBlock", "imageInline"],
//                                 icon: "center",
//                             },
//                             {
//                                 name: "alignRight", // 오른쪽 정렬 스타일
//                                 title: "Align Right",
//                                 className: "image-align-right",
//                                 modelElements: ["imageBlock", "imageInline"],
//                                 icon: "right",
//                             },
//                             // {
//                             //     name: 'full', // 전체 너비 스타일
//                             //     title: 'Full width',
//                             //     className: 'image-full-width',
//                             //     modelElements: [ 'imageBlock', 'imageInline' ],
//                             //     icon: 'full'
//                             // }
//                         ],
//                     },
//                     insert: {
//                         integrations: ["upload", "url"], // assetManager 유료
//                         type: "auto", // 이미지 삽입 시 자동으로 블록 또는 인라인 스타일 선택
//                     },
//                 },
//             }}
//             onReady={(editor) => {
//                 if (toolbarContainerRef.current) {
//                     handleEditorReady(editor);
//                 } else {
//                     // 툴바 컨테이너가 준비되지 않은 경우, 준비된 후에 handleEditorReady를 호출
//                     const observer = new MutationObserver(() => {
//                         if (toolbarContainerRef.current) {
//                             handleEditorReady(editor);
//                             observer.disconnect();
//                         }
//                     });
//                     observer.observe(document.body, { childList: true, subtree: true });
//                 }
//             }}
//         />
//     );
// }

// export default CustomCKEditor;
