import jwt from 'jsonwebtoken';
import {
    access_token_secret,
    refresh_token_secret,
    token_expiry,
    refresh_token_expiry
} from "../config/appConfig";

export class JWT {

    // ===============================
    // CREATE ACCESS & REFRESH TOKENS
    // ===============================
    createTokens(payload: any) {

        if (!access_token_secret || !refresh_token_secret) {
            return {
                status: false,
                message: "Token secret environment variables are not set."
            };
        }

        try {
            const accessToken = jwt.sign(
                payload,
                access_token_secret,
                { expiresIn: token_expiry } // 30 minutes
            );

            const refreshToken = jwt.sign(
                payload,
                refresh_token_secret,
                { expiresIn: refresh_token_expiry } // 30 days
            );

            return {
                status: true,
                message: "Success",
                accessToken,
                refreshToken
            };

        } catch (e: any) {
            console.log("e from function createTokens", e);
            return { status: false, message: e.message };
        }
    }

    // ===============================
    // VERIFY / DECODE ACCESS TOKEN
    // ===============================
    verifyAccessToken(token: string) {

        if (!access_token_secret) {
            return { status: false, message: "Access token secret is not set." };
        }

        try {
            const decoded = jwt.verify(token, access_token_secret);
            return { status: true, message: "Success", receivedData: decoded };

        } catch (e: any) {
            return this.handleJwtError(e);
        }
    }

    // ===============================
    // VERIFY / DECODE REFRESH TOKEN
    // ===============================
    verifyRefreshToken(token: string) {

        if (!refresh_token_secret) {
            return { status: false, message: "Refresh token secret is not set." };
        }

        try {
            const decoded = jwt.verify(token, refresh_token_secret);
            return { status: true, message: "Success", receivedData: decoded };

        } catch (e: any) {
            return this.handleJwtError(e);
        }
    }

    // ===============================
    // COMMON ERROR HANDLER
    // ===============================
    // private handleJwtError(e: any) {
    //     let message = "Something went wrong to decode token.";

    //     if (e.message === 'jwt expired') {
    //         message = "jwt expired";
    //     } else if (e.message === 'jwt malformed') {
    //         message = "jwt malformed";
    //     } else if (e.message === 'invalid signature') {
    //         message = "invalid signature";
    //     } else if (e.message === 'invalid token') {
    //         message = "invalid token";
    //     }

    //     return { status: false, message };
    // }
    private handleJwtError(e: any) {

        if (e.name === 'TokenExpiredError') {
            return {
                status: false,
                message: 'Session expired, please login again.'
            };
        }

        if (e.name === 'JsonWebTokenError') {
            return {
                status: false,
                message: e.message // malformed | invalid signature | invalid token
            };
        }

        return {
            status: false,
            message: 'Token verification failed.',
            receivedData: undefined
        };
    }
}
