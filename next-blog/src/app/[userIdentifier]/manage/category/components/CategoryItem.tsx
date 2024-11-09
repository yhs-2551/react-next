// 동일한 카테고리명 토스트 알림 처리
// 3개 이상 카테고리 레벨 생성 불가능 토스트 알림 처리
// 편집시 상위 카테고리 목록에 현재 카테고리가 나타나지 않도록 수정

import React, { useRef, useState, useEffect } from "react";

 

import { MdDelete, MdEdit } from "react-icons/md";
import { IoEllipsisHorizontal, IoEllipsisVertical } from "react-icons/io5";

import { useDrag, useDrop } from "react-dnd";

import { RxDragHandleHorizontal } from "react-icons/rx";
import { FaFolder } from "react-icons/fa";
import { CategoryType } from "@/types/category";

interface CategoryItemProps {
    category: CategoryType;
    index: number;
    openModal: (category: CategoryType) => void;
    deleteCategory: (categoryId: string) => void;
    moveCategory: (sourceId: string, targetId: string, isTopLevelMove: boolean) => void;
    onDragStateChange: (isDragging: boolean) => void;
    isDeleteDisabled?: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    category,
    moveCategory,
    index,
    openModal,
    deleteCategory,
    onDragStateChange,
    isDeleteDisabled,
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>("edit"); // 기본적으로 편집 항목을 선택 상태로 설정
    const menuRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLLIElement>(null); // 카테고리 아이템을 위한 ref 생성
    const [clientOffset, setClientOffset] = useState<{ x: number; y: number } | null>(null); // 클라이언트 오프셋 상태

