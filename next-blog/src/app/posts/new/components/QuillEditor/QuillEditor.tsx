import { v4 as uuidv4 } from "uuid";

import dynamic from "next/dynamic";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ToastContainer, toast } from "react-toastify";

import { uploadFile } from "@/app/posts/(common)/utils/uploadFile";

import { faFile, faImage, faVideo, faAlignCenter, faAlignLeft, faAlignRight } from "@fortawesome/free-solid-svg-icons";

import DOMPurify from "dompurify";

// import "react-quill/dist/quill.bubble.css"; // Bubble 테마의 CSS 파일

import "react-quill/dist/quill.snow.css"; // Snow 테마 CSS 파일

import "@/app/posts/new/components/QuillEditor/QuillEditor.css";

import ReactQuill from "react-quill";
import { ReactQuillProps } from "react-quill";

import Quill, { Range } from "quill";
import type { FileMetadata } from "@/common/types/PostTypes";
 
interface ForwardedQuillComponent extends ReactQuillProps {
    forwardedRef: React.Ref<ReactQuill>;
}

const ReactQuillDynamic = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill");
        return ({ forwardedRef, ...props }: ForwardedQuillComponent) => <RQ ref={forwardedRef} {...props} />;
    },
    {
        ssr: false,
    }
);
 

interface QuillEditorProps {
    value: string;
    fileRef: React.MutableRefObject<FileMetadata[]>;
    totalUploadedImagesUrlRef: React.MutableRefObject<string[]>;
    deletedImageUrlsInFutureRef: React.MutableRefObject<string[]>;
    getEditorContent: (getContent: () => string) => void;}

interface DropdownMenuProps {
    dropdownPosition: {
        top: number;
        left: number;
    };

    handleFileSelection: (type: string) => void;

    dropdownRef: React.Ref<HTMLDivElement>;
}

