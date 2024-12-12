// 아래 postCount, childrenCount속성은 응답시에만 오는 데이터. 카테고리를 새롭게 생성 후 요청시에는 보내지 않는 데이터.
export interface CategoryType {
    categoryUuidParent?: string | null;
    categoryUuid: string;
    name: string;
    children?: CategoryType[]; // children 필드 추가
    childrenCount?: number; 
    postCount?: number;
}