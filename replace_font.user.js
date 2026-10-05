// ==UserScript==
// @name         Kurisute Font Bundle Replacer
// @namespace    local.font-replacer
// @version      1.0.0
// @description  フォントバンドルのダウンロード先を差し替え版に向ける
// @match        https://games.mofushippo.com/CryWebAws/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // 差し替え対象のファイル名 (URL のクエリや前方のパスは問わない)
  const TARGET = /defaultpackage_assets_localresources_font[^/?#]*\.bundle(?=$|[?#])/;
  // 差し替え版バンドルの配置先 (CORS 許可されたホストに置くこと)
  // github.com/.../raw/... はリダイレクト応答に CORS ヘッダが無いため raw.githubusercontent.com を直接指す
  const REPLACEMENT_URL = 'https://raw.githubusercontent.com/chira2chira/kurisute-font/refs/heads/master/defaultpackage_assets_localresources_font.bundle';

  const rewrite = (url) => {
    const s = String(url);
    if (!TARGET.test(s.split(/[?#]/)[0].split('/').pop() || '')) return url;
    console.log('[FontReplacer]', location.href, ':', s, '->', REPLACEMENT_URL);
    return REPLACEMENT_URL;
  };

  // fetch
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    if (input instanceof Request) {
      const url = rewrite(input.url);
      if (url !== input.url) input = new Request(url, input);
    } else {
      input = rewrite(input);
    }
    return origFetch.call(this, input, init);
  };

  // XMLHttpRequest (UnityWebRequest は XHR を使う)
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    return origOpen.call(this, method, rewrite(url), ...rest);
  };
})();
