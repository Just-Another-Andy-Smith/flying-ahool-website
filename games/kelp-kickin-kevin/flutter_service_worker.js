'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "70b60179ae4b60b2179b7ffb112fc695",
"assets/AssetManifest.bin.json": "587e3aa4a51327df1b926138a24a1292",
"assets/assets/audio/collect_air.mp3": "fb67debbb41fbd301cac9b1bf1ab2aff",
"assets/assets/audio/game_over.mp3": "84b0584425ddc100c8549c2637ee5716",
"assets/assets/audio/swim_wav.mp3": "90b852ce164efe9b409be0afbff3480c",
"assets/assets/images/air_bubbles.png": "bca33f08784ee5435c8eadd2a1871190",
"assets/assets/images/background.png": "76b4215564c68c972292b8f5c577d011",
"assets/assets/images/favicon.png": "4c5760f83fe2ed62cce58ea1ed84309d",
"assets/assets/images/game_icon.png": "8b7ee762512d30e5bd87a54a356ef860",
"assets/assets/images/Icon-maskable-192.png": "4949a34728dd945e4cc14885f3eb9011",
"assets/assets/images/Icon-maskable-512.png": "67ea5b5064f974b56840b063f02db9eb",
"assets/assets/images/Kevin-Swimming-Sprite.png": "6d5d8996fd0d51092ada540c670ac7ff",
"assets/assets/images/kevin_death.png": "f580b085efe76ef9f528aaa606d7a659",
"assets/assets/images/kevin_foreground.png": "aebf0851c2513d2386f581c59f7f525f",
"assets/assets/images/seaweed.png": "e88f14b2b603199b8c54f24ff118ce1b",
"assets/assets/images/splash-screen-lg.png": "ceaaffd7e8555e59a3f8682566296083",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1e34140111380492bd5a1f9127d60a95",
"assets/NOTICES": "41020c8451877d2cf7ca596c4ed3f699",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01",
"favicon.png": "4c5760f83fe2ed62cce58ea1ed84309d",
"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"flutter_bootstrap.js": "eda5e6aba729f56221bd75731a7b1e21",
"icons/Icon-192.png": "4949a34728dd945e4cc14885f3eb9011",
"icons/Icon-512.png": "67ea5b5064f974b56840b063f02db9eb",
"icons/Icon-maskable-192.png": "4949a34728dd945e4cc14885f3eb9011",
"icons/Icon-maskable-512.png": "67ea5b5064f974b56840b063f02db9eb",
"index.html": "02ba83e245862d07ec7e02aace528afe",
"/": "02ba83e245862d07ec7e02aace528afe",
"main.dart.js": "0db01d362c78111d40900a999e341f97",
"manifest.json": "f07d83bea421a7d99341395955e7be0d",
"splash/img/dark-1x.png": "518491f3c30d6f9881a28c095e1a1a17",
"splash/img/dark-2x.png": "ae7d2dc90c9474cb5715857d724016b7",
"splash/img/dark-3x.png": "fe740bdc53d315b8172666db7663df1c",
"splash/img/dark-4x.png": "cdc8c0b218bdb925e08eed180b31437d",
"splash/img/light-1x.png": "518491f3c30d6f9881a28c095e1a1a17",
"splash/img/light-2x.png": "ae7d2dc90c9474cb5715857d724016b7",
"splash/img/light-3x.png": "fe740bdc53d315b8172666db7663df1c",
"splash/img/light-4x.png": "cdc8c0b218bdb925e08eed180b31437d",
"version.json": "9c6af7cedceb73917fcf344fcd049384"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
