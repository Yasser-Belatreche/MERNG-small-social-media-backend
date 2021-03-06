const validateRegisterInput = (userName, email, password, confirmPassword) => {
  const errors = {};
  if (!userName) {
    errors.userName = "Username must not be empty";
  }

  if (!email) {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email adress";
    }
  }

  if (!password) {
    errors.password = "Password must not be empty";
  } else {
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords much match";
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

const validateLoginInput = (userName, password) => {
  const errors = {};
  if (!userName) {
    errors.userName = "Username must not be empty";
  }
  if (!password) {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports = { validateRegisterInput, validateLoginInput };
