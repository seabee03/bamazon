require("dotenv");
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", // process.env.DB_USERNAME,
    password: "Navygirl07!", //   process.env.DB_PASSWORD,
    database: "bamazon" // process.env.DB_NAME
});

connection.connect(function(err) {
    if(err) { throw err };
    console.log("Connected as user " + connection.threadId + "\n")
    chooseAnOption();
});

function chooseAnOption() {
inquirer.prompt([
    {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do today?',
        choices: ['View product sales by department', 'Create new department', 'Exit'],
        filters: function(val) {
            return.val.toLowerCase();
        }
    }
]).then(function(answers) {
    var choice = answers.choice;

    switch (choice) {
        case "view product sales by department":
            viewSalesByDept();
            break;
        case "create new department":
            addNewDepartment();
            // connection.end();
            break;
        case "exit":
            console.log("\nGoodbye.\n")
            connection.end();
            break;
        default:
            console.log("There was an error, please try again.")
            chooseAnOption();
            break;
    }
});
}

function viewSalesByDept() {
    console.log("\>\> Displaying sales by department...");
    var query = connection.query(
        "SELECT d.dept_id AS id, p.dept_name AS dept, d.overhead_costs AS overhead, SUM(p.product_sales) AS sales FROM products p INNER JOIN departments d ON p.dept_name = d,dept_name GROUP BY id, dept;", function(err, res) {
            if (err) throw err;
            // console.log(res);
            // itemCount = res.length;

            console.log("\nGrabbing information, please wait...");
            var table = new Table({
                head: ["ID", "Department", "Overhead Costs", "Product Sales", "Total Profit"],
                colWidths: [5, 50, 20, 15, 15]
            });

            for (var i = 0; i < res.length; i++) {
                var totalProfit = res[i].sales = res[i].overhead;
                table.push([{hAlign: 'right', content: res[i].id}, res[i].dept, {hAlign: 'right', content: res[i].overhead}, {hAlign: 'right', content: res[i].sales}, {hAlign: 'right', content: totalProfit}]);
            };
            console.log(table.toString());
            // connection.end();
            chooseAnOption();
        }
    )
}

function addNewDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'getDeptName',
            message: 'Please enter the name of the department you would like to add.',
        },
        {
            type: 'input',
            name: 'getOverheadCosts',
            message: 'What are the monthly operating costs?',
            validate: function(value) {
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a number';
            },
            filter: Number
        },
    ]).then(function(answers) {
        var sql = "INSTERT INTO departments (dept_name, overhead_costs) VALUES (\"" + answers.getDeptName + "\", " + answers.getOverheadCosts + ")";
        var query = connection.query(sql, function(err, res) {
            if (err) throw err;
            console.log(`\n \>\> Successfully added ${answers.getDeptName}department to inventory.\n`)
            chooseAnOption();
        });
    });
}