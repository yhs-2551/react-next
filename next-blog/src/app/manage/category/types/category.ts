export interface CategoryType {
    parentId?: string | null;
    id: string;
    name: string;
    children?: CategoryType[]; // children 필드 추가
}