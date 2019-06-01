// Sketch
//
// Need an easy way of getting and setting settings
// If a setting is not set, the default should probably be returned.
// That probably means that binds etc. should be per-key?
//
// We should probably store all settings in memory, and only load from storage on startup and when we set it
//
// Really, we'd like a way of just letting things use the variables
//

/** # Tridactyl Configuration
 *
 * We very strongly recommend that you pretty much ignore this page and instead follow the link below DEFAULTS that will take you to our own source code which is formatted in a marginally more sane fashion.
 *
 */

/** @hidden */
const CONFIGNAME = "userconfig"
/** @hidden */
const WAITERS = []
/** @hidden */
let INITIALISED = false

/** @hidden */
// make a naked object
function o(object) {
    return Object.assign(Object.create(null), object)
}

/** @hidden */
// "Import" is a reserved word so this will have to do
function schlepp(settings) {
    Object.assign(USERCONFIG, settings)
}

/** @hidden */
let USERCONFIG = o({})

/** @hidden
 * Ideally, LoggingLevel should be in logging.ts and imported from there. However this would cause a circular dependency, which webpack can't deal with
 */
export type LoggingLevel = "never" | "error" | "warning" | "info" | "debug"

/**
 * This is the default configuration that Tridactyl comes with.
 *
 * You can change anything here using `set key1.key2.key3 value` or specific things any of the various helper commands such as `bind` or `command`. You can also jump to the help section of a setting using `:help $settingname`. Some of the settings have an input field containing their current value. You can modify these values and save them by pressing `<Enter>` but using `:set $setting $value` is a good habit to take as it doesn't force you to leave the page you're visiting to change your settings.
 */
export class default_config {
    /**
     * Internal version number Tridactyl uses to know whether it needs to update from old versions of the configuration.
     *
     * Changing this might do weird stuff.
     */
    configversion = "0.0"

    /**
     * Internal field to handle site-specific configs. Use :seturl/:unseturl to change these values.
     */
    subconfigs: { [key: string]: default_config } = {
        "www.google.com": {
            "followpagepatterns": {
                "next": "Next",
                "prev": "Previous"
            }
        } as default_config
    }

    /**
     * Internal field to handle site-specific config priorities. Use :seturl/:unseturl to change this value.
     */
    priority = 0

    // Note to developers: When creating new <modifier-letter> maps, make sure to make the modifier uppercase (e.g. <C-a> instead of <c-a>) otherwise some commands might not be able to find them (e.g. `bind <c-a>`)

    /**
     * exmaps contains all of the bindings for the command line.
     * You can of course bind regular ex commands but also [editor functions](/static/docs/modules/_src_lib_editor_.html) and [commandline-specific functions](/static/docs/modules/_src_commandline_frame_.html).
     */
    exmaps = {
        "<Enter>": "ex.accept_line",
        "<C-j>": "ex.accept_line",
        "<C-m>": "ex.accept_line",
        "<Escape>": "ex.hide_and_clear",
        "<ArrowUp>": "ex.prev_history",
        "<ArrowDown>": "ex.next_history",
        "<C-a>": "text.beginning_of_line",
        "<C-e>": "text.end_of_line",
        "<C-u>": "text.backward_kill_line",
        "<C-k>": "text.kill_line",
        "<C-c>": "text.kill_whole_line",
        "<C-f>": "ex.complete",
        "<Tab>": "ex.next_completion",
        "<S-Tab>": "ex.prev_completion",
        "<Space>": "ex.insert_space_or_completion",
    }

    /**
     * ignoremaps contain all of the bindings for "ignore mode".
     *
     * They consist of key sequences mapped to ex commands.
     */
    ignoremaps = {
        "<S-Insert>": "mode normal",
        "<CA-Escape>": "mode normal",
        "<CA-`>": "mode normal",
        "<S-Escape>": "mode normal",
        "<C-^>": "tab #",
        "<C-6>": "tab #",
    }

    /**
     * imaps contain all of the bindings for "insert mode".
     *
     * On top of regular ex commands, you can also bind [editor functions](/static/docs/modules/_src_lib_editor_.html) in insert mode.
     *
     * They consist of key sequences mapped to ex commands.
     */
    imaps = {
        "<Escape>": "composite unfocus | mode normal",
        "<C-[>": "composite unfocus | mode normal",
        "<C-i>": "editor",
        "<CA-Escape>": "mode normal",
        "<CA-`>": "mode normal",
        "<C-6>": "tab #",
        "<C-^>": "tab #",
        "<S-Escape>": "mode ignore",
    }

    /**
     * inputmaps contain all of the bindings for "input mode".
     *
     * On top of regular ex commands, you can also bind [editor functions](/static/docs/modules/_src_lib_editor_.html) in input mode.
     *
     * They consist of key sequences mapped to ex commands.
     */
    inputmaps = mergeDeep(this.imaps, {
        "<Tab>": "focusinput -n",
        "<S-Tab>": "focusinput -N",
    })

