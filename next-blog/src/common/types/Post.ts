export interface Post {
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
    userName: string;
    // commentCount: number;
    // id: number;
    // replyCount: number;
    // updatedAt: string; 이것도 admin 페이지에서 관리할지 고민
    // userId: number | null;
    // userName: string | null; 사용자명은 상세페이지에서 보여줄 지 고미
    // views: number; // 조회수는 따로 admin에서 관리할지, 다른 사용자가 조회했을때 바로 메인 페이지에서 조회수를 보여줄지 고민. 전자가 좋아보임
}