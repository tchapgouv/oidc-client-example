import {Router} from "express";
import {generators, Issuer} from 'openid-client';
import {appUrl} from "./config/config";
import {getSystemErrorMap} from "util";
import {callbackController, homeController, loginController, logoutController} from "./controllers";

const demoRouter = Router();

demoRouter.get('/', homeController);
demoRouter.get('/login', loginController);
demoRouter.get('/cb', callbackController);
demoRouter.get('/logout', logoutController);

export default demoRouter;
