// Quadro: Piet Mondrian, "Broadway Boogie-Woogie", 1942-43
// Fonte: https://it.wikipedia.org/wiki/Broadway_Boogie-Woogie
// Regola cromatica: la terna iniziale è giallo, rosso e blu; J la sostituisce
// con tre colori distinti scelti a caso da una palette di tinte fisse.

const latoTela = 600;
const cellePerLatoIniziali = 30;
const incrementoCelle = 3;
const limiteCellePerLato = 48;
const passoStrade = 6;
const probabilitaColoreStrada = 0.88;
const probabilitaColoreSfondo = 0.16;
const variazioneScalaMinima = 0.05;
const variazioneScalaMassima = 0.2;
const variazioneQuadratinoMinima = 0.08;
const variazioneQuadratinoMassima = 0.25;
const quadratinoMinimo = 0.45;
const quadratinoMassimo = 1.5;
const scalaMinima = 0.5;
const scalaMassima = 1.5;
const rotazioneMassimaCasualeGradi = 360;
const attesaResetMillisecondi = 10000;
const parolaObiettivo = "jacopo";
const combinazioniCasualiPrimaDellaParola = 3;

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
let dimensioniQuadratini = [];
let dimensioniQuadratiniIniziali = [];
let palette;
let coloriAttivi = ["giallo", "rosso", "blu"];
let scalaComposizione = 1;
let rotazione = 0;
let timerReset = null;
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
  generaMosaico();
  mosaicoIniziale = mosaico.map((riga) => riga.slice());
  dimensioniQuadratiniIniziali = dimensioniQuadratini.map((riga) => riga.slice());
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

function generaMosaico() {
  mosaico = [];
  dimensioniQuadratini = [];
  let scartoVerticale = floor(random(passoStrade));
  let scartoOrizzontale = floor(random(passoStrade));

  for (let y = 0; y < cellePerLato; y++) {
    let riga = [];
    let rigaDimensioni = [];
    for (let x = 0; x < cellePerLato; x++) {
      let sullaStrada =
        x % passoStrade === scartoVerticale ||
        y % passoStrade === scartoOrizzontale;
      let probabilita = sullaStrada
        ? probabilitaColoreStrada
        : probabilitaColoreSfondo;
      riga.push(random() < probabilita ? scegliColoreMosaico() : "bianco");
      rigaDimensioni.push(1);
    }
    mosaico.push(riga);
    dimensioniQuadratini.push(rigaDimensioni);
  }
}

function aumentaDettaglioMosaico() {
  let cellePrecedenti = cellePerLato;
  let mosaicoPrecedente = mosaico;
  let dimensioniPrecedenti = dimensioniQuadratini;
  cellePerLato = min(cellePerLato + incrementoCelle, limiteCellePerLato);

  if (cellePerLato === cellePrecedenti) {
    return;
  }

  let nuovoMosaico = [];
  let nuoveDimensioni = [];
  for (let y = 0; y < cellePerLato; y++) {
    let riga = [];
    let rigaDimensioni = [];
    let yPrecedente = floor(y * cellePrecedenti / cellePerLato);

    for (let x = 0; x < cellePerLato; x++) {
      let xPrecedente = floor(x * cellePrecedenti / cellePerLato);
      riga.push(mosaicoPrecedente[yPrecedente][xPrecedente]);
      rigaDimensioni.push(dimensioniPrecedenti[yPrecedente][xPrecedente]);
    }

    nuovoMosaico.push(riga);
    nuoveDimensioni.push(rigaDimensioni);
  }

  mosaico = nuovoMosaico;
  dimensioniQuadratini = nuoveDimensioni;
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
  coloriAttivi = ["giallo", "rosso", "blu"];
  scalaComposizione = 1;
  rotazione = 0;
  aggiornaPalette();
  generaSequenzaObiettivo();
}

function spostaQuadratiniColorati() {
  let quadratini = [];
  let posizioniDisponibili = [];

  for (let y = 0; y < cellePerLato; y++) {
    for (let x = 0; x < cellePerLato; x++) {
      posizioniDisponibili.push({ x, y });
      if (mosaico[y][x] !== "bianco") {
        quadratini.push({
          x,
          y,
          colore: mosaico[y][x],
          dimensione: dimensioniQuadratini[y][x]
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

  mosaico = Array.from({ length: cellePerLato }, () =>
    Array(cellePerLato).fill("bianco")
  );
  dimensioniQuadratini = Array.from({ length: cellePerLato }, () =>
    Array(cellePerLato).fill(1)
  );

  for (let i = 0; i < quadratini.length; i++) {
    let posizione = posizioniDisponibili[i];
    let quadratino = quadratini[i];
    mosaico[posizione.y][posizione.x] = quadratino.colore;
    dimensioniQuadratini[posizione.y][posizione.x] = quadratino.dimensione;
  }
}

function programmaReset() {
  if (timerReset !== null) {
    clearTimeout(timerReset);
  }
  timerReset = setTimeout(() => {
    timerReset = null;
    ripristinaStatoIniziale();
  }, attesaResetMillisecondi);
}

function keyPressed() {
  let tasto = key.toLowerCase();
  let secondaO = aggiornaProgressoSequenza(tasto);

  if (tasto === "j") {
    nuovaPalette();
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
      for (let y = 0; y < cellePerLato; y++) {
        for (let x = 0; x < cellePerLato; x++) {
          if (mosaico[y][x] !== "bianco") {
            let direzione = random() < 0.5 ? -1 : 1;
            let variazione = random(variazioneQuadratinoMinima, variazioneQuadratinoMassima);
            dimensioniQuadratini[y][x] = constrain(
              dimensioniQuadratini[y][x] + direzione * variazione,
              quadratinoMinimo,
              quadratinoMassimo
            );
          }
        }
      }
    }
  } else if (tasto === "p") {
    rotazione += radians(random(rotazioneMassimaCasualeGradi));
  }

  programmaReset();
}
