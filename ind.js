/*
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
    
  Usage:
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

      javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://kndyry.github.io/ind/ind.js';})();

    If you're running Ind from your own server, substitute my address
    with your own in the src assignment and in this file.


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

*/

var indv = {
  'enabled' : false, // Enable, disable Ind
  'pubkey'  : null,  // Key used to encrypt
  'pubkeys' : [],    // All imported keys
  'keyids'  : [],    // UserIDs of pubkeys
  'host'    : [],    // Host inputs, textareas
  'indid'   : [],    // IndID from host
  'drawn'   : [],    // Track drawn (by index)
  'divs'    : [],    // Ind parent divs
  'pickeys' : [],    // Ind pickey buttons
  'submits' : [],    // Ind submit buttons
  'inputs'  : [],    // Ind inputs
  'erasers' : [],    // Ind erase buttons
  'require' : {      // Additional resources
    'indcss' : {
      'type' : 'link',
      'url'  : 'https://kndyry.github.io/ind/ind.css'
    },
    'openpgp' : {
      'type' : 'script',
      'url'  : 'https://kndyry.github.io/ind/openpgp.js'
    }
  }
}

function indinit() {
  for (var k in indv.require) {
    if (indv.require.hasOwnProperty(k)) {
      var type = indv.require[k].type;
      var url  = indv.require[k].url;
      var html = document.createElement(type);
      if (type == 'link') {
        html.href = url;
        html.rel = 'stylesheet';
        document.head.appendChild(html);
      } else {
        html.src = url;
        document.body.appendChild(html);
      }
    }
  }
}

document.onkeydown = function (e) {
  if (indv.enabled) {
    var a = document.activeElement;
    if (!(a.className == 'indinput')) {
      if (a.nodeName == 'INPUT' || a.nodeName == 'TEXTAREA') {
        ind.erase();
        var i = ind.draw(ind.map(a));
        indv.inputs[i].focus();
      }
    }
    if (e.which == 13) {
      var i = ind.map(a.id.slice(3));
      if (ind.encrypt(i)) ind.erase(), ind.toggle(), ind.erasetoggle(), ind.drawtoggle();
    }
  }
}

