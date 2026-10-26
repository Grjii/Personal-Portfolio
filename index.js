// ---------- Grab the things we need ----------
const body = document.body;
const themeButton = document.querySelector('#theme-btn');       // optional: only if your HTML has this button
const themeSwitch = document.querySelector('#theme-switch');    // the sun / moon switch
const langButtons = document.querySelectorAll('.lang-btn');
const translatable = document.querySelectorAll('[data-ar]');

// ---------- Dark mode ----------
// Adding / removing the class "dark" on <body> swaps the CSS variables (the colors)
if (themeButton) {
  themeButton.addEventListener('click', function () {
    body.classList.toggle('dark');
  });
}

// The switch starts "checked" (light mode). Unchecking it = dark mode.
if (themeSwitch) {
  themeSwitch.addEventListener('change', function () {
    body.classList.toggle('dark', !themeSwitch.checked);
  });
}

// ---------- Language ----------
// First, save each element's English text so we can switch back to it later
translatable.forEach(function (element) {
  element.dataset.en = element.textContent.trim();
});

langButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const lang = button.dataset.lang;   // "en" or "ar"

    // Replace the text of every element that has a data-ar attribute
    translatable.forEach(function (element) {
      element.textContent = element.dataset[lang];
    });

    // Arabic reads right-to-left, so flip the whole page's direction
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // Highlight the button that was clicked
    langButtons.forEach(function (other) {
      other.classList.remove('active');
    });
    button.classList.add('active');
  });
});

// ---------- Numbers that count up ----------
// Optional attributes on the number's element:
//   data-prefix="+"      text added before the number   (e.g. +485%)
//   data-suffix="K"      text added after the number    (e.g. 245K)
//   data-plain="true"    no thousands separator         (e.g. 1710 instead of 1,710)
function countUp(element) {
  const target = Number(element.dataset.count);
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const plain = element.dataset.plain === 'true';
  const duration = 1500;                       // 1.5 seconds
  const start = performance.now();

  // Every run gets its own number, so if a number is restarted quickly the older run stops by itself
  const run = (Number(element.dataset.run) || 0) + 1;
  element.dataset.run = run;

  function step(now) {
    if (Number(element.dataset.run) !== run) { return; }
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(target * progress);
    element.textContent = prefix + (plain ? value : value.toLocaleString()) + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Every section below is wrapped in try / catch, so if one ever hits a problem
// (a missing element, a typo) the rest of the page keeps working.

// ---------- Hamburger menu (small screens) ----------
try {
  const menuToggle = document.querySelector('#menu-toggle');
  const menu = document.querySelector('#menu');

  function setMenu(open) {
    menuToggle.checked = open;
    menuToggle.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
  }

  menuToggle.addEventListener('change', function () {
    setMenu(menuToggle.checked);
  });

  menu.querySelectorAll('.nav_links a[href]').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target) && !event.target.closest('.menu-toggle')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { setMenu(false); }
  });

  window.matchMedia('(min-width: 1101px)').addEventListener('change', function (event) {
    if (event.matches) { setMenu(false); }
  });
} catch (error) { console.error('Hamburger menu failed:', error); }

// ---------- YouTube profile picture (Top5Online logo) ----------
// The HTML asks for "top5online_instagram.png". If the browser can't find it, this tries a few
// similar file names (a space instead of an underscore, a double .png, different capitals...).
// If none of them exist, a "T5" badge is shown instead of a broken-image icon.
// Best permanent fix: make the file name in your folder match the HTML exactly.
try {
  const avatarImg = document.querySelector('.yt-avatar img');

  if (avatarImg) {
    const avatar = avatarImg.parentElement;
    const otherNames = [
      'top5online%20instagram.png',
      'top5online-instagram.png',
      'top5online_instagram.png.png',
      'Top5Online_Instagram.png',
      'Top5Online.png',
      'top5online.png',
      'images/top5online_instagram.png'
    ];
    let nextName = 0;

    function tryNextName() {
      if (nextName < otherNames.length) {
        avatarImg.src = otherNames[nextName];
        nextName++;
      } else {
        avatar.classList.add('no-img');   // shows the "T5" badge (see CSS)
        avatarImg.remove();
      }
    }

    avatarImg.addEventListener('error', tryNextName);

    // If the first attempt already failed before this script ran, start the fallback now
    if (avatarImg.complete && avatarImg.naturalWidth === 0) {
      tryNextName();
    }
  }
} catch (error) { console.error('Profile picture failed:', error); }

