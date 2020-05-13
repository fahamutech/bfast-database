import {NextFunction, Request, Response} from "express";

export interface RestAdapter {
    verifyApplicationId(request: Request,response: Response, next: NextFunction);
    verifyToken(request: Request,response: Response, next: NextFunction);
    verifyMethod(request: Request,response: Response, next: NextFunction);
    verifyBodyData(request: Request,response: Response, next: NextFunction);
    handleRuleBlocks(request: Request,response: Response, next: NextFunction);
}
