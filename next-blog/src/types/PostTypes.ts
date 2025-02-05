export interface FileMetadata {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    width?: number;
    height?: number;
}


export interface PostRequest {
    categoryName: string | null;
    title: string;
    content: string;
    tags?: string[];
    deletedImageUrlsInFuture?: string[];
    files?: FileMetadata[]; 
    postStatus: "PUBLIC" | "PRIVATE";
    commentsEnabled: "ALLOW" | "DISALLOW",
    featuredImage?: FileMetadata | null,
}
 

// PostResponse 타입은 수정 페이지 및 디테일 페이지에서 사용

export interface PostResponse {
    id: string; // 백엔드 Long값은 string으로 받음. number로 받으면 범위가 적을 수 있음(즉 Long값 범위 > Number값 범위가 발생할수도 있음) 
    categoryName: string | null;
    title: string;
    content: string;
    tags?: string[];
    files?: FileMetadata[];  
    // deleteTempImageUrls?: string[];
    postStatus: "PUBLIC" | "PRIVATE";
    commentsEnabled: "ALLOW" | "DISALLOW";
    featuredImage?: FileMetadata;
    createdAt: string; // 디테일 페이지에서 사용
    username: string; // 디테일 페이지에서 사용
    blogId: string;
    // commentCount?: number;
    // id?: number;
    // replyCount?: number;
    // updatedAt?: string; // 이것도 admin 페이지에서 관리할지 고민
    // userId?: number | null;
    // views?: number; // 조회수는 따로 admin에서 관리할지, 다른 사용자가 조회했을때 바로 메인 페이지에서 조회수를 보여줄지 고민. 전자가 좋아보임
}