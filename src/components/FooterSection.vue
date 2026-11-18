<script setup>
import { MapPin, ExternalLink, Phone, Building2 } from 'lucide-vue-next';

defineProps({
  settings: { type: Object, default: () => ({}) }
});

const journalLinks = [
  {
    label: "PAI (Al'ulum Jurnal Pendidikan Islam)",
    href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum'
  },
  {
    label: 'PGMI (Journal of Research and Innovation in Madrasah Ibtidaiyah Education)',
    href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum'
  },
  {
    label: "PIAUD (Education Journal of Mamba'ul 'Ulum for Early Childhood Development)",
    href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum'
  }
];

const footerCtas = [
  {
    label: 'PMB Center',
    href: 'https://wa.link/agu1p5',
    classes: 'bg-amber-400 font-bold text-slate-900 hover:bg-amber-300'
  },
  {
    label: 'Admin Fakultas',
    href: 'https://wa.link/qrwv15',
    classes: 'border border-white/30 bg-white/10 font-semibold text-white hover:bg-white/20'
  }
];

const campusBadges = ['IIM', 'Tarbiyah', 'SIAKAD', 'EdLink'];

const mapsEmbedUrl =
  'https://maps.google.com/maps?ll=-7.584322,110.81806&z=13&t=m&hl=en-ID&gl=US&q=Jl.+Sadewa+No.14+Serengan+Kec.+Serengan+Kota+Surakarta,+Jawa+Tengah+57155&output=embed';
</script>

<template>
  <footer id="footer-cta" class="bg-brand-900 text-slate-200">
    <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-600 p-8 sm:p-12 shadow-float">
        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div class="lg:col-span-7 space-y-2">
            <h2 class="text-2xl font-extrabold text-white sm:text-3xl">
              {{ settings.footer_cta_title || 'Your Future Start Here!' }}
            </h2>
            <p class="text-sm text-brand-100 sm:text-base">
              {{
                settings.footer_cta_subtitle ||
                'Join more than 2,000 students who are developing the skills to become the educators and professionals of the future.'
              }}
            </p>
          </div>

          <div class="lg:col-span-5 flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a
              v-for="cta in footerCtas"
              :key="cta.label"
              :href="cta.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 text-sm transition"
              :class="cta.classes"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M12.03 2a9.94 9.94 0 0 0-8.46 15.16L2 22l4.98-1.52A9.95 9.95 0 1 0 12.03 2Zm0 18.14a8.18 8.18 0 0 1-4.17-1.14l-.3-.18-2.95.9.92-2.87-.2-.3a8.18 8.18 0 1 1 6.7 3.59Zm4.49-6.12c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.77-1.84-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.02 2.58c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
              </svg>
              <span>{{ cta.label }}</span>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-14 grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <div class="flex flex-col leading-tight">
            <span class="text-base font-extrabold text-white">Fakultas Tarbiyah</span>
            <span class="text-xs font-semibold text-slate-300">Institut Islam Mambaul Ulum Surakarta</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Website resmi Fakultas Tarbiyah yang berguna untuk memberikan informasi kepada seluruh mahasiswa, terutama untuk para mahasiswa Fakultas Tarbiyah IIM Surakarta.
          </p>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Alamat Kantor</h3>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li class="flex items-start gap-2">
              <Building2 class="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <span class="font-semibold text-slate-200">Gedung Kadtijo W.S - Kampus Pusat</span>
            </li>
            <li class="flex items-start gap-2">
              <MapPin class="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <span>Jl. Sadewa No.14, Serengan, Surakarta 57155, Jawa Tengah, Indonesia</span>
            </li>
            <li class="flex items-center gap-2">
              <Phone class="h-4 w-4 text-brand-400 shrink-0" />
              <span>Telp. : (0271) 633253</span>
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Jurnal</h3>
          <ul class="space-y-2.5 text-sm text-slate-400">
            <li v-for="journal in journalLinks" :key="journal.label">
              <a
                :href="journal.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-start gap-1.5 hover:text-white transition"
              >
                <span>{{ journal.label }}</span>
                <ExternalLink class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Lokasi Kampus</h3>
          <div class="overflow-hidden rounded-xl border border-white/20 bg-white shadow-sm">
            <iframe
              title="Peta Lokasi Kampus Fakultas Tarbiyah IIM Surakarta"
              :src="mapsEmbedUrl"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              class="block h-36 w-full border-0"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="text-xs text-slate-400">
          © {{ new Date().getFullYear() }} Fakultas Tarbiyah, Institut Islam Mambaul Ulum Surakarta. All rights reserved.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="badge in campusBadges"
            :key="badge"
            class="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300"
          >
            {{ badge }}
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
