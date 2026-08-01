import { decrypt, encrypt, generateRandomUuid } from "../../utilities/helper";
import { secret_key } from "../../config/appConfig";
const { dbReader, dbWriter } = require('../../config/dbConfig');
import { LoginDto, RefreshDto, RegisterDto } from "../../dto/api/auth.interface";
import { JWT } from "../../utilities/JWT";
const jwtClass = new JWT();

export const registerUser = async (data: RegisterDto) => {
    try {
        const existingEmail = await dbReader.users.findOne({ where: { email: data.email } });
        if (existingEmail) {
            return { status: 400, flag: false, message: "Email already exists", data: null };
        }
        const user = await dbWriter.users.create({
            user_id: await generateRandomUuid("users", "user_id"),
            name: data.name,
            email: data.email,
            password: encrypt(data.password, secret_key),
            created_at: new Date(),
            updated_at: new Date(),
        });
        if (user) {
            return { status: 201, flag: true, message: "User created successfully", data: user }
        } else {
            return { status: 400, flag: false, message: "Something went wrong while creating user.", data: null }
        }
    } catch (error: any) {
        return { status: 500, flag: false, message: "Something went wrong", data: error.message };
    }
};

export const loginUser = async (data: LoginDto) => {
    try {
        const user = await dbReader.users.findOne({
            where: { email: data.email },
        });
        if (!user) {
            return { status: 400, flag: false, message: "User not found", data: null };
        }
        // Verify password
        const decryptedPassword = decrypt(user.password, secret_key);
        if (decryptedPassword !== data.password) {
            return { status: 400, flag: false, message: "Invalid password", data: null };
        }
        // Generate tokens
        const encryptedPayload = encrypt(JSON.stringify({
            user_id: user.user_id,
            email: user.email,
        }), secret_key);

        const tokens = jwtClass.createTokens({ payload: encryptedPayload });
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
            return { status: 500, flag: false, message: "Something went wrong while generating tokens", data: null };
        }
        const updatedAt = new Date();
        const updatedCount = await dbWriter.users.update({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            updated_at: updatedAt,
        }, {
            where: { user_id: user.user_id },
        });
        if (!updatedCount) {
            return { status: 500, flag: false, message: "Something went wrong while updating user", data: null };
        }
        return { status: 200, flag: true, message: "User logged in successfully", data: { name: user.name, email: user.email, access_token: tokens.accessToken, refresh_token: tokens.refreshToken } }
    } catch (error: any) {
        return { status: 500, flag: false, message: "Something went wrong", data: error.stack };
    }
};

export const logoutUser = async (data: any) => {
    try {
        const userId = typeof data === "string" ? data : data?.user_id;
        if (!userId) {
            return { status: 400, flag: false, message: "User id is required", data: null };
        }

        const user = await dbReader.users.findOne({
            where: { user_id: userId },
        });
        if (user === null) {
            return { status: 400, flag: false, message: "User not found", data: null };
        }
        if (!user.access_token || !user.refresh_token) {
            return { status: 400, flag: false, message: "User already logged out", data: null };
        }
        // Update user token
        const updatedCount = await dbWriter.users.update({
            access_token: null,
            refresh_token: null,
            updated_at: new Date(),
        }, {
            where: { user_id: userId }
        });
        if (!updatedCount) {
            return { status: 500, flag: false, message: "Something went wrong while updating user", data: null };
        }
        return { status: 200, flag: true, message: "User logged out successfully", data: null };
    } catch (error: any) {
        return { status: 500, flag: false, message: "Something went wrong", data: error.stack };
    }
};

export const refreshToken = async (data: RefreshDto, user_id: string) => {
    try {
        if (!data.refresh_token) {
            return { status: 400, flag: false, message: "Refresh token is required", data: null };
        }

        const user = await dbReader.users.findOne({
            where: { user_id: user_id },
        });
        if (!user) {
            return { status: 400, flag: false, message: "User not found", data: null };
        }
        if (!user.refresh_token || !user.access_token) {
            return { status: 400, flag: false, message: "User already logged out", data: null };
        }
        if (user.refresh_token !== data.refresh_token) {
            return {
                status: 401,
                flag: false,
                message: "Invalid refresh token.",
                data: null
            };
        }

        const tokenResult = jwtClass.verifyRefreshToken(data.refresh_token);
        if (!tokenResult.status) {
            if (tokenResult.message === 'jwt expired' || tokenResult.message === 'Session expired, please login again.') {
                return {
                    status: 401,
                    flag: false,
                    message: 'Refresh token expired. Please login again.',
                    code: 'REFRESH_TOKEN_EXPIRED'
                };
            }

            return {
                status: 401,
                flag: false,
                message: tokenResult.message,
                code: 'INVALID_REFRESH_TOKEN'
            };
        }
        const receivedData: any = tokenResult.receivedData;
        if (!receivedData?.payload) {
            return {
                status: 401,
                flag: false,
                message: 'Invalid token payload.',
                data: null
            };
        }
        let decryptedData;
        try {
            const decryptedString = decrypt(receivedData.payload, secret_key);
            decryptedData = JSON.parse(decryptedString);
        } catch (err) {
            return {
                status: 401,
                flag: false,
                message: 'Failed to decrypt refresh token.',
                data: null
            };
        }
        const encryptedPayload = encrypt(
            JSON.stringify({
                user_id: decryptedData.user_id,
                email: decryptedData.email,
                role: decryptedData.role,
                platform_type: decryptedData.platform_type
            }),
            secret_key
        );

        const tokens = jwtClass.createTokens({ payload: encryptedPayload });
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
            return {
                status: 400,
                flag: false,
                message: 'Failed to generate authentication tokens.',
                data: null
            };
        }

        const updatedCount = await dbWriter.users.update(
            {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                updated_at: new Date(),
            },
            { where: { user_id: user_id } }
        );
        const affectedRows = Array.isArray(updatedCount) ? updatedCount[0] : updatedCount;
        if (!affectedRows) {
            return {
                status: 500,
                flag: false,
                message: 'Something went wrong while updating user tokens.',
                data: null
            };
        }

        return {
            status: 200,
            flag: true,
            message: 'Token refreshed successfully.',
            data: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken
            }
        };
    } catch (error: any) {
        return { status: 500, flag: false, message: "Something went wrong", data: error.stack };
    }
};
