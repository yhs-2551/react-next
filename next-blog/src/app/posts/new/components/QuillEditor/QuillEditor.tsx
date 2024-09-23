import "@/app/posts/new/components/QuillEditor/QuillEditor.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faImage, faVideo } from "@fortawesome/free-solid-svg-icons";

import dynamic from "next/dynamic";
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import DOMPurify from "dompurify";

// import "react-quill/dist/quill.bubble.css"; // Bubble 테마의 CSS 파일

import "react-quill/dist/quill.snow.css"; // Snow 테마 CSS 파일

import type ReactQuill from "react-quill";
import Quill from "quill";

// import { ImageActions } from "@xeger/quill-image-actions";
// import { ImageFormats } from "@xeger/quill-image-formats";

import { ReactQuillProps } from "react-quill";

// import { Quill } from "react-quill";

interface ForwardedQuillComponent extends ReactQuillProps {
    forwardedRef: React.Ref<ReactQuill>;
}

// Quill.register("modules/imageActions", ImageActions);
// Quill.register("modules/imageFormats", ImageFormats);

const ReactQuillDynamic = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill");
        return ({ forwardedRef, ...props }: ForwardedQuillComponent) => (
            <RQ ref={forwardedRef} {...props} />
        );
    },
    {
        ssr: false,
    }
);

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

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
        { value, onChange },
        ref
    ) {
        useEffect(() => {
            const toolbarElement = document.querySelector(".ql-toolbar");

            // 툴바가 DOM에 있는지 확인하고, 없다면 생성 후 header에 추가
            if (!toolbarElement) {
                const toolbar = document.createElement("div");
                toolbar.className = "ql-toolbar ql-snow";
                document.querySelector("header")?.appendChild(toolbar);

                // 커스텀 툴바 설정
                const toolbarConfig = [
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    ["bold", "italic", "underline"],
                    [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                        { indent: "+1" },
                    ],
                    ["link", "image"],
                    [{ align: [] }],
                    [{ color: [] }, { background: [] }],
                    ["clean"],
                ];

                // 툴바 HTML 동적 생성
                const createToolbarHTML = (config: any) => {
                    return config
                        .map((group: any) => {
                            if (Array.isArray(group)) {
                                return group
                                    .map((item) => {
                                        if (typeof item === "object") {
                                            if (item.header) {
                                                return `
                      <select class="ql-header">
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                        <option value="5">Heading 5</option>
                        <option value="6">Heading 6</option>
                        <option value="">Normal</option>
                      </select>`;
                                            } else if (item.list) {
                                                return `<button class="ql-list" value="${item.list}"></button>`;
                                            } else if (item.indent) {
                                                return `<button class="ql-indent" value="${item.indent}"></button>`;
                                            } else if (item.align) {
                                                return `<button class="ql-align"></button>`;
                                            }
                                        } else {
                                            return `<button class="ql-${item}"></button>`;
                                        }
                                    })
                                    .join("");
                            }
                            return "";
                        })
                        .join("");
                };

                // 툴바에 생성된 HTML 삽입
                toolbar.innerHTML = createToolbarHTML(toolbarConfig);
            }

            const quill = quillRef.current?.getEditor();
            if (quill) {
                const toolbarModule = quill.getModule("toolbar") as {
                    container: any;
                }; // 타입 단언
                if (toolbarModule) {
                    toolbarModule.container = toolbarElement || ".ql-toolbar"; // 커스텀 툴바 할당
                }
            }
        }, []);
        const quillRef = useRef<ReactQuill | null>(null); // ReactQuill에 대한 참조로 타입 지정

        const dropdownRef = useRef<HTMLDivElement | null>(null);
        const [isDropdownVisible, setDropdownVisible] =
            useState<boolean>(false);

        const [dropdownPosition, setDropdownPosition] = useState<{
            top: number;
            left: number;
        }>({ top: -9999, left: -9999 });

        const overlayRef = useRef<HTMLElement | null>(null); // 오버레이 참조
        const [selectedImage, setSelectedImage] =
            useState<HTMLImageElement | null>(null);

        // 이미지 클릭 전 커서의 위치 저장을 위한 변수
        const [beforeImageClickSelection, setBeforeImageClickSelection] =
            useState<number | undefined>(undefined);

        let savedSelection: number | undefined = undefined; // 사용자가 토글 누르기 전 커서 위치 저장을 위한 변수. state로 할 시 비동기로 예상치 못한 결과를 가져와서 일반 변수로 선언.

        // 캡쳐 이미지 붙여넣었을때 처리
        useEffect(() => {
            const addPasteEventListener = (quill: Quill) => {
                const handlePaste = (e: ClipboardEvent) => {
                    console.log("애 실행");

                    const clipboardData = e.clipboardData;

                    console.log("clipboardData >>> ", clipboardData);

                    if (clipboardData) {
                        console.log("얘 실행2");

                        // 붙여넣기 데이터 중 이미지가 있는지 확인
                        const pastedData = clipboardData.items;

                        console.log("pastedData >>> ", pastedData);

                        for (let i = 0; i < pastedData.length; i++) {
                            const item = pastedData[i];

                            console.log("item >>>", item);

                            if (item.type.startsWith("image/")) {
                                setTimeout(() => {
                                    // 이미지가 삽입된 후 커서를 다음 줄로 이동
                                    const index = quill.getSelection()?.index;
                                    if (index) {
                                        quill.insertText(index + 1, "\n");
                                        quill.setSelection(index + 2, 0);
                                    }
                                }, 100); // 비동기로 실행하여 붙여넣기 후 처리. 0으로 지정하면 안먹히기 때문에 100으로 지정. 잘 안되면 더 큰값으로 지정해야함.
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

            const initializeQuill = () => {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    // quill이 준비되었을 때 붙여넣기 이벤트 리스너 추가
                    return addPasteEventListener(quill);
                } else {
                    console.log("Quill 에디터가 아직 준비되지 않았습니다.");

                    // quill이 준비되지 않았으면 500ms 후 다시 시도
                    const timeoutId = setTimeout(() => {
                        const quillInstance = quillRef.current?.getEditor();
                        if (quillInstance) {
                            addPasteEventListener(quillInstance);
                        }
                    }, 500);

                    return () => clearTimeout(timeoutId); // 타임아웃 정리
                }
            };

            const cleanup = initializeQuill();

            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            return () => {
                if (cleanup) {
                    cleanup();
                }
            };
        }, []);

        // 이미지 크기 및 위치를 가져와서 오버레이 초기 설정
        const handleImageClick = useCallback((event: MouseEvent) => {
            const quill = quillRef.current?.getEditor();

            if (quill) {
                const beforeImageClickIndex = quill.getSelection()?.index;
                setBeforeImageClickSelection(beforeImageClickIndex);
            }

            let imgEl: HTMLImageElement | null = null;

            // event.target이 <img> 태그일 경우만 처리하도록 수정
            if ((event.target as HTMLElement).tagName === "IMG") {
                imgEl = event.target as HTMLImageElement;

                console.log("image >>>", imgEl);

                const imgRect = imgEl.getBoundingClientRect();
                const clickX = event.clientX;
                const clickY = event.clientY;

                // 클릭한 좌표가 이미지 영역 내부인지 확인
                if (
                    clickX >= imgRect.left &&
                    clickX <= imgRect.right &&
                    clickY >= imgRect.top &&
                    clickY <= imgRect.bottom
                ) {
                    setSelectedImage(imgEl);

                    const overlay = overlayRef.current;
                    if (overlay) {
                        overlay.style.width = `${imgRect.width}px`;
                        overlay.style.height = `${imgRect.height}px`;
                        overlay.style.left = `${
                            imgRect.left + window.scrollX
                        }px`;
                        overlay.style.top = `${imgRect.top + window.scrollY}px`;
                        overlay.style.display = "block"; // 오버레이 표시

                        // overlay의 부모 즉 figure의 부모인 div로 잡으면 에디터 전체 내용이 선택되어서, 맨아래쪽에 margin이 생겨서 해당 방식은 불가능.
                        const parentContainer: HTMLElement | null =
                            imgEl.parentElement;

                        if (parentContainer) {
                            parentContainer.style.marginBottom = "3.5rem"; // 이미지 클릭 후, 오버레이 생성 시 다른 요소와의 거리를 위해 아래쪽 공간 확보
                        }
                    }
                }
            }
        }, []);

        // 에디터 내에서 이미지를 클릭할 때 오버레이 표시
        useEffect(() => {
            const quill = quillRef.current?.getEditor();

            if (quill) {
                // Quill 에디터가 초기화된 후에만 이벤트 리스너를 등록
                quill.root.addEventListener("click", handleImageClick);
                console.log(
                    "Quill editor is ready and event listener is added."
                );
            } else {
                const intervalId = setInterval(() => {
                    const quillEditor = quillRef.current?.getEditor();
                    if (quillEditor) {
                        // quillEditor가 준비되면 클릭 이벤트 리스너 추가
                        quillEditor.root.addEventListener(
                            "click",
                            handleImageClick
                        );
                        console.log(
                            "Quill editor loaded and event listener added."
                        );

                        // quillEditor가 준비되면 interval 중지
                        clearInterval(intervalId);
                    }
                }, 500); // 500ms마다 quillEditor가 준비되었는지 확인
            }

            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            return () => {
                if (quill) {
                    quill.root.removeEventListener("click", handleImageClick);
                    console.log("Event listener removed.");
                }
            };
        }, []);

        // 이미지가 선택되면 오버레이 위치를 조정
        useLayoutEffect(() => {
            // useEffect를 useLayoutEffect로 변경
            if (selectedImage) {
                const updateOverlayPosition = () => {
                    requestAnimationFrame(() => {
                        // requestAnimationFrame으로 위치 업데이트
                        const imgRect = selectedImage.getBoundingClientRect();
                        const parentContainer = document.querySelector(
                            ".ql-custom-container"
                        ) as HTMLDivElement;
                        const parentRect =
                            parentContainer?.getBoundingClientRect();

                        const overlay = overlayRef.current;

                        if (overlay && parentRect) {
                            overlay.style.width = `${imgRect.width}px`;
                            overlay.style.height = `${imgRect.height}px`;

                            overlay.style.left = `${
                                imgRect.left -
                                parentRect.left +
                                parentContainer.scrollLeft
                            }px`;
                            overlay.style.top = `${
                                imgRect.top -
                                parentRect.top +
                                parentContainer.scrollTop
                            }px`;
                        }
                    });
                };

                // 초기 위치 업데이트
                updateOverlayPosition();

                window.addEventListener("scroll", updateOverlayPosition);
                window.addEventListener("resize", updateOverlayPosition);

                return () => {
                    window.removeEventListener("scroll", updateOverlayPosition);
                    window.removeEventListener("resize", updateOverlayPosition);
                };
            }
        }, [selectedImage]);

        // 오버레이 드래그 진행 시 가로세로 비율 유지하면서 조정
        useEffect(() => {
            console.log("실행ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ");

            let startX: number;
            let startY: number;
            let startWidth: number;
            let startHeight: number;
            let aspectRatio: number;

            // requestAnimationFrame을 위한 참조
            let animationFrameId: number;

            const handleResizeStart = (
                event: MouseEvent,
                handlerType: string
            ) => {
                if (!selectedImage) return;

                console.log("선택된 이미지 대체 누구냐", selectedImage);

                // 이미지의 현재 크기 기록
                const imgRect = selectedImage.getBoundingClientRect();

                startX = event.clientX;
                startY = event.clientY;
                startWidth = imgRect.width;
                startHeight = imgRect.height;
                aspectRatio = startWidth / startHeight;

                const handleResize = (moveEvent: MouseEvent) => {
                    console.log("실행용ㅇ");

                    // 리사이즈 동안 이미지 흐리게 처리
                    selectedImage.style.opacity = "0.5";

                    let newWidth = startWidth;
                    let newHeight = startHeight;

                    const container = document.querySelector(
                        ".ql-custom-container"
                    );
                    const containerRect = container?.getBoundingClientRect();

                    // 핸들러에 따라 오버레이 크기 변경
                    if (handlerType === "bottom-right" && containerRect) {
                        newWidth = startWidth + (moveEvent.clientX - startX);
                        newHeight = newWidth / aspectRatio;

                        // 오른쪽으로 드래그 시, 컨테이너를 초과하지 않도록 제한
                        if (
                            newWidth + selectedImage.offsetLeft >
                            containerRect.width
                        ) {
                            // 8은 패딩값. 드래그시 왼쪽 부분이랑 맞추기 위해 사용
                            newWidth =
                                containerRect.width -
                                selectedImage.offsetLeft -
                                8;
                            newHeight = newWidth / aspectRatio;
                        }
                    } else if (handlerType === "bottom-left") {
                        newWidth = startWidth - (moveEvent.clientX - startX);
                        newHeight = newWidth / aspectRatio;
                    } else if (handlerType === "top-left") {
                        newWidth = startWidth - (moveEvent.clientX - startX);
                        newHeight = newWidth / aspectRatio;
                    } else if (handlerType === "top-right" && containerRect) {
                        newWidth = startWidth + (moveEvent.clientX - startX);
                        newHeight = newWidth / aspectRatio;

                        // 오른쪽으로 드래그 시, 컨테이너를 초과하지 않도록 제한
                        if (
                            newWidth + selectedImage.offsetLeft >
                            containerRect.width
                        ) {
                            // 8은 패딩값. 드래그시 왼쪽 부분이랑 맞추기 위해 사용
                            newWidth =
                                containerRect.width -
                                selectedImage.offsetLeft -
                                8;
                            newHeight = newWidth / aspectRatio;
                        }
                    }

                    // 최소 크기 제한 (너비와 높이가 50px 이하로 줄어들지 않게 설정)
                    if (newWidth > 100 && newHeight > 100) {
                        // 오버레이 크기 먼저 업데이트
                        const overlay = overlayRef.current;
                        if (overlay) {
                            overlay.style.width = `${newWidth}px`;
                            overlay.style.height = `${newHeight}px`;
                        }

                        // 이미지 크기는 별도의 requestAnimationFrame에서 조정
                        const updateImageSize = () => {
                            if (selectedImage) {
                                selectedImage.style.width = `${newWidth}px`;
                                selectedImage.style.height = `${newHeight}px`;
                            }
                        };

                        console.log(selectedImage.style.width);
                        console.log(selectedImage.style.height);
                        console.log(overlay?.style.width);
                        console.log(overlay?.style.height);

                        // 다음 애니메이션 프레임에서 이미지 크기 업데이트
                        animationFrameId =
                            requestAnimationFrame(updateImageSize);
                    }
                };

                const handleResizeEnd = () => {
                    // 마우스 이벤트 리스너 제거
                    window.removeEventListener("mousemove", handleResize);
                    window.removeEventListener("mouseup", handleResizeEnd);

                    // 애니메이션 프레임 중지
                    cancelAnimationFrame(animationFrameId);

                    console.log("마무리");

                    console.log(selectedImage);

                    // 최종적으로 오버레이 크기에 맞춰 이미지 크기 조정
                    const overlay = overlayRef.current;
                    if (overlay && selectedImage) {
                        console.log("최종 확인1", overlay);
                        console.log("최종 확인2", selectedImage);

                        console.log(overlay.style.width);
                        console.log(overlay.style.height);

                        console.log("=============================");

                        console.log(selectedImage.style.width);
                        console.log(selectedImage.style.height);

                        selectedImage.style.width = overlay.style.width;
                        selectedImage.style.height = overlay.style.height;
                        // 리사이즈가 완료되면 이미지를 선명하게 만듦
                        selectedImage.style.opacity = "1";
                    }
                };

                // 마우스 이동 및 버튼 해제 이벤트 리스너 추가
                window.addEventListener("mousemove", handleResize);
                window.addEventListener("mouseup", handleResizeEnd);
            };

            // 선택된 이미지와 오버레이의 위치를 비교하여 리사이즈 시작 여부 결정. 비교하지 않으면 여러 이미지가 있을 때 특정 이미지 사이즈를 조정하면 다른 이미지도 같이 조정된다. 즉, 오버레이와 이미지의 위치가 같은 이미지만 사이즈를 조정한다.
            const handleMouseDown = (
                event: MouseEvent,
                handlerType: string
            ) => {
                const imgRect = selectedImage?.getBoundingClientRect();
                const overlayRect = overlayRef.current?.getBoundingClientRect();

                console.log("imgRect:", imgRect);
                console.log("overlayRect:", overlayRect);

                // 허용되는 오차 범위를 5px로 설정 (이미지와 오버레이 간 미세한 차이 허용)
                const tolerance = 5;

                // imgRect.left === overlayRect.left는 정확한 픽셀 단위로 일치해야만 조건을 만족하기 때문에, 일정 범위 안에 들어오는지 확인하기 위함.
                // 좀더 엄격하게 지정하고 싶으면 5보다 작게, 느슨하게 지정하고 싶으면 5보다 크게 하면 된다.
                // 즉 이미지와 오버레이의 좌표가 오차 범위 내에 있는지 확인

                if (
                    selectedImage &&
                    imgRect &&
                    overlayRect &&
                    Math.abs(imgRect.left - overlayRect.left) < tolerance &&
                    Math.abs(imgRect.top - overlayRect.top) < tolerance
                ) {
                    console.log("드래그 시작");
                    handleResizeStart(event, handlerType);
                } else {
                    console.log("위치가 일치하지 않음");
                }
            };

            const overlay = overlayRef.current;
            let bottomRightHandler: HTMLDivElement | null = null;
            let bottomLeftHandler: HTMLDivElement | null = null;
            let topLeftHandler: HTMLDivElement | null = null;
            let topRightHandler: HTMLDivElement | null = null;

            if (overlay) {
                bottomRightHandler = overlay.querySelector(
                    ".bottom-right"
                ) as HTMLDivElement;
                bottomLeftHandler = overlay.querySelector(
                    ".bottom-left"
                ) as HTMLDivElement;
                topLeftHandler = overlay.querySelector(
                    ".top-left"
                ) as HTMLDivElement;
                topRightHandler = overlay.querySelector(
                    ".top-right"
                ) as HTMLDivElement;

                if (bottomRightHandler) {
                    bottomRightHandler.addEventListener("mousedown", (event) =>
                        handleMouseDown(event, "bottom-right")
                    );
                }

                if (bottomLeftHandler) {
                    bottomLeftHandler.addEventListener("mousedown", (event) =>
                        handleMouseDown(event, "bottom-left")
                    );
                }

                if (topLeftHandler) {
                    topLeftHandler.addEventListener("mousedown", (event) =>
                        handleMouseDown(event, "top-left")
                    );
                }

                if (topRightHandler) {
                    topRightHandler.addEventListener("mousedown", (event) =>
                        handleMouseDown(event, "top-right")
                    );
                }
            }

            return () => {
                if (bottomRightHandler) {
                    bottomRightHandler.removeEventListener(
                        "mousedown",
                        (event) => handleMouseDown(event, "bottom-right")
                    );
                }

                if (bottomLeftHandler) {
                    bottomLeftHandler.removeEventListener(
                        "mousedown",
                        (event) => handleMouseDown(event, "bottom-left")
                    );
                }

                if (topLeftHandler) {
                    topLeftHandler.removeEventListener("mousedown", (event) =>
                        handleMouseDown(event, "top-left")
                    );
                }

                if (topRightHandler) {
                    topRightHandler.removeEventListener("mousedown", (event) =>
                        handleMouseDown(event, "top-right")
                    );
                }
            };
        }, [selectedImage]);

        // 오버레이 외부 영역 클릭 시 오버레이 display none 적용 및 선택된 이미지 null로 설정.
        useEffect(() => {
            console.log(
                "beforeImageClickSelection >>>" + beforeImageClickSelection
            );
            const handleOverlayOutsideClick = (event: MouseEvent) => {
                const overlay = overlayRef.current;
                if (overlay && selectedImage) {
                    if (!selectedImage.contains(event.target as Node)) {
                        setSelectedImage(null);
                        overlay.style.display = "none";
                        const parentContainer: HTMLElement | null =
                            selectedImage.parentElement;

                        if (parentContainer) {
                            parentContainer.style.marginBottom = "0"; // 오버레이 삭제 시 추가한 마진 초기화
                        }

                        // 이미지 선택(오버레이 선택)해제 후 다시 원래의 커서로 돌아가기 위함
                        const quill = quillRef.current?.getEditor();

                        if (quill && beforeImageClickSelection != undefined) {
                            setTimeout(() => {
                                quill.focus();
                                quill.setSelection(
                                    beforeImageClickSelection,
                                    0
                                );
                            }, 100);

                            console.log("실행123");
                        }
                    }
                }
            };

            // 이미지 내부 클릭 시 이벤트 전파 막기
            const handleOverlayClick = (event: MouseEvent) => {
                event.stopPropagation(); // 클릭 이벤트 전파를 막음
            };

            document.addEventListener("mousedown", handleOverlayOutsideClick);

            if (overlayRef.current) {
                overlayRef.current.addEventListener(
                    "mousedown",
                    handleOverlayClick
                );
            }

            return () => {
                document.removeEventListener(
                    "mousedown",
                    handleOverlayOutsideClick
                );
                if (overlayRef.current) {
                    overlayRef.current.removeEventListener(
                        "mousedown",
                        handleOverlayClick
                    );
                }
            };
        }, [selectedImage]);

        // 드롭다운 위치 설정 함수
        const setPosition = () => {
            const imageButtonElement = document.querySelector(".ql-image");
            const parentContainer = document.querySelector(
                ".ql-custom-container"
            ); // 부모 컨테이너를 가져옴

            if (imageButtonElement && dropdownRef.current && parentContainer) {
                const rect = imageButtonElement.getBoundingClientRect();
                const parentRect = parentContainer.getBoundingClientRect();
                const dropdownWidth = dropdownRef.current.offsetWidth;
                const buttonWidth = rect.width;

                setDropdownPosition({
                    top: rect.bottom - parentRect.top, // 부모 컨테이너 기준으로 top을 계산
                    left:
                        rect.left -
                        parentRect.left +
                        buttonWidth / 2 -
                        dropdownWidth / 2, // 부모 기준으로 좌측 위치 조정
                });
            }
        };
        const toggleDropdown = useCallback(() => {
            const quill = quillRef.current?.getEditor();
            savedSelection = quill?.getSelection()?.index ?? quill?.getLength(); // 로컬 변수에 커서 위치 저장. 툴바의 이미지 버튼을 클릭하면 사용자가 현재 지정한 커서의 위치를 미리 저장함.
            console.log("Saved cursor index before dropdown:", savedSelection);

            setDropdownVisible((prev) => !prev);
        }, []);

        // 이미지 드랍다운 버튼이 클릭되면 드랍다운 위치값 설정 및 드랍다운 바깥쪽 영역 클릭 시 드랍다운 안보이게 하는 로직
        useEffect(() => {
            if (isDropdownVisible) {
                setPosition();
            }

            const handleDropdownOutsideClick = (event: MouseEvent) => {
                // 툴바 바깥쪽 클릭 시 드롭다운 닫기. 툴바의 이미지 아이콘을 클릭해도 드랍다운이 닫히는데, toggleDropdown() 함수 때문.
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node) &&
                    !document
                        .querySelector(".ql-image")
                        ?.contains(event.target as Node)
                ) {
                    setDropdownVisible(false);
                }
            };

            // 전역 클릭 이벤트 등록. 마우스 클릭했을때 발생하는 이벤트
            document.addEventListener("mousedown", handleDropdownOutsideClick);

            return () => {
                // 전역 클릭 이벤트 해제하는 클린업 함수
                document.removeEventListener(
                    "mousedown",
                    handleDropdownOutsideClick
                );
            };
        }, [isDropdownVisible]);

        // 여기서 함수 재생성을 막아야 올바르게 작동함.
        const handleFileSelection = useCallback((type: string) => {
            setDropdownVisible(false);

            console.log("실행2");
            const input = document.createElement("input");

            if (type === "image") {
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
            } else if (type === "file") {
                input.setAttribute("type", "file");
                input.setAttribute("accept", "application/pdf,text/*");
            } else if (type === "video") {
                input.setAttribute("type", "file");
                input.setAttribute("accept", "video/*");
            }

            console.log("Saved cursor index:", savedSelection);

            console.log("input >>>", input);
            input.click();

            input.onchange = () => {
                const file = input.files ? input.files[0] : null;

                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        // 나중에 서버측에서 반환환 이미지 URL을 사용해야 하며, 서버측에서 얻은 URL을 통해 Next.js <Image> 태그 src에 적용 예정
                        const base64String = reader.result?.toString();
                        const quill = quillRef.current?.getEditor();

                        // saveSeleciton이 0인 경우 falsy 값이기 때문에 savedSelection으로 조건을 안잡고 아래 처럼 savedSelection != undefined로 조건을 잡음
                        if (
                            quill &&
                            base64String &&
                            savedSelection !== null &&
                            savedSelection !== undefined
                        ) {
                            console.log(
                                "Inserting file at index:",
                                savedSelection
                            );

                            if (type === "image") {
                                console.log("이미지 첨부 실행");
                                if (savedSelection === 0) {
                                    // 커서가 index 0일 때 처리 로직
                                    quill.insertEmbed(0, "image", base64String); // 이미지 삽입
                                    quill.insertText(1, "\n"); // 이미지 뒤에 공백 추가
                                    quill.setSelection(2, 0); // 커서를 이미지 뒤에 추가된 공백으로 이동.
                                } else {
                                    // 커서가 index 0이 아닐 때: 이미지 뒤에만 공백 추가
                                    quill.insertEmbed(
                                        savedSelection,
                                        "image",
                                        base64String
                                    ); // 이미지 삽입

                                    quill.insertText(savedSelection + 1, "\n");
                                    quill.setSelection(savedSelection + 2, 0);
                                }
                            } else if (type === "file") {
                                quill.insertText(
                                    savedSelection,
                                    `${file.name} 첨부됨\n`
                                );
                                quill.insertText(savedSelection + 1, "\n\n"); // 파일 뒤에 공백 추가
                                // quill.setSelection(savedSelection + 2);
                            } else if (type === "video") {
                                quill.insertText(
                                    savedSelection,
                                    `${file.name} 동영상 첨부됨\n`
                                );
                                quill.insertText(savedSelection + 1, "\n\n"); // 동영상 뒤에 공백 추가
                                // quill.setSelection(savedSelection + 2);
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
        }, []);

        // const formats = [
        //     "header",
        //     "bold",
        //     "italic",
        //     "underline",
        //     "strike",
        //     "blockquote",
        //     "list",
        //     "bullet",
        //     "indent",
        //     "link",
        //     "image",
        //     "align",
        //     "color",
        //     "background",
        //     "float",
        //     "height",
        //     "width",
        // ];

        // 여기서 useMemo를 하거나 toggleDropdown 부분에 useCallback을 해야함 아니면 handleFileSelection 함수에 까지.
        const modules = useMemo(
            () => ({
                // imageActions: {},
                // imageFormats: {},
                toolbar: {
                    container: ".ql-toolbar",
                    handlers: {
                        image: toggleDropdown,
                    },
                },
            }),
            []
        );

        const handleChange = (html: string) => {
            const sanitizedHtml = DOMPurify.sanitize(html); // HTML을 안전하게 정리
            // const parser = new DOMParser();
            // const doc = parser.parseFromString(sanitizedHtml, "text/html");
            // const textContent = doc.body.textContent || ""; // 텍스트만 추출
            // onChange(textContent);
            onChange(sanitizedHtml);
        };

        const DropdownMenu: React.FC<DropdownMenuProps> = ({
            dropdownPosition,
            handleFileSelection,
            dropdownRef,
        }) => (
            <div
                ref={dropdownRef}
                className='absolute z-10 bg-white border border-gray-300 shadow-md'
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                }}
            >
                <ul>
                    <li
                        className='py-2 px-4 hover:bg-gray-100 cursor-pointer'
                        onClick={() => handleFileSelection("image")}
                    >
                        <FontAwesomeIcon
                            className='inline-block w-4 h-4 mr-2'
                            icon={faImage}
                            style={{ color: "#a3a3a3" }}
                        />
                        사진
                    </li>
                    <li
                        className='py-2 px-4 hover:bg-gray-100 cursor-pointer'
                        onClick={() => handleFileSelection("file")}
                    >
                        <FontAwesomeIcon
                            className='inline-block w-4 h-4 mr-2'
                            icon={faFile}
                            style={{ color: "#a3a3a3" }}
                        />
                        파일
                    </li>
                    <li
                        className='py-2 px-4 hover:bg-gray-100 cursor-pointer'
                        onClick={() => handleFileSelection("video")}
                    >
                        <FontAwesomeIcon
                            className='inline-block w-4 h-4 mr-2'
                            icon={faVideo}
                            style={{ color: "#a3a3a3" }}
                        />
                        동영상
                    </li>
                </ul>
            </div>
        );

        return (
            <>
                {/* 오버레이  */}

                <figure
                    ref={overlayRef}
                    className='absolute border-2 border-black/50 pointer-events-auto z-10 hidden'
                >
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full top-[-5px] left-[-5px] top-left cursor-nwse-resize pointer-events-auto' />
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full top-[-5px] right-[-5px] top-right cursor-nesw-resize pointer-events-auto' />
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full bottom-[-5px] left-[-5px] bottom-left cursor-nesw-resize pointer-events-auto' />
                    <div className='absolute w-2.5 h-2.5 bg-white border border-black rounded-full bottom-[-5px] right-[-5px] bottom-right cursor-nwse-resize pointer-events-auto' />
                    <figcaption className='absolute w-full text-center bottom-[-2.2rem]'>
                        <input
                            type='text'
                            className='w-full text-center outline-none'
                            placeholder='이미지를 설명해 보세요'
                        />
                    </figcaption>
                </figure>

                <ReactQuillDynamic
                    forwardedRef={quillRef}
                    value={value}
                    onChange={handleChange}
                    theme='snow'
                    modules={modules}
                    // formats={formats}
                />
                {/* <ReactQuill value={value} onChange={handleChange} theme='bubble' /> */}
                {/* 드롭다운 메뉴 */}
                {isDropdownVisible && (
                    <DropdownMenu
                        dropdownPosition={dropdownPosition}
                        handleFileSelection={handleFileSelection}
                        dropdownRef={dropdownRef}
                    />
                )}
            </>
        );
    })
);
