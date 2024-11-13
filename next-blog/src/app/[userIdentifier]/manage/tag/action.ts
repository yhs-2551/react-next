// const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts/${userIdentifier}`, {

'use server'
import { revalidateTag } from 'next/cache';


export async function fetchTags(token: string, userIdentifier: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${userIdentifier}/tags`, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            next: { 
                revalidate: false, // force-cache와 동일한 효과
                tags: [`user-${userIdentifier}-tags`]
            }
        }
    );
    return response.json();
}

export async function invalidateUserTags(userIdentifier: string) {
    revalidateTag(`user-${userIdentifier}-tags`);
}