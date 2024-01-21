const Bay = require('./Bay');
const Appointment = require('./Appointment');
const mysql = require('mysql');



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

db.connect((err) => {
    if(err) {
        console.error('Error connecting to Db', err.stack);
        return;
    }
    console.log('Connection established successfully.');
});



//create bays services
let bays=[
    new Bay(1,'compact'),
    new Bay(2,'medium'),
    new Bay(3,'full-size'),
    new Bay(4,'class 1 truck'),
    new Bay(5,'class 2 truck'),

    new Bay(6,'free'),
    new Bay(7,'free'),
    new Bay(8,'free'),
    new Bay(9,'free'),
    new Bay(10,'free')
]




function processDataInCalledOrder(){
    // Get all appointment in request Order
    // Fetch and schedule appointments for the current time
    db.query('SELECT * FROM appointment ORDER BY request_call', (error, appointments) => {
        if (error) {
            console.error('Error fetching appointments:', error);
            return;
        }
        // Process them the same way
        appointments.forEach(appointmentData => {
            let appointment = new Appointment(appointmentData.appointment_id, appointmentData.request_call, appointmentData.vehicle_type);
            appointment.setEndTime();

            let scheduled = false;
            for (let bay of bays) {
                if (bay.scheduleAppointment(appointment,db)) {
                    scheduled = true;
                    break;
                }
            }

            if (!scheduled) {
                // Insert into Turned_away table
                const insertQuery = 'INSERT INTO turned_away (appointment_id, turned_away_date, reason) VALUES (?, ?, ?)';
                const reason = 'Compressed'; // Example reason, adjust as needed
                db.query(insertQuery, [appointment.id, appointment.startTime, reason], (error, results) => {
                    if (error) {
                        console.error('Error inserting into Turned_away table:', error);
                    } else {
                        console.log(`Appointment ID ${appointment.id} added to Turned_away table.`);
                    }
                });
            }
        });
    });
}

processDataInCalledOrder();

