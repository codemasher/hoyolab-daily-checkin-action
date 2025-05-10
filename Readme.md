# hoyolab-daily-checkin-action

A [GitHub Action](https://docs.github.com/en/actions/creating-actions/about-custom-actions) to run the [Hoyolab daily check-in](https://www.hoyolab.com/circles) 
for [Genshin Impact](https://genshin.hoyoverse.com/), [Honkai Impact 3rd](https://honkaiimpact3.hoyoverse.com/), [Honkai Star Rail](https://hsr.hoyoverse.com/) and [Tears of Themis](https://tot.hoyoverse.com/).

If you want to run this action, fork and use the [codemasher/hoyolab-daily-checkin](https://github.com/codemasher/hoyolab-daily-checkin) repo.

[![License][license-badge]][license]
[![Build][gh-action-badge]][gh-action]

[license-badge]: https://img.shields.io/github/license/codemasher/hoyolab-daily-checkin-action.svg
[license]: https://github.com/codemasher/hoyolab-daily-checkin-action/blob/main/LICENSE
[gh-action-badge]: https://img.shields.io/github/actions/workflow/status/codemasher/hoyolab-daily-checkin-action/build.yml?branch=main&logo=github
[gh-action]: https://github.com/codemasher/hoyolab-daily-checkin-action/actions/workflows/build.yml?query=branch%3Amain

## Inputs

- `cookie`: *[required]* The id/token cookie parameters from Hoyolab
- `genshin` (`boolean`): Genshin Impact
- `honkai3rd` (`boolean`): Honkai Inpact 3rd
- `starrail` (`boolean`): Honkai Star Rail
- `tearsofthemis` (`boolean`): Tears of Themis
- `language`: Language (only affects the returned message), can be one of `zh-cn`, `zh-tw`, `de-de`, `en-us`, `es-es`, `fr-fr`, `id-id`, `it-it`, `ja-jp`, `ko-kr`, `pt-pt`, `ru-ru`, `th-th`, `tr-tr`, `vi-vn`
- `account-description` (`string`): An identifier for the current account that will appear in notifications
- `only-notify-failed` (`boolean`): Only send notifications when a job failed
- `discord-notify` (`boolean`): Enable Discord notifications
- `discord-webhook` (`string`): The Discord webhook URL, see https://support.discord.com/hc/en-us/articles/228383668
- `discord-user-id` (`number`): The Discord user ID to ping, see: https://support.discord.com/hc/en-us/articles/206346498


## Usage
Create a new repository and edit/create the workflow file to run the `daily check-in action`.
No worries if you don't know much about git or github actions - you can easily edit and save the file using the online editor -
almost everything else happens :sparkles: automagically :sparkles:!

### Step-by-Step Walkthrough

#### Create a fork.
~~[Fork this repository](https://github.com/codemasher/hoyolab-daily-checkin/fork) into your GitHub account and navigate there.~~<br>
Links in the following description that are relative to your fork's URL for convenience are marked with **(R)**.

#### Get the login token
For the check-in in order to work, we need the user ID and the access token from the Hoyolab cookie - this token is valid for all games that are registered with your Hoyolab account.
Open your webbrowser, navigate to [Hoyolab Circles](https://www.hoyolab.com/circles) and log in with the hoyolab account you want to use.
Now it gets a little bit scary: open the browser's developer console (usually by pressing `F12`), go to the "console" tab and paste the following code snippet:
```js
let cookies = document.cookie.split(';').map(v => v.trim().split('='));
console.log(cookies.map(([k, v]) => ['ltuid_v2', 'ltoken'].includes(k) ? `${k}=${v};` : null).filter(v => v).join(' '));
```
When you hit `Enter` it will return a line similar to the following - copy that line:
```
ltuid=000000000; ltoken=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx;
```
<p align="center">
	<img alt="The developer console" style="width: 550px; height: auto;" src="https://raw.githubusercontent.com/codemasher/hoyolab-daily-checkin/main/.github/images/get-token.png">
</p>

#### Add repo secrets
Since the credentials are sensitive information, we don't want them committed to the public main branch, so we will to add them as repository secrets instead.
GitHub will automatically remove anything stored as repo secret from all logs and output so that sensitive data won't get leaked.

Go to the [repository secrets settings **(R)**](../../settings/secrets/actions), click "New repository secret",
enter a descriptive name, paste the token from the previous step into the text box below and save it.

<p align="center">
	<img alt="The repository secrets" style="width: 550px; height: auto;" src="https://raw.githubusercontent.com/codemasher/hoyolab-daily-checkin/main/.github/images/repo-secrets.png">
</p>

It's important that you *do not log out from the Hoyolab account* - logging out will invalidate the token, and you will need to repeat the previous steps and update the secret(s).
The token may expire, in which case you also need to repeat the procedure.

#### Edit the workflow file
Open the [workflow file **(R)**](../../blob/main/.github/workflows/checkin.yml) in your local editor/IDE or in [the web-editor **(R)**](../../edit/main/.github/workflows/checkin.yml) and start editing!
The most basic [workflow](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) would look like this:
```yml
on:
  push:
    branches:
      - main
  schedule:
    # POSIX cron syntax (daily 17:00 UTC), see https://crontab.guru/#0_17_*_*_*
    - cron: "0 17 * * *"

jobs:
  hoyolab-checkin:

    name: "Hoyolab daily check-in"
    runs-on: ubuntu-latest
    steps:

      - name: "Checkout"
        uses: actions/checkout@v3

      - name: "Hoyolab check-in (Account 1)"
        uses: codemasher/hoyolab-daily-checkin-action@main
        with:
          cookie: ${{ secrets.ACCOUNT1 }}
          genshin: true
          honkai3rd: false
          starrail: false
          tearsofthemis: false
```
That's easy enough to understand, no? You will need to set `true` for each game you have registered with your Hoyoverse account, otherwise `false` or omit the parameter.
If you want to check-in for more accounts, you need to duplicate the `Hoyolab check-in (Account X)` step and add secrets for each account.
(Just be careful with the indentation, [YAML](https://en.wikipedia.org/wiki/YAML) is *very* picky about that...)

When you're done editing, save/commit the file and head over to the [actions tab **(R)**](../../actions/workflows/checkin.yml) where a new workflow run should pop up.

*Update:* it seems that editing via the web interface does not always trigger a `git push` event properly that would start a job run, so you will need to wait for the scheduled job in that case.

<p align="center">
	<img alt="The developer console" style="width: 550px; height: auto;" src="https://raw.githubusercontent.com/codemasher/hoyolab-daily-checkin/main/.github/images/job-done.png">
</p>

#### Notification settings

##### Language
You can change the `language` for the returned messages in the GitHub actions log and other notifications:
```yml
      - name: "Hoyolab check-in (Account 1)"
        uses: codemasher/hoyolab-daily-checkin-action@main
        with:
          cookie: ${{ secrets.ACCOUNT1 }}
          genshin: true
          # ...
          language: "zh-tw"
          # ...
```
The language parameter defaults to `en-us` and can be one of:
- `zh-cn` (Chinese, traditional)
- `zh-tw` (Chinese, simplified)
- `de-de` (German)
- `en-us` (English)
- `es-es` (Spanish)
- `fr-fr` (French)
- `id-id` (Indonesian)
- `it-it` (Italian)
- `ja-jp` (Japanese)
- `ko-kr` (Korean)
- `pt-pt` (Portugese)
- `ru-ru` (Russian)
- `th-th` (Thai)
- `tr-tr` (Turkish)
- `vi-vn` (Vietnamese)

##### Account description
The `account-description` setting allows you to add an account description that will be used as identifier in external notifications (e.g. Discord) - the value will be truncated to 100 (8bit) characters.
```yml
      - name: "Hoyolab check-in (Account 1)"
        uses: codemasher/hoyolab-daily-checkin-action@main
        with:
          cookie: ${{ secrets.ACCOUNT1 }}
          genshin: true
          # ...
          account-description: "Main Account"
          # ...
```

##### Only notify on failed jobs
If you want external notifications only when a job run has failed, set `only-notify-failed` to `true` (default), set it to `false` for *all the notifications*.

```yml
      - name: "Hoyolab check-in (Account 1)"
        uses: codemasher/hoyolab-daily-checkin-action@main
        with:
          cookie: ${{ secrets.ACCOUNT1 }}
          genshin: true
          # ...
          only-notify-failed: true
          # ...
```

##### Discord notifications
You can enable Discord notifications via webhook to a channel on your server. In order to do so , set `discord-notify` to `true` and add the
`discord-webhook` ([how to get a Discord webhook URL](https://support.discord.com/hc/en-us/articles/228383668)) and optionally the
`discord-user-id` to ping ([how to get the user ID](https://support.discord.com/hc/en-us/articles/206346498)) as repository secrets.

```yml
      - name: "Hoyolab check-in (Account 1)"
        uses: codemasher/hoyolab-daily-checkin-action@main
        with:
          cookie: ${{ secrets.ACCOUNT1 }}
          genshin: true
          # ...
          language: "zh-tw"
          account-description: "Main Account"
          only-notify-failed: false
          # ...
          discord-notify: true
          discord-webhook: ${{ secrets.DISCORD_WEBHOOK }}
          discord-user-id: ${{ secrets.DISCORD_USER_ID }}
 ```

<p align="center">
	<img alt="The developer console" style="width: 550px; height: auto;" src="https://raw.githubusercontent.com/codemasher/hoyolab-daily-checkin/main/.github/images/discord-notification.png">
</p>

### Advanced

To run several accounts on a matrix, which will start a separate job for each account and will continue even if one job fails, you could do something like this:
```yml
jobs:

  hoyolab-checkin:

    name: "Hoylab daily check-in"
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false # will continue to run jobs even if one has failed
      matrix:
        include:
          - cookie: ACCOUNT1 # only the name of the cookie secret, variables don't work here
            description: "Account 1"
            genshin: true
            honkai3rd: true
            starrail: true
            tearsofthemis: false
          # repeat for each account  
          - cookie: ACCOUNT2
            description: "Account 2"
            genshin: true
            honkai3rd: false
            starrail: false
            tearsofthemis: false

    steps:

      - name: "Checkout"
        uses: actions/checkout@v3

      - name: "Hoyolab check-in"
        uses: codemasher/hoyolab-daily-checkin-action@main
        with:
          cookie: ${{ secrets[matrix.cookie] }}
          genshin: ${{ matrix.genshin }}
          honkai3rd: ${{ matrix.honkai3rd }}
          starrail: ${{ matrix.starrail }}
          tearsofthemis: ${{ matrix.tearsofthemis }}
          language: "en-us"
          account-description: ${{ matrix.description }}
          only-notify-failed: false
          discord-notify: true
          discord-webhook: ${{ secrets.DISCORD_WEBHOOK }}
          discord-user-id: ${{ secrets.DISCORD_ID }}
```



## Disclaimer
WE'RE TOTALLY NOT RUNNING A PRODUCTION-LIKE ENVIRONMENT ON GITHUB.<br>
WE'RE RUNNING A TEST AND POST THE RESULT TO AN EXTERNAL WEBSITE.<br>
WE'RE JUST LOOKING IF THE SCRIPT STILL WORKS ON A DAILY SCHEDULE.

**I take no responsibility for the security of your account(s) by using this script.**
