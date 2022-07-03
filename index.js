const express = require('express')
const ejs = require('ejs')
const path = require('path')
const fs = require("fs")
TfIdf = require("tf-idf-search")

const app = express()
const tf_idf = new TfIdf();

const PORT = process.env.PORT || 3000;


const ProblemDirectory = "./DataSet/Problems/";

let fileNames = fs.readdirSync(ProblemDirectory);
fileNames.map((file, i) => {
  fileNames[i] = `./${ProblemDirectory}${file}`;
});

//initialize corpus from an array of file paths, returns the current state of the corpus
var corpus = tf_idf.createCorpusFromPathArray(fileNames);

const searchedUrls = fs
  .readFileSync("./DataSet/problem_urls.txt")
  .toString()
  .split("\n"); //array of all urls in txt file

app.use(express.json())
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname, "/public")));

app.get("/",(req,res) =>{
    res.render("homepage")
})

app.get("/search", async (req,res) =>{
    const queryString = req.query.question
    let search_result = await tf_idf.rankDocumentsByQuery(queryString);
    search_result = search_result.slice(0, 5);

    let questionsFound = [];
    let urls = [];
    let titles = [];
    let contents = [];

    search_result.forEach((element, i) => {
        // console.log(element)
        questionsFound[i] = fileNames[element.index];
    });

    questionsFound.forEach((element, i) => {
      titles[i] = element.substring(element.lastIndexOf("/") + 1);
      titles[i] = titles[i].slice(0, -4);
      contents[i] =
        fs
          .readFileSync(`./DataSet/Problems/${titles[i]}.txt`)
          .toString()
          .slice(2, 350) + "...";
    });
    titles.forEach((element, i) => {
      urls[i] = `https://www.codechef.com/problems/${element}`;
    });

    let data = [{}]
    for (let i = 0; i < questionsFound.length; i++) {
      data[i] = {
        title : titles[i],
        url : urls[i],
        content : contents[i]
      }
    }
    res.json(data)
})


app.listen(3000,() => {
    console.log("Listening....")
})