// ---------- Instagram phone: profile picture (custom-ava) ----------
// The HTML asks for "custom-ava (1).png". If the browser can't find it, this tries a few similar names.
// If none of them exist, the picture is removed and the "K" letter shows instead.
// Best permanent fix: rename your file to custom-ava.png (and it will be found right away).
try {
  const gxAvatarImg = document.querySelector('.gx-avatar img');

  if (gxAvatarImg) {
    const gxAvatarNames = [
      'custom-ava.png',
      'custom-ava (1).png',
      'custom-ava__1_.png',
      'custom-ava_1.png',
      'images/custom-ava.png',
      'images/custom-ava (1).png'
    ];
    let gxNextAvatar = 0;

    function tryNextAvatar() {
      if (gxNextAvatar < gxAvatarNames.length) {
        gxAvatarImg.src = encodeURI(gxAvatarNames[gxNextAvatar]);   // turns spaces into %20
        gxNextAvatar++;
      } else {
        gxAvatarImg.remove();   // the "K" letter underneath shows instead
      }
    }

    gxAvatarImg.addEventListener('error', tryNextAvatar);

    // If the first attempt already failed before this script ran, start the fallback now
    if (gxAvatarImg.complete && gxAvatarImg.naturalWidth === 0) {
      tryNextAvatar();
    }
  }
} catch (error) { console.error('Phone profile picture failed:', error); }

// ---------- YouTube video cards: optional real thumbnails ----------
// The cards already look good on their own (gradient + rank + play button + views).
// If you put a real video ID in data-video="..." in the HTML, its thumbnail is loaded and shown
// behind the play button. A placeholder (VIDEO_ID_1...) or a wrong ID is simply ignored.
try {
  document.querySelectorAll('.yt-video[data-video]').forEach(function (tile) {
    const id = tile.dataset.video.trim();
    if (!id || id.indexOf('VIDEO_ID') === 0) { return; }

    const img = new Image();
    img.className = 'yt-thumb';
    img.alt = '';
    img.addEventListener('load', function () {
      // YouTube answers a wrong ID with a tiny gray picture (120px wide), so only keep real thumbnails
      if (img.naturalWidth > 120) {
        tile.insertBefore(img, tile.firstChild);
        tile.classList.add('has-thumb');
      }
    });
    img.src = 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg';
  });
} catch (error) { console.error('YouTube thumbnails failed:', error); }

// ---------- Cards slide in (and numbers count up) when you scroll to them ----------
try {
  const revealItems = document.querySelectorAll('.project-card, .growth-item, .cert');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('hidden');
        entry.target.querySelectorAll('.counter').forEach(countUp);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealItems.forEach(function (item) {
    item.classList.add('hidden');
    observer.observe(item);
  });
} catch (error) { console.error('Scroll reveal failed:', error); }

// ---------- Project cards on touch screens ----------
try {
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('click', function (event) {
        if (event.target.closest('.visit-btn')) { return; }
        card.classList.toggle('open');
      });
    });
  }
} catch (error) { console.error('Project cards failed:', error); }

// ---------- Page tracking ----------
// Lights up the nav icon of the page you are on (the page crossing the middle of the screen)
try {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav_links a[data-nav]');

  const pageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.dataset.nav === entry.target.dataset.nav);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  pages.forEach(function (page) {
    pageObserver.observe(page);
  });
} catch (error) { console.error('Page tracking failed:', error); }

