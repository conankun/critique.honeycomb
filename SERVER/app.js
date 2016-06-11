/*
	kill $(ps ax | grep '[j]s' | awk '{ print $1 }')
	Run this command if you encounter EADDRINUSE  ERROR


	**MANDATORY**

	When writing call-back function, DO NOT use words "request" or "response".
	Should be written as "req" or "res".
*/

var http = require("http");
var https = require('https');
var fs = require("fs");
var ejs = require("ejs");
var express = require('express');
var session = require('express-session');
var request = require("request");
var cheerio = require("cheerio");
var path = require('path');
var compression = require('compression');
var cacheResponseDirective = require('express-cache-response-directive');
var mysql = require('mysql');
var async = require("async");
var crypto = require('crypto');
var bodyParser = require('body-parser');
//server INFO
var PORT1 = 80;
var PORT2 = 443;

//create a server.
var app = express();
app.enable('view cache');
app.set('views', __dirname + '/web');
app.set('view engine', 'ejs');

app.use(compression({ threshold: 0 }));
app.use(express.static(__dirname + '/public', { maxAge: 86400000*30 }));
app.use(cacheResponseDirective());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//author information
var meta_description = "Get Grading Distribution of instructor who teaches you next semester!";
var meta_author = "Junghyun Kim";
var meta_keywords = "Scheduling, Critique"

var db_config = {
	connectionLimit: 100000,
	host: "localhost",
	user: "root",
	password: "~!Honeycomb0904!@",
	port: 3306,
	database: 'honeycomb_critique',
};
var pool = mysql.createPool(db_config);

function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

var encryptionModule = function(str) {
	//salted hash
	str = "!%!Y#%FDfdgsgf4141klaj!@$!$80*(()&(^&%E%^sfafal!@$@!4!j1r3455k"+"Salted Hash"+str+"!@#@!%@#^$&$^%*&(*(#%FDGFDSJD!@%!@%@!SDFD1251ASFASFf112515112!@$%@!!@%!@%214adsfdsaf";
	var encrypted = crypto.createHash('sha256');
	encrypted.update('Hashed!');
	var output = encrypted.digest('hex');
	return output;
}

app.use(requireHTTPS);


app.get('/', function(req, res) {
	res.setHeader('Content-Type', 'text/html');

	res.render("index", {
		description: meta_description,
		author: meta_author,
		keywords: meta_keywords
	});
});

app.get("/instructor/:instructor", function(req, res) {
	var instructor = req.param("instructor");
	res.setHeader('Content-Type', 'text/html');
	pool.getConnection(function(err2, con) {
			if(err2) {
				//con.release();
				res.end();
			} else {
				var query = "select instructor, term, courseDept, courseNum, section, A, B, C, D, F, S, U, W, I, V from grade_distribution where instructor=? order by term desc";
				con.query(query, [instructor], function(err, result, fields) {
					con.release();con.destroy();
					if(err) {
						console.log(err);
						res.end("Unknown error has occured.");
					} else {
						res.render("instructor", {
							description: meta_description,
							author: meta_author,
							keywords: meta_keywords,
							result: result,
							title: instructor
						});		
					}
				});
			}
	});
});

app.get("/course/:course", function(req, res) {
	var course = req.param("course");
	var sp = course.split(" ");
	res.setHeader('Content-Type', 'text/html');
	pool.getConnection(function(err2, con) {
			if(err2) {
				//con.release();
				res.end();
			} else {
				var query = "select instructor, term, courseDept, courseNum, section, A, B, C, D, F, S, U, W, I, V from grade_distribution where courseDept=? and courseNum=? order by term desc, section asc";
				con.query(query, [sp[0], sp[1]], function(err, result, fields) {
					con.release();con.destroy();
					if(err) {
						console.log(err);
						res.end("Unknown error has occured.");
					} else {
						res.render("course", {
							description: meta_description,
							author: meta_author,
							keywords: meta_keywords,
							result: result,
							title: course
						});		
					}
				});
			}
	});
});

app.get("/course/:course/:instructor", function(req, res) {
	var course = req.param("course");
	var instructor = req.param("instructor");
	var sp = course.split(" ");
	res.setHeader('Content-Type', 'text/html');
	pool.getConnection(function(err2, con) {
		if(err2) {
				//con.release();
				res.end();
			} else {
				var query = "select instructor, term, courseDept, courseNum, section, A, B, C, D, F, S, U, W, I, V from grade_distribution where courseDept=? and courseNum=? and instructor=? order by term desc, section asc";
				con.query(query, [sp[0], sp[1], instructor], function(err, result, fields) {
					con.release();con.destroy();
					if(err) {
						console.log(err);
						res.end("Unknown error has occured.");
					} else {
						
						res.render("course2", {
							description: meta_description,
							author: meta_author,
							keywords: meta_keywords,
							result: result,
							course: course,
							instructor: instructor
						});		
					}
				});
			}
	});
});

