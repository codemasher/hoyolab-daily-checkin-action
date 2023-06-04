// https://jamie.build/const
const core = require('@actions/core');
const http = require('@actions/http-client');

const ua        = 'hoyolabDailyCheckinAction/1.0 +https://github.com/codemasher/hoyolab-daily-checkin-action';
const games     = ['genshin', 'honkai3rd', 'starrail', 'tearsofthemis'];
const languages = [
	'zh-cn', 'zh-tw', 'de-de', 'en-us', 'es-es', 'fr-fr', 'id-id', 'it-it',
	'ja-jp', 'ko-kr', 'pt-pt', 'ru-ru', 'th-th', 'tr-tr', 'vi-vn'
];
const urls      = {
	genshin:       'https://sg-hk4e-api.hoyolab.com/event/sol/sign?act_id=e202102251931481',
	honkai3rd:     'https://sg-public-api.hoyolab.com/event/mani/sign?act_id=e202110291205111',
	starrail:      'https://sg-public-api.hoyolab.com/event/luna/os/sign?act_id=e202303301540311',
	tearsofthemis: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?act_id=e202202281857121'
}

try{
	let client = new http.HttpClient(ua);
	let lang   = core.getInput('language').toLowerCase();

	// set language to default if the value is invalid
	if(!languages.includes(lang)){
		lang = 'en-us';
	}

	games.forEach(async (game) => {

		// skip unwanted games
		if(!['1', 'true', 't', 'yes', 'y'].includes(core.getInput(game).toLowerCase())){
			return;
		}

		// fire check-in request
		let response = await client.post(`${urls[game]}&lang=${lang}`, '', {cookie: core.getInput('cookie')});

		// oop
		if(response.message.statusCode !== 200){
			throw new Error(`HTTP error! Status: ${response.message.statusCode}`);
		}

		// this is not what we expected...
		if(response.message.headers['content-type'] !== 'application/json'){
			throw new Error(`Unexpected content-type: ${response.message.headers['content-type']}`);
		}

		// response seems ok
		let body = await response.readBody()
		let json = JSON.parse(body)

		if(json.hasOwnProperty('retcode') && (json.retcode === 0 || json.retcode === -5003)){
			// return the message in case of success
			core.info(`\u001b[38;5;40m${json.message}`);
		}
		else{
			// whatever went wrong...
			if(json.message){
				core.info(`\u001b[38;5;196m${json.message}`);

				throw new Error(json.message);
			}

			throw new Error('An unknown error occurred');
		}

	});

}
catch(error){
	core.setFailed(error.message);
}
