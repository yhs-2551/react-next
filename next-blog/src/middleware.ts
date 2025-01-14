import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // console.log("미들웨어 실행 >>>>>>>>>>>>");
    // // URL localhost:3000/iceame/posts의 경우: pathname = "/iceame/posts", username = "iceame"
    // const pathname = request.nextUrl.pathname;
    // const blogId = pathname.split("/")[1]; // /로 스플릿한 결과 ["", "iceame", "posts"] 중 두 번째 요소

    // if (blogId) {
    //     try {
                        
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/blog-id/exists/${blogId}`);

    //         if (!response.ok) {

    //             // url은 유지하면서 404 페이지를 보여주기 위해 rewrite 사용. url을 변경하고 싶다면 redirect
    //             return NextResponse.rewrite(new URL("/404", request.url));
    //         }
            
           
    //         return NextResponse.next(); // 사용자가 있으면 다음 미들웨어 실행

    //     } catch (error) {
    //         return NextResponse.rewrite(new URL("/404", request.url));
    //     }
    // }

    // return NextResponse.next();
}

export const config = {
    // 아래 경로로 갈때만 미들웨어 실행
    // matcher: ["/:blogId/posts/:path*", "/:blogId/manage/:path*"],
};
