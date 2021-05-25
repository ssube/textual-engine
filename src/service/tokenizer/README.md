# Input Service

Input services are responsible for tokenizing the player's input and turning it into commands the game can use.

For the simplest `ClassicInput`, that may involve `.split(' ')` and lowercasing. For most complex inputs, like
`NaturalInput`, NLP libraries are used to tokenize and stem the words.
