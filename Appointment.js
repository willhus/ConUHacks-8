class Appointment {
    constructor(id, startTime, vehicule) {
        this.id = id;
        this.startTime = new Date(startTime); // Ensure startTime is a Date object
        this.vehicule = vehicule;
        this.endTime = null; // Initialize endTime
    }

    setEndTime() {
        let duration = 0; // Duration in minutes

        switch (this.vehicule) {
            case 'medium':
            case 'compact':
            case 'full-size':
                duration = 30;
                break;
            case 'class 1 truck':
                duration = 60;
                break;
            case 'class 2 truck':
                duration = 120;
                break;
            default:
                console.log("Error, vehicle not recognized");
                return; // Exit the method if vehicle type is not recognized
        }

        this.endTime = new Date(this.startTime.getTime()); // Clone startTime
        this.endTime.setMinutes(this.startTime.getMinutes() + duration); // Add duration
    }

    toString() {
        return `Appointment ${this.id} for a ${this.vehicule} starts at ${this.startTime} and ends at ${this.endTime}`;
    }
}

module.exports = Appointment;