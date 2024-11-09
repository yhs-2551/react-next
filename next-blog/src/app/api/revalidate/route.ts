// 나중에 캐시 무효화 필요하면 구현 예정 
// import { revalidateTag } from 'next/cache';

// export async function POST(request: Request) {
//     const { userIdentifier } = await request.json();
    
//     // 회원 탈퇴/수정 시 호출
//     revalidateTag(`user-${userIdentifier}`);
    
//     return Response.json({ revalidated: true });
// }