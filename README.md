## Deployment
1\. Create in `root` folder `.env` file and set next required parameters: 
```
NODE_ENV=...                    # [required] dev|prod
KEY_PASSWORD=...                # [required] password from private key file
```
Also you can set another environment variables:
```
PROTOCOL=...                    # http|https; default: http
HOST=...                        # IP address of server host; default: 0.0.0.0
PORT=...                        # port number where you want to start server; default: 3000
SSL_PORT=...                    # if you will use "https" protocol, you can set this parameter; default: 443
RATE_LIMIT_MAX=...              # how much request a host can send before blocking; default: 10 
RATE_LIMIT_WINDOW=...           # which period of time some host can request our server using RATE_LIMIT_MAX; default: 1 (second)
RATE_LIMIT_BLOCK_DURATION=...   # how long some host will be blocked if it exceeds the requests limit; default: 86400 (seconds)
CORS_ENABLED=...                # true|false; if you want to activate special CORS rules from {root}/configs.js; default: true
WRITE_INTO_FILE=...             # true|false; if you need to store signed data into file; default: false
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

## Docker mode
1\. Do the 1st and 2nd steps from `Deployment` section (see above).

2\. Run from `root` folder:
```
sudo docker build -t dss .
sudo docker run -id --env-file=.env --name dss -p 3100:3000 dss
```
Also you can use `npm` command for this purposes. See `{root}/package.json` for details. 

3\. Now you can call server from docker container with:
```
curl http://localhost:3100 
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
body:       ...
```
Inside `body` you can send any string data, which you want to sign.

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
