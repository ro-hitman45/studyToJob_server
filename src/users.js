import { knex } from "../knex";
// import logger from "../logger";
// import helper from "../helper";

import { encrypteR, decrypteR } from "./encrypt";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userRoutes = [
  // AUTH
  {
    path: "/auth",
    method: "post",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      let daata = decrypteR(request.payload.edc);

      const { username, password } = daata;
      let reply = null;
      // console.log("a", emp_id, password);
      //  check user exists or not
      try {
        if (!request.payload) {
          reply = {
            success: false,
            messsage: "username and password are required"
          };
        } else {
          // console.log(`1`);
          const q = `SELECT u.user_id, u.username, u.firstname, u.lastname, u.email, u.role FROM users u WHERE u.username = '${username}' AND u.status = 1`;
          // console.log("query", q);
          // console.log(`1`, q);
          await knex.raw(q).then(async ([usercount]) => {
            if (usercount.length) {
              console.log(password, usercount[0].password);
              await bcrypt
                .compare(password, usercount[0].password)
                .then(async res => {
                  console.log(res);
                  if (!res) {
                    reply = {
                      success: false,
                      message: "Incorrect password"
                    };
                  }
                  if (res) {
                    const token = jwt.sign(
                      usercount[0],
                      "vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy",
                      {
                        algorithm: "HS256"
                      }
                    );
                    reply = {
                      success: true,
                      token
                    };
                  }
                });
            } else {
              reply = {
                success: false,
                message: "Incorrect username"
              };
            }
          });
        }
      } catch (error) {
        console.log(error, "eror");
      }
      return {
        edc: encrypteR(reply)
      };
    }
  },
  // LIST OF ALL EMPLOYEES
  {
    method: "GET",
    path: "/users",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async () => {
      let reply = null;
      await knex
        .raw(
          `SELECT u.user_id, u.username, u.firstname, u.lastname, u.email, u.role FROM users u`
        )
        .then(([res]) => {
          reply = {
            success: true,
            data: res
          };
        });
      return {
        edc: encrypteR(reply)
      };
    }
  },

  // add user
  {
    method: "POST",
    path: "/users",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const user = decrypteR(request.payload.edc); // username, password, firstname, lastname, email, role, status
      const hash = bcrypt.hashSync(user.password, 10);
      
      user.password = hash;
      // console.log("user", user);
      await helper
        .insertOrUpdate(knex, 'users', user)
        .then(res => {
          if (!res) {
            reply = {
              success: false,
              message: 'Operation failed'
            };
          } else {
            reply = {
              success: true,
              message: 'Your request is successful'
            };
          }
        })
        .catch(err => {
          reply = {
            success: false,
            message: 'Operation failed'
          };
        });
      return {
        edc : encrypteR(reply)
      };
    }
  },

  {
    path: "/forgot_password",
    method: "post",
    config: {
      auth: {
        mode: "optional"
      }
    },
    handler: async request => {
      const { emp_id } = request.payload;
      let reply = null;
      // console.log("a", emp_id, password);
      //  check user exists or not
      try {
        if (!request.payload) {
          reply = {
            success: false,
            messsage: "Employee id  is required"
          };
        } else {
          const rand = Math.random()
            .toString(36)
            .substring(7);
          const hash = bcrypt.hashSync(rand, 10);
          console.log(`1`);
          const q = `UPDATE employees SET password = '${hash}' WHERE emp_id = '${emp_id}'`;
          // console.log("query", q);
          console.log(`1`, q);
          await knex.raw(q).then(async usercount => {
            console.log("dsfds@@@@@", usercount.length);
            if (usercount.length) {
              await knex
                .raw(`SELECT email FROM employees WHERE role = 'admin'`)
                .then(async ([res]) => {
                  console.log("reews", res[0].email, rand);
                  const newData = {
                    userid: emp_id,
                    password: rand
                  };
                  if (res.length) {
                    // await helper.sendEmail(res[0].email, newData);
                    reply = {
                      success: true
                    };
                  }
                });
            } else {
              reply = {
                success: false,
                message: "Incorrect username"
              };
            }
          });
        }
      } catch (error) {
        console.log(error, "eror");
      }

      return reply;
    }
  },

  // change password
  // AUTH
  {
    path: "/change_password",
    method: "post",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      const { username, current_psw, new_psw } = decrypteR(request.payload.edc);
      let reply = null;
      //  check user exists or not
      try {
          const q = `SELECT u.* FROM users u WHERE u.username = '${username}'`;
          await knex.raw(q).then(async ([usercount]) => {
            if (usercount.length) {
              console.log(current_psw, usercount[0].password);
              await bcrypt
                .compare(current_psw, usercount[0].password)
                .then(async res => {
                  console.log(res);
                  if (!res) {
                    reply = {
                      success: false,
                      message: "Current Password Not Matched"
                    };
                  }
                  if (res) {
                    const hash = bcrypt.hashSync(new_psw, 10);
                    await knex
                      .raw(
                        `update users set password = '${hash}' where username = '${username}'`
                      )
                      .then(pswData => {
                        if (pswData) {
                          reply = {
                            success: true,
                            message: 'Your request is successful'
                          };
                        }
                      });
                  }
                });
            } else {
              reply = {
                success: false,
                message: "User Not Exits"
              };
            }
          });
        
      } catch (error) {
        console.log(error, "eror");
      }

      return {edc: encrypteR(reply)};
    }
  }
];

export default userRoutes;