    /**
     * nmaps contain all of the bindings for "normal mode".
     *
     * They consist of key sequences mapped to ex commands.
     */
    nmaps = {
        "<A-p>": "pin",
        "<A-m>": "mute toggle",
        "<F1>": "help",
        o: "fillcmdline open",
        O: "current_url open",
        w: "fillcmdline winopen",
        W: "current_url winopen",
        t: "fillcmdline tabopen",
        "]]": "followpage next",
        "[[": "followpage prev",
        "[c": "urlincrement -1",
        "]c": "urlincrement 1",
        "<C-x>": "urlincrement -1",
        "<C-a>": "urlincrement 1",
        T: "current_url tabopen",
        yy: "clipboard yank",
        ys: "clipboard yankshort",
        yc: "clipboard yankcanon",
        ym: "clipboard yankmd",
        yt: "clipboard yanktitle",
        gh: "home",
        gH: "home true",
        p: "clipboard open",
        P: "clipboard tabopen",
        j: "scrollline 10",
        "<C-e>": "scrollline 10",
        k: "scrollline -10",
        "<C-y>": "scrollline -10",
        h: "scrollpx -50",
        l: "scrollpx 50",
        G: "scrollto 100",
        gg: "scrollto 0",
        "<C-u>": "scrollpage -0.5",
        "<C-d>": "scrollpage 0.5",
        "<C-f>": "scrollpage 1",
        "<C-b>": "scrollpage -1",
        $: "scrollto 100 x",
        // "0": "scrollto 0 x", // will get interpreted as a count
        "^": "scrollto 0 x",
        "<C-6>": "tab #",
        "<C-^>": "tab #",
        H: "back",
        L: "forward",
        "<C-o>": "jumpprev",
        "<C-i>": "jumpnext",
        d: "tabclose",
        D: "composite tabprev; tabclose #",
        gx0: "tabclosealltoleft",
        gx$: "tabclosealltoright",
        "<<": "tabmove -1",
        ">>": "tabmove +1",
        u: "undo",
        U: "undo window",
        r: "reload",
        R: "reloadhard",
        x: "stop",
        gi: "focusinput -l",
        "g?": "rot13",
        "g;": "changelistjump -1",
        J: "tabprev",
        K: "tabnext",
        gt: "tabnext_gt",
        gT: "tabprev",
        // "<c-n>": "tabnext_gt", // c-n is reserved for new window
        // "<c-p>": "tabprev",
        "g^": "tabfirst",
        g0: "tabfirst",
        g$: "tablast",
        gr: "reader",
        gu: "urlparent",
        gU: "urlroot",
        gf: "viewsource",
        ":": "fillcmdline_notrail",
        s: "fillcmdline open search",
        S: "fillcmdline tabopen search",
        // find mode not suitable for general consumption yet.
        // "/": "fillcmdline find",
        // "?": "fillcmdline find -?",
        // n: "findnext 1",
        // N: "findnext -1",
        // ",<Space>": "nohlsearch",
        M: "gobble 1 quickmark",
        B: "fillcmdline taball",
        b: "fillcmdline tab",
        ZZ: "qall",
        f: "hint",
        F: "hint -b",
        gF: "hint -br",
        ";i": "hint -i",
        ";b": "hint -b",
        ";o": "hint",
        ";I": "hint -I",
        ";k": "hint -k",
        ";y": "hint -y",
        ";p": "hint -p",
        ";P": "hint -P",
        ";r": "hint -r",
        ";s": "hint -s",
        ";S": "hint -S",
        ";a": "hint -a",
        ";A": "hint -A",
        ";;": "hint -;",
        ";#": "hint -#",
        ";v": "hint -W exclaim_quiet mpv",
        ";w": "hint -w",
        ";t": "hint -W tabopen",
        ";O": "hint -W fillcmdline_notrail open ",
        ";W": "hint -W fillcmdline_notrail winopen ",
        ";T": "hint -W fillcmdline_notrail tabopen ",
        ";z": "hint -z",
        ";m":
            "composite hint -pipe img src | js -p tri.excmds.open('images.google.com/searchbyimage?image_url=' + JS_ARG)",
        ";M":
            "composite hint -pipe img src | jsb -p tri.excmds.tabopen('images.google.com/searchbyimage?image_url=' + JS_ARG)",
        ";gi": "hint -qi",
        ";gI": "hint -qI",
        ";gk": "hint -qk",
        ";gy": "hint -qy",
        ";gp": "hint -qp",
        ";gP": "hint -qP",
        ";gr": "hint -qr",
        ";gs": "hint -qs",
        ";gS": "hint -qS",
        ";ga": "hint -qa",
        ";gA": "hint -qA",
        ";g;": "hint -q;",
        ";g#": "hint -q#",
        ";gv": "hint -qW exclaim_quiet mpv",
        ";gw": "hint -qw",
        ";gb": "hint -qb",
        "<S-Insert>": "mode ignore",
        "<CA-Escape>": "mode ignore",
        "<CA-`>": "mode ignore",
        "<S-Escape>": "mode ignore",
        "<Escape>": "composite mode normal ; hidecmdline",
        "<C-[>": "composite mode normal ; hidecmdline",
        a: "current_url bmark",
        A: "bmark",
        zi: "zoom 0.1 true",
        zo: "zoom -0.1 true",
        zm: "zoom 0.5 true",
        zr: "zoom -0.5 true",
        zM: "zoom 0.5 true",
        zR: "zoom -0.5 true",
        zz: "zoom 1",
        zI: "zoom 3",
        zO: "zoom 0.3",
        ".": "repeat",
        "<SA-ArrowUp><SA-ArrowUp><SA-ArrowDown><SA-ArrowDown><SA-ArrowLeft><SA-ArrowRight><SA-ArrowLeft><SA-ArrowRight>ba":
            "open https://www.youtube.com/watch?v=M3iOROuTuMA",
    }

    hintmaps = {
        "<Backspace>": "hint.popKey",
        "<Escape>": "hint.reset",
        "<Tab>": "hint.focusPreviousHint",
        "<S-Tab>": "hint.focusNextHint",
        "<ArrowUp>": "hint.focusTopHint",
        "<ArrowDown>": "hint.focusBottomHint",
        "<ArrowLeft>": "hint.focusLeftHint",
        "<ArrowRight>": "hint.focusRightHint",
        "<Enter>": "hint.selectFocusedHint",
        "<Space>": "hint.selectFocusedHint",
    }

    /**
     * Whether to allow pages (not necessarily github) to override `/`, which is a default Firefox binding.
     */
    leavegithubalone: "true" | "false" = "false"

    /**
     * Which keys to protect from pages that try to override them. Requires [[leavegithubalone]] to be set to false.
     */
    blacklistkeys: string[] = ["/"]

    /**
     * Autocommands that run when certain events happen, and other conditions are met.
     *
     * Related ex command: `autocmd`.
     */
    autocmds = {
        /**
         * Commands that will be run as soon as Tridactyl loads into a page.
         *
         * Each key corresponds to a URL fragment which, if contained within the page URL, will run the corresponding command.
         */
        DocStart: {
            // "addons.mozilla.org": "mode ignore",
        },

        /**
         * Commands that will be run when pages are loaded.
         *
         * Each key corresponds to a URL fragment which, if contained within the page URL, will run the corresponding command.
         */
        DocLoad: {
            "^https://github.com/tridactyl/tridactyl/issues/new$": "issue"
        },

        /**
         * Commands that will be run when pages are unloaded.
         *
         * Each key corresponds to a URL fragment which, if contained within the page URL, will run the corresponding command.
         */
        DocEnd: {
            // "emacs.org": "sanitise history",
        },

        /**
         * Commands that will be run when Tridactyl first runs each time you start your browser.
         *
         * Each key corresponds to a URL fragment which, if contained within the page URL, will run the corresponding command.
         */
        TriStart: {
            ".*": "source_quiet",
        },

        /**
         * Commands that will be run when you enter a tab.
         *
         * Each key corresponds to a URL fragment which, if contained within the page URL, will run the corresponding command.
         */
        TabEnter: {
            // "gmail.com": "mode ignore",
        },

        /**
         * Commands that will be run when you leave a tab.
         *
         * Each key corresponds to a URL fragment which, if contained within the page URL, will run the corresponding command.
         */
        TabLeft: {
            // Actually, this doesn't work because tabclose closes the current tab
            // Too bad :/
            // "emacs.org": "tabclose",
        },

        /**
         * Commands that will be run when fullscreen state changes.
         */
        FullscreenChange: {},

        /**
         * Commands that will be run when fullscreen state is entered.
         */
        FullscreenEnter: {},

        /**
         * Commands that will be run when fullscreen state is left.
         */
        FullscreenLeft: {},
    }

