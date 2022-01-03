# Changelog

## Unreleased
### Added
* Shortcuts can be defined using a `shortcuts.json` file. Shortcuts allow users
  to define standard conversations in order to quickly build predefined
  transactions.

### Changed
* The first occurrence of `:` is used to split an answer into a payee and a
  narration (eg `Payee: narration`). When no colon is found, all the string is
  treated as a narration.

## 0.1.0
### Added

* Fetch options and account list from Fava on startup (currently used to suggest
  accounts to users during entry, all other options are ignored)
* Users can add new transactions
* Users can add new notes
* Users can add new balance assertions
* Users can fetch the number of errors detected in the beancount file
