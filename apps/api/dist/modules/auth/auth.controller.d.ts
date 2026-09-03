import { AuthService } from "./auth.service";
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(body: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    logout(body: {
        refreshToken: string;
    }): Promise<void>;
}
