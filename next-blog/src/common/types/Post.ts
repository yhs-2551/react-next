export interface File {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
}

export interface Post {
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
    userName: string;
    files?: File[]; // 파일 타입 추가
    // commentCount?: number;
    // id?: number;
    // replyCount?: number;
    // updatedAt?: string; // 이것도 admin 페이지에서 관리할지 고민
    // userId?: number | null;
    // views?: number; // 조회수는 따로 admin에서 관리할지, 다른 사용자가 조회했을때 바로 메인 페이지에서 조회수를 보여줄지 고민. 전자가 좋아보임
}