var ind = {
  map : function (a) {
    var aid = a.name || a.id || a;
    if (indv.indid.indexOf(aid) < 0) indv.indid.push(aid);
    var i = indv.indid.indexOf(aid);
    if (indv.host[i] == null) indv.host[i] = a;
    if (indv.drawn[i] == null) indv.drawn[i] = false;
    else indv.drawn[i] = true;
    return i;
  },

  encrypt : function (i) {
    if (window.crypto.getRandomValues) {
      if (indv.pubkey == null) {
        ind.togglekeypop();
        return false;
      } else {
        openpgp.encryptMessage(
          indv.pubkey.keys,
          indv.inputs[i].value
        ).then(
          function (t) {
            indv.host[i].value += t;
            indv.inputs[i].value = '';
          }
        ).catch(
          function (e) {
            console.log(e.message);
            return false;
          }
        );
      }
    } else {
      alert('Unsupported browser');
    }
    return true;
  },

  addkey : function () {
    var k = prompt('Add an ASCII armored public key:');
    if (k) {
      k = openpgp.key.readArmored(k);
      if (typeof k == 'object') {
        var id = ind.keyid(k);
        if (indv.keyids.indexOf(id) < 0) {
          indv.keyids.push(id);
          indv.pubkeys.push(k);
        }
      }
    }
  },

  usekey : function (i) {
    indv.pubkey = indv.pubkeys[i];
  },

  keyid : function (k) {
    return k.keys[0].users[0].userId.userid;
  },

  drawtoggle : function () {
    var a = document.createElement('div');
    a.setAttribute('id', 'btnindtoggle');
    a.setAttribute('class', 'indtoggle');
    a.setAttribute('onclick', 'ind.toggle(), ind.erasetoggle(), ind.drawtoggle(), ind.erase();');
    a.innerHTML = 'Ind ' + ((indv.enabled) ? 'Enabled' : 'Disabled');
    document.body.appendChild(a);
  },

  toggle : function () {
    if (indv.enabled) indv.enabled = false;
    else indv.enabled = true;
  },

  erasetoggle : function () {
    var toggle = document.getElementById('btnindtoggle');
    if (document.body.contains(toggle)) document.body.removeChild(toggle);
  },

  drawkeypop : function() {
    if (!document.getElementById('keypop')) {
      var f = document.createElement('div');
      f.setAttribute('id', 'keypop');
      f.setAttribute('class', 'indkeypop');
      f.innerHTML = '<a href="javascript:ind.addkey(), ind.erasekeypop(), ind.drawkeypop();">Add Public Key</a>';
      if (indv.pubkeys.length) {
        for (var i = 0; i < indv.pubkeys.length; i++) {
          f.innerHTML = '<a href="javascript:ind.usekey(' + i + '), ind.erasekeypop(), ind.redrawpickeys();">' + ind.keyid(indv.pubkeys[i]).replace(/(<|>|\\)/g,'') + '</a><hr />' + f.innerHTML;
        }
      }
      document.body.appendChild(f);
    }
  },

  togglekeypop : function() {
    if (document.getElementById('keypop')) ind.erasekeypop();
    else ind.drawkeypop();
  },

  erasekeypop : function () {
    var keypop = document.getElementById('keypop');
    if (document.body.contains(keypop)) document.body.removeChild(keypop);
  },

  draw : function (i) {
    if (indv.drawn[i] == false) {
      var a = document.createElement('div');
      var b = document.createElement('button');
      var c = document.createElement('button');
      var d = document.createElement('input');
      var e = document.createElement('button');
      a.setAttribute('id', 'div' + indv.indid[i]);
      b.setAttribute('id', 'pck' + indv.indid[i]);
      c.setAttribute('id', 'sub' + indv.indid[i]);
      d.setAttribute('id', 'inp' + indv.indid[i]);
      e.setAttribute('id', 'era' + indv.indid[i]);
      a.setAttribute('class', 'inddiv');
      b.setAttribute('class', 'indpickey btn btn-danger');
      c.setAttribute('class', 'indsubmit btn btn-default');
      d.setAttribute('class', 'indinput');
      e.setAttribute('class', 'inderaser btn btn-default');
      b.setAttribute('onclick', 'ind.togglekeypop();');
      c.setAttribute('onclick', 'if (ind.encrypt(' + i + ')) ind.erase(), ind.toggle(), ind.erasetoggle(), ind.drawtoggle();');
      e.setAttribute('onclick', 'ind.erase();');
      c.innerHTML     = 'Submit';
      e.innerHTML     = '&times;';
      indv.divs[i]    = a;
      indv.pickeys[i] = b;
      indv.submits[i] = c;
      indv.inputs[i]  = d;
      indv.erasers[i] = e;
      document.body.appendChild(a);
      a.appendChild(b);
      a.appendChild(c);
      a.appendChild(d);
      a.appendChild(e);
      ind.redrawpickeys();
    } else indv.divs[i].style.setProperty('display', 'initial');
    return i;
  },

  redrawpickeys : function () {
    for (var i = 0; i < indv.pickeys.length; i++) {
      if (indv.pubkey) {
        indv.pickeys[i].innerHTML = ind.keyid(indv.pubkey).slice(0, 9) + '...';
        indv.pickeys[i].setAttribute('class', 'indpickey btn btn-success');
      } else {
        indv.pickeys[i].innerHTML = 'Select Key';
        indv.pickeys[i].setAttribute('class', 'indpickey btn btn-danger');
      }
    }
  },

  erase : function () {
    for (var i = 0; i < indv.divs.length; i++) {
      indv.divs[i].style.setProperty('display', 'none');
    }
    ind.erasekeypop();
  }
};

indinit(), ind.drawtoggle(); // 3, 2, 1, Let's jam...
