export const confirmEmailKey = (id) => `Users:${id}:otp:confirmation`
export const confirmOldEmailKey = (id) => `Users:${id}:otp:oldEmailConfirmation`
export const newEmailKey = (id) => `Users:${id}:email:newEmail`

export const revokeTokenKey = (userId, jti) => `Users:login:${userId}:${jti}`
export const forgetPasswordKey = (id) => `Users:${id}:otp:forgetPass`