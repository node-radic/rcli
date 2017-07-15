import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { AbstractService } from "./AbstractService";
import { service } from "../decorators";
import { AuthMethod } from "./AuthMethod";
import { Credential } from "../database/Models/Credential";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { getRandomId } from "@radic/util";
import { parse, stringify } from "querystring";
import * as open from "open";
import { lazyInject, Log } from "@radic/console";

export interface GoogleServiceContacts {
    results: number,
    entries: GoogleServiceContact[]
}
export interface GoogleServiceContact {
    id?:string
    name?:string
    numbers?:Array<{type: string, number:string}>
}

@service({
    name   : 'google',
    methods: [ AuthMethod.oauth2 ],
    extra  : {
        email: {
            type       : 'string',
            description: 'The email '
        }
    }

})
export class GoogleService extends AbstractService {
    protected _auth: GoogleServiceAuth
    public get auth(): GoogleServiceAuth {return this._auth }

    protected requestInterceptorId: number

    public configure(options: AxiosRequestConfig = {}): AxiosRequestConfig {
        this._auth = new GoogleServiceAuth(this.credentials);
        options    = {
            ...options,
            ...{
                params : {
                    alt: 'json'
                },
                headers: {
                    'GData-Version': '3.0'
                }
            }
        }
        return options;
    }


    setCredentials(creds: Credential): this {
        super.setCredentials(creds);
        if ( this.requestInterceptorId !== undefined ) {
            this.client.interceptors.request.eject(this.requestInterceptorId);
        }
        this.requestInterceptorId = this.client.interceptors.request.use(async (config) => {
            await this.authorize();
            config.withCredentials            = true;
            config.headers[ 'Authorization' ] = this.credentials.extra[ 'token_type' ] + ' ' + this.credentials.extra[ 'access_token' ]
            return config;
        }, (err) => {
            this.log.error(err);
        })
        return this;
    }

    protected authorize(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if ( this._auth.needsAuthorize() ) {
                let url = this.auth.generateBrowserUrl();
                this.log.info('Attempting to open your browser for google authorization.')
                this.log.info('If opening of your browser fails, visit this url: ')
                this.log.info(url);
                open(url, 'firefox')
                let code = await this._auth.authorize();
                await this._auth.exchangeCode(code);
            }
            if ( this._auth.needsRefresh() ) {
                await this._auth.refreshAccessToken();
            }
            resolve();
        })
    }

    public getContacts(params: { q?: string, 'max-results'?: number, 'start-index'?: number, orderby?: 'lastmodified', sortorder?: 'ascending' | 'descending' } = {}) : Promise<GoogleServiceContacts> {
        return this.get(`https://www.google.com/m8/feeds/contacts/${this.credentials.extra[ 'email' ]}/full`, {
            params
        }).then((res) => {
            let feed    = res.data.feed;
            let entries = feed.entry.map(entry => {
                let idSegments: string[] = entry[ 'id' ][ '$t' ].split('/')
                return {
                    id     : idSegments[ idSegments.length - 1 ],
                    name   : entry[ 'title' ][ '$t' ],
                    numbers: entry[ 'gd$phoneNumber' ] ? entry[ 'gd$phoneNumber' ].map(phone => {
                        return {
                            type  : phone[ 'rel' ] ? phone[ 'rel' ].split('#')[ 1 ] : 'mobile',
                            number: phone[ '$t' ]
                        }
                    }) : []
                }
            });

            return Promise.resolve({ results: parseInt(feed[ 'openSearch$totalResults' ][ '$t' ]), entries })
        })
    }

}

export interface AxiosResponse<T extends {} = {}> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
}
export interface GoogleApiExchangeData {
    access_token: string
    id_token: string
    refresh_token: string
    expires_in: number
    token_type: string
}
export class GoogleServiceAuth {
    @lazyInject('r.log')
    log: Log

    scopes: string[] = [
        'auth/calendar',
        'auth/contacts',
        'auth/userinfo.email',
        'auth/userinfo.profile',
    ]
    port: number     = 31337;

    protected client: AxiosInstance

    protected callbackUrl: string   = '/oauth2callback'
    protected state: string         = getRandomId(30)
    protected codeChallenge: string = getRandomId(45)


    constructor(protected creds: Credential) {
        this.client = Axios.create({
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        })
    }

    protected getRedirectUri(): string { return 'http://127.0.0.1:' + this.port + this.callbackUrl}

    needsAuthorize(): boolean {
        return this.creds.extra[ 'expires_at' ] === undefined
    }

