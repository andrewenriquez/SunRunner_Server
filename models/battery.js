var db = require("../db");

var deviceSchema = new db.Schema({
    cell1:       Number,
    cell2:       Number,
    cell3:       Number,
    cell4:       Number,
    cell5:       Number,
    cell6:       Number,
    cell7:       Number,
    cell8:       Number,
    cell9:       Number,
    cell10:       Number,
    cell11:       Number,
    cell12:       Number,
    voltage:      Number,
    current:      Number,
    charge:     Number,
    temp:       Number,
    date: { type: Date, default: Date.now }

});

var Battery = db.model("Battery", deviceSchema);

module.exports = Battery;
