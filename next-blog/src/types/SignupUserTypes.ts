export interface SignupUser {
    blogId: string;
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export interface OAuth2UserAdditionalInfo {
    blogId: string;
    username: string;
}
