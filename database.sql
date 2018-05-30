INSERT INTO Users (password, username, email)
VALUES ('passtest', 'usertest', 'test@test.test');

INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');

CREATE TABLE Tasks (
    task_id int NOT NULL AUTO_INCREMENT,
    user_id int NOT NULL,
    task varchar(255) NOT NULL,
    PRIMARY KEY (task_id)
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
