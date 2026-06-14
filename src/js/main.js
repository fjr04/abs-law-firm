
document.getElementById('year').textContent = new Date().getFullYear();

// Reveal Animation
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));
} else {
    revealElements.forEach(el => el.classList.add('active'));
}

window.addEventListener('load', () => {
    setTimeout(() => revealElements.forEach(el => el.classList.add('active')), 650);
});

// Navbar + Mobile Menu V3 style
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobile-menu');
const btn = document.getElementById('mobile-menu-btn');
const mobileLinks = document.querySelectorAll('.mobile-link');

function updateNavStyle() {
    if (!navbar || !mobileMenu) return;
    const isScrolled = window.scrollY > 50;
    const isMenuOpen = !mobileMenu.classList.contains('hidden');

    if (isScrolled || isMenuOpen) {
        navbar.classList.add('scrolled-nav', 'glass-effect');
        navbar.classList.remove('transparent-nav');
    } else {
        navbar.classList.remove('scrolled-nav', 'glass-effect');
        navbar.classList.add('transparent-nav');
    }
}

let navTicking = false;
window.addEventListener('scroll', () => {
    if (!navTicking) {
        window.requestAnimationFrame(() => {
            updateNavStyle();
            navTicking = false;
        });
        navTicking = true;
    }
}, { passive: true });

if (btn && mobileMenu) {
    btn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
        updateNavStyle();
    });
}

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (!mobileMenu || !btn) return;
        mobileMenu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        updateNavStyle();
    });
});

updateNavStyle();

// Smooth Anchor Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Activity rail - ringan tanpa library/autoplay
const activityRail = document.querySelector('[data-activity-rail]');
const activityPrev = document.querySelector('[data-activity-prev]');
const activityNext = document.querySelector('[data-activity-next]');

if (activityRail && activityPrev && activityNext) {
    const scrollActivity = (direction) => {
        const amount = Math.max(280, activityRail.clientWidth * 0.78);
        activityRail.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };
    activityPrev.addEventListener('click', () => scrollActivity(-1));
    activityNext.addEventListener('click', () => scrollActivity(1));
}

// Dynamic profile modal style V4
const profileData = {
    andi: {
        role: 'Pengacara / Managing Partner',
        title: 'Andi Baroar Nasution, S.H., M.H.',
        items: [
            'Pernah bergabung pada Nugraha Kurnia Purwito & Partners sebagai Associate pada tahun 2006 sampai dengan 2007.',
            'Pernah bergabung pada Law Office D.I Nugraha & Partners sebagai Para Legal tahun 2007 sampai dengan 2008.',
            'Pernah sebagai Manager Partners pada AFA Law Firm & Lembaga Bantuan Hukum pada tahun 2008 sampai dengan 2009.',
            'Pada tahun 2009 mendapatkan Lisensi Advokat dari Kongres Advokat Indonesia.',
            'Pernah bergabung di Lembaga Bantuan Hukum Anak Negeri sebagai Partner pada tahun 2010 sampai dengan 2013.',
            'Menjabat sebagai Sekretaris Jenderal Asosiasi Pengacara Pengadaan Barang dan Jasa Indonesia pada tahun 2015.',
            'Menjabat sebagai ketua bidang hukum perdata LPPH di MPW Pemuda Pancasila dari tahun 2017 sampai 2022.',
            'Tahun 2019 menjadi Kuasa Hukum PT. Tri Sakti Lautan Mas sebagai Tergugat di Pengadilan Negeri Batam.',
            'Tahun 2022 menjadi Kuasa Hukum PT. Araya Prima di Surabaya dalam Laporan Polisi di Polda Jatim.',
            'Pada tahun 2016 mendirikan Andi Baroar Sakti Law Office.',
            'Tahun 2023 s/d 2024 sebagai Konsultan Hukum di PT. Duta Wijaya Elektrindo Engineering.'
        ]
    },
    iskandar: {
        role: 'Pengacara',
        title: 'H. Achmad Iskandar, S.H.',
        items: ['Pengacara berlisensi resmi dari PERADI yang tergabung dan memberikan dedikasi tinggi pada penyelesaian kasus litigasi dan non-litigasi di Andi Baroar Sakti Law Office.']
    },
    adam: {
        role: 'Pengacara',
        title: 'Adam Suwahyo, S.H., M.H.',
        items: [
            'Sekretaris Lembaga Bantuan Hukum & Advokasi Publik Pimpinan Daerah Muhammadiyah Kabupaten Bogor periode 2022-2027.',
            'Anggota Majelis Hukum dan HAM PCM Cileungsi periode 2022-2027.',
            'Ketua Program Studi Hukum Universitas Muhammadiyah Cileungsi periode 2024-2028.'
        ]
    },
    widi: {
        role: 'Pengacara',
        title: 'Widi Faris Fauzan, S.H., M.H.',
        items: [
            'Pernah bekerja di PT. Indomarco Prismatama sebagai bagian dari divisi Finance.',
            'Pernah bekerja di PT. Asjaya Mukti Graha sebagai bagian dari divisi Purchasing.',
            'Magang di Kementerian Hukum dan HAM RI sebagai Asisten Analis pada Subdit Badan Hukum Perseroan Terbatas Terbuka.',
            'Menangani penyelesaian sengketa hubungan kerja secara non-litigasi di berbagai perusahaan.',
            'Memenangkan kasus di Pengadilan Hubungan Industrial pada PN Serang dan PN Padang.'
        ]
    },
    caryo: {
        role: 'Staff Legal',
        title: 'Caryo Saputra, S.H.',
        items: [
            'Asisten Dosen Universitas Pancasila dan STIH Adhyaksa periode 2022-2024.',
            'Wakil Sekretaris Jenderal LBH Nusantara Bersinar Keadilan periode 2024-2028.',
            'Staff Legal Andi Baroar Sakti Law Office periode 2024-2028.'
        ]
    },
    fatha: {
        role: 'Kabid Infokom LBH NBK',
        title: 'M. Fatha A. Zukhrian, S.H.',
        items: [
            'Menjabat sebagai Kepala Bidang Informasi dan Komunikasi LBH NBK.',
            'Profesional di bidang penyusunan dokumen.'
        ]
    },
    fauzul: {
        role: 'Kabid Humas LBH NBK',
        title: 'Moch Fauzul Mukhlisin, S.H.',
        items: [
            'Menjabat sebagai Kepala Bidang Hubungan Masyarakat LBH NBK.',
            'Profesional di bidang penyusunan dokumen.'
        ]
    },
    ali: {
        role: 'Staff Legal LBH NBK',
        title: 'Ali Arifin Nasution, S.H.',
        items: [
            'Menjabat sebagai Staff Legal LBH NBK.',
            'Profesional di bidang konsultasi hukum.'
        ]
    }
};

