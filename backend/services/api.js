const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const languages = require('./languages');

// REST API
const port = 8080;

//query handler
module.exports = {
	async getArticle(req, res) {
		try {
			let verifiedLanguage = verifyLanguage(req.query.lang);

			if (!verifiedLanguage.valid) {
				res.status(400).type('application/json').send({ error: 'Wikipedia does not support ' + verifiedLanguage.lang + ' language' });
				return
			}

			var cont = await getParagraph(req.params.var, verifiedLanguage.lang);
			result = [];
			// creates readable spaces
			cont.forEach(element => {
				result.push(element.replace(/[\n\r]/g, ' '))
			});
			// set result code
			res.send({
				status: 'success',
				body: result
			});
		} catch (error) {
			res.status(404).type('application/json').send({ error: 'Wikipedia does not have an article with this exact name.' })
		}
	},
	async getContents(req, res) {
		let article = req.params.var;
		let verifiedLanguage = verifyLanguage(req.query.lang);

		if (!verifiedLanguage.valid) {
			res.status(400).type('application/json').send({ error: 'Wikipedia does not support ' + verifiedLanguage.lang + ' language' });
			return
		}
		try {
			let page_url = 'https://' + verifiedLanguage.lang + '.wikipedia.org/wiki/' + article;
			const { data } = await axios.get(encodeURI(page_url));
			const $ = cheerio.load(data);

			let result = [];
			$('#toc > ul > li').each(function (i, elem) {
				let section = {
					index: "",
					name: "",
					subsections: [],
				};
				level = 2;
				prevSection = [];
				$(this).find('a').each(function (i, elem) {
					if (i === 0) {
						section = findSubsections($(this));
						//current level
						level = 2;
						topSection = section;
						//history of recent levels
						prevSection[level] = section;
						currentSection = section;
					}
					else {
						//get new level from class
						str = $(this).parent().attr('class');
						newLevel = str.match(/\d+/);
						newLevel = parseInt(newLevel, 10);
						//if level has changed, change sections
						if (level < newLevel) {
							prevSection[newLevel] = currentSection
							currentSection = topSection;
							level++;
						}
						else if (level > newLevel) {
							currentSection = prevSection[newLevel];
							level = newLevel;
						}
						topSection = findSubsections($(this));
						currentSection.subsections.push(topSection);
					}
				});
				result.push(section);
			});
			res.status(200).type('application/json').send({ body: result })
		} catch (error) {
			console.log(error);
			res.status(404).type('application/json').send({ error: 'Wikipedia does not have an article with this exact name.' })
		}
	},
	async getImages(req, res) {
		let article = req.params.var;
		let verifiedLanguage = verifyLanguage(req.query.lang);

		if (!verifiedLanguage.valid) {
			res.status(400).type('application/json').send({ error: 'Wikipedia does not support ' + verifiedLanguage.lang + ' language' });
			return
		}
		try {
			let page_url = 'https://' + verifiedLanguage.lang + '.wikipedia.org/wiki/' + article;
			const { data } = await axios.get(encodeURI(page_url));
			const $ = cheerio.load(data);
			var results = [];
			$("img").each(function (i, image) {
				results.push(url.resolve(page_url, $(image).attr('src')));
			});
			let image = $('.infobox').find('img').attr('src');
			if (!!image) {
				image = url.resolve(page_url, image)
			} else {
				image = null;
			}

			res.status(200).type('application/json').send({ body: image, images: results })
		} catch (error) {
			console.log(error);
			res.status(404).type('application/json').send({ error: 'Wikipedia does not have an article with this exact name.' })
		}
	},
};

//return contents of article, either first paragraph or itemize
async function getParagraph(str, language) {
	try {
		const { data } = await axios.get(
			encodeURI('https://' + language + '.wikipedia.org/wiki/' + str)
		);
		const $ = cheerio.load(data);

		$('div.mw-parser-output:empty').remove();
		$('p.mw-empty-elt').remove();

		var content = []
		content.push($('div.mw-parser-output > p:first').text());
		//list of items
		if (content[0].includes('may refer to:')) {
			$('div.mw-parser-output > ul').each((_idx, el) => {
				const item = $(el).text();
				content.push(item);
			});
		}

		return content;
	} catch (error) {
		// no article for topic
		return false;
	}
};

//verify validity of language
function verifyLanguage(lang) {
	if (!lang) {
		lang = 'en'
	}
	if (!languages.languages.includes(lang)) {
		return { valid: false, lang: lang }
	}
	return { valid: true, lang: lang }
}


//creates new section
function findSubsections(location) {
	let [index, ...name] = location.text().split(" ");
	name = name.join(' ');
	let subsection = {
		index: index,
		name: name,
		subsections: [],
	};
	return subsection;
}