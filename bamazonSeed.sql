DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    dept_name VARCHAR(30) NOT NULL,
    price DEC(10, 2),
    stock_quantity INT default 0,
    product_sales INT default 0,
    PRIMARY KEY (item_id)
);

CREATE TABLE departments (
    dept_i INT NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    overhead_costs INT(10),
    PRIMARY KEY (dept_id)
);

SELECT * FROM products;

INSERT INTO products (product_name, dept_name, price, stock_quantity)

VALUES
("To Kill a Mockingbird", "Books", 7.19, 50),
("Fahrenheit 451", "Books", 8.29, 50),
("Roomba", "Home", 279.99, 20),
("Tabletop Fan", "Home", 14.99, 35),
("Cat Litter", "Pet", 19.99, 15),
("Pet Brush", "Pet", 15.99, 40),
("Nintendo Switch", "Video Games", 299.99, 10),
("Cyberpunk 2077 (PS4)", "Video Games", 59.99, 50),
("Alita: Battle Angel (Blu-Ray)", "Movies", 29.96, 100),
("John Wick Chapter 3 (Blu-Ray)", "Movies", 22.99, 100);

INSERT INTO departments (dept_name, overhead_costs)
VALUES
("Books", 200),
("Home", 1000),
("Pet", 200),
("Video Games", 2000),
("Movies", 300);

SELECT * FROM products;
SELECT * FROM departments;

UPDATE products SET product_sales=product_sales+2299 WHERE item_id=10

SELECT d.dept_id AS id, p.dept_name AS dept, d.overhead_costs AS overhead, p.product_sales AS sales
FROM products p
INNER JOIN departments d 
ON p.dept_name = p.dept_name 
GROUP BY id, dept, sales;