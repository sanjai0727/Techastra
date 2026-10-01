const path = require('path')
const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const ip = require('ip')
const portFinderSync = require('portfinder-sync')

const infoColor = (_message) =>
{
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

module.exports = merge(
    commonConfiguration,
    {
        stats: 'errors-warnings',
        mode: 'development',
        infrastructureLogging:
        {
            level: 'warn',
        },
        devServer:
        {
            host: 'local-ip',
            port: portFinderSync.getPort(8080),
            open: true,
            https: false,
            allowedHosts: 'all',
            hot: false,
            watchFiles: ['src/**', 'static/**', 'public/**'],
            static: [
                {
                    watch: true,
                    directory: path.join(__dirname, '../public')
                },
                {
                    watch: true,
                    directory: path.join(__dirname, '../static')
                }
            ],
            client:
            {
                logging: 'none',
                overlay: true,
                progress: false
            },
            onBeforeSetupMiddleware: function(devServer)
            {
                const express = require('express');
                devServer.app.use(express.json());
                devServer.app.post('/api/admin/login', (req, res) => {
                    const { adminId, passkey } = req.body || {};
                    const expectedId = process.env.ADMIN_ID || 'admin';
                    const expectedPasskey = process.env.ADMIN_PASSKEY || 'techastra2026';
                    const trimmedId = typeof adminId === 'string' ? adminId.trim() : '';
                    const trimmedPass = typeof passkey === 'string' ? passkey.trim() : '';
                    if (trimmedId.toLowerCase() === expectedId.toLowerCase() && trimmedPass === expectedPasskey) {
                        return res.json({
                            success: true,
                            token: `adm_${Buffer.from(`${trimmedId}:${Date.now()}`).toString('base64')}`,
                            admin: {
                                id: trimmedId,
                                name: 'Chief Coordinator',
                                role: 'ADMINISTRATOR',
                                authenticatedAt: new Date().toISOString(),
                            },
                        });
                    }
                    return res.status(401).json({ success: false, error: 'Invalid Administrator ID or Passkey' });
                });
                devServer.app.post('/api/admin/verify', (req, res) => {
                    res.json({ valid: true });
                });
                devServer.app.post('/api/admin/logout', (req, res) => {
                    res.json({ success: true });
                });
            },
            onAfterSetupMiddleware: function(devServer)
            {
                const port = devServer.options.port
                const https = devServer.options.https ? 's' : ''
                const localIp = ip.address()
                const domain1 = `http${https}://${localIp}:${port}`
                const domain2 = `http${https}://localhost:${port}`
                
                console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`)
            }
        }
    }
)
