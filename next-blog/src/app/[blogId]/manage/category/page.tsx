import ClientWrapper from "@/providers/ClientWrapper";
import Category from "./components/Category";
import AuthCheck from "../../components/AuthCheck";

export default async function CategoryPage() {
    return (
        <ClientWrapper>
            <AuthCheck>
                <Category />
            </AuthCheck>
        </ClientWrapper>
    );
}
