import { LoginCredentialsResponse } from "src/common/entities";

export class LoginResponse {
    message: string;
    data: { credentials: LoginCredentialsResponse };
}
