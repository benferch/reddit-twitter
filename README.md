# Mirror Subreddits

This repository contains code for a Twitter bot which mirrors subreddits.

## Requirements

- Firstly you will need a app, which you can create through [developer.twitter.com](https://developer.twitter.com/en/apps)
  - For this you will need a developer account
  - Click "Create an app"
  - Fill out the forms with the needed information
- A `.env` file
  - Copy the example.env, rename it to **.env** and fill in the needed information, you can find all the information when you click "Keys and tokens" on the page of your Twitter app
- A `config.js` file
  - Copy the config.example.js and rename it to **config.js**, set the values as you wish

## Installation

### SSH

```sh
git clone git@github.com:benferch/reddit-twitter.git
> cd into the directory, where the bot is
yarn
```

### HTTPS

```sh
git clone https://github.com/benferch/reddit-twitter.git
> cd into the directory, where the bot is
yarn
```

## Start the bot

To start the bot simply run

```sh
yarn start
```

## Issues

If you are running into any issues or have any suggentions create a [new issue](https://github.com/benferch/reddit-twitter/issues/new/choose).
