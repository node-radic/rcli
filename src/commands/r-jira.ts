import Axios from "axios";
import { command, CommandArguments, inject, InputHelper, Log, OutputHelper } from "@radic/console";
import { Credential } from "../database/Models/Credential";
import { fileSync } from "tmp";
import { readFile, readFileSync, writeFileSync } from "fs";

@command('jira', 'remote jira communication')
export class JiraCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    in: InputHelper

    @inject('r.log')
    log: Log;

    async handle(args: CommandArguments) {
        let con = await Credential.getDefaultFor('jira')
        console.log('a')
        if ( ! con ) {
            return false;
        }
        console.log('a')
// Dependencies
        const imageToAscii = require("image-to-ascii");
        const fs = require('pn/fs')
        const svg2png = require('svg2png')

// The path can be either a local path or an url


// Passing options

        const api = con.getJiraService();
        return new Promise((res, rej) => {
            api.listProjects((err: any, projects: any[]) => {
                projects.forEach(project => {

                    Axios.create({
                        withCredentials: true,
                        auth           : {
                            username: con.key, password: con.secret
                        }
                    })
                        .get(project.avatarUrls[ '16x16' ])
                        .then(res => {

                            res = res.data.toString().replace(/\\r\\n/,'');
                            let filePath = fileSync({postfix: '.svg'}).name;
                            let filePath2 = fileSync({postfix: '.png'}).name;
                            writeFileSync(filePath, res, 'utf-8');
                            fs.readFile(filePath).then(svg2png).then((buf:Buffer) => fs.writeFile(filePath2, buf))
                            console.log(readFileSync(filePath2, 'utf-8'));
                            return Promise.resolve(filePath2);
                        })
                        .then(filePath => new Promise((res, rej) => {
                            console.log({ filePath });
                            imageToAscii(filePath, {
                                colored: true,
                                bg     : true,
                                concat : false,
                                type: 'svg',
                                pixels : '█'
                            }, (err, converted) => {
                                if ( err ) return rej(err);
                                res(converted)
                            })
                        }))
                        .then((img: string[][]) => {
                            console.log({img});
                            if ( err ) return rej(err);
                            let texts           = [
                                ' id:   ' + project.id,
                                ' key:  ' + project.key,
                                ' name: ' + project.name,
                                ' type: ' + project.projectTypeKey,
                            ]
                            let lines: string[] = img.map(con => con.join(''));
                            for ( let i = 0; i < lines.length; i ++ ) {
                                console.log(lines[ i ], i < texts.length ? texts[ i ] : '');
                            }
                            // console.log(.join(' wit text\n'));
                            res(projects);
                        })
                        .catch(err => this.log.error(err) && rej(err))

                })
            });

        })
    }

}
export default JiraCmd
