# KreoSlides PPTist Runtime Bridge

This folder contains Kreotar-specific bridge code for mounting the vendored PPTist Vue runtime inside the KreoSlides React app shell.

Responsibilities:

- create the Vue app with PPTist editor components
- initialize PPTist stores from canonical `.kreoslides` engine data
- expose `getDocument()`, `setDocument()`, and `destroy()` to the React host
- emit runtime document changes back to KreoSlides for dirty tracking and manual KreoCloud save
- apply scoped styling and English label replacement for the mounted runtime

Raw upstream PPTist source remains outside this folder.
