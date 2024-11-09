import AuthCheck from "../components/AuthCheck";

export default function ManagePageAuthCheckLayout({ children }: { children: React.ReactNode }) {
    return <AuthCheck>{children}</AuthCheck>;
}
