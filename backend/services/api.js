const axios = require('axios');
const cheerio = require('cheerio');


const port = 8080;

module.exports = {
	async getAll(req, res) {
		try {
			var cont = await getContents(req.params.var);
			result = [];
			cont.forEach(element => {
				result.push(element.replace(/[\n\r]/g, ' '))
			});
			return res.send({
				status: 'success',
				body: result
			});
		} catch (error) {
			return res.status(400).send({
				status: req.body
			});
		}
	},
};

//return contents of article, either first paragraph or itemize
async function getContents(str) {
	try {
		const { data } = await axios.get(
			'https://en.wikipedia.org/wiki/' + str
		);
		const $ = cheerio.load(data);

		$('div.mw-parser-output:empty').remove();
		$('p.mw-empty-elt').remove();

		var content = []
		content.push($('div.mw-parser-output > p:first').text());

		if (content[0].includes('may refer to:')) {
			$('div.mw-parser-output > ul').each((_idx, el) => {
				const item = $(el).text();
				content.push(item);
			});
		}

		return content;
	} catch (error) {
		return ['Wikipedia does not have an article with this exact name.'];
	}
};
