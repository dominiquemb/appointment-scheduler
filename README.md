## Navigation

The default route will take you to the new appointment page.

Going to "/admin" will show you a list of existing appointments and an admin navbar. From these pages, you can edit and cancel appointments, as well as manage hours of operation for each appointment type.


## Database queries that need to be run

create table appointments(id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100) NOT NULL, type INT NOT NULL, date VARCHAR(100) NOT NULL, time VARCHAR(20) NOT NULL, modified_by VARCHAR(100), creation_time DATETIME DEFAULT CURRENT_TIMESTAMP, modified_time DATETIME DEFAULT now(), PRIMARY KEY (id) );

create table time_settings(type VARCHAR(100) NOT NULL, start_time VAR
CHAR(50) NOT NULL, end_time VARCHAR(50) NOT NULL, time_interval VARCHAR(50) NOT NULL, places INT NOT NULL, PRIMARY KEY (type));

insert into time_settings(type, start_time, end_time, time_interval, places) values(1, "9.00", "14.00", "0.75", 4);

insert into time_settings(type, start_time, end_time, time_interval, places) values(2, "9.00", "16.00", "1.00", 1);
