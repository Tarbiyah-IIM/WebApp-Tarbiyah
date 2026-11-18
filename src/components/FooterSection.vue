<script setup>
import { MapPin, ArrowRight, ExternalLink, Phone, Building2 } from 'lucide-vue-next';
import ftarLogo from '../assets/ftar-logo.png';

defineProps({
  settings: { type: Object, default: () => ({}) }
});

const journalLinks = [
  { label: 'PAI', href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum' },
  { label: 'PGMI', href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum' },
  { label: 'PIAUD', href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum' }
];

const campusBadges = ['IIM', 'Tarbiyah', 'SIAKAD', 'EdLink'];

const mapsUrl =
  'https://www.google.com/maps?ll=-7.584322,110.81806&z=13&t=m&hl=en-ID&gl=US&mapclient=embed&q=Jl.+Sadewa+No.14+Serengan+Kec.+Serengan+Kota+Surakarta,+Jawa+Tengah+57155';
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
              href="https://wa.link/agu1p5"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-bold text-slate-900 hover:bg-amber-300 transition"
            >
              <span>PMB Center</span>
              <ArrowRight class="h-4 w-4" />
            </a>
            <a
              href="https://wa.link/qrwv15"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              Admin Fakultas
            </a>
          </div>
        </div>
      </div>

      <div class="mt-14 grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img
              :src="ftarLogo"
              alt="Logo Fakultas Tarbiyah"
              class="h-12 w-auto shrink-0 object-contain"
            />
            <div class="flex flex-col leading-tight">
              <span class="text-base font-extrabold text-white">Fakultas Tarbiyah</span>
              <span class="text-xs font-semibold text-slate-300">Institut Islam Mambaul Ulum Surakarta</span>
            </div>
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
                class="inline-flex items-center gap-1.5 hover:text-white transition"
              >
                <span>{{ journal.label }}</span>
                <ExternalLink class="h-3.5 w-3.5 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">Lokasi Kampus</h3>
          <a
            :href="mapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-start gap-2.5 rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-slate-300 transition hover:border-brand-400/50 hover:bg-white/10 hover:text-white"
          >
            <MapPin class="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div class="min-w-0 space-y-1">
              <p class="font-semibold text-white group-hover:text-amber-300 transition">Google Maps Kampus</p>
              <p class="text-xs text-slate-400 leading-relaxed">
                Jl. Sadewa No.14, Serengan, Kota Surakarta, Jawa Tengah 57155
              </p>
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-brand-200">
                <span>Buka Peta</span>
                <ExternalLink class="h-3 w-3" />
              </span>
            </div>
          </a>
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