    // 외부 클릭 시 말풍선 닫기
    useEffect(() => {
        console.log(category);

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // 메뉴가 열릴 때 기본적으로 "편집" 항목에 배경색 부여
    useEffect(() => {
        if (showMenu) {
            setHoveredItem("edit"); // 메뉴가 열리면 기본적으로 편집 항목에 포커스
        }
    }, [showMenu]);

    const [{ isDragging }, drag] = useDrag({
        type: "category",
        item: { categoryUuid: category.categoryUuid, index, categoryUuidParent: category.categoryUuidParent, children: category.children },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // 삭제 핸들러
    const handleDelete = () => {
        deleteCategory(category.categoryUuid);
        setShowMenu(false);
    };

    // 메뉴 토글 핸들러
    const toggleMenu = () => {
        setShowMenu((prev) => !prev);
    };

    // 드랍시 category는 target category 즉, 최종적으로 drop될 카테고리를 의미함.
    const [{ isOver, canDrop, draggedItem }, drop] = useDrop({
        accept: "category",
        canDrop: (draggedItem: CategoryType) => {
            console.log("dragggggg>>", draggedItem);

            console.log("category>>>>>>>>>>>>>", category);

            // 드래그된 아이템이 하위 카테고리인 경우, 타겟이 최상위 카테고리여야 함
            if (draggedItem.categoryUuidParent && !category.categoryUuidParent) {
                return true;
            }

            // 드래그된 아이템이 최상위 카테고리인 경우 + 자식이 있는 경우 타겟이 반드시 최상위 카테고리여야 함
            if (!draggedItem.categoryUuidParent && draggedItem.children && draggedItem.children.length > 0) {
                // 타겟이 최상위 카테고리일 때만 허용
                if (!category.categoryUuidParent) {
                    return true;
                } else {
                    // 타겟이 하위 카테고리인 경우 자식이 있는 최상위 카테고리는 이동 불가
                    return false;
                }
            }

            // 드래그된 아이템이 최상위 카테고리인 경우 + 자식이 없는 경우
            // 아래 !draggedItem.children || draggedItem.children.length === 0) 이 조건은 Array(0)일수도 있고, children이 undefined일 수도 있어서 저렇게 두개 추가. draggedItem.children.length === 0은 undefined를 통과시키지 못함.
            if (!draggedItem.categoryUuidParent && (!draggedItem.children || draggedItem.children.length === 0)) {
                // 타겟이 최상위 카테고리이거나 하위 카테고리일 때 모두 허용
                if (!category.categoryUuidParent) {
                    console.log("얘 ㅣ실행");

                    return true;
                }
            }

            return false;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            draggedItem: monitor.getItem(),
            // clientOffset: monitor.getClientOffset(),
        }),
        drop: (draggedItem, monitor) => {
            if (!draggedItem.categoryUuidParent && draggedItem.children && draggedItem.children.length > 0) {
                moveCategory(draggedItem.categoryUuid, category.categoryUuid, true);
                return;
            }

            const clientOffset = monitor.getClientOffset();
            const targetRect = categoryRef.current?.getBoundingClientRect();

            if (!clientOffset || !targetRect) return;

            const leftBoundary = targetRect.left + targetRect.width * 0.2;

            if (clientOffset.x < leftBoundary) {
                if (draggedItem.categoryUuid !== category.categoryUuid) {
                    // 드래그하는 부모 ID와 target의 ID가 같다면 최상위로 이동. 즉 자식이 직속 부모로 이동할 시 무조건 최상위로 이동
                    if (draggedItem.categoryUuidParent === category.categoryUuid) {
                        moveCategory(draggedItem.categoryUuid, category.categoryUuid, true); // 최상위 카테고리 간 이동
                    } else {
                        moveCategory(draggedItem.categoryUuid, category.categoryUuid, true); // 최상위 카테고리 간 이동
                    }
                    return;
                }
            } else {
                if (draggedItem.categoryUuid !== category.categoryUuid) {
                    // 부모 ID와 target의 ID가 같다면 최상위로 이동
                    if (draggedItem.categoryUuidParent === category.categoryUuid) {
                        moveCategory(draggedItem.categoryUuid, category.categoryUuid, true); // 최상위 카테고리 간 이동
                    } else {
                        moveCategory(draggedItem.categoryUuid, category.categoryUuid, false); // 하위로 이동
                    }
                    return;
                }
            }

            // setCurrentClass(null); // 드롭이 끝나면 초기화
        },
        hover: (draggedItem, monitor) => {
            setClientOffset(monitor.getClientOffset());
        },
    });

    // 카테고리 아이템의 ref를 drag와 drop에 연결
    useEffect(() => {
        if (categoryRef.current) {
            drag(drop(categoryRef.current));
        }
    }, []);

    // 드래그 시작 시 sub-category 클래스에 스타일 추가
    useEffect(() => {
        onDragStateChange(isDragging);
    }, [isDragging]);

    // 배경색 결정 함수
    const getBackgroundColor = () => {
        if (!isOver) return "transparent";

        if (isOver && canDrop && draggedItem?.categoryUuid !== category.categoryUuid) {
            if (draggedItem.children && draggedItem.children.length > 0 && !draggedItem.categoryUuidParent) {
                // 자식이 있는 최상위 카테고리일 때 무조건 파란색
                return "#1D4ED8";
            }

            // 드래그하는 부모 ID와 target의 ID가 같다면 최상위로 이동. 즉 자식이 직속 부모로 이동할 시 무조건 최상위(파란색)
            if (draggedItem.categoryUuidParent === category.categoryUuid) {
                return "#1D4ED8";
            }

            if (categoryRef.current) {
                // 왼쪽 20%일 때 파란색
                const leftBoundary = categoryRef.current?.getBoundingClientRect().left + categoryRef.current?.getBoundingClientRect().width * 0.2;

                if (clientOffset && clientOffset.x < leftBoundary) {
                    return "#1D4ED8";
                }
                // 오른쪽 80%일 때 빨간색
                return "#FF5A50";
            }
        }
        return "transparent"; // 기본은 투명 사실 이 코드는 없어도 됨 실행되진 않을 듯.
    };

    return (
        <li
            className={`relative h-[3.8rem] border border-gray-300 rounded-md flex items-center ${isDragging ? "opacity-50" : ""} hover:cursor-move`}
            ref={categoryRef}
            style={{
                borderBottom: isOver ? `4px solid ${getBackgroundColor()}` : undefined,
            }}
        >
            {/* <TfiHandDrag  className="text-3xl"/>
            <RxDragHandleDots1 className="text-3xl"/> */}

            <RxDragHandleHorizontal className='text-4xl h-full ml-4 pr-2 opacity-70' />
            <div className='flex items-center ml-6'>
                <FaFolder className='text-xl mr-2 opacity-60' />
                {category.name}
            </div>

            {/* 메뉴 토글 버튼 (일립스 아이콘) */}
            <div className='ml-auto mr-4'>
                <button onClick={toggleMenu} className={`${showMenu ? "text-blue-700" : "text-gray-700"} text-xl`}>
                    {showMenu ? <IoEllipsisVertical className='opacity-70' /> : <IoEllipsisHorizontal className='opacity-70' />}
                </button>
            </div>
            {/* 말풍선 메뉴 (일립스를 가리키는 스타일) */}
            {showMenu && (
                <div ref={menuRef} className='absolute right-0 top-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10'>
                    {/* 화살표 부분 */}

                    <div className='flex flex-col py-2'>
                        <button
                            onMouseEnter={() => setHoveredItem("edit")} // 편집 항목에 마우스 진입 시 상태 업데이트
                            onMouseLeave={() => setHoveredItem(null)} // 마우스가 나가면 상태 초기화
                            onClick={() => {
                                openModal(category); // 편집 버튼 클릭 시 모달 열기
                                setShowMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 flex items-center ${hoveredItem === "edit" ? "bg-[#333] text-white" : ""}`} // 초기 상태에서 기본적으로 "편집" 항목에 배경색
                        >
                            <MdEdit className='mr-2' /> 편집
                        </button>
                        <button
                            onMouseEnter={() => setHoveredItem("delete")} // 삭제 항목에 마우스 진입 시 상태 업데이트
                            onMouseLeave={() => setHoveredItem(null)} // 마우스가 나가면 상태 초기화
                            onClick={handleDelete}
                            className={`w-full text-left px-4 py-2 flex items-center ${hoveredItem === "delete" ? "bg-[#333] text-white" : ""} ${
                                isDeleteDisabled ? "cursor-not-allowed bg-white text-gray-400" : ""
                            }`}
                            disabled={isDeleteDisabled}
                        >
                            <MdDelete className='mr-2' /> 삭제
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};

export default CategoryItem;