// ---------- Navbar merge + progress bar ----------
// After a few pixels of scrolling, the three separate pills merge into one big glass bar
try {
  const progressBar = document.querySelector('.progress');

  function updateScroll() {
    body.classList.toggle('scrolled', window.scrollY > 30);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / scrollable * 100) + '%';
  }

  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
} catch (error) { console.error('Navbar / progress bar failed:', error); }

// ---------- Spotlight glow that follows the mouse over cards ----------
try {
  document.querySelectorAll('.skill-card, .project-card, .exp-card, .contact-card, .contact-form, .window')
    .forEach(function (card) {
      card.setAttribute('data-spot', '');
      card.addEventListener('pointermove', function (event) {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - box.left) + 'px');
        card.style.setProperty('--my', (event.clientY - box.top) + 'px');
      });
    });
} catch (error) { console.error('Spotlight failed:', error); }

// ---------- Skill cards: tap to show the name (touch screens have no hover) ----------
try {
  document.querySelectorAll('.skill-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.skill-card.tap').forEach(function (other) {
        if (other !== card) { other.classList.remove('tap'); }
      });
      card.classList.toggle('tap');
    });
  });
} catch (error) { console.error('Skill cards failed:', error); }

// ---------- The phone: interactive Growth Timeline ----------
// How it works:
//   - the slider goes from Day 1 (left) to Now (right); the counter, chart line, caption, time pill and glow follow it
//   - the chips under the slider are the milestones: tap one and the slider glides there
//   - "Replay" restarts the journey from zero (it ALWAYS animates, even if the computer has "reduce motion" turned on,
//     because you pressed it on purpose). It also plays once by itself when the phone first appears.
//   - as soon as the visitor touches any control, the automatic animation stops and lets them take over
// To change the numbers: on the .gx-chip buttons in the HTML,
//   data-value = followers at that milestone, data-month = months it took to get there
//   (first = 0 / 0, last = your real follower count / total months).
try {
  const gx = document.querySelector('#gx');
  const range = document.querySelector('#gx-range');
  const numEl = document.querySelector('#gx-num');
  const timeEl = document.querySelector('#gx-time');
  const chipsBox = document.querySelector('.gx-chips');
  const chips = Array.from(document.querySelectorAll('.gx-chip'));
  const caps = Array.from(document.querySelectorAll('.gx-cap'));
  const lineEl = document.querySelector('#gx-line');
  const areaEl = document.querySelector('#gx-area');
  const ghostEl = document.querySelector('#gx-ghost');
  const dotEl = document.querySelector('#gx-dot');
  const ringEl = document.querySelector('#gx-ring');
  const marksG = document.querySelector('#gx-marks');
  const replayBtn = document.querySelector('#gx-replay');
  const phoneEl = document.querySelector('#phone');

  const stops = chips.map(function (chip) { return Number(chip.dataset.value); });
  const months = chips.map(function (chip) { return Number(chip.dataset.month) || 0; });
  const last = stops.length - 1;               // the index of the last stop ("Now")
  const maxValue = stops[last] || 1;
  const STEP = 100;                            // slider units between two stops
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Chart area inside the 204 x 96 drawing
  const X_LEFT = 4, X_RIGHT = 196, Y_TOP = 10, Y_BOTTOM = 88, Y_FLOOR = 96;

  range.min = '0';
  range.max = String(last * STEP);
  range.step = 'any';

  // The follower count at a position (0 = first stop, 1 = second stop ... last = "Now"), eased between stops
  function valueAt(pos) {
    const seg = Math.min(Math.floor(pos), last - 1);
    const t = Math.min(Math.max(pos - seg, 0), 1);
    const smooth = t * t * (3 - 2 * t);
    const eased = 0.5 * t + 0.5 * smooth;      // half straight line, half S-curve
    return stops[seg] + (stops[seg + 1] - stops[seg]) * eased;
  }

  // How many months it took to get to a position (a straight line between two milestones)
  function monthsAt(pos) {
    const seg = Math.min(Math.floor(pos), last - 1);
    const t = Math.min(Math.max(pos - seg, 0), 1);
    return months[seg] + (months[seg + 1] - months[seg]) * t;
  }

  // The text of the time pill, in English or Arabic
  function timeText(pos) {
    const ar = document.documentElement.lang === 'ar';
    const m = monthsAt(pos);

    if (pos < 0.005) { return ar ? 'اليوم 1' : 'Day 1'; }

    // Less than a month: show days
    if (m < 1) {
      const d = Math.max(1, Math.round(m * 30));
      if (ar) { return 'خلال ' + (d === 1 ? 'يوم' : d === 2 ? 'يومين' : d + ' أيام'); }
      return 'In ' + d + (d === 1 ? ' day' : ' days');
    }

    // Otherwise show months (one decimal while sliding, whole numbers on the milestones)
    const r = Math.round(m * 10) / 10;
    if (ar) { return 'خلال ' + (r === 1 ? 'شهر' : r === 2 ? 'شهرين' : r + ' أشهر'); }
    return 'In ' + r + (r === 1 ? ' month' : ' months');
  }

  function xAt(pos) { return X_LEFT + (pos / last) * (X_RIGHT - X_LEFT); }
  function yAt(value) { return Y_BOTTOM - (value / maxValue) * (Y_BOTTOM - Y_TOP); }

  // Builds the line from the start up to a position
  function pathUntil(pos) {
    const steps = Math.max(2, Math.ceil((pos / last) * 80));
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const p = pos * i / steps;
      d += (i === 0 ? 'M ' : ' L ') + xAt(p).toFixed(1) + ' ' + yAt(valueAt(p)).toFixed(1);
    }
    return d;
  }

  // The faint dashed "full journey" line + one dot for each milestone
  ghostEl.setAttribute('d', pathUntil(last));

  const marks = stops.map(function (value, i) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'gx-mark');
    circle.setAttribute('cx', xAt(i).toFixed(1));
    circle.setAttribute('cy', yAt(value).toFixed(1));
    circle.setAttribute('r', '3.5');
    marksG.appendChild(circle);
    return circle;
  });

  // Draws everything for one position
  function render(pos) {
    const value = valueAt(pos);
    const x = xAt(pos).toFixed(1);
    const y = yAt(value).toFixed(1);
    const d = pathUntil(pos);

    numEl.textContent = Math.round(value).toLocaleString('en-US');
    if (timeEl) { timeEl.textContent = timeText(pos); }
    lineEl.setAttribute('d', d);
    areaEl.setAttribute('d', d + ' L ' + x + ' ' + Y_FLOOR + ' L ' + X_LEFT + ' ' + Y_FLOOR + ' Z');
    dotEl.setAttribute('cx', x);
    dotEl.setAttribute('cy', y);
    ringEl.setAttribute('cx', x);
    ringEl.setAttribute('cy', y);

    marks.forEach(function (mark, i) { mark.classList.toggle('on', pos >= i - 0.001); });

    const capIndex = pos >= last - 0.001 ? last : Math.floor(pos);
    caps.forEach(function (cap, i) { cap.classList.toggle('active', i === capIndex); });
    chips.forEach(function (chip, i) { chip.classList.toggle('active', Math.abs(pos - i) < 0.05); });

    range.style.setProperty('--fill', (pos / last * 100).toFixed(1) + '%');
    gx.style.setProperty('--pf', (pos / last).toFixed(3));
  }

  // Moves the slider and redraws
  function setPos(sliderValue) {
    range.value = sliderValue;
    render(sliderValue / STEP);
  }

  // Stops any running animation (the visitor is in control now)
  let raf = 0;
  function stopAnimation() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  // Glides the slider to a target (used by the chips, Replay and the first auto-play).
  // "force" = animate even when the computer asks for reduced motion (used by Replay).
  function animateTo(target, duration, force) {
    stopAnimation();
    if (reduceMotion && !force) { setPos(target); return; }

    const from = Number(range.value);
    const time = duration || Math.max(500, Math.abs(target - from) * 7);
    const begin = performance.now();

    function frame(now) {
      const p = Math.min(Math.max((now - begin) / time, 0), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setPos(from + (target - from) * eased);
      if (p < 1) { raf = requestAnimationFrame(frame); } else { raf = 0; }
    }
    raf = requestAnimationFrame(frame);
  }

  // ----- Slider: dragging with a mouse, a finger or the keyboard -----
  function onSlide() {
    stopAnimation();
    render(Number(range.value) / STEP);
  }
  range.addEventListener('input', onSlide);
  range.addEventListener('change', onSlide);

  // The moment the visitor presses on the slider, any running animation stops
  range.addEventListener('pointerdown', stopAnimation);
  range.addEventListener('touchstart', stopAnimation, { passive: true });

  // ----- Milestone chips (one listener on the whole row) -----
  chipsBox.addEventListener('click', function (event) {
    const chip = event.target.closest('.gx-chip');
    if (!chip) { return; }
    const index = chips.indexOf(chip);
    if (index === -1) { return; }
    animateTo(index * STEP);
  });

  // ----- Replay: back to Day 1, then play the whole journey again (always animated) -----
  replayBtn.addEventListener('click', function () {
    stopAnimation();
    setPos(0);
    animateTo(last * STEP, 4500, true);

    // little spin on the icon so you can see the press worked
    replayBtn.classList.remove('spin');
    void replayBtn.offsetWidth;                // restarts the CSS animation
    replayBtn.classList.add('spin');
  });

  // When the language changes, redraw so the time pill is translated too
  langButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      render(Number(range.value) / STEP);
    });
  });

  // Start on the final state (so it still looks right if anything fails), then play the journey once when seen
  setPos(last * STEP);

  if (!reduceMotion) {
    const phoneObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        phoneObserver.disconnect();
        setPos(0);
        animateTo(last * STEP, 4500);
      }
    }, { threshold: 0.35 });
    phoneObserver.observe(phoneEl);
  }
} catch (error) { console.error('Phone failed:', error); }

