/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — CERTIFICATE ENGINE (Dyplom Imienny)
 * Plik: js/lumina-certificate-engine.js
 * 
 * Silnik generowania, weryfikacji i wydawania Imiennego Dyplomu Ukończenia
 * LUMINA Bible Academy (28 Fundamentalnych Zasad Wiary Pisma Świętego).
 * 
 * Zasady:
 *  - Master Visual Reference: 2000 x 1414 (A4 Landscape 297x210 mm)
 *  - Single-line fitText: brak ucinania, zachowanie polskich znaków diakrytycznych
 *  - Dynamiczny kod QR w łuku z linkiem do publicznej weryfikacji
 *  - Idempotencja Firestore: niezmienność daty i numeru po pierwszym ukończeniu
 *  - Ochrona prywatności: brak danych wrażliwych na certyfikacie i stronie weryfikacji
 * 
 * © Christian Culture / LUMINA — 2026
 * ══════════════════════════════════════════════════════════════════════════
 */

export const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
];

/**
 * Formatuje datę na elegancki format polski (np. "27 września 2026")
 */
export function formatPolishDate(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return '27 września 2026';
  }
  const day = d.getDate();
  const month = POLISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Sprawdza uprawnienia do uzyskania dyplomu (bezwzględnie 28 lekcji i 5 etapów)
 */
export function checkEligibility(courseProgress) {
  let completedCount = 0;
  const completedLessons = new Set();

  if (courseProgress instanceof Map) {
    courseProgress.forEach((p, id) => {
      if (p && p.status === 'completed') {
        const numId = Number(id);
        if (numId >= 1 && numId <= 28) {
          completedCount++;
          completedLessons.add(numId);
        }
      }
    });
  } else if (Array.isArray(courseProgress)) {
    courseProgress.forEach((p) => {
      if (p && (p.status === 'completed' || p.isCompleted)) {
        const numId = Number(p.lessonId || p.id);
        if (numId >= 1 && numId <= 28) {
          completedCount++;
          completedLessons.add(numId);
        }
      }
    });
  } else if (courseProgress && typeof courseProgress === 'object') {
    Object.entries(courseProgress).forEach(([id, p]) => {
      if (p && (p.status === 'completed' || p.isCompleted)) {
        const numId = Number(id);
        if (numId >= 1 && numId <= 28) {
          completedCount++;
          completedLessons.add(numId);
        }
      }
    });
  }

  // Weryfikacja 5 etapów
  // Etap 1: lekcje 1-6
  // Etap 2: lekcje 7-12
  // Etap 3: lekcje 13-18
  // Etap 4: lekcje 19-23
  // Etap 5: lekcje 24-28
  const stageRanges = [
    [1, 6],
    [7, 12],
    [13, 18],
    [19, 23],
    [24, 28]
  ];

  let stagesCompleted = 0;
  stageRanges.forEach(([start, end]) => {
    let stageFull = true;
    for (let l = start; l <= end; l++) {
      if (!completedLessons.has(l)) {
        stageFull = false;
        break;
      }
    }
    if (stageFull) stagesCompleted++;
  });

  const remainingLessons = [];
  for (let l = 1; l <= 28; l++) {
    if (!completedLessons.has(l)) {
      remainingLessons.push(l);
    }
  }

  return {
    eligible: completedCount >= 28 && stagesCompleted === 5,
    completedCount,
    stagesCompleted,
    totalRequired: 28,
    remainingLessons
  };
}

/**
 * Generuje unikalny numer certyfikatu (np. "LBA-2026-874219")
 */
export function generateCertificateId(userId = '', date = new Date()) {
  const year = date.getFullYear() || 2026;
  let hash = 0;
  const str = `${userId}_${date.getTime()}_LUMINA`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const cleanHash = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(-6);
  return `LBA-${year}-${cleanHash}`;
}

/**
 * Oblicza dynamiczne dopasowanie tekstu w jednej linii (single-line fitText)
 */
export function calculateFitText(measureFn, text, maxWidth, initialSize = 42, minSize = 18) {
  let fontSize = initialSize;
  let width = measureFn(text, fontSize);

  if (width > maxWidth) {
    const scale = maxWidth / width;
    fontSize = Math.max(minSize, Math.floor(initialSize * scale));
    width = measureFn(text, fontSize);
  }

  return {
    fontSize,
    textWidth: width,
    text
  };
}

/**
 * Klasa silnika certyfikatów
 */
export class LuminaCertificateEngine {
  constructor() {
    this.masterBgUrl = '/images/academy/diploma_background_master.png';
    this.canvasWidth = 2000;
    this.canvasHeight = 1414;
    this.cachedBgImage = null;
  }

