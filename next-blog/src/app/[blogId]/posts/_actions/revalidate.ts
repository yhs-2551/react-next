'use server'

import { revalidatePath } from 'next/cache';

export async function revalidatePostList(blogId: string) {
  revalidatePath(`/${blogId}/posts`);
}