INSERT INTO Users (password, username, email)
VALUES ('passtest', 'usertest', 'test@test.test');

INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');

CREATE TABLE Todos (
    todo_id int NOT NULL AUTO_INCREMENT,
    user_id int NOT NULL,
    todo varchar(255) NOT NULL,
    PRIMARY KEY (todo_id)
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
