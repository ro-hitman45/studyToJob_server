import { knex } from "../knex";
// import logger from "../logger";
// import helper from "../helper";

import { encrypteR, decrypteR } from "./encrypt";

const courseRoutes = [
  // AUTH
  {
    path: "/courses",
    method: "get",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      // getting all courses list
      const q = `SELECT c.*, (select c2.course from courses c2 where c2.cid = c.parent_course limit 1) parent_course_name FROM courses c`;
      await knex
        .raw(q)
        .then(async ([res]) => {
          reply = {
            success: true,
            data: res
          };
        })
        .error(err => {
          reply = {
            success: false,
            message: "Failed fetching data"
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
    path: "/courses",
    config: {
      auth: {
        strategy: "token"
      }
    },
    handler: async request => {
      let reply = null;
      const daata = decrypteR(request.payload.edc); // cid, parent_course, course, tagnames, status

      await helper
        .insertOrUpdate(knex, "courses", daata)
        .then(res => {
          if (!res) {
            reply = {
              success: false,
              message: "Operation failed"
            };
          } else {
            reply = {
              success: true,
              message: "Your request is successful"
            };
          }
        })
        .catch(err => {
          reply = {
            success: false,
            message: "Operation failed"
          };
        });
      return {
        edc: encrypteR(reply)
      };
    }
  },
 

];

export default courseRoutes;
