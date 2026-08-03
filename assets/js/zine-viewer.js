/*
 * Zine reader.
 *
 * The markup ships as a plain stack of spreads, so the publication is fully
 * readable with this script blocked. Here it becomes one spread at a time,
 * turned with the controls, the arrow keys, a swipe, or a click on either
 * half of the open book.
 */
(() => {
  const TURN_CLASSES = ["is-turning-forward", "is-turning-back"];

  const setupReader = (reader) => {
    const stage = reader.querySelector("[data-zine-stage]");
    const spreads = Array.from(reader.querySelectorAll("[data-zine-spread]"));
    const previous = reader.querySelector("[data-zine-previous]");
    const next = reader.querySelector("[data-zine-next]");
    const counter = reader.querySelector("[data-zine-current]");
    const status = reader.querySelector("[data-zine-status]");

    if (!stage || spreads.length === 0 || !previous || !next) return;

    const totalPages = reader.querySelectorAll("[data-zine-page]").length;
    const statusTemplate = reader.dataset.zineStatusTemplate || "{range} / {total}";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let index = 0;
    let swipe = null;

    reader.dataset.enhanced = "true";
    reader.tabIndex = 0;

    const show = (i) => {
      spreads.forEach((spread, position) => {
        spread.hidden = position !== i;
        if (position === i) spread.setAttribute("aria-current", "page");
        else spread.removeAttribute("aria-current");
      });
    };

    // Decode neighbouring spreads ahead of the turn so they do not flash in.
    const warm = (i) => {
      spreads[i]?.querySelectorAll("img[loading='lazy']").forEach((img) => {
        img.loading = "eager";
      });
    };

    const sync = () => {
      const label = spreads[index].dataset.spreadLabel || String(index + 1);
      if (counter) counter.textContent = label;
      if (status) {
        status.textContent = statusTemplate
          .replace("{range}", label)
          .replace("{total}", String(totalPages));
      }
      previous.disabled = index === 0;
      next.disabled = index === spreads.length - 1;
      warm(index + 1);
      warm(index - 1);
    };

    const turn = (target) => {
      if (target < 0 || target >= spreads.length || target === index) return false;

      const forward = target > index;
      const incoming = spreads[target];

      show(target);
      index = target;

      if (!reducedMotion.matches) {
        const turning = forward ? TURN_CLASSES[0] : TURN_CLASSES[1];
        TURN_CLASSES.forEach((name) => incoming.classList.remove(name));
        // Restart the animation even when turning the same way twice.
        void incoming.offsetWidth;
        incoming.classList.add(turning);
        incoming.addEventListener(
          "animationend",
          () => incoming.classList.remove(turning),
          { once: true },
        );
      }

      sync();
      return true;
    };

    previous.addEventListener("click", () => turn(index - 1));
    next.addEventListener("click", () => turn(index + 1));

    // Clicking a half of the open book turns that way, as it would on paper.
    stage.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      const bounds = stage.getBoundingClientRect();
      turn(event.clientX < bounds.left + bounds.width / 2 ? index - 1 : index + 1);
    });

    stage.addEventListener("pointerdown", (event) => {
      const zoomed = (window.visualViewport?.scale || 1) > 1.01;
      const atEdge = event.clientX < 24 || event.clientX > window.innerWidth - 24;
      if (!event.isPrimary || event.pointerType !== "touch" || zoomed || atEdge) return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });

    stage.addEventListener("pointerup", (event) => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      swipe = null;

      const threshold = Math.min(72, Math.max(44, stage.clientWidth * 0.1));
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.25) {
        turn(index + (dx < 0 ? 1 : -1));
      }
    });

    stage.addEventListener("pointercancel", () => {
      swipe = null;
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (editing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      let moved = false;
      if (event.key === "ArrowLeft" || event.key === "PageUp") moved = turn(index - 1);
      if (event.key === "ArrowRight" || event.key === "PageDown") moved = turn(index + 1);
      if (event.key === "Home") moved = turn(0);
      if (event.key === "End") moved = turn(spreads.length - 1);
      if (moved) event.preventDefault();
    });

    show(0);
    warm(0);
    warm(1);
    sync();
  };

  const start = () => document.querySelectorAll("[data-zine-viewer]").forEach(setupReader);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
