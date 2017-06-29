import * as cryptico from "cryptico";
import * as fs from "fs-extra";
import { paths } from "./paths";
import { dirname } from "path";
import { singleton } from "@radic/console";

@singleton('r.keys')
export class Keys
{
    _secret: string
    _public: string


    constructor() {
        // cryptico.generateRSAKey('pass', 1024)
        if(!fs.existsSync(paths.userSecretKeyFile)){
            fs.writeFileSync(paths.userSecretKeyFile, cryptico.generateRSAKey('pass', 1024))
        }
        this._secret = fs.readFileSync(paths.userSecretKeyFile,'utf-8')
    }

    generateUserKeyFiles() {
        var key = cryptico.publicKeyString(this._secret);
        fs.ensureDirSync(dirname(paths.userPublicKeyFile));
        fs.writeFileSync(paths.userPublicKeyFile, key);
        return key;
    }

    loadUserKeyFiles() {
        return fs.readFileSync(paths.userPublicKeyFile, 'utf-8');
    }

    get secret(): string { return this._secret }

    get public(): string {
        if(!this._public){
            this._public = fs.existsSync(paths.userPublicKeyFile) ? this.loadUserKeyFiles() : this.generateUserKeyFiles();
        }
        return this._public
    }
}
