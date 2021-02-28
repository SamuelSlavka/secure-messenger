const express = require('express');
const app = express();

const axios = require('axios');
const cheerio = require('cheerio');


const path = __dirname + '/views/';
const port = 8080;

app.get('/', function(req, res){
	var key = req.query['api-key'];
	res.send('hello');
});


app.get('/:name', async function(req, res, next){
	var name = req.params.name;
	var cont = await searchitem(name);
	res.send(cont);
});
  
app.get('/:name/heading', async function(req, res, next){
	var name = req.params.name;
	res.send( await getHeading(name));
});

//execute search in wikipedia
async function searchitem(str)
{
	try {
		const { data } = await axios.get(
			'https://en.wikipedia.org/w/index.php?search='+str+'&title=Special%3ASearch&fulltext=Search&ns0=1'
		);
		const $ = cheerio.load(data);
		var result = [];
		$('#mw-content-text')
		//$('p.mw-empty-elt').remove();
		if ($('p.mw-search-nonefound') != ''){
			result.push($('p.mw-search-nonefound').text());    
		}
		else result = await getContents(str);

		return result;
	} catch (error) {
		throw error;
	}
};

//return contents of article, either first paragraph or itemize
async function getContents(str) 
{
	try {
		const { data } = await axios.get(
			'https://en.wikipedia.org/wiki/'+str
		);
		const $ = cheerio.load(data);
    
		$('div.mw-parser-output:empty').remove();
		$('p.mw-empty-elt').remove();
		var content = []
		content.push($('div.mw-parser-output > p:first').text());
		

		if (content[0].includes('may refer to:')){
			$('div.mw-parser-output > ul').each((_idx, el) => {
				const item = $(el).text();
				content.push(item)
			});
		}
		
		return content;
	} catch (error) {
		throw error;
	}
};


app.listen(port, function () {
  console.log('Example app listening on port 8080!')
})
