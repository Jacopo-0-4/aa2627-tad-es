// Quadro: Piet Mondrian, "Broadway Boogie-Woogie", 1942-43
// Fonte: https://it.wikipedia.org/wiki/Broadway_Boogie-Woogie
// Regola cromatica: la terna iniziale è giallo, rosso e blu; J la sostituisce
// con tre colori distinti scelti a caso da una palette di tinte fisse.

const latoTela = 600;
const cellePerLatoIniziali = 60;
const cellePerLatoCampoIniziale = cellePerLatoIniziali * 3;
const margineCampo = cellePerLatoIniziali;
const incrementoCelle = 6;
const limiteCellePerLato = 72;
const probabilitaColoreStrada = 0.78;
const probabilitaColoreSfondo = 0.04;
const semeComposizioneIniziale = 2627;
const variazioneScalaMinima = 0.05;
const variazioneScalaMassima = 0.2;
const variazioneQuadratinoMinima = 0.08;
const variazioneQuadratinoMassima = 0.25;
const quadratinoMinimo = 0.45;
const quadratinoMassimo = 1.5;
const scalaMinima = 0.5;
const scalaMassima = 1.5;
const rotazioneMassimaCasualeGradi = 360;
const parolaObiettivo = "jacopo";
const combinazioniCasualiPrimaDellaParola = 3;

const righeStradeIniziali = [2, 6, 10, 14, 18, 23, 28, 33, 38, 43, 48, 53, 58];
const colonneStradeIniziali = [1, 4, 8, 13, 17, 22, 27, 31, 36, 41, 46, 50, 55, 59];
const areeGeometricheIniziali = [
  { x: 16, y: 3, lato: 7, bordo: "rosso", centro: "bianco", latoCentro: 3 },
  { x: 42, y: 14, lato: 8, bordo: "blu", centro: "giallo", latoCentro: 3 },
  { x: 10, y: 30, lato: 6, bordo: "rosso", centro: "bianco", latoCentro: 2 },
  { x: 23, y: 33, lato: 7, bordo: "blu", centro: "giallo", latoCentro: 3 },
  { x: 47, y: 34, lato: 7, bordo: "rosso", centro: "bianco", latoCentro: 3 }
];

const coloriDisponibili = {
  arancione: [28, 90, 55],
  viola: [280, 75, 52],
  azzurro: [195, 85, 55],
  rosso: [5, 90, 52],
  verde: [135, 80, 48],
  blu: [225, 90, 50],
  giallo: [53, 85, 60],
  rosa: [335, 80, 62]
};

let cellePerLato = cellePerLatoIniziali;
let mosaico = [];
let mosaicoIniziale = [];
let mosaicoCampo = [];
let mosaicoCampoIniziale = [];
let dimensioniQuadratini = [];
let dimensioniQuadratiniIniziali = [];
let dimensioniQuadratiniCampo = [];
let dimensioniQuadratiniCampoIniziali = [];
let palette;
let graficaCampo;
let coloriAttivi = ["giallo", "rosso", "blu"];
let scalaComposizione = 1;
let rotazione = 0;
let sequenzaObiettivo = "";
let lettereInserite = 0;
let combinazioniCasualiGenerate = 0;
let elementoLegenda;
let elementoSequenzaLegenda;

function setup() {
  pixelDensity(1);
  let canvas = createCanvas(latoTela, latoTela);
  canvas.parent("quadro");
  colorMode(HSL, 360, 100, 100);
  elementoLegenda = document.getElementById("legenda-comandi");
  elementoSequenzaLegenda = document.getElementById("sequenza-legenda");
  generaSequenzaObiettivo();
  aggiornaPalette();
  randomSeed(semeComposizioneIniziale);
  generaMosaico();
  mosaicoIniziale = mosaico.map((riga) => riga.slice());
  dimensioniQuadratiniIniziali = dimensioniQuadratini.map((riga) => riga.slice());
  generaMosaicoCampo();
  mosaicoCampoIniziale = mosaicoCampo.map((riga) => riga.slice());
  dimensioniQuadratiniCampoIniziali =
    dimensioniQuadratiniCampo.map((riga) => riga.slice());
  graficaCampo = createGraphics(latoTela * 3, latoTela * 3);
  graficaCampo.pixelDensity(1);
  disegnaMosaicoCampo();
}

