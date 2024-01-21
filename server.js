const express = require('express');
const app = express();
const mysql = require('mysql');
const port = 3000;

app.use(express.static('frontend'));

// Sql connection
const db = mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2YjARqBFTg4EGni.root',
    password: 'SzuwaxRG7sXUY1Zk',
    database: 'Tire_Appointment',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to Db', err.stack);
        return;
    }
    console.log('Connection established successfully.');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/frontend/index.html");
});

app.get('/compact-cars', (req, res) => {
    const query = 'SELECT COUNT(*) FROM appointment WHERE vehicle_type = \'compact\';';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Could not execute query', error);
            return res.status(500).send('Server error');
        }
        if (results[0]['COUNT(*)'] > 0) {
            // Send the count
            return res.status(200).json(results[0]);
        } else {
            // No compact cars found
            return res.status(404).send('No compact cars found');
        }
    });
});

app.get('/medium-cars', (req, res) => {
    const query = 'SELECT COUNT(*) FROM appointment WHERE vehicle_type = \'medium\';';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Could not execute query', error);
            return res.status(500).send('Server error');
        }
        if (results[0]['COUNT(*)'] > 0) {
            // Send the count
            return res.status(200).json(results[0]);
        } else {
            // No compact cars found
            return res.status(404).send('No medium cars found');
        }
    });
});

app.get('/full-size', (req, res) => {
    const query = 'SELECT COUNT(*) FROM appointment WHERE vehicle_type = \'full-size\';';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Could not execute query', error);
            return res.status(500).send('Server error');
        }
        if (results[0]['COUNT(*)'] > 0) {
            // Send the count
            return res.status(200).json(results[0]);
        } else {
            // No compact cars found
            return res.status(404).send('No full-size cars found');
        }
    });
});

app.get('/class-1-truck', (req, res) => {
    const query = 'SELECT COUNT(*) FROM appointment WHERE vehicle_type = \'class 1 truck\';';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Could not execute query', error);
            return res.status(500).send('Server error');
        }
        if (results[0]['COUNT(*)'] > 0) {
            // Send the count
            return res.status(200).json(results[0]);
        } else {
            // No compact cars found
            return res.status(404).send('No medium cars found');
        }
    });
});

app.get('/class-2-truck', (req, res) => {
    const query = 'SELECT COUNT(*) FROM appointment WHERE vehicle_type = \'class 2 truck\';';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Could not execute query', error);
            return res.status(500).send('Server error');
        }
        if (results[0]['COUNT(*)'] > 0) {
            // Send the count
            return res.status(200).json(results[0]);
        } else {
            // No compact cars found
            return res.status(404).send('No medium cars found');
        }
    });
});

// Add additional endpoints for medium car, full-size car, class 1 truck, class 2 truck, total, etc.

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
