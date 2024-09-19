// import React from "react";
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Image from "@tiptap/extension-image";

// function TiptapEditor() {
//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Image.configure({
//         inline: true,
//       }),
//     ],
//     content: "내용을 입력하세요.",
//   });

//   const addImage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) {
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => {
//       if (editor) {
//         editor
//           .chain()
//           .focus()
//           .setImage({ src: reader.result as string })
//           .run();
//       }

//       reader.readAsDataURL(file);
//     };
//   };

//   return (
//     <div>
//       <div>
//         <input
//           className="mb-5"
//           type="file"
//           accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-7z-compressed"
//           onChange={addImage}
//           multiple
//         />
//       </div>
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

// export default TiptapEditor;
