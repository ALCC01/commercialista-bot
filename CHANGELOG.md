# Changelog

## 0.2.0
### Added
* Shortcuts can be defined using a `shortcuts.json` file. Shortcuts allow users
  to define standard conversations in order to quickly build predefined
  transactions
* Shortcuts can provide a narration and a payee or let them be defined by the
  user
* Shortcuts can filter the accounts suggested to a user
* Added logging. Logs can be filtered using `LOG_LEVEL` (defaults to info)

### Changed
* The first occurrence of `:` is used to split an answer into a payee and a
  narration (eg `Payee: narration`). When no colon is found, all the string is
  treated as a narration
* The bot now respects the beancount file operating currency if 
  `DEFAULT_CURRENCY` is not provided

## 0.1.0
### Added

* Fetch options and account list from Fava on startup (currently used to suggest
  accounts to users during entry, all other options are ignored)
* Users can add new transactions
* Users can add new notes
* Users can add new balance assertions
* Users can fetch the number of errors detected in the beancount file
