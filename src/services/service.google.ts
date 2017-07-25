import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import { AbstractService } from "./AbstractService";
import { service } from "../decorators";
import { AuthMethod } from "./AuthMethod";
import { Credential, CredentialsExtraField } from "../database/Models/Credential";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { getRandomId } from "@radic/util";
import { parse, stringify } from "querystring";
import * as open from "open";
import { lazyInject, Log } from "@radic/console";
import { ServiceExtraFields } from "../interfaces";


export interface GoogleServiceContacts {
    results: number,
    entries: GoogleServiceContact[]
}
export interface GoogleServiceContact {
    id?: string
    name?: string
    numbers?: Array<{ type: string, number: string, primary?: boolean }>
}
export interface GoogleServiceExtraFields extends ServiceExtraFields {
    email        ?: string
    token_type   ?: string
    access_type  ?: string
    refresh_token?: string
    expires_at   ?: number
    expires_in   ?: string
    id_token     ?: string
}
@service({
    name   : 'google',
    methods: [ AuthMethod.oauth2 ],
    extra  : {
        email        : {
            type       : 'string',
            description: 'The email '
        },
        token_type   : 'string',
        access_type  : 'string',
        refresh_token: 'string',
        expires_at   : 'number',
        expires_in   : 'string',
        id_token     : 'string'
    }

})
export class GoogleService extends AbstractService<GoogleServiceExtraFields> {
    protected _auth: GoogleServiceAuth
    public get auth(): GoogleServiceAuth {return this._auth }

    protected requestInterceptorId: number

    public configure(options: AxiosRequestConfig = {}): AxiosRequestConfig {
        this._auth = new GoogleServiceAuth(this.credentials);

        options    = {
            ...options,
            ...{
                baseURL: 'https://www.google.com',
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


    public setCredentials(creds: Credential<GoogleServiceExtraFields>): Promise<this> {
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
        this.enableCache();
        return Promise.resolve(this);
    }

    protected authorize(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if ( this._auth.needsAuthorize() ) {
                let url = this.auth.generateBrowserUrl();
                this.log.info('Attempting to open your browser for google authorization.')
                this.log.info('If opening of your browser fails, visit this url: ')
                this.log.info(url);
                open(url, 'firefox')
                let code = await this._auth.startAuthorization();
                await this._auth.finishAuthorization(code);
            }
            if ( this._auth.needsRefresh() ) {
                await this._auth.refreshAccessToken();
            }
            resolve();
        })
    }

    protected splitContactName(name: string): { givenName: string, familyName: string, fullName: string } {

        let fullName   = `<gd:fullName>${name}</gd:fullName>`;
        let givenName  = `<gd:givenName>${name}</gd:givenName>`;
        let familyName = ''
        if ( name.split(' ').length > 1 ) {
            givenName  = `<gd:givenName>${name.split(' ')[ 0 ]}</gd:givenName>`
            familyName = `<gd:familyName>${name.split(' ')[ 1 ]}</gd:familyName>`
        }
        return { givenName, fullName, familyName };
    }

    public getContacts(params: { q?: string, 'max-results'?: number, 'start-index'?: number, orderby?: 'lastmodified', sortorder?: 'ascending' | 'descending' } = {}): Promise<GoogleServiceContacts> {
        return this.get(`/m8/feeds/contacts/default/full`, {
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

    public setContact(id: string, data: GoogleServiceContact): Promise<any> {
        let name = '';
        if ( data.name ) {
            let { familyName, fullName, givenName } = this.splitContactName(name);
            name                                    = `<gd:name>${givenName}${familyName}${fullName}</gd:name>`
        }
        let numbers = '';
        if ( data.numbers ) {
            numbers = data.numbers.map((number) => {
                let primary = number.primary ? 'primary=true' : '';
                return `<gd:phoneNumber rel="http://schemas.google.com/g/2005#${number.type}" ${primary}>${number.number}</gd:phoneNumber>`
            }).join('\n')
        }
        let body = `<entry gd:etag="*">
<id>http://www.google.com/m8/feeds/contacts/default/base/${id}</id>
  <atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/contact/2008#contact"/>
${name}
${numbers}
</entry>`
        return this.put('/m8/feeds/contacts/default/full/' + id, {}, {
            data   : body,
            headers: {
                'content-type': 'application/atom+xml',
                'if-match'    : '*'
            }
        }).then((res) => {
            if ( res.status !== 200 ) {
                return Promise.reject('The server responded with a non 200 status: ' + res.status + ' ' + res.statusText)
            }
            return Promise.resolve()
        });
    }

    public deleteContact(id: string) {
        this.delete('/m8/feeds/contacts/default/full/' + id).then(res => {
            if ( res.status !== 200 ) {
                return Promise.reject('The server responded with a non 200 status: ' + res.status + ' ' + res.statusText)
            }
            return Promise.resolve()
        })
    }

    public createContact(name: string, number: string, type: string = 'mobile'): Promise<string> {
        let { familyName, fullName, givenName } = this.splitContactName(name);
        let body                                = `<atom:entry xmlns:atom="http://www.w3.org/2005/Atom" xmlns:gd="http://schemas.google.com/g/2005">
  <atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/contact/2008#contact"/>
  <gd:name>
      ${givenName}
      ${familyName}
      ${fullName}
  </gd:name>
  <gd:phoneNumber rel="http://schemas.google.com/g/2005#${type}">  ${number}</gd:phoneNumber>
</atom:entry>`;
        return this.post('/m8/feeds/contacts/default/full', {}, {
            data   : body,
            headers: {
                'content-type': 'application/atom+xml'
            }
        }).then((res) => {
            if ( res.status !== 201 ) {
                return Promise.reject('The server responded with a non 201 status: ' + res.status + ' ' + res.statusText)
            }
            let idSegments: string[] = res.data[ 'id' ][ '$t' ].split('/');
            return Promise.resolve(idSegments[ idSegments.length - 1 ]);
        })
    }

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

    revokeAccessToken(): Promise<any> {
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
                .then((res: AxiosResponse) => {
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

    catchError(err) {
        this.log.error(err);
        process.exit(1)
    }

    startAuthorization(): Promise<string> {
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

    finishAuthorization(code: string): Promise<Credential> {
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
                .then((res: AxiosResponse) => {

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