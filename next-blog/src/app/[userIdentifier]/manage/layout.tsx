import AuthCheck from "../components/AuthCheck";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
    return <AuthCheck>{children}</AuthCheck>;
}
