import ClientWrapper from "@/providers/ClientWrapper";
import Category from "./components/Category";

export default function categoryPage() {
    return (
        // 카테고리에서만 persist 사용
        <ClientWrapper usePersist={true}>
            <Category />
        </ClientWrapper>
    );
}
