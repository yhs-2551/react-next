"use client";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ClipLoader from "react-spinners/ClipLoader";

import { TbCategory } from "react-icons/tb";

import React, { useEffect, useRef, useState } from "react";
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

import useAddCategory from "@/customHooks/useAddCategory";
import { useParams } from "next/navigation";
import { CategoryType } from "@/types/CateogryTypes";
import CommonSideNavigation from "@/app/_components/layout/sidebar/CommonSideNavigation";
import { useCategoryStore } from "@/store/appStore";
import { revalidateCategories } from "@/actions/revalidate";
import { CustomHttpError } from "@/utils/CustomHttpError";

// 컴포넌트 외부에 헬퍼 함수 정의
const buildCategoryTree = (categories: CategoryType[]): CategoryType[] => {
    const map = new Map<string, CategoryType>();

    // 모든 카테고리를 map에 저장하면서 children을 초기화.
    categories.forEach((category) => {
        map.set(category.categoryUuid, { ...category });
    });

    const roots: CategoryType[] = [];

    // 각 카테고리를 부모 아래에 배치하거나 최상위로 분류.
    categories.forEach((category) => {
        // 부모가 없으면 최상위 카테고리로 간주하고 roots에 추가.
        roots.push(map.get(category.categoryUuid)!);
    });

    return roots;
};

