const topbar = document.querySelector("[data-topbar]");
const toast = document.querySelector("[data-toast]");
const closeToast = document.querySelector("[data-close-toast]");
const copyButton = document.querySelector("[data-copy]");
const dockLinks = [...document.querySelectorAll(".mobile-dock a")];
const hero = document.querySelector(".hero");
const featureCard = document.querySelector(".feature-card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = dockLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (!reduceMotion) {
  document.body.classList.add("has-motion");
}

const updateTopbar = () => {
  topbar.classList.toggle("is-scrolled", window.scrollY > 24);
};

const updateDock = () => {
  const current = sections.reduce((active, section) => {
    const box = section.getBoundingClientRect();
    return box.top < window.innerHeight * 0.42 ? section : active;
  }, sections[0]);

  dockLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
};

const updateHeroParallax = () => {
  if (reduceMotion || !hero) return;
  const heroBox = hero.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, -heroBox.top / Math.max(1, heroBox.height)));
  document.body.style.setProperty("--hero-scroll-y", `${progress * -72}px`);
};

window.addEventListener("scroll", () => {
  updateTopbar();
  updateDock();
  updateHeroParallax();
});

if (!reduceMotion) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    document.body.style.setProperty("--hero-mouse-x", `${x}px`);
    document.body.style.setProperty("--hero-mouse-y", `${y}px`);
  });
}

if (!reduceMotion && featureCard) {
  featureCard.addEventListener("pointermove", (event) => {
    const box = featureCard.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    featureCard.classList.add("tilt-active");
    featureCard.style.setProperty("--card-ry", `${x * 5.5}deg`);
    featureCard.style.setProperty("--card-rx", `${y * -4.5}deg`);
  });

  featureCard.addEventListener("pointerleave", () => {
    featureCard.classList.remove("tilt-active");
    featureCard.style.setProperty("--card-rx", "0deg");
    featureCard.style.setProperty("--card-ry", "0deg");
  });
}

closeToast?.addEventListener("click", () => {
  toast.hidden = true;
});

copyButton?.addEventListener("click", async () => {
  const value = copyButton.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy link";
    }, 1300);
  } catch {
    window.location.href = value;
  }
});

document.querySelectorAll("details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll("details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const revealTargets = [
  ".feature-card",
  ".section-heading",
  ".mini-card",
  ".idea-copy",
  ".skill-panel",
  ".faq",
  ".contact-strip",
]
  .flatMap((selector) => [...document.querySelectorAll(selector)])
  .filter(Boolean);

if (!reduceMotion && "IntersectionObserver" in window) {
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal-target");
    target.style.setProperty("--stagger", index % 4);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.14 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const statValues = [...document.querySelectorAll(".stats-row strong")];

const animateStat = (element) => {
  const raw = element.textContent.trim();
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match || element.dataset.counted) return;
  element.dataset.counted = "true";
  const target = Number(match[1]);
  const suffix = match[2];
  const started = performance.now();
  const duration = 900;

  const tick = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (!reduceMotion && "IntersectionObserver" in window) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.8 }
  );

  statValues.forEach((item) => statObserver.observe(item));
}

updateTopbar();
updateDock();
updateHeroParallax();
