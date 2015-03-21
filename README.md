#Harpoon
![enter image description here](https://raw.githubusercontent.com/active9/harpoon/master/files/default.png)

Harpoon is a file send server written in Javascript using NodeJS & Express.

###FEATURES
 - Session Clustering
 - Server Health Data
 - Server Clustering
 - Worker Threading
 - Lag Overload Prevention
 - Session Caching
 - Session Security
 - Bot Detection
 - Spider Detection
 - Throttle Resources
 - Resource Caching
 - Anti-Leeching
 - Anti-Query Scanning
 - Prevents SQL Injections
 - Throttles Requests
 - QoS Uptime
 - Request Logging

###INSTALLING
Using Git:
```bash
git clone https://github.com/active9/harpoon
cd harpoon
npm install
```

Using NPM:
```bash
npm install harpoon -g
```
Once installed run

```bash
harpoon
```

Now visit http://localhost.rocks:8080/ in your web browser!

###CONFIGURING

Harpoon allows you to configure and load your own settings using a config.js file located in your file send servers main directory. But before you do that navigate to the directly where you wish to run harpoon from then make a folder called files. All content is served from within the files directory.

For example: If you installed harpoon and wish to run it from /var/www/harpoon you would add /var/www/harpoon/config.js and /var/www/harpoon/files/

For an example configuration see the config.js distributed with this source.

IMPORTANT: Be sure to create your own unique serverSecret phrase in your configuration file.

###OPTIONS

 - rfcname - the RFC server name
 - localip - the local ip of the box (this is generally your publicly exposed ip)
 - hosts - the hostnames & ip associated with your server
 - peers - the harpoon peer servers if clustering
 - filesDirectory - the directory to serve files from
 - port - the port in which the file send server runs on
 - maxLag - the maximum lag the server will allow before stopping new sends
 - serverSecret - a hash that is unique to your server
 - logging - enable or disable logging (true,false)
 - basekbps - base send speed in kbps
 - burstkbps - burst speed in kbps during file sends
 - exts - array of extensions to allow file sends for
 - picture - the default image to show when a file is missing

###STATISTICS
By default harpoon comes with basic statistic information which can be viewed by visiting /ping and /status with the server running. Both of which return a JSON array of data pertaining to the server session and host computer.

###CONTRIB

Harpoon is made to replace existing file send servers such as nginx or litespeed. In our tests (data not yet available) we have noticed roughly a 2 - 4x speed increase and 2-4x cpu load decrease over nginx. Harpoon is open-source via the MIT license we encourage Forking.

###LICENSE
MIT
