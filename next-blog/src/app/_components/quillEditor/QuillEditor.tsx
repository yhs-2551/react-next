// BlogForm에 "use client"가 명시되어 있기 때문에, 즉 부모 컴포넌트에 "use client"가 명시되어 있다면, 해당 부모 컴포넌트에 포함된 모든 자식 컴포넌트는 자동으로 클라이언트 컴포넌트로 간주.

import React, { useCallback, useEffect, useMemo, useRef } from "react";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { toast } from "react-toastify";

// import { faFile, faImage, faVideo, faAlignCenter, faAlignLeft, faAlignRight } from "@fortawesome/free-solid-svg-icons";

import DOMPurify from "dompurify";

import "react-quill-new/dist/quill.snow.css"; // Snow 테마 CSS 파일

import "./QuillEditor.css";

import ReactQuill from "react-quill-new";

import Quill, { Range } from "quill";
import { FileMetadata } from "@/types/PostTypes";
import { uploadFile } from "@/utils/uploadFile";
import { useParams } from "next/navigation";

import { IoMdImages } from "react-icons/io";
import { FaRegFileAlt } from "react-icons/fa";

import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight } from "react-icons/md";

interface QuillEditorProps {
    contentValue: string | undefined;
    fileRef: React.MutableRefObject<FileMetadata[]>;
    totalUploadedImagesUrlRef: React.MutableRefObject<string[]>;
    deletedImageUrlsInFutureRef: React.MutableRefObject<string[]>;
    getEditorContent: (getContent: () => string) => void;
    fetchFileFromServer?: FileMetadata[];
}

interface DropdownMenuProps {
    dropdownPosition: {
        top: number;
        left: number;
    };

    handleFileSelection: (type: string) => void;

    dropdownRef: React.Ref<HTMLDivElement>;
}

// hljs.configure({
//     languages: ["javascript", "ruby", "python", "java", "cpp", "kotlin", "sql"],
//   });

