drop database if exists bamazon;

create database bamazon;

use bamazon;

create table products (
	item_id integer(11) auto_increment primary key,
    product_name varchar(30) not null,
    department_name varchar(30) not null,
    price varchar(30) not null,
    stock_quantity varchar(30) not null
    );
    
insert into products (product_name, department_name, price, stock_quantity)
values
	("Child Pancho Costume", "Costumes", 25.99, 10),
    ("Child Sombrero", "Costumes", 6.71, 90),
    ("Document Poster Tube", "Office", 25.99, 400),
    ("16 GB Flash Drive", "Electronics", 9.17, 1000),
    ("Motion Sensor Toilet Light", "Electronics", 15.90, 100),
    ("Fidget Spinner", "Toys", 7.99, 350),
    ("No Soliciting Sign", "Office", 6.49, 250),
    ("USB-C to Lightning Cable", "Electronics", 10.49, 200),
    ("Eloquent JavaScript", "Books", 25.15, 1500),
    ("Cascadia T-Shirt", "Clothing", 19.99, 50);
    

select * from products;