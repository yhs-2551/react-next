export interface FileMetadata {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    width?: number;
    height?: number;
}


export interface PostRequest {
    category?: string;
    title: string;
    content: string;
    tags?: string[];
    files?: FileMetadata[];
    deleteTempImageUrls?: string[];
    postStatus: "PUBLIC" | "PRIVATE";
    commentsEnabled: "ALLOW" | "DISALLOW",
    featuredImage?: FileMetadata | null,
}
 

// PostResponse 타입은 수정 페이지 및 디테일 페이지에서 사용

export interface PostResponse {
    id: string;
    categoryName: string | null;
    title: string;
    content: string;
    tags?: string[];
    files?: FileMetadata[];  
    deleteTempImageUrls?: string[];
    postStatus: "PUBLIC" | "PRIVATE";
    commentsEnabled: "ALLOW" | "DISALLOW";
    featuredImage?: FileMetadata;
    createdAt: string; // 디테일 페이지에서 사용
    userName: string; // 디테일 페이지에서 사용
    // commentCount?: number;
    // id?: number;
    // replyCount?: number;
    // updatedAt?: string; // 이것도 admin 페이지에서 관리할지 고민
    // userId?: number | null;
    // views?: number; // 조회수는 따로 admin에서 관리할지, 다른 사용자가 조회했을때 바로 메인 페이지에서 조회수를 보여줄지 고민. 전자가 좋아보임
}