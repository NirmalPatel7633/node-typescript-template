export interface RegisterDto {
    name: string;
    email: string;
    password: string;
};
export interface LoginDto {
    email: string;
    password: string;
}
export interface RefreshDto {
    access_token: string;
    refresh_token: string;
}