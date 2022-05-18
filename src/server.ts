import express, {Application} from 'express'
import session from 'express-session';
import helmet from "helmet";
import path from "path";
import demoRouter from "./routes";

const server = () => {
    const app: Application = express();

    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname,
        '../static')));

    app.use('/dsfr',
        express.static(path.join(__dirname,
            '../node_modules/@gouvfr/dsfr/dist')));

    app.use(session(
        {
            secret: 'dev',
            resave: false,
            saveUninitialized: true,
            cookie: {secure: false} // fixme: not for prod
        },
    ))
    app.use(helmet({
        contentSecurityPolicy: false,
    }));

    app.set('trust proxy', 1);

    app.use(demoRouter);

    return app;
}

export default server;
