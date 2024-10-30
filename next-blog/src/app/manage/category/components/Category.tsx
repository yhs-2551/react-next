"use client";

import CommonSideNavigation from "@/app/manage/(common-side-navigation)/CommonSideNavigation";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useEffect, useState } from "react";
import {
    Description,
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";

import { Tooltip } from "react-tooltip";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { v4 as uuidv4 } from "uuid";
import CategoryItem from "./CategoryItem";
import { CategoryType } from "../types/category";

// 컴포넌트 외부에 헬퍼 함수 정의
const buildCategoryTree = (categories: CategoryType[]): CategoryType[] => {
    const map = new Map<string, CategoryType>();
    const roots: CategoryType[] = [];

    // 각 카테고리를 map에 저장
    categories.forEach((category) => {
        map.set(category.id, { ...category, children: [] });
    });

    // 각 카테고리를 부모 아래에 배치
    categories.forEach((category) => {
        if (category.parentId) {
            const parent = map.get(category.parentId);
            if (parent) {
                parent.children?.push(map.get(category.id)!);
            }
        } else {
            roots.push(map.get(category.id)!);
        }
    });

    return roots;
};

const Category: React.FC = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);

    const [draggingCategoryId, setDraggingCategoryId] = useState(null); // 드래그 중인 카테고리 ID 저장

    const categoryTree = buildCategoryTree(categories); // 이 부분은 렌더링 전에 위치


    const handleDragStateChange = (isDragging: boolean, categoryId: string) => {
        setDraggingCategoryId(isDragging ? categoryId : null); // 드래그 중일 때 카테고리 ID 저장
    };

    const handleAddCategory = () => {
        // 공백만 입력했을 때
        if (newCategoryName.trim() === "") {
            toast.error(
                <span>
                    <span style={{ fontSize: "1.2rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <span style={{ fontSize: "0.9rem" }}>카테고리 이름을 입력해주세요.</span>
                </span>
            );

            return;
        }

        const isDuplicateName = categories.some((category) => category.name === newCategoryName.trim());

        if (isDuplicateName) {
            toast.error(
                <span>
                    <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;{" "}
                    <span style={{ fontSize: "0.9rem" }}>이미 존재하는 카테고리 이름입니다.</span>
                </span>
            );
            return;
        }

        setCategories([...categories, { id: uuidv4(), name: newCategoryName, parentId: null, children: [] }]);
        setNewCategoryName("");
    };

    const openModal = (category: CategoryType | null) => {
        console.log("category", category);

        setSelectedCategory(category);
        setSelectedParentCategory(category?.parentId || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCategory) {
            const updatedCategories = categories.map((category) =>
                category.id === selectedCategory.id ? { ...selectedCategory, parentId: selectedParentCategory } : category
            );
            setCategories(updatedCategories);
            closeModal();
        }
    };

    // 카테고리 삭제 (자식 카테고리는 삭제하지 않음)
    const handleDeleteCategory = (categoryId: string) => {
        const updatedCategories = categories.filter((category) => category.id !== categoryId);
        setCategories(updatedCategories);
    };

    const renderCategoryOptions = (categories: CategoryType[], level: number = 0) => {
        const isDisabled = (category: CategoryType) => {
            // 선택된 카테고리 자체를 비활성화
            if (category.id === selectedCategory?.id) return true;

            // 선택된 카테고리가 최상위 카테고리일 경우, 해당 카테고리와 그 하위 카테고리만 비활성화
            if (selectedCategory && selectedCategory.parentId === null) {
                // 최상위 카테고리와 그 하위 카테고리 비활성화
                if (category.parentId === selectedCategory.id) {
                    return true;
                }
                if (selectedCategory.children && selectedCategory.children.length > 0) {
                    console.log("실행1");
                    console.log("cateogry >>", category);
                    return true;
                } else if (selectedCategory.children?.length === 0) {
                    if (category.parentId) {
                        return true;
                    }

                    return false;
                }
            }

            // 선택된 카테고리가 하위 자식인 경우
            if (selectedCategory && selectedCategory.parentId) {
                // 다른 하위 카테고리로 이동 불가
                if (category.parentId) {
                    return true;
                } else {
                    // 최상위로만 이동 가능
                    return false;
                }
            }

            // 나머지는 활성화
            return false;
        };

        return categories.map((category) => {
            return (
                <React.Fragment key={category.id}>
                    <ListboxOption
                        value={category.id}
                        disabled={isDisabled(category)}
                        className={`cursor-pointer p-3 flex items-center ${isDisabled(category) ? "cursor-not-allowed" : "hover:bg-gray-100"}`}
                        style={{ paddingLeft: `${(level + 1) * 12}px` }} // 들여쓰기 적용. +1을 하지 않으면 level이 0일때 0px이 되기 때문. level이1일때 12px값으로 지정해야함.
                    >
                        {/* 동그라미 직접 만들기 */}
                        <span
                            className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                                selectedParentCategory === category.id
                                    ? "bg-blue-500 border-blue-500"
                                    : category.id === selectedCategory?.id
                                    ? "bg-red-500 border-red-500"
                                    : "border-gray-400"
                            }`}
                        >
                            {/* 선택된 경우 내부에 작은 점 표시 */}
                            {(selectedParentCategory === category.id || category.id === selectedCategory?.id) && (
                                <span className='w-2 h-2 rounded-full bg-white'></span>
                            )}
                        </span>
                        {category.name}
                    </ListboxOption>
                    {/* 하위 카테고리 (children)가 있는 경우 재귀적으로 렌더링 */}
                    {category.children && renderCategoryOptions(category.children, level + 1)}
                </React.Fragment>
            );
        });
    };
    const moveCategory = (sourceId: string, targetId: string, isTopLevelMove: boolean) => {
        setCategories((prevCategories) => {
            // 드래그된 카테고리와 대상 카테고리 찾기
            const sourceCategory = prevCategories.find((cat) => cat.id === sourceId);
            const targetCategory = prevCategories.find((cat) => cat.id === targetId);

            if (!sourceCategory || !targetCategory) return prevCategories;

            // 대상 카테고리가 최상위 카테고리인지 여부 확인
            const isTargetTopLevel = targetCategory.parentId === null;
            const isSourceTopLevel = sourceCategory.parentId === null;

            // 최상위 카테고리를 다른 최상위 카테고리의 하위로 이동
            if (isSourceTopLevel && isTargetTopLevel && !isTopLevelMove) {
                return prevCategories.map((cat) => {
                    // sourceCategory의 parentId를 업데이트
                    if (cat.id === sourceId) {
                        return { ...cat, parentId: targetCategory.id };
                    }
                    // targetCategory의 children에 sourceCategory를 추가
                    if (cat.id === targetId) {
                        const updatedChildren = cat.children
                            ? [...cat.children, { ...sourceCategory, parentId: targetCategory.id }]
                            : [{ ...sourceCategory, parentId: targetCategory.id }];
                        return { ...cat, children: updatedChildren }; // children 배열에 추가
                    }
                    return cat;
                });
            }
            // 최상위 카테고리 간 위치 교환
            if (isSourceTopLevel && isTargetTopLevel && isTopLevelMove) {
                const updatedCategories = prevCategories.filter((cat) => cat.id !== sourceId);
                const targetIndex = prevCategories.findIndex((cat) => cat.id === targetId);
                updatedCategories.splice(targetIndex, 0, sourceCategory);
                return updatedCategories;
            }

            // 최상위 카테고리를 하위로 옮길 때
            // if (isSourceTopLevel && !isTargetTopLevel) {
            //     return prevCategories.map((cat) => {
            //         if (cat.id === sourceId) {
            //             return { ...cat, parentId: targetCategory.id }; // 소스 카테고리의 parentId를 타겟 카테고리로 변경
            //         }
            //         return cat;
            //     });
            // }

            // 나머지 경우 (하위 카테고리 -> 상위 카테고리로 이동) 처리

            return prevCategories
                .map((cat) => {
                    if (cat.id === sourceId) {
                        // 하위 카테고리가 최상위로 이동하는 경우 parentId를 null로 설정
                        if (isTopLevelMove) {
                            return { ...cat, parentId: null }; // 최상위로 이동
                        }
                        // 상위 카테고리의 자식으로 이동하는 경우
                        return { ...cat, parentId: targetCategory.id };
                    }

                    if (cat.id === targetId) {
                        // targetCategory의 children에 sourceCategory 추가
                        const updatedChildren = cat.children
                            ? [...cat.children, { ...sourceCategory, parentId: targetCategory.id }]
                            : [{ ...sourceCategory, parentId: targetCategory.id }];

                        return { ...cat, children: updatedChildren };
                    }

                    return cat;
                })
                .map((cat) => {
                    // 기존 부모 카테고리에서 sourceCategory를 children 배열에서 제거
                    if (cat.id === sourceCategory.parentId) {
                        return {
                            ...cat,
                            children: cat.children.filter((child) => child.id !== sourceId),
                        };
                    }

                    return cat;
                });
        });
    };
    return (
        <>
            <ToastContainer position='top-center' />

            <div className='manage-wrapper min-h-screen w-full bg-gray-100'>
                <CommonSideNavigation />

                <div className='flex-1 flex justify-center'>
                    <section className='container lg:max-w-screen-lg p-8 bg-white shadow-md mt-[9.5rem] ml-[16rem]' aria-label='카테고리 관리'>
                        <h2 className='text-2xl font-bold mb-2'>카테고리 관리</h2>

                        <h3 className='text-xl font-medium text-gray-700 mb-4'>사이트의 카테고리를 생성, 수정 및 관리하세요.</h3>

                        <div className='flex items-center space-x-2'>
                            <input
                                type='text'
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className='w-[45%] px-4 py-2 border border-gray-300 rounded-lg shadow-sm'
                                placeholder='카테고리 이름 입력'
                            />
                            <button
                                onClick={handleAddCategory}
                                className='px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors'
                            >
                                새 카테고리 추가
                            </button>
                        </div>

                        {categories.length !== 0 && (
                            <DndProvider backend={HTML5Backend}>
                                <ul className='space-y-3 mt-4'>
                                    {categories
                                        .filter((category) => category.parentId === null) // 최상위 카테고리 필터링
                                        .map((parentCategory) => (
                                            <>
                                                <CategoryItem
                                                    key={parentCategory.id}
                                                    category={parentCategory}
                                                    index={categories.findIndex((cat) => cat.id === parentCategory.id)}
                                                    moveCategory={moveCategory}
                                                    openModal={openModal}
                                                    deleteCategory={handleDeleteCategory}
                                                    onDragStateChange={(isDragging) => handleDragStateChange(isDragging, parentCategory.id)}

                                                    // parentId={null} // 최상위 카테고리이므로 parentId는 null
                                                />

                                                {/* 2단계 하위 카테고리 */}
                                                {/* 부모가 드래깅 시작하면 그 자식까지 동일한 css  */}
                                                <ul className={`ml-6 space-y-2 ${draggingCategoryId === parentCategory.id ? 'opacity-50 border-blue-500' : ''}`}>
                                                    {categories
                                                        .filter((childCategory) => childCategory.parentId === parentCategory.id)
                                                        .map((childCategory) => (
                                                            <CategoryItem
                                                                key={childCategory.id}
                                                                category={childCategory}
                                                                index={categories.findIndex((cat) => cat.id === childCategory.id)}
                                                                moveCategory={moveCategory}
                                                                openModal={openModal}
                                                                deleteCategory={handleDeleteCategory}
                                                                onDragStateChange={(isDragging) => handleDragStateChange(isDragging, parentCategory.id)}
                                                                // parentId={parentCategory.id} // 2단계의 parentId는 최상위 카테고리
                                                            />

                                                            /* 3단계 하위 카테고리 */
                                                            /* <ul className='ml-6 space-y-2'>
                                                                {categories
                                                                    .filter((subChildCategory) => subChildCategory.parentId === childCategory.id)
                                                                    .map((subChildCategory) => (
                                                                        <li key={subChildCategory.id}>
                                                                            <CategoryItem
                                                                                category={subChildCategory}
                                                                                index={categories.findIndex((cat) => cat.id === subChildCategory.id)}
                                                                                openModal={openModal}
                                                                                deleteCategory={handleDeleteCategory}
                                                                                // parentId={childCategory.id} // 3단계의 parentId는 2단계 카테고리
                                                                            />
                                                                        </li>
                                                                    ))}
                                                            </ul> */
                                                        ))}
                                                </ul>
                                            </>
                                        ))}
                                </ul>
                            </DndProvider>
                        )}
                    </section>
                </div>
            </div>

            {/* 모달 다이얼로그 */}
            <Dialog open={isModalOpen} as='div' onClose={closeModal} className='fixed z-10 inset-0 overflow-y-auto'>
                <div className='flex items-center justify-center min-h-screen'>
                    <DialogBackdrop className='fixed inset-0 bg-black opacity-30' />
                    <DialogPanel
                        transition
                        className='bg-white rounded max-w-sm mx-auto p-6 backdrop-blur-2xl duration-200 ease-out data-[closed]:opacity-0'
                    >
                        <DialogTitle className='text-lg font-bold'>카테고리 편집</DialogTitle>
                        <Description className='mt-1 text-sm font-medium'>
                            <a
                                data-tooltip-id='category-edit-tooltip'
                                data-tooltip-html='&bull; 카테고리의 이름을 변경할 수 있습니다.<br/>&bull; 하위 카테고리에서 최상위 카테고리로 이동할 수 있습니다.<br/>&bull; 하위 카테고리로 이동할 수 있습니다.<br/>&bull; 카테고리는 2단계까지 설정 가능합니다.'
                            >
                                ?
                            </a>
                            <Tooltip id='category-edit-tooltip' place='top' />
                        </Description>
                        {/* <Description className='mt-1 text-sm font-medium'>&bull; 하위 카테고리에서 최상위 카테고리로 이동할 수 있습니다.</Description>
                        <Description className='mt-1 text-sm font-medium'>
                            &bull; 다른 상위 카테고리의 하위 카테고리로 이동할 수 있습니다.
                        </Description>
                        <Description className='mt-1 text-sm font-medium'>&bull; 카테고리는 2단계 까지만 설정 가능합니다.</Description> */}

                        {/* 카테고리 이름 입력 */}
                        <form className='mt-4' onSubmit={handleSaveCategory}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700'>카테고리 이름</label>
                                <input
                                    type='text'
                                    value={selectedCategory?.name || ""}
                                    onChange={(e) => setSelectedCategory({ id: selectedCategory!.id, name: e.target.value })}
                                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                                />
                            </div>

                            {/* 상위 카테고리 선택 */}
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700'>선택된 상위 카테고리</label>
                                <div className='relative'>
                                    <Listbox
                                        value={selectedParentCategory}
                                        onChange={(value) => {
                                            setSelectedParentCategory(value);
                                            console.log("Selected value:", value); // 선택된 값 확인
                                        }}
                                    >
                                        <div className='flex items-center justify-between'>
                                            <ListboxButton className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left'>
                                                {selectedParentCategory
                                                    ? categories.find((cat) => cat.id === selectedParentCategory)?.name
                                                    : "최상위 카테고리"}
                                            </ListboxButton>
                                        </div>

                                        <ListboxOptions
                                            static
                                            className='mt-1 h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-sm'
                                        >
                                            <ListboxOption key='none' value={null} className='cursor-pointer p-3 flex items-center hover:bg-gray-100'>
                                                {/* 동그라미 직접 만들기 */}
                                                <span
                                                    className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                                                        selectedParentCategory === null ? "bg-blue-500 border-blue-500" : "border-gray-400"
                                                    }`}
                                                >
                                                    {/* 선택된 경우 내부에 작은 점 표시 */}
                                                    {selectedParentCategory === null && <span className='w-2 h-2 rounded-full bg-white'></span>}
                                                </span>
                                                최상위 카테고리
                                            </ListboxOption>
                                            {/* 트리 구조 렌더링 시 동그라미 적용 */}
                                            {renderCategoryOptions(categoryTree)}
                                        </ListboxOptions>
                                    </Listbox>
                                </div>
                            </div>

                            <div className='flex justify-end'>
                                <button type='button' onClick={closeModal} className='mr-2 px-4 py-2 bg-gray-300 rounded-md'>
                                    취소
                                </button>
                                <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded-md'>
                                    저장
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};

export default Category;
