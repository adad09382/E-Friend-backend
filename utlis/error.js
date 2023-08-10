/**
 * 從Mongoose的ValidationError中取出第一個驗證錯誤訊息
 * @param error Mongoose ValidationError
 * @return 錯誤信息
 */

export const getMessageFromValidationError = (error) => {
  // Object.keys() 獲取 error.errors 物件的所有鍵的陣列，並取出第一個key（索引為 0）
  const key = Object.keys(error.errors)[0];
  return error.errors[key].message;
};
