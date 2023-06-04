# hoyolab-daily-checkin-action

A [GitHub Action](https://docs.github.com/en/actions/creating-actions/about-custom-actions) to run the [Hoyolab daily check-in](https://www.hoyolab.com/circles) 
for [Genshin Impact](https://genshin.hoyoverse.com/), [Honkai Impact 3rd](https://honkaiimpact3.hoyoverse.com/), [Honkai Star Rail](https://hsr.hoyoverse.com/) and [Tears of Themis](https://tot.hoyoverse.com/).

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

- `cookie`: The id/token cookie parameters from Hoyolab
- `language`: Language (only affects the returned message), can be one of `zh-cn`, `zh-tw`, `de-de`, `en-us`, `es-es`, `fr-fr`, `id-id`, `it-it`, `ja-jp`, `ko-kr`, `pt-pt`, `ru-ru`, `th-th`, `tr-tr`, `vi-vn`
- `genshin` (`boolean`): Genshin Impact
- `honkai3rd` (`boolean`): Honkai Inpact 3rd
- `starrail` (`boolean`): Honkai Star Rail
- `tearsofthemis` (`boolean`): Tears of Themis
