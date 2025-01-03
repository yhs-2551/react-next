import UserDataInitializer from "./components/UserDataInitializer";

export default async function BlogLayout({ children, params }: { children: React.ReactNode; params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/${blogId}/profile`, {
        cache: "force-cache",
    });

    const res = await response.json();

    const {blogId: userBlogId, username} = res.data;
 

    return (
        <>
            <UserDataInitializer username={username} blogId={userBlogId} />
            {children}
        </>
    );
}
