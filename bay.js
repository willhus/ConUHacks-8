const Appointment = require('./Appointment');

class Bay {
    constructor(id, designation) {
        this.id = id;
        this.designation = designation;
        this.appointmentList = []; // Initialize as an empty array
    }

    canScheduleAppointment(appointment) {
        // Check if the bay's designation matches the appointment's vehicle type or if the bay is 'free'
        if (this.designation !== 'free' && this.designation !== appointment.vehicule) {
            return false;
        }

        // Check if appointment times are within business hours (7 AM to 7 PM)
        const openingTime = new Date(appointment.startTime);
        openingTime.setHours(7, 0, 0, 0); // Set to 7:00 AM of the same day
        const closingTime = new Date(appointment.startTime);
        closingTime.setHours(19, 0, 0, 0); // Set to 7:00 PM of the same day

        if (appointment.startTime < openingTime || appointment.endTime > closingTime) {
            return false; // Appointment is outside business hours
        }

        // Iterate through each scheduled appointment in the bay
        for (let scheduledAppointment of this.appointmentList) {
            // Check for overlap
            if (appointment.startTime < scheduledAppointment.endTime && appointment.endTime > scheduledAppointment.startTime) {
                return false; // Overlap detected, cannot schedule
            }
        }

        return true; // No overlap, can schedule
    }


    scheduleAppointment(appointment,db) {
        // Add the appointment to this bay's appointment list if it can be scheduled
        if (this.canScheduleAppointment(appointment)) {
            this.appointmentList.push(appointment);
            // Update the appointment in the database before removing it from the list
            const updateQuery = 'UPDATE appointment SET bays_id = ?, bays_type = ? WHERE appointment_id = ?';
            db.query(updateQuery, [this.id, this.designation, appointment.id], (error, results) => {
                if (error) {
                    console.error('Error updating appointment in database:', error);
                } else {
                    console.log(`Appointment ID ${appointment.id} updated with bay information.`);
                }
            });
            return true;
        }
        return false;
    }

    removeCompletedAppointments(currentTime, db) {
        this.appointmentList.forEach(appointment => {
            /*if (appointment.endTime < currentTime) {
                // Update the appointment in the database before removing it from the list
                const updateQuery = 'UPDATE appointment SET bays_id = ?, bays_type = ? WHERE appointment_id = ?';
                db.query(updateQuery, [this.id, this.designation, appointment.id], (error, results) => {
                    if (error) {
                        console.error('Error updating appointment in database:', error);
                    } else {
                        console.log(`Appointment ID ${appointment.id} updated with bay information.`);
                    }
                });
            }*/
        });

        // Remove appointments that have ended before 'currentTime'
        this.appointmentList = this.appointmentList.filter(appointment => appointment.endTime >= currentTime);
    }
}

module.exports = Bay;




