// https://jamie.build/const
const core = require('@actions/core');
const http = require('@actions/http-client');

const ua        = 'hoyolabDailyCheckinAction/1.0 +https://github.com/codemasher/hoyolab-daily-checkin-action';
const avatar    = 'https://raw.githubusercontent.com/codemasher/hoyolab-daily-checkin-action/main/.github/images/kirara.png';
const games     = ['genshin', 'honkai3rd', 'starrail', 'tearsofthemis'];
const languages = [
	'zh-cn', 'zh-tw', 'de-de', 'en-us', 'es-es', 'fr-fr', 'id-id', 'it-it',
	'ja-jp', 'ko-kr', 'pt-pt', 'ru-ru', 'th-th', 'tr-tr', 'vi-vn',
];
const urls      = {
	genshin      : 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?act_id=e202102251931481',
	honkai3rd    : 'https://sg-public-api.hoyolab.com/event/mani/sign?act_id=e202110291205111',
	starrail     : 'https://sg-public-api.hoyolab.com/event/luna/os/sign?act_id=e202303301540311',
	tearsofthemis: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?act_id=e202202281857121',
};
// todo: i18n
const gameNames = {
	genshin      : 'Genshin Impact',
	honkai3rd    : 'Honkai Impact 3rd',
	starrail     : 'Honkai Star Rail',
	tearsofthemis: 'Tears of Themis',
};

const httpClient         = new http.HttpClient(ua);
const accountDescription = core.getInput('account-description').substring(0, 100).trim();
const onlyNotifyFailed   = core.getInput('only-notify-failed');

let lang = core.getInput('language').toLowerCase();

// set language to default if the value is invalid
if(!languages.includes(lang)){
	lang = 'en-us';
}

// run and catch errors that may occur
run().catch(error => core.setFailed(error.message));

/**
 * the job runner
 *
 * @returns {Promise<void>}
 */
async function run(){
	// collect check-in return status
	let messages = await Promise.all(games.map(checkIn));

	// post discord notifications
	if(isTruthy(core.getInput('discord-notify'))){
		await sendDiscordNotification(messages);
	}

}

/**
 * for boolean values passed via the string-only inputs
 *
 * @param {String} bool
 * @returns {boolean}
 */
function isTruthy(bool){
	return ['1', 'true', 't', 'yes', 'yup', 'y'].includes(bool.toLowerCase());
}

/**
 * Processes the check-in for the given game
 *
 * @param game
 * @returns {Promise<Object<{fail, game, text}>>}
 */
async function checkIn(game){

	/**
	 * @param {String} text
	 * @param {Boolean} fail
	 * @returns {Object<{fail, game, text}>}
	 */
	let returnMessage = (text, fail) => {

		if(fail){
			core.setFailed(`${text} (${gameNames[game]})`);
		}

		return {fail: fail, game: game, text: text};
	};

	// skip unwanted games
	if(!isTruthy(core.getInput(game))){
		return returnMessage(null, false);
	}

	// fire check-in request
	let response = await httpClient.post(`${urls[game]}&lang=${lang}`, '', {cookie: core.getInput('cookie')});

	// oop
	if(response.message.statusCode !== 200){
		return returnMessage(`HTTP error! Status: ${response.message.statusCode}`, true);
	}

	// this is not what we expected...
	if(response.message.headers['content-type'] !== 'application/json'){
		return returnMessage(`Unexpected content-type: ${response.message.headers['content-type']}`, true);
	}

	// response seems ok
	let data = JSON.parse(await response.readBody());
	let msg = data.hasOwnProperty('message') ? data.message : `An unknown error occurred`;

	if(data.hasOwnProperty('retcode') && (data.retcode === 0 || data.retcode === -5003)){
		// echo the message in case of success
		core.info(`\u001b[38;5;40m${msg} (${gameNames[game]})`);

		return returnMessage(msg, false);
	}

	// whatever went wrong...
	return returnMessage(msg, true);
}

/**
 * Sends a status message for the current account to the given Discord webhook URL
 *
 * @param {Object<{fail, game, text}>[]} messages
 * @returns {Promise<void>}
 */
async function sendDiscordNotification(messages){
	let discordWebhook = core.getInput('discord-webhook').trim();
	let discordUserID = core.getInput('discord-user-id').trim();

	if(discordWebhook === ''){
		core.setFailed('Invalid Discord webhook URL');

		return;
	}

	let message = messages.map(m => {
		let {fail, game, text} = m;

		if(text === null || (isTruthy(onlyNotifyFailed) && fail === false)){
			return '';
		}

		return `- [${gameNames[game]}] ${text}`;
	}).filter(m => m.length > 0);

	if(message.length > 0){

		if(accountDescription !== ''){
			message.unshift(`[${accountDescription}]`);
		}

		if(discordUserID !== ''){
			message.unshift(`<@${discordUserID}>`);
		}

		let data = {
			username  : 'hoyolab-daily-checkin',
			avatar_url: avatar,
			content   : message.join('\n'),
		};

		let response = await httpClient.post(discordWebhook, JSON.stringify(data), {'content-type': 'application/json'});

		if(response.message.statusCode === 204){
			core.info(`\u001b[38;5;40mDiscord notification sent!`);

			return;
		}

		core.setFailed(`HTTP error! Status: ${response.message.statusCode} (Discord webhook)`);
	}

}
