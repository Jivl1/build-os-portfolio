const topbar = document.querySelector("[data-topbar]");
const toast = document.querySelector("[data-toast]");
const closeToast = document.querySelector("[data-close-toast]");
const copyButton = document.querySelector("[data-copy]");
const dockLinks = [...document.querySelectorAll(".mobile-dock a")];
const sections = dockLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

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

window.addEventListener("scroll", () => {
  updateTopbar();
  updateDock();
});

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

updateTopbar();
updateDock();
