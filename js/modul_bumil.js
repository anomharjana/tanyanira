let currentStep = 1;
let trimester = null;
let userAnswers = {};

const stepElements = {
  1: document.getElementById('step1'),
  2: document.getElementById('step2'),
  3: document.getElementById('step3'),
};

const questionsContainer = document.getElementById('questions-container');

const screeningQuestions = {
  1: [
    {
      title: "Hyperemesis Gravidarum",
      questions: [
        { q: "Seberapa sering Anda mengalami mual dan muntah dalam sehari?", options: ["Tidak sama sekali", "1–2 kali", "3–5 kali", "Lebih dari 5 kali"] },
        { q: "Apakah Anda kesulitan makan atau minum karena mual?", options: ["Tidak", "Kadang", "Sering"] },
        { q: "Apakah Anda merasa berat badan Anda turun dalam beberapa minggu terakhir?", options: ["Tidak", "Ya, sekitar 1–2 kg", "Ya, lebih dari 3 kg"] }
      ]
    },
    {
      title: "Kehamilan Ektopik",
      questions: [
        { q: "Apakah Anda merasakan nyeri perut bawah sebelah (kiri/kanan) yang tajam dan tidak biasa?", options: ["Tidak", "Ringan", "Tajam dan menetap"] },
        { q: "Apakah Anda mengalami perdarahan ringan (bercak) atau seperti menstruasi saat ini?", options: ["Tidak", "Ya"] },
        { q: "Apakah Anda pernah mengalami kehamilan ektopik sebelumnya?", options: ["Tidak", "Ya"] }
      ]
    }
  ],
  2: [
    {
      title: "Preeklampsia",
      questions: [
        { q: "Apakah Anda pernah mencatat tekanan darah ≥140/90 mmHg (atau merasa pusing berulang)?", options: ["Tidak", "Ya"] },
        { q: "Apakah Anda mengalami pembengkakan tiba-tiba di wajah, tangan, atau kaki?", options: ["Tidak", "Sedikit", "Parah"] },
        { q: "Apakah Anda mengalami sakit kepala berat yang tidak hilang dengan istirahat/paracetamol?", options: ["Tidak", "Kadang", "Sering"] },
        { q: "Apakah Anda mengalami gangguan penglihatan (berbayang, kilatan cahaya)?", options: ["Tidak", "Ya"] }
      ]
    }
  ],
  3: [
    {
      title: "Eklampsia / Preeklampsia Lanjut",
      questions: [
        { q: "Apakah Anda mengalami pembengkakan berat pada wajah, tangan, atau kaki secara mendadak?", options: ["Tidak", "Ya"] },
        { q: "Apakah Anda mengalami sakit kepala berat yang tidak membaik dengan obat atau istirahat?", options: ["Tidak", "Ya"] },
        { q: "Apakah Anda melihat gangguan visual (buram, kilatan cahaya)?", options: ["Tidak", "Ya"] },
        { q: "Apakah Anda merasa nyeri di ulu hati atau mual hebat?", options: ["Tidak", "Ya"] }
      ]
    }
  ]
};

function updateStepIndicator(step) {
  document.querySelectorAll('.step-indicator span').forEach((el, idx) => {
    el.classList.remove('active');
    if (idx === step - 1) el.classList.add('active');
  });
}

function goToStep2() {
  const age = parseInt(document.getElementById('gestationalAge').value);
  if (isNaN(age) || age < 1 || age > 42) {
    alert("Silakan isi usia kehamilan antara 1 sampai 42 minggu.");
    return;
  }

  trimester = age <= 13 ? 1 : age <= 27 ? 2 : 3;

  generateQuestions(trimester);

  currentStep = 2;
  updateStepIndicator(2);
  stepElements[1].classList.remove('active');
  stepElements[2].classList.add('active');
}

