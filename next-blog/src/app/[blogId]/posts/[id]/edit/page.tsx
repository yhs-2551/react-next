import React from "react";

import ClientWrapper from "@/providers/ClientWrapper";
import AuthCheck from "@/app/[blogId]/components/AuthCheck";
import UserPagePostEditDetailWrapper from "./components/UserPagePostEditDetailWrapper";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostEditPage({ params }: { params: Promise<{ id: string; blogId: string }> }) {
    const { blogId, id } = await params;

    return (
        <div className='container max-w-4xl mt-[120px] mx-auto bg-white'>
            <ClientWrapper>
                <AuthCheck>
                    <UserPagePostEditDetailWrapper blogId={blogId} postId={id} />
                </AuthCheck>
            </ClientWrapper>
        </div>
    );
}
