(function(){
  function wireNav(){
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if(toggle && menu){
      toggle.addEventListener("click", ()=>{
        const open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function initHeroCarousel(){
    const carousel = document.getElementById("heroCarousel");
    if(!carousel) return;
    const imgs = carousel.querySelectorAll("img");
    if(imgs.length === 0) return;
    let idx = 0;
    imgs[0].classList.add("active");
    setInterval(function(){
      imgs[idx].classList.remove("active");
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add("active");
    }, 4500);
  }

  function initMoodSliders(){
    const sliders = document.querySelectorAll("[data-mood-slider]");
    sliders.forEach(slider=>{
      const slides = slider.querySelectorAll(".mood-slide");
      if(!slides.length) return;
      let idx = 0;
      slides[0].classList.add("active");
      setInterval(()=>{
        slides[idx].classList.remove("active");
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add("active");
      }, 6000);
    });
  }

  function shuffleArray(arr){
    const a = arr.slice();
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initWorksGrid(){
    const grid = document.getElementById("works-grid");
    if(!grid) return;
    const base = document.querySelector("main.subpage") ? "../" : "";
    fetch(base + "assets/data/works-images.json")
      .then(r=>r.json())
      .then(list=>{
        const shuffled = shuffleArray(list);
        shuffled.forEach(name=>{
          const img = document.createElement("img");
          img.src = base + "assets/images/works/" + name;
          img.alt = "小巴老師攝影 畢業照作品 幼兒園畢業照";
          img.loading = "lazy";
          img.className = "works-grid-item";
          grid.appendChild(img);
        });
      })
      .catch(()=>{ grid.innerHTML = "<p class=\"small\">無法載入作品列表，請稍後再試。</p>"; });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    wireNav();
    initHeroCarousel();
    initMoodSliders();
    initWorksGrid();
  });
})();
