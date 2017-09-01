import { command, CommandConfig, CommandArguments, Container, Dispatcher, lazyInject, Log, OutputHelper } from "radical-console";
import { RConfig } from "../";
import { Services } from "../services/Services";
import { ConnectHelper } from "../helpers/helper.connect";
import { JiraService } from "../services/service.jira";
import { writeFileSync } from "fs";
import { tmpNameSync } from "tmp";

@command(`test
[connection:string@auth credentials]
`, 'Dev test command', <CommandConfig> {
    enabled: (c: Container) => c.get<RConfig>('r.config').get('debug', false) === true
})
export class TestCmd {

    @lazyInject('cli.events')
    protected events: Dispatcher;

    @lazyInject('r.log')
    protected log: Log;

    @lazyInject('r.config')
    protected config: RConfig;

    @lazyInject('r.services')
    protected services: Services;

    @lazyInject('cli.helpers.connect')
    protected connect: ConnectHelper;

    @lazyInject('cli.helpers.output')
    protected out: OutputHelper;


    async handle(args: CommandArguments, ...argv: any[]) {
        const fs      = require('pn/fs')
        const svg2png = require('svg2png')
        const imageToAscii = require("image-to-ascii");


        let git      = await this.connect.getService<JiraService>('jira', args.connection)
        let projects = await git.listProjects()
        let promises = projects.map((project) => {
            this.log.info('Project: ' + project.name)
            return new Promise((res, rej) => {
                require('download')(project.avatarUrls[ '16x16' ]).then((data) => {
                    let svgPath = tmpNameSync({ postfix: '.svg' })
                    let pngPath = tmpNameSync({ postfix: '.png' })
                    writeFileSync(svgPath, data);
                    this.log.info(`${project.name} avatar to ${svgPath}`)
                    fs.readFile(svgPath)
                        .then((buf: Buffer) => svg2png(buf, { height: 16, width: 16 }))
                        .then((buf: Buffer) => fs.writeFile(pngPath, buf))
                        .then((data) => new Promise((res,rej) => {
                            this.log.info(`${svgPath} to ${pngPath}`, data)
                            imageToAscii(pngPath, {
                                colored: true,
                                bg     : true,
                                concat : false,
                                size: {
                                    width: 8,
                                },
                                size_options: {
                                    fit_screen: false
                                },
                                pixels : '█'
                            }, (err, converted) => {
                                if ( err ) return rej(err);
                                res(converted)
                            })
                        }))
                        .then((img: string[][]) => {
                            console.log({img});
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
                })
            });
        })
        this.out.dump({ promises });
        return Promise.all(promises)
        // this.out.dump(projects);
    }
}
export default TestCmd