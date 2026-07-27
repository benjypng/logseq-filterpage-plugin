# logseq-filterpage-plugin

![Version](https://img.shields.io/github/v/release/benjypng/logseq-filterpage-plugin?style=flat-square&color=0969da) ![Downloads](https://img.shields.io/github/downloads/benjypng/logseq-filterpage-plugin/total?style=flat-square&color=orange) ![License](https://img.shields.io/github/license/benjypng/logseq-filterpage-plugin?style=flat-square)

> Filter the current page by its references and tags. Click a reference to show only the blocks that carry it, stack references to drill down further, and deselect to bring the page back.

---

## ✨ Features

- **One-click filtering:** every page reference and tag on the current page is listed with a count of the blocks it appears in. Click one to show only those blocks.
- **Drill-down selection:** with a filter active, the list shrinks to the references found on the visible blocks. Selecting another reference narrows the filter to blocks carrying **all** selected references; deselecting widens it again step by step.
- **Live counts:** each reference shows how many of the currently visible blocks it appears in, so counts always match what is on screen.
- **Search:** a filter box narrows the reference list itself — useful on pages with many references.
- **Non-destructive:** filtering is pure CSS injected into Logseq. Nothing is written to your graph, and the page title, Linked References section, and sidebar are never touched.
- **Persistent while you read:** the filter stays applied after closing the popup, and resets automatically when you navigate to another page.
- **Child references count:** references made in a block's children are attributed to their root block, so filtering keeps whole block trees together.

### Requirements

- **Tested with Logseq DB graphs only.** File-based graphs are untested and may not work correctly.

## ⚙️ Installation

1. Open Logseq.
2. Go to the **Marketplace** (Plugins > Marketplace).
3. Search for **filterpage**.
4. Click **Install**.

Alternatively, download a release and manually load it via **Plugins > Load unpacked plugin**.

## 🛠 Usage

### Opening the plugin

Click the filter icon in the toolbar. The popup lists every reference and tag on the current page. Press `Escape` or click outside the popup to close it.

### Filtering

1. Click a reference to show **only** blocks with that reference.
2. With a filter active, the list shows only the references present on the visible blocks. Click another one to narrow the filter to blocks carrying all selected references.
3. Click a selected reference again to deselect it and widen the filter; deselect everything to restore the full page.
4. Use the search box to find a reference when the list is long.

### Resetting

The filter clears automatically when you navigate to a different page. You can also reopen the popup and deselect the active references at any time.

## ☕️ Support

If you enjoy this plugin, please consider supporting the development.

<div align="center">
  <a href="https://github.com/sponsors/benjypng"><img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="Sponsor on Github" /></a>&nbsp;<a href="https://www.buymeacoffee.com/benjypng"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" /></a>
</div>

## 🤝 Contributing

Issues are welcome. If you find a bug, please open an issue. Pull requests are not accepted at the moment as I am not able to commit to reviewing them in a timely fashion.