const profileModal = document.getElementById('profileModal');
const profileTitle = document.getElementById('profileTitle');
const profileRole = document.getElementById('profileRole');
const profileBody = document.getElementById('profileBody');
const closeProfileButton = document.querySelector('[data-close-profile]');
const teamCards = document.querySelectorAll('[data-profile]');
let lastFocusedElement = null;

function openProfile(profileKey) {
    const profile = profileData[profileKey];
    if (!profile || !profileModal || !profileTitle || !profileRole || !profileBody) return;
    lastFocusedElement = document.activeElement;
    profileTitle.textContent = profile.title;
    profileRole.textContent = profile.role;
    profileBody.innerHTML = profile.items.map(item => `<p>${item}</p>`).join('');
    profileModal.classList.add('open');
    profileModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeProfileButton?.focus();
}

function closeProfile() {
    if (!profileModal) return;
    profileModal.classList.remove('open');
    profileModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
}

teamCards.forEach(card => card.addEventListener('click', () => openProfile(card.dataset.profile)));
closeProfileButton?.addEventListener('click', closeProfile);
profileModal?.addEventListener('click', event => {
    if (event.target === profileModal) closeProfile();
});

// Custom Alert Popup compatible dengan style lama
function showCustomAlert(title, message, isSuccess = true) {
    const modal = document.getElementById('customAlert');
    const alertBox = document.getElementById('alertBox');
    const iconContainer = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const btnTutup = document.getElementById('alertBtn');
    if (!modal || !alertBox || !alertTitle || !alertMessage || !btnTutup) return;

    alertTitle.innerText = title;
    alertMessage.innerText = message;

    if (iconContainer) {
        iconContainer.innerHTML = isSuccess
            ? '<span class="alert-state-icon alert-state-success">✓</span>'
            : '<span class="alert-state-icon alert-state-error">!</span>';
    }

    btnTutup.className = isSuccess
        ? 'w-full py-3.5 rounded-full text-[#040b16] font-bold tracking-widest uppercase text-[10px] btn-gold transition-colors'
        : 'w-full py-3.5 rounded-full text-white font-bold tracking-widest uppercase text-[10px] bg-red-600 hover:bg-red-700 transition-colors';

    modal.classList.remove('opacity-0', 'invisible');
    modal.setAttribute('aria-hidden', 'false');
    alertBox.classList.remove('scale-95');
}

function closeCustomAlert() {
    const modal = document.getElementById('customAlert');
    const alertBox = document.getElementById('alertBox');
    if (!modal || !alertBox) return;
    modal.classList.add('opacity-0', 'invisible');
    modal.setAttribute('aria-hidden', 'true');
    alertBox.classList.add('scale-95');
}

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeProfile();
        closeCustomAlert();
    }
});

