// "use client";

// import React, { useEffect } from "react";
// import CommonSideNavigation from "../../(common-side-navigation)/CommonSideNavigation";

// function Tag() {

//     // function parseJwt(token: string) {
//     //     try {
//     //         const base64Url = token.split('.')[1];
//     //         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     //         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//     //             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     //         }).join(''));
//     //         return JSON.parse(jsonPayload);
//     //     } catch (error) {
//     //         console.error('Invalid token:', error);
//     //         return null;
//     //     }
//     // }

//     // useEffect(() => {
//     //     const token = localStorage.getItem('access_token');

//     //     console.log("token >>>", token);

//     //     if (token) {
//     //         const decodedToken = parseJwt(token);
//     //         console.log('Token payload:', decodedToken);
//     //     }
//     // }, []);
    
//     // 사용예시

    

//     return (
//         <div className='manage-wrapper min-h-screen w-full bg-manageBgColor'>
//             <CommonSideNavigation />

//             <div className='flex-1 flex justify-center'>
//                     <section className='container lg:max-w-screen-lg bg-white shadow-md mt-[9.5rem] mb-[5rem] ml-[16rem]' aria-label='카테고리 관리'>
//                         <div className='p-8'>
//                             <div className='flex justify-between'>
//                                 <h2 className='text-2xl font-bold mb-2'>카테고리 관리</h2>

//                                 <TbCategory className='text-[1.7rem]' />
//                             </div>

//                             <h3 className='text-xl font-medium text-gray-700'>사이트의 카테고리를 생성, 수정 및 관리하세요.</h3>

//                             <div className='flex justify-between'>
//                                 <div className='flex items-center'>
//                                     <p className='text-gray-500 text-base font-normal'>드래그 앤 드롭으로 카테고리 순서를 변경할 수 있습니다.</p>
//                                     <a
//                                         className='inline-block ml-2 text-gray-500  text-sm'
//                                         data-tooltip-id='dragAndDrop-tooltip'
//                                         data-tooltip-html='&bull; 카테고리는 2단계까지 설정 가능합니다.<br/> &bull; 드래그시 왼쪽 부분은 상위 카테고리로 이동할 수 있습니다.<br/>&bull; 드래그시 오른쪽 부분은 하위 카테고리로 이동할 수 있습니다.</br>&bull; 하위 카테고리를 가지고 있는 상위 카테고리는 상위 카테고리간 이동만 가능합니다.'
//                                     >
//                                         ?
//                                     </a>
//                                     <Tooltip className='' id='dragAndDrop-tooltip' place='top' />
//                                 </div>

//                                 <form onSubmit={handleAddCategory}>
//                                     <fieldset className='flex items-center space-x-2 right-0'>
//                                         <legend className='sr-only'>새 카테고리 추가 입력란</legend>
//                                         <input
//                                             ref={categoryInputRef}
//                                             type='text'
//                                             value={newCategoryName}
//                                             onChange={(e) => setNewCategoryName(e.target.value)}
//                                             className='w-[22rem] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none'
//                                             placeholder='카테고리 이름 입력'
//                                         />
//                                         <button className='w-[9rem] font-medium text-sm px-4 py-2 shadow-md bg-customGray text-white hover:bg-[#505050] hover:shadow-md transition-all'>
//                                             새 카테고리 추가
//                                         </button>
//                                     </fieldset>
//                                 </form>
//                             </div>

//                             {categories.length !== 0 && (
//                                 <DndProvider backend={HTML5Backend}>
//                                     <ul className='space-y-3 mt-7'>
//                                         {categories.map((parentCategory) => (
//                                             <React.Fragment key={parentCategory.categoryUuid}>
//                                                 <CategoryItem
//                                                     category={parentCategory}
//                                                     index={categories.findIndex((cat) => cat.categoryUuid === parentCategory.categoryUuid)}
//                                                     moveCategory={moveCategory}
//                                                     openModal={openModal}
//                                                     deleteCategory={handleDeleteCategory}
//                                                     onDragStateChange={(isDragging) => handleDragStateChange(isDragging, parentCategory.categoryUuid)}
//                                                     isDeleteDisabled={
//                                                         parentCategory.categoryUuidParent === null &&
//                                                         parentCategory.children &&
//                                                         parentCategory.children.length > 0
//                                                     }
//                                                 />

//                                                 {/* 2단계 하위 카테고리 */}
//                                                 {/* 부모가 드래깅 시작하면 그 자식까지 동일한 css  */}
//                                                 {parentCategory.children && (
//                                                     <ul
//                                                         className={`ml-6 space-y-2 ${
//                                                             draggingCategoryId === parentCategory.categoryUuid && !draggingFromChild
//                                                                 ? "opacity-50 border-blue-500"
//                                                                 : ""
//                                                         }`}
//                                                     >
//                                                         {parentCategory.children.map((childCategory, childIdx) => (
//                                                             <CategoryItem
//                                                                 key={childCategory.categoryUuid}
//                                                                 category={childCategory}
//                                                                 index={childIdx}
//                                                                 moveCategory={moveCategory}
//                                                                 openModal={openModal}
//                                                                 deleteCategory={handleDeleteCategory}
//                                                                 onDragStateChange={(isDragging) =>
//                                                                     handleDragStateChange(isDragging, parentCategory.categoryUuid, true)
//                                                                 }
//                                                             />
//                                                         ))}
//                                                     </ul>
//                                                 )}
//                                             </React.Fragment>
//                                         ))}
//                                     </ul>
//                                 </DndProvider>
//                             )}
//                         </div>

                     
//                         <div className='px-8 py-5 flex justify-end mt-6 bg-[#FAFBFC]'>
//                             <button
//                                 onClick={handleSaveCategoryToServer}
//                                 disabled={isInitialLoad || createCategoryMutation.isLoading || createCategoryMutation.isSuccess || isFetching}
//                                 className={`w-[9rem] font-medium text-sm px-4 py-2   ${
//                                     isButtonVisible && !createCategoryMutation.isSuccess
//                                         ? "cursor-pointer shadow-md  bg-[#333] text-white hover:bg-[#505050] hover:shadow-md transition-all"
//                                         : "cursor-not-allowed bg-white text-gray-400 border-2 border-manageBgColor"
//                                 }`}
//                             >
//                                 {createCategoryMutation.isSuccess ? (
//                                     "저장 완료"
//                                 ) : createCategoryMutation.isLoading ? (
//                                     <ClipLoader color='#ffffff' size={20} />
//                                 ) : (
//                                     "변경사항 저장"
//                                 )}
//                             </button>
//                         </div>
//                     </section>
//                 </div>

//         </div>
//     );
// }

// export default Tag;