    /**
     * Map for translating keys directly into other keys in normal-ish modes. For example, if you have an entry in this config option mapping `п` to `g`, then you could type `пп` instead of `gg` or `пi` instead of `gi` or `;п` instead of `;g`. This is primarily useful for international users who don't want to deal with rebuilding their bindings every time tridactyl ships a new default keybind. It's not as good as shipping properly internationalized sets of default bindings, but it's probably as close as we're going to get on a small open-source project like this.
     *
     * Note that the current implementation does not allow you to "chain" keys, for example, "a"=>"b" and "b"=>"c" for "a"=>"c". You can, however, swap or rotate keys, so "a"=>"b" and "b"=>"a" will work the way you'd expect, as will "a"=>"b" and "b"=>"c" and "c"=>"a".
     */
    keytranslatemap = {
        // Examples (I think >_>):
        // "д": "l", // Russian language
        // "é" : "w", // BÉPO
        // "h": "j", // Dvorak
        // "n": "j", // Colemak
        // etc
    }

    /**
     * Whether to use the keytranslatemap in various maps.
     */
    keytranslatemodes: { [key: string]: "true" | "false" } = {
        nmaps: "true",
        imaps: "false",
        inputmaps: "false",
        ignoremaps: "false",
        exmaps: "false",
        hintmaps: "false",
    }

    /**
     * Automatically place these sites in the named container.
     *
     * Each key corresponds to a URL fragment which, if contained within the page URL, the site will be opened in a container tab instead.
     */
    autocontain = o({
        // "github.com": "microsoft",
        // "youtube.com": "google",
    })

    /**
     * Aliases for the commandline.
     *
     * You can make a new one with `command alias ex-command`.
     */
    exaliases = {
        alias: "command",
        au: "autocmd",
        aucon: "autocontain",
        audel: "autocmddelete",
        audelete: "autocmddelete",
        b: "tab",
        clsh: "clearsearchhighlight",
        nohlsearch: "clearsearchhighlight",
        noh: "clearsearchhighlight",
        o: "open",
        w: "winopen",
        t: "tabopen",
        tabnew: "tabopen",
        tabm: "tabmove",
        tabo: "tabonly",
        tn: "tabnext_gt",
        bn: "tabnext_gt",
        tnext: "tabnext_gt",
        bnext: "tabnext_gt",
        tp: "tabprev",
        tN: "tabprev",
        bp: "tabprev",
        bN: "tabprev",
        tprev: "tabprev",
        bprev: "tabprev",
        tabfirst: "tab 1",
        tablast: "tab 0",
        bfirst: "tabfirst",
        blast: "tablast",
        tfirst: "tabfirst",
        tlast: "tablast",
        buffer: "tab",
        bufferall: "taball",
        bd: "tabclose",
        bdelete: "tabclose",
        quit: "tabclose",
        q: "tabclose",
        qa: "qall",
        sanitize: "sanitise",
        tutorial: "tutor",
        h: "help",
        unmute: "mute unmute",
        authors: "credits",
        openwith: "hint -W",
        "!": "exclaim",
        "!s": "exclaim_quiet",
        containerremove: "containerdelete",
        colours: "colourscheme",
        colorscheme: "colourscheme",
        colors: "colourscheme",
        man: "help",
        "!js": "fillcmdline_tmp 3000 !js is deprecated. Please use js instead",
        "!jsb":
            "fillcmdline_tmp 3000 !jsb is deprecated. Please use jsb instead",
        get_current_url: "js document.location.href",
        current_url: "composite get_current_url | fillcmdline_notrail ",
        stop: "js window.stop()",
        zo: "zoom",
        installnative: "nativeinstall",
        nativeupdate: "updatenative",
        mkt: "mktridactylrc",
        "mkt!": "mktridactylrc -f",
        "mktridactylrc!": "mktridactylrc -f"
    }

    /**
     * Used by `]]` and `[[` to look for links containing these words.
     *
     * Edit these if you want to add, e.g. other language support.
     */
    followpagepatterns = {
        next: "^(next|newer)\\b|»|>>|more",
        prev: "^(prev(ious)?|older)\\b|«|<<",
    }

    /**
     * The default search engine used by `open search`. If empty string, your browser's default search engine will be used. If set to something, Tridactyl will first look at your [[searchurls]] and then at the search engines for which you have defined a keyword on `about:preferences#search`.
     */
    searchengine = ""

    /**
     * Definitions of search engines for use via `open [keyword]`.
     *
     * `%s` will be replaced with your whole query and `%s1`, `%s2`, ..., `%sn` will be replaced with the first, second and nth word of your query. If there are none of these patterns in your search urls, your query will simply be appended to the searchurl.
     *
     * Examples:
     * - When running `open gi cute puppies`, with a `gi` searchurl defined with `set searchurls.gi https://www.google.com/search?q=%s&tbm=isch`, tridactyl will navigate to `https://www.google.com/search?q=cute puppies&tbm=isch`.
     * - When running `tabopen translate en ja Tridactyl`, with a `translate` searchurl defined with `set searchurls.translate https://translate.google.com/#view=home&op=translate&sl=%s1&tl=%s2&text=%s3`, tridactyl will navigate to `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=Tridactyl`.
     */
    searchurls = {
        google: "https://www.google.com/search?q=",
        googlelucky: "https://www.google.com/search?btnI=I'm+Feeling+Lucky&q=",
        scholar: "https://scholar.google.com/scholar?q=",
        googleuk: "https://www.google.co.uk/search?q=",
        bing: "https://www.bing.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
        yahoo: "https://search.yahoo.com/search?p=",
        twitter: "https://twitter.com/search?q=",
        wikipedia: "https://en.wikipedia.org/wiki/Special:Search/",
        youtube: "https://www.youtube.com/results?search_query=",
        amazon:
            "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=",
        amazonuk:
            "https://www.amazon.co.uk/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=",
        startpage:
            "https://startpage.com/do/search?language=english&cat=web&query=",
        github: "https://github.com/search?utf8=✓&q=",
        searx: "https://searx.me/?category_general=on&q=",
        cnrtl: "http://www.cnrtl.fr/lexicographie/",
        osm: "https://www.openstreetmap.org/search?query=",
        mdn: "https://developer.mozilla.org/en-US/search?q=",
        gentoo_wiki:
            "https://wiki.gentoo.org/index.php?title=Special%3ASearch&profile=default&fulltext=Search&search=",
        qwant: "https://www.qwant.com/?q=",
    }

