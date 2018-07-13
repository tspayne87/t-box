import * as HTTP from 'http';
import * as URL from 'url';

export const connectionOptions = {
    logging: false,
    dialect: 'mssql',
    dialectModulePath: 'sequelize-msnodesqlv8',
    dialectOptions: {
        connectionString: 'Driver={SQL Server Native Client 11.0};Server=TETHYS;Database=TestApp;Trusted_Connection=yes;'
    }
};

export class Http {
    public status?: number;
    public headers: HTTP.IncomingHttpHeaders = <any>{};

    public Get(url: string): Promise<any> {
        return this.Request(url, 'GET');
    }

    public Post(url: string, data?: any): Promise<any> {
        return this.Request(url, 'POST', data);
    }

    public Delete(url: string, data?: any): Promise<any> {
        return this.Request(url, 'DELETE', data);
    }

    private Request(url: string, method: string, data?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let parsedUrl = URL.parse(url);
            let options: HTTP.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            let req = HTTP.request(options, (res) => {
                this.status = res.statusCode;
                this.headers = res.headers;
                let data = '';
                res.on('error', (err) => reject(err));
                res.on('data', chunk => data += chunk);
                res.on('end', function() {
                    try {
                        if (res.headers['content-type'] === 'application/json') {
                            resolve(JSON.parse(data));
                        } else {
                            resolve(data);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            req.on('error', (err) => reject(err));
            if (data !== undefined) req.write(JSON.stringify(data));
            req.end();
        });
    }
}