function generaSequenzaObiettivo() {
  if (combinazioniCasualiGenerate === combinazioniCasualiPrimaDellaParola) {
    sequenzaObiettivo = parolaObiettivo;
    combinazioniCasualiGenerate = 0;
  } else {
    let lettere = parolaObiettivo.split("");
    let nuovaSequenza;
    for (let i = lettere.length - 1; i > 0; i--) {
      let indiceCasuale = floor(random(i + 1));
      [lettere[i], lettere[indiceCasuale]] =
        [lettere[indiceCasuale], lettere[i]];
    }
    nuovaSequenza = lettere.join("");
    while (nuovaSequenza === parolaObiettivo) {
      for (let i = lettere.length - 1; i > 0; i--) {
        let indiceCasuale = floor(random(i + 1));
        [lettere[i], lettere[indiceCasuale]] =
          [lettere[indiceCasuale], lettere[i]];
      }
      nuovaSequenza = lettere.join("");
    }

    sequenzaObiettivo = nuovaSequenza;
    combinazioniCasualiGenerate++;
  }
  lettereInserite = 0;
  aggiornaLegenda(true);
}

function aggiornaLegenda(visibile) {
  elementoSequenzaLegenda.textContent = sequenzaObiettivo.toUpperCase();
  elementoLegenda.hidden = !visibile;
}

function aggiornaProgressoSequenza(tasto) {
  let tastoCorrisponde = tasto === sequenzaObiettivo[lettereInserite];
  let secondaO =
    tastoCorrisponde &&
    tasto === "o" &&
    sequenzaObiettivo.slice(0, lettereInserite).split("o").length - 1 === 1;

  if (tastoCorrisponde) {
    lettereInserite++;
  } else {
    lettereInserite = tasto === sequenzaObiettivo[0] ? 1 : 0;
  }

  if (lettereInserite === sequenzaObiettivo.length) {
    aggiornaLegenda(false);
  }

  return secondaO;
}

function draw() {
  background(0, 0, 98);
  push();
  translate(width / 2, height / 2);
  rotate(rotazione);
  scale(scalaComposizione);
  translate(-width / 2, -height / 2);
  noStroke();

  image(graficaCampo, -latoTela, -latoTela);

  let latoCella = latoTela / cellePerLato;
  for (let y = 0; y < cellePerLato; y++) {
    for (let x = 0; x < cellePerLato; x++) {
      fill(palette[mosaico[y][x]]);
      let latoQuadratino = latoCella * dimensioniQuadratini[y][x];
      let margine = (latoCella - latoQuadratino) / 2;
      rect(
        x * latoCella + margine,
        y * latoCella + margine,
        latoQuadratino + 0.2,
        latoQuadratino + 0.2
      );
    }
  }
  pop();
}

function generaMosaicoCampo() {
  mosaicoCampo = [];
  dimensioniQuadratiniCampo = [];

  for (let y = 0; y < cellePerLatoCampoIniziale; y++) {
    let riga = [];
    let rigaDimensioni = [];
    for (let x = 0; x < cellePerLatoCampoIniziale; x++) {
      let xComposizione = x - margineCampo;
      let yComposizione = y - margineCampo;
      let dentroComposizione =
        xComposizione >= 0 &&
        xComposizione < cellePerLatoIniziali &&
        yComposizione >= 0 &&
        yComposizione < cellePerLatoIniziali;

      if (dentroComposizione) {
        riga.push(mosaico[yComposizione][xComposizione]);
        rigaDimensioni.push(dimensioniQuadratini[yComposizione][xComposizione]);
      } else {
        let sullaStrada =
          colonneStradeIniziali.includes(x % cellePerLatoIniziali) ||
          righeStradeIniziali.includes(y % cellePerLatoIniziali);
        let probabilita = sullaStrada
          ? probabilitaColoreStrada
          : probabilitaColoreSfondo;
        riga.push(random() < probabilita ? scegliColoreMosaico() : "bianco");
        rigaDimensioni.push(1);
      }
    }
    mosaicoCampo.push(riga);
    dimensioniQuadratiniCampo.push(rigaDimensioni);
  }
}

function disegnaMosaicoCampo() {
  graficaCampo.colorMode(HSL, 360, 100, 100);
  graficaCampo.noStroke();
  let celleCampo = mosaicoCampo.length;
  let latoCella = latoTela * 3 / celleCampo;

  for (let y = 0; y < celleCampo; y++) {
    for (let x = 0; x < celleCampo; x++) {
      graficaCampo.fill(palette[mosaicoCampo[y][x]]);
      let latoQuadratino = latoCella * dimensioniQuadratiniCampo[y][x];
      let margine = (latoCella - latoQuadratino) / 2;
      graficaCampo.rect(
        x * latoCella + margine,
        y * latoCella + margine,
        latoQuadratino + 0.2,
        latoQuadratino + 0.2
      );
    }
  }
}