    /**
     * URL the newtab will redirect to.
     *
     * All usual rules about things you can open with `open` apply, with the caveat that you'll get interesting results if you try to use something that needs `nativeopen`: so don't try `about:newtab`.
     */
    newtab = ""

    /**
     * Whether `:viewsource` will use our own page that you can use Tridactyl binds on, or Firefox's default viewer, which you cannot use Tridactyl on.
     */
    viewsource: "tridactyl" | "default" = "tridactyl"

    /**
     * Which storage to use. Sync storage will synchronise your settings via your Firefox Account.
     */
    storageloc: "sync" | "local" = "sync"

    /**
     * Pages opened with `gH`. In order to set this value, use `:set homepages ["example.org", "example.net", "example.com"]` and so on.
     */
    homepages: string[] = []

    /**
     * Characters to use in hint mode.
     *
     * They are used preferentially from left to right.
     */
    hintchars = "hjklasdfgyuiopqwertnmzxcvb"

    /**
     * The type of hinting to use. `vimperator` will allow you to filter links based on their names by typing non-hint chars. It is recommended that you use this in conjuction with the [[hintchars]] setting, which you should probably set to e.g, `5432167890`. ´vimperator-reflow´ additionally updates the hint labels after filtering.
     */
    hintfiltermode: "simple" | "vimperator" | "vimperator-reflow" = "simple"

    /**
     * Whether to optimise for the shortest possible names for each hint, or to use a simple numerical ordering. If set to `numeric`, overrides `hintchars` setting.
     */
    hintnames: "short" | "numeric" | "uniform" = "short"

    /**
     * Whether to display the names for hints in uppercase.
     */
    hintuppercase: "true" | "false" = "true"

    /**
     * The delay in milliseconds in `vimperator` style hint modes after selecting a hint before you are returned to normal mode.
     *
     * The point of this is to prevent accidental execution of normal mode binds due to people typing more than is necessary to choose a hint.
     */
    hintdelay = 300

    /**
     * Controls whether the page can focus elements for you via js
     *
     * NB: will break fancy editors such as CodeMirror on Jupyter. Simply use `seturl` to whitelist pages you need it on.
     *
     * Best used in conjunction with browser.autofocus in `about:config`
     */
    allowautofocus: "true" | "false" = "true"

    /**
     * Uses a loop to prevent focus until you interact with a page. Only recommended for use via `seturl` for problematic sites as it can be a little heavy on CPU if running on all tabs. Should be used in conjuction with [[allowautofocus]]
     */
    preventautofocusjackhammer: "true" | "false" = "false"

    /**
     * Controls whether the newtab focuses on tridactyl's newtab page or the firefox urlbar.
     *
     * To get FF default behaviour, use "urlbar".
     */
    newtabfocus: "page" | "urlbar" = "page"

    /**
     * Whether to use Tridactyl's (bad) smooth scrolling.
     */
    smoothscroll: "true" | "false" = "false"

    /**
     * How viscous you want smooth scrolling to feel.
     */
    scrollduration = 100

    /**
     * Where to open tabs opened with `tabopen` - to the right of the current tab, or at the end of the tabs.
     */
    tabopenpos: "next" | "last" = "next"

    /**
     * Where to open tabs opened with hinting - as if it had been middle clicked, to the right of the current tab, or at the end of the tabs.
     */
    relatedopenpos: "related" | "next" | "last" = "related"
    /**
     * The name of the voice to use for text-to-speech. You can get the list of installed voices by running the following snippet: `js alert(window.speechSynthesis.getVoices().reduce((a, b) => a + " " + b.name))`
     */
    ttsvoice = "default" // chosen from the listvoices list or "default"
    /**
     * Controls text-to-speech volume. Has to be a number between 0 and 1.
     */
    ttsvolume = 1
    /**
     * Controls text-to-speech speed. Has to be a number between 0.1 and 10.
     */
    ttsrate = 1
    /**
     * Controls text-to-speech pitch. Has to be between 0 and 2.
     */
    ttspitch = 1

    /**
     * If nextinput, <Tab> after gi brings selects the next input
     *
     * If firefox, <Tab> selects the next selectable element, e.g. a link
     */
    gimode: "nextinput" | "firefox" = "nextinput"

    /**
     * Decides where to place the cursor when selecting non-empty input fields
     */
    cursorpos: "beginning" | "end" = "end"

    /**
     * The theme to use.
     *
     * Permitted values: run `:composite js tri.styling.THEMES | fillcmdline` to find out.
     */
    theme = "default"

    /**
     * Storage for custom themes
     *
     * Maps theme names to CSS. Predominantly used automatically by [[colourscheme]] to store themes read from disk, as documented by [[colourscheme]]. Setting this manually is untested but might work provided that [[colourscheme]] is then used to change the theme to the right theme name.
     */
    customthemes = {}

    /**
     * Whether to display the mode indicator or not.
     */
    modeindicator: "true" | "false" = "true"

    /**
     * Milliseconds before registering a scroll in the jumplist
     */
    jumpdelay = 3000

    /**
     * Logging levels. Unless you're debugging Tridactyl, it's unlikely you'll ever need to change these.
     */
    logging: { [key: string]: LoggingLevel } = {
        cmdline: "warning",
        containers: "warning",
        controller: "warning",
        excmd: "error",
        hinting: "warning",
        messaging: "warning",
        native: "warning",
        performance: "warning",
        state: "warning",
        styling: "warning",
    }

    /**
     * Disables the commandline iframe. Dangerous setting, use [[seturl]] to set it. If you ever set this setting to "true" globally and then want to set it to false again, you can do this by opening Tridactyl's preferences page from about:addons.
     */
    noiframe: "true" | "false" = "false"

    /**
     * @deprecated A list of URLs on which to not load the iframe. Use `seturl [URL] noiframe true` instead, as shown in [[noiframe]].
     */
    noiframeon: string[] = []

