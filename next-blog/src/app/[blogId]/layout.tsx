import { CacheTimes } from "@/constants/cache-constants";
import UserDataInitializer from "./components/UserDataInitializer";
import { notFound } from "next/navigation";

export default async function BlogLayout({ children, params }: { children: React.ReactNode; params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;
 
    // 카테고리는 초기에만 uuid값 설정하면, cud작업 이후에 캐시 무효화를 통해 여기 서버 컴포넌트가 재실행되면서, 백엔드에서 설정한 uuid값으로 새롭게 덮어씌워짐. 
    // 즉 카테고리 uuid는 초기에만 프론트에서 설정하고 이후에 값은 백엔드에서 생성한 값으로 사용
    const [isUserExistsResponse, userPublicProfileResponse, categoryResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/blog-id/exists/${blogId}`, {
            cache: "force-cache",
            next: { tags: [`users-${blogId}-checks`], revalidate: CacheTimes.MODERATE.IS_USER_EXISTS },
        }),

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/${blogId}/profile`, {
            cache: "force-cache",
            next: { tags: ["public-profile"], revalidate: CacheTimes.MODERATE.PUBLIC_PROFILE },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
            cache: "force-cache",
            next: { tags: [`${blogId}-categories`], revalidate: CacheTimes.MODERATE.PUBLIC_USER_CATEGORY },
        }),
    ]);

    if (!isUserExistsResponse.ok) {
        notFound();
    }

    if (!userPublicProfileResponse.ok || !categoryResponse.ok) {
        throw new Error("데이터 로드를 실패 하였습니다.");
    }

    const [userPublicProfileData, categoryData] = await Promise.all([userPublicProfileResponse.json(), categoryResponse.json()]);

    const { blogId: userBlogId, blogName, username, profileImageUrl } = userPublicProfileData.data;

    return (
        <>
            <UserDataInitializer
                blogName={blogName}
                blogId={userBlogId}
                blogUsername={username}
                profileImageUrl={profileImageUrl}
                categories={categoryData.data || []}
            />
            {children}
        </>
    );
}