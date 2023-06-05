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

## Usage

Create a new repository with an actions workflow: `.github/workflows/checkin.yml` which contains the following:

```yml
on:
  schedule:
    - cron: "0 19 * * *"

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
          language: "en-us"
          genshin: true
          honkai3rd: true
          starrail: true
          tearsofthemis: false
     
       # repeat the previous step for each of your accounts
```

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


## Disclaimer
WE'RE TOTALLY NOT RUNNING A PRODUCTION-LIKE ENVIRONMENT ON GITHUB.<br>
WE'RE RUNNING A TEST AND POST THE RESULT TO AN EXTERNAL WEBSITE.<br>
WE'RE JUST LOOKING IF THE SCRIPT STILL WORKS ON A DAILY SCHEDULE.

**I take no responsibility for the security of your account(s) by using this script.**