    /**
     * Insert / input mode edit-in-$EDITOR command to run
     * This has to be a command that stays in the foreground for the whole editing session
     * "auto" will attempt to find a sane editor in your path.
     * Please send your requests to have your favourite terminal moved further up the list to /dev/null.
     *          (but we are probably happy to add your terminal to the list if it isn't already there.)
     *
     * Example values:
     * - linux: `xterm -e vim`
     * - windows: `start cmd.exe /c \"vim\"`.
     *
     * Also see [:editor](/static/docs/modules/_src_excmds_.html#editor).
     */
    editorcmd = "auto"

    /**
     * Command that should be run by the [[rssexec]] ex command. Has the
     * following format:
     * - %u: url
     * - %t: title
     * - %y: type (rss, atom, xml...)
     * Warning: This is a very large footgun. %u will be inserted without any
     * kind of escaping, hence you must obey the following rules if you care
     * about security:
     * - Do not use a composite command. If you need a composite command,
     * create an alias.
     * - Do not use `js` or `jsb`. If you need to use them, create an alias.
     * - Do not insert any %u, %t or %y in shell commands run by the native
     * messenger. Use pipes instead.
     *
     * Here's an example of how to save an rss url in a file on your disk
     * safely:
     * `alias save_rss jsb -p tri.native.run("cat >> ~/.config.newsboat/urls", JS_ARG)`
     * `set rsscmd save_rss %u`
     * This is safe because the url is passed to jsb as an argument rather than
     * being expanded inside of the string it will execute and because it is
     * piped to the shell command rather than being expanded inside of it.
     */
    rsscmd = "yank %u"

    /**
     * The browser executable to look for in commands such as `restart`. Not as mad as it seems if you have multiple versions of Firefox...
     */
    browser = "firefox"

    /**
     * Which clipboard to store items in. Requires the native messenger to be installed.
     */
    yankto: "clipboard" | "selection" | "both" = "clipboard"

    /**
     * Which clipboard to retrieve items from. Requires the native messenger to be installed.
     *
     * Permitted values: `clipboard`, or `selection`.
     */
    putfrom: "clipboard" | "selection" = "clipboard"

    /**
     * Clipboard command to try to get the selection from (e.g. `xsel` or `xclip`)
     */
    externalclipboardcmd = "auto"

    /**
     * Set this to something weird if you want to have fun every time Tridactyl tries to update its native messenger.
     *
     * %TAG will be replaced with your version of Tridactyl for stable builds, or "master" for beta builds
     */
    nativeinstallcmd =
        "curl -fsSl https://raw.githubusercontent.com/tridactyl/tridactyl/master/native/install.sh -o /tmp/trinativeinstall.sh && bash /tmp/trinativeinstall.sh %TAG"

    /**
     * Set this to something weird if you want to have fun every time Tridactyl tries to update its native messenger.
     *
     * Replaces %WINTAG with "-Tag $TRI_VERSION", similarly to [[nativeinstallcmd]].
     */
    win_nativeinstallcmd = `powershell -NoProfile -InputFormat None -Command "$TempFile = New-TemporaryFile; (New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/cmcaine/tridactyl/master/native/win_install.ps1',$TempFile); ./$TempFile %WINTAG"`

    /**
     * Used by :updatecheck and related built-in functionality to automatically check for updates and prompt users to upgrade.
     */
    update = {
        /**
         * Whether Tridactyl should check for available updates at startup.
         */
        nag: true,

        /**
         * How many days to wait after an update is first available until telling people.
         */
        nagwait: 7,

        /**
         * The version we last nagged you about. We only nag you once per version.
         */
        lastnaggedversion: "1.14.0",

        /**
         * Time we last checked for an update, milliseconds since unix epoch.
         */
        lastchecktime: 0,

        /**
         * Minimum interval between automatic update checks, in seconds.
         */
        checkintervalsecs: 60 * 60 * 24,
    }

    /**
     * Profile directory to use with native messenger with e.g, `guiset`.
     */
    profiledir = "auto"

    // Container settings

    /**
     * If enabled, tabopen opens a new tab in the currently active tab's container.
     */
    tabopencontaineraware: "true" | "false" = "false"

    /**
     * If moodeindicator is enabled, containerindicator will color the border of the mode indicator with the container color.
     */
    containerindicator: "true" | "false" = "true"

    /**
     * Autocontain directives create a container if it doesn't exist already.
     */
    auconcreatecontainer: "true" | "false" = "true"

    /**
     * Number of most recent results to ask Firefox for. We display the top 20 or so most frequently visited ones.
     */
    historyresults = 50

    /**
     * Number of results that should be shown in completions. -1 for unlimited
     */
    findresults = -1

    /**
     * Number of characters to use as context for the matches shown in completions
     */
    findcontextlen = 100

    /**
     * Whether find should be case-sensitive
     */
    findcase: "smart" | "sensitive" | "insensitive" = "smart"

    /**
     * Whether Tridactyl should jump to the first match when using `:find`
     */
    incsearch: "true" | "false" = "false"

    /**
     * How many characters should be typed before triggering incsearch/completions
     */
    minincsearchlen = 3

    /**
     * Change this to "clobber" to ruin the "Content Security Policy" of all sites a bit and make Tridactyl run a bit better on some of them, e.g. raw.github*
     */
    csp: "untouched" | "clobber" = "untouched"

    /**
     * JavaScript RegExp used to recognize words in text.* functions (e.g. text.transpose_words). Should match any character belonging to a word.
     */
    wordpattern = "[^\\s]+"

    /**
     * Activate tridactyl's performance counters. These have a
     * measurable performance impact, since every sample is a few
     * hundred bytes and we sample tridactyl densely, but they're good
     * when you're trying to optimize things.
     */
    perfcounters: "true" | "false" = "false"

    /**
     * How many samples to store from the perf counters.
     *
     * Each performance entry is two numbers (16 bytes), an entryType
     * of either "mark" or "measure" (js strings are utf-16 ad we have
     * two marks for each measure, so amortize to about 10 bytes per
     * entry), and a string name that for Tridactyl object will be
     * about 40 (utf-16) characters (80 bytes), plus object overhead
     * roughly proportional to the string-length of the name of the
     * constructor (in this case something like 30 bytes), for a total
     * of what we'll call 128 bytes for ease of math.
     *
     * We want to store, by default, about 1MB of performance
     * statistics, so somewhere around 10k samples.
     *
     */
    perfsamples: string = "10000"

    /**
     * Show (partial) command in the mode indicator.
     * Corresponds to 'showcmd' option of vi.
     */
    modeindicatorshowkeys: "true" | "false" = "false"
}

/** @hidden */
const DEFAULTS = o(new default_config())

/** Given an object and a target, extract the target if it exists, else return undefined

    @param target path of properties as an array
    @hidden
 */
