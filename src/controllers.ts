import assert from "assert";
import {RequestHandler} from "express";
import {generators, Issuer} from "openid-client";
import {appUrl} from "./config/config";

const urlCallback = "/cb";

const getClient = async () => {
    console.log(process.env.PROVIDER_URL)
    const issuer = await Issuer.discover(process.env.PROVIDER_URL!);
// console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

    const client = new issuer.Client({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uris: [appUrl + urlCallback],
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
    }); // => Client

    return client
}

export const homeController: RequestHandler = async (req, res) => {
    let userEmail = null;
    if (req.session.access_token) {
        const client = await getClient();
        const userinfo = await client.userinfo(req.session.access_token);
        userEmail = userinfo.preferred_username || userinfo.sub
    }

    return res.render('home', {
        loginUrl: appUrl + '/login',
        userEmail
    });
};

export const loginController: RequestHandler = async (req, res) => {
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
};

export const callbackController: RequestHandler = async (req, res) => {
    const client = await getClient()
    const params = client.callbackParams(req);

    // if (!params || !req.session.code_verifier) return res.redirect('/');

    const tokenSet = await client.callback(appUrl + urlCallback, params, {code_verifier: req.session.code_verifier});
    req.session.code_verifier = undefined;
    // console.log('received and validated tokens %j', tokenSet);
    // console.log('validated ID Token claims %j', tokenSet.claims());

    const {access_token} = tokenSet;
    // console.log('access_token %j', access_token);
    // const userinfo = await client.userinfo(access_token!);
    // req.session.user = userinfo.preferred_username || 'default_email';
    req.session.access_token = access_token;
    // console.log('userinfo %j', userinfo);

    return res.redirect('/')
};

export const logoutController: RequestHandler = async (req, res) => {
    req.session.destroy(() => res.redirect('/'))
}
