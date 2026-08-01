import dotenv from "dotenv";
dotenv.config();

const node_env = process.env.NODE_ENV || "development",
  node_port: number = parseInt(process.env.NODE_PORT || ""),
  cors_url: string[] =
    process.env.CORS_ORIGINS?.split(",").map((url) => url.trim()) || [],
  cors_allow: boolean = process.env.CORS_ALLOW_ALL === "true",
  access_token_secret: string = process.env.ACCESS_TOKEN_SECRET || "",
  refresh_token_secret: string = process.env.REFRESH_TOKEN_SECRET || "",
  secret_key: string = process.env.SECRET_KEY || "",
  token_expiry: number = parseInt(process.env.ACCESS_TOKEN_EXPIRY || ""),
  refresh_token_expiry: number = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY || "",
  ),
  api_prefix: string = process.env.API_PREFIX || "",
  api_version: string = process.env.API_VERSION || "",
  admin_domain_url: string = process.env.ADMIN_DOMAIN_URL || "",
  web_domain_url: string = process.env.WEB_USER_DOMAIN_URL || "",
  email_host: string = process.env.EMAIL_HOST || "",
  email_port: number = parseInt(process.env.EMAIL_PORT || ""),
  email_user: string = process.env.EMAIL_USER || "",
  email_password: string = process.env.EMAIL_PASSWORD || "";

let db_name: string,
  db_user: string,
  db_password: string,
  db_dialect: string,
  db_host_reader: string,
  db_host_writer: string,
  db_timezone: string,
  db_logging: boolean | ((msg: string) => void),
  db_connection_timeout: number,
  db_retry: number,
  db_max_connections: number,
  db_min_connections: number,
  db_pool_acquire: number,
  db_pool_idle: number,
  db_pool_evict: number;

if (node_env === "production") {
    db_name = process.env.DB_NAME || "";
    db_user = process.env.DB_USER || "";
    db_password = process.env.DB_PASSWORD || "";
    db_dialect = process.env.DB_DIALECT || "";
    db_host_reader = process.env.DB_HOST_READER || "";
    db_host_writer = process.env.DB_HOST_WRITER || "";
    db_timezone = process.env.DB_TIMEZONE || "";
    db_logging = false;
    db_connection_timeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || "");
    db_retry = parseInt(process.env.DB_RETRY || "");
    db_max_connections = parseInt(process.env.POOL_MAX || "");
    db_min_connections = parseInt(process.env.POOL_MIN || "");
    db_pool_acquire = parseInt(process.env.POOL_ACQUIRE || "");
    db_pool_idle = parseInt(process.env.POOL_IDLE || "");
    db_pool_evict = parseInt(process.env.POOL_EVICT || "");
} else {
    db_name = process.env.DB_NAME || "";
    db_user = process.env.DB_USER || "";
    db_password = process.env.DB_PASSWORD || "";
    db_dialect = process.env.DB_DIALECT || "";
    db_host_reader = process.env.DB_HOST_READER || "";
    db_host_writer = process.env.DB_HOST_WRITER || "";
    db_timezone = process.env.DB_TIMEZONE || "";
    db_logging = false;
    db_connection_timeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || "");
    db_retry = parseInt(process.env.DB_RETRY || "");
    db_max_connections = parseInt(process.env.POOL_MAX || "");
    db_min_connections = parseInt(process.env.POOL_MIN || "");
    db_pool_acquire = parseInt(process.env.POOL_ACQUIRE || "");
    db_pool_idle = parseInt(process.env.POOL_IDLE || "");
    db_pool_evict = parseInt(process.env.POOL_EVICT || "");
}

export {
    node_env,
    node_port,
    cors_url,
    cors_allow,
    access_token_secret,
    refresh_token_secret,
    secret_key,
    token_expiry,
    refresh_token_expiry,
    api_prefix,
    api_version,
    admin_domain_url,
    web_domain_url,
    email_host,
    email_port,
    email_user,
    email_password,
    db_name,
    db_user,
    db_password,
    db_dialect,
    db_host_reader,
    db_host_writer,
    db_timezone,
    db_logging,
    db_connection_timeout,
    db_retry,
    db_max_connections,
    db_min_connections,
    db_pool_acquire,
    db_pool_idle,
    db_pool_evict
};
