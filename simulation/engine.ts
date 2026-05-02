export interface SimSession {
  id: string;
  url: string;
  userAgent: string;
  referrer: string;
  stayTimeMs: number;
  index: number;
  total: number;
  config: SessionBehaviorConfig;
}

export interface SessionBehaviorConfig {
  hyperlinkClicking: boolean;
  clickProbability: number;
  advancedScrolling: boolean;
  slowMinSpeed: number;
  slowMaxSpeed: number;
  fastMinSpeed: number;
  fastMaxSpeed: number;
  minPause: number;
  maxPause: number;
  keywordMode: { targetDomain: string; keyword: string } | null;
}

const ANDROID_UAS = [
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Redmi Note 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; OnePlus 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
];

const DESKTOP_UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
];

const IOS_UAS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
];

function pickUA(a: number, d: number, _i: number): string {
  const r = Math.random() * 100;
  if (r < a) return ANDROID_UAS[Math.floor(Math.random() * ANDROID_UAS.length)]!;
  if (r < a + d) return DESKTOP_UAS[Math.floor(Math.random() * DESKTOP_UAS.length)]!;
  return IOS_UAS[Math.floor(Math.random() * IOS_UAS.length)]!;
}

function buildReferrer(source: string, customUrl: string): string {
  if (customUrl && customUrl.startsWith("http")) return customUrl;
  const map: Record<string, string> = {
    Google: "https://www.google.com/",
    Facebook: "https://www.facebook.com/",
    YouTube: "https://www.youtube.com/",
    Yahoo: "https://www.yahoo.com/",
    Bing: "https://www.bing.com/",
  };
  return map[source] ?? "";
}

export interface GenerateSessionsParams {
  urls: string[];
  threads: number;
  useRandomStayTime: boolean;
  stayTimeFixed: number;
  stayTimeMin: number;
  stayTimeMax: number;
  androidPercent: number;
  desktopPercent: number;
  iosPercent: number;
  referralSource: string;
  referralUrl: string;
  enableKeywordSearch: boolean;
  keywordMainUrl: string;
  keywords: string[];
  keywordStayTime: number;
  hyperlinkClicking: { enabled: boolean; click_probability: number };
  advancedScrolling: {
    enabled: boolean;
    slow_min_speed: number;
    slow_max_speed: number;
    fast_min_speed: number;
    fast_max_speed: number;
    min_pause: number;
    max_pause: number;
  };
}

