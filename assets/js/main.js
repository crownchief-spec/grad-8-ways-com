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

  function initYearbookCarousel(){
    const carousel = document.getElementById("yearbookCarousel");
    if(!carousel) return;
    const track = carousel.querySelector(".yearbook-carousel-track");
    const slides = carousel.querySelectorAll(".yearbook-carousel-slide");
    const totalEl = carousel.querySelector("#yearbookTotal");
    const currentEl = carousel.querySelector("#yearbookCurrent");
    const prevBtn = carousel.querySelector(".yearbook-carousel-btn.prev");
    const nextBtn = carousel.querySelector(".yearbook-carousel-btn.next");
    if(!track || !slides.length) return;
    let idx = 0;
    if(totalEl) totalEl.textContent = slides.length;
    function go(i){
      idx = Math.max(0, Math.min(i, slides.length - 1));
      track.style.transform = "translateX(-" + (idx * 100) + "%)";
      if(currentEl) currentEl.textContent = idx + 1;
    }
    if(prevBtn) prevBtn.addEventListener("click", ()=> go(idx - 1));
    if(nextBtn) nextBtn.addEventListener("click", ()=> go(idx + 1));
    go(0);
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    wireNav();
    initHeroCarousel();
    initMoodSliders();
    initYearbookCarousel();
  });
})();
