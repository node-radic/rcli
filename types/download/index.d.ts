import { GotOptions } from 'got';


type DownloadOptions = GotOptions & {
    extract?: boolean
    filename?:string
    proxy?:string
};

declare function download(url:string, destination:string, options?:DownloadOptions):Promise<Buffer>
declare function download(url:string, options?:DownloadOptions):Promise<Buffer>

export = download