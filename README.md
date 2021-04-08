# Bot to mirror subreddits

[![Twitter Follow](https://img.shields.io/twitter/follow/r_mkeyboards)](https://twitter.com/r_mkeyboards)

---

## Requirements

- Firstly you will need a app, which you can create through [developer.twitter.com](https://developer.twitter.com/en/apps)
  - For this you will need a developer account, but you can easily create one, you're also prompted to create one if you click on "Create an app".
  - Click "Create an app"
  - Fill out the forms with the needed information
- You will also need access to the Imgur API, to get access you can follow [this](https://apidocs.imgur.com/#intro) guide
- You also have the option to use [Sentry](https://sentry.io/).
  - To use it you have to create a Sentry Project and fill in the needed information in the `.env` file.
- A `.env` file in the project root
  - Copy the example.env, rename it to **.env** and fill in the needed information.
- A `config.ts` file in the bot **and** backend directory
  - Copy the config.example.ts and rename it to **config.ts**, set the values as you wish.

## Installation

- Clone the repository
- run `yarn` in the root directory

## Usage

To start the bot simply run

```sh
docker-compose up
```

## Issues

If you are running into any issues or have any suggentions create a [new issue](https://github.com/benferch/reddit-twitter/issues/new/choose).
