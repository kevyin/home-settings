# markdownlint

> Markdown/CommonMark linting and style checking for Visual Studio Code

## Intro

The [Markdown](https://en.wikipedia.org/wiki/Markdown) markup language is designed to be easy to read, write, and understand. It succeeds - and its flexibility is both a benefit and a drawback. Many styles are possible, so formatting can be inconsistent. Some constructs don't work well in all parsers and should be avoided. For example, [here are some common/troublesome Markdown constructs](https://gist.github.com/DavidAnson/006a6c2a2d9d7b21b025).

[markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) is a Visual Studio Code extension that includes a library of rules to encourage standards and consistency for Markdown files. It is powered by [markdownlint for Node.js](https://github.com/DavidAnson/markdownlint) which is based on [markdownlint for Ruby](https://github.com/mivok/markdownlint).

## Install

1. Open [Visual Studio Code](https://code.visualstudio.com/)
2. Press `Ctrl+P` to open the Quick Open dialog
3. Type `ext install markdownlint` to find the extension
4. Click the `Install` button, then the `Enable` button

OR

1. Press `Ctrl+Shift+X` to open the Extensions tab
2. Type `markdownlint` to find the extension
3. Click the `Install` button, then the `Enable` button

OR

1. Open a command-line prompt
2. Run `code --install-extension DavidAnson.vscode-markdownlint`

## Use

When editing a Markdown file in Code with markdownlint installed, any lines that violate one of markdownlint's rules (see below) will trigger a *Warning* in the editor. Warnings are indicated by a wavy green underline and can also be seen by pressing `Ctrl+Shift+M` to open the Errors and Warnings dialog. Hover the mouse pointer over a green line to see the warning or press `F8` and `Shift+F8` to cycle through all the warnings (markdownlint warnings all begin with `MD###`). For more information about a markdownlint warning, place the cursor on a line and click the light bulb icon or press `Ctrl+.` to open the code action dialog. Clicking one of the warnings in the dialog will display that rule's help entry in the default web browser.

> For a tutorial, please see [Build an Amazing Markdown Editor Using Visual Studio Code and Pandoc](http://thisdavej.com/build-an-amazing-markdown-editor-using-visual-studio-code-and-pandoc/) by Dave Johnson.

## Rules

* **[MD001](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md001)** *header-increment* - Header levels should only increment by one level at a time
* **[MD002](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md002)** *first-header-h1* - First header should be a top level header
* **[MD003](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md003)** *header-style* - Header style
* **[MD004](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md004)** *ul-style* - Unordered list style
* **[MD005](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md005)** *list-indent* - Inconsistent indentation for list items at the same level
* **[MD006](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md006)** *ul-start-left* - Consider starting bulleted lists at the beginning of the line
* **[MD007](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md007)** *ul-indent* - Unordered list indentation
* **[MD009](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md009)** *no-trailing-spaces* - Trailing spaces
* **[MD010](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md010)** *no-hard-tabs* - Hard tabs
* **[MD011](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md011)** *no-reversed-links* - Reversed link syntax
* **[MD012](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md012)** *no-multiple-blanks* - Multiple consecutive blank lines
* **[MD013](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md013)** *line-length* - Line length
* **[MD014](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md014)** *commands-show-output* - Dollar signs used before commands without showing output
* **[MD018](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md018)** *no-missing-space-atx* - No space after hash on atx style header
* **[MD019](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md019)** *no-multiple-space-atx* - Multiple spaces after hash on atx style header
* **[MD020](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md020)** *no-missing-space-closed-atx* - No space inside hashes on closed atx style header
* **[MD021](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md021)** *no-multiple-space-closed-atx* - Multiple spaces inside hashes on closed atx style header
* **[MD022](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md022)** *blanks-around-headers* - Headers should be surrounded by blank lines
* **[MD023](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md023)** *header-start-left* - Headers must start at the beginning of the line
* **[MD024](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md024)** *no-duplicate-header* - Multiple headers with the same content
* **[MD025](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md025)** *single-h1* - Multiple top level headers in the same document
* **[MD026](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md026)** *no-trailing-punctuation* - Trailing punctuation in header
* **[MD027](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md027)** *no-multiple-space-blockquote* - Multiple spaces after blockquote symbol
* **[MD028](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md028)** *no-blanks-blockquote* - Blank line inside blockquote
* **[MD029](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md029)** *ol-prefix* - Ordered list item prefix
* **[MD030](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md030)** *list-marker-space* - Spaces after list markers
* **[MD031](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md031)** *blanks-around-fences* - Fenced code blocks should be surrounded by blank lines
* **[MD032](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md032)** *blanks-around-lists* - Lists should be surrounded by blank lines
* **[MD033](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md033)** *no-inline-html* - Inline HTML
* **[MD034](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md034)** *no-bare-urls* - Bare URL used
* **[MD035](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md035)** *hr-style* - Horizontal rule style
* **[MD036](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md036)** *no-emphasis-as-header* - Emphasis used instead of a header
* **[MD037](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md037)** *no-space-in-emphasis* - Spaces inside emphasis markers
* **[MD038](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md038)** *no-space-in-code* - Spaces inside code span elements
* **[MD039](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md039)** *no-space-in-links* - Spaces inside link text
* **[MD040](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md040)** *fenced-code-language* - Fenced code blocks should have a language specified
* **[MD041](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md041)** *first-line-h1* - First line in file should be a top level header
* **[MD042](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md042)** *no-empty-links* - No empty links
* **[MD043](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md043)** *required-headers* - Required header structure
* **[MD044](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md044)** *proper-names* - Proper names should have the correct capitalization
* **[MD045](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md#md045)** *no-alt-text* - Images should have alternate text (alt text)

See [markdownlint's Rules.md file](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md) for more details.

The following rules can be automatically fixed by moving the cursor to a rule violation (green underlined text) and typing `Ctrl+.` or clicking the light bulb icon.

* MD006 *ul-start-left*
* MD009 *no-trailing-spaces*
* MD010 *no-hard-tabs*
* MD011 *no-reversed-links*
* MD018 *no-missing-space-atx*
* MD019 *no-multiple-space-atx*
* MD020 *no-missing-space-closed-atx*
* MD021 *no-multiple-space-closed-atx*
* MD023 *header-start-left*
* MD027 *no-multiple-space-blockquote*
* MD028 *no-blanks-blockquote*
* MD034 *no-bare-urls*
* MD037 *no-space-in-emphasis*
* MD038 *no-space-in-code*
* MD039 *no-space-in-links*

Fixes can be reverted by `Edit|Undo` or `Ctrl+Z`.

## Configure

### markdownlint.config

The default rule configuration disables `MD013`/`line-length` because many files include lines longer than the conventional 80 character limit:

```json
{
    "MD013": false
}
```

Rules can be enabled, disabled, and customized by creating a [JSON](https://en.wikipedia.org/wiki/JSON) file named `.markdownlint.json` in any directory of a project. The rules defined by `.markdownlint.json` apply to Markdown files in the same directory and any sub-directories without their own `.markdownlint.json`.

> **Note**: `.markdownlint.json` is used only if a project has been opened. When no folder is open or a file is not part of the current project, normal user and workspace settings apply (see below).

A custom configuration is often defined by a `.markdownlint.json` file in the root of the project:

```json
{
    "default": true,
    "MD003": { "style": "atx_closed" },
    "MD007": { "indent": 4 },
    "no-hard-tabs": false
}
```

To extend another configuration file, any `.markdownlint.json` can use the `extends` property to provide a relative path:

```json
{
    "extends": "../.markdownlint.json",
    "no-hard-tabs": true
}
```

Files referenced via `extends` do not need to be part of the current project (but usually are).

Rules can also be configured using Code's support for [user and workspace settings](https://code.visualstudio.com/docs/customization/userandworkspace).

The earlier configuration might look like the following in Code's user settings:

```json
{
    "editor.someSetting": true,
    "markdownlint.config": {
        "default": true,
        "MD003": { "style": "atx_closed" },
        "MD007": { "indent": 4 },
        "no-hard-tabs": false
    }
}
```

Rule locations have the following precedence (in decreasing order):

* `.markdownlint.json` file in the same directory
* `.markdownlint.json` file in a parent directory
* `.markdownlint.json` file in the root of the project
* Visual Studio Code user/workspace settings
* Default configuration (see above)

Changes saved to any of these locations take effect immediately. Files referenced via `extends` are not monitored for changes. Only the bottom two locations apply to files outside the project.

See [markdownlint's options.config section](https://github.com/DavidAnson/markdownlint#optionsconfig) for more information about rule configuration.

### markdownlint.run

By default, linting is performed as you type or edit a document. Linting is fast and efficient and should not interfere with typical workflows.

If you find this distracting, linting can be configured to run only when the document is saved. This looks like the following in Code's user settings:

```json
{
    "editor.someSetting": true,
    "markdownlint.run": "onSave"
}
```

> **Note**: When configured to run `onSave`, the list of reported issues will become outdated while the document is edited and will update when the document is saved.

## Suppress

Individual warnings can be suppressed with inline comments:

```md
<!-- markdownlint-disable MD037 -->
deliberate space * in * emphasis
<!-- markdownlint-enable MD037 -->
```

See [markdownlint's configuration section](https://github.com/DavidAnson/markdownlint#configuration) for more details.

## History

See [CHANGELOG.md](https://github.com/DavidAnson/vscode-markdownlint/blob/master/CHANGELOG.md).
