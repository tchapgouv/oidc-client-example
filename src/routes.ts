import {Router} from "express";
import {generators, Issuer} from 'openid-client';
import {appUrl} from "./config/config";
import {getSystemErrorMap} from "util";

const PROVIDER_URL="https://dev.identite.tchap.incubateur.net/realms/tchap-identite/.well-known/openid-configuration"
const CLIENT_SECRET=""
const CLIENT_ID="tchap-identite-client"
const CALLBACK_URL="/cb"
const userEmail = ""
/*
const PROVIDER_URL="http://localhost:8080/realms/tchap-identite/.well-known/openid-configuration"
const CLIENT_SECRET=""
const CLIENT_ID="tchap-identite-client"
const CALLBACK_URL="/cb"
*/


const getClient = async () => {
    const issuer = await Issuer.discover(PROVIDER_URL);
// console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

    const client = new issuer.Client({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uris: [appUrl + CALLBACK_URL],
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
    }); // => Client

    return client
}

const demoRouter = Router();

demoRouter.get('/', async (req, res) => {
    return res.render('home', {
        loginUrl: appUrl + '/login?email='+userEmail,
        userEmail: req.session.user
    });
});

demoRouter.get('/login', async (req, res) => {
    const email: string | undefined = req.query.email?.toString();
    // if (!email) return res.redirect('/');

    const client = await getClient()
    const code_verifier = generators.codeVerifier();
    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.
    req.session.code_verifier = code_verifier;
    req.session.save()

    const code_challenge = generators.codeChallenge(code_verifier);

    const redirect_url = client.authorizationUrl({
        scope: 'openid',
        code_challenge,
        code_challenge_method: 'S256',
        login_hint: email
    });

    res.redirect(redirect_url)
});

demoRouter.get('/cb', async (req, res) => {
    const client = await getClient()
    const params = client.callbackParams(req);

    // if (!params || !req.session.code_verifier) return res.redirect('/');

    const tokenSet = await client.callback(appUrl + CALLBACK_URL, params, { code_verifier: req.session.code_verifier });
    // console.log('received and validated tokens %j', tokenSet);
    // console.log('validated ID Token claims %j', tokenSet.claims());

    const { access_token } = tokenSet;
    console.log('access_token %j', access_token);
    const userinfo = await client.userinfo(access_token!);
    req.session.user = userinfo.preferred_username || 'default_email';
    console.log('userinfo %j', userinfo);

    return res.redirect('/')
});

export default demoRouter;
