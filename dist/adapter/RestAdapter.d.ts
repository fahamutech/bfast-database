import { NextFunction, Request, Response } from "express";
export interface RestAdapter {
    verifyApplicationId(request: Request, response: Response, next: NextFunction): any;
    verifyToken(request: Request, response: Response, next: NextFunction): any;
    verifyMethod(request: Request, response: Response, next: NextFunction): any;
    verifyBodyData(request: Request, response: Response, next: NextFunction): any;
    handleRuleBlocks(request: Request, response: Response, next: NextFunction): any;
}
