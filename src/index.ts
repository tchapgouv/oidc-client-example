import 'dotenv/config';
import {Application} from 'express'
import {port} from "./config/config";
import server from "./server";

const app: Application = server();

app.listen(port, function () {
    console.log(`App is listening on port ${port} !`)
})
