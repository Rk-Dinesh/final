const express = require("express");
const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    data : {
        type : String,
    },
    email : {
        type : String,
    }
});

const Data = mongoose.model('Data', dataSchema);
module.exports = Data