function generaMosaico() {
  mosaico = [];
  dimensioniQuadratini = [];

  for (let y = 0; y < cellePerLato; y++) {
    let riga = [];
    let rigaDimensioni = [];
    for (let x = 0; x < cellePerLato; x++) {
      let sullaStrada =
        colonneStradeIniziali.includes(x) ||
        righeStradeIniziali.includes(y);
      let probabilita = sullaStrada
        ? probabilitaColoreStrada
        : probabilitaColoreSfondo;
      riga.push(random() < probabilita ? scegliColoreMosaico() : "bianco");
      rigaDimensioni.push(1);
    }
    mosaico.push(riga);
    dimensioniQuadratini.push(rigaDimensioni);
  }

  for (let area of areeGeometricheIniziali) {
    let fine = area.lato - 1;
    for (let y = 0; y < area.lato; y++) {
      for (let x = 0; x < area.lato; x++) {
        let sulBordo = x === 0 || x === fine || y === 0 || y === fine;
        mosaico[area.y + y][area.x + x] = sulBordo ? area.bordo : "bianco";
      }
    }

    let inizioCentro = floor((area.lato - area.latoCentro) / 2);
    for (let y = 0; y < area.latoCentro; y++) {
      for (let x = 0; x < area.latoCentro; x++) {
        mosaico[area.y + inizioCentro + y][area.x + inizioCentro + x] =
          area.centro;
      }
    }
  }
}

function aumentaDettaglioMosaico() {
  let nuoveCellePerLato = min(cellePerLato + incrementoCelle, limiteCellePerLato);

  if (nuoveCellePerLato === cellePerLato) {
    return;
  }

  mosaico = ridimensionaMatrice(mosaico, nuoveCellePerLato);
  dimensioniQuadratini =
    ridimensionaMatrice(dimensioniQuadratini, nuoveCellePerLato);
  mosaicoCampo = ridimensionaMatrice(mosaicoCampo, nuoveCellePerLato * 3);
  dimensioniQuadratiniCampo =
    ridimensionaMatrice(dimensioniQuadratiniCampo, nuoveCellePerLato * 3);
  cellePerLato = nuoveCellePerLato;
  disegnaMosaicoCampo();
}

function ridimensionaMatrice(matrice, nuovaDimensione) {
  let dimensionePrecedente = matrice.length;
  let nuovaMatrice = [];

  for (let y = 0; y < nuovaDimensione; y++) {
    let riga = [];
    let yPrecedente = floor(y * dimensionePrecedente / nuovaDimensione);
    for (let x = 0; x < nuovaDimensione; x++) {
      let xPrecedente = floor(x * dimensionePrecedente / nuovaDimensione);
      riga.push(matrice[yPrecedente][xPrecedente]);
    }
    nuovaMatrice.push(riga);
  }

  return nuovaMatrice;
}

function scegliColoreMosaico() {
  let scelta = random();
  if (scelta < 0.68) {
    return "giallo";
  }
  if (scelta < 0.84) {
    return "rosso";
  }
  return "blu";
}

function nuovaPalette() {
  let combinazionePrecedente = coloriAttivi.slice();
  let nomiDisponibili = Object.keys(coloriDisponibili);

  do {
    let candidati = nomiDisponibili.slice();
    coloriAttivi = [];
    for (let i = 0; i < 3; i++) {
      let indice = floor(random(candidati.length));
      coloriAttivi.push(candidati.splice(indice, 1)[0]);
    }
  } while (coloriAttivi.every((nome, indice) => nome === combinazionePrecedente[indice]));

  aggiornaPalette();
}

function aggiornaPalette() {
  palette = {
    bianco: color(0, 0, 98),
    giallo: color(...coloriDisponibili[coloriAttivi[0]]),
    rosso: color(...coloriDisponibili[coloriAttivi[1]]),
    blu: color(...coloriDisponibili[coloriAttivi[2]])
  };
}

function ripristinaStatoIniziale() {
  cellePerLato = cellePerLatoIniziali;
  mosaico = mosaicoIniziale.map((riga) => riga.slice());
  dimensioniQuadratini = dimensioniQuadratiniIniziali.map((riga) => riga.slice());
  mosaicoCampo = mosaicoCampoIniziale.map((riga) => riga.slice());
  dimensioniQuadratiniCampo =
    dimensioniQuadratiniCampoIniziali.map((riga) => riga.slice());
  coloriAttivi = ["giallo", "rosso", "blu"];
  scalaComposizione = 1;
  rotazione = 0;
  aggiornaPalette();
  disegnaMosaicoCampo();
  generaSequenzaObiettivo();
}

function mousePressed() {
  let clicDentroCanvas =
    mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  let parolaCompletata = lettereInserite === sequenzaObiettivo.length;

  if (clicDentroCanvas && parolaCompletata) {
    ripristinaStatoIniziale();
  }
}

