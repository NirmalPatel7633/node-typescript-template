import { Request, Response } from "express";
import { response } from "../../utilities/helper";
import { registerUser, loginUser, logoutUser, refreshToken } from "../../services/api/AuthService";
import { LoginDto, RegisterDto, RefreshDto } from "../../dto/api/auth.interface";

export class AuthController {
  public healthCheck(req: Request, res: Response) {
    return response(res, 200, true, "success", null);
  };

  public register = async (req: Request, res: Response) => {
    try {
      const dto: RegisterDto = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      };
      const result: any = await registerUser(dto);
      return response(res, result.status, result.flag, result.message, result.data);
    } catch (error) {
      return response(res, 500, false, "Something went wrong", null);
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const dto: LoginDto = {
        email: req.body.email,
        password: req.body.password
      };
      const result: any = await loginUser(dto);
      return response(res, result.status, result.flag, result.message, result.data);
    } catch (error) {
      return response(res, 500, false, "Something went wrong", null);
    }
  };

  public logout = async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const user_id = req.user_id;
      const logoutResult = await logoutUser(user_id);
      return response(res, logoutResult.status, logoutResult.flag, logoutResult.message, logoutResult.data);
    } catch (error: any) {
      return response(res, 500, false, "Something went wrong", error.message);
    }
  };

  public refreshToken = async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const user_id = req.user_id;
      const dto: RefreshDto = {
        access_token: req.body.access_token,
        refresh_token: req.body.refresh_token
      };
      const result = await refreshToken(dto,user_id);
      return response(res, result.status, result.flag, result.message, result.data);
    } catch (error) {
      return response(res, 500, false, "Something went wrong", null);
    }
  }
}
