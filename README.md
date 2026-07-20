# BulBul — A Passport to Us

An interactive birthday page for Khushi, built as a passport/field-journal
through the relationship: how you met, the 70 days apart, engagement,
wedding, life in Bangalore, the Sweden/Norway dream, a set of promises,
and a closing letter.

## Editing the content

Everything you'll ever want to change — names, dates, the letter, the
promises, the postcard captions — lives in **`content.js`**. Open it in
any text editor, change the text between the quotes, save, and refresh
the page. You don't need to know how to code.

Layout and visuals live in `styles.css`; interactive behavior (the
opening animation, tap-to-reveal cards, live counters) lives in
`script.js`. You shouldn't need to touch either unless you want to
change how something *looks* or *behaves* rather than what it *says*.

## Previewing locally

Just double-click `index.html` to open it in your browser. Or, from a
terminal in this folder:

```
python3 -m http.server 8000
```

then open `http://localhost:8000`.

## Publishing changes

This repo is served live via GitHub Pages. After editing `content.js`
(or anything else), from a terminal in this folder:

```
git add -A
git commit -m "Update content"
git push
```

The live page updates automatically within a minute or two.

## Privacy note

This repository is **public** — anyone with the link (or who finds the
repo) can view the source and the live page. `index.html` includes a
`noindex` tag to discourage search engines from indexing it, but that
doesn't hide it from someone who has the direct link or browses the
GitHub repo itself.
