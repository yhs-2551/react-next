export class CustomHttpError extends Error {
    // 아래 status public은 this.status = status;와 같음, message는 super(message)를 해야 하기 떄문에 public 사용x
    constructor(public status: number, message: string) {
        super(message);
        this.name = "CustomHttpError"; 
    }
}