const Category: React.FC = () => {
    const { categories: categoriesByStore } = useCategoryStore();

    const [isInitialLoad, setIsInitialLoad] = useState(true); // 초기 로드 상태를 추가.

    const [categories, setCategories] = useState<CategoryType[]>(categoriesByStore); // 초기 렌더링 시에만 초기값 적용, 이후 재렌더링 시에는 이미 state값이 있으므로 categoriesByStore초기값 무시
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string | null>(null);

    const categoryInputRef = useRef<HTMLInputElement>(null); // 카테고리 입력창 ref

    const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null); // 드래그 중인 카테고리 ID 저장
    const [draggingFromChild, setDraggingFromChild] = useState<boolean>(false); // 자식이 드래깅 중인지 상태 저장

    const [isButtonVisible, setIsButtonVisible] = useState<boolean>(false);

    const categoryToDeleteRef = useRef<CategoryType[] | null>(null);

    const params = useParams();
    const blogId = params.blogId as string;

    const createCategoryMutation = useAddCategory(blogId);

    useEffect(() => {
        if (categoryInputRef.current) {
            categoryInputRef.current.focus();
        }
    }, []);

    /* 
    카테고리 변경 후 변경사항 저장버튼 클릭하자마자 새로고침을 하게되면 캐시 무효화 전에 새로고침을 하기 때문에 되면 DB에는 저장되는데,
     캐시 데이터는 이전 캐시 데이터를 가지고 있게 되어 데이터 결함이 발생하게 됨. 따라서 아래와 같이 useEffect 캐시 무효화 로직 추가
    */
    useEffect(() => {
        const validateCategories = async () => {
            if (blogId) {
                const crs = localStorage.getItem("category_revalidation_status");

                if (crs === "pending") {
                    await revalidateCategories(blogId);
                    localStorage.removeItem("category_revalidation_status");
                }
            }
        };

        validateCategories();
    }, []);

    /* 바로 위의 캐시 무효화 로직과 관련있음 위에서 캐시 무효화 revalidateCategories를 하게 되면 해당 revalidateTag(`${blogId}-categories`);를 사용하고 있는 layout.tsx 서버 컴포넌트가 재실행. 
     이에 따라 전역 스토어에 categories가 업데이트 되어 아래 로직과 같이 전역 스토어에서 최신 categories를 불러서 사용해야 함
     */
    useEffect(() => {
        setCategories(categoriesByStore);
    }, [categoriesByStore]);

    const categoryTree = buildCategoryTree(categories); // 이 부분은 렌더링 전에 위치

    const resetUIStates = async () => {
        if (isInitialLoad) {
            setIsInitialLoad(false); // 초기 로드 상태 변경. 변경사항 저장 버튼 활성화
        }

        if (!isButtonVisible) {
            setIsButtonVisible(true);
        }

        if (createCategoryMutation.isSuccess) {
            // muation success를 초기화 함으로써 저장 완료 버튼에서 변경사항 저장 버튼으로 다시 변경
            createCategoryMutation.reset();
        }
    };

    const handleDragStateChange = (isDragging: boolean, categoryId: string, isChild = false) => {
        if (!isChild) {
            setDraggingCategoryId(isDragging ? categoryId : null); // 부모가 드래깅 중일 때만 ID 저장
        }
        setDraggingFromChild(isDragging && isChild); // 자식이 드래깅 중인 상태 저장
    };
    const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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

        const isDuplicateName = categories.some(
            (category) =>
                category.name === newCategoryName.trim() ||
                (category.children && category.children.length !== 0 && category.children.some((child) => child.name === newCategoryName.trim()))
        );

        if (isDuplicateName) {
            toast.error(
                <span>
                    <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;{" "}
                    <span style={{ fontSize: "0.9rem" }}>이미 존재하는 카테고리 이름입니다.</span>
                </span>
            );
            return;
        }

        resetUIStates(); // toast error 앞쪽에서 호출하면 토스트 에러 알림창이 나오면서 동시에 변경사항 저장 버튼이 활성화 되는 문제가 있기 때문에, 뒤쪽에서 호출

        setCategories([...categories, { categoryUuid: uuidv4(), name: newCategoryName, categoryUuidParent: null, children: [] }]);
        setNewCategoryName("");
    };

    const openModal = (category: CategoryType | null) => {
        setSelectedCategory(category);
        setSelectedParentCategoryId(category?.categoryUuidParent || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);

        // 저장하면 setSelectedCategory값이 null이 됨에 따라 UI상에서 빨간색 동그라미 스타일 사라지는 현상 해결을 위해 setTimeout 사용
        setTimeout(() => {
            setSelectedCategory(null);
        }, 200);
    };
    const handleSaveCategoryFromModal = (e: React.FormEvent) => {
        resetUIStates();

        e.preventDefault();
        if (selectedCategory) {
            const updatedCategories = categories
                .map((category) => {
                    // 기존 부모에서 선택된 카테고리 제거
                    if (category.categoryUuid === selectedCategory.categoryUuidParent) {
                        const updatedChildren = category.children?.filter((child) => child.categoryUuid !== selectedCategory.categoryUuid);
                        return { ...category, children: updatedChildren };
                    }

                    // 새 부모의 children에 선택된 카테고리를 추가
                    if (category.categoryUuid === selectedParentCategoryId) {
                        const updatedChildren = category.children
                            ? [...category.children, { ...selectedCategory, categoryUuidParent: selectedParentCategoryId }]
                            : [{ ...selectedCategory, categoryUuidParent: selectedParentCategoryId }];
                        return { ...category, children: updatedChildren };
                    }

                    return category;
                })
                .filter(Boolean) as CategoryType[];

            if (selectedParentCategoryId) {
                // 최상위 카테고리에서 하위로 이동할 때만 최상위에서 해당 카테고리 제거
                setCategories(updatedCategories.filter((cat) => cat.categoryUuid !== selectedCategory.categoryUuid));
            } else {
                // 최상위로 이동할 때 최상위에 추가
                setCategories([
                    ...updatedCategories.filter((cat) => cat.categoryUuid !== selectedCategory.categoryUuid),
                    { ...selectedCategory, categoryUuidParent: null },
                ]);
            }

            closeModal();

            // 선택된 카테고리 초기화
            setTimeout(() => {
                setSelectedCategory(null);
            }, 200);
        }
    };

    const handleSaveCategoryToServer = () => {
        localStorage.setItem("category_revalidation_status", "pending");

        const categoryPayLoad = {
            categories,
            categoryToDelete: categoryToDeleteRef.current,
        };

        const onSuccess = async () => {
            try {
                await revalidateCategories(blogId); // 성공 후 캐시 무효화9해당 서버컴포넌트 재실행 됨)
            } finally {
                localStorage.removeItem("category_revalidation_status");
            }
        };

        const onError = (error: unknown) => {
            if (error instanceof CustomHttpError) {
                if (error.status === 401) {

                    localStorage.removeItem("access_token");

                    toast.error(
                        <span style={{ whiteSpace: "pre-line" }}>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>,
                        {
                            onClose: () => {
                                window.location.reload();
                            },
                        }
                    );
                } else {
                    console.error("카테고리 저장 실패 CustomHttpError:", error); // 오류 로그 확인
                    toast.error(
                        <span style={{ whiteSpace: "pre-line" }}>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>,
                        {
                            onClose: () => {},
                        }
                    );
                }
            } else {
                console.error("카테고리 저장 실패 Unknown Error:", error);
            }
        };

        createCategoryMutation.mutate(categoryPayLoad, { onSuccess, onError });
        categoryToDeleteRef.current = null; // 삭제할 카테고리 초기화. 서버로 요청을 보낸 후 삭제할 카테고리 초기화 하지 않으면, 다음 요청 시 삭제할 카테고리가 남아있어 오류가 발생하게 됨
    };

    // 카테고리 삭제 (자식 카테고리는 삭제하지 않음)
    const handleDeleteCategory = (categoryId: string) => {
        resetUIStates();

        const categoryToDelete =
            categories.find((category) => category.categoryUuid === categoryId) ||
            categories.flatMap((category) => category.children || []).find((child) => child.categoryUuid === categoryId); // flatMap을 통해 children 배열을 하나의 배열로 평탄화하고, 해당 카테고리를 찾음

        if (categoryToDelete) {
            // categoryToDeleteRef가 null일 경우 빈 배열로 초기화. 초기값을 null로 설정했기 때문에 필요. 즉 초기값을 null로 설정했기 때문에 아래 조건식에서 !null이 되어 true가 됨.
            if (!categoryToDeleteRef.current) {
                categoryToDeleteRef.current = [];
            }

            categoryToDeleteRef.current = [...categoryToDeleteRef.current, categoryToDelete];
        }

        // 최상위 카테고리이고 자식을 가진 경우 삭제 중단 및 최상위 카테고리, 자식 카테고리 각각 post를 가진 경우 삭제 중단.

        if (
            (categoryToDelete && categoryToDelete.categoryUuidParent === null && categoryToDelete.children && categoryToDelete.children.length > 0) ||
            (categoryToDelete && categoryToDelete.postCount! > 0)
        ) {
            return;
        }

        const updatedCategories = categories
            .filter((category) => category.categoryUuid !== categoryId)
            .map((category) => {
                if (category.children) {
                    return {
                        ...category,
                        children: category.children.filter((child) => child.categoryUuid !== categoryId),
                    };
                }
                return category;
            });

        setCategories(updatedCategories);
    };
    const renderCategoryOptions = (categories: CategoryType[], level: number = 0) => {
        const isDisabled = (category: CategoryType) => {
            // 선택된 카테고리 자체를 비활성화
            if (category.categoryUuid === selectedCategory?.categoryUuid) return true;

            // 선택된 카테고리가 최상위 카테고리일 경우, 해당 카테고리와 그 하위 카테고리만 비활성화
            if (selectedCategory && selectedCategory.categoryUuidParent === null) {
                // 최상위 카테고리와 그 하위 카테고리 비활성화
                if (category.categoryUuidParent === selectedCategory.categoryUuid) {
                    return true;
                }
                if (selectedCategory.children && selectedCategory.children.length > 0) {
                    return true;
                } else if (!selectedCategory.children || selectedCategory.children.length === 0) {
                    if (category.categoryUuidParent) {
                        return true;
                    }

                    return false;
                }
            }

            // 선택된 카테고리가 하위 자식인 경우
            if (selectedCategory && selectedCategory.categoryUuidParent) {
                // 다른 하위 카테고리로 이동 불가
                if (category.categoryUuidParent) {
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
                <React.Fragment key={category.categoryUuid}>
                    <ListboxOption
                        value={category.categoryUuid}
                        disabled={isDisabled(category)}
                        className={`p-3 flex items-center ${isDisabled(category) ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"}`}
                        style={{ paddingLeft: `${(level + 1) * 12}px` }} // 들여쓰기 적용. +1을 하지 않으면 level이 0일때 0px이 되기 때문. level이1일때 12px값으로 지정해야함.
                    >
                        {/* 동그라미 직접 만들기 */}
                        <span
                            className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                                selectedParentCategoryId === category.categoryUuid
                                    ? "bg-[#333] border-[#333]"
                                    : category.categoryUuid === selectedCategory?.categoryUuid
                                    ? "bg-red-500 border-red-500"
                                    : "border-gray-400"
                            }`}
                        >
                            {/* 선택된 경우 내부에 작은 점 표시 */}
                            {(selectedParentCategoryId === category.categoryUuid || category.categoryUuid === selectedCategory?.categoryUuid) && (
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
        resetUIStates();

        setCategories((prevCategories: CategoryType[]) => {
            // 드래그된 카테고리와 대상 카테고리 찾기
            let sourceCategory = prevCategories.find((cat) => cat.categoryUuid === sourceId);
            let targetCategory = prevCategories.find((cat) => cat.categoryUuid === targetId);

            if (!sourceCategory || !targetCategory) {
                prevCategories.forEach((cat) => {
                    if (!sourceCategory && cat.children) {
                        sourceCategory = cat.children.find((child) => child.categoryUuid === sourceId);
                    }
                    if (!targetCategory && cat.children) {
                        targetCategory = cat.children.find((child) => child.categoryUuid === targetId);
                    }
                });
            }

            if (!sourceCategory || !targetCategory) return prevCategories;

            // 대상 카테고리가 최상위 카테고리인지 여부 확인
            const isTargetTopLevel = targetCategory.categoryUuidParent === null;
            const isSourceTopLevel = sourceCategory.categoryUuidParent === null;

            // 최상위 카테고리를 다른 최상위 카테고리의 하위로 이동
            if (isSourceTopLevel && isTargetTopLevel && !isTopLevelMove) {
                return prevCategories
                    .filter((cat) => cat.categoryUuid !== sourceId) // 최상위에서 sourceCategory 제거
                    .map((cat) => {
                        if (cat.categoryUuid === targetId) {
                            // targetCategory의 children에 sourceCategory 추가
                            const updatedChildren = cat.children
                                ? [...cat.children, { ...sourceCategory, categoryUuidParent: targetCategory!.categoryUuid }]
                                : [{ ...sourceCategory, categoryUuidParent: targetCategory!.categoryUuid }];
                            return { ...cat, children: updatedChildren };
                        }
                        return cat;
                    }) as CategoryType[];
            }

            // 최상위 카테고리 간 위치 교환
            if (isSourceTopLevel && isTargetTopLevel && isTopLevelMove) {
                const updatedCategories = prevCategories.filter((cat) => cat.categoryUuid !== sourceId);
                const targetIndex = prevCategories.findIndex((cat) => cat.categoryUuid === targetId);
                updatedCategories.splice(targetIndex, 0, sourceCategory);
                return updatedCategories as CategoryType[];
            }

            // 하위 카테고리를 최상위 카테고리로 이동하는 경우에 사용.
            if (!isSourceTopLevel && isTopLevelMove) {
                const updatedCategories = prevCategories.map((cat) => {
                    // 기존 부모 카테고리에서 sourceCategory를 children 배열에서 제거
                    if (cat.categoryUuid === sourceCategory!.categoryUuidParent) {
                        return {
                            ...cat,
                            children: cat.children?.filter((child) => child.categoryUuid !== sourceId),
                        };
                    }
                    return cat;
                });

                // 부모 카테고리의 바로 아래로 sourceCategory를 최상위로 추가
                const parentIndex = updatedCategories.findIndex((cat) => cat.categoryUuid === sourceCategory!.categoryUuidParent);
                updatedCategories.splice(parentIndex + 1, 0, { ...sourceCategory, categoryUuidParent: null });

                return updatedCategories as CategoryType[];
            }

            //  하위 카테고리를 다른 상위 카테고리의 자식으로 이동하거나, 최상위로 이동하는 경우에 사용.
            return prevCategories
                .filter((cat) => cat.categoryUuid !== sourceId || isTopLevelMove) // 하위로 이동 시 최상위에서 제거
                .map((cat) => {
                    if (cat.categoryUuid === sourceId) {
                        // 하위 카테고리가 최상위로 이동하는 경우 parentId를 null로 설정
                        if (isTopLevelMove) {
                            return { ...cat, categoryUuidParent: null }; // 최상위로 이동
                        }
                        // 상위 카테고리의 자식으로 이동하는 경우
                        return { ...cat, categoryUuidParent: targetCategory!.categoryUuid };
                    }

                    if (cat.categoryUuid === targetId) {
                        // targetCategory의 children에 sourceCategory 추가
                        const updatedChildren = cat.children
                            ? [...cat.children, { ...sourceCategory, categoryUuidParent: targetCategory!.categoryUuid }]
                            : [{ ...sourceCategory, categoryUuidParent: targetCategory!.categoryUuid }];

                        return { ...cat, children: updatedChildren };
                    }

                    return cat;
                })
                .map((cat) => {
                    // 기존 부모 카테고리에서 sourceCategory를 children 배열에서 제거
                    if (cat.categoryUuid === sourceCategory!.categoryUuidParent) {
                        return {
                            ...cat,
                            children: cat.children?.filter((child) => child.categoryUuid !== sourceId),
                        };
                    }

                    return cat;
                }) as CategoryType[];
        });
    };

    return (
        <>
            <ToastContainer position='top-center' />

            <div className='manage-wrapper min-h-screen w-full bg-manageBgColor'>
                <CommonSideNavigation />

                <div className='flex-1 flex justify-center'>
                    <section className='container lg:max-w-screen-lg bg-white shadow-md mt-[9.5rem] mb-[5rem] ml-[16rem]' aria-label='카테고리 관리'>
                        <div className='p-8'>
                            <div className='flex justify-between'>
                                <h2 className='text-2xl font-bold mb-2'>카테고리 관리</h2>

                                <TbCategory className='text-[1.7rem]' />
                            </div>

                            <h3 className='text-xl font-medium text-gray-700'>사이트의 카테고리를 생성, 수정 및 관리하세요.</h3>

                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <p className='text-gray-500 text-base font-normal'>드래그 앤 드롭으로 카테고리 순서를 변경할 수 있습니다.</p>
                                    <a
                                        className='inline-block ml-2 text-gray-500  text-sm'
                                        data-tooltip-id='dragAndDrop-tooltip'
                                        data-tooltip-html='&bull; 카테고리는 2단계까지 설정 가능합니다.<br/> &bull; 드래그시 왼쪽 부분은 상위 카테고리로 이동할 수 있습니다.<br/>&bull; 드래그시 오른쪽 부분은 하위 카테고리로 이동할 수 있습니다.</br>&bull; 하위 카테고리를 가지고 있는 상위 카테고리는 상위 카테고리간 이동만 가능합니다.'
                                    >
                                        ?
                                    </a>
                                    <Tooltip className='' id='dragAndDrop-tooltip' place='top' />
                                </div>

                                <form onSubmit={handleAddCategory}>
                                    <fieldset className='flex items-center space-x-2 right-0'>
                                        <legend className='sr-only'>새 카테고리 추가 입력란</legend>
                                        <input
                                            ref={categoryInputRef}
                                            type='text'
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className='w-[22rem] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none'
                                            placeholder='카테고리 이름 입력'
                                        />
                                        <button className='w-[9rem] font-medium text-sm px-4 py-2 shadow-md bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md transition-all'>
                                            새 카테고리 추가
                                        </button>
                                    </fieldset>
                                </form>
                            </div>

                            {categories.length !== 0 && (
                                <DndProvider backend={HTML5Backend}>
                                    <ul className='space-y-3 mt-7'>
                                        {categories.map(
                                            (parentCategory) => (
                                                console.log("parentCategory", parentCategory),
                                                (
                                                    <React.Fragment key={parentCategory.categoryUuid}>
                                                        <CategoryItem
                                                            category={parentCategory}
                                                            index={categories.findIndex((cat) => cat.categoryUuid === parentCategory.categoryUuid)}
                                                            moveCategory={moveCategory}
                                                            openModal={openModal}
                                                            deleteCategory={handleDeleteCategory}
                                                            onDragStateChange={(isDragging) =>
                                                                handleDragStateChange(isDragging, parentCategory.categoryUuid)
                                                            }
                                                            isDeleteDisabled={
                                                                (parentCategory.categoryUuidParent === null &&
                                                                    parentCategory.children &&
                                                                    parentCategory.children?.length > 0) ||
                                                                parentCategory.postCount! > 0
                                                            }
                                                        />

                                                        {/* 2단계 하위 카테고리 */}
                                                        {/* 부모가 드래깅 시작하면 그 자식까지 동일한 css  */}
                                                        {parentCategory.children && (
                                                            <ul
                                                                className={`ml-6 space-y-2 ${
                                                                    draggingCategoryId === parentCategory.categoryUuid && !draggingFromChild
                                                                        ? "opacity-50 border-blue-500"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {parentCategory.children.map((childCategory, childIdx) => (
                                                                    <CategoryItem
                                                                        key={childCategory.categoryUuid}
                                                                        category={childCategory}
                                                                        index={childIdx}
                                                                        moveCategory={moveCategory}
                                                                        openModal={openModal}
                                                                        deleteCategory={handleDeleteCategory}
                                                                        onDragStateChange={(isDragging) =>
                                                                            handleDragStateChange(isDragging, parentCategory.categoryUuid, true)
                                                                        }
                                                                        isDeleteDisabled={childCategory.postCount! > 0}
                                                                    />
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </React.Fragment>
                                                )
                                            )
                                        )}
                                    </ul>
                                </DndProvider>
                            )}
                        </div>

                        {/* 최종 저장 버튼 */}
                        <div className='px-8 py-5 flex justify-end mt-6 bg-[#FAFBFC]'>
                            <button
                                onClick={handleSaveCategoryToServer}
                                disabled={isInitialLoad || createCategoryMutation.isPending || createCategoryMutation.isSuccess}
                                className={`w-[9rem] font-medium text-sm px-4 py-2   ${
                                    isButtonVisible && !createCategoryMutation.isSuccess
                                        ? "cursor-pointer shadow-md  bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md transition-all"
                                        : "cursor-not-allowed bg-white text-gray-400 border-2 border-manageBgColor"
                                }`}
                            >
                                {createCategoryMutation.isSuccess && !createCategoryMutation.isPending ? (
                                    "저장 완료"
                                ) : createCategoryMutation.isPending ? (
                                    <ClipLoader color='#ffffff' size={20} />
                                ) : (
                                    "변경사항 저장"
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* 모달 다이얼로그 */}
            <Dialog open={isModalOpen} as='div' onClose={closeModal} className='fixed z-10 inset-0 overflow-y-auto'>
                <div className='flex items-center justify-center min-h-screen'>
                    <DialogBackdrop className='fixed inset-0 bg-black opacity-30' />
                    <DialogPanel
                        transition
                        className='w-[60%] bg-white rounded max-w-sm mx-auto p-6 backdrop-blur-2xl duration-200 ease-out data-[closed]:opacity-0'
                    >
                        <div className='flex'>
                            <DialogTitle className='text-lg font-bold'>카테고리 편집</DialogTitle>
                            <Description className='mt-1 text-sm font-medium'>
                                <a
                                    className='inline-block ml-2 text-gray-500 text-sm'
                                    data-tooltip-id='category-edit-tooltip'
                                    data-tooltip-html='&bull; 카테고리의 이름을 변경할 수 있습니다.<br/>&bull; 하위 카테고리에서 최상위 카테고리로 이동할 수 있습니다.<br/>&bull; 상위 카테고리에서 하위 카테고리로 이동할 수 있습니다.<br/>&bull; 카테고리는 2단계까지 설정 가능합니다.'
                                >
                                    ?
                                </a>
                                <Tooltip id='category-edit-tooltip' place='top' />
                            </Description>
                        </div>

                        {/* 카테고리 이름 입력 */}
                        <form className='mt-4' onSubmit={handleSaveCategoryFromModal}>
                            <fieldset>
                                <legend className='sr-only'>카테고리 편집 모달</legend>

                                <div className='mb-3'>
                                    <label className='block text-sm font-medium text-gray-700'>카테고리 이름</label>
                                    <input
                                        type='text'
                                        value={selectedCategory?.name || ""}
                                        onChange={(e) => setSelectedCategory({ categoryUuid: selectedCategory!.categoryUuid, name: e.target.value })}
                                        className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                                    />
                                </div>

                                {/* 상위 카테고리 선택 */}
                                <div className='mb-3'>
                                    <label className='block text-sm font-medium text-gray-700'>선택된 상위 카테고리</label>
                                    <div className='relative'>
                                        <Listbox
                                            value={selectedParentCategoryId}
                                            onChange={(value) => {
                                                setSelectedParentCategoryId(value);
                                            }}
                                        >
                                            <div className='flex items-center justify-between mb-3'>
                                                <ListboxButton className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left'>
                                                    {selectedParentCategoryId
                                                        ? categories.find((cat) => cat.categoryUuid === selectedParentCategoryId)?.name
                                                        : "최상위 카테고리"}
                                                </ListboxButton>
                                            </div>

                                            <ListboxOptions
                                                static
                                                className='mt-1 h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-sm'
                                            >
                                                <ListboxOption
                                                    key='none'
                                                    value={null}
                                                    className='cursor-pointer p-3 flex items-center hover:bg-gray-100'
                                                >
                                                    {/* 동그라미 직접 만들기 */}
                                                    <span
                                                        className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
                                                            selectedParentCategoryId === null ? "bg-[#333] border-[#333]" : "border-gray-400"
                                                        }`}
                                                    >
                                                        {/* 선택된 경우 내부에 작은 점 표시 */}
                                                        {selectedParentCategoryId === null && <span className='w-2 h-2 rounded-full bg-white'></span>}
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
                                    <button
                                        type='button'
                                        onClick={closeModal}
                                        className='mr-2 px-4 py-2 bg-white text-black rounded-md focus:outline-none hover:bg-gray-50 active:bg-gray-100 border border-gray-300'
                                    >
                                        취소
                                    </button>
                                    <button
                                        type='submit'
                                        className='px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none active:bg-gray-800'
                                    >
                                        저장
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};

export default Category;
