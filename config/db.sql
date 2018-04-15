CREATE SCHEMA `api-car-insurance-db` ;

CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON * . * TO 'admin'@'localhost';


CREATE TABLE QuoteInformation (
    quoteId int AUTO_INCREMENT,
    SSN int ,
    name varchar(255),
    gender varchar(255),
    dateOfBirth DATE,
    address varchar(255), 
    email varchar(255), 
    phoneNumber int,
    type varchar(255),
    manufacturingYear int,
    model varchar(255),
    make varchar(255),
    PRIMARY KEY (quoteId)
);


CREATE TABLE QuoteCondition (
    quoteId int ,
    status varchar(255),
    price double(10,2),
    PRIMARY KEY (quoteId)
);
