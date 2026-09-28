// Shared data, demo session, role gating and header/footer logic for the split LaunchPad pages.
// Loaded before dc-runtime, so it only defines window.OTU; each page's Component calls into it.
;(function () {
  const BLUE = '#00417A'
  const ORANGE = '#e2572a'
  const REPO_URL = 'https://github.com/gdg-otu/launchpad'
  const DISCORD_URL = 'https://discord.gg/your-invite'
  const SPRINT_DEADLINE = new Date('2026-10-04T23:59:00').getTime()

  function art(a, b, kind) {
    const w = 'rgba(255,255,255,.3)'
    const block = (c) => `linear-gradient(${c} 0 0)`
    const shapes = {
      orbit: [{ img: `radial-gradient(circle at 26% 30%, ${b} 0 12%, transparent 13%)` }, { img: `radial-gradient(circle at 72% 64%, rgba(255,255,255,.22) 0 22%, transparent 23%)` }],
      bars: [
        { img: block(b), size: '9% 26%', pos: '14% 86%' },
        { img: block(w), size: '9% 46%', pos: '32% 86%' },
        { img: block(b), size: '9% 34%', pos: '50% 86%' },
        { img: block(w), size: '9% 58%', pos: '68% 86%' },
      ],
      arc: [{ img: `radial-gradient(circle at 50% 118%, transparent 0 34%, ${b} 34.5% 39%, transparent 40%)` }, { img: `radial-gradient(circle at 50% 118%, transparent 0 52%, rgba(255,255,255,.28) 52.5% 56%, transparent 57%)` }],
      nodes: [{ img: `radial-gradient(circle at 22% 26%, rgba(255,255,255,.34) 0 6%, transparent 7%)` }, { img: `radial-gradient(circle at 62% 22%, ${b} 0 5%, transparent 6%)` }, { img: `radial-gradient(circle at 78% 70%, rgba(255,255,255,.3) 0 7%, transparent 8%)` }, { img: `radial-gradient(circle at 36% 74%, ${b} 0 4%, transparent 5%)` }],
      stack: [
        { img: block(b), size: '62% 8%', pos: '18% 28%' },
        { img: block(w), size: '46% 8%', pos: '18% 50%' },
        { img: block(b), size: '28% 8%', pos: '18% 72%' },
      ],
      wave: [{ img: `radial-gradient(circle at 10% 90%, rgba(255,255,255,.3) 0 30%, transparent 31%)` }, { img: `radial-gradient(circle at 90% 10%, ${b} 0 26%, transparent 27%)` }],
    }
    const L = shapes[kind] || shapes.orbit
    const imgs = L.map((l) => l.img).concat(['linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px)', 'linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)', `linear-gradient(135deg,${a} 0%, ${a} 55%, rgba(0,0,0,.22) 100%)`])
    const sizes = L.map((l) => l.size || 'auto').concat(['26px 26px', '26px 26px', 'auto'])
    const poss = L.map((l) => l.pos || '0 0').concat(['0 0', '0 0', '0 0'])
    const reps = L.map(() => 'no-repeat').concat(['repeat', 'repeat', 'no-repeat'])
    return `position:absolute;inset:0;background-color:${a};background-image:${imgs.join(',')};background-size:${sizes.join(',')};background-position:${poss.join(',')};background-repeat:${reps.join(',')}`
  }

  const PROJECTS = [
    { slug: 'campus-nav-ar', title: 'Campus Nav AR', blurb: 'Augmented reality navigation built for the OTU campus.', tags: ['React', 'Python', 'AR'], votes: 142, open: true, featured: true, cat: 'Mobile', program: 'Computer Science', year: 'Year 3', sem: 'Fall 2026', student: 'aisha-rahman', a: BLUE, b: '#FFB893', kind: 'nodes', artLabel: 'AR WAYFINDING OVERLAY' },
    { slug: 'gridwatch', title: 'GridWatch', blurb: 'Live dashboard for Ontario electricity demand and carbon intensity.', tags: ['Next.js', 'TimescaleDB', 'D3'], votes: 118, open: false, featured: true, cat: 'Data', program: 'Electrical Engineering', year: 'Year 4', sem: 'Fall 2026', student: 'marcus-oyelaran', a: '#12395C', b: ORANGE, kind: 'bars', artLabel: 'DEMAND · 24H WINDOW' },
    { slug: 'labqueue', title: 'LabQueue', blurb: 'Queue system that replaced the sign-up sheet outside the ENG labs.', tags: ['Svelte', 'Go', 'Postgres'], votes: 96, open: true, featured: true, cat: 'Web', program: 'Software Engineering', year: 'Year 2', sem: 'Fall 2026', student: 'priya-nandakumar', a: '#0C4F78', b: '#FFD2BC', kind: 'stack', artLabel: 'QUEUE STATE MACHINE' },
    { slug: 'rover-sim', title: 'Rover Sim', blurb: 'Physics sandbox for testing rover suspension over simulated terrain.', tags: ['C++', 'OpenGL', 'ROS'], votes: 87, open: true, featured: false, cat: 'Simulation', program: 'Mechatronics Engineering', year: 'Year 4', sem: 'Spring 2026', student: 'daniel-kovac', a: '#1B3A52', b: ORANGE, kind: 'arc', artLabel: 'SUSPENSION TRAVEL TEST' },
    { slug: 'notecrate', title: 'Notecrate', blurb: 'Shared course notes with version history and citation checking.', tags: ['Vue', 'Rust', 'SQLite'], votes: 74, open: false, featured: false, cat: 'Web', program: 'Computer Science', year: 'Year 3', sem: 'Spring 2026', student: 'aisha-rahman', a: BLUE, b: '#9EC7E8', kind: 'stack', artLabel: 'REVISION GRAPH' },
    { slug: 'thermalcam', title: 'ThermalCam', blurb: 'Low-cost thermal imaging rig for building envelope inspections.', tags: ['Python', 'OpenCV', 'Arduino'], votes: 68, open: true, featured: false, cat: 'Hardware', program: 'Electrical Engineering', year: 'Year 4', sem: 'Fall 2025', student: 'marcus-oyelaran', a: '#7A2E12', b: '#FFC79B', kind: 'wave', artLabel: 'THERMAL GRADIENT MAP' },
    { slug: 'shiftly', title: 'Shiftly', blurb: 'Shift-swapping app for students working campus jobs.', tags: ['React Native', 'Firebase'], votes: 61, open: true, featured: false, cat: 'Mobile', program: 'Software Engineering', year: 'Year 2', sem: 'Fall 2025', student: 'priya-nandakumar', a: '#0E4E63', b: '#FFB893', kind: 'orbit', artLabel: 'SHIFT SWAP FLOW' },
    { slug: 'trainsight', title: 'TrainSight', blurb: 'Computer vision model that flags defects on freight rail bogies.', tags: ['PyTorch', 'FastAPI'], votes: 53, open: false, featured: false, cat: 'ML', program: 'Computer Science', year: 'Year 4', sem: 'Spring 2025', student: 'daniel-kovac', a: '#22304A', b: ORANGE, kind: 'nodes', artLabel: 'DEFECT CONFIDENCE MAP' },
    { slug: 'pitchdeck-tutor', title: 'Pitch Tutor', blurb: 'Practice tool that scores delivery pacing for capstone presentations.', tags: ['Whisper', 'Next.js'], votes: 44, open: true, featured: false, cat: 'Web', program: 'Business & IT', year: 'Year 3', sem: 'Spring 2025', student: 'lena-fitzgerald', a: '#2A4A3C', b: '#FFD2BC', kind: 'wave', artLabel: 'PACING WAVEFORM' },
  ]

  const STUDENTS = {
    'aisha-rahman': { name: 'Aisha Rahman', program: 'Computer Science', year: 3, skills: ['React', 'Python', 'Computer Vision'], bio: 'Third-year CS student working mostly on spatial computing. I like problems where the interface has to understand the room it is in.', building: 'AI-powered course planning platform' },
    'marcus-oyelaran': { name: 'Marcus Oyelaran', program: 'Electrical Engineering', year: 4, skills: ['Embedded C', 'Data Viz', 'Hardware'], bio: 'Energy systems and instrumentation. Most of my projects start because a piece of equipment I needed cost more than my tuition.', building: 'Open-source power quality logger' },
    'priya-nandakumar': { name: 'Priya Nandakumar', program: 'Software Engineering', year: 2, skills: ['Svelte', 'Go', 'Postgres'], bio: 'I build small tools that remove small frictions on campus. Two of them are now used by actual staff, which still surprises me.', building: 'Campus room booking rewrite' },
    'daniel-kovac': { name: 'Daniel Kovac', program: 'Mechatronics Engineering', year: 4, skills: ['C++', 'ROS', 'Simulation'], bio: 'Robotics and simulation. Currently on the Ontario Tech rover team, mostly on the controls side.', building: 'Terrain classifier for the rover team' },
    'lena-fitzgerald': { name: 'Lena Fitzgerald', program: 'Business & IT', year: 3, skills: ['Product', 'Figma', 'Next.js'], bio: 'I sit between design and code. Interested in tools that make people less nervous about presenting their work.', building: 'Interview prep platform for co-op students' },
  }

  const ME = { key: 'aisha-rahman', first: 'Aisha', initials: 'AR', email: 'aisha.rahman@ontariotechu.net' }

  const NOTIFICATIONS = [
    { title: 'Campus Nav AR was approved', body: 'Your project is now public.', when: '2 HOURS AGO' },
    { title: 'Marcus Oyelaran upvoted Campus Nav AR', body: 'You have 142 upvotes total.', when: 'YESTERDAY' },
    { title: 'Collaboration request on LabQueue', body: 'Priya wants to help with routing.', when: '2 DAYS AGO' },
    { title: 'Fall 2026 Sprint starts in 14 days', body: 'Build for Campus · registration open.', when: '3 DAYS AGO' },
  ]

  const PAGES = {
    home: 'index.html', projects: 'projects.html', detail: 'project.html', students: 'students.html',
    profile: 'profile.html', sprints: 'sprints.html', submit: 'submit.html', dashboard: 'dashboard.html',
    admin: 'admin.html', about: 'about.html', contribute: 'contribute.html', login: 'login.html',
    signup: 'signup.html', settings: 'settings.html',
  }

  const ROLES = ['student', 'moderator', 'admin']
  const STAFF_ROLES = ['moderator', 'admin']
  const SESSION_KEY = 'otu-demo-session'
  const FLASH_KEY = 'otu-flash'

  function read(store, key) {
    try {
      return JSON.parse(store.getItem(key))
    } catch {
      return null
    }
  }

  function write(store, key, value) {
    try {
      if (value == null) store.removeItem(key)
      else store.setItem(key, JSON.stringify(value))
    } catch {}
  }

  function session() {
    const s = read(localStorage, SESSION_KEY)
    return s && ROLES.includes(s.role) ? s : null
  }

  function isStaff() {
    const s = session()
    return !!s && STAFF_ROLES.includes(s.role)
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name)
  }

  function href(route, params) {
    const query = params ? new URLSearchParams(params).toString() : ''
    return PAGES[route] + (query ? '?' + query : '')
  }

  function go(route, params) {
    location.href = href(route, params)
  }

  function here() {
    return location.pathname.split('/').pop() + location.search
  }

  function loginHref() {
    return href('login', { next: here() })
  }

  // Only same-folder page names are accepted, so ?next= cannot bounce a visitor to another site.
  function safeNext(next) {
    const ok = next && /^[a-z]+\.html(\?[\w=&%.-]*)?$/.test(next) && !/^(login|signup)\./.test(next)
    return ok ? next : PAGES.dashboard
  }

  function flashNext(msg) {
    write(sessionStorage, FLASH_KEY, msg)
  }

  function signIn(role, msg) {
    write(localStorage, SESSION_KEY, { role: ROLES.includes(role) ? role : 'student' })
    flashNext(msg || 'Signed in as ' + ME.email)
    location.href = safeNext(param('next'))
  }

  function signOut() {
    write(localStorage, SESSION_KEY, null)
    flashNext('Signed out')
    go('home')
  }

  // Runs in <head> before anything renders, so a gated page never flashes or shows a denial panel.
  // Demo only: real role checks happen on the server for every request.
  function guard(need) {
    const blocked = need === 'staff' ? !isStaff() : !session()
    if (!blocked) return
    document.documentElement.style.display = 'none'
    location.replace(need === 'staff' ? PAGES.home : loginHref())
  }

  function requireLogin() {
    location.href = loginHref()
  }

  function state(extra) {
    return Object.assign(
      { menuOpen: false, notifsOpen: false, sheetOpen: false, isMobile: false, heroTier: 'full', toast: null, now: Date.now(), votes: {}, popped: null },
      extra || {},
    )
  }

  function flash(self, msg) {
    self.setState({ toast: msg })
    clearTimeout(self._toastT)
    self._toastT = setTimeout(() => self.setState({ toast: null }), 2600)
  }

  function motion(self) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!self._mm) {
      self._mm = (e) => {
        if (self._raf) return
        self._raf = requestAnimationFrame(() => {
          self._raf = null
          const dx = e.clientX / window.innerWidth - 0.5
          const dy = e.clientY / window.innerHeight - 0.5
          document.querySelectorAll('[data-par]').forEach((el) => {
            const d = parseFloat(el.getAttribute('data-par')) || 10
            const base = el.getAttribute('data-par-base') || ''
            el.style.transform = base + ' translate3d(' + (-dx * d).toFixed(1) + 'px,' + (-dy * d).toFixed(1) + 'px,0)'
          })
        })
      }
      window.addEventListener('mousemove', self._mm, { passive: true })
    }
    if (!self._io) {
      self._io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return
            en.target.style.opacity = '1'
            en.target.style.transform = 'none'
            self._io.unobserve(en.target)
          })
        },
        { rootMargin: '0px 0px -8% 0px' },
      )
    }
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.dataset.revealDone) return
      el.dataset.revealDone = '1'
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(18px)'
        el.style.transition = 'opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1)'
      }
      self._io.observe(el)
    })
  }

  function mount(self, opts) {
    if (opts && opts.tick) self._tick = setInterval(() => self.setState({ now: Date.now() }), 1000)
    self._rs = () => {
      const w = window.innerWidth
      const mobile = w < 860
      const tier = w >= 1200 ? 'full' : mobile ? 'mob' : 'mid'
      if (mobile !== self.state.isMobile) self.setState({ isMobile: mobile, sheetOpen: false })
      if (tier !== self.state.heroTier) self.setState({ heroTier: tier })
    }
    self._rs()
    window.addEventListener('resize', self._rs, { passive: true })
    const pending = read(sessionStorage, FLASH_KEY)
    if (pending) {
      write(sessionStorage, FLASH_KEY, null)
      flash(self, pending)
    }
    motion(self)
  }

  function unmount(self) {
    clearInterval(self._tick)
    clearTimeout(self._toastT)
    window.removeEventListener('resize', self._rs)
    if (self._mm) window.removeEventListener('mousemove', self._mm)
    if (self._io) self._io.disconnect()
  }

  function toggleVote(self, slug) {
    if (!session()) return requireLogin()
    const votes = Object.assign({}, self.state.votes)
    votes[slug] = !votes[slug]
    self.setState({ votes, popped: slug })
    setTimeout(() => self.setState({ popped: null }), 420)
  }

  function initials(name) {
    return name.split(' ').map((x) => x[0]).join('')
  }

  function decorate(self, p) {
    const voted = !!self.state.votes[p.slug]
    const author = STUDENTS[p.student]
    return Object.assign({}, p, {
      art: art(p.a, p.b, p.kind),
      tagline: p.tags.join(' · '),
      votes: p.votes + (voted ? 1 : 0),
      voted,
      open2: p.open,
      voteBg: voted ? '#FDEFE9' : '#fff',
      voteFg: voted ? '#A83B15' : '#3D4855',
      voteBorder: voted ? '#E2572A' : '#E6E4DE',
      voteAnim: self.state.popped === p.slug ? 'display:inline-block;animation:otuPop .4s ease-out' : 'display:inline-block',
      voteLabel: (voted ? 'Remove upvote from ' : 'Upvote ') + p.title,
      openLabel: 'Open ' + p.title,
      author: { name: author.name, initials: initials(author.name), program: author.program, year: author.year },
      open: () => go('detail', { slug: p.slug }),
      openAuthor: () => go('profile', { student: p.student }),
      vote: () => toggleVote(self, p.slug),
    })
  }

  function sprintLeft(now) {
    return Math.max(0, Math.ceil((SPRINT_DEADLINE - now) / 86400000)) + 'D LEFT'
  }

  const NAV = [
    ['Semester Sprints', 'sprints'],
    ['About', 'about'],
    ['Projects', 'projects'],
    ['Contribute', 'contribute'],
  ]

  function external(url) {
    return () => window.open(url, '_blank', 'noopener')
  }

  function chrome(self, active) {
    const s = self.state
    const me = session()
    const menu = [
      ['Dashboard', 'dashboard'],
      ['My profile', 'profile'],
      ['Submit a project', 'submit'],
      ['Settings', 'settings'],
    ]
    if (isStaff()) menu.push(['Admin', 'admin'])
    const goSubmit = () => (me ? go('submit') : requireLogin())

    return {
      navItems: NAV.map(([label, route]) => {
        const on = route === active || (route === 'projects' && active === 'detail')
        return {
          label,
          current: on ? 'page' : 'false',
          fg: on ? BLUE : '#3D4855',
          bar: 'display:block;height:2px;margin-top:6px;border-radius:2px;background:' + (on ? BLUE : 'transparent'),
          go: () => go(route),
        }
      }),
      desktopNav: !s.isMobile,
      mobileNav: !!s.isMobile,
      secGrid: s.isMobile
        ? 'display:grid;grid-template-columns:minmax(0,1fr);gap:14px'
        : 'display:grid;grid-template-columns:minmax(0,190px) minmax(0,1fr);gap:40px',
      sheetOpen: !!s.sheetOpen,
      sheetVisible: !!(s.isMobile && s.sheetOpen),
      sheetAria: s.sheetOpen ? 'Close menu' : 'Open menu',
      sheetIcon: s.sheetOpen ? 'M4 4l10 10M14 4L4 14' : 'M2 5h14M2 9h14M2 13h14',
      toggleSheet: () => self.setState({ sheetOpen: !s.sheetOpen, menuOpen: false, notifsOpen: false }),
      closeSheet: () => self.setState({ sheetOpen: false }),

      goHome: () => go('home'),
      goProjects: () => go('projects'),
      goSprints: () => go('sprints'),
      goStudents: () => go('students'),
      goContribute: () => go('contribute'),
      goAbout: () => go('about'),
      goSettings: () => go('settings'),
      goLogin: () => go('login'),
      goSignup: () => go('signup'),
      goSubmit,
      focusSearch: () => {
        const el = document.getElementById('otu-search')
        if (el) el.focus()
        else go('projects', { focus: 'search' })
      },

      loggedIn: !!me,
      loggedOut: !me,
      openLogin: () => (location.href = loginHref()),
      meInitials: ME.initials,
      meFirst: ME.first,
      meRole: me ? me.role : 'guest',
      menuOpen: s.menuOpen,
      notifsOpen: s.notifsOpen,
      notifCount: NOTIFICATIONS.length,
      toggleMenu: () => self.setState({ menuOpen: !s.menuOpen, notifsOpen: false }),
      toggleNotifs: () => self.setState({ notifsOpen: !s.notifsOpen, menuOpen: false }),
      menuItems: menu.map(([label, route]) => ({ label, go: () => go(route) })),
      signOut,
      notifications: NOTIFICATIONS,

      footerCols: [
        { title: 'PLATFORM', links: [['Projects', () => go('projects')], ['Students', () => go('students')], ['Semester Sprints', () => go('sprints')], ['About', () => go('about')]] },
        { title: 'COMMUNITY', links: [['Submit Project', goSubmit], ['Contribute', () => go('contribute')], ['Guidelines', () => go('about')], ['Report an Issue', external(REPO_URL + '/issues')]] },
        { title: 'CONNECT', links: [['GitHub', external(REPO_URL)], ['Discord', external(DISCORD_URL)]] },
      ].map((c) => ({ title: c.title, links: c.links.map(([label, fn]) => ({ label, go: fn })) })),

      toast: s.toast,
      toastVisible: !!s.toast,
    }
  }

  window.OTU = {
    BLUE, ORANGE, REPO_URL, DISCORD_URL, SPRINT_DEADLINE, PROJECTS, STUDENTS, ME, ROLES, STAFF_ROLES,
    art, initials, param, href, go, session, isStaff, signIn, signOut, guard, requireLogin, flashNext,
    state, mount, unmount, motion, flash, decorate, sprintLeft, chrome, external,
  }
})()
