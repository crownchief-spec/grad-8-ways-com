(function(){
  var pathname = typeof location !== "undefined" ? location.pathname : "";
var base = "";
  if (pathname.indexOf("/pages/work/") !== -1) base = "../../";
  else if (pathname.indexOf("/projects/") !== -1) base = "../";
  else if (pathname.indexOf("/pages/") !== -1 || pathname.indexOf("/blog") === 0 || pathname.indexOf("/case") === 0) base = "../";

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
                  a.title = p.excerpt || p.title || "";
                  li.appendChild(a);
                  if (p.excerpt) {
                    var span = document.createElement("span");
                    span.className = "footer-blog-excerpt small";
                    span.textContent = " " + p.excerpt;
                    li.appendChild(span);
                  }
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
      inject("site-header-placeholder", "components/header.html", true);
      inject("site-footer-placeholder", "components/footer.html", false);
    });
  } else {
    inject("site-header-placeholder", "components/header.html", true);
    inject("site-footer-placeholder", "components/footer.html", false);
  }
})();