function spostaQuadratiniColorati() {
  let nuovoCampo = spostaQuadratiniInMatrice(
    mosaicoCampo,
    dimensioniQuadratiniCampo
  );
  mosaicoCampo = nuovoCampo.mosaico;
  dimensioniQuadratiniCampo = nuovoCampo.dimensioni;
  sincronizzaComposizioneDalCampo();
  disegnaMosaicoCampo();
}

function spostaQuadratiniInMatrice(matrice, dimensioni) {
  let quadratini = [];
  let posizioniDisponibili = [];
  let latoMatrice = matrice.length;

  for (let y = 0; y < latoMatrice; y++) {
    for (let x = 0; x < latoMatrice; x++) {
      posizioniDisponibili.push({ x, y });
      if (matrice[y][x] !== "bianco") {
        quadratini.push({
          x,
          y,
          colore: matrice[y][x],
          dimensione: dimensioni[y][x]
        });
      }
    }
  }

  for (let i = posizioniDisponibili.length - 1; i > 0; i--) {
    let indiceCasuale = floor(random(i + 1));
    [posizioniDisponibili[i], posizioniDisponibili[indiceCasuale]] =
      [posizioniDisponibili[indiceCasuale], posizioniDisponibili[i]];
  }

  while (quadratini.some((quadratino, indice) =>
    quadratino.x === posizioniDisponibili[indice].x &&
    quadratino.y === posizioniDisponibili[indice].y
  )) {
    for (let i = posizioniDisponibili.length - 1; i > 0; i--) {
      let indiceCasuale = floor(random(i + 1));
      [posizioniDisponibili[i], posizioniDisponibili[indiceCasuale]] =
        [posizioniDisponibili[indiceCasuale], posizioniDisponibili[i]];
    }
  }

  let nuovoMosaico = Array.from({ length: latoMatrice }, () =>
    Array(latoMatrice).fill("bianco")
  );
  let nuoveDimensioni = Array.from({ length: latoMatrice }, () =>
    Array(latoMatrice).fill(1)
  );

  for (let i = 0; i < quadratini.length; i++) {
    let posizione = posizioniDisponibili[i];
    let quadratino = quadratini[i];
    nuovoMosaico[posizione.y][posizione.x] = quadratino.colore;
    nuoveDimensioni[posizione.y][posizione.x] = quadratino.dimensione;
  }

  return { mosaico: nuovoMosaico, dimensioni: nuoveDimensioni };
}

function sincronizzaComposizioneDalCampo() {
  let latoComposizione = mosaicoCampo.length / 3;
  let inizioComposizione = latoComposizione;
  cellePerLato = latoComposizione;
  mosaico = [];
  dimensioniQuadratini = [];

  for (let y = 0; y < latoComposizione; y++) {
    let riga = [];
    let rigaDimensioni = [];
    for (let x = 0; x < latoComposizione; x++) {
      riga.push(mosaicoCampo[inizioComposizione + y][inizioComposizione + x]);
      rigaDimensioni.push(
        dimensioniQuadratiniCampo[inizioComposizione + y][inizioComposizione + x]
      );
    }
    mosaico.push(riga);
    dimensioniQuadratini.push(rigaDimensioni);
  }
}

function modificaDimensioneQuadratini() {
  for (let y = 0; y < mosaicoCampo.length; y++) {
    for (let x = 0; x < mosaicoCampo.length; x++) {
      if (mosaicoCampo[y][x] !== "bianco") {
        let direzione = random() < 0.5 ? -1 : 1;
        let variazione = random(
          variazioneQuadratinoMinima,
          variazioneQuadratinoMassima
        );
        dimensioniQuadratiniCampo[y][x] = constrain(
          dimensioniQuadratiniCampo[y][x] + direzione * variazione,
          quadratinoMinimo,
          quadratinoMassimo
        );
      }
    }
  }

  sincronizzaComposizioneDalCampo();
  disegnaMosaicoCampo();
}

function keyPressed() {
  let tasto = key.toLowerCase();
  let secondaO = aggiornaProgressoSequenza(tasto);

  if (tasto === "j") {
    nuovaPalette();
    disegnaMosaicoCampo();
  } else if (tasto === "a") {
    aumentaDettaglioMosaico();
  } else if (tasto === "c") {
    let direzione = random() < 0.5 ? -1 : 1;
    let variazione = random(variazioneScalaMinima, variazioneScalaMassima);
    scalaComposizione = constrain(
      scalaComposizione + direzione * variazione,
      scalaMinima,
      scalaMassima
    );
  } else if (tasto === "o") {
    if (secondaO) {
      spostaQuadratiniColorati();
    } else {
      modificaDimensioneQuadratini();
    }
  } else if (tasto === "p") {
    rotazione += radians(random(rotazioneMassimaCasualeGradi));
  }

}
