export interface CategoryType {
    categoryUuidParent?: string | null;
    categoryUuid: string;
    name: string;
    children?: CategoryType[]; // children 필드 추가
}