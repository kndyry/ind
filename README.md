# Ind
    Ind - OpenPGP Input Daemon
    Copyright (c) 2015, Ryan Kennedy <ry@nkennedy.net>
  
    Permission to use, copy, modify, distribute, and sell this software
    and its documentation for any purpose is hereby granted without fee,
    provided that the above copyright notice appear in all copies and
    that both the copyright notice and this permission notice appear in
    supporting documentation.  No representations are made about the
    suitability of this software for any purpose.  It is provided
    "as is" without express or implied warranty.
  
    Ind relies on openpgpjs:  
      https://github.com/openpgpjs/openpgpjs
    
    Checksums:
      https://github.com/kndyry/ind/blob/master/checksums

    
    Intro:
    ------
    When invoked, Ind intercepts text events inside of <input> and
    <textarea> elements and re-routes them to a small, chat-like box
    at the bottom of the browser window. Here, users can import a PGP
    public key, encrypt text using that key and send the output back
    to the original element.


    Invocation:
    -----------
    At present Ind is invoked as a bookmarklet. This approach is
    obviously limited by security concerns, browser same-origin
    policies and storage limitations. In the near future, I hope to
    make Ind available as a proper browser extension. For now, you'll
    probably want to download the code (ind.js, ind.css) and host it
    someplace you trust (like a server running on your local machine).
    If for some reason you want to load Ind from my gh-pages, you may
    do so by using the following as your bookmark's URL:

      javascript:(function(){document.body.appendChild(document.
      createElement('script')).src='https://kndyry.github.io/ind/ind.js';})();

    If you're running Ind from your own server, substitute my address
    with your own in the src assignment and in the ind.js file.


    Activating:
    -----------
    When Ind is invoked, a blue button labeled 'Ind Disabled' will
    appear in the upper left-hand corner of the current page.
    Clicking on this button will toggle Ind's state. So long as Ind
    is disabled, you may enter text in elements of type <input> and
    <textarea> as usual.

    When Ind is Enabled, text events inside of <input> and <textarea>
    elements will be intercepted and re-routed to the Ind interface.
    This appears as a small, chat-like box at the bottom of your
    browser window. Its layout is as follows:

      [Select Key][Submit][Input                       ][Close]


    Encrypting:
    -----------
    The text event(s) that triggered Ind will already appear in the
    [Input] box, but to encrypt you'll need to use [Select Key].
    Clicking this will create a popup menu populated with the User IDs
    of any public keys you've added, but for now the list will be
    empty except for the 'Add Public Key' link. Use this link to add
    an ASCII armored public key for use by Ind.

    With a public key added, click the relevant User ID entry in the
    popup to select it. You'll notice that the [Select Key] button,
    which had been red, is now green. This indicates that Ind is ready
    to encrypt. Finish typing in the [Input] box, then either press
    ENTER or click [Submit]. Your text will be encrypted using the
    selected public key and that output will be routed back into the
    original <input> or <textarea> element.
