import { Request, Response, NextFunction } from "express";
import { JWT } from "../utilities/JWT";
import { decrypt } from "../utilities/helper";
import { secret_key } from "../config/appConfig";
const { dbReader } = require("../config/dbConfig");
const jwtClass = new JWT();
export const bearerToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized.",
      });
    }
    // Verify JWT token
    const { status, message, receivedData } = jwtClass.verifyAccessToken(token);
    if (!status || !receivedData) {
      return res.status(401).json({
        status: false,
        message: message || "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
    }

    // Decrypt the received data
    let decryptedData;
    try {
      // Ensure receivedData is an object and has the payload property
      if (
        typeof receivedData !== "object" ||
        receivedData === null ||
        !("payload" in receivedData)
      ) {
        throw new Error("Invalid token structure: missing payload");
      }

      // Extract and decrypt the encrypted payload
      const encryptedPayload = receivedData.payload;
      if (typeof encryptedPayload !== "string") {
        throw new Error("Invalid payload format: expected string");
      }

      const decryptedString = decrypt(encryptedPayload, secret_key);
      if (!decryptedString) {
        throw new Error("Failed to decrypt token payload");
      }

      decryptedData = JSON.parse(decryptedString);
    } catch (error) {
      return res.status(401).json({
        status: false,
        message:
          "Token validation failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
        code: "TOKEN_DECRYPTION_FAILED",
      });
    }

    // Validate decrypted data structure
    if (!decryptedData.user_id) {
      return res.status(401).json({
        status: false,
        message: "Invalid token payload",
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    const userRecord = await dbReader.users.findOne({
      where: {
        user_id: decryptedData.user_id,
      },
      attributes: ["user_id", "email"],
    });

    if (!userRecord) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // @ts-ignore
    req.user_id = decryptedData.user_id;
    //@ts-ignore
    req.email = decryptedData.email;
    //@ts-ignore
    req.access_token = token;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Token validation failed",
    });
  }
};
