/*
 * Harpoon - A Static File Server
 *
 * Features:
 *  - Session Clustering
 *  - Server Health Data
 *  - Server Clustering
 *  - Worker Threading
 *  - Lag Overload Prevention
 *  - Session Caching
 *  - Session Security
 *  - Bot Detection
 *  - Spider Detection
 *  - Throttle Resources
 *  - Resource Caching
 *  - Anti-Leeching
 *  - Anti-Query Scanning
 *  - Prevents SQL Injections
 *  - Throttles Requests
 *  - QoS Uptime
 *  - Request Logging
 *
 */

module.exports = function(options) {
	require('./lib/harpoon.js')(options);
}