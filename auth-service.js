const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // to be defined on new connection

const connectionString =
  "mongodb+srv://assgn2:5YSsfHyiM2QPN5j9@cluster0.4hak5.mongodb.net/?retryWrites=true&w=majority";

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection(connectionString);

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          const newUser = new User({
            userName: userData.userName,
            password: hash, // Save the hashed password
            email: userData.email,
            loginHistory: [],
          });

          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code === 11000) {
                // Duplicate key error
                reject("User Name already taken");
              } else {
                reject(`There was an error creating the user: ${err}`);
              }
            });
        })
        .catch((err) => {
          reject("There was an error encrypting the password");
        });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .exec()
      .then((user) => {
        if (!user) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt
            .compare(userData.password, user.password)
            .then((result) => {
              if (!result) {
                reject(`Incorrect Password for user: ${userData.userName}`);
              } else {
                user.loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.updateOne(
                  { userName: user.userName },
                  { $set: { loginHistory: user.loginHistory } }
                )
                  .exec()
                  .then(() => {
                    resolve(user);
                  })
                  .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                  });
              }
            })
            .catch((err) => {
              reject(`There was an error verifying the password: ${err}`);
            });
        }
      })
      .catch((err) => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
