import { Sequelize } from "sequelize";
import {
  node_env,
  db_name,
  db_user,
  db_password,
  db_dialect,
  db_host_reader,
  db_host_writer,
  db_timezone,
  db_connection_timeout,
  db_max_connections,
  db_min_connections,
  db_pool_acquire,
  db_pool_evict,
  db_pool_idle,
  db_retry,
  db_logging,
} from "./appConfig";

let baseConfig;
if (node_env === "production") {
  baseConfig = {
    dialect: db_dialect,
    logging: db_logging,
    timezone: db_timezone,
    pool: {
      max: db_max_connections,
      min: db_min_connections,
      acquire: db_pool_acquire,
      idle: db_pool_idle,
      evict: db_pool_evict,
    },
    retry: {
      max: db_retry,
      match: [/ETIMEDOUT/, /ECONNRESET/, /ECONNREFUSED/, /EHOSTUNREACH/],
    },
    dialectOptions: {
      connectTimeout: db_connection_timeout,
    },
  };
} else {
  baseConfig = {
    dialect: db_dialect,
    logging: db_logging,
    timezone: db_timezone,
  };
}

const createConnection = (config: any) => {
  const connection = new Sequelize(db_name, db_user, db_password, {
    host: config.host,
    ...config,
  });

  const models = {
    // List models
    users: require("../models/usersModel")(connection, Sequelize),
  };

  // Set up associations
  for (const element of Object.values(models) as any[]) {
    if ("associate" in element) {
      element.associate(models);
    }
  }

  return { sequelize: connection, ...models };
};

const [dbWriter, dbReader] = [
  createConnection({
    ...baseConfig,
    host: db_host_writer,
  }),
  createConnection({
    ...baseConfig,
    host: db_host_reader,
  }),
];

module.exports = {
  dbReader: { ...dbReader, Sequelize , sequelize: dbReader.sequelize },
  dbWriter: { ...dbWriter, Sequelize , sequelize: dbWriter.sequelize },
};
