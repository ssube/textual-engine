# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/ssube/textual-engine/compare/v1.0.0...v1.1.0) (2021-05-16)


### Features

* **command:** implement actor hit command ([e25be91](https://github.com/ssube/textual-engine/commit/e25be91ea95646eeccea8f85d3e917936f2689fb))
* **config:** load logger options from config ([1e38a04](https://github.com/ssube/textual-engine/commit/1e38a041b11cd315d5ead2f97cdd28096a265f0f))
* **config:** validate config data before use ([d49d597](https://github.com/ssube/textual-engine/commit/d49d5975442f1a5e9601a8dfd55e56ded6c8af5c))
* **loader:** validate most data file fields ([071e543](https://github.com/ssube/textual-engine/commit/071e543c38fc93d587c5c3b7064a9de36c2d49f5))
* **render:** add Ink renderer with history and input ([c2ffe69](https://github.com/ssube/textual-engine/commit/c2ffe69c8234b7e1fb41edcdac52a1403769a458))
* **render:** limit Ink render history length, exit cleanly ([40c3a44](https://github.com/ssube/textual-engine/commit/40c3a44fb82d45b455e17d79d39aa595e194621a))
* **render:** push main loop into render ([dd6a53d](https://github.com/ssube/textual-engine/commit/dd6a53dcc61a820648b0af7cdb55afe0f888e4a2))
* **script:** add room id to look output ([201e28e](https://github.com/ssube/textual-engine/commit/201e28e5fe46fa4919744dfd7d0509ccc3b382dc))
* **state:** implement item transfer, drop/take commands ([b823475](https://github.com/ssube/textual-engine/commit/b8234752ae64703f88316f72ce37955ab61731a4))
* **util:** add state search helper for name or id ([2266380](https://github.com/ssube/textual-engine/commit/2266380065067e193c6bacd2001fd6d01c753a1d))


### Bug Fixes

* **render:** remove handlers individually rather than by name ([2f8289e](https://github.com/ssube/textual-engine/commit/2f8289ede33a829ed1438b321994da745860bde8))
* **script:** use scope state for broadcast search ([7a1c5de](https://github.com/ssube/textual-engine/commit/7a1c5de0da7495d86d32b48526be4d4f4eae7597))
* **state:** prevent transfer when target item is not in the same room, or when source and dest are the same ([1a418a6](https://github.com/ssube/textual-engine/commit/1a418a6266f130d4eea8c8540c18429cd7b43a26))
* **template:** use group/item delimiters from options when splitting ([76b1fe6](https://github.com/ssube/textual-engine/commit/76b1fe66984756e9089a48e1a5697f7bc0ef0aee))
* **util:** move async tracker out of main ([30d6341](https://github.com/ssube/textual-engine/commit/30d6341f04561268dc4dbf0eb545c256084f77c8))

## 1.0.0 (2021-05-15)


### Features

* **build:** add release target ([3aa9356](https://github.com/ssube/textual-engine/commit/3aa9356eed00211cf479167466aca1465fe18b1b))
* **build:** add standard-version for changelog and tagging ([b9cbb4f](https://github.com/ssube/textual-engine/commit/b9cbb4f0368f296f58cf87481e345ffc8ccbecbc))
