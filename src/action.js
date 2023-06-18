/**
 * Hoyolab daily check-in action
 *
 * @link https://www.hoyolab.com/circles/
 *
 * @created      04.06.2023
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2023 smiley
 * @license      MIT
 */

// https://jamie.build/const
const core = require('@actions/core');
const http = require('@actions/http-client');

const ua        = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36';
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

const i18nGameNames = {
	'zh-cn': {
		genshin      : '原神',
		honkai3rd    : '崩坏3rd',
		starrail     : '崩坏：星穹铁道',
		tearsofthemis: '未定事件簿',
	},
	'zh-tw': {
		genshin      : '原神',
		honkai3rd    : '崩壞3rd',
		starrail     : '崩壞：星穹鐵道',
		tearsofthemis: '未定事件簿',
	},
	'en-us': {
		genshin      : 'Genshin Impact',
		honkai3rd    : 'Honkai Impact 3rd',
		starrail     : 'Honkai Star Rail',
		tearsofthemis: 'Tears of Themis',
	},
	'ja-jp': {
		genshin      : '原神',
		honkai3rd    : '崩壊3rd',
		starrail     : '崩壊：スターレイル',
		tearsofthemis: '未定事件簿',
	},
	'ko-kr': {
		genshin      : '원신',
		honkai3rd    : '붕괴3rd',
		starrail     : '붕괴: 스타레일',
		tearsofthemis: '미해결사건부',
	},
};

const httpClient         = new http.HttpClient(ua);
const accountDescription = core.getInput('account-description').substring(0, 100);
const onlyNotifyFailed   = isTruthy('only-notify-failed');

let lang = core.getInput('language').toLowerCase();

// set language to default if the value is invalid
if(!languages.includes(lang)){
	lang = 'en-us';
}

// set game name language
let gameNames = (i18nGameNames[lang] || i18nGameNames['en-us']);

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
	if(isTruthy('discord-notify')){
		await sendDiscordNotification(messages);
	}

}

/**
 * for boolean values passed via the string-only inputs
 *
 * @param {String} inputName
 * @returns {boolean}
 */
function isTruthy(inputName){
	return ['1', 'true', 't', 'yes', 'yup', 'y'].includes(core.getInput(inputName).toLowerCase());
}

/**
 * Processes the check-in for the given game
 *
 * @param {String} game
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
	if(!isTruthy(game)){
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
	let msg  = data.hasOwnProperty('message')
		? data.message
		: `An unknown error occurred`;

	if(data.hasOwnProperty('retcode') && (data.retcode === 0 || data.retcode === -5003)){

		if(game === 'genshin' && data.data.gt_result.is_risk && data.data.gt_result.risk_code === 5001){
			msg = 'claim error: captcha needs to be solved (probably) https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481'

			return returnMessage(msg, true);
		}

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
	let discordWebhook = core.getInput('discord-webhook');
	let discordUserID  = core.getInput('discord-user-id');

	if(discordWebhook === ''){
		core.setFailed('Invalid Discord webhook URL');

		return;
	}

	let message = messages.map(({fail, game, text}) => {
		return (text === null || (onlyNotifyFailed && fail === false))
			? null
			: `- [${gameNames[game]}] ${text}`;
	}).filter(m => m);

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