function getDeepProperty(obj, target: string[]) {
    if (obj !== undefined && target.length) {
        return getDeepProperty(obj[target[0]], target.slice(1))
    } else {
        return obj
    }
}

/** Create the key path target if it doesn't exist and set the final property to value.

    If the path is an empty array, replace the obj.

    @param target path of properties as an array
    @hidden
 */
function setDeepProperty(obj, value, target) {
    if (target.length > 1) {
        // If necessary antecedent objects don't exist, create them.
        if (obj[target[0]] === undefined) {
            obj[target[0]] = o({})
        }
        return setDeepProperty(obj[target[0]], value, target.slice(1))
    } else {
        obj[target[0]] = value
    }
}

/** @hidden
 * Merges two objects and any child objects they may have
 */
export function mergeDeep(o1, o2) {
    const r = Array.isArray(o1) ? o1.slice() : Object.create(o1)
    Object.assign(r, o1, o2)
    if (o2 === undefined) return r
    Object.keys(o1)
        .filter(key => typeof o1[key] === "object" && typeof o2[key] === "object")
        .forEach(key => Object.assign(r[key], mergeDeep(o1[key], o2[key])))
    return r
}

/** @hidden
 * Gets a site-specific setting.
 */

export function getURL(url: string, target: string[]) {
    function _getURL(conf, url, target) {
        if (!conf.subconfigs) return undefined
        // For each key
        return (
            Object.keys(conf.subconfigs)
                // Keep only the ones that have a match
                .filter(
                    k =>
                        url.match(k) &&
                        getDeepProperty(conf.subconfigs[k], target) !==
                        undefined,
                )
                // Sort them from lowest to highest priority, default to a priority of 10
                .sort(
                    (k1, k2) =>
                        (conf.subconfigs[k1].priority || 10) -
                        (conf.subconfigs[k2].priority || 10),
                )
                // Merge their corresponding value if they're objects, otherwise return the last value
                .reduce(
                    (acc, curKey) => {
                        const curVal = getDeepProperty(
                            conf.subconfigs[curKey],
                            target,
                        )
                        if (acc instanceof Object && curVal instanceof Object)
                            return mergeDeep(acc, curVal)
                        return curVal
                    },
                    undefined as any,
                )
        )
    }
    const user = _getURL(USERCONFIG, url, target)
    const deflt = _getURL(DEFAULTS, url, target)
    if (user === undefined || user === null)
        return deflt
    if (typeof user !== "object" || typeof deflt !== "object")
        return user
    return mergeDeep(deflt, user)
}

/** Get the value of the key target.

    If the user has not specified a key, use the corresponding key from
    defaults, if one exists, else undefined.
    @hidden
 */
export function get(target_typed?: keyof default_config, ...target: string[]) {
    if (target_typed === undefined) {
        target = []
    } else {
        target = [(target_typed as string)].concat(target)
    }
    // Window.tri might not be defined when called from the untrusted page context
    let loc = window.location
    if ((window as any).tri && (window as any).tri.contentLocation)
        loc = (window as any).tri.contentLocation
    // If there's a site-specifing setting, it overrides global settings
    const site = getURL(loc.href, target)
    const user = getDeepProperty(USERCONFIG, target)
    const defult = getDeepProperty(DEFAULTS, target)

    // Merge results if there's a default value and it's not an Array or primitive.
    if (typeof defult === "object") {
        return mergeDeep(mergeDeep(defult, user), site)
    } else {
        if (site !== undefined) {
            return site
        } else if (user !== undefined) {
            return user
        } else {
            return defult
        }
    }
}

/** Get the value of the key target.

    Please only use this with targets that will be used at runtime - it skips static checks. Prefer [[get]].
 */
export function getDynamic(...target: string[]) {
    return get(target[0] as keyof default_config, ...target.slice(1))
}

/** Get the value of the key target.

    Please only use this with targets that will be used at runtime - it skips static checks. Prefer [[getAsync]].
 */
export async function getAsyncDynamic(...target: string[]) {
    return getAsync(target[0] as keyof default_config, ...target.slice(1))
}

/** Get the value of the key target, but wait for config to be loaded from the
    database first if it has not been at least once before.

    This is useful if you are a content script and you've just been loaded.
    @hidden
 */
export async function getAsync(target_typed?: keyof default_config, ...target: string[]) {
    if (INITIALISED) {
        return get(target_typed, ...target)
    } else {
        return new Promise(resolve =>
            WAITERS.push(() => resolve(get(target_typed, ...target))),
        )
    }
}

/** @hidden
 * Like set(), but for a specific pattern.
 */
export function setURL(pattern, ...args) {
    return set("subconfigs", pattern, ...args)
}
/** Full target specification, then value

    e.g.
        set("nmaps", "o", "open")
        set("search", "default", "google")
        set("aucmd", "BufRead", "memrise.com", "open memrise.com")

    @hidden
 */
export function set(...args) {
    if (args.length < 2) {
        throw "You must provide at least two arguments!"
    }

    const target = args.slice(0, args.length - 1)
    const value = args[args.length - 1]

    setDeepProperty(USERCONFIG, value, target)
    return save()
}

/** @hidden
 * Delete the key at USERCONFIG[pattern][target]
 */
export function unsetURL(pattern, ...target) {
    return unset("subconfigs", pattern, ...target)
}

/** Delete the key at target in USERCONFIG if it exists
 * @hidden */
export function unset(...target) {
    const parent = getDeepProperty(USERCONFIG, target.slice(0, -1))
    if (parent !== undefined) delete parent[target[target.length - 1]]
    return save()
}

/** Save the config back to storage API.

    Config is not synchronised between different instances of this module until
    sometime after this happens.

    @hidden
 */
export async function save(storage: "local" | "sync" = get("storageloc")) {
    // let storageobj = storage === "local" ? browser.storage.local : browser.storage.sync
    // storageobj.set({CONFIGNAME: USERCONFIG})
    const settingsobj = o({})
    settingsobj[CONFIGNAME] = USERCONFIG
    return storage === "local"
        ? browser.storage.local.set(settingsobj)
        : browser.storage.sync.set(settingsobj)
}

/** Updates the config to the latest version.
    Proposed semantic for config versionning:
     - x.y -> x+1.0 : major architectural changes
     - x.y -> x.y+1 : renaming settings/changing their types
    There's no need for an updater if you're only adding a new setting/changing
    a default setting

    When adding updaters, don't forget to set("configversion", newversionnumber)!
    @hidden
 */
