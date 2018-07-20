var express = require("express")
var mysql = require("mysql");
var jsonfile = require('jsonfile');
var credential = require("./credential.json");

var app = express();

var con = mysql.createConnection(credential);

const request = `SELECT
b.bug_id,
b.cf_tgtcomrelease,
b.cf_callcenterid AS 'callcenter_SR',
b.bug_status AS 'status',
b.bug_severity AS 'severity',
b.creation_ts AS 'date_new',
Min(ba_assigned.bug_when) AS 'date_assigned',
Min(ba_analysed.bug_when) AS 'date_analysed',
Max(ba_resolved.bug_when) AS 'date_resolved',
Max(ba_reopened.bug_when) AS 'date_reopened',
Max(ba_fixed.bug_when) AS 'date_lastfixed',
Max(ba_closed.bug_when) AS 'date_closed',
(TO_DAYS(Max(ba_closed.bug_when))-TO_DAYS(b.creation_ts)) AS 'total'
FROM
bugzilla.bugs b
LEFT OUTER JOIN bugzilla.bugs_activity ba_assigned ON ba_assigned.added='ASSIGNED/PENDING' AND ba_assigned.fieldid = 8 AND b.bug_id = ba_assigned.bug_id
LEFT OUTER JOIN bugzilla.bugs_activity ba_analysed ON ba_analysed.added='ANALYSED' AND ba_analysed.fieldid = 8 AND b.bug_id = ba_analysed.bug_id
LEFT OUTER JOIN bugzilla.bugs_activity ba_resolved ON ba_resolved.added='VERIFIED/PRIORITIZED' AND ba_resolved.fieldid = 8 AND b.bug_id = ba_resolved.bug_id
LEFT OUTER JOIN bugzilla.bugs_activity ba_reopened ON ba_reopened.added='REOPENED' AND ba_reopened.fieldid = 8 AND b.bug_id = ba_reopened.bug_id
LEFT OUTER JOIN bugzilla.bugs_activity ba_fixed ON ba_fixed.added='FIXED' AND ba_fixed.fieldid = 11 AND b.bug_id = ba_fixed.bug_id
LEFT OUTER JOIN bugzilla.bugs_activity ba_closed ON ba_closed.added='CLOSED' AND ba_closed.fieldid = 8 AND b.bug_id = ba_closed.bug_id
INNER JOIN bugzilla.products p ON b.product_id = p.id
WHERE
(b.cf_callcenterid !="" )
AND p.name IN ('Modaris','Modaservice','3D Prototyping','Modaccess')
AND b.bug_status<> "CLOSED"
AND (b.cf_tgtcomrelease <> '')
GROUP BY b.bug_id
ORDER BY b.bug_id`;

con.connect(function(err) {
    if (err) throw err;

});

app.get("/api/getData", function(req, res) {
    res.setHeader('Content-Type', 'text/json');

        con.query(""+request, function (err, result, fields) {
          if (err) throw err;
          res.json(result);   
        });
   
});

app.get("/", function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(__dirname+"/index.html");
});


app.use(function(req, res, next){
    res.setHeader("Content-Type", "text/plain");
    res.status(404).send("Page introuvable !");
});

app.listen(8080);
console.log("Running at port 8080");
