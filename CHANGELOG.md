# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/ssube/textual-engine/compare/v1.1.0...v1.2.0) (2021-05-23)


### Features

* **input:** translate verbs before sending commands ([e03f0f5](https://github.com/ssube/textual-engine/commit/e03f0f5cfb12fac16c1988af58f9b56c07d232da))
* **state:** localize output while streaming ([#60](https://github.com/ssube/textual-engine/issues/60)), select random dest portal from options ([5ed643c](https://github.com/ssube/textual-engine/commit/5ed643caeb6338af485d96daa9031625254ce620))
* begin loading and using locale from config ([0645a3e](https://github.com/ssube/textual-engine/commit/0645a3eb0d06d845d068bcac0ad98577e9c29957))
* make state event emitter, consume events from render ([#63](https://github.com/ssube/textual-engine/issues/63)) ([3722671](https://github.com/ssube/textual-engine/commit/37226710b3797216f76286e5949ae5ad757cedda))
* **build:** add docker image, split up dev and prod deps ([a9d4cbe](https://github.com/ssube/textual-engine/commit/a9d4cbea71ee8dd68d8f9b1c6150a43b32d9f61a))
* **build:** add eslint target ([90186a0](https://github.com/ssube/textual-engine/commit/90186a0fa2d74d005039bf187137b2c5f5e0b06b))
* **build:** add gitlab CI pipeline ([11e99f4](https://github.com/ssube/textual-engine/commit/11e99f43dc512e448ac7008b506b7c55a46f4123))
* **command:** add item get slot to actors and show item info (fixes [#45](https://github.com/ssube/textual-engine/issues/45)) ([dd03793](https://github.com/ssube/textual-engine/commit/dd03793fd947b49eafef300984f0601060045f3c))
* **command:** honor target for look command (fixes [#5](https://github.com/ssube/textual-engine/issues/5)) ([31b6d0f](https://github.com/ssube/textual-engine/commit/31b6d0fd6674e4237dc2b941fcd200deab879841))
* **command:** look up local target for use command (fixes [#28](https://github.com/ssube/textual-engine/issues/28)) ([3c96730](https://github.com/ssube/textual-engine/commit/3c96730c84f9c8319b0e0c624bd437c17ea67315))
* **command:** use command target for actor step target searches, disable actor step after death ([69cb0e8](https://github.com/ssube/textual-engine/commit/69cb0e852d1bf1ca8fcef4eeccc4be55245bd9b1))
* **input:** move actor/input mapping into DI module ([f2c3c7f](https://github.com/ssube/textual-engine/commit/f2c3c7f22e0f45e04b33687600750b4562bf7530))
* **input:** parse target index from commands ([4de58c7](https://github.com/ssube/textual-engine/commit/4de58c79bc8705ca40d14cf31a0d2e865efc8333))
* **module:** split input services into their own module ([2741b22](https://github.com/ssube/textual-engine/commit/2741b2278e944f8fcef167c839151673e1a1ff21))
* **render:** add marker in between turns (fixes [#48](https://github.com/ssube/textual-engine/issues/48)) ([87207ec](https://github.com/ssube/textual-engine/commit/87207ec0ca00353d1275065ef7f8f11364f298d8))
* **template:** reverse join chain operator order, AND first ([d72d955](https://github.com/ssube/textual-engine/commit/d72d955d06388bd9ed7c8d6d758b0eab53c02525))
* **util:** provide singleton factory in constructor ([79164b5](https://github.com/ssube/textual-engine/commit/79164b5c1a52e775c24e7f373007d5a6b9a64a02))
* **world:** add chance to template refs (fixes [#55](https://github.com/ssube/textual-engine/issues/55)) ([aed8219](https://github.com/ssube/textual-engine/commit/aed8219f6e0ebae630e847aeb226b1423067f1b7))
* **world:** extract focus and transfer helpers from state svc ([#50](https://github.com/ssube/textual-engine/issues/50)) ([4c97f1b](https://github.com/ssube/textual-engine/commit/4c97f1b2caa891449d5c39ac3c2be217d60a3775))
* **world:** implement save/load for local state ([c866e64](https://github.com/ssube/textual-engine/commit/c866e64ebd701cea74319463ddd296327f474cff))
* **world:** turn name/desc into template strings and start actor/room into template refs ([c1fca0c](https://github.com/ssube/textual-engine/commit/c1fca0c7972872daa3a7728cf04a02c7db8eba5e))
* move meta command handling to state service ([d4a9b14](https://github.com/ssube/textual-engine/commit/d4a9b148f7c91d2182e42677af2068b9296d2790))


### Bug Fixes

* **build:** add codeclimate and npm configs ([1243a99](https://github.com/ssube/textual-engine/commit/1243a9987ed2d954d6dfa8cb1154c88eb26fe5ac))
* **build:** add coverage and help targets, help for others ([8f3d94e](https://github.com/ssube/textual-engine/commit/8f3d94e083a20a4eacda01fdfff3925e53c6db29))
* **build:** lower coverage reqs to match current tests ([38a3283](https://github.com/ssube/textual-engine/commit/38a3283f58bc8e66aa63d0256a08bc6e93867b10))
* **build:** make docker image script fail if build or push does ([9c2f1eb](https://github.com/ssube/textual-engine/commit/9c2f1eb57ae7dc95533a9518da12cdf72ce0b8cd))
* **build:** make docker image variable, DRY up run targets ([353938e](https://github.com/ssube/textual-engine/commit/353938ed1a3dbf0eec18e3b784c4d3f7c9b5e5e8))
* **build:** remove noop CC prep job ([f0b3614](https://github.com/ssube/textual-engine/commit/f0b36149392ec9e341704f3e3a01d75b88e58157))
* **component:** remove output from Ink/React state ([d32dae5](https://github.com/ssube/textual-engine/commit/d32dae57e17adbd6be55ddd15734bd3483b08004))
* **docs:** cover build targets, debugging ([043522d](https://github.com/ssube/textual-engine/commit/043522d53ad40bccd3e27bea6b9eeee7d32690a8))
* **render:** remove extra newline, fix input height for ink render ([86434ad](https://github.com/ssube/textual-engine/commit/86434ad5c6b9d556e6e91a87195da8311c909162))
* **render:** use text box component in ink render that supports scrolling ([c272d0b](https://github.com/ssube/textual-engine/commit/c272d0bdb0e9d85d360662eb3b5be24f5b23724b))
* translate verbs when world is created, remove min param from map increment helper, various lint fixes ([7657454](https://github.com/ssube/textual-engine/commit/76574549b2ee775a45e3be338a88d5cea283fd25))
* **build:** add CI target ([e58adea](https://github.com/ssube/textual-engine/commit/e58adea40c30258e3c9f9f60afe9ecf6624cef07))
* **build:** specify paths for CC upload ([56ea58c](https://github.com/ssube/textual-engine/commit/56ea58c37fc9d96b4ea9453a74f6453f837a3e71))
* **docs:** describe most world template fields ([9a6f389](https://github.com/ssube/textual-engine/commit/9a6f389376d7c7ad46ce422f7ddf090f4cd3d7f7))
* **docs:** start describing world format, authoring ([42e25b2](https://github.com/ssube/textual-engine/commit/42e25b2763875d01df7b0e61310b4541eee3133a))
* **lint:** give single-letter generic params better names ([1b240fe](https://github.com/ssube/textual-engine/commit/1b240fe8962f2da35117f02342366c0bc9c95ccf))
* **lint:** initial cleanup ([77f7e97](https://github.com/ssube/textual-engine/commit/77f7e9703bdef8b6a622323af013d90787a79477))
* **lint:** move components out of render tree ([8a7a707](https://github.com/ssube/textual-engine/commit/8a7a707b6abfee78146e553454a9ed4be374c9cb))
* **lint:** remove unnecessary cast, some obsolete todos ([e141fd7](https://github.com/ssube/textual-engine/commit/e141fd7923adcff85e8915d5c793161c65c7250a))
* **lint:** rename script scope to context, which it is ([5bdf6da](https://github.com/ssube/textual-engine/commit/5bdf6dab8b416b8266cb3488de2d599227002170))
* **lint:** round 2 ([3d87338](https://github.com/ssube/textual-engine/commit/3d87338c65c29fdf64514384c42b748ed28f5306))
* **locale:** localize existing strings, improve some logs ([fd4d769](https://github.com/ssube/textual-engine/commit/fd4d7694d52a822d53a8f259ff04e25603a9f6ce))
* **module:** use singleton helper in DI modules ([3ce8e44](https://github.com/ssube/textual-engine/commit/3ce8e44f897956181260fe5ea2fcec006601d1d4))
* **render:** consolidate line render prompts, limit ink render history size ([a5c415a](https://github.com/ssube/textual-engine/commit/a5c415a8f51bf4b67b0b006ca6d42ce098ef5297))
* **render:** ensure line render writes output before next prompt ([26b26e6](https://github.com/ssube/textual-engine/commit/26b26e63a35d421d4f958caa5b5fc99920bb944b))
* **render:** handle errors within effects when event listeners are released early ([9003a5d](https://github.com/ssube/textual-engine/commit/9003a5d7b0807f00c6e0064d8c901ed0429c9512))
* **render:** move step output display to render hook ([25f0d3b](https://github.com/ssube/textual-engine/commit/25f0d3b0d7b572978fc7ea701a7ea2095573a668))
* **render:** put newline between turn prompt and output on line render ([d5ad920](https://github.com/ssube/textual-engine/commit/d5ad9204e09a537900d0bc3bfdb23437343ddadf))
* **render:** remove event listeners during component cleanup ([a95934f](https://github.com/ssube/textual-engine/commit/a95934fd10154beb84156c07240f55b8b1bda89c))
* **render:** remove logger-render adapter, do not write world state to logs on exit ([306a791](https://github.com/ssube/textual-engine/commit/306a79145f82503b97833b9f06f535c3999a8e71))
* **render:** show turn prompt, split input into its own module ([b3713eb](https://github.com/ssube/textual-engine/commit/b3713eb61da6ddf0ec95b8998196910012b14e6b))
* **state:** extract world generator helper from state service ([19d3b6b](https://github.com/ssube/textual-engine/commit/19d3b6bb739bc281803e4fc47d792dd6f02e42ae))
* **state:** refresh focus and transfer helpers on state load ([0e77722](https://github.com/ssube/textual-engine/commit/0e777226e487afb6ff3716649b5ab8a8ad2160fc))
* update line render to work with new events, clean up meta commands ([c72fc5d](https://github.com/ssube/textual-engine/commit/c72fc5ddede579f5eeaaf317658e895bde89f476))
* **render:** pass step result directly to ink state, split step and line state ([531a3eb](https://github.com/ssube/textual-engine/commit/531a3ebecb7538cdaa760c99d0656be923fd4a28))
* **script:** only describe current room if no target is passed to look ([b27c15e](https://github.com/ssube/textual-engine/commit/b27c15eb7fa6cf7afc91f81b0e0bd4fb63da1d50))
* **script:** only print command info for player ([af3efe6](https://github.com/ssube/textual-engine/commit/af3efe61e92f39066f16752d819c864db8fe3b8c))
* **script:** send command feedback to render output ([8619bf1](https://github.com/ssube/textual-engine/commit/8619bf187b568b109f81d18e85436d21b0762f66))
* **template:** join templates with spaces now that IDs are not templates (fixes [#52](https://github.com/ssube/textual-engine/issues/52)) ([f2acbb0](https://github.com/ssube/textual-engine/commit/f2acbb0387337028d39c4e2d2b41862c903cd2a6))
* **test:** cover map and state debug helpers ([283c8ba](https://github.com/ssube/textual-engine/commit/283c8ba830c95329dc03bd97376b4934154de5b5))
* **test:** cover models, register chai-as-promised ([ba6cc55](https://github.com/ssube/textual-engine/commit/ba6cc5598e3b3ba2920eb81c8a9195f97dc3193b))
* **test:** join chain tests for AND/OR flip ([9311363](https://github.com/ssube/textual-engine/commit/9311363e7b6adbeae60125e352e883354ffe8ca0))
* **util:** make state debug utils return output as strings rather than rendering ([fa9a26f](https://github.com/ssube/textual-engine/commit/fa9a26f6293284c7ee469c2748078fc83092f0ba))
* **util:** reduce looping when searching state, support custom matchers (fixes [#44](https://github.com/ssube/textual-engine/issues/44)) ([a305361](https://github.com/ssube/textual-engine/commit/a305361281bcc7bf8ef1d4e55e2f29ee0d815595))
* **world:** do not template entity IDs (fixes [#54](https://github.com/ssube/textual-engine/issues/54)) ([c51434d](https://github.com/ssube/textual-engine/commit/c51434d5c6b6ff1c211d3dcad1660a95dae8f386))
* **world:** match entities by ID segment when searching state (fixes [#57](https://github.com/ssube/textual-engine/issues/57)) ([50708bc](https://github.com/ssube/textual-engine/commit/50708bc5cc2fd02805928e7df19e0786f3cb8c7f))
* **world:** remove redundant lookup from transfer helpers, since clients already have target info ([518d94c](https://github.com/ssube/textual-engine/commit/518d94c517c68deedc7fd3837e6b65b08d470333))
* make sure service loggers create a child with their constructor name ([4c106f6](https://github.com/ssube/textual-engine/commit/4c106f6e02905ab3577f0bc0182ecea1616af36f))
* remove controller nomenclature ([7ae4fe8](https://github.com/ssube/textual-engine/commit/7ae4fe85039db2e358574404b98eb4c8bb662e96))

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
