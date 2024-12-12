// 나중에 캐시 무효화 필요하면 구현 예정 
// import { revalidateTag } from 'next/cache';

// export async function POST(request: Request) {
//     const { blogId } = await request.json();
    
//     // 회원 탈퇴/수정 시 호출
//     revalidateTag(`user-${blogId}`);
    
//     return Response.json({ revalidated: true });
// }