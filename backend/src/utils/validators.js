const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\d{10,}$/;
  return re.test(phone.replace(/\D/g, ''));
};

const validateRegistrationNumber = (regNum) => {
  return regNum && regNum.trim().length > 0;
};

const validatePassword = (password) => {
  // At least 6 chars, 1 uppercase, 1 number
  return password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRegistrationNumber,
  validatePassword,
};
