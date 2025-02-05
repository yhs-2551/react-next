// 아래 postCount 응답시에만 오는 데이터. 카테고리를 새롭게 생성 후 요청시에는 보내지 않는 데이터.
export interface CategoryType {
    categoryUuidParent?: string | null;
    categoryUuid: string;
    name: string;
    children?: CategoryType[]; // children 필드 추가 
    postCount: number;
    isNew?: boolean; // 프론트에서 새롭게 생성하고 삭제할 시 서버로 해당 카테고리는 삭제 요청에 포함시키지 않음
}