export function generateSessions(p: GenerateSessionsParams): SimSession[] {
  const sessions: SimSession[] = [];

  for (let i = 0; i < p.threads; i++) {
    let url: string;
    let keywordMode: { targetDomain: string; keyword: string } | null = null;

    if (p.enableKeywordSearch && p.keywords.length > 0 && p.keywordMainUrl) {
      const kw = p.keywords[i % p.keywords.length]!;
      let targetDomain = "";
      try {
        targetDomain = new URL(p.keywordMainUrl).hostname;
      } catch {
        targetDomain = p.keywordMainUrl;
      }
      url = `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
      keywordMode = { targetDomain, keyword: kw };
    } else if (p.urls.length > 0) {
      url = p.urls[i % p.urls.length]!;
    } else {
      continue;
    }

    let stayTimeMs: number;
    if (keywordMode) {
      stayTimeMs = Math.max(5000, p.keywordStayTime);
    } else if (p.useRandomStayTime) {
      stayTimeMs = (Math.random() * (p.stayTimeMax - p.stayTimeMin) + p.stayTimeMin) * 60000;
    } else {
      stayTimeMs = Math.max(5000, p.stayTimeFixed * 60000);
    }

    sessions.push({
      id: `Thread-${i + 1}`,
      url,
      userAgent: pickUA(p.androidPercent, p.desktopPercent, p.iosPercent),
      referrer: buildReferrer(p.referralSource, p.referralUrl),
      stayTimeMs,
      index: i,
      total: p.threads,
      config: {
        hyperlinkClicking: p.hyperlinkClicking.enabled,
        clickProbability: p.hyperlinkClicking.click_probability,
        advancedScrolling: p.advancedScrolling.enabled,
        slowMinSpeed: p.advancedScrolling.slow_min_speed,
        slowMaxSpeed: p.advancedScrolling.slow_max_speed,
        fastMinSpeed: p.advancedScrolling.fast_min_speed,
        fastMaxSpeed: p.advancedScrolling.fast_max_speed,
        minPause: p.advancedScrolling.min_pause,
        maxPause: p.advancedScrolling.max_pause,
        keywordMode,
      },
    });
  }

  return sessions;
}

export function generateBehaviorScript(session: SimSession): string {
  const { stayTimeMs, config } = session;
  const { hyperlinkClicking, clickProbability, keywordMode } = config;
  const pauseMin = Math.round((config.minPause || 1) * 1000);
  const pauseMax = Math.round((config.maxPause || 4) * 1000);

  return `
(function() {
  try {
    var stayMs = ${stayTimeMs};
    var clickEnabled = ${hyperlinkClicking ? "true" : "false"};
    var clickProb = ${(clickProbability || 30) / 100};
    var pauseMin = ${pauseMin};
    var pauseMax = ${pauseMax};
    var targetDomain = ${keywordMode ? JSON.stringify(keywordMode.targetDomain) : "null"};
    var startTime = Date.now();
    var scrollCount = 0;
    var currentScroll = 0;
    var clickedLink = false;

    function rn(a,b){return Math.random()*(b-a)+a;}
    function ri(a,b){return Math.floor(rn(a,b));}

    function post(d){
      try{window.ReactNativeWebView.postMessage(JSON.stringify(d));}catch(e){}
    }
    function log(m){post({type:'log',msg:m});}
    function done(){post({type:'done'});}

    // Keyword mode: we landed on Google, find and click the target
    if(targetDomain && (window.location.hostname.includes('google.'))){
      log('On Google — searching for: '+targetDomain);
      setTimeout(function(){
        var found=false;
        var links=document.querySelectorAll('a');
        for(var i=0;i<links.length;i++){
          var href=links[i].href||'';
          if(href&&href.indexOf(targetDomain)>-1&&href.indexOf('google.')===-1&&href.indexOf('webcache')===-1){
            log('[\\u2192] Clicking search result: '+href.substring(0,60));
            found=true;
            links[i].click();
            break;
          }
        }
        if(!found){log('[!] Target not found in results');done();}
      },ri(2000,4000));
      true;
    }

    // Standard page behavior
    log('Loaded: '+document.title.substring(0,50)+' ('+Math.round(stayMs/1000)+'s session)');

    function getMaxScroll(){return Math.max(1,document.documentElement.scrollHeight-window.innerHeight);}

    function easeIO(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}

    function smoothScroll(target,dur,cb){
      var start=window.scrollY;
      var diff=target-start;
      if(Math.abs(diff)<2){if(cb)cb();return;}
      var t0=null;
      function step(t){
        if(!t0)t0=t;
        var p=Math.min((t-t0)/dur,1);
        window.scrollTo(0,start+diff*easeIO(p));
        if(p<1){requestAnimationFrame(step);}else if(cb){cb();}
      }
      requestAnimationFrame(step);
    }

    function nextTarget(){
      var max=getMaxScroll();
      if(currentScroll>=max*0.88){return currentScroll-rn(100,350);}
      if(currentScroll<=60){return currentScroll+rn(150,500);}
      return Math.random()>0.22?currentScroll+rn(80,450):currentScroll-rn(40,220);
    }

    function tryClick(){
      if(!clickEnabled||clickedLink||Math.random()>clickProb)return;
      var links=[];
      document.querySelectorAll('a[href]').forEach(function(a){
        var h=a.getAttribute('href');
        if(h&&h.length>1&&h[0]!=='#'&&h.indexOf('mailto:')===-1&&h.indexOf('tel:')===-1&&h.indexOf('javascript:')===-1){
          links.push(a);
        }
      });
      if(links.length>0){
        var el=links[ri(0,links.length)];
        var txt=(el.innerText||el.href||'').substring(0,40).trim();
        log('[\\u2192] Clicking: '+txt);
        clickedLink=true;
        el.click();
      }
    }

    function doScroll(){
      var elapsed=Date.now()-startTime;
      if(elapsed>=stayMs-1500){
        log('[\\u2713] Session time up ('+Math.round(elapsed/1000)+'s)');
        done();
        return;
      }
      scrollCount++;
      var max=getMaxScroll();
      var target=Math.max(0,Math.min(max,nextTarget()));
      currentScroll=target;
      var dist=Math.abs(target-window.scrollY);
      var dur=Math.min(3500,Math.max(600,dist*rn(2.5,6)));
      log('[~] Scroll #'+scrollCount+' \\u2192 '+Math.round(target)+'px');
      smoothScroll(target,dur,function(){
        if(scrollCount===3||scrollCount===6){tryClick();}
        var remaining=stayMs-(Date.now()-startTime);
        var pause=rn(pauseMin,pauseMax);
        if(remaining<pause+1000){
          setTimeout(done,Math.max(0,remaining-500));
        }else{
          setTimeout(doScroll,pause);
        }
      });
    }

    setTimeout(function(){
      currentScroll=window.scrollY;
      doScroll();
    },ri(1000,2500));

  }catch(err){
    try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'log',msg:'[!] Script error: '+(err&&err.message?err.message:String(err))}));}catch(e){}
  }
  true;
})();
`;
}