//React.memo를 통해 부모 컴포넌트가 재렌더링 되어도 자식 컴포넌트의 props값이 변하지 않으면 QuillEditor의 재렌더링을 막는다. 따라서 BlogForm에서 제목의 내용을 변경해도 QuillEditor에는 제목 관련 Props가 없기 때문에 재렌더링 되지 않는다.
export default React.memo(
    React.forwardRef<ReactQuill, QuillEditorProps>(function QuillEditor(
        { contentValue, fileRef, totalUploadedImagesUrlRef, deletedImageUrlsInFutureRef, getEditorContent, fetchFileFromServer },
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

        let resizeMouseDownCleanUp: (() => void) | undefined; // 클린업 함수 저장을 위함

        const params = useParams();
        const blogId = params.blogId as string;

        // quill 에디터의 content를 관리하는 함수. getEditorContent 함수를 실행하면 getEditorContent 함수의 인자로 있는 함수를  BlogForm 컴포넌트에서 quillContentRef.current에 저장한다.
        useEffect(() => {
            const quill = quillRef.current?.getEditor();

            if (quill) {
                getEditorContent(() => {
                    const html = quill.root.innerHTML;
                    return DOMPurify.sanitize(html);
                });
            }
        }, [getEditorContent]);

        // qi editor 내부에서 이미지 삭제 시 서버에 요청할 이미지 목록 관리
        useEffect(() => {
            const quill = quillRef.current?.getEditor();

            if (quill) {
                // 에디터 내 삭제를 감지하여 최종적으로 서버측에 요청될 이미지 및 파일 관리, 및 AWS3에 임시 저장된 불필요한 이미지 및 파일 삭제 관리 로직
                quill.on("text-change", (delta, oldDelta, source) => {
                    console.log("oldDelta>>", oldDelta);
                    console.log("delta", delta);

                    if (source === "user") {
                        delta.ops.forEach((op, index) => {
                            if (!op.delete) return;

                            const images = quill.root.querySelectorAll("img");
                            const links = quill.root.querySelectorAll("a[data-file]");
                            const currentImageUrls = new Set<string>();

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

                            const currentImageUrlsArr = totalUploadedImagesUrlRef.current.filter((totalUploadedImagesUrl) =>
                                currentImageUrls.has(totalUploadedImagesUrl)
                            );

                            // 글 작성 중 삭제된 이미지 목록
                            if (currentImageUrlsArr.length !== totalUploadedImagesUrlRef.current.length && fileRef && fileRef.current) {
                                // 최종 발행 시 적용할 이미지 목록
                                fileRef.current = fileRef.current.filter((fileMetadata) => currentImageUrlsArr.includes(fileMetadata.fileUrl));

                                // 최종 발행 시 클라우드 저장소에서 추가적으로 삭제할 이미지 목록
                                // 초기에 이미지 or 파일을 삭제하고 다시 이미지나 파일을 삽입 후 백스페이 or delete 즉 에디터내에서 삭제 작업을 하면 이전에 삭제된 이미지/파일이 중복으로 들어감
                                // 따라서 Set으로 중복을 제거.
                                deletedImageUrlsInFutureRef.current = [
                                    ...Array.from(
                                        new Set([
                                            ...deletedImageUrlsInFutureRef.current,
                                            ...totalUploadedImagesUrlRef.current.filter(
                                                (totalUploadedImagesUrl) => !currentImageUrls.has(totalUploadedImagesUrl)
                                            ),
                                        ])
                                    ),
                                ];
                            }
                        });
                    }
                });
            }
        }, []);

        // 캡쳐 이미지 붙여넣었을때 처리
        useEffect(() => {
            // 최종적으로 클라우드 스토리지에 저장 후, 해당 url을 받아와서 에디터에 붙여넣는 함수
            const handleImagePaste: (quill: Quill, file: File) => Promise<void> = async (quill: Quill, file: File) => {
                // 이미지 파일을 서버에 업로드
                const fileUrl = await uploadFile(file, blogId);

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

                        // 이미지 삽입 후 다음 줄로 건너뛰는 로직
                        setTimeout(() => {
                            quill.insertText(range.index + 1, "\n", Quill.sources.USER);
                            quill.setSelection(range.index + 2, Quill.sources.SILENT);
                        }, 100);
                    }
                }

                // 서버로 캡쳐된 이미지의 width, height값을 같이 전송해주기 위한 코드, Next.js 최적화 이미지를 사용하기 위해 쓴다.
                const imgElement = document.querySelector(`img[src="${fileUrl}"]`) as HTMLImageElement;
                if (imgElement) {
                    const { width, height } = imgElement.getBoundingClientRect();
                    const roundedWidth = Math.round(width);
                    const roundedHeight = Math.round(height);

                    console.log("imgElement >>>", imgElement);

                    // fileRef.current에서 해당 url과 일치하는 객체를 찾아 width와 height 값을 추가
                    const file = fileRef.current.find((file) => file.fileUrl === fileUrl);
                    if (file) {
                        file.width = roundedWidth;
                        file.height = roundedHeight;
                        console.log("file >>>>>", file);
                    }
                }
            };

            // 클립보드에서 붙여넣기된 이미지를 파일 형식으로 변환 처리하는 함수
            const handlePaste = (e: ClipboardEvent) => {
                const quill = quillRef.current?.getEditor();

                const clipboardData = e.clipboardData;

                if (clipboardData && quill) {
                    // 붙여넣기 데이터 중 이미지가 있는지 확인
                    const pastedData = clipboardData.items;

                    for (let i = 0; i < pastedData.length; i++) {
                        const item = pastedData[i];

                        if (item.type.startsWith("image/")) {
                            //DataTransferItem 형식을 파일로 변환 처리
                            const file: File | null = item.getAsFile();

                            if (file) {
                                // 붙여넣은 이미지를 파일로 변환 후 최종적으로 에디터에 붙여넣기
                                handleImagePaste(quill, file);
                            }
                            break;
                        }
                    }
                }
            };

            // Quill Editor 초기화되면 클립보드 붙여넣기 이벤트 리스너 등록 및 툴바 헤더로 이동 로직.
            const initializeQuill: () => Quill | undefined = (): Quill | undefined => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    if (contentValue) {
                        console.log("contenvalue>>>", contentValue);

                        // 비제어 방식으로 ql-editor DOM에 직접 삽입
                        quill.root.innerHTML = contentValue;

                        console.log("quill root >>>", quill.root);
                    }

                    quill.root.addEventListener("paste", handlePaste);

                    const toolbarElement = document.querySelector(".ql-toolbar") as HTMLDivElement;
                    const customContainer = document.querySelector(".ql-toolbar-container") as HTMLDivElement;

                    if (toolbarElement && customContainer) {
                        customContainer.appendChild(toolbarElement);
                        toolbarElement.classList.add("visible");
                    }

                    // 수정 페이지에서 기존에 파일 데이터를 최종적으로 서버로 보낼 fileRef에 담아주기 위한 로직
                    if (fetchFileFromServer && fetchFileFromServer.length > 0) {
                        fileRef.current = fetchFileFromServer;
                        totalUploadedImagesUrlRef.current = fetchFileFromServer.map((file) => file.fileUrl);

                        console.log("fileRef >>>", fileRef.current);
                        console.log("totalUploadedImagesUrlRef >>>", totalUploadedImagesUrlRef.current);
                    }

                    return quill;
                }
            };

            const quill = initializeQuill();

            return () => {
                if (quill) {
                    quill.root.removeEventListener("paste", handlePaste);
                }
            };
        }, []);

        // ============ 여기 까지가 캡쳐 ========

        // ================== 이미지 사이즈 조절 로직 시작 =======================

        // 오버레이 드래그 진행 시 가로세로 비율 유지하면서 조정
        const handleResizeFunction = (initialImgRect?: DOMRect | null) => {
            // Utility functions
            const calculateNewDimensions = (
                event: MouseEvent,
                startX: number,
                startWidth: number,
                aspectRatio: number,
                handlerType: string
            ): { newWidth: number; newHeight: number } => {
                const deltaX = handlerType.includes("left") ? -1 : 1;
                const newWidth = startWidth + deltaX * (event.clientX - startX);
                return { newWidth, newHeight: newWidth / aspectRatio };
            };

            const constrainDimensions = (
                dimensions: { newWidth: number; newHeight: number },
                containerRect: DOMRect,
                alignment: string | null | false
            ) => {
                const { newWidth, newHeight } = dimensions;
                if (!selectedImageRef.current) return dimensions;

                if (alignment === "left") {
                    const maxWidth = containerRect.width - selectedImageRef.current.offsetLeft - 8;
                    return {
                        newWidth: Math.min(newWidth, maxWidth),
                        newHeight: Math.min(newHeight, maxWidth / (newWidth / newHeight)),
                    };
                } else if (alignment === "center") {
                    const maxWidth = containerRect.width - 16;
                    return {
                        newWidth: Math.min(newWidth, maxWidth),
                        newHeight: Math.min(newHeight, maxWidth / (newWidth / newHeight)),
                    };
                } else if (alignment === "right") {
                    const imageRightEdge = selectedImageRef.current.offsetLeft + selectedImageRef.current.offsetWidth;
                    return {
                        newWidth: Math.min(newWidth, imageRightEdge - 8),
                        newHeight: Math.min(newHeight, imageRightEdge / (newWidth / newHeight)),
                    };
                }
                return dimensions;
            };

            const updateOverlayAndImage = (dimensions: { newWidth: number; newHeight: number }, containerRect: DOMRect) => {
                const { newWidth, newHeight } = dimensions;
                if (newWidth <= 100 || newHeight <= 100) return;

                const overlay = overlayRef.current;
                if (!overlay || !selectedImageRef.current) return;

                overlay.style.width = `${newWidth}px`;
                overlay.style.height = `${newHeight}px`;

                // Update position based on alignment
                if (alignmentRef.current === "center") {
                    const centerOffset = (containerRect.width - newWidth) / 2;
                    overlay.style.left = `${centerOffset}px`;
                    selectedImageRef.current.style.left = `${centerOffset}px`;
                } else if (alignmentRef.current === "right") {
                    const rightEdge = containerRect.width - newWidth - 8;
                    overlay.style.left = `${rightEdge}px`;
                    selectedImageRef.current.style.left = `${rightEdge}px`;
                } else {
                    overlay.style.left = `${selectedImageRef.current.offsetLeft}px`;
                }

                selectedImageRef.current.style.width = `${newWidth}px`;
                selectedImageRef.current.style.height = `${newHeight}px`;
            };

            const createResizeHandler = (handlerType: string) => {
                return (event: MouseEvent) => {
                    if (!initialImgRect || !selectedImageRef.current) return;

                    const startX = event.clientX;
                    const startWidth = initialImgRect.width;
                    const aspectRatio = initialImgRect.width / initialImgRect.height;
                    let animationFrameId: number;

                    const handleResizeMove = (moveEvent: MouseEvent) => {
                        if (!selectedImageRef.current) return;
                        selectedImageRef.current.style.opacity = "0.5";

                        const container = document.querySelector(".ql-custom-container");
                        const containerRect = container?.getBoundingClientRect();
                        if (!containerRect) return;

                        const dimensions = calculateNewDimensions(moveEvent, startX, startWidth, aspectRatio, handlerType);
                        const constrainedDimensions = constrainDimensions(dimensions, containerRect, alignmentRef.current);

                        animationFrameId = requestAnimationFrame(() => {
                            updateOverlayAndImage(constrainedDimensions, containerRect);
                        });
                    };

                    const handleResizeEnd = () => {
                        cancelAnimationFrame(animationFrameId);
                        if (selectedImageRef.current) {
                            selectedImageRef.current.style.opacity = "1";
                            const newRect = selectedImageRef.current.getBoundingClientRect();
                            updateFileMetadata(newRect);
                        }
                        window.removeEventListener("mousemove", handleResizeMove);
                        window.removeEventListener("mouseup", handleResizeEnd);
                    };

                    window.addEventListener("mousemove", handleResizeMove);
                    window.addEventListener("mouseup", handleResizeEnd);
                };
            };

            const updateFileMetadata = (newRect: DOMRect) => {
                if (!selectedImageRef.current) return;
                const file = fileRef.current.find((file) => file.fileUrl === selectedImageRef.current?.src);
                if (file) {
                    file.width = Math.round(newRect.width);
                    file.height = Math.round(newRect.height);
                }
            };

            // Set up handlers
            const handlers = ["bottom-right", "bottom-left", "top-left", "top-right"];
            const cleanup: (() => void)[] = [];

            handlers.forEach((handlerType) => {
                const handler = overlayRef.current?.querySelector(`.${handlerType}`) as HTMLDivElement;
                if (handler) {
                    const resizeHandler = createResizeHandler(handlerType);
                    handler.addEventListener("mousedown", resizeHandler);
                    cleanup.push(() => handler.removeEventListener("mousedown", resizeHandler));
                }
            });

            resizeMouseDownCleanUp = () => cleanup.forEach((fn) => fn());
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

                    // 오버레이의 각 모서리 크기 조정하는 부분 mousedown 이벤트 제거.(클린업 함수 실행)
                    resizeMouseDownCleanUp?.();

                    const parentContainer: HTMLElement | null = selectedImageRef.current.parentElement;

                    if (parentContainer) {
                        parentContainer.style.marginBottom = "0"; // 오버레이 삭제 시 추가한 마진 초기화
                    }
                }
            }
        };

        // 오버레이 바깥쪽 클릭했을 때 오버레이 display none처리(오버레이를 안보이게) 이벤트를 등록하기 위한 함수
        const activateOverlayOutsideClickHandler = () => {
            document.addEventListener("mousedown", handleOverlayOutsideClick);

            if (overlayRef.current) {
                overlayRef.current.addEventListener("mousedown", handleOverlayClick);
            }
        };

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
                    handleResizeFunction(imgRect);
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

        // =========== 아래 useEffect에서 handleImageClick이벤트 등록=============

        // 에디터 내에서 이미지를 클릭할 때 오버레이 표시(handleImageClick 핸들러 등록) 및 delete키를 눌렀을 때 이미지 삭제 로직.
        useEffect(() => {
            let observer: MutationObserver | null = null;

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Delete" && selectedImageRef.current) {
                    const img: HTMLImageElement = selectedImageRef.current;
                    const parentElement = img.parentElement;

                    const figure = document.querySelector("figure");

                    // 이미지와 부모 요소 처리
                    img.remove();
                    if (parentElement) {
                        // 부모가 p태그이고 내용이 비었거나 줄바꿈만 있는 경우. 부모 삭제
                        if (
                            parentElement.tagName.toLowerCase() === "p" &&
                            (!parentElement.textContent?.trim() || parentElement.innerHTML === "<br>")
                        ) {
                            parentElement.remove();
                        }
                        // 남아있는 마진 바텀 초기화
                        parentElement.style.marginBottom = "0";
                    }

                    selectedImageRef.current = null;
                    if (figure) {
                        figure.style.display = "none"; // figure.remove()를 하면 DOM에서도 아예 삭제되어서 안된다.
                    }
                }
            };

            const quill = quillRef.current?.getEditor();
            if (quill) {
                // quillEditor가 준비되면 클릭 이벤트 리스너 추가
                const addImageClickListener = (img: HTMLImageElement) => {
                    img.removeEventListener("click", handleImageClick); // 중복 방지
                    img.addEventListener("click", handleImageClick); // 이미지에 클릭 이벤트 추가
                };

                // 수정 페이지에서 이미 존재하는 모든 이미지에 이벤트 리스너 등록
                const initialImages = quill.root.querySelectorAll("img");

                if (initialImages.length > 0) {
                    initialImages.forEach((img) => addImageClickListener(img as HTMLImageElement));
                }

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

                quill.root.addEventListener("keydown", handleKeyDown);

                // 컴포넌트 언마운트 시 이벤트 리스너 제거
            }

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

        // handleAlign 함수 이미지를 클릭했을때 오버레이가 선택되면서, 이후에 툴바의 정렬 기능이 제대로 작동되게 하기 위함.
        // react quill의 정렬 툴바에서 왼쪽 정렬은 false값으로 설정해놨기 때문에 아래와 같이 추가적으로 처리함.
        const handleAlign = (value: "left" | "center" | "right") => {
            console.log("실행요", value);

            const image = selectedImageRef.current; // 최신 이미지 참조
            const overlay = overlayRef.current; // 최신 오버레이 참조

            let alignmentValue = value;

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

        // ================== 여기까지가 이미지 사이즈 조정 및 정렬 로직 끝.  ===========================

        // 아래는 툴바 이미지 클릭 후, 이미지/파일/비디오 중 특정 파일을 선택하고 에디터에 삽입하는 로직

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

        const setupFileDownloadLink = (fileUrl: string, fileName: string): void => {
            const quillEditor = document.querySelector(".ql-editor");
            const anchorTag = quillEditor?.querySelector(`a[href="${fileUrl}"]`) as HTMLAnchorElement;

            if (anchorTag) {
                anchorTag.classList.add("ql-file");

                // 우클릭 시 툴바 보이는 것 방지
                anchorTag.addEventListener("contextmenu", (event: MouseEvent) => {
                    const tooltip = document.querySelector(".ql-tooltip");
                    if (tooltip) {
                        tooltip.classList.add("ql-hidden");
                    }
                });

                // 임시 다운 로드 링크 생성
                anchorTag.addEventListener("click", (event: MouseEvent) => {
                    event.preventDefault();

                    const tooltip = document.querySelector(".ql-tooltip");

                    console.log("tooltip >>>", tooltip);

                    if (tooltip) {
                        tooltip.classList.add("ql-hidden"); // quill editor 자체적으로 갖고있는 ql-hidden
                    }

                    fetch(fileUrl)
                        .then((response) => response.blob())
                        .then((blob) => {
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = decodeURIComponent(fileName);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                        })
                        .catch(console.error);
                });
            }
        };

        const insertFileToEditor = (file: File, fileUrl: string, type: string): void => {
            const quill = quillRef.current?.getEditor();

            // saveSeleciton이 0인 경우 falsy 값이기 때문에 savedSelection으로 조건을 안잡고 아래 처럼 savedSelection != undefined로 조건을 잡음
            if (quill && fileUrl && savedSelection !== null && savedSelection !== undefined) {
                const currentSelection = savedSelection; // 로컬 변수에 저장

                if (type === "image") {
                    quill.insertEmbed(currentSelection, "image", fileUrl, Quill.sources.USER); // 이미지 삽입

                    setTimeout(() => {
                        quill.insertText(currentSelection + 1, "\n", Quill.sources.USER);
                        quill.setSelection(currentSelection + 2, Quill.sources.SILENT);
                    }, 100); // 100ms 지연 후 실행

                    // 삽입한 이미지의 width, height값을 fileRef에 저장시켜 서버로 전송시키기 위함. 이미지 삽입 후 이미지 크기 조정 안하면 이 사이즈를 서버에서 저장.
                    const fileMetadata: { fileName: string; fileType: string; fileUrl: string; fileSize: number; width: number; height: number } = {
                        fileName: "",
                        fileType: "",
                        fileUrl: "",
                        fileSize: 0,
                        width: 0,
                        height: 0,
                    };

                    const imgEl = quill.root.querySelector(`img[src="${fileUrl}"]`) as HTMLImageElement;

                    console.log("ImgEl >>>", imgEl);

                    if (imgEl) {
                        // 이미지가 완전히 로드 되어야만 getBoundingClientRect에서 width, height값을 가져올 수 있음. 로드 전에 가져오면 0으로 나옴.
                        imgEl.onload = () => {
                            const imgRect = imgEl.getBoundingClientRect() as DOMRect;

                            fileMetadata["fileName"] = file.name;
                            fileMetadata["fileType"] = file.type;
                            fileMetadata["fileUrl"] = fileUrl;
                            fileMetadata["fileSize"] = file.size;
                            fileMetadata["width"] = imgRect.width;
                            fileMetadata["height"] = imgRect.height;

                            if (fileRef && fileRef.current) {
                                fileRef.current.push(fileMetadata);
                            }
                        };
                    }
                } else if (type === "file") {
                    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);

                    const fileIconHtml = `<a href="${fileUrl}" data-file="true">${file.name} - ${fileSizeInMB}MB (클릭하여 다운로드)</a>`;

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
                    }, 0); // 콜백을 이벤트 루프의 태스크 큐에 추가 후 현재 실행 스택이 비워진 후 실행. 즉 비동기
                    

                    if (fileRef && fileRef.current) {
                        fileRef.current.push({
                            fileName: file.name,
                            fileType: file.type,
                            fileUrl,
                            fileSize: file.size,
                        });
                    }
                } else if (type === "video") {
                    // 나중에 추가 예정
                }
            }
        };

        // 툴바에서 이미지/파일/비디오 버튼 클릭 시 파일 선택 창 열기 로직
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
                    const fileUrl = await uploadFile(file, blogId);

                    const currentUploadedImages: string[] = totalUploadedImagesUrlRef.current;
                    totalUploadedImagesUrlRef.current = [...currentUploadedImages, fileUrl];

                    insertFileToEditor(file, fileUrl, type);
                }
            };
        }, []);

        // 아래는 툴바 이미지 클릭했을때 관련 로직
        // 툴바의 이미지 버튼 클릭 시 드롭다운 표시 및 위치 설정 로직

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

        // 드랍다운 외부 클릭했을 때 드랍다운 display none 시키는 로직
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
                        align: (value: "left" | "center" | "right") => {
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
                syntax: true,
                clipboard: {
                    matchVisual: false, // 클립보드에서 텍스트 붙여넣기 시 원본 스타일을 무시하고 에디터 스타일을 적용
                },
            }),
            []
        );

        const DropdownMenu: React.FC<DropdownMenuProps> = ({ dropdownPosition, handleFileSelection, dropdownRef }) => (
            <div
                ref={dropdownRef}
                className='absolute bg-white border border-gray-300 shadow-md'
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                }}
            >
                <ul>
                    <li className='py-2 px-4 hover:bg-gray-100 cursor-pointer' onClick={() => handleFileSelection("image")}>
                        <IoMdImages className='inline-block w-4 h-4 mr-2 text-gray-400' />
                        사진
                    </li>
                    <li className='py-2 px-4 hover:bg-gray-100 cursor-pointer' onClick={() => handleFileSelection("file")}>
                        <FaRegFileAlt className='inline-block w-4 h-4 mr-2 text-gray-400' />
                        파일
                    </li>
                    {/* <li className='py-2 px-4 hover:bg-gray-100 cursor-pointer' onClick={() => handleFileSelection("video")}>
                        <MdVideoLibrary className='inline-block w-4 h-4 mr-2 text-gray-400' />
                        동영상
                    </li> */}
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
                            <MdFormatAlignLeft />
                            {/* <FontAwesomeIcon icon={faAlignLeft} /> */}
                        </button>
                        <button onClick={() => handleAlign("center")}>
                            <MdFormatAlignCenter />
                            {/* <FontAwesomeIcon icon={faAlignCenter} /> */}
                        </button>
                        <button onClick={() => handleAlign("right")}>
                            <MdFormatAlignRight />
                            {/* <FontAwesomeIcon icon={faAlignRight} /> */}
                        </button>
                    </div>

                    {/* 이미지 설명 입력 필드 */}
                    <figcaption className='absolute w-full text-center bottom-[-2.2rem]'>
                        <input type='text' className='w-full text-center outline-none' placeholder='이미지를 설명해 보세요' />
                    </figcaption>
                </figure>

                {/* 여기까지 오버레이  */}

                <ReactQuill ref={quillRef} theme='snow' modules={modules} />

                {/* 드롭다운 메뉴 */}

                {<DropdownMenu dropdownPosition={dropdownPosition} handleFileSelection={handleFileSelection} dropdownRef={dropdownRef} />}
            </>
        );
    })
);
