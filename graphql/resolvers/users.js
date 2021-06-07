const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const env = require("dotenv");
env.config();

const User = require("../../models/User.model");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validation");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userName: user.userName,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
};

module.exports = {
  Mutation: {
    async login(parent, args, context, info) {
      let { userName, password } = args;
      let { valid, errors } = validateLoginInput(userName, password);
      if (!valid) {
        throw new UserInputError("Error", { errors });
      }

      const user = await User.findOne({ userName });
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", errors);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong credentials", errors);
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user.id,
        token,
      };
    },

    async register(parent, args, context, info) {
      let {
        registerInput: { userName, email, password, confirmPassword },
      } = args;

      // validate user info
      const { errors, valid } = validateRegisterInput(
        userName,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Error", { errors });
      }

      // make sure user does not already exist
      const user = await User.findOne({ userName });
      if (user) {
        throw new UserInputError("username is taken", {
          errors: {
            userName: "This username is taken",
          },
        });
      }

      // hash the password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        userName,
        password,
        createdAt: new Date().toISOString(),
      });
      const result = await newUser.save();

      const token = generateToken(result);

      return {
        ...result._doc,
        id: result.id,
        token,
      };
    },
  },
};
