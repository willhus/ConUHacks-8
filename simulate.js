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


let startDate;
let endDate;
let timerTime; // Declare timerTime in an outer scope

// Function to get the earliest and latest dates
function getStartAndEndDates() {
    return new Promise((resolve, reject) => {
        db.query('SELECT MIN(request_call) AS start, MAX(request_call) AS end FROM appointment;', (error, results) => {
            if (error) {
                return reject(error);
            }
            startDate = new Date(results[0].start);
            endDate = new Date(results[0].end);
            resolve();
        });
    });
}


/*Bay.prototype.canScheduleAppointment = function(appointment) {
    // Check if the bay's designation matches the appointment's vehicle type or if the bay is 'free'
    if (this.designation !== 'free' && this.designation !== appointment.vehicule) {
        return false;
    }

    // Iterate through each scheduled appointment in the bay
    for (let scheduledAppointment of this.appointmentList) {
        // Check for overlap
        if (appointment.startTime < scheduledAppointment.endTime && appointment.endTime > scheduledAppointment.startTime) {
            return false; // Overlap detected, cannot schedule
        }
    }

    return true; // No overlap, can schedule
};


// Function to schedule an appointment
Bay.prototype.scheduleAppointment = function(appointment) {
    // Add the appointment to this bay's appointment list if it can be scheduled
    if (this.canScheduleAppointment(appointment)) {
        this.appointmentList.push(appointment);
        return true;
    }
    return false;
};

// Function to remove completed appointments
Bay.prototype.removeCompletedAppointments = function(currentTime, db) {
    this.appointmentList.forEach(appointment => {
        if (appointment.endTime < currentTime) {
            // Update the appointment in the database before removing it from the list
            const updateQuery = 'UPDATE appointment SET bays_id = ?, bays_type = ? WHERE appointment_id  = ?';
            db.query(updateQuery, [this.id, this.designation, appointment.id], (error, results) => {
                if (error) {
                    console.error('Error updating appointment in database:', error);
                } else {
                    console.log(`Appointment ID ${appointment.id} updated with bay information.`);
                }
            });
        }
    });

    // Remove appointments that have ended before 'currentTime'
    this.appointmentList = this.appointmentList.filter(appointment => {
        return appointment.endTime >= currentTime;
    });
};*/



// Function to increment time by one minute
function incrementTime() {
    console.log(startDate);

    // Fetch and schedule appointments for the current time
    db.query('SELECT * FROM appointment WHERE request_call = ?', [startDate], (error, appointments) => {
        if (error) {
            console.error('Error fetching appointments:', error);
            return;
        }

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
                db.query(insertQuery, [appointment.id, startDate, reason], (error, results) => {
                    if (error) {
                        console.error('Error inserting into Turned_away table:', error);
                    } else {
                        console.log(`Appointment ID ${appointment.id} added to Turned_away table on ${startDate}.`);
                    }
                });
            }
        });
    });

    // Remove completed appointments
    bays.forEach(bay => bay.removeCompletedAppointments(startDate, db));

    // Check if the simulation should end
    if (startDate >= endDate) {
        clearInterval(timerTime);
        console.log("Simulation completed.");
    }
    startDate.setMinutes(startDate.getMinutes() + 1);
}




getStartAndEndDates()
    .then(() => {
        timerTime = setInterval(incrementTime, 10);
    })
    .catch(error => {
        console.error('Error fetching start and end dates:', error);
    });