function backToStep1() {
  currentStep = 1;
  updateStepIndicator(1);
  stepElements[2].classList.remove('active');
  stepElements[1].classList.add('active');
}

function backToStep2() {
  currentStep = 2;
  updateStepIndicator(2);
  stepElements[3].classList.remove('active');
  stepElements[2].classList.add('active');
}

function generateQuestions(tri) {
  questionsContainer.innerHTML = '';
  const data = screeningQuestions[tri];

  data.forEach((item, index) => {
    const qBlock = document.createElement('div');
    qBlock.className = 'question-group';
    qBlock.innerHTML = `
      <h3>${item.title}</h3>
      ${item.questions.map((q, i) => `
        <label>${q.q}</label>
        <select id="q-${tri}-${index}-${i}">
          ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      `).join('')}
    `;
    questionsContainer.appendChild(qBlock);
  });
}

function goToStep3() {
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.innerHTML = '';
  userAnswers = {};

  const data = screeningQuestions[trimester];

  data.forEach((item, index) => {
    const answers = [];
    item.questions.forEach((q, i) => {
      const select = document.getElementById(`q-${trimester}-${index}-${i}`);
      answers.push(select.value);
    });

    userAnswers[item.title] = answers;

    let riskLevel = 'green';
    if (answers.includes("Ya, lebih dari 3 kg") || answers.includes("Tajam dan menetap") || answers.filter(a => a === "Ya" || a === "Sering").length >= 2) {
      riskLevel = 'red';
    } else if (answers.includes("Kadang") || answers.includes("Sedikit") || answers.includes("Ya")) {
      riskLevel = 'yellow';
    }

    const card = document.createElement('div');
    card.className = `result-card ${riskLevel}`;
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Risiko: </strong> ${riskLevel === 'red' ? 'Tinggi' : riskLevel === 'yellow' ? 'Perlu Monitor' : 'Rendah'}</p>
      <ul>${answers.map(a => `<li>${a}</li>`).join('')}</ul>
      <p><strong>Rekomendasi:</strong><br>
        ${getRecommendation(item.title, riskLevel)}
      </p>
    `;
    resultsContainer.appendChild(card);
  });

  currentStep = 3;
  updateStepIndicator(3);
  stepElements[2].classList.remove('active');
  stepElements[3].classList.add('active');
}

function getRecommendation(title, riskLevel) {
  const notes = {
    "Hyperemesis Gravidarum": {
      red: "Segera konsultasikan ke dokter jika muntah hebat & berat badan turun signifikan.",
      yellow: "Pantau kondisi, jaga hidrasi dan asupan nutrisi.",
      green: "Tidak ada tanda hiperemesis berat, tetap jaga pola makan."
    },
    "Kehamilan Ektopik": {
      red: "Segera lakukan USG untuk memastikan lokasi kehamilan.",
      yellow: "Jika ada nyeri atau bercak, evaluasi medis dianjurkan.",
      green: "Tidak ditemukan tanda-tanda kehamilan ektopik."
    },
    "Preeklampsia": {
      red: "Segera periksa tekanan darah & protein urin. Risiko preeklampsia tinggi.",
      yellow: "Monitor tekanan darah dan gejala lainnya.",
      green: "Tidak ada tanda preeklampsia saat ini."
    },
    "Eklampsia / Preeklampsia Lanjut": {
      red: "Segera ke fasilitas medis. Risiko eklampsia tinggi.",
      yellow: "Waspadai gejala lanjut. Rutin kontrol.",
      green: "Tidak ada tanda eklampsia saat ini."
    }
  };
  return notes[title] ? notes[title][riskLevel] : "Jaga kesehatan dan rutin periksa ke tenaga medis.";
}

function downloadPDF() {
  const element = document.getElementById('step3');
  const opt = {
    margin: 0.5,
    filename: 'hasil-skrining-kehamilan.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      scrollY: 0
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy']
    }
  };
  html2pdf().set(opt).from(element).save();
}
