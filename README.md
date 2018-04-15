# api-car-insurance


## User Stories

Our customer runs a Car Insurance company (referred as the “provider” in the requirements), which provides services for car resellers (referred as “client” in the requirements) to incorporate the insurance when selling a car. Currently, they must access the Car Insurance system, and manually fill all the information to obtain a quote. The goal of this project is to eliminate the manual intervention and provide car resellers with a REST API, so they can integrate the insurance quoting on their own systems.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisites

For development, you will only need Node.js installed on your environement.

## Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    v6.11.4

    $ npm --version
    3.10.10
    
#### Node installation on OS X

You will need to use a Terminal. On OS X, you can find the default terminal in
`/Applications/Utilities/Terminal.app`.

Please install [Homebrew](http://brew.sh/) if it's not already done with the following command.

    $ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

If everything when fine, you should run

    brew install node

#### Node installation on Linux

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

#### Node installation on Windows

Just go on [official Node.js website](http://nodejs.org/) & grab the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it.



## Install

    $ git clone https://github.com/guilhermemalfatti/api-car-insurance.git
    $ cd PROJECT
    $ npm install
    
### Configure app

Edit `.env` with the url where you have setup:
- Mysql DB
- Redis Cache

## Running the tests

    $ npm test

## Start & watch

    $ npm start

## Deployment

Depending on what platform is your deploy, by a .json config the server will start automatically after deploy, ex: Azure.
    
## Curl usage

> /quote

This post initiates the quoting process. As the quoting process is async, the initial post shall return the quote #, which will be used further on to retrieve the quote information.

    curl -d '{"customer":{"SSN":1723,"name":"Guilherme","gender":"male","dateOfBirth":"12/17/1991","address":"rua 7 de novembro","email":"email@emailcom","phoneNumber":99745321},"vehicle":{"type":"car","manufacturingYear":2000,"model":"celta","make":"Chevrolet"}}' -H "Content-Type: application/json" -X POST http://localhost:3978/quote

    {"quote":4}

---
> /quoteStatus/:quoteId

This GET retrieve a quote status. This resource is not cacheable, and return the quote#, quote status, and the quote price.

    curl -X GET http://localhost:3978/quoteStatus/2

    {"quote":{"quoteId":2,"status":"pending","price":2400}}

---
> /quoteInformation/:quoteId

This GET retrieve the quote information. This resource is cacheable, return all the data posted by the user of the API on the initial call.

    curl -X GET http://localhost:3978/quoteInformation/2

    {"quoteId":2,"SSN":123,"name":"Guilherme","gender":"male","dateOfBirth":"1990-12-17T02:00:00.000Z","address":"rua 7 de novembro","email":"email@emailcom","phoneNumber":99745321,"type":"car","manufacturingYear":2000,"model":"celta","make":"Chevrolet"}

---
> /version

This GET aims to return the API version.

    curl -X GET http://localhost:3978/version

    {"name":"api-car-insurance","version":"1.0.0"}

---
> /healthcheck

This GET is to check whether the API is alive.

    curl -X GET http://localhost:3978/healthcheck

    {"status":1}
    
## Authors

* **Guilherme Malfatti** - *Initial work*