export async function update() {
    // Updates a value both in the main config and in sub (=site specific) configs
    const updateAll = (setting: any[], fn: (any) => any) => {
        const val = getDeepProperty(USERCONFIG, setting)
        if (val) {
            set(...setting, fn(val))
        }
        const subconfigs = getDeepProperty(USERCONFIG, ["subconfigs"])
        if (subconfigs) {
            Object.keys(subconfigs)
                .map(pattern => [pattern, getURL(pattern, setting)])
                .filter(([pattern, value]) => value)
                .forEach(([pattern, value]) =>
                    setURL(pattern, ...setting, fn(value)),
                )
        }
    }

    const updaters = {
        "0.0": async () => {
            try {
                // Before we had a config system, we had nmaps, and we put them in the
                // root namespace because we were young and bold.
                const legacy_nmaps = await browser.storage.sync.get("nmaps")
                if (Object.keys(legacy_nmaps).length > 0) {
                    USERCONFIG.nmaps = Object.assign(
                        legacy_nmaps.nmaps,
                        USERCONFIG.nmaps,
                    )
                }
            } finally {
                set("configversion", "1.0")
            }
        },
        "1.0": () => {
            const vimiumgi = getDeepProperty(USERCONFIG, ["vimium-gi"])
            if (vimiumgi === true || vimiumgi === "true")
                set("gimode", "nextinput")
            else if (vimiumgi === false || vimiumgi === "false")
                set("gimode", "firefox")
            unset("vimium-gi")
            set("configversion", "1.1")
        },
        "1.1": () => {
            const leveltostr: { [key: number]: LoggingLevel } = {
                0: "never",
                1: "error",
                2: "warning",
                3: "info",
                4: "debug",
            }
            const logging = getDeepProperty(USERCONFIG, ["logging"])
            // logging is not necessarily defined if the user didn't change default values
            if (logging)
                Object.keys(logging).forEach(l =>
                    set("logging", l, leveltostr[logging[l]]),
                )
            set("configversion", "1.2")
        },
        "1.2": () => {
            ["ignoremaps", "inputmaps", "imaps", "nmaps"]
                .map(mapname => [
                    mapname,
                    getDeepProperty(USERCONFIG, [mapname]),
                ])
                // mapobj is undefined if the user didn't define any bindings
                .filter(([mapname, mapobj]) => mapobj)
                .forEach(([mapname, mapobj]) => {
                    // For each mapping
                    Object.keys(mapobj)
                    // Keep only the ones with im_* functions
                        .filter(
                            key =>
                                mapobj[key].search(
                                    "^im_|([^a-zA-Z0-9_-])im_",
                                ) >= 0,
                        )
                        // Replace the prefix
                        .forEach(key =>
                            setDeepProperty(
                                USERCONFIG,
                                mapobj[key].replace(
                                    new RegExp("^im_|([^a-zA-Z0-9_-])im_"),
                                    "$1text.",
                                ),
                                [mapname, key],
                            ),
                        )
                })
            set("configversion", "1.3")
        },
        "1.3": () => {
            [
                "priority",
                "hintdelay",
                "scrollduration",
                "ttsvolume",
                "ttsrate",
                "ttspitch",
                "jumpdelay",
                "historyresults",
            ].forEach(setting => updateAll([setting], parseInt))
            set("configversion", "1.4")
        },
        "1.4": () => {
            (getDeepProperty(USERCONFIG, ["noiframeon"]) || []).forEach(
                site => {
                    setURL(site, "noiframe", "true")
                },
            )
            set("configversion", "1.5")
        },
        "1.5": () => {
            unset("exaliases", "tab")
            set("configversion", "1.6")
        },
        "1.6": () => {
            const updateSetting = mapObj => {
                if (!mapObj) return mapObj
                if (mapObj[" "] !== undefined) {
                    mapObj["<Space>"] = mapObj[" "]
                    delete mapObj[" "]
                }
                [
                    "<A- >",
                    "<C- >",
                    "<M- >",
                    "<S- >",
                    "<AC- >",
                    "<AM- >",
                    "<AS- >",
                    "<CM- >",
                    "<CS- >",
                    "<MS- >",
                ].forEach(binding => {
                    if (mapObj[binding] !== undefined) {
                        const key = binding.replace(" ", "Space")
                        mapObj[key] = mapObj[binding]
                        delete mapObj[binding]
                    }
                })
                return mapObj
            }
            ["nmaps", "exmaps", "imaps", "inputmaps", "ignoremaps"].forEach(
                settingName => updateAll([settingName], updateSetting),
            )
            set("configversion", "1.7")
        },
    }
    if (!get("configversion")) set("configversion", "0.0")
    const updatetest = v => {
        return updaters.hasOwnProperty(v) && updaters[v] instanceof Function
    }
    while (updatetest(get("configversion"))) {
        await updaters[get("configversion")]()
    }
}

/** Read all user configuration from storage API then notify any waiting asynchronous calls

    asynchronous calls generated by getAsync.
    @hidden
 */
async function init() {
    const syncConfig = await browser.storage.sync.get(CONFIGNAME)
    schlepp(syncConfig[CONFIGNAME])
    // Local storage overrides sync
    const localConfig = await browser.storage.local.get(CONFIGNAME)
    schlepp(localConfig[CONFIGNAME])

    await update()
    INITIALISED = true
    for (const waiter of WAITERS) {
        waiter()
    }
}

/** @hidden */
const changeListeners = new Map()

/** @hidden
 * @param name The name of a "toplevel" config setting (i.e. "nmaps", not "nmaps.j")
 * @param listener A function to call when the value of $name is modified in the config. Takes the previous and new value as parameters.
 */
export function addChangeListener<P extends keyof default_config>(
    name: P,
    listener: (old: default_config[P], neww: default_config[P]) => void,
) {
    let arr = changeListeners.get(name)
    if (!arr) {
        arr = []
        changeListeners.set(name, arr)
    }
    arr.push(listener)
}

/** @hidden
 * Removes event listeners set with addChangeListener
 */
export function removeChangeListener<P extends keyof default_config>(
    name: P,
    listener: (old: default_config[P], neww: default_config[P]) => void,
) {
    const arr = changeListeners.get(name)
    if (!arr) return
    const i = arr.indexOf(listener)
    if (i >= 0) arr.splice(i, 1)
}

/** Parse the config into a string representation of a .tridactylrc config file.
    Tries to parse the config into sectionable chunks based on keywords.
    Binds, aliases, autocmds and logging settings each have their own section while the rest are dumped into "General Settings".

    @returns string The parsed config file.

 */
