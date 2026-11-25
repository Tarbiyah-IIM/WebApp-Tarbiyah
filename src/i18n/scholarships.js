export const scholarshipsId = {
  modalTitle: 'Program Beasiswa',
  labels: {
    level: 'Jenjang :',
    source: 'Sumber :',
    destination: 'Tujuan :',
    target: 'Target :'
  },
  items: [
    {
      id: 'prestasi-akademik',
      title: 'Beasiswa Prestasi Akademik',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Bantuan biaya pendidikan prestasi akademik bagi ' },
        { text: 'Peringkat 1 – 3', bold: true },
        { text: ' dengan gratis/bebas biaya ' },
        { text: 'SPP/UKT selama 2 semester', bold: true },
        { text: '.' }
      ],
      level: 'Sarjana',
      source: 'Beasiswa Internal',
      destinationLines: ['Fakultas Tarbiyah', 'Prodi PAI, PGMI, dan PIAUD'],
      target: 'Mahasiswa Baru'
    },
    {
      id: 'prestasi-non-akademik',
      title: 'Beasiswa Prestasi Non-akademik',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Bantuan biaya pendidikan prestasi non-akademik ' },
        { text: 'Nasional, Provinsi', bold: true },
        { text: ' maupun ' },
        { text: 'Kabupaten/Kota', bold: true },
        { text: ' berupa gratis/bebas biaya ' },
        { text: 'SPP/UKT selama 4 semester', bold: true },
        { text: ' (Nasional), ' },
        { text: '3 semester', bold: true },
        { text: ' (Provinsi) & ' },
        { text: '2 semester', bold: true },
        { text: ' (Kabupaten/Kota) dengan menunjukkan bukti Piagam Peringkat 1-3.' }
      ],
      level: 'Sarjana',
      source: 'Beasiswa Internal',
      destinationBullets: [
        'Semua Program Studi S1 (Nasional/Provinsi)',
        'Fakultas Tarbiyah: Prodi PAI, PGMI, dan PIAUD (Kab/Kota)'
      ],
      target: 'Nasional/Provinsi (Kuota 5)'
    },
    {
      id: 'tahfidz',
      title: 'Beasiswa Tahfidz',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Bantuan biaya Pendidikan bagi calon mahasiswa yang menjadi ' },
        { text: 'Hafidz Al-Qur’an', bold: true },
        { text: ' berupa :' }
      ],
      bullets: [
        'Bebas Biaya SPP/UKT 4 Semester (5 – 15 Juz)',
        'Bebas Biaya SPP/UKT 6 Semester (16 – 29 Juz)',
        'Bebas Biaya SPP/UKT 8 Semester (30 Juz)'
      ],
      footnote: 'dengan menunjukkan bukti Surat Keterangan',
      level: 'Sarjana',
      source: 'Beasiswa Internal',
      destinationLines: ['Fakultas Tarbiyah', 'Prodi PAI, PGMI, dan PIAUD'],
      target: 'Mahasiswa Baru'
    },
    {
      id: 'kip',
      title: 'Beasiswa KIP (Yatim & Dhuafa)',
      sourceType: 'external',
      descriptionSegments: [
        { text: 'Bantuan biaya Pendidikan berupa ' },
        { text: 'gratis biaya SPP/UKT selama 8 Semester', bold: true },
        { text: ' bagi calon mahasiswa dengan menunjukkan bukti ' },
        { text: 'Surat Keterangan', bold: true }
      ],
      level: 'Sarjana',
      source: 'Beasiswa Eksternal',
      destinationLines: ['Semua (Kuota Kebijakan Pemerintah)'],
      target: 'Mahasiswa Baru'
    },
    {
      id: 'aktivis',
      title: 'Beasiswa Aktivis',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Bantuan biaya Pendidikan berupa ' },
        { text: 'gratis/bebas biaya SPP/UKT selama 2 Semester', bold: true },
        { text: ' yang menjadi ' },
        { text: 'aktivis Masjid', bold: true },
        { text: ' dan ' },
        { text: 'aktivis Pondok Pesantren', bold: true },
        { text: ' dengan menunjukkan Surat Rekomendasi.' }
      ],
      level: 'Sarjana',
      source: 'Beasiswa Internal',
      destinationLines: ['Fakultas Tarbiyah', 'Prodi PAI, PGMI, dan PIAUD'],
      target: 'Mahasiswa Baru (Kuota 10)'
    },
    {
      id: 'alumni',
      title: 'Beasiswa Alumni',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Bantuan biaya pendidikan ' },
        { text: 'Khusus', bold: true },
        { text: ' Bagi Alumni Mamba’ul ‘Ulum yang ingin melanjutkan Studi Magister dengan Potongan 25% berlaku selama 4 Semester.' }
      ],
      level: 'Magister',
      source: 'Beasiswa Internal',
      destinationLines: ['Sekolah Pascasarjana'],
      target: 'Mahasiswa Baru'
    }
  ]
};

