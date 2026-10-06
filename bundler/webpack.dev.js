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
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Headers': '*'
            },
            onBeforeSetupMiddleware: function(devServer)
            {
                const express = require('express');
                const crypto = require('crypto');
                const fs = require('fs');
                const cors = require('cors');

                devServer.app.use(cors());
                devServer.app.use((req, res, next) => {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Headers', '*');
                    next();
                });

                // Trailing slash redirects for coderescue and os
                devServer.app.get(['/coderescue', '/os/coderescue'], (req, res, next) => {
                    if (!req.path.endsWith('/')) {
                        return res.redirect(req.path + '/');
                    }
                    next();
                });

                // Explicit static serving for coderescue assets to prevent 404s
                devServer.app.use(['/os/coderescue/assets', '/coderescue/assets', '/os/assets', '/assets'], express.static(path.resolve(__dirname, '../static/coderescue/assets')));
                devServer.app.use(['/os/coderescue/assets', '/coderescue/assets', '/os/assets', '/assets'], express.static(path.resolve(__dirname, '../static/os/coderescue/assets')));

                devServer.app.use(express.json());
                devServer.app.use(express.urlencoded({ extended: false }));

                // Standalone Admin Static Files
                devServer.app.use(['/admin', '/static/admin'], express.static(path.resolve(__dirname, '../static/admin')));
                devServer.app.use(['/admin', '/static/admin'], express.static(path.resolve(__dirname, '../public/admin')));
                devServer.app.get(['/admin.bundle.js', '/static/admin/admin.bundle.js'], (req, res) => {
                    res.type('application/javascript').sendFile(path.resolve(__dirname, '../static/admin/admin.bundle.js'));
                });

                // Standalone Admin Route Serving
                devServer.app.get(['/admin', '/admin/', '/static/admin', '/static/admin/', '/static/admin/index.html'], (req, res) => {
                    const adminHtml = path.resolve(__dirname, '../static/admin/index.html');
                    if (fs.existsSync(adminHtml)) {
                        res.sendFile(adminHtml);
                    } else {
                        res.status(404).send('Admin Portal not found');
                    }
                });

                // Mount full SQLite Persistent Database API Router
                const apiRouter = require('../server/api');
                devServer.app.use('/api', apiRouter);
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
