const express = require("express");
const router = express.Router();
const { Cinema } = require('../database/models/Cinema')

/**
* @Route /api/cinemas
* @Access PUBLIC
* @Request GET
*/
router.get("/", function (req, res) {
    Cinema.find({}, (err, cinemas) => {
        if (err) {
            res.status(400).json({
                error: "Error while searching for all cinemas " + err
            });
        } else {
            res.json({
                cinemas
            });
        }
    });
});

module.exports = router;
