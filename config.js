module.exports = {
	rfcname: 'Harpoon File Send Server',
	localip: '127.0.0.1',
	hosts: ['localhost', '127.0.0.1'],									// Allowed Hosts For Clustering (This should always have localhost and 127.0.0.1)
	peers: ['127.0.0.1'],											// Allowed Peers For cluster Peering
	filesDirectory: __dirname + "/files/",									// Allowed Peers For cluster Peering
	logsDirectory: __dirname + "./logs/",									// Absolute path with trailing slash or relative path with trailing slash
	port: 8080,												// Server Port
	maxLag: 5000,                                                              				// Maximum Wait Time In Milliseconds
	serverSecret: "ASaltyPhras3",                                        				// Used For Session Caching
	logging: true,                                                             				// Enable or Disable Logging
	basekbps: 1000,                                                            				// Minimum rate to attempt to send files at in kb
	burstkbps: 500,                                                           				// The burst rate for sending files
	exts: ['.zip', '.rar', '.7zip', '.png', '.jpg', '.jpeg', '.gif', '.swf', '.flv', '.txt', 'status'], 	// File Types To Protect From Leeching
	picture: options.picture || __dirname + "/files/default.png"    
}