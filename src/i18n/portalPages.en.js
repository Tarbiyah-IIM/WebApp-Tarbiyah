export const portalPagesEn = {
  common: {
    homeLabel: 'Home',
    studyProgramCategory: 'Study Programs',
    academicCategory: 'Academic',
    publicationCategory: 'Publications',
    accreditationLabel: 'Accreditation Status',
    degreeLabel: 'Graduate Degree',
    modeLabel: 'Study Track',
    curriculumHeading: 'Core Competencies & Curriculum Focus',
    careerHeading: 'Graduate Career Prospects',
    highlightsHeading: 'Key Services & Scope',
    stepsHeading: 'Workflow & Stages',
    otherProgramsHeading: 'Other Study Programs',
    otherPagesHeading: 'Related Academic & Publication Pages',
    contactHeading: 'Tarbiyah Service Desk',
    emailLabel: 'Official Email',
    waAdminLabel: 'Contact Faculty Admin',
    waPmbLabel: 'Admissions Consultation',
    backHomeBtn: 'Back to Home',
    retryBtn: 'Reload Sync',
    comingSoonBadge: 'Link coming soon',
    pendingNoticePrefix: 'Link for "',
    pendingNoticeSuffix: '" will be available soon.',
    notFoundTitle: 'Page not found',
    notFoundDesc: 'The requested study program or service page is unavailable.',
    offlineNotice: 'You are currently offline. Core guide content remains available; live CMS sync values may be cached.'
  },
  programs: {
    pai: {
      degree: 'Bachelor of Education (S.Pd.)',
      studyMode: 'Regular & RPL · Integrated',
      overview:
        'The Islamic Religious Education (PAI) Study Program equips future educators with comprehensive Islamic scholarship, modern pedagogy, and digital literacy for 21st-century classrooms.',
      highlights: [
        'Mastery of Quran & Hadith, Akidah Akhlak, Fiqh, and Islamic Cultural History.',
        'Instructional design leveraging digital learning media and authentic assessment.',
        'Structured microteaching labs and supervised teaching internships at partner schools.',
        'Cultivating religious moderation, Rahmatan Lil’alamin character, and classroom leadership.'
      ],
      careers: [
        'Islamic Religious Education Teacher (Elementary, Junior & Senior High)',
        'Islamic Education Curriculum Researcher & Designer',
        'Director of Islamic Learning & Training Centers',
        'Community Religious Educator & Academic Counselor'
      ]
    },
    pgmi: {
      degree: 'Bachelor of Education (S.Pd.)',
      studyMode: 'Regular & RPL · Integrated',
      overview:
        'The Madrasah Ibtidaiyah Teacher Education (PGMI) Study Program trains primary classroom educators skilled in integrative thematic instruction, foundational literacy-numeracy, and character formation.',
      highlights: [
        'Integrated thematic pedagogy across primary subjects (Language, Math, Science, Social Studies, Civics).',
        'Creative instructional media, early digital literacy, and inclusive classroom management.',
        'Classroom action research mentoring in collaboration with partner Madrasah Ibtidaiyah.',
        'Nurturing patient, communicative, and collaborative primary school educators.'
      ],
      careers: [
        'Classroom Teacher at Madrasah Ibtidaiyah (MI) & Elementary Schools (SD)',
        'Primary Learning Media & Textbook Developer',
        'Elementary Curriculum & Co-Curricular Coordinator',
        'Educational Entrepreneur & Primary Tutoring Center Lead'
      ]
    },
    piaud: {
      degree: 'Bachelor of Education (S.Pd.)',
      studyMode: 'Regular & RPL · Integrated',
      overview:
        'The Early Childhood Islamic Education (PIAUD) Study Program specializes in golden-age education (0–6 years) through meaningful play, holistic growth stimulation, Islamic storytelling, and family partnerships.',
      highlights: [
        'Early childhood developmental psychology and growth monitoring practices.',
        'Creation of educational play tools, Islamic storytelling, songs, and creative arts.',
        'Child-friendly PAUD/RA curriculum design grounded in noble Islamic character.',
        'Hands-on field practice with mentor teachers across partner RA and Islamic kindergartens.'
      ],
      careers: [
        'Professional Educator at RA, Islamic Kindergartens & Early Learning Centers',
        'Founder or Head of Independent Early Childhood Institutions',
        'Early Childhood Growth & Parenting Consultant',
        'Creator of Children Books & Educational Play Kits'
      ]
    }
  },
  infoPages: {
    'administrasi-persuratan': {
      categoryKey: 'academicCategory',
      title: 'Academic Correspondence Administration',
      badge: 'Academic Services',
      hideSidebar: true,
      summaryBlocks: [
        {
          text: 'Please note that Observation or Research Request Letter submissions are facilitated online. Kindly download the form according to your needs (group / individual).'
        },
        {
          bold: true,
          text: 'ENSURE ALL ENTERED DATA IS ACCURATE AND DOUBLE-CHECK YOUR DETAILS BEFORE OFFICIAL STAMP AND SIGNATURE ARE APPLIED'
        },
        {
          segments: [
            { text: 'If you have any questions or issues completing the form, please contact ' },
            { label: 'Academic Affairs', href: 'https://wa.link/qrwv15' },
            { text: '.' }
          ]
        },
        {
          segments: [
            {
              text: 'After completing the form, please request a wet stamp and signature from Academic Staff, or if a softfile version is required, send it back to the '
            },
            { label: 'Academic Affairs', href: 'https://wa.link/qrwv15' },
            { text: ' contact for signature and wet stamp in PDF / Word format.' }
          ]
        },
        {
          text: 'To download the observation and research request form, click the “Download Request Form” button.'
        }
      ],
      highlightsTitle: 'Supported Academic Letters',
      highlights: [
        { title: 'Observation & Research Permit Letter', desc: 'Official introduction letter to schools/madrasahs for coursework, PPL, or thesis research.' }
      ],
      steps: [
        'Prepare your active student ID (NIM), full name, letter purpose, and destination institution.',
        'Ensure the Letter Number matches the latest sequence.',
        'Academic Affairs staff verify data completeness and authenticity format of the Request Letter.',
        'The official letter is issued in stamped printed form and signed by the Course Lecturer and Vice Dean I.'
      ],
      primaryCta: {
        label: 'Download Request Form',
        href: 'https://drive.google.com/drive/folders/1D7KqdUPHy4nH5W1gxo2PWJyFImmKLwLI?usp=sharing',
        icon: 'download'
      },
      secondaryCta: {
        label: 'Get Letter Number',
        href: 'https://drive.google.com/open?authuser=0&id=1MayDKlAWQH0-i58i-1CenBr2Zg00ofyFB3DiBLL_95s'
      }
    },
    ppl: {
      categoryKey: 'publicationCategory',
      title: 'Teaching Practice Internship (PPL)',
      badge: 'Field Practice',
      hideContactCard: true,
      sidebarAction: {
        title: 'Registration (Early Access)',
        buttonLabel: 'Closed',
        badge: 'Link coming soon'
      },
      customOtherTitle: 'Administration',
      customOtherLinks: [
        { label: 'Work Permit Letter (Surat Ijin Kerja)', badge: 'Link coming soon' },
        { label: 'PPL Permit Letter (Surat Ijin PPL)', badge: 'Link coming soon' }
      ],
      summary:
        'A mandatory field teaching practicum enabling Tarbiyah students to refine pedagogical, personal, social, and professional competencies directly in partner schools.',
      highlightsTitle: 'Download PPL Report Supporting Documents (Forms)',
      highlights: [
        {
          title: 'School Observation Form',
          desc: 'Click to download the partner school observation sheet.',
          href: 'https://drive.google.com/uc?export=download&id=1xeq4m-ocSmBaqsYDXPQG0X00BtHUJvSa'
        },
        {
          title: 'Student Daily Journal Form',
          desc: 'Click to download the daily activity journal template during PPL.',
          href: 'https://drive.google.com/uc?export=download&id=1oxm5Et4KTyXe6wUkskF-MRS2meVDWfRa'
        },
        {
          title: 'Mentor Teacher Classroom Observation Form',
          desc: 'Click to download the classroom teaching observation sheet.',
          href: 'https://drive.google.com/uc?export=download&id=1FThthx6Unb6mH1_gHyhY9mhIGR_juuit'
        },
        {
          title: 'Teaching Practice Assessment Form N3',
          desc: 'Click to download the guided teaching assessment rubric (N3).',
          href: 'https://drive.google.com/uc?export=download&id=1n0Ju1xzW_Qr6HUEtIrcCGjwchVYJM9cu'
        },
        {
          title: 'Final Teaching Exam Assessment Form N4',
          desc: 'Click to download the practical teaching exam rubric (N4).',
          href: 'https://drive.google.com/uc?export=download&id=1dY6O_gtnFmDsFdXWzjkWgatTuDtyJBiV'
        },
        {
          title: 'PPL Report Form',
          desc: 'Click to download the official final report formatting template.',
          href: 'https://drive.google.com/uc?export=download&id=1g-z4PkwEtoNm_yJ3OUoxQmv7RZSBMsrW'
        },
        {
          title: 'DPL Supervision Form',
          desc: 'Click to download the Field Supervising Lecturer consultation card.',
          href: 'https://drive.google.com/uc?export=download&id=1jDeI8ABs3nj1At35BpUQqjrARkjX08HG'
        }
      ],
      steps: [
        'Ensure completion of prerequisite microteaching courses and minimum credit thresholds.',
        'Register for PPL placement during the faculty window and attend mandatory briefing sessions.',
        'Complete school observation and guided teaching practice across Solo Raya partner schools.',
        'Complete teaching evaluation with Mentor Teachers & DPL and submit your final PPL report.'
      ]
    },
    pkn: {
      categoryKey: 'publicationCategory',
      title: 'Community Fieldwork (PKN)',
      badge: 'Community Service',
      summary:
        'An Islamic education-focused community engagement program empowering students to apply Tarbiyah knowledge directly in madrasahs and local communities.',
      highlightsTitle: 'PKN Program Pillars',
      highlights: [
        { title: 'Education & Madrasah Empowerment', desc: 'Supporting literacy, Quran reading mentorship, and community-based learning management.' },
        { title: 'Religious Moderation & Parenting Outreach', desc: 'Educational workshops for youth, families, and local religious education institutions.' },
        { title: 'Applied Social Innovation', desc: 'Collaborative grassroots initiatives with community leaders, mosques, and school committees.' },
        { title: 'Outreach Reporting & Publication', desc: 'Impact documentation, program evaluation, and community-engagement manuscript drafting.' }
      ],
      steps: [
        'Register for PKN via the academic portal once community-service credit requirements are met.',
        'Attend methodology briefings, regional needs mapping, and DPL group assignments.',
        'Implement thematic education and community programs with local partners on site.',
        'Present evaluation findings and submit your final PKN report and outreach article.'
      ]
    },
    jurnal: {
      categoryKey: 'publicationCategory',
      title: 'Faculty of Tarbiyah Journals',
      badge: 'Scholarly Publishing',
      summary:
        'Scholarly publishing hub for faculty lecturers, students, and Islamic education researchers at the Faculty of Tarbiyah, Mambaul Ulum Islamic Institute of Surakarta.',
      highlightsTitle: 'Journal Tracks & Research Scope',
      highlights: [
        { title: 'Islamic Religious Education (PAI) Journal', desc: 'Research on Islamic curriculum innovation, instructional strategies, and educational thought.' },
        { title: 'Primary Madrasah Education (PGMI) Journal', desc: 'Studies in elementary pedagogy, literacy-numeracy, and integrative thematic teaching media.' },
        { title: 'Early Childhood Education (PIAUD) Journal', desc: 'Articles on golden-age child development, play-based learning, and educational toys.' },
        { title: 'Manuscript & OJS Workflow Support', desc: 'Formatting templates, similarity screening, and peer-review submission guidance.' }
      ],
      steps: [
        'Prepare your research or community-service manuscript following the OJS IIM journal template.',
        'Register or sign in to the IIM Surakarta Open Journal Systems (OJS) portal.',
        'Upload your full manuscript along with author metadata, bilingual abstract, and keywords.',
        'Track editorial screening, peer-review revisions, and final online publication.'
      ],
      primaryCta: {
        label: 'Visit OJS Journal Portal',
        href: 'https://jurnal.iimsurakarta.ac.id/index.php/alulum'
      }
    }
  }
};
