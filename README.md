# commercialista-bot

> **commercialista** /komːertʃa'lista/ _noun_ <br>
> accountant, business consultant

`commercialista-bot` is a Telegram bot that helps you enter records into a
[beancount][beancount] file using [Fava][fava] as a backend.

The bot aims to speed up data entry while on the go, without going through the
trouble of keeping track of receipts. It is not meant to be a full replacement
for the beancount CLI tools.

## Installation

* Register a new bot and get your token from [BotFather][botfather]
* `git clone https://github.com/ALCC01/commercialista-bot`
* Configure the bot creating a `.env` file (see `.env.example`)
* `npm install --only=prod`
* `npm start`

## Configuration
`commercialista-bot` can be configured using environment variables or using a
[.env][dotenv] file.

* `TELEGRAM_TOKEN`: your bot's token
* `FAVA_PRIVATE`: your Fava endpoint (eg `https://localhost:5000/book`). This
  can contain HTTP Basic Auth credentials or other secrets which must not be
  shared with the users.
* `FAVA_PUBLIC`: your public Fava endpoint that can be shared with users in
  links. Defaults to `FAVA_PRIVATE`.
* `ALLOWED_USER_IDS`: comma-separated list of Telegram user IDs who are allowed
  to use the bot (get yours from [@RawDataBot][raw])
* `DEFAULT_CURRENCY`: the default [currency/commodity][commodities] to use when
  none is provided by the user. Defaults to the file's operating currency or to
  EUR.
* `SHORTCUTS_FILE`: your shortcuts file location. Defaults to `./shortcuts.json`

## Shortcuts
Shortcuts allow you to define custom dialogues that help users quickly create
a transaction. This is most useful with frequent kinds of transactions, such as
coffee, groceries, transportation, etc.

Shortcuts are loaded at startup from `SHORTCUTS_FILE`, a JSON file that conforms
to the [schema](./src/shortcuts/shortcuts.schema.json). You can read
[the example file](./example.shortcuts.json) for some ideas.

A shortcut is a JSON object with the following properties:
```jsonc
{
  "name": "Coffee", // The name of this shortcut
  "icon": "☕", // An emoji to represent this shortcut
  "narration": "", // Can be a custom string or 'ask' to prompt the user to provide it
  "payee": "Coffee", // Can be a custom string, 'ask' or 'ignore'
  "script": [ // Questions that will be asked to the user
    { 
      "var": "$cost", // Defines a variable $cost
      "type": "amount", // Can be 'amount' or 'account'
      "question": "💶 Amount" // The custom question that will be asked to the user
    },
    { 
      "var": "$account",
      "type": "account",
      "question": "💳 Payment method",
      "filter": "Assets:" // Only accounts that start with this value will be show to the user
    }
  ],
  "postings": [ // The postings that will constitute the transaction
    { "account": "Expenses:Food:Coffee", "amount": "$cost" },
    { "account": "$account", "amount": "-$cost" }
  ]
}
```

## [License](./LICENSE)

    Copyright (C) 2021 Alberto Coscia

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

[beancount]: https://github.com/beancount/beancount
[fava]: https://beancount.github.io/fava/
[botfather]: https://t.me/BotFather
[dotenv]: https://www.npmjs.com/package/dotenv
[raw]: https://t.me/RawDataBot
[commodities]: https://beancount.github.io/docs/beancount_language_syntax.html#commodities-currencies