// Form Email via Vercel Function + Resend
const contactForm = document.getElementById('contactForm');
const contactFormStartedAt = Date.now();
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const btnSubmit = document.getElementById('btnSubmitEmail');
        const name = document.getElementById('name')?.value || '';
        const originalText = btnSubmit?.innerHTML || 'KIRIM PESAN EMAIL';

        const emailValue = document.getElementById('email')?.value.trim() || '';
        const subjectValue = document.getElementById('subject')?.value.trim() || '';
        const messageValue = document.getElementById('message')?.value.trim() || '';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim() || !emailValue || !subjectValue || !messageValue) {
            showCustomAlert('Formulir Belum Lengkap', 'Harap isi Nama, Email, Subjek, dan Deskripsi Singkat terlebih dahulu.', false);
            return;
        }

        if (!emailPattern.test(emailValue)) {
            showCustomAlert('Email Tidak Valid', 'Harap masukkan alamat email yang benar sebelum mengirim pesan.', false);
            return;
        }

        if (btnSubmit) {
            btnSubmit.innerHTML = 'MENGIRIM...';
            btnSubmit.disabled = true;
        }

        try {
            const payload = {
                name: name.trim(),
                email: emailValue,
                subject: subjectValue,
                message: messageValue,
                company_website: document.getElementById('company_website')?.value || '',
                form_started_at: contactFormStartedAt,
                page: window.location.href
            };

            const response = await fetch(form.action, {
                method: form.method || 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            let result = {};
            try {
                result = await response.json();
            } catch (_) {}

            if (response.ok && result.ok) {
                showCustomAlert('Pesan Terkirim!', `Terima kasih, Bapak/Ibu ${name}. Permohonan konsultasi Anda telah masuk ke sistem ABS Law Office. Representatif kami akan merespons dalam 1x24 jam.`, true);
                form.reset();
            } else {
                showCustomAlert('Gagal Mengirim', result.message || 'Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi beberapa saat lagi.', false);
            }
        } catch (error) {
            showCustomAlert('Koneksi Bermasalah', 'Terjadi kesalahan jaringan saat mencoba mengirim pesan. Silakan coba lagi beberapa saat lagi.', false);
        } finally {
            if (btnSubmit) {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        }
    });
}


function sendToWA() {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const subject = document.getElementById('subject')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !subject || !message) {
        showCustomAlert('Formulir Belum Lengkap', 'Harap isi Nama, Email, Subjek, dan Pesan Anda sebelum melanjutkan konsultasi via WhatsApp.', false);
        return;
    }

    const textWA = encodeURIComponent(`Halo ABS Law Office,\n\nPerkenalkan, nama saya: ${name}\nEmail: ${email}\nTerkait keperluan: ${subject}\n\n${message}`);
    window.open(`https://wa.me/6285280048234?text=${textWA}`, '_blank', 'noopener,noreferrer');
}

window.showCustomAlert = showCustomAlert;
window.closeCustomAlert = closeCustomAlert;
window.sendToWA = sendToWA;

// V8 scroll micro-animations: ringan, hanya opacity + translate kecil
(() => {
    const selectors = [
        '.problem-chip',
        '.service-card',
        '.process-step',
        '.activity-card',
        '.team-profile-card',
        '.trust-strip',
        '.contact-end-list > div',
        '.contact-field',
        '.contact-btn',
        '.section-kicker',
        '.section-title',
        '.section-subtitle',
        '#tentang h4',
        '#tentang h2',
        '#tentang .about-card',
        '#tentang .about-classic-copy',
        '#layanan > .container > .text-center h4',
        '#layanan > .container > .text-center h2',
        '#layanan > .container > .text-center p',
        '.service-heading',
        '.activity-heading h2',
        '.activity-heading p',
        '.activity-heading .section-kicker',
        '.contact-end-title',
        '.contact-end-eyebrow',
        '.contact-end-list h3',
        '.contact-end-list p'
    ];

    const motionTargets = document.querySelectorAll(selectors.join(','));
    motionTargets.forEach(el => el.classList.add('motion-item'));

    if (!('IntersectionObserver' in window)) {
        motionTargets.forEach(el => el.classList.add('active'));
        return;
    }

    const motionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
    });

    motionTargets.forEach(el => motionObserver.observe(el));
})();

// V9 service filter - ringan, tidak render ulang DOM
(() => {
    const filterButtons = document.querySelectorAll('[data-service-filter]');
    const serviceCards = document.querySelectorAll('[data-service-category]');
    const serviceGroups = document.querySelectorAll('[data-service-group]');

    if (!filterButtons.length || !serviceCards.length) return;

    const applyFilter = (filter) => {
        filterButtons.forEach(button => {
            const isActive = button.dataset.serviceFilter === filter;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        serviceCards.forEach(card => {
            const shouldShow = filter === 'all' || card.dataset.serviceCategory === filter;
            card.classList.toggle('is-hidden', !shouldShow);
        });

        serviceGroups.forEach(group => {
            const visibleCards = group.querySelectorAll('[data-service-category]:not(.is-hidden)').length;
            group.classList.toggle('is-hidden', visibleCards === 0);
        });
    };

    filterButtons.forEach(button => {
        button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
        button.addEventListener('click', () => applyFilter(button.dataset.serviceFilter || 'all'));
    });
})();