    needsRefresh(): boolean {
        return this.needsAuthorize() === false && Date.now() > this.creds.extra[ 'expires_at' ]
    }

    revoke(): Promise<any> {
        return new Promise((resolve, reject) => {

            this.client
                .post('https://www.googleapis.com/oauth2/v4/revoke', {}, {
                    params: {
                        token: this.creds.extra[ 'access_token' ]
                    }
                })
                .then((res: AxiosResponse) => {
                    if ( res.status === 200 ) {
                        return resolve()
                    }
                    reject('Response was not 200 but ' + res.status + ' with text: ' + res.statusText)
                })
                .catch(reject);
        });
    }

    refreshAccessToken(): Promise<Credential> {
        return new Promise((resolve, reject) => {

            this.client
                .post('https://www.googleapis.com/oauth2/v4/token', {}, {
                    params: {
                        refresh_token: this.creds.extra[ 'refresh_token' ],
                        client_id    : this.creds.key,
                        client_secret: this.creds.secret,
                        grant_type   : 'refresh_token'
                    }
                })
                .catch((err) => {
                    reject(err);
                })
                .then((res: AxiosResponse<GoogleApiExchangeData>) => {
                    this.creds.extra = {
                        ...this.creds.extra,
                        ...res.data,
                        expires_at: Date.now() + (res.data.expires_in * 1000)
                    }
                    this.creds.$query().update(this.creds).execute().then(() => {
                        resolve(this.creds)
                    });
                })
        })
    }

    exchangeCode(code: string): Promise<Credential> {
        return new Promise((resolve, reject) => {
            this.client
                .post('https://www.googleapis.com/oauth2/v4/token', {}, {
                    params: {
                        code,
                        client_id    : this.creds.key,
                        client_secret: this.creds.secret,
                        redirect_uri : this.getRedirectUri(),
                        grant_type   : 'authorization_code',
                        // code_verifier: this.codeChallenge
                    }
                })
                .catch((err) => {
                    reject(err);
                })
                .then((res: AxiosResponse<GoogleApiExchangeData>) => {

                    this.creds.extra = {
                        ...this.creds.extra,
                        ...res.data,
                        code,
                        expires_at: Date.now() + (res.data.expires_in * 1000)
                    }
                    this.creds.$query().update(this.creds).execute().then(() => {
                        resolve(this.creds)
                    });

                })
        })
    }

    catchError(err) {
        this.log.error(err);
        process.exit(1)
    }

    authorize(): Promise<string> {
        return new Promise((resolve, reject) => {
            const server = createServer();

            let closing = false;
            server.on('request', (req: IncomingMessage, res: ServerResponse) => {
                if ( closing ) {
                    return;
                }

                this.log.debug('GoogleServiceAuth Server request', req)

                if ( false === req.url.startsWith(this.callbackUrl) ) {
                    res.writeHead(500)
                    // this.log.error('Server request not /oauth2callback')
                    return reject('Server request not /oauth2callback')
                }
                let query = parse(req.url.split('?')[ 1 ]);
                if ( query[ 'error' ] ) {
                    res.writeHead(500)
                    return reject(query[ 'error' ])
                }
                if ( query[ 'state' ] !== this.state ) {
                    res.writeHead(500)
                    return reject(`state mismatch. server: ${this.state}. query: ${query[ 'state' ]}`)
                }

                closing = true;
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('okay done');
                server.close()
                resolve(query[ 'code' ])
            })

            server.on('error', reject)

            try {
                server.listen(this.port, '127.0.0.1')
            } catch ( e ) {
                return reject(e);
            }

            // server.this.client.get('https://accounts.google.com/o/oauth2/v2/auth', {
            //     data
            // }).then((res) => {
            //     console.log({ res })
            // }).catch(err => {
            //     throw new Error(err);
            // });
        })
    }

    generateBrowserUrl() {
        let data = {
            client_id            : this.creds.key,
            redirect_uri         : this.getRedirectUri(),
            access_type          : 'offline',
            approval_prompt      : 'force',
            response_type        : 'code',
            scope                : this.scopes.map(scope => 'https://www.googleapis.com/' + scope).join(' '),
            state                : this.state,
            code_challenge_method: 'plain'
        };
        if ( this.creds.extra[ 'email' ] ) {
            data[ 'login_hint' ] = this.creds.extra[ 'email' ]
        }

        return 'https://accounts.google.com/o/oauth2/v2/auth?' + stringify(data);

    }

}