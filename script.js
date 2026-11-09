(() => {
  const STORAGE_KEY = "carga-segura-checklist-v1";
  const checks = [...document.querySelectorAll("[data-check]")];
  const counter = document.getElementById("check-progress");
  const announcer = document.getElementById("status-message");
  const progressBar = document.getElementById("reading-progress");
  const sectionLinks = [...document.querySelectorAll(".contents-link")];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    saved = {};
  }

  const updateCheckCount = (announce = false) => {
    const checked = checks.filter((item) => item.checked).length;
    const total = checks.length;
    counter.textContent = `${checked} de ${total} itens conferidos`;
    if (announce)
      announcer.textContent = `Checklist atualizado: ${checked} de ${total} itens conferidos.`;
  };

  checks.forEach((input) => {
    input.checked = Boolean(saved[input.dataset.check]);
    input.addEventListener("change", () => {
      const state = Object.fromEntries(
        checks.map((item) => [item.dataset.check, item.checked]),
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* O checklist ainda funciona nesta visita. */
      }
      updateCheckCount(true);
    });
  });
  updateCheckCount();

  const printButton = document.querySelector(".print-button");
  printButton?.addEventListener("click", () => window.print());

  document.querySelector(".clear-checks")?.addEventListener("click", () => {
    checks.forEach((input) => {
      input.checked = false;
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Sem persistência disponível. */
    }
    updateCheckCount(true);
  });

  const setActiveSection = (id) => {
    sectionLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.15, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
  }

  const updateReadingProgress = () => {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      scrollable > 0
        ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100))
        : 0;
    progressBar.style.width = `${progress}%`;
  };
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
  updateReadingProgress();
})();
