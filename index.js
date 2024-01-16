import express from "express";
import bodyParser from "body-parser";
import {dirname} from "path";
import {fileURLToPath} from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Database connect
const db= new pg.Client({
    user: "postgres", 
    host: "localhost", 
    database: "world",
    password: "yogesh password",
    port: 5432,
});
db.connect();



var countriesID = [];
var totalScore = 0;
var totalCountries=0;
var curr=0;
var currentQuestion = {};


//Routes
app.get("/",(request,response)=>{
    
    db.query("SELECT COUNT(*) FROM capitals;", (err,res)=>{

        if(err){
            console.log("Error query : ",err.stack)
        }
        else
        {
            //making countriesID array 1 to ..
            totalCountries=res.rows[0].count;
            db.query("select id from capitals where country is NULL or capital is NULL;",(err,res1)=>{
                if(err){

                }
                else{
                    var noCapitalIDs=[];
                    for(let i=0;i<res1.rows.length;i++)
                    {
                        noCapitalIDs.push(res1.rows[i]['id']);
                    }
                    for(let i=0;i<totalCountries;i++)
                    {
                        if(!noCapitalIDs.includes(i+1))
                            countriesID.push(i+1);
                    }
                    // Fisher–Yates shuffle Algorithm
                    for(let i=countriesID.length-1;i>0;i--)
                    {
                        let j=Math.floor(Math.random()*(i+1));
                        //swap
                        let temp = countriesID[i];
                        countriesID[i]=countriesID[j];
                        countriesID[j]=temp;
                    }
                   
                    //getting a random country
                    db.query(`Select * from capitals where id=${countriesID[curr]};`,(err,res)=>{
                        if(err){
                            console.log("Error query : ",err.stack)
                        }
                        else{
                            currentQuestion=res.rows[0];
                            console.log(currentQuestion);
                            response.render("home.ejs",{totalScore:totalScore, question: currentQuestion});
                        }
                    });
                }
            });
        }
    });
});


app.post("/submit",(request,response)=>{
   
    let givenAnswerCapital = request.body['answer'];
    
    if(givenAnswerCapital.toLowerCase()===currentQuestion.capital.toLowerCase()){
        totalScore++;
        curr++;
        db.query(`Select * from capitals where id=${countriesID[curr]};`,(err,res)=>{
            if(err){
                console.log("Error query : ",err.stack)
            }
            else{
                currentQuestion=res.rows[0];
                console.log(currentQuestion);
                response.render("home.ejs",{totalScore:totalScore, question: currentQuestion, wasCorrect:true});
            }
        });
    }
    else{
        response.render("home.ejs",{totalScore:totalScore, question: currentQuestion, wasCorrect:false});
    }
});

app.listen(port, ()=>{
    console.log("listening to the port: "+port);
});