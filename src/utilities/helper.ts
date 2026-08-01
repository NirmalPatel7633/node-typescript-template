const { dbReader } = require("../config/dbConfig");
const { v4: uuidv4 } = require("uuid");
const CryptoJS = require("crypto-js");

// Generate unique id using uuid
export async function generateRandomUuid(table: string, key: string) {
  try {
    let uniqueId;
    uniqueId = uuidv4();

    let checkExistingId = await dbReader[table].findOne({
      where: { [key]: uniqueId },
    });

    if (checkExistingId) {
      uniqueId = uuidv4();
    }

    return uniqueId;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Encrypt
export function encrypt(data: string, key: string) {
  try {
    const cipherText = CryptoJS.AES.encrypt(data, key).toString();
    return cipherText;
  } catch (e: any) {
    throw new Error(e.message);
  }
}

// Decrypt
export function decrypt(data: string, key: string) {
  try {
    const bytes = CryptoJS.AES.decrypt(data, key);
    if (bytes.sigBytes > 0) {
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedData;
    } else {
      return false;
    }
  } catch (e: any) {
    throw new Error(e.message);
  }
}

// response
export function response(res:any,status: any,flag: any,message: string,data: any) {
  return res.status(status).json({
    status: status,
    flag: flag,
    message: message,
    data: data
  });
}