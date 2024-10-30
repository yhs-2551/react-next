// 동일한 카테고리명 토스트 알림 처리
// 3개 이상 카테고리 레벨 생성 불가능 토스트 알림 처리
// 편집시 상위 카테고리 목록에 현재 카테고리가 나타나지 않도록 수정

import React, { useRef, useState, useEffect } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoEllipsisHorizontal, IoEllipsisVertical } from "react-icons/io5";
import { CategoryType } from "../types/category";
import { useDrag, useDrop } from "react-dnd";

interface CategoryItemProps {
    category: CategoryType;
    index: number;
    openModal: (category: CategoryType) => void;
    deleteCategory: (categoryId: string) => void;
    moveCategory: (sourceId: string, targetId: string, isTopLevelMove: boolean) => void;
    onDragStateChange: (isDragging: boolean) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, moveCategory, index, openModal, deleteCategory, onDragStateChange }) => {
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
    }, []);

    const [{ isDragging }, drag] = useDrag({
        type: "category",
        item: { id: category.id, index, parentId: category.parentId, children: category.children },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // 삭제 핸들러
    const handleDelete = () => {
        deleteCategory(category.id);
        setShowMenu(false);
    };

    // 메뉴 토글 핸들러
    const toggleMenu = () => {
        setShowMenu((prev) => !prev);
    };

    const [{ isOver, canDrop, draggedItem }, drop] = useDrop({
        accept: "category",
        canDrop: (draggedItem) => {
            // 드래그된 아이템이 하위 카테고리인 경우, 타겟이 최상위 카테고리여야 함
            if (draggedItem.parentId && !category.parentId) {
                return true;
            }

            // 드래그된 아이템이 최상위 카테고리인 경우 + 자식이 있는 경우 타겟이 반드시 최상위 카테고리여야 함
            if (!draggedItem.parentId && draggedItem.children.length > 0) {
                console.log("draggedItem", draggedItem);
                console.log("category wktlr>>>>>>>>>>>>>>>>>>>>>>>>", category);

                // 타겟이 최상위 카테고리일 때만 허용
                if (!category.parentId) {
                    return true;
                } else {
                    console.log("여기실행ㅇㅇㅇㅇㅇ");
                    // 타겟이 하위 카테고리인 경우 자식이 있는 최상위 카테고리는 이동 불가
                    return false;
                }
            }

            // 드래그된 아이템이 최상위 카테고리인 경우 + 자식이 없는 경우
            if (!draggedItem.parentId && draggedItem.children.length === 0) {
                // 타겟이 최상위 카테고리이거나 하위 카테고리일 때 모두 허용
                if (!category.parentId) {
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
            if (!draggedItem.parentId && draggedItem.children.length > 0) {
                moveCategory(draggedItem.id, category.id, true);
                return;
            }

            console.log("category", category);

            const clientOffset = monitor.getClientOffset();
            const targetRect = categoryRef.current?.getBoundingClientRect();

            if (!clientOffset || !targetRect) return;

            const leftBoundary = targetRect.left + targetRect.width * 0.1;

            if (clientOffset.x < leftBoundary) {
                if (draggedItem.id !== category.id) {
                    moveCategory(draggedItem.id, category.id, true); // 최상위 카테고리 간 이동
                    return;
                }
            } else {
                if (draggedItem.id !== category.id) {
                    moveCategory(draggedItem.id, category.id, false); // 하위로 이동
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
        onDragStateChange(isDragging)
    }, [isDragging]);


    // 배경색 결정 함수
    const getBackgroundColor = () => {
        if (!isOver) return "transparent";

        if (isOver && canDrop && draggedItem?.id !== category.id) {
            if (draggedItem?.children?.length > 0 && !draggedItem.parentId) {
                // 자식이 있는 최상위 카테고리일 때 파란색
                return "rgba(0, 0, 255, 0.2)";
            }

            // 왼쪽 10%일 때 파란색
            const leftBoundary = categoryRef.current?.getBoundingClientRect().left + categoryRef.current?.getBoundingClientRect().width * 0.1;
            if (clientOffset?.x < leftBoundary) {
                return "rgba(0, 0, 255, 0.2)";
            }

            // 오른쪽 90%일 때 초록색
            return "rgba(0, 255, 0, 0.2)";
        }

        return "transparent"; // 기본은 투명
    };

    return (
        <li
            className={`relative p-4 bg-gray-100 border border-gray-300 rounded-md flex justify-between items-center ${
                isDragging ? "opacity-50 border-blue-500" : ""
            }`}
            ref={categoryRef}
            style={{
                backgroundColor: getBackgroundColor(),
            }}
        >
            <span>{category.name}</span>

            {/* 메뉴 토글 버튼 (일립스 아이콘) */}
            <button onClick={toggleMenu} className={`${showMenu ? "text-blue-500" : "text-gray-700"} text-xl`}>
                {showMenu ? <IoEllipsisVertical /> : <IoEllipsisHorizontal />}
            </button>

            {/* 말풍선 메뉴 (일립스를 가리키는 스타일) */}
            {showMenu && (
                <div ref={menuRef} className='absolute right-0 top-full mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10'>
                    {/* 화살표 부분 */}
                    <div className='absolute top-[-8px] right-4 w-4 h-4 bg-white border-l border-t border-gray-300 rotate-45'></div>
                    <div className='flex flex-col py-2'>
                        <button
                            onMouseEnter={() => setHoveredItem("edit")} // 편집 항목에 마우스 진입 시 상태 업데이트
                            onMouseLeave={() => setHoveredItem(null)} // 마우스가 나가면 상태 초기화
                            onClick={() => {
                                openModal(category); // 편집 버튼 클릭 시 모달 열기
                                setShowMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 flex items-center ${hoveredItem === "edit" ? "bg-gray-100" : ""}`} // 초기 상태에서 기본적으로 "편집" 항목에 배경색
                        >
                            <MdEdit className='mr-2 text-gray-600' /> 편집
                        </button>
                        <button
                            onMouseEnter={() => setHoveredItem("delete")} // 삭제 항목에 마우스 진입 시 상태 업데이트
                            onMouseLeave={() => setHoveredItem(null)} // 마우스가 나가면 상태 초기화
                            onClick={handleDelete}
                            className={`w-full text-left px-4 py-2 flex items-center ${hoveredItem === "delete" ? "bg-gray-100" : ""}`}
                        >
                            <MdDelete className='mr-2 text-gray-600' /> 삭제
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};

export default CategoryItem;
