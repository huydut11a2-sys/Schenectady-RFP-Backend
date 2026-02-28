var express = require('express');
var router = express.Router();
const db = require('../db');
const UAParser = require('ua-parser-js');
const axios = require('axios');

/* Initialize Database Tables */
router.get('/init', async (req, res, next) => {
    try {
        // Drop the old bids table and create the visitors table
        await db.query('DROP TABLE IF EXISTS visitors;');
        await db.query('DROP TABLE IF EXISTS bids;');

        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        ip_address TEXT,
        country VARCHAR(100),
        city VARCHAR(100),
        isp VARCHAR(150),
        browser VARCHAR(100),
        os VARCHAR(100),
        device VARCHAR(100),
        screen_resolution VARCHAR(50),
        battery_info VARCHAR(100),
        last_action VARCHAR(100) DEFAULT 'VIEW',
        visited_url TEXT,
        geolocation TEXT,
        motion_status VARCHAR(50) DEFAULT 'Static',
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP WITH TIME ZONE NULL,
        duration_seconds INTEGER DEFAULT 0
      );
    `;
        await db.query(createTableQuery);
        res.json({ message: 'Visitor database initialized successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

/* GET all visitors. */
router.get('/visitors', async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM visitors ORDER BY visited_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch visitors' });
    }
});

/* POST track a new visitor entering the site. */
router.post('/track/enter', async (req, res, next) => {
    const { visited_url, screen_resolution, battery_info, action, public_ip, lookup_ip } = req.body;
    let clientIp = public_ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    let geoIp = lookup_ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    if (geoIp && typeof geoIp === 'string') {
        geoIp = geoIp.split(',')[0].trim();
        if (geoIp === '::1') geoIp = '127.0.0.1';
    }

    // Default Location Data
    let country = 'Unknown';
    let city = 'Unknown';
    let isp = 'Unknown';

    try {
        // Use ipapi.co for much better City/Region accuracy globally
        if (geoIp && geoIp !== '127.0.0.1' && geoIp !== 'Unknown') {
            const geoResponse = await axios.get(`https://ipapi.co/${geoIp}/json/`);
            if (geoResponse.data && !geoResponse.data.error) {
                country = geoResponse.data.country_name || 'Unknown';
                city = `${geoResponse.data.city || ''}, ${geoResponse.data.region || ''}`.trim() || 'Unknown';

                let rawIsp = geoResponse.data.org || 'Unknown';
                isp = rawIsp;

                // Guess connection type based on ISP string
                let connType = '';
                const ispUpper = rawIsp.toUpperCase();

                // Public WiFi Keywords
                if (/(WIFI|GUEST|STARBUCKS|HILTON|MARRIOTT|HOTEL|AIRPORT|PUBLIC|LIBRARY)/.test(ispUpper)) {
                    connType = ' (Public WiFi)';
                }
                // Specific Vietnamese Cellular Brands
                else if (/(VIETTEL MOBILE|VNPT MOBILE|VINAPHONE|MOBIFONE)/.test(ispUpper)) {
                    connType = ' (4G/5G Cellular)';
                }
                // General Cellular / Mobile 4G 5G Keywords (Excluding major VN Broadbands that might share names)
                else if (/(WIRELESS|MOBIL|CELLULAR|T-MOBILE|AT&T|METROPCS|VODAFONE|TELECOM|SPRINT|O2|EE)/.test(ispUpper) && !/(VIETTEL|VNPT|FPT)/.test(ispUpper)) {
                    connType = ' (4G/5G Cellular)';
                }
                // Residential Broadband Keywords (Including major VN providers like Viettel Group, VNPT, FPT)
                else if (/(SPECTRUM|CHARTER|OPTIMUM|VERIZON FIOS|FIOS|COMCAST|XFINITY|COX|CENTURYLINK|FRONTIER|MEDIACOM|CABLE|FPT|VNPT|BROADBAND|VIETTEL)/.test(ispUpper)) {
                    connType = ' (Broadband/Home)';
                }

                if (connType) {
                    isp = `${rawIsp}${connType}`;
                }
            }
        }
    } catch (err) {
        console.error("GeoIP Fetch Error:", err.message);
    }

    // Parse User-Agent
    const userAgentString = req.headers['user-agent'];
    const parser = new UAParser(userAgentString);
    const parsedUA = parser.getResult();

    const browser = parsedUA.browser.name ? `${parsedUA.browser.name} ${parsedUA.browser.version}` : 'Unknown';
    const os = parsedUA.os.name ? `${parsedUA.os.name} ${parsedUA.os.version || ''}`.trim() : 'Unknown';

    // Fallback logic for device
    const { guessed_device } = req.body;
    let finalDevice = guessed_device || parsedUA.device.model || parsedUA.device.vendor || parsedUA.device.type || 'Desktop PC';
    if (finalDevice === 'Desktop PC' && os.includes('Mac OS')) finalDevice = 'Mac (Unknown Model)';
    if (finalDevice === 'Desktop PC' && os.includes('Windows')) finalDevice = 'Windows PC';

    try {
        const { motion_status } = req.body;
        const insertQuery = `
          INSERT INTO visitors(ip_address, country, city, isp, browser, os, device, screen_resolution, battery_info, last_action, visited_url, motion_status)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
          RETURNING id;
        `;
        const initialAction = action || 'VIEW';
        const { rows } = await db.query(insertQuery, [clientIp, country, city, isp, browser, os, finalDevice, screen_resolution || 'Unknown', battery_info || 'Unknown', initialAction, visited_url, motion_status || 'Static']);

        // Return tracking ID back to the client so they can ping when they leave
        res.status(201).json({ visitor_id: rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to track visitor' });
    }
});

