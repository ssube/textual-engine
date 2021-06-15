<script type="text/yaml" id="data-config">
{% raw %}
logger:
  level: warn
  name: textual-engine
locale:
  bundles:
    en:
      debug:
        graph:
          summary: 'wrote {{size}} node graph to {{-path}}'
      meta:
        create: 'created new world {{state.name}} ({{state.id}}) from {{world}} with seed of {{seed}} and room depth of {{depth}}'
        debug:
          none: 'no world state to debug'
        graph:
          none: 'no world state to graph'
        help: 'available verbs: {{verbs}}'
        load:
          none: 'no world states loaded from {{-path}}'
          state: 'loaded world state {{meta.id}} from {{-path}}'
        quit: 'quitting'
        save:
          none: 'no world state to save'
          state: 'saved world state {{meta.id}} from {{-path}}'
        step:
          none: 'please create a world before using any verbs'
        world: '{{name}} ({{id}})'
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
          worlds: worlds
  current: en
  verbs: []
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
      data:
        shortcuts: true
  states:
    - name: local-state
      kind: core-local-state
{% endraw %}
</script>
<div id="app"></div>
<script src="./bundle/browser.js">
</script>