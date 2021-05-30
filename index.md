<script type="text/yaml" id="data-config">
logger:
  level: warn
  name: textual-engine
locale:
  bundles:
    en:
      meta:
        create: 'created new world {{name}} ({{id}}) from {{world}} with seed of {{seed}} and room depth of {{depth}}'
        help: 'available verbs: {{verbs}}'
        quit: 'game over.'
      verbs:
        common:
          drop: drop
          hit: hit
          look: look
          move: move
          take: take
          use: use
          wait: wait
        meta:
          create: create
          debug: debug
          graph: graph
          help: help
          load: load
          quit: quit
          save: save
  current: en
services:
  actors:
    - name: actor-player
      kind: core-player-actor
    - name: actor-enemy
      kind: core-behavior-actor
  loaders:
    - name: page-loader
      kind: browser-page-loader
    - name: url-loader
      kind: browser-fetch-loader
  renders:
    - name: local-render
      kind: browser-dom-render
  states:
    - name: local-state
      kind: core-local-state
</script>
<div id="app"></div>
<script src="./bundle/browser.js">
</script>