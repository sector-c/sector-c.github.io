// Macintosh desktop: only the behavior used by this hand-authored page.
(() => {
  'use strict';

  const THEME_KEY = 'macintosh-links:theme';
  const ACCENTS = ['teal', 'blue', 'coral', 'pink'];
  const root = document.documentElement;

  // Start each page load with a new random accent. Never save it to storage.
  root.dataset.accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

  // Apply a saved choice early to avoid flashing the default light theme.
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      root.dataset.theme = savedTheme;
    }
  } catch (_) {
    // Light remains the first-visit default if storage is blocked.
  }

  document.addEventListener('DOMContentLoaded', () => {
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];
    const systemScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const clock = $('#clock');
    const toast = $('#toast');
    const modalRoot = $('#modal-root');
    const savedAt = $('meta[name="site-saved-at"]')?.content;

    let themePreference = root.getAttribute('data-theme') || 'auto';
    let accentPreference = root.dataset.accent;
    let sourceModified = validDate(savedAt);
    let toastTimeout;
    let previousFocus = null;

    function isDark() {
      return themePreference === 'dark' ||
        (themePreference === 'auto' && systemScheme.matches);
    }

    function syncBrowserColor() {
      const color = getComputedStyle(root).getPropertyValue('--bg').trim();
      const meta = $('meta[name="theme-color"]');
      if (meta && color) meta.content = color;
    }

    function refreshThemeControls() {
      const toggle = $('#lightbulb-toggle');
      if (toggle) {
        const dark = isDark();
        const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('aria-pressed', String(dark));
        toggle.title = label;
      }

      $$('[data-theme-choice]').forEach(button => {
        const selected = button.dataset.themeChoice === themePreference;
        button.setAttribute('aria-pressed', String(selected));
        const check = button.querySelector('.theme-check');
        if (check) check.textContent = selected ? '✓' : '';
      });
      syncBrowserColor();
    }

    function setTheme(choice) {
      if (!['auto', 'light', 'dark'].includes(choice)) return;
      themePreference = choice;
      if (choice === 'auto') root.removeAttribute('data-theme');
      else root.dataset.theme = choice;

      try {
        if (choice === 'auto') localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, choice);
      } catch (_) {
        // Theme changes can still work without localStorage.
      }
      refreshThemeControls();
    }

    function refreshAccentControl() {
      const button = $('#accent-cycle');
      if (button) {
        const next = ACCENTS[(ACCENTS.indexOf(accentPreference) + 1) % ACCENTS.length];
        button.title = `Accent: ${accentPreference} • Next: ${next}`;
        button.setAttribute('aria-label',
          `Accent color: ${accentPreference}. Click to switch to ${next}`);
      }
      syncBrowserColor();
    }

    function cycleAccent() {
      accentPreference = ACCENTS[(ACCENTS.indexOf(accentPreference) + 1) % ACCENTS.length];
      root.dataset.accent = accentPreference;
      refreshAccentControl();
    }

    function validDate(value) {
      const date = value ? new Date(value) : null;
      return date && Number.isFinite(date.getTime()) &&
        date.getTime() <= Date.now() + 86_400_000 ? date : null;
    }

    function formatModified(date) {
      return 'Last Modified: ' + new Intl.DateTimeFormat('en-US', {
        month: 'long', year: 'numeric'
      }).format(date);
    }

    function refreshLastModified() {
      const label = $('#last-modified');
      if (label) label.textContent = sourceModified
        ? formatModified(sourceModified)
        : 'Last Modified: Unknown';
    }

    // file:// exposes a genuine file timestamp; hosted pages may supply Last-Modified.
    if (location.protocol === 'file:') {
      sourceModified = validDate(document.lastModified) || sourceModified;
    } else if (location.protocol === 'http:' || location.protocol === 'https:') {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(response => {
        const date = response.ok ? validDate(response.headers.get('Last-Modified')) : null;
        if (date) {
          sourceModified = date;
          refreshLastModified();
        }
      }).catch(() => {});
    }

    function refreshLinkCount() {
      const count = $$('.link-container').length;
      const label = `${count} item${count === 1 ? '' : 's'}`;
      $$('.item-count').forEach(element => { element.textContent = label; });
      const status = $('#status-count');
      if (status) status.textContent = `${count} link${count === 1 ? '' : 's'}`;
    }

    function notify(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.hidden = false;
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => { toast.hidden = true; }, 3800);
    }

    function closeMenus() {
      $$('[data-popup]').forEach(popup => { popup.hidden = true; });
      $$('[data-menu]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
      });
    }

    function toggleMenu(name) {
      const popup = $$('[data-popup]').find(item => item.dataset.popup === name);
      const trigger = $$('[data-menu]').find(item => item.dataset.menu === name);
      if (!popup || !trigger) return;
      const opening = popup.hidden;
      closeMenus();
      popup.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
    }

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
    }

    function closeDialog() {
      if (!modalRoot) return;
      modalRoot.replaceChildren();
      if (previousFocus?.isConnected) previousFocus.focus();
      previousFocus = null;
    }

    function openDialog(mode) {
      if (!modalRoot) return;
      closeMenus();
      closeDialog();
      previousFocus = document.activeElement;

      const name = $('.profile h1')?.textContent?.trim() || document.title;
      const handle = $('.profile .handle')?.textContent?.trim() || '';
      const bio = $('.profile .bio')?.textContent?.trim() || '';
      const about = mode === 'about';
      const dialogTitle = about ? 'Read Me.txt' : 'Help';
      const content = about
        ? `<h2>${escapeHtml(name)}</h2><p>${escapeHtml(handle)}</p>` +
          `<p>${escapeHtml(bio)}</p><p>A personal art and links page styled like a classic desktop.</p>`
        : `<h2 class="dialog-heading">How to use this page</h2>` +
          `<p>Use the desktop shortcuts to visit linked sites. Use the lightbulb to switch themes,` +
          ` or the color dot to change the desktop accent.</p>` +
          `<p>The custom link boxes are edited directly in <code>index.html</code>. ` +
          `Choose <strong>File → Export HTML</strong> to save a copy of the current page. ` +
          `Keep <code>style.css</code>, <code>script.js</code>, and your <code>fonts/</code> folder beside it.</p>`;

      const shade = document.createElement('div');
      shade.className = 'modal-shade';
      const dialog = document.createElement('div');
      dialog.className = 'dialog-window compact';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', dialogTitle);
      dialog.innerHTML = `
        <div class="window-title">
          <button class="window-control" type="button" data-action="close"
            aria-label="Close dialog"><i class="fi fi-ss-cross-small" aria-hidden="true"></i></button>
          <div class="window-lines"></div>
          <span class="window-heading">${dialogTitle}</span>
          <div class="window-lines"></div>
        </div>
        <div class="dialog-body">
          ${content}
          <div class="dialog-actions">
            <button class="mac-button primary" type="button" data-action="close">OK</button>
          </div>
        </div>`;
      shade.addEventListener('click', event => {
        if (event.target === shade) closeDialog();
      });
      shade.append(dialog);
      modalRoot.append(shade);
      dialog.querySelector('button')?.focus();
    }

    async function copyText(text) {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('No Clipboard API');
        await navigator.clipboard.writeText(text);
        notify('Copied to clipboard!');
      } catch (_) {
        const field = document.createElement('textarea');
        field.value = text;
        field.className = 'clipboard-temp';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        notify(copied ? 'Copied to clipboard!' : 'Could not copy automatically.');
      }
    }

    function sharePage() {
      if (location.protocol === 'file:') {
        notify('Publish the site first to share a public URL.');
        return;
      }
      if (navigator.share) {
        navigator.share({ title: document.title, url: location.href }).catch(() => {});
      } else {
        copyText(location.href);
      }
    }

    function exportHtml() {
      const copy = document.documentElement.cloneNode(true);
      copy.dataset.theme = 'light';
      copy.dataset.accent = 'teal'; // Static fallback; script.js chooses randomly when loaded.
      const timestamp = new Date();
      const dateMeta = copy.querySelector('meta[name="site-saved-at"]');
      if (dateMeta) dateMeta.content = timestamp.toISOString();
      const dateLabel = copy.querySelector('#last-modified');
      if (dateLabel) dateLabel.textContent = formatModified(timestamp);
      copy.querySelector('#modal-root')?.replaceChildren();
      const exportedToast = copy.querySelector('#toast');
      if (exportedToast) {
        exportedToast.hidden = true;
        exportedToast.textContent = '';
      }
      copy.querySelectorAll('[data-popup]').forEach(popup => { popup.hidden = true; });
      copy.querySelectorAll('[data-menu]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
      });
      copy.querySelectorAll('[data-theme-choice]').forEach(button => {
        const selected = button.dataset.themeChoice === 'light';
        button.setAttribute('aria-pressed', String(selected));
        const mark = button.querySelector('.theme-check');
        if (mark) mark.textContent = selected ? '✓' : '';
      });
      const blob = new Blob([`<!DOCTYPE html>\n${copy.outerHTML}`], {
        type: 'text/html;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-links.html';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      notify('Exported my-links.html. Publish it with style.css, script.js, and fonts/.');
    }

    function runAction(action) {
      if (action === 'theme-toggle') setTheme(isDark() ? 'light' : 'dark');
      else if (action === 'accent-cycle') cycleAccent();
      else if (action.startsWith('theme-')) setTheme(action.slice(6));
      else if (action === 'close') closeDialog();
      else if (action === 'about' || action === 'help') openDialog(action);
      else if (action === 'share') sharePage();
      else if (action === 'copy') {
        if (location.protocol === 'file:') notify('Publish the site first to copy its URL.');
        else copyText(location.href);
      }
      else if (action === 'export') exportHtml();
      closeMenus();
    }

    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-menu]');
      if (trigger) {
        toggleMenu(trigger.dataset.menu);
        return;
      }
      const action = event.target.closest('[data-action]');
      if (action) {
        runAction(action.dataset.action);
        return;
      }
      const shortcut = event.target.closest('[data-shortcut]');
      if (shortcut) {
        notify('Shortcut not configured.');
        return;
      }
      if (!event.target.closest('.menu-popup')) closeMenus();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (modalRoot?.hasChildNodes()) closeDialog();
        closeMenus();
      }
      if (event.key === 'Tab' && modalRoot?.hasChildNodes()) {
        const buttons = $$('.modal-shade button:not([disabled])');
        if (!buttons.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    function updateClock() {
      if (!clock) return;
      const now = new Date();
      clock.textContent = now.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    $$('.desktop-shortcut[data-shortcut]').forEach(button => {
      button.title = 'Shortcut not configured';
    });
    const copyrightYear = $('#year');
    if (copyrightYear) copyrightYear.textContent = `© ${new Date().getFullYear()}`;
    refreshLinkCount();
    refreshThemeControls();
    refreshAccentControl();
    refreshLastModified();
    updateClock();
    setInterval(updateClock, 30_000);
    systemScheme.addEventListener?.('change', () => {
      if (themePreference === 'auto') refreshThemeControls();
    });
  });
})();
