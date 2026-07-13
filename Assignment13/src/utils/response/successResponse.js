
export const successResponse = (res, message, data) => {
  return res.status(200).json({
    message,
    data,
  });
}