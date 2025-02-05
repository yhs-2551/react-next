import { CacheTimes } from "@/constants/cache-constants";
import UserDataInitializer from "./components/UserDataInitializer";
import { notFound } from "next/navigation";

export default async function BlogLayout({ children, params }: { children: React.ReactNode; params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;

    const [isUserExistsResponse, userPublicProfileResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/blog-id/exists/${blogId}`, {
            cache: "force-cache",
            next: { tags: [`users-${blogId}-checks`], revalidate: CacheTimes.MODERATE.IS_USER_EXISTS },
        }),

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/${blogId}/profile`, {
            cache: "force-cache",
            next: { tags: ["public-profile"], revalidate: CacheTimes.MODERATE.PUBLIC_PROFILE },
        }),
    ]);

    if (!isUserExistsResponse.ok) {
        notFound();
    }

    if (!userPublicProfileResponse.ok) {
        throw new Error("데이터 로드를 실패 하였습니다.");
    }

    const userPublicProfileData = await userPublicProfileResponse.json();

    const { blogId: userBlogId, blogName, username, profileImageUrl } = userPublicProfileData.data;

    return (
        <>
            <UserDataInitializer blogName={blogName} blogId={userBlogId} blogUsername={username} profileImageUrl={profileImageUrl} />
            {children}
        </>
    );
}