//React.memo를 통해 부모 컴포넌트가 재렌더링 되어도 자식 컴포넌트의 props값이 변하지 않으면 QuillEditor의 재렌더링을 막는다. 따라서 BlogForm에서 제목의 내용을 변경해도 QuillEditor에는 제목 관련 Props가 없기 때문에 재렌더링 되지 않는다.
export default React.memo(
    React.forwardRef<ReactQuill, QuillEditorProps>(function QuillEditor(
        { value, fileRef, totalUploadedImagesUrlRef, deletedImageUrlsInFutureRef, getEditorContent },
        ref
    ) {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

        const quillRef = useRef<ReactQuill | null>(null); // ReactQuill에 대한 참조로 타입 지정

        const dropdownRef = useRef<HTMLDivElement | null>(null);

        const dropdownVisibleRef = useRef<boolean>(false); // 드롭다운 표시 여부를 ref로 관리

        const overlayRef = useRef<HTMLElement | null>(null); // 오버레이 참조

        // 이미지를 클릭했을 때 오버레이가 클릭되고, 이후에 항상 최신값을 유지하면서 툴바의 정렬 기능을 사용하기 위함. useState는 비동기적으로 처리되기 때문에 바로 직후에 참조하는 경우 이전 값이 반환될 수 있음
        // 또한 ref의 특징은 값이 변경되더라도 리렌더링을 유발하지 않으며, 만약 컴포넌트가 다시 렌더링되어도 해당 값이 초기화되지 않기 때문에 렌더링 주기와 상관없이 최신 값을 유지할 수 있다.
        const selectedImageRef = useRef<HTMLImageElement | null>(null);

        const imgRectRef = useRef<DOMRect | null>(null);

        const alignmentRef = useRef<("left" | "center" | "right") | false | null>(null);

        const dropdownPosition = { top: -9999, left: -9999 };

        let savedSelection: number | undefined = undefined; // 사용자가 토글 누르기 전 커서 위치 저장을 위한 변수. state로 할 시 비동기로 예상치 못한 결과를 가져와서 일반 변수로 선언.

        

        // const router = useRouter();

        // useEffect(() => {
            
        //         console.log("실행입니다");

        //         const toolbarElement = document.querySelector(".ql-toolbar");

        //         // 툴바가 DOM에 있는지 확인하고, 없다면 생성 후 header에 추가.  이 코드 없으면 툴바가 이상해짐 
        //         if (!toolbarElement) {
                    
        //             const container = document.querySelector(".ql-toolbar-container");
    
        //             if (container) {

        //                 // container?.classList.add("ql-toolbar", "ql-snow");
    
        //                 // 커스텀 툴바 설정 quill에게 아래 설정들을 사용한다고 알림.
        //                 const toolbarConfig = [
        //                     [{ header: [1, 2, 3, 4, false] }],
        //                     [{ font: [] }], // 폰트 패밀리 설정
        //                     [{ size: ["small", "large", "huge", false] }],
        //                     [{ align: [] }],
        //                     ["link", "image", "code-block"],
        //                     [{ color: [] }, { background: [] }],
        //                     ["bold", "italic", "underline"],
        //                     [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        //                     ["clean"],
        //                 ];
    
        //                 // 실제로 화면에 보여주기 위한 툴바 HTML 동적 생성
        //                 // 아래쪽에 option value left가 없고 selected인데 그래서 왼쪽 정렬 클릭하면 false로 뜨는건가.
        //                 const createToolbarHTML = (config: any) => {
        //                     return config
        //                         .map((group: any) => {
        //                             if (Array.isArray(group)) {
        //                                 return group
        //                                     .map((item) => {
        //                                         if (typeof item === "object") {
        //                                             if (item.header) {
        //                                                 return `
        //                                                     <select class="ql-header">
        //                                                         <option value="1">Heading 1</option>
        //                                                         <option value="2">Heading 2</option>
        //                                                         <option value="3">Heading 3</option>
        //                                                         <option value="4">Heading 4</option>
        //                                                         <option value="">Normal</option>
        //                                                     </select>`;
        //                                             } else if (item.list) {
        //                                                 return `<button class="ql-list" value="${item.list}"></button>`;
        //                                             } else if (item.indent) {
        //                                                 return `<button class="ql-indent" value="${item.indent}"></button>`;
        //                                             } else if (item.align) {
        //                                                 return `
        //                                                     <select class="ql-align">
        //                                                         <option selected></option>
        //                                                         <option value="center"></option>
        //                                                         <option value="right"></option>
        //                                                         <option value="justify"></option>
        //                                                     </select>`;
        //                                             } else if (item.color) {
        //                                                 return `<select class="ql-color"></select>`;
        //                                             } else if (item.background) {
        //                                                 return `<select class="ql-background"></select>`;
        //                                             } else if (item.font) {
        //                                                 return `
        //                                                     <select class="ql-font">
        //                                                         <option selected></option>
        //                                                         <option value="serif">Serif</option>
        //                                                         <option value="monospace">Monospace</option>
        //                                                     </select>`;
        //                                             } else if (item.size) {
        //                                                 return `
        //                                                     <select class="ql-size">
        //                                                         <option value="small"></option>
        //                                                         <option selected></option>
        //                                                         <option value="large"></option>
        //                                                         <option value="huge"></option>
        //                                                     </select>`;
        //                                             }
        //                                         } else {
        //                                             // item type이 객체가 아닐때 실행 즉, bold, italic, undeline 과 같은 문자열일때 실행. ex: ql-bold, ql-italic, ql-underline
        //                                             return `<button class="ql-${item}"></button>`;
        //                                         }
        //                                     })
        //                                     .join("");
        //                             }
        //                             return "";
        //                         })
        //                         .join("");
        //                 };
    

        //                 // 아래와 같이 툴바 HTML을 생성하고, 생성된 HTML을 툴바 컨테이너에 삽입하면 reading of null 에러가 발생함.
        //                 // container.innerHTML = createToolbarHTML(toolbarConfig);

        //                 const toolbarHTML = createToolbarHTML(toolbarConfig);

        //                 // 툴바에 생성된 HTML 삽입
        //                     container.innerHTML = toolbarHTML;

                    
        //                       // const quill = quillRef.current?.getEditor();
        //     // if (quill) {
        //     //     const toolbarModule = quill.getModule("toolbar") as {
        //     //         container: any;
        //     //     }; // 타입 단언
        //     //     if (toolbarModule) {
        //     //         toolbarModule.container = toolbarElement || ".ql-toolbar"; // 커스텀 툴바 할당
        //     //     }
        //     // }


        //             }
        //         }

       
        // }, []);

       

        // 캡쳐 이미지 붙여넣었을때 처리
        useEffect(() => {
            const addPasteEventListener: (quill: Quill) => () => void = (quill: Quill) => {
                const handlePaste = (e: ClipboardEvent) => {
                    console.log("실행");

                    const clipboardData = e.clipboardData;

                    if (clipboardData) {
                        // 붙여넣기 데이터 중 이미지가 있는지 확인
                        const pastedData = clipboardData.items;

                        for (let i = 0; i < pastedData.length; i++) {
                            const item = pastedData[i];

                            console.log("object >>>>>>>>>>>>>>", item);
                            console.log("item.type >>>>>>>>>>>>>>", item.type);

                            if (item.type.startsWith("image/")) {
                                const file: File | null = item.getAsFile();
                                console.log("file >>>>>>>>>>>>>>", file);

                                if (file) {
                                    handleImagePaste(quill, file);
                                }
                                break;
                            }
                        }
                    }
                };

                // 붙여넣기 이벤트 리스너 추가
                quill.root.addEventListener("paste", handlePaste);

                // 리스너 해제 로직
                return () => {
                    quill.root.removeEventListener("paste", handlePaste);
                };
            };

        
                    // quill이 준비되지 않았으면 500ms 후 다시 시도
                        const quillInstance = quillRef.current?.getEditor();
                        if (quillInstance) {
                    
                                const toolbarElement = document.querySelector('.ql-toolbar') as HTMLDivElement;
                                const customContainer = document.querySelector('.ql-toolbar-container') as HTMLDivElement;

                                if (toolbarElement && customContainer) {
                                    
                                    customContainer.appendChild(toolbarElement);
                                    toolbarElement.classList.add('visible');
                                    console.log("실행입니다", toolbarElement);
                                }
                        
                                // clearInterval(intervalId);
                                return addPasteEventListener(quillInstance);
                          
                        }
                  
                
         
            // const cleanup = initializeQuill();

            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            // return () => {
            //     if (cleanup) {
            //         cleanup();
            //     }
            // };
        }, []);

        const handleImagePaste: (quill: Quill, file: File) => Promise<void> = async (quill: Quill, file: File) => {
            // 이미지 파일을 서버에 업로드
            const fileUrl = await uploadFile(file);

            console.log("fileUrl 붙여넣기>>>", fileUrl);

            const currentUploadedImages: string[] = totalUploadedImagesUrlRef.current;
            totalUploadedImagesUrlRef.current = [...currentUploadedImages, fileUrl];

            if (fileRef && fileRef.current) {
                fileRef.current.push({
                    fileName: file.name,
                    fileType: file.type,
                    fileUrl,
                    fileSize: file.size,
                });
            }

            const range: Range | null = quill.getSelection();

            if (range) {
                const [leaf] = quill.getLeaf(range.index);
                if (leaf && leaf.domNode && (leaf.domNode as HTMLElement).tagName === "IMG") {
                    (leaf.domNode as HTMLImageElement).src = fileUrl;

                    setTimeout(() => {
                        quill.insertText(range.index + 1, "\n", Quill.sources.USER);
                        quill.setSelection(range.index + 2, Quill.sources.SILENT);
                    }, 100); // 100ms 지연 후 실행
                }
            }
        };

        // 오버레이 드래그 진행 시 가로세로 비율 유지하면서 조정
        const handleResizeFunction = (initialImgRect?: DOMRect | null) => {
            let imgRect = initialImgRect;

            let startX: number;
            let startY: number;
            let startWidth: number;
            let startHeight: number;
            let aspectRatio: number;

            // requestAnimationFrame을 위한 참조
            let animationFrameId: number;

            const handleResizeStart = (event: MouseEvent, handlerType: string) => {
                if (!imgRect || !selectedImageRef.current) return;

                startX = event.clientX;
                startY = event.clientY;
                startWidth = imgRect.width;
                startHeight = imgRect.height;
                aspectRatio = startWidth / startHeight;

                const handleResize = (moveEvent: MouseEvent) => {
                    if (!selectedImageRef.current) return;

                    selectedImageRef.current.style.opacity = "0.5";

                    let newWidth = startWidth;
                    let newHeight = startHeight;

                    const container = document.querySelector(".ql-custom-container");
                    const containerRect = container?.getBoundingClientRect();

                    if (!containerRect) return;

                    // 핸들러에 따라 오버레이 크기 변경
                    if (handlerType === "bottom-right" || handlerType === "top-right") {
                        newWidth = startWidth + (moveEvent.clientX - startX);
                        newHeight = newWidth / aspectRatio;

                        if ((alignmentRef.current === "left" && containerRect) || !alignmentRef.current) {
                            // 초기에 정렬이 안된 상태일때 기본값으로 왼쪽 정렬 설정.
                            alignmentRef.current = "left";

                            if (newWidth + selectedImageRef.current.offsetLeft > containerRect.width) {
                                newWidth = containerRect.width - selectedImageRef.current.offsetLeft - 8;
                                newHeight = newWidth / aspectRatio;
                            }
                        } else if (alignmentRef.current === "center") {
                            const centerOffset = (containerRect.width - newWidth) / 2;
                            if (centerOffset + newWidth > containerRect.width) {
                                newWidth = containerRect.width - 16;
                                newHeight = newWidth / aspectRatio;
                            }
                        } else if (alignmentRef.current === "right" && containerRect) {
                            const imageRightEdge = selectedImageRef.current.offsetLeft + selectedImageRef.current.offsetWidth;
                            if (newWidth > imageRightEdge) {
                                newWidth = imageRightEdge - 8;
                                newHeight = newWidth / aspectRatio;
                            }
                        }
                    } else if (handlerType === "bottom-left" || handlerType === "top-left") {
                        newWidth = startWidth - (moveEvent.clientX - startX);
                        newHeight = newWidth / aspectRatio;

                        if ((alignmentRef.current === "left" && containerRect) || !alignmentRef.current) {
                            // 초기에 정렬이 안된 상태일때 기본값으로 왼쪽 정렬 설정.
                            alignmentRef.current = "left";

                            // 왼쪽 정렬 상태에서 오른쪽 부분이 컨테이너를 벗어나지 않도록 제한
                            if (newWidth + selectedImageRef.current.offsetLeft > containerRect.width) {
                                newWidth = containerRect.width - selectedImageRef.current.offsetLeft - 8;
                                newHeight = newWidth / aspectRatio;
                            }
                        }
                        // 중앙 정렬 상태에서 드래그할 때는 중앙에 맞추기
                        else if (alignmentRef.current === "center") {
                            const centerOffset = (containerRect.width - newWidth) / 2;
                            if (centerOffset < 0) {
                                newWidth = containerRect.width - 16; // 전체 크기를 컨테이너 너비로 고정
                                newHeight = newWidth / aspectRatio;
                            }
                        } else if (alignmentRef.current === "right" && containerRect) {
                            const imageRightEdge = selectedImageRef.current.offsetLeft + selectedImageRef.current.offsetWidth; // 이미지 오른쪽 끝 좌표 계산

                            // 왼쪽 핸들러로 드래그 시, 컨테이너의 왼쪽 끝을 넘지 않도록 제한
                            if (newWidth > imageRightEdge) {
                                newWidth = imageRightEdge - 8; // 오른쪽 끝을 넘지 않도록 제한
                                newHeight = newWidth / aspectRatio;
                            }
                        }
                    }

                    // 오버레이 업데이트 로직과 같은 크기 제한 로직
                    const overlay = overlayRef.current;
                    if (newWidth > 100 && newHeight > 100) {
                        if (overlay) {
                            overlay.style.width = `${newWidth}px`;
                            overlay.style.height = `${newHeight}px`;

                            if (alignmentRef.current === "center" && containerRect) {
                                const centerOffset = (containerRect.width - newWidth) / 2;
                                overlay.style.left = `${centerOffset}px`;
                                selectedImageRef.current.style.left = `${centerOffset}px`;
                            } else if (alignmentRef.current === "left") {
                                overlay.style.left = `${selectedImageRef.current.offsetLeft}px`;
                            } else if (alignmentRef.current === "right") {
                                const rightEdge = containerRect.width - newWidth;
                                overlay.style.left = `${rightEdge - 8}px`;
                                selectedImageRef.current.style.left = `${rightEdge}px`;
                            }
                        }

                        const updateImageSize = () => {
                            if (selectedImageRef.current) {
                                selectedImageRef.current.style.width = `${newWidth}px`;
                                selectedImageRef.current.style.height = `${newHeight}px`;
                            }
                        };

                        animationFrameId = requestAnimationFrame(updateImageSize);
                    }
                };

                const handleResizeEnd = () => {
                    cancelAnimationFrame(animationFrameId);

                    const overlay = overlayRef.current;
                    if (overlay && selectedImageRef.current) {
                        selectedImageRef.current.style.width = overlay.style.width;
                        selectedImageRef.current.style.height = overlay.style.height;
                        selectedImageRef.current.style.opacity = "1";

                        // 드래그 한번 조정 후에 조정된 img의 Rect값으로 재 적용.
                        imgRect = selectedImageRef.current?.getBoundingClientRect();
                    }

                    window.removeEventListener("mousemove", handleResize);
                    window.removeEventListener("mouseup", handleResizeEnd);
                };

                window.addEventListener("mousemove", handleResize);
                window.addEventListener("mouseup", handleResizeEnd);
            };

            const handleMouseDown = (event: MouseEvent, handlerType: string) => {
                const overlayRect = overlayRef.current?.getBoundingClientRect();
                const tolerance = 5;

                if (
                    selectedImageRef.current &&
                    imgRect &&
                    overlayRect &&
                    Math.abs(imgRect.left - overlayRect.left) < tolerance &&
                    Math.abs(imgRect.top - overlayRect.top) < tolerance
                ) {
                    handleResizeStart(event, handlerType);
                }
            };

            const overlay = overlayRef.current;

            let bottomRightHandler: HTMLDivElement | null = null;
            let bottomLeftHandler: HTMLDivElement | null = null;
            let topLeftHandler: HTMLDivElement | null = null;
            let topRightHandler: HTMLDivElement | null = null;

            if (overlay) {
                bottomRightHandler = overlay.querySelector(".bottom-right") as HTMLDivElement;
                bottomLeftHandler = overlay.querySelector(".bottom-left") as HTMLDivElement;
                topLeftHandler = overlay.querySelector(".top-left") as HTMLDivElement;
                topRightHandler = overlay.querySelector(".top-right") as HTMLDivElement;

                const handleMouseDownBottomRight = (event: MouseEvent) => handleMouseDown(event, "bottom-right");
                const handleMouseDownBottomLeft = (event: MouseEvent) => handleMouseDown(event, "bottom-left");
                const handleMouseDownTopLeft = (event: MouseEvent) => handleMouseDown(event, "top-left");
                const handleMouseDownTopRight = (event: MouseEvent) => handleMouseDown(event, "top-right");

                if (bottomRightHandler) {
                    bottomRightHandler.addEventListener("mousedown", handleMouseDownBottomRight);
                }

                if (bottomLeftHandler) {
                    bottomLeftHandler.addEventListener("mousedown", handleMouseDownBottomLeft);
                }

                if (topLeftHandler) {
                    topLeftHandler.addEventListener("mousedown", handleMouseDownTopLeft);
                }

                if (topRightHandler) {
                    topRightHandler.addEventListener("mousedown", handleMouseDownTopRight);
                }

                // 클린업 함수: 이벤트 핸들러 제거
                return () => {
                    if (bottomRightHandler) {
                        bottomRightHandler.removeEventListener("mousedown", handleMouseDownBottomRight);
                    }
                    if (bottomLeftHandler) {
                        bottomLeftHandler.removeEventListener("mousedown", handleMouseDownBottomLeft);
                    }
                    if (topLeftHandler) {
                        topLeftHandler.removeEventListener("mousedown", handleMouseDownTopLeft);
                    }
                    if (topRightHandler) {
                        topRightHandler.removeEventListener("mousedown", handleMouseDownTopRight);
                    }
                };
            }
        };

        // 오버레이 내부 클릭 시 클릭 이벤트 전파 막기 함수
        const handleOverlayClick = (event: MouseEvent) => {
            event.stopPropagation(); // 클릭 이벤트 전파를 막음
        };

        // 익명 함수() => {}를 통해 이벤트 리스너를 등록하고, 삭제하는 경우 함수 참조가 일치하지 않아 제대로 이벤트 제거가 안됨. 따라서 아래와 같이 전역적으로 뺀다.
        const scrollHandler = () => updateOverlayOnScrollResize(imgRectRef.current);
        const resizeHandler = () => updateOverlayOnScrollResize(imgRectRef.current);

        // 오버레이 외부 클릭 시 오버레이 숨김 처리
        const handleOverlayOutsideClick = (event: MouseEvent) => {
            const overlay = overlayRef.current;

            // 툴바 버튼 클릭 감지
            const toolbarElements = document.querySelectorAll(
                ".ql-align, .ql-bold, .ql-list, .ql-header, .ql-italic, .ql-indent, .ql-link, .ql-clean, .ql-underline"
            );

            const isToolbarButtonClicked = Array.from(toolbarElements).some((el) => el.contains(event.target as Node)); // 툴바 버튼 클릭 감지

            if (overlay && selectedImageRef.current) {
                if (!selectedImageRef.current.contains(event.target as Node) && !isToolbarButtonClicked) {
                    // 이미지 영역과 툴바 버튼이 아닌 영역을 클릭했을 때만 실행
                    overlay.style.display = "none";

                    if ((overlay.style.display = "none")) {
                        // 오버레이가 없을때만 위치 다시 구하기.
                        document.addEventListener("scroll", scrollHandler);
                        document.addEventListener("resize", resizeHandler);
                    }

                    document.removeEventListener("mousedown", handleOverlayOutsideClick);

                    if (overlayRef.current) {
                        overlayRef.current.removeEventListener("mousedown", handleOverlayClick);
                    }

                    // 오버레이의 각 모서리 크기 조정하는 부분 mousedown 이벤트 제거.
                    resizeMouseDownCleanUp?.();

                    const parentContainer: HTMLElement | null = selectedImageRef.current.parentElement;

                    if (parentContainer) {
                        parentContainer.style.marginBottom = "0"; // 오버레이 삭제 시 추가한 마진 초기화
                    }
                }
            }
        };

        // handleImageClick 함수에서 호출될 함수
        const activateOverlayOutsideClickHandler = () => {
            document.addEventListener("mousedown", handleOverlayOutsideClick);

            if (overlayRef.current) {
                overlayRef.current.addEventListener("mousedown", handleOverlayClick);
            }
        };

        // 이미지가 선택되면 오버레이 위치를 조정
        const updateOverlayOnScrollResize = (imgRect: DOMRect | null) => {
            if (!imgRect) return;

            requestAnimationFrame(() => {
                const parentContainer = document.querySelector(".ql-custom-container") as HTMLDivElement;

                if (!parentContainer) return;

                const parentRect = parentContainer.getBoundingClientRect();
                const overlay = overlayRef.current;

                if (overlay && parentRect) {
                    overlay.style.width = `${imgRect.width}px`;
                    overlay.style.height = `${imgRect.height}px`;

                    overlay.style.left = `${imgRect.left - parentRect.left + parentContainer.scrollLeft}px`;
                    overlay.style.top = `${imgRect.top - parentRect.top + parentContainer.scrollTop}px`;
                }
            });
        };

        let resizeMouseDownCleanUp: ((initialRect?: DOMRect) => void) | undefined;

        // 이미지 크기 및 위치를 가져와서 오버레이 초기 설정
        const handleImageClick = useCallback((event: MouseEvent) => {
            let imgEl: HTMLImageElement | null = null;

            // event.target이 <img> 태그일 경우만 처리하도록 수정
            if ((event.target as HTMLElement).tagName === "IMG") {
                imgEl = event.target as HTMLImageElement;

                const storedAlignment = imgEl.getAttribute("data-alignment") as "left" | "center" | "right" | null;

                if (storedAlignment) {
                    alignmentRef.current = storedAlignment;
                } else {
                    alignmentRef.current = "left";
                }

                const imgRect = imgEl.getBoundingClientRect();

                const clickX = event.clientX;
                const clickY = event.clientY;

                // 클릭한 좌표가 이미지 영역 내부인지 확인
                if (clickX >= imgRect.left && clickX <= imgRect.right && clickY >= imgRect.top && clickY <= imgRect.bottom) {
                    const overlay = overlayRef.current;
                    if (overlay) {
                        overlay.style.width = `${imgRect.width}px`;
                        overlay.style.height = `${imgRect.height}px`;
                        overlay.style.left = `${imgRect.left + window.scrollX}px`;
                        overlay.style.top = `${imgRect.top + window.scrollY}px`;
                        overlay.style.display = "block"; // 오버레이 표시

                        if ((overlay.style.display = "block")) {
                            // 이벤트 리스너 제거
                            document.removeEventListener("scroll", scrollHandler);
                            document.removeEventListener("resize", resizeHandler);
                        }

                        // overlay의 부모 즉 figure의 부모인 div로 잡으면 에디터 전체 내용이 선택되어서, 맨아래쪽에 margin이 생겨서 해당 방식은 불가능.
                        const parentContainer: HTMLElement | null = imgEl.parentElement;

                        if (parentContainer) {
                            parentContainer.style.marginBottom = "3.5rem"; // 이미지 클릭 후, 오버레이 생성 시 다른 요소와의 거리를 위해 아래쪽 공간 확보
                        }
                    }

                    updateOverlayOnScrollResize(imgRect);
                    resizeMouseDownCleanUp = handleResizeFunction(imgRect);
                    activateOverlayOutsideClickHandler();

                    // document.body.scrollHeight(문서의 전체 높이)가 window.innerHeight(뷰포트의 높이)보다 클 경우, 즉 수직 스크롤바가 있으면 스크롤바 위치까지 고려해 다시 한번 계산.
                    if (document.body.scrollHeight > window.innerHeight) {
                        const updatedImgRect = imgEl?.getBoundingClientRect();
                        if (updatedImgRect) {
                            updateOverlayOnScrollResize(updatedImgRect);
                        }
                    }

                    imgRectRef.current = imgRect;
                    selectedImageRef.current = imgEl; // ref 업데이트
                }
            }

            return () => {
                document.removeEventListener("scroll", scrollHandler);
                document.removeEventListener("resize", resizeHandler);
            };
        }, []);

        useEffect(() => {
            const quill = quillRef.current?.getEditor();

            if (quill) {
                getEditorContent(() => {
                    const html = quill.root.innerHTML;
                    return DOMPurify.sanitize(html);
                });
            } else {
                const intervalId = setInterval(() => {
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        getEditorContent(() => {
                            const html = quill.root.innerHTML;
                            return DOMPurify.sanitize(html);
                        });
                        clearInterval(intervalId);
                    }
                }, 500);
            }
        }, [getEditorContent]);

        // 에디터 내에서 이미지를 클릭할 때 오버레이 표시, delete키를 눌렀을 때 이미지 삭제, 
        // qi editor 내부에서 이미지 삭제 시 서버에 요청할 이미지 목록 관리
        useEffect(() => {

            let observer: MutationObserver | null = null;

            const handleKeyDown = (event: KeyboardEvent) => {

                if (event.key === "Delete" && selectedImageRef.current) {
                    const img: HTMLImageElement = selectedImageRef.current;
                    const figure = document.querySelector("figure");

                    img.parentElement?.remove();
                    selectedImageRef.current = null; 
                    if (figure) {
                        figure.style.display = "none"; // figure.remove()를 하면 DOM에서도 아예 삭제되어서 안된다.
                    }
                    
                }
            };

            const intervalId = setInterval(() => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    // quillEditor가 준비되면 클릭 이벤트 리스너 추가
                    const addImageClickListener = (img: HTMLImageElement) => {
                        img.removeEventListener("click", handleImageClick); // 중복 방지
                        img.addEventListener("click", handleImageClick); // 이미지에 클릭 이벤트 추가
                    };

                     observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === "childList") {
                                mutation.addedNodes.forEach((node) => {
                                    if (node.nodeName === "IMG") {
                                        addImageClickListener(node as HTMLImageElement);
                                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                                        const images = (node as HTMLElement).querySelectorAll("img");
                                        images.forEach((img) => addImageClickListener(img));
                                    }
                                });
                            }
                        });
                    });

                    observer.observe(quill.root, {
                        childList: true,
                        subtree: true,
                    });


                    // 에디터 내 삭제를 감지하여 최종적으로 서버측에 요청될 이미지 및 파일 관리, 및 AWS3에 임시 저장된 불필요한 이미지 및 파일 삭제 관리 로직
                    quill.on("text-change", (delta, oldDelta, source) => {
                        console.log("oldDelta>>", oldDelta);
                        console.log("delta", delta);

                        if (source === "user") {
                            delta.ops.forEach((op, index) => {
                                if (!op.delete) return;

                                const images = quill.root.querySelectorAll("img");
                                const links = quill.root.querySelectorAll("a[data-file]");
                                const currentImageUrls = new Set();

                                // 남아있는 전체 이미지 선택
                                images.forEach((img) => {
                                    const imageSrc = img.getAttribute("src");
                                    if (imageSrc) {
                                        currentImageUrls.add(imageSrc);
                                    }
                                });

                                // 남아있는 전체 파일 선택
                                links.forEach((link) => {
                                    const parentElement = link.parentElement;

                                    // 파일을 esc키로 지울 때 p태그까지 한번에 지우는 로직. 이게 없으면 p태그 안에 ::before, ::after 슈도 엘리먼트만 삭제 됨
                                    if (parentElement && parentElement.tagName.toLowerCase() === "p") {
                                        parentElement.remove();
                                    }

                                    const fileHref = link.getAttribute("href");
                                    if (fileHref) {
                                        currentImageUrls.add(fileHref);
                                    }
                                });

                                console.log("업데이트전 이미지 목록:", totalUploadedImagesUrlRef.current);
                                console.log("currnetIds >>>:", currentImageUrls);

                                const currentImageUrlsArr = totalUploadedImagesUrlRef.current.filter((totalUploadedImagesUrl) =>
                                    currentImageUrls.has(totalUploadedImagesUrl)
                                );

                                // 글 작성 중 삭제된 이미지 목록
                                if (currentImageUrlsArr.length !== totalUploadedImagesUrlRef.current.length && fileRef && fileRef.current) {
                                    // 최종 발행 시 적용할 이미지 목록
                                    fileRef.current = fileRef.current.filter((fileMetadata) => currentImageUrlsArr.includes(fileMetadata.fileUrl));

                                    // 최종 발행 시 클라우드 저장소에서 추가적으로 삭제할 이미지 목록
                                    deletedImageUrlsInFutureRef.current = [
                                        ...deletedImageUrlsInFutureRef.current,
                                        //totalUploadedImagesUrlRef.current.filter를 통해 얻은 string[]값을 ...을 통해 string 만 빼내옴
                                        ...totalUploadedImagesUrlRef.current.filter(
                                            (totalUploadedImagesUrl) => !currentImageUrls.has(totalUploadedImagesUrl)
                                        ),
                                    ];

                                    console.log("updatedImageUrlsRef >>>", fileRef.current);
                                    console.log("deletedImageUrlsInFutureRef >>>", deletedImageUrlsInFutureRef.current);
                                }
                            });
                        }
                    });

                    // quillEditor가 준비되면 interval 중지
                    clearInterval(intervalId);
                    quill.root.addEventListener("keydown", handleKeyDown);

                    // 컴포넌트 언마운트 시 이벤트 리스너 제거
                 
                }
            }, 500); // 500ms마다 quillEditor가 준비되었는지 확인

            return () => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    quill.root.removeEventListener("keydown", handleKeyDown);
                }
                if (observer) {
                    observer.disconnect();
                }
            };
        }, []);

        // 드롭다운 위치 설정 함수
        const setPosition = () => {
            const imageButtonElement = document.querySelector(".ql-image");
            const parentContainer = document.querySelector(".ql-custom-container");

            if (imageButtonElement && dropdownRef.current && parentContainer) {
                const rect = imageButtonElement.getBoundingClientRect();
                const parentRect = parentContainer.getBoundingClientRect();
                const dropdownWidth = dropdownRef.current.offsetWidth;
                const buttonWidth = rect.width;

                dropdownRef.current.style.top = `${rect.bottom - parentRect.top}px`;
                dropdownRef.current.style.left = `${rect.left - parentRect.left + buttonWidth / 2 - dropdownWidth / 2}px`;
            }
        };

        const handleDropdownOutsideClick = () => {
            const handleOutsideClick = (event: MouseEvent) => {
                if (
                    dropdownVisibleRef.current &&
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node) &&
                    !document.querySelector(".ql-image")?.contains(event.target as Node)
                ) {
                    dropdownVisibleRef.current = false;

                    if (dropdownRef.current) {
                        dropdownRef.current.style.display = "none";
                    }

                    // 외부 클릭 핸들러 제거 (드롭다운이 닫히면 더 이상 감지할 필요가 없으므로)
                    document.removeEventListener("mousedown", handleOutsideClick);
                }
            };

            // 외부 클릭을 감지하는 이벤트 핸들러 등록
            document.addEventListener("mousedown", handleOutsideClick);
        };

        const toggleDropdown = useCallback(() => {
            const quill = quillRef.current?.getEditor();
            savedSelection = quill?.getSelection()?.index ?? quill?.getLength(); // 로컬 변수에 커서 위치 저장

            dropdownVisibleRef.current = !dropdownVisibleRef.current;

            if (dropdownRef.current) {
                dropdownRef.current.style.display = dropdownVisibleRef.current ? "block" : "none";
            }

            // 드롭다운이 보이는 경우에만 위치 설정
            if (dropdownVisibleRef.current) {
                setPosition();
                handleDropdownOutsideClick();
            }
        }, []);

        // 여기서 함수 재생성을 막아야 올바르게 작동함.
        const handleFileSelection = useCallback((type: string) => {
            dropdownVisibleRef.current = false;

            // DOM 조작을 통해 드롭다운을 숨김
            if (dropdownRef.current) {
                dropdownRef.current.style.display = "none";
            }

            const input = document.createElement("input");
            setInputAttributes(input, type);

            input.click();

            input.onchange = async () => {
                const file = input.files ? input.files[0] : null;
                if (file && validateFileSize(file, type)) {
                    const fileUrl = await uploadFile(file);

                    const currentUploadedImages: string[] = totalUploadedImagesUrlRef.current;
                    totalUploadedImagesUrlRef.current = [...currentUploadedImages, fileUrl];

                    insertFileToEditor(file, fileUrl, type);
                }
            };
        }, []);

        const setInputAttributes = (input: HTMLInputElement, type: string): void => {
            input.setAttribute("type", "file");
            if (type === "image") {
                input.setAttribute("accept", "image/*");
            } else if (type === "file") {
                input.setAttribute("accept", "application/pdf,text/*");
            } else if (type === "video") {
                input.setAttribute("accept", "video/*");
            }
        };

        const validateFileSize = (file: File, type: string): boolean => {
            if (type === "image" && file.size > MAX_IMAGE_SIZE) {
                toast.error("이미지 파일 크기가 5MB를 초과합니다.");
                return false;
            } else if (type === "file" && file.size > MAX_FILE_SIZE) {
                toast.error("파일 크기가 10MB를 초과합니다.");
                return false;
            }
            return true;
        };

        const insertFileToEditor = (file: File, fileUrl: string, type: string): void => {
            const quill = quillRef.current?.getEditor();

            // saveSeleciton이 0인 경우 falsy 값이기 때문에 savedSelection으로 조건을 안잡고 아래 처럼 savedSelection != undefined로 조건을 잡음
            if (quill && fileUrl && savedSelection !== null && savedSelection !== undefined) {
                const currentSelection = savedSelection; // 로컬 변수에 저장

                if (type === "image") {
                    // 커서가 index 0일 때 처리 로직

                    quill.insertEmbed(currentSelection, "image", fileUrl, Quill.sources.USER); // 이미지 삽입

                    // const addedImage = quill.root.querySelector(`img[src="${fileUrl}"]`);
                    // if (addedImage) {
                    //     addedImage.setAttribute("data-id", uuidv4());
                    // }

                    setTimeout(() => {
                        quill.insertText(currentSelection + 1, "\n", Quill.sources.USER);
                        quill.setSelection(currentSelection + 2, Quill.sources.SILENT);
                    }, 100); // 100ms 지연 후 실행
                } else if (type === "file") {
                    
                    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2); 

                    const fileIconHtml = `<a href="${fileUrl}">${file.name} - ${fileSizeInMB}MB </a>`;
                    quill.clipboard.dangerouslyPasteHTML(savedSelection, fileIconHtml, Quill.sources.USER);

                    setupFileDownloadLink(fileUrl, file.name);

                    setTimeout(() => {
                        // 현재 라인의 다음 라인으로 커서를 이동
                        const [line, offset] = quill.getLine(currentSelection);

                        if (line) {
                            const nextLineIndex = quill.getIndex(line) + line.length();

                            // 줄 바꿈을 추가하여 새로운 블록 요소 생성
                            quill.insertText(nextLineIndex, "\n", Quill.sources.USER);

                            // 새로운 블록 요소로 커서를 이동
                            quill.setSelection(nextLineIndex + 1, Quill.sources.SILENT);
                        }
                    }, 100); // 100ms 지연 후 실행
                } else if (type === "video") {
                    // 나중에 추가 예정
                }

                if (fileRef && fileRef.current) {
                    fileRef.current.push({
                        fileName: file.name,
                        fileType: file.type,
                        fileUrl,
                        fileSize: file.size,
                    });

                    console.log("updatedImagedadasdUrlsRef >>>", fileRef.current);
                }
            }
        };

        const setupFileDownloadLink = (fileUrl: string, fileName: string): void => {
            const quillEditor = document.querySelector(".ql-editor");
            const anchorTag = quillEditor?.querySelector(`a[href="${fileUrl}"]`) as HTMLAnchorElement;

            if (anchorTag) {
                anchorTag.setAttribute("href", fileUrl); // 올바른 href 값으로 교체
                anchorTag.setAttribute("data-file", "");
                anchorTag.classList.add("file-container__item");


                const parentElement = anchorTag.parentElement;
                if (parentElement && parentElement.tagName.toLowerCase() === "p") {

                    parentElement.classList.add("file-container"); // .file-container 클래스 추가

                }

                const hideTooltip = () => {
                    const qlToolTip = document.querySelector(".ql-tooltip") as HTMLDivElement;
                    if (qlToolTip) {
                        qlToolTip.style.display = "none"; // 툴팁 숨김
                    }
                };

                anchorTag.addEventListener("click", (event: MouseEvent) => {
                    event.preventDefault();
                    hideTooltip();

                    fetch(fileUrl)
                        .then((response) => response.blob())
                        .then((blob) => {
                            const blobUrl = window.URL.createObjectURL(blob); // Object URL 생성

                            const link = document.createElement("a");
                            link.href = blobUrl;
                            // 한글 깨지는 현상 해결. URL 인코딩된 파일명을 올바른 한글 텍스트로 변환한다.
                            link.download = decodeURIComponent(fileName);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            window.URL.revokeObjectURL(blobUrl); // Object URL 해제
                        })
                        .catch(console.error);
                });

                // 우클릭 시 툴팁 숨김
                parentElement?.addEventListener("contextmenu", hideTooltip);
            }
        };

        // handleAlign 함수 이미지를 클릭했을때 오버레이가 선택되면서, 이후에 툴바의 정렬 기능이 제대로 작동되게 하기 위함.
        // react quill의 정렬 툴바에서 왼쪽 정렬은 false값으로 설정해놨기 때문에 아래와 같이 추가적으로 처리함.
        const handleAlign = (value: false | "left" | "center" | "right") => {
            console.log("실행요");

            const image = selectedImageRef.current; // 최신 이미지 참조
            const overlay = overlayRef.current; // 최신 오버레이 참조

            let alignmentValue = value;

            if (alignmentValue === false) {
                alignmentValue = "left";
            }

            if (image && overlay) {
                // 정렬 상태 저장
                alignmentRef.current = alignmentValue;
                image.setAttribute("data-alignment", alignmentValue);

                // 정렬에 따라 이미지의 margin을 설정
                if (value === "center") {
                    image.style.marginLeft = "auto";
                    image.style.marginRight = "auto";
                } else if (value === "right") {
                    image.style.marginLeft = "auto";
                    image.style.marginRight = "0";
                } else if (value === "left") {
                    image.style.marginLeft = "0";
                    image.style.marginRight = "auto";
                } else {
                    image.style.margin = "0";
                }

                // 이미지의 위치에 맞춰 오버레이 위치 업데이트
                const updateOverlayPosition = () => {
                    // 정렬 하는 순간(왼쪽, 가운데, 오른쪽)에 이미지의 Rect 값을 구해야함. imgRect.current로 구하면 이미지 클릭 그 시점으로만 가져옴.
                    const imgRect = image.getBoundingClientRect();

                    if (imgRect) {
                        const parentContainer = document.querySelector(".ql-custom-container") as HTMLDivElement;
                        const parentRect = parentContainer?.getBoundingClientRect();

                        if (overlay && parentRect) {
                            // 이미지가 컨테이너의 오른쪽을 넘지 않도록 제한

                            overlay.style.width = `${imgRect.width}px`;
                            overlay.style.height = `${imgRect.height}px`;

                            overlay.style.left = `${imgRect.left - parentRect.left + parentContainer.scrollLeft}px`;
                            overlay.style.top = `${imgRect.top - parentRect.top + parentContainer.scrollTop}px`;
                        }

                        // 핸들러 리사이즈 기능 호출. 정렬 이후 핸들러를 사용하기 위해 필요
                        handleResizeFunction(imgRect);
                    }
                };
                // requestAnimationFrame을 사용하여 위치 업데이트를 스무스하게 적용
                requestAnimationFrame(updateOverlayPosition);
            }
        };

        const toolbarConfig = [
            [{ header: [1, 2, 3, 4, false] }],
            [{ font: [] }],
            [{ size: ["small", "large", "huge", false] }],
            [{ align: [] }],
            ["link", "image", "code-block"],
            [{ color: [] }, { background: [] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            ["clean"],
        ];

        // 여기서 useMemo를 하거나 toggleDropdown 부분에 useCallback을 해야함 아니면 handleFileSelection 함수에 까지.
        const modules = useMemo(
            () => ({
                toolbar: {
                    container: toolbarConfig,
                    handlers: {
                        image: toggleDropdown,
                        align: (value: false | "left" | "center" | "right") => {
                            const quill = quillRef.current?.getEditor();
                            if (quill) {
                                const range = quill.getSelection();
                                if (range) {
                                    const [blot] = quill.getLeaf(range.index);
                                    // 현재 선택된 블롯이 이미지인 경우 handleAlign() 호출
                                    if (blot && blot.domNode && (blot.domNode as HTMLElement).tagName === "IMG") {
                                        handleAlign(value);
                                    } else {
                                        // 그렇지 않은 경우에 quill의 기본 정렬 기능 호출
                                        quill.format("align", value);
                                    }
                                }
                            }
                        },
                    },
                },
            }),
            []
        );

        // const formats = [
        //     'header', 'font', 'size', 'align',
        //     'bold', 'italic', 'underline', 'strike', 'blockquote',
        //     'list', 'bullet', 'indent',
        //     'link', 'image', 'video', 'color', 'background'
        // ];

        const DropdownMenu: React.FC<DropdownMenuProps> = ({ dropdownPosition, handleFileSelection, dropdownRef }) => (
            <div
                ref={dropdownRef}
                className='absolute z-10 bg-white border border-gray-300 shadow-md'
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                }}
            >
                <ul>
                    <li className='py-2 px-4 hover:bg-gray-100 cursor-pointer' onClick={() => handleFileSelection("image")}>
                        <FontAwesomeIcon className='inline-block w-4 h-4 mr-2' icon={faImage} style={{ color: "#a3a3a3" }} />
                        사진
                    </li>
                    <li className='py-2 px-4 hover:bg-gray-100 cursor-pointer' onClick={() => handleFileSelection("file")}>
                        <FontAwesomeIcon className='inline-block w-4 h-4 mr-2' icon={faFile} style={{ color: "#a3a3a3" }} />
                        파일
                    </li>
                    <li className='py-2 px-4 hover:bg-gray-100 cursor-pointer' onClick={() => handleFileSelection("video")}>
                        <FontAwesomeIcon className='inline-block w-4 h-4 mr-2' icon={faVideo} style={{ color: "#a3a3a3" }} />
                        동영상
                    </li>
                </ul>
            </div>
        );

        return (
            <>
                {/* 오버레이  */}


                <figure ref={overlayRef} className='absolute border-2 border-black/50 pointer-events-auto z-10 hidden'>
                    {/* 네 구석에 있는 리사이즈 핸들러 */}
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full top-[-5px] left-[-5px] top-left cursor-nwse-resize pointer-events-auto' />
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full top-[-5px] right-[-5px] top-right cursor-nesw-resize pointer-events-auto' />
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full bottom-[-5px] left-[-5px] bottom-left cursor-nesw-resize pointer-events-auto' />
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full bottom-[-5px] right-[-5px] bottom-right cursor-nwse-resize pointer-events-auto' />

                    {/* 정렬 버튼들 */}
                    <div className='absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-md flex space-x-2 p-2 rounded-md'>
                        <button onClick={() => handleAlign("left")}>
                            <FontAwesomeIcon icon={faAlignLeft} />
                        </button>
                        <button onClick={() => handleAlign("center")}>
                            <FontAwesomeIcon icon={faAlignCenter} />
                        </button>
                        <button onClick={() => handleAlign("right")}>
                            <FontAwesomeIcon icon={faAlignRight} />
                        </button>
                    </div>

                    {/* 이미지 설명 입력 필드 */}
                    <figcaption className='absolute w-full text-center bottom-[-2.2rem]'>
                        <input type='text' className='w-full text-center outline-none' placeholder='이미지를 설명해 보세요' />
                    </figcaption>
                </figure>

                {/* 여기까지 오버레이  */}



                <ReactQuillDynamic
                    forwardedRef={quillRef}
                    value={value}
                    theme='snow'
                    modules={modules}
                    // formats={formats}
                />
                {/* <ReactQuill value={value} onChange={handleChange} theme='bubble' /> */}
                {/* 드롭다운 메뉴 */}
                {<DropdownMenu dropdownPosition={dropdownPosition} handleFileSelection={handleFileSelection} dropdownRef={dropdownRef} />}
            </>
        );
    })
);
