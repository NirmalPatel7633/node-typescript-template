import { Router, Express } from "express";
import { AuthController } from "../../controller/api/AuthController";
import { validateSchema } from "../../middleware/validateSchema";
import { bearerToken } from "../../middleware/bearerToken";
import Schema from "./Schema";

export class AuthRoutes extends AuthController {
  private basePath: string;

  constructor(app: Express, basePath: string) {
    super();
    this.basePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express) {
    const router = Router();

    router.get("/healthCheck", bearerToken, this.healthCheck);

    router.post('/register', validateSchema(Schema.registerUserSchema), this.register);
    router.post('/login', validateSchema(Schema.loginSchema), this.login);
    router.post('/logout', bearerToken, this.logout);
    router.post('/refresh-token', bearerToken, validateSchema(Schema.refreshTokenSchema), this.refreshToken);

    app.use(this.basePath, router);
  }
}
