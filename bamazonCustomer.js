require("dotenv");
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");
var itemCount;
var amt;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", // process.env.DB_USERNAME,
    password: "Navygirl07!", // process.env.DB_PASSWORD,
    database: "bamazon" // process.env.DB_NAME
});

connection.connect(function(err) {
    if(err) { throw err };
    console.log("Connected as user " + connection.threadId + "\n")
    startBamazon();
});

function.startBamazon() {
    var query = connection.query(
        "SELECT * FROM products", function(err, res) {
            if (err) throw err;
            // console.log(res);
            itemCount = res.length;
            console.log("\>\> Initializing Bamazon");
            console.log("\n\>\> listing products...");
            var table = new Table({
                head: ["ID", "Products", "Departments", "Price", "Qty"],
                colWidths: [5, 50, 20, 10, 5]
            });

            for (var i = 0; i < res.length; i++) {
                table.push([{hAlign: 'right', content: res[i].item_id}, res[i].product_name, res[i].dept_name, {hAlign: 'right', content: res[i].price}, {hAlign: 'right', content: res[i].stock_quantity}]);
            };
            console.log(table.toString());
            buyItem();
        }
    )
}

function buyItem() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'askItem',
            message: 'Please enter the ID of the product you would like to purchase.',
            validate: function(value) {
                if (!isNaN(parseFloat(value)) && value <= itemCount) {
                    return true;
                } else if (value === 0) {
                    return 'Please enter a number';
                }
            }   
            filter: Number
        },
        {
            type: 'input',
            name: 'askQty',
            message: 'Please enter the amount you would like to purchase.',
        }
    ]).then(function(answers) {
        console.log("Item: " + answers.askItem, "Qty: " + answers.askQty);
        var itemID = answers.askItem;
        var qty = answers.askQty;

        checkQty(itemID, qty);
    });
}

function checkQty(itemID, qty) {
    var query = connection.query(
        "SELECT * FROM products WHERE item_id=\"" + itemID + "\"", function(err, res) {
            if (err) throw err;
            // console.log(res);
            if (res[0].stock_quantity >= qty) {
                // amt += (res[0].price * qty);
                updateQty(itemID, qty);
            } else {
                console.log("Insufficient quantity!");
                startBamazon();
            }
        }
    )
}

function updateQty(itemID, qty) {
    var query = connection.query(
        "UPDATE products SET stock_quantity=stock_quantity-" + qty + " WHERE ?",
        [
            {
                item_id: itemID
            }
        ],
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " products updated!\n");
            logTotal(itemID, qty);

            // deleteProduct(;)
        }
    );
}

function logTotal(itemID, qty) {
    var query = connection.query(
        "SELECT price FROM products WHERE item_id=\"" + itemID + "\"", function(err, res) {
            if (err) throw err;
            // console.log(res);
            amt = (res[0].price * qty);
            // console.log("price: ", res[0].price);
            // console.log("qty: ", qty);
            // console.log("amt: ", amt);
            console.log("You owe: $" +amt.toFixed(2), "\n");
            updateProductSales(amt, itemID);
            startBamazon();
            // connection.end();
        }
    )
}

function updateProductSales(amt, itemID) {
    var query = connection.query(
        "UPDATE products SET product_sales=product_sales" + amt + " WHERE item_id=\"" + itemID + "\"", function(err, res) {
            if (err) throw err;
            // connection.end();
            // console.log("product_sales updated.")
        }
    );
}