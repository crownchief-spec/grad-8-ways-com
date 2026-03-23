(function(){
  var pathname = typeof location !== "undefined" ? location.pathname : "";

  function getBasePath() {
    if (pathname.indexOf("/pages/work/") !== -1) return "../../";
    if (pathname.indexOf("/projects/") !== -1) {
      var segs = pathname.split("/").filter(Boolean);
      if (segs.length >= 3 && segs[segs.length - 1] === "index.html") {
        return "../../";
      }
      return "../";
    }
    if (pathname.indexOf("/pages/") !== -1 || pathname.indexOf("/blog") === 0 || pathname.indexOf("/case") === 0) return "../";
    return "";
  }

  var base = getBasePath();
  var headerComponent = "components/header.html";
  var footerComponent = "components/footer.html";

  function inject(placeholderId, url, runNavAfter) {
    var el = document.getElementById(placeholderId);
    if (!el) return;
    fetch(base + url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        el.outerHTML = html;
        if (runNavAfter) {
          var navToggle = document.querySelector("[data-nav-toggle]");
          var navMenu = document.querySelector("[data-nav-menu]");
          if (navToggle && navMenu) {
            navToggle.addEventListener("click", function() {
              var open = navMenu.classList.toggle("open");
              navToggle.setAttribute("aria-expanded", String(open));
            });
          }
        }
        if (placeholderId === "site-footer-placeholder") {
          var worksEl = document.getElementById("footerWorksPreview");
          if (worksEl) {
            fetch((base || "") + "assets/data/works.json")
              .then(function(r) { return r.json(); })
              .then(function(works) {
                var list = Array.isArray(works) ? works.slice() : [];
                function shuffle(a) {
                  for (var i = a.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var t = a[i]; a[i] = a[j]; a[j] = t;
                  }
                  return a;
                }
                var three = shuffle(list).slice(0, 3);
                function excerptText(w) {
                  var s = (w.metaDescription || w.excerpt || "").replace(/\s+/g, " ").trim();
                  return s.length > 60 ? s.slice(0, 60) + "…" : s;
                }
                var html = "";
                three.forEach(function(w) {
                  var slug = w.slug || "";
                  var href = "/pages/work/" + slug + ".html";
                  var coverSrc = (w.cover || "").indexOf("/") === 0 ? w.cover : "/" + (w.cover || "");
                  var title = (w.title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                  var excerpt = excerptText(w).replace(/</g, "&lt;").replace(/>/g, "&gt;");
                  html += '<a class="footer-case-card" href="' + href + '">';
                  html += '<div class="footer-case-thumb"><img src="' + coverSrc + '" alt="" loading="lazy" width="320" height="180" /></div>';
                  html += '<div class="footer-case-body"><h3 class="footer-case-title">' + title + '</h3>';
                  if (excerpt) html += '<p class="footer-case-excerpt">' + excerpt + '</p>';
                  html += '</div></a>';
                });
                worksEl.innerHTML = html || '<span class="footer-works-loading">暫無案例</span>';
              })
              .catch(function() {
                worksEl.innerHTML = '<span class="footer-works-loading">載入失敗</span>';
              });
          }
          var list = document.getElementById("footerBlogPreview");
          if (list) {
            fetch(base + "assets/data/blog-latest.json")
              .then(function(r) { return r.json(); })
              .then(function(data) {
                var posts = data && data.posts ? data.posts : [];
                list.innerHTML = "";
                posts.forEach(function(p) {
                  var li = document.createElement("li");
                  var a = document.createElement("a");
                  a.href = "/blog/" + (p.slug || "") + ".html";
                  a.textContent = p.title || "";
                  li.appendChild(a);
                  list.appendChild(li);
                });
                if (posts.length === 0) list.innerHTML = "<li class=\"small\"><a href=\"/blog/\">前往攝影資訊</a></li>";
              })
              .catch(function() {
                list.innerHTML = "<li class=\"small\"><a href=\"/blog/\">前往攝影資訊</a></li>";
              });
          }
        }
      })
      .catch(function() {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      inject("site-header-placeholder", headerComponent, true);
      inject("site-footer-placeholder", footerComponent, false);
    });
  } else {
    inject("site-header-placeholder", headerComponent, true);
    inject("site-footer-placeholder", footerComponent, false);
  }
})();
