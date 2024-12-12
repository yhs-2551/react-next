// const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts/${blogId}`, {

'use server'
import { revalidateTag } from 'next/cache';


export async function fetchTags(token: string, blogId: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/tags`, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            next: { 
                revalidate: false, // force-cache와 동일한 효과
                tags: [`user-${blogId}-tags`]
            }
        }
    );
    return response.json();
}

export async function invalidateUserTags(blogId: string) {
    revalidateTag(`user-${blogId}-tags`);
}