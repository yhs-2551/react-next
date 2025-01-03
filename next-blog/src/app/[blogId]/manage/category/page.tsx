import ClientWrapper from "@/providers/ClientWrapper";
import Category from "./components/Category";
import AuthCheck from "../../components/AuthCheck";

export default function CategoryPage() {
    return (
        <ClientWrapper usePersist={true}>
            <AuthCheck>
                <Category />
            </AuthCheck>
        </ClientWrapper>
    );
}
 