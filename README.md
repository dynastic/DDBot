![Dynastic Development](https://github.com/dynasticdevelop/assets/raw/master/images/brand.png)

# DDBot

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
2. Once pm2 is installed, starting DDBot is as simple as running `pm2 start app.js --name=DDBot`.
You can manage your pm2 instances using `pm2 show DDBot`.

You can instruct pm2 to save the currently running pm2 instances and start them at boot with `pm2 startup`.

## Authors

* [AppleBetas](https://applebetas.co) - Core Developer
* [nullpixel](https://nullpixel.uk) - Core Developer
* [Eric Rabil](https://www.github.com/EricRabil) - Project Developer
* [CloneClasher](https://www.github.com/CloneClasher) - Contributor

## Special Thanks to

* Hyper (*Framework Developer*)

## Contributing 

Please make a [pull request](/https://github.com/dynasticdevelop/DDBot/pulls).

## License

DDBot is licensed under the [APGL-3.0 license](https://github.com/dynasticdevelop/DDBot/blob/master/LICENSE). Please see it for details.