// ---------- Experience ----------
try {
  const expTabs = document.querySelectorAll('.exp-tab');
  const expPanels = document.querySelectorAll('.exp-panel');
  const expChips = document.querySelectorAll('.exp-chip');
  const expUrl = document.querySelector('#exp-url');
  const expLayout = document.querySelector('.exp-layout');

  // Open one role: light up its tab and show its panel
  function showExp(tab) {
    expTabs.forEach(function (other) {
      other.classList.toggle('active', other === tab);
    });
    expPanels.forEach(function (panel) {
      panel.classList.toggle('active', panel.id === tab.dataset.exp);
    });
    if (expUrl) { expUrl.textContent = '~/experience/' + tab.dataset.file; }
  }

  // Only the tabs that are not hidden by the filter
  function visibleTabs() {
    return Array.from(expTabs).filter(function (tab) { return !tab.hidden; });
  }

  // Move to the next (+1) or previous (-1) visible role, looping around at the ends
  function stepExp(direction) {
    const list = visibleTabs();
    if (!list.length) { return; }
    const current = list.findIndex(function (tab) { return tab.classList.contains('active'); });
    const next = list[(current + direction + list.length) % list.length];
    showExp(next);
    next.focus({ preventScroll: true });
  }

  expTabs.forEach(function (tab) {
    tab.addEventListener('click', function () { showExp(tab); });
  });

  // Filter chips: hide the roles that don't match, and make sure an open role is still visible
  expChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const filter = chip.dataset.filter;

      expChips.forEach(function (other) { other.classList.remove('active'); });
      chip.classList.add('active');

      expTabs.forEach(function (tab) {
        tab.hidden = !(filter === 'all' || tab.dataset.type === filter);
      });

      const list = visibleTabs();
      const stillOpen = list.some(function (tab) { return tab.classList.contains('active'); });
      if (!stillOpen && list.length) {
        showExp(list[0]);
      }
    });
  });

  // Arrow buttons
  document.querySelector('#exp-prev').addEventListener('click', function () { stepExp(-1); });
  document.querySelector('#exp-next').addEventListener('click', function () { stepExp(1); });

  // Arrow keys work while you are inside the experience area...
  expLayout.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      stepExp(1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      stepExp(-1);
    }
  });

  // ...and left / right also work anywhere on the Experience page
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') { return; }
    if (event.target.closest('input, textarea, .exp-layout')) { return; }
    const here = document.querySelector('.nav_links a.active');
    if (!here || here.dataset.nav !== 'experience') { return; }
    stepExp(event.key === 'ArrowRight' ? 1 : -1);
  });
} catch (error) { console.error('Experience failed:', error); }