export function parseConfig(): string {
    let p = {
        conf: [],
        binds: [],
        aliases: [],
        subconfigs: [],
        aucmds: [],
        aucons: [],
        logging: [],
    }

    p = parseConfigHelper(USERCONFIG, p)

    const s = {
        general: ``,
        binds: ``,
        aliases: ``,
        aucmds: ``,
        aucons: ``,
        subconfigs: ``,
        logging: ``,
    }

    if (p.conf.length > 0)
        s.general = `" General Settings\n${p.conf.join("\n")}\n\n`
    if (p.binds.length > 0)
        s.binds = `" Binds\n${p.binds.join("\n")}\n\n`
    if (p.aliases.length > 0)
        s.aliases = `" Aliases\n${p.aliases.join("\n")}\n\n`
    if (p.aucmds.length > 0)
        s.aucmds = `" Autocmds\n${p.aucmds.join("\n")}\n\n`
    if (p.aucons.length > 0)
        s.aucons = `" Autocontainers\n${p.aucons.join("\n")}\n\n`
    if (p.subconfigs.length > 0)
        s.subconfigs = `" Subconfig Settings\n${p.subconfigs.join("\n")}\n\n`
    if (p.logging.length > 0)
        s.logging = `" Logging\n${p.logging.join("\n")}\n\n`

    return `${s.general}${s.binds}${s.subconfigs}${s.aliases}${s.aucmds}${s.aucons}${s.logging}`
}

const parseConfigHelper = (pconf, parseobj) => {
    for (const i in pconf) {
        if (typeof pconf[i] !== "object")
            parseobj.conf.push(`set ${i} ${pconf[i]}`)
        else {
            for (const e of Object.keys(pconf[i])) {
                if (i === "nmaps" ) {
                    if (pconf[i][e].length > 0) {
                        parseobj.binds.push(`bind ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.binds.push(`unbind ${e}`)
                    }
                } else if (i === "exmaps" ) {
                    if (pconf[i][e].length > 0) {
                        parseobj.binds.push(`bind --mode=ex ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.binds.push(`unbind --mode=ex ${e}`)
                    }
                } else if (i === "ignoremaps" ) {
                    if (pconf[i][e].length > 0) {
                        parseobj.binds.push(`bind --mode=ignore ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.binds.push(`unbind --mode=ignore ${e}`)
                    }
                } else if (i === "imaps" ) {
                    if (pconf[i][e].length > 0) {
                        parseobj.binds.push(`bind --mode=insert ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.binds.push(`unbind --mode=insert ${e}`)
                    }
                } else if (i === "inputmaps" ) {
                    if (pconf[i][e].length > 0) {
                        parseobj.binds.push(`bind --mode=input ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.binds.push(`unbind --mode=input ${e}`)
                    }
                } else if (i === "hintmaps" ) {
                    if (pconf[i][e].length > 0) {
                        parseobj.binds.push(`bind --mode=hint ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.binds.push(`unbind --mode=hint ${e}`)
                    }
                } else if (i === "subconfigs") {
                    parseobj.subconfigs.push(`js tri.config.set("${i}", {"${e}": ${JSON.stringify(pconf[i][e])}})`)
                } else if (i === "exaliases") {
                    // Only really useful if mapping the entire config and not just pconf.
                    if (e === "alias") {
                        parseobj.aliases.push(`command ${e} ${pconf[i][e]}`)
                    } else {
                        parseobj.aliases.push(`alias ${e} ${pconf[i][e]}`)
                    }
                } else if (i === "autocmds") {
                    for (const a of Object.keys(pconf[i][e])) {
                        parseobj.aucmds.push(`autocmd ${e} ${a} ${pconf[i][e][a]}`)
                    }
                } else if (i === "autocontain") {
                    parseobj.aucmds.push(`autocontain ${e} ${pconf[i][e]}`)
                } else if (i === "logging") {
                    // Map the int values in e to a log level
                    let level
                    if (pconf[i][e] === 0) level = "never"
                    if (pconf[i][e] === 1) level = "error"
                    if (pconf[i][e] === 2) level = "warning"
                    if (pconf[i][e] === 3) level = "info"
                    if (pconf[i][e] === 4) level = "debug"
                    parseobj.logging.push(`set logging.${e} ${level}`)
                } else {
                    parseobj.conf.push(`set ${i}.${e} ${pconf[i][e]}`)
                }
            }
        }
    }
    return parseobj
}

// Listen for changes to the storage and update the USERCONFIG if appropriate.
// TODO: BUG! Sync and local storage are merged at startup, but not by this thing.
browser.storage.onChanged.addListener(async (changes, areaname) => {
    if (CONFIGNAME in changes) {
        const defaultConf = new default_config()
        const old = USERCONFIG

        function triggerChangeListeners(key) {
            const arr = changeListeners.get(key)
            if (arr) {
                const v = old[key] === undefined ? defaultConf[key] : old[key]
                arr.forEach(f => f(v, USERCONFIG[key]))
            }
        }

        // newValue is undefined when calling browser.storage.AREANAME.clear()
        if (changes[CONFIGNAME].newValue !== undefined) {
            // A key has been :unset if it exists in USERCONFIG and doesn't in changes and if its value in USERCONFIG is different from the one it has in default_config
            const unsetKeys = Object.keys(USERCONFIG).filter(
                k =>
                changes[CONFIGNAME].newValue[k] === undefined &&
                JSON.stringify(USERCONFIG[k]) !==
                JSON.stringify(defaultConf[k]),
            )

            // A key has changed if it is defined in USERCONFIG and its value in USERCONFIG is different from the one in `changes` or if the value in defaultConf is different from the one in `changes`
            const changedKeys = Object.keys(changes[CONFIGNAME].newValue).filter(
                k =>
                JSON.stringify(
                    USERCONFIG[k] !== undefined
                    ? USERCONFIG[k]
                    : defaultConf[k],
                ) !== JSON.stringify(changes[CONFIGNAME].newValue[k]),
            )

            USERCONFIG = changes[CONFIGNAME].newValue

            // Trigger listeners
            unsetKeys.forEach(key => {
                const arr = changeListeners.get(key)
                if (arr) {
                    arr.forEach(f => f(old[key], defaultConf[key]))
                }
            })

            changedKeys.forEach(key => triggerChangeListeners(key))
        } else if (areaname === (await get("storageloc"))) {
            // If newValue is undefined and AREANAME is the same value as STORAGELOC, the user wants to clean their config
            USERCONFIG = o({})

            Object.keys(old)
                .filter(key => old[key] !== defaultConf[key])
                .forEach(key => triggerChangeListeners(key))
        }
    }
})

init()