  /**
   * Ładuje obraz tła dyplomu z cache
   */
  async loadMasterBackground() {
    if (this.cachedBgImage) return this.cachedBgImage;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cachedBgImage = img;
        resolve(img);
      };
      img.onerror = (e) => reject(new Error('Nie udało się załadować tła dyplomu: ' + this.masterBgUrl));
      img.src = this.masterBgUrl;
    });
  }

  /**
   * Generuje kod QR w postaci elementu canvas/image za pomocą vendor-qrcode
   */
  async generateQRCodeElement(text, size = 120) {
    if (typeof window === 'undefined' || !window.QRCode) {
      throw new Error('Biblioteka QRCode nie jest załadowana.');
    }

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    try {
      new window.QRCode(tempContainer, {
        text,
        width: size,
        height: size,
        colorDark: '#1c1815',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });

      // Poczekaj chwilę na wyrenderowanie canvas/img przez qrcodejs
      await new Promise((r) => setTimeout(r, 50));

      const qrCanvas = tempContainer.querySelector('canvas');
      const qrImg = tempContainer.querySelector('img');

      if (qrCanvas && qrCanvas.width > 0) {
        return qrCanvas;
      }
      if (qrImg && qrImg.src) {
        return qrImg;
      }

      throw new Error('Nie udało się wyrenderować kodu QR');
    } finally {
      if (tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  }

  /**
   * Renderuje kompletny dyplom na canvasie (2000 x 1414)
   */
  async renderCertificateCanvas({ recipientName, completionDate, certificateId, verificationUrl }) {
    if (typeof document === 'undefined') {
      throw new Error('Metoda renderCertificateCanvas wymaga środowiska przeglądarki.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');

    // Włącz wygładzanie
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Rysuj tło wzorcowe Master Reference
    const bgImg = await this.loadMasterBackground();
    ctx.drawImage(bgImg, 0, 0, this.canvasWidth, this.canvasHeight);

    // Kolor tekstu: głęboki grafitowo-sepjowy
    const textColor = '#1c1815';

    // 2. IMIĘ I NAZWISKO ABSOLWENTA
    // OTRZYMUJE na Y=632, dzielnik na Y=750 -> środek Y=688, X=1000
    const upperName = (recipientName || 'ABSOLWENT LUMINA').trim().toUpperCase();
    const maxNameWidth = 780;
    const initialNameSize = 42;
    const minNameSize = 20;

    const measureFn = (txt, size) => {
      ctx.font = `bold ${size}px 'Playfair Display', 'Cinzel', Georgia, serif`;
      return ctx.measureText(txt).width;
    };

    const fit = calculateFitText(measureFn, upperName, maxNameWidth, initialNameSize, minNameSize);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fit.fontSize}px 'Playfair Display', 'Cinzel', Georgia, serif`;
    ctx.fillText(upperName, 1000, 688);

    // 3. DATA UKOŃCZENIA
    // Center X = 770, baseline Y = 1255
    const dateText = completionDate || formatPolishDate(new Date());
    ctx.font = `bold 16.5px 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = textColor;
    ctx.fillText(dateText, 770, 1255);

    // 4. NUMER CERTYFIKATU
    // Center X = 1020, baseline Y = 1255
    const certNumText = certificateId || 'LBA-2026-000001';
    ctx.font = `bold 16.5px 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = textColor;
    ctx.fillText(certNumText, 1020, 1255);

    // 5. KOD QR WERYFIKACJI W ZŁOTYM ŁUKU
    // Center X = 1760, Center Y = 1155, Rozmiar = 120x120
    const qrTargetUrl = verificationUrl || `https://polskieradio.cc/akademia/certyfikat/${certNumText}`;
    try {
      const qrEl = await this.generateQRCodeElement(qrTargetUrl, 108);

      // Tło dla kodu QR
      const qrBoxX = 1760 - 60;
      const qrBoxY = 1155 - 60;
      const qrBoxSize = 120;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

      // Rysuj kod QR z 6px marginesem
      ctx.drawImage(qrEl, qrBoxX + 6, qrBoxY + 6, 108, 108);
    } catch (err) {
      console.warn('Fallback dla QR w certyfikacie:', err);
      // Fallback: elegancka ramka z opisem
      const qrBoxX = 1760 - 60;
      const qrBoxY = 1155 - 60;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(qrBoxX, qrBoxY, 120, 120);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrBoxX, qrBoxY, 120, 120);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VERIFIED LBA', 1760, 1155);
    }

    return canvas;
  }

  /**
   * Pobiera istniejący certyfikat lub tworzy nowy (idempotentnie)
   */
  async getOrIssueCertificate({ firestoreDb, firestoreSdk, user, userProfile, cloudProgress, customName = null }) {
    if (!user || !user.uid) {
      throw new Error('Wymagane zalogowanie, aby pobrać lub wystawić certyfikat.');
    }

    const { doc, getDoc, setDoc, query, collection, where, getDocs } = firestoreSdk;

    // 1. Sprawdź czy certyfikat dla tego użytkownika już istnieje
    try {
      const q = query(
        collection(firestoreDb, 'course_certificates'),
        where('userId', '==', user.uid)
      );
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const existingDoc = querySnap.docs[0].data();
        return {
          certificate: existingDoc,
          isNew: false
        };
      }
    } catch (err) {
      console.warn('Błąd podczas odczytu istniejących certyfikatów:', err);
    }

    // 2. Jeśli nie istnieje — sprawdź uprawnienia (28 lekcji i 5 etapów)
    const eligibility = checkEligibility(cloudProgress);
    if (!eligibility.eligible) {
      const missing = eligibility.remainingLessons.join(', ');
      throw new Error(`Nie ukończono wszystkich 28 lekcji. Brakuje lekcji: ${missing || 'niekompletne etapy'}`);
    }

    // 3. Ustal imię i nazwisko
    const cleanName = (customName || (userProfile && (userProfile.displayName || userProfile.name)) || user.displayName || 'Absolwent LUMINA').trim();

    if (cleanName.length < 2) {
      throw new Error('Imię i nazwisko na dyplomie musi mieć co najmniej 2 znaki.');
    }

    // 4. Utwórz unikalny numer certyfikatu
    const now = new Date();
    const certificateId = generateCertificateId(user.uid, now);
    const formattedDate = formatPolishDate(now);
    const verificationUrl = `https://polskieradio.cc/akademia/certyfikat/${certificateId}`;

    const certData = {
      certificateId,
      userId: user.uid,
      recipientName: cleanName,
      completedAt: now.toISOString(),
      formattedDate,
      lessonsCompleted: 28,
      stagesCompleted: 5,
      courseId: 'biblijne-zasady-wiary-28',
      courseTitle: '28 Zasad Wiary — LUMINA Bible Academy',
      verificationUrl,
      createdAt: now.toISOString()
    };

    // 5. Zapisz w Firestore (idempotentny klucz dokumentu = certificateId)
    const certRef = doc(firestoreDb, 'course_certificates', certificateId);
    await setDoc(certRef, certData);

    return {
      certificate: certData,
      isNew: true
    };
  }

  /**
   * Generuje i pobiera dokument PDF w formacie A4 Landscape (297x210 mm)
   */
  async downloadPDF(certData, canvas) {
    if (typeof window === 'undefined') return;

    const jspdfModule = window.jspdf || window;
    const jsPDF = jspdfModule.jsPDF || jspdfModule;

    if (!jsPDF) {
      throw new Error('Biblioteka jsPDF nie jest załadowana.');
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4' // 297 x 210 mm
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

    const cleanCertId = certData.certificateId || 'LBA';
    const safeName = (certData.recipientName || 'Dyplom').replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '_');
    doc.save(`Dyplom_Lumina_Bible_Academy_${safeName}_${cleanCertId}.pdf`);
  }

  /**
   * Uruchamia natywny dialog drukowania dyplomu
   */
  printCertificate(canvas) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Zezwól na wyskakujące okienka, aby wydrukować dyplom.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dyplom LUMINA Bible Academy</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
          }
          img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.focus(); window.print(); window.close();" />
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  /**
   * Udostępnia dyplom przez Web Share API lub kopiuje link
   */
  async shareCertificate(certData, canvas) {
    if (typeof navigator === 'undefined') return;

    const shareUrl = certData.verificationUrl || `https://polskieradio.cc/akademia/certyfikat/${certData.certificateId}`;
    const shareText = `Ukończyłem LUMINA Bible Academy — 28 Zasad Wiary Pisma Świętego! Mój oficjalny dyplom: ${shareUrl}`;

    if (navigator.canShare && canvas && canvas.toBlob) {
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Dyplom_Lumina_${certData.certificateId}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Dyplom LUMINA Bible Academy',
            text: shareText,
            url: shareUrl,
            files: [file]
          });
          return { success: true, method: 'files' };
        }
      } catch (e) {
        console.warn('Web Share Files nie powiodło się, próba tekstowej:', e);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dyplom LUMINA Bible Academy',
          text: shareText,
          url: shareUrl
        });
        return { success: true, method: 'navigator' };
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('Web share błąd:', e);
        }
      }
    }

    // Fallback: kopiuj do schowka
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return { success: true, method: 'clipboard' };
    }

    return { success: false, method: 'none' };
  }
}

export const luminaCertificateEngine = new LuminaCertificateEngine();
