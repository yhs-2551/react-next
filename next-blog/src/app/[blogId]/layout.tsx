import UserDataInitializer from "./components/UserDataInitializer";

export default async function BlogLayout({ children, params }: { children: React.ReactNode; params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;

    const [userResponse, categoryResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/${blogId}/profile`, {
            cache: "force-cache",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
            cache: "force-cache",
            next: { tags: [`${blogId}-categories`] },
        }),
    ]);

    if (!userResponse.ok || !categoryResponse.ok) {
        throw new Error("데이터 로드를 실패 하였습니다.");
    }

    const [userData, categoryData] = await Promise.all([userResponse.json(), categoryResponse.json()]);

    console.log("userData", userData);

    const { blogId: userBlogId, blogName, username, profileImageUrl } = userData.data;

    return (
        <>
            <UserDataInitializer
                publicBlogName={blogName}
                publicBlogId={userBlogId}
                publicBlogUsername={username}
                publicBlogProfileImageUrl={profileImageUrl}
                categories={categoryData.data || []}
            />
            {children}
        </>
    );
}
