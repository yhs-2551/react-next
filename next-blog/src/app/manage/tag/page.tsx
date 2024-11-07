import ClientWrapper from "@/providers/ClientWrapper";
import Tag from "./components/Tag";

export default function tagPage() {
    return (
        <ClientWrapper usePersist={true}>
            <Tag />
        </ClientWrapper>
    );
}
