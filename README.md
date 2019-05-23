## Deployment
1\. Create in `root` folder `.env` file and set next required parameter: 
```
KEY_PASSWORD=...                # [required] password from private key file
```
Also you can set another environment variables:
```
NODE_ENV=...                    # dev|prod; default: prod
PROTOCOL=...                    # http|https; default: http
HOST=...                        # IP address of server host; default: 0.0.0.0
PORT=...                        # port number where you want to start server; default: 3000
SSL_PORT=...                    # if you will use "https" protocol, you can set this parameter; default: 443
RATE_LIMIT_MAX=...              # how much request a host can send before blocking; default: 10 
RATE_LIMIT_WINDOW=...           # which period of time some host can request our server using RATE_LIMIT_MAX; default: 1 (second)
RATE_LIMIT_BLOCK_DURATION=...   # how long some host will be blocked if it exceeds the requests limit; default: 86400 (seconds)
CORS_ENABLED=...                # true|false; if you want to activate special CORS rules from {root}/configs.js; default: true
KEY_FILE_NAME=...               # name of private key file, which you will put to root/resources; default: key.dat
CERTIFICATE_FILE_NAME=...       # name of certificate file, which you will put to root/resources; default: certificate.cer
SIGNED_DATA_FILE_NAME=...       # name of generated EDS file, which you will get in root/resources; default: signedData.p7s 
```

2\. Copy `key.dat` and `certificate.cer` files to `{root}/resources`

3\. Execute:
```
npm i
npm run start
```
Also, there is another command exists for starting watcher of server code changes:
```
npm run debug
``` 

## API description

#### ➜ Checking server accessibility:
##### Request:
```
route:      /
method:     GET
```
##### Response:
```
status: 200 OK
body:
{
    "success": true
}
```
This route should work **always**! 

#### ➜ Sign data:
##### Request:
```
route:      /sign
method:     POST
headers:
- Content-Type: application/json
body: 
{
    "Command": "Objects"
}
```
Inside `body` you must send any JSON-structured data, which you want to sign.

##### Response:
```
status: 200 OK
body:
{
    "success": true,
    "data": "..."
}
```
`data` parameter comes as encoded in `base64` signed data.

#### External responses if request wasn't processed successfully
- If sent data is not valid:
```
status: 400 Bad Request
body:
{
    "success": false,
    "message": "Invalid parameters"
}
```

- If route doesn't exist:
```
status: 404 Not Found
body:
{
    "success": false,
    "message": "Route not found"
}
```

- If requests limit from host is exceeded:
```
status: 429 Too Many Requests
body:
{
    "success": false,
    "message": "Request limit exceeded"
}
```

- If some server error happened:
```
status: 500 Internal Server Error
body:
{
    "success": false,
    "message": "Server error"
}
```
