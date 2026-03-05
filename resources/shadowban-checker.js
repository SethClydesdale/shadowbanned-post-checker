// helper function for checking if a user is live on Twitch or not
(function (window, document) {
  'use strict';

  // initialize twitter widgets
  window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function(f) {
      t._e.push(f);
    };
    return t;
  }(document, "script", "twitter-wjs"));
  
  // function for checking if a tweet has been shadowbanned
  window.CheckTweet = function () {
    var tweetInput = document.getElementById('tweet-input'),
        tweetLink = document.getElementById('tweet-link'),
        container = document.getElementById('tweet-container'),
        status = document.getElementById('shadowban-status'),
        tweetId = tweetInput.value.match(/\/status\/(\d+)/);
    
    // clear old results/intervals/timers
    tweetLink.innerHTML = '';
    container.innerHTML = '';
    status.innerHTML = '';
    if (window.fallbackTimer) clearTimeout(fallbackTimer);
    if (window.fallbackCounter) clearInterval(fallbackCounter);
    
    // get tweetId
    tweetId = tweetId ? tweetId[1] : null;

    if (!tweetInput.value) {
      status.innerHTML = '<strong style="color:#C93;">Error: You can\'t check "nothing," silly! Paste a link into the input field above. ٩(¯^¯)</strong>';
      return;
    }

    else if (!tweetId) {
      status.innerHTML = '<strong style="color:#C93;">Error: Invalid URL. Sorry, but this checker is only for posts from <a href="https://x.com" target="_blank">x.com</a>. ( ˇωˇ )</strong>';
      return;
    }

    // set link/status
    tweetLink.innerHTML = '<strong>Checked post:</strong> <a href="' + tweetInput.value + '" target="_blank">' + tweetInput.value + ' <i class="fa">&#xf08e;</i></a>';
    status.innerHTML = '<strong style="color:#39C;">Checking post... (<span id="countdown">3</span>)</strong>';
    tweetInput.value = '';
    
    // decrements countdown for the "Checking..." status
    window.fallbackCounter = setInterval(function () {
      var countdown = document.getElementById('countdown'),
          n = +countdown.innerHTML - 1;
      
      countdown.innerHTML = n;

      if (!countdown || !n || n <= 0) {
        clearInterval(fallbackCounter);
      }
    }, 1000);
    
    // embed and check post for a shadowban
    twttr.ready(function (twttr) {
      var resolved = false;

      // fallback timer for if Twitter's script silently hangs (common with deleted/banned tweets)
      window.fallbackTimer = setTimeout(function () {
        if (!resolved) {
          resolved = true;
          status.innerHTML = '<strong style="color:#F00;">Your post may be shadowbanned.<br>It failed to embed for some reason... Did you post something naughty? (ᓀ‸ᓂ)</strong>';
        }
      }, 3000);

      twttr.widgets.createTweet(tweetId, container, {
        theme: 'light' 
      }).then(function (el) {
        if (resolved) return;
        
        resolved = true;
        clearTimeout(window.fallbackTimer);
        clearInterval(window.fallbackCounter);

        if (el) {
          status.innerHTML = '<strong style="color:#060;">Your post doesn\'t appear to be shadowbanned. Hooray! ٩( \'ω\' )و</strong>';
        } else {
          status.innerHTML = '<strong style="color:#F00;">Your post may be shadowbanned. We failed to find it... |ω・`)</strong>';
        }
      }).catch(function (err) {
        if (resolved) return;
        
        resolved = true;
        clearTimeout(window.fallbackTimer);
        clearInterval(window.fallbackCounter);
        
        status.innerHTML = '<strong style="color:#C93;">Error: An error occurred while loading your post. Σ(ﾟДﾟ)</strong>';
      });
    });
  };
  
  // inserts a demo post from the developer's account
  window.testPost = function (id) {
    document.getElementById('tweet-input').value = 'https://x.com/SethC1995/status/' + id;
    document.getElementById('tweet-check').click();
  };
}(window, document));
