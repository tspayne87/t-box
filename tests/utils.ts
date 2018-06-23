import * as HTTP from 'http';
import * as URL from 'url';

export class Http {
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
                var data = '';
                res.on('error', (err) => reject(err));
                res.on('data', chunk => data += chunk);
                res.on('end', function() {
                    try {
                        resolve(JSON.parse(data));
                    } catch(err) {
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