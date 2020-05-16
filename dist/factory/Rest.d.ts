import { RestAdapter } from "../adapter/RestAdapter";
import { NextFunction, Request, Response } from "express";
import { ConfigAdapter } from "../config";
export declare class Rest implements RestAdapter {
    private readonly config;
    constructor(config: ConfigAdapter);
    verifyApplicationId(request: Request, response: Response, next: NextFunction): void;
    verifyToken(request: Request, response: Response, next: NextFunction): void;
    verifyMethod(request: Request, response: Response, next: NextFunction): void;
    verifyBodyData(request: Request, response: Response, next: NextFunction): void;
    handleRuleBlocks(request: Request, response: Response, next: NextFunction): void;
}
