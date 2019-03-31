import jwt from "jsonwebtoken";
import userRoutes from "./src/users";

// import routes from "src/routes";

const Inert = require("inert");

const Hapi = require("hapi");
const config = require("./src/config");
const AuthBearer = require("hapi-auth-bearer-token");


// encryption

var encrypter = require("object-encrypter");
var engine = encrypter("mySecretKeyIsmyName", { ttl: true });

export const enginee = engine;



const server = Hapi.server({
  port: config.port,
  host: config.host,
  routes: { cors: { origin: ["*"] } }
});

process.on("unhandledRejection", err => {
  console.log("err", err);
  process.exit(1);
});

init();

async function init() {
  console.log("testing");
  await server.register([AuthBearer, Inert]);

  await server.auth.strategy("token", "bearer-access-token", {
    validate: async (request, token) => {
      let isValid;
      let credentials = {};
      await jwt.verify(token, config.server.token, (err, decoded) => {
        if (err) {
          isValid = false;
        } else {
          isValid = true;
          credentials = decoded;
        }
      });
      return { isValid, credentials };
    }
  });

  server.auth.default("token");

  const allRoutes = [...userRoutes];
  allRoutes.forEach(item => {
    server.route(item);
  });

  // server.route(routes);

  await start();
}

async function start() {
  try {
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log("Server running at:", server.info.uri);
}