app.post("/instructor_list_ajax", function(req, res) {
	var input = req.param("search");
	
	var dept = ['ACCT', 'AE', 'APPH', 'ARBC', 'ARCH', 'AS', 'ASE', 'BC', 'BIOL', 'BMED', 'BMEJ', 'BMEM', 'CE', 'CEE', 'CETL', 'CHBE', 'CHE', 'CHEM', 'CHIN', 'CMPE', 'COA', 'COE', 'COOP', 'COS', 'CP', 'CS', 'CSE', 'CX', 'DOPP', 'EAS', 'ECE', 'ECEP', 'ECON', 'EE', 'EGR', 'ENGL', 'ESM', 'FL', 'FREN', 'FS', 'GER', 'GRMN', 'GT', 'GTL', 'HIST', 'HP', 'HPS', 'HS', 'HTS', 'IAC', 'ID', 'IL', 'IMBA', 'INTA', 'INTN', 'IPCO', 'IPFS', 'IPIN', 'IPSA', 'ISYE', 'JAPN', 'KOR', 'LCC', 'LING', 'LMC', 'LS', 'MATE', 'MATH', 'ME', 'MGT', 'ML', 'MOT', 'MP', 'MS', 'MSCI', 'MSE', 'MSL', 'MUSI', 'NE', 'NRE', 'NS', 'PE', 'PERS', 'PHIL', 'PHYS', 'POL', 'PREP', 'PST', 'PSY', 'PSYC', 'PTFE', 'PUBJ', 'PUBP', 'RGTE', 'RGTR', 'RUSS', 'SA', 'SOC', 'SPAN', 'TASP', 'TEX', 'TFE'];
	
	var ind = -1;
	for(var i=0;i<input.length; i++) {
		if(input[i] >= '0' && input[i] <= '9') {
			ind = i;
			break;
		}
	}
	var search = new Array();
	if(ind > -1) {
		var str = "";
		for(var i=0;i<input.length; i++) {
			if(i == ind) {
				str = str.trim();
				search.push(str);
				str="";
			}
			str += input[i];
		}
		str = str.trim();
		search.push(str);
	} else {
		search = input.split(' ');
	}
	var tmp = input.toUpperCase();
	for (var i = 0;i < dept.length; i++) {
		if (tmp == dept[i]) {
			
			ind = 0;
		}
	}
	
	pool.getConnection(function(err2, con) {
			if(err2) {
				//con.release();
				console.log(err2);
				res.end();
			} else {
				var query = "";
				if(ind > -1) {
					query = "select courseDept, courseNum from grade_distribution";
				} else {
					query = "select instructor from grade_distribution";
				}
				for (var i=0;i < search.length; i++) {
					if(i == 0) query += " where";
					else query+=" and";
					if(ind > -1) {
						if(i==0) {
							query += " courseDept like '%" + search[i] + "%'";
						} else {
							query += " courseNum like '" + search[i] + "%'";	
						}
						
					} else {
						query += " instructor like '%" + search[i] + "%'";
					}
				} 
				if(ind > -1) {
					query += " group by courseDept, courseNum limit 0,10"; 
				} else {
					query += " group by instructor limit 0,10";
				}
				con.query(query, function(err, result, fields) {
					con.release();con.destroy();
					if(err){ 
						console.log(err);
						console.log('query error');
						res.end();
					} else {
						if(result) {
							
							if(result.length == 0) {
								res.end();
							}
							var cnt = 0;
							result.forEach(function(each) {
								cnt++;
								var target = null;
								if(ind > -1) {
									target = each.courseDept + " " + each.courseNum;
								} else {
									target = each.instructor;
								}
								if(ind > -1) {
									//course
									res.write("<a href='/course/"+target+"'>"+target + "</a><br>");	
								} else {
									//instructor
									res.write("<a href='/instructor/"+target+"'>"+target + "</a><br>");	
								}
								if(cnt == result.length) {
									res.end();
								}
								
							});
						} else {
							res.end();
						}
					}
				});
				
			}
	});	
});

var privateKey = fs.readFileSync( 'privatekey.pem' );
var certificate = fs.readFileSync( 'certificate.pem' );


http.createServer(app).listen(PORT1, function(){
  console.log("SERVER RUNNING HTTP");
});


https.createServer({
	key: privateKey,
	cert: certificate
}, app).listen(PORT2, function(req, res) {
	console.log("SERVER RUNNING HTTPS");
});