/* POST track a visitor action (e.g. clicking a PDF). */
router.post('/track/action', async (req, res, next) => {
    const { visitor_id, action, motion_status } = req.body;

    if (!visitor_id || !action) return res.status(400).json({ error: 'Missing visitor_id or action' });

    try {
        let updateQuery = `UPDATE visitors SET last_action = $2 WHERE id = $1 RETURNING *;`;
        let params = [visitor_id, action];

        if (motion_status) {
            updateQuery = `UPDATE visitors SET last_action = $2, motion_status = $3 WHERE id = $1 RETURNING *;`;
            params = [visitor_id, action, motion_status];
        }

        await db.query(updateQuery, params);
        res.json({ message: 'Action tracked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to track action' });
    }
});

/* POST track explicit GPS Geolocation from the browser. */
router.post('/track/location', async (req, res, next) => {
    const { visitor_id, lat, lng } = req.body;

    if (!visitor_id) return res.status(400).json({ error: 'visitor_id required' });

    try {
        const geoString = `${lat}, ${lng}`;
        await db.query(`UPDATE visitors SET geolocation = $1 WHERE id = $2`, [geoString, visitor_id]);
        res.json({ success: true, coords: geoString });
    } catch (err) {
        console.error("GPS Update Error", err);
        res.status(500).json({ error: 'Failed to update GPS location' });
    }
});

/* POST track a visitor leaving/closing the site to calculate duration. */
router.post('/track/leave', async (req, res, next) => {
    const { visitor_id } = req.body;

    if (!visitor_id) return res.status(400).json({ error: 'Missing visitor_id' });

    try {
        const updateQuery = `
            UPDATE visitors 
            SET left_at = CURRENT_TIMESTAMP,
            duration_seconds = EXTRACT(EPOCH FROM(CURRENT_TIMESTAMP - visited_at)):: INTEGER
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await db.query(updateQuery, [visitor_id]);
        res.json({ message: 'Exit tracked successfully', duration: rows[0] ? rows[0].duration_seconds : 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to track exit' });
    }
});

/* DELETE a visitor log. */
router.delete('/visitors/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const deleteQuery = `
            DELETE FROM visitors 
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await db.query(deleteQuery, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json({ message: 'Log deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

module.exports = router;
