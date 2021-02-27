# Bot to mirror subreddits

## Requirements

- Firstly you will need a app, which you can create through [developer.twitter.com](https://developer.twitter.com/en/apps)
  - For this you will need a developer account, but you can easily create one, you're also prompted to create one if you click on "Create an app".
  - Click "Create an app"
  - Fill out the forms with the needed information
- You will also need access to the Imgur API, to get access you can follow [this](https://apidocs.imgur.com/#intro) guide
- You also have to create a [Sentry](https://sentry.io/) Project. (If you don't need it you have to uninstall the `@sentry/node` package in the bot **and** backend directory, you also have to uninstall the `@sentry/tracing` package in the backend directory. Then you have to remove the code related to Sentry)
- A `.env` file in the project root **and** bot **and** backend directory
  - Copy the example.env, rename it to **.env** and fill in the needed information.
- A `config.js` file in the bot **and** backend directory
  - Copy the config.example.js and rename it to **config.ts**, set the values as you wish.

## Installation

- Clone the repository
- run `yarn` in the bot **and** backend directory

## Start the bot

To start the bot simply run

```sh
docker-compose up
```

## Issues

If you are running into any issues or have any suggentions create a [new issue](https://github.com/benferch/reddit-twitter/issues/new/choose).
