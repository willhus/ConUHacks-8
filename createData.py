import mysql.connector
from mysql.connector import Error
import pandas as pd

csv_file_path = 'datafile.csv'

# Read the CSV file
df = pd.read_csv(csv_file_path, header=None, names=['request_call', 'appointment_time', 'vehicle_type'])

db_config = {
    'host': 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    'port': '4000',
    'user': '2YjARqBFTg4EGni.root',
    'password': 'SzuwaxRG7sXUY1Zk',
    'database': 'Tire_Appointment',
}

try:
    # Establish a database connection
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()

    print("Database connected")

    # DELETE ALL DATA BEFORE REINSERTING
    delete_query = "DELETE FROM appointment"
    cursor.execute(delete_query)
    connection.commit()
    print("All records deleted successfully from 'appointment' table")

    # SQL query for inserting data
    insert_query = "INSERT INTO appointment (request_call, appointment_time, vehicle_type, price, duration) VALUES (%s, %s, %s, %s, %s)"

    # Iterate over the DataFrame and insert each row
    for _, row in df.iterrows():
        print(row)
        if row['vehicle_type'] in ["compact", "medium", "full-size"]:
            price = 150
            duration = 30
        elif row['vehicle_type'] == "class 1 truck":
            price = 250
            duration = 60
        elif row['vehicle_type'] == "class 2 truck":
            price = 700
            duration = 120
        cursor.execute(insert_query, (row['request_call'], row['appointment_time'], row['vehicle_type'], price, duration))

    # Commit the transaction
    connection.commit()
    print("Data inserted successfully")

    #Sort by request date

except Error as e:
    print("Error while connecting to MySQL", e)

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection is closed")


