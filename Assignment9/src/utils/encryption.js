import CryptoJS from "crypto-js";

export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(
    text,
    process.env.ENC_KEY
  ).toString();
};

export const decrypt = (cipher) => {
  const bytes = CryptoJS.AES.decrypt(
    cipher,
    process.env.ENC_KEY
  );

  return bytes.toString(CryptoJS.enc.Utf8);
};