export const scholarshipsEn = {
  modalTitle: 'Scholarship Programs',
  labels: {
    level: 'Level:',
    source: 'Source:',
    destination: 'Eligible Programs:',
    target: 'Target:'
  },
  items: [
    {
      id: 'prestasi-akademik',
      title: 'Academic Achievement Scholarship',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Academic achievement tuition waiver for ' },
        { text: 'Rank 1 – 3', bold: true },
        { text: ' students covering ' },
        { text: 'full tuition/UKT for 2 semesters', bold: true },
        { text: '.' }
      ],
      level: 'Undergraduate (S1)',
      source: 'Internal Scholarship',
      destinationLines: ['Faculty of Tarbiyah', 'PAI, PGMI, and PIAUD Study Programs'],
      target: 'New Students'
    },
    {
      id: 'prestasi-non-akademik',
      title: 'Non-Academic Achievement Scholarship',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Non-academic achievement tuition waiver at ' },
        { text: 'National, Provincial', bold: true },
        { text: ', or ' },
        { text: 'Regency/City', bold: true },
        { text: ' levels covering ' },
        { text: '4 semesters', bold: true },
        { text: ' (National), ' },
        { text: '3 semesters', bold: true },
        { text: ' (Provincial), & ' },
        { text: '2 semesters', bold: true },
        { text: ' (Regency/City) with Rank 1–3 award certificate proof.' }
      ],
      level: 'Undergraduate (S1)',
      source: 'Internal Scholarship',
      destinationBullets: [
        'All S1 Study Programs (National/Provincial)',
        'Faculty of Tarbiyah: PAI, PGMI, and PIAUD (Regency/City)'
      ],
      target: 'National/Provincial (Quota 5)'
    },
    {
      id: 'tahfidz',
      title: 'Tahfidz Scholarship',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Tuition assistance for prospective students who are ' },
        { text: 'Hafidz Al-Qur’an', bold: true },
        { text: ' consisting of:' }
      ],
      bullets: [
        'Full Tuition/UKT Waiver for 4 Semesters (5 – 15 Juz)',
        'Full Tuition/UKT Waiver for 6 Semesters (16 – 29 Juz)',
        'Full Tuition/UKT Waiver for 8 Semesters (30 Juz)'
      ],
      footnote: 'by submitting an official Certificate of Memorization',
      level: 'Undergraduate (S1)',
      source: 'Internal Scholarship',
      destinationLines: ['Faculty of Tarbiyah', 'PAI, PGMI, and PIAUD Study Programs'],
      target: 'New Students'
    },
    {
      id: 'kip',
      title: 'KIP Scholarship (Orphans & Underprivileged)',
      sourceType: 'external',
      descriptionSegments: [
        { text: 'Educational aid providing ' },
        { text: 'full tuition/UKT waiver for 8 Semesters', bold: true },
        { text: ' for prospective students with an official ' },
        { text: 'Eligibility Certificate', bold: true }
      ],
      level: 'Undergraduate (S1)',
      source: 'External Scholarship',
      destinationLines: ['All Programs (Government Quota Policy)'],
      target: 'New Students'
    },
    {
      id: 'aktivis',
      title: 'Activist Scholarship',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Educational aid providing ' },
        { text: 'full tuition/UKT waiver for 2 Semesters', bold: true },
        { text: ' for ' },
        { text: 'Mosque activists', bold: true },
        { text: ' and ' },
        { text: 'Islamic Boarding School (Pesantren) activists', bold: true },
        { text: ' with a Letter of Recommendation.' }
      ],
      level: 'Undergraduate (S1)',
      source: 'Internal Scholarship',
      destinationLines: ['Faculty of Tarbiyah', 'PAI, PGMI, and PIAUD Study Programs'],
      target: 'New Students (Quota 10)'
    },
    {
      id: 'alumni',
      title: 'Alumni Scholarship',
      sourceType: 'internal',
      descriptionSegments: [
        { text: 'Special ' },
        { text: 'tuition assistance', bold: true },
        { text: ' for Mamba’ul ‘Ulum Alumni pursuing a Master’s Degree with a 25% tuition discount valid for 4 Semesters.' }
      ],
      level: 'Master’s (S2)',
      source: 'Internal Scholarship',
      destinationLines: ['Graduate School (Pascasarjana)'],
      target: 'New Students'
    }
  ]
};