// ---------- Contact ----------
try {
  const toast = document.querySelector('#toast');
  const form = document.querySelector('#contact-form');
  const MY_EMAIL = 'georgeejbbr@gmail.com';
  const toastText = {
    en: { copied: 'Email copied to clipboard', failed: 'Could not copy. Select the address instead.' },
    ar: { copied: 'تم نسخ البريد الإلكتروني', failed: 'تعذّر النسخ. حدّد العنوان يدويًا.' }
  };

  function say(key) {
    const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    toast.textContent = toastText[lang][key];
    toast.classList.add('show');
    clearTimeout(say.timer);
    say.timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  // Copy my email with one click
  document.querySelector('#copy-email').addEventListener('click', function () {
    const address = this.querySelector('small').textContent.trim();
    navigator.clipboard.writeText(address)
      .then(function () { say('copied'); })
      .catch(function () { say('failed'); });
  });

  // Topic chips: pick one
  const topicButtons = document.querySelectorAll('.topic');
  topicButtons.forEach(function (chip) {
    chip.addEventListener('click', function () {
      topicButtons.forEach(function (other) { other.classList.remove('active'); });
      chip.classList.add('active');
    });
  });

  // Live character counter
  const messageBox = document.querySelector('#msg');
  const counter = document.querySelector('#msg-count');
  messageBox.addEventListener('input', function () {
    counter.textContent = messageBox.value.length;
  });

  // Check a field; the red message shows only on a field that is wrong
  function checkField(input) {
    const ok = input.type === 'email'
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
      : input.value.trim().length > 1;
    input.closest('.field').classList.toggle('invalid', !ok);
    return ok;
  }

  form.querySelectorAll('input, textarea').forEach(function (input) {
    input.addEventListener('blur', function () { checkField(input); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('invalid')) { checkField(input); }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const fields = Array.from(form.querySelectorAll('input, textarea'));
    const results = fields.map(checkField);          // check all of them (no early stop)
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) { firstBad.focus(); return; }

    form.classList.add('sending');

    // Opens the visitor's email app with the message already written, addressed to you.
    // (A plain website can't send email by itself. To send silently in the background instead,
    // swap this block for a fetch() to a form service such as Formspree or Web3Forms.)
    const activeTopic = document.querySelector('.topic.active');
    const topic = activeTopic ? (activeTopic.dataset.en || activeTopic.textContent.trim()) : 'Hello';
    const subject = 'Portfolio message: ' + topic;
    const text =
      'Name: ' + form.elements.name.value.trim() + '\n' +
      'Email: ' + form.elements.email.value.trim() + '\n\n' +
      form.elements.message.value.trim();

    window.location.href = 'mailto:' + MY_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(text);

    setTimeout(function () {
      form.classList.remove('sending');
      form.classList.add('done');
    }, 1200);
  });

  // "Send another" resets everything
  document.querySelector('#send-again').addEventListener('click', function () {
    form.reset();
    counter.textContent = '0';
    form.classList.remove('done');
    topicButtons.forEach(function (chip, i) { chip.classList.toggle('active', i === 0); });
  });
} catch (error) { console.error('Contact failed:', error); }