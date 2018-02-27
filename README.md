### DDBot will no longer be available effective March 01 2018

---

Effective `August 06 2017`, DDBot development has ceased and will no longer receive updates* for the foreseeable future, barring any unexpected events. DDBot will be replaced by [Cast](https://github.com/CastProject/Cast) which aims to fix a lot of the issues encountered with DDBot and make an overall easier to use API for plugin developers.

> Even though DDBot has been deprecated, **you are still welcome to use it.** It is in a great state and is *mostly* production ready.

While you are in no way obligated to switch to Cast when DDBot is fully replaced by Cast, it is highly recommended so that you can continue receiving important bug fixes and improvements to the bot.

Sincerely, DDBot Team

> \* This excludes fixes for severe security issues, which will be resolved and released on a case-by-case basis.

---

![Dynastic Development](https://github.com/dynasticdevelop/assets/raw/master/images/brand.png)

# DDBot

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/468abe6cdd264bf7938087bef66d473a)](https://www.codacy.com/app/ericjrabil/DDBot?utm_source=github.com&utm_medium=referral&utm_content=dynasticdevelop/DDBot&utm_campaign=badger)

A Discord bot developed by the Dynastic Development Team.

**This project is very much a work-in-progress and contains a lot of shitty code. Contributions are appreciated!**

## I just want this bot for my guild!

You're in luck! You don't need to run the bot yourself. You can add our copy of DDBot to your server here. It is up-to-date with the latest changes and is up 24/7.

### [Add DDBot to my server](https://discordapp.com/oauth2/authorize?client_id=290294410938155008&permissions=535882838&redirect_uri=https%3A%2F%2Fdynastic.co%2Fbot%2Fauth&response_type=code&scope=bot&state=tEP4SiYR1px4nX7xuuw686LQT9hFuXGivSAneqAcCgQ%3D)

## Getting started

These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* MongoDB
* Node 7.6.0 or **higher**
* An internet connection

### Installing

* Copy Source/config.example.json to Source/config.json
* Configure your DDBot instance as you see fit by modifying the values
    * Set a strong secret in the secret field!
* Run `npm i` to install the dependencies
* Finally, run `node app.js`

## Deployment

Please only host your own copy if you are willing to abide by the clearly defined [license](https://github.com/dynasticdevelop/DDBot/blob/master/LICENSE). **Failure to comply with the listed terms will result in legal action.**

When deploying, it is recommended you use a daemon to keep the server alive. We use `pm2`, but any daemon utility, such as `forever`, should work.

### Deploying with pm2

1. Get [pm2](http://pm2.keymetrics.io) installed **globally** by running `npm i -g pm2`.
2. Once pm2 is installed, starting DDBot is as simple as running `pm2 start Source/client.js --name=DDBot`.
You can manage your pm2 instances using `pm2 show DDBot`.

You can instruct pm2 to save the currently running pm2 instances and start them at boot with `pm2 startup`.

## Authors

* [AppleBetas](https://applebetas.co) - Core Developer
* [nullpixel](https://nullpixel.uk) - Core Developer
* [Eric Rabil](https://www.github.com/EricRabil) - Core Developer 
* [CloneClasher](https://www.github.com/CloneClasher) - Contributor

## Special Thanks to

* Hyper (*Framework Developer*)

## Contributing 

Please make a [pull request](/https://github.com/dynasticdevelop/DDBot/pulls).

## License

DDBot is licensed under the [APGL-3.0 license](https://github.com/dynasticdevelop/DDBot/blob/master/LICENSE). Please see it for details.
