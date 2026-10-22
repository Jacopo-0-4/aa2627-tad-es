// Illusione: anelli concentrici di chevron (originale, sul principio del
//   Café Wall: file di elementi uguali sfalsate di metà passo)
// Fonte: https://www.dreamstime.com/illustration/concentric-circles-icon.html
// Regola: ogni fascia è un anello di numChevron chevron a V, tutti uguali dentro
//   la stessa fascia; verso il centro l'anello si rimpicciolisce di un fattore
//   costante (rapportoFasce) e i chevron con lui, restando in numero uguale:
//   quindi più piccoli e più fitti. Le fasce vicine hanno i chevron rivolti in
//   senso opposto e scorrono una avanti e l'altra indietro.
// Parametri critici:
//   ampiezzaOscillazione: lo sfasamento fra fasce adiacenti, l'equivalente
//     dello sfasamento delle file di mattoni nel Café Wall.
//     effetto più evidente con 0.065 (fasce sfalsate di 7,5 gradi, metà del
//     passo angolare di 15: i chevron di una fascia cadono fra quelli della
//     successiva),
//     nessun effetto con 0 (fasce allineate: anelli concentrici regolari);
//     durante l'oscillazione lo sfasamento va da 0 a 0.065 e torna indietro,
//     quindi l'effetto compare e scompare da solo.
//   rapportoChevron: la misura del chevron rispetto al raggio della fascia, da
//     cui dipende rapportoFasce, cioè la distanza fra le fasce.
//     effetto più evidente con 0.2 (le fasce si toccano e i chevron si
//     incastrano),
//     nessun effetto con 0.05 (il chevron diventa più corto del suo spessore:
//     la V si scompone in blocchi e le fasce diventano una griglia di rettangoli).

// Larghezza e altezza della tela
let larghezzaTela = 800;
let altezzaTela = 600;

// Raggio della fascia più esterna, in pixel
let raggioEsterno = 280;
// Quanti chevron ci sono in ogni fascia
let numChevron = 24;
// Grandezza del chevron rispetto al raggio della sua fascia
let rapportoChevron = 0.2;
// Altezza del chevron (punta e base), come frazione della sua grandezza
let altezzaChevron = 0.3;
// Ogni fascia interna tocca quella esterna: il rapporto fra i due raggi è
// quello che porta i bordi delle due fasce a incontrarsi
let rapportoFasce = (1 - rapportoChevron / 2) / (1 + rapportoChevron / 2);
// Raggio a cui si ferma la fascia più interna: sotto questo valore
// il motivo continua rimpicciolendosi fino a sparire nel centro
let raggioMinimo = 3;
// Quante fasce servono per scendere da raggioEsterno a raggioMinimo
// (Math.ceil e Math.log funzionano già prima che p5 carichi)
let numFasce = Math.ceil(Math.log(raggioMinimo / raggioEsterno) / Math.log(rapportoFasce));
// Radianti di oscillazione della fascia rispetto alla posizione di riposo:
// più è grande, più gli chevron scorrono lontano avanti e indietro;
// 0.065 è un quarto del passo angolare, cioè metà passo fra fasce vicine
let ampiezzaOscillazione = 0.065;
// Radianti di oscillazione per fotogramma: più è piccolo, più è lento
let velocitaOscillazione = 0.06;

function setup() {
  createCanvas(larghezzaTela, altezzaTela);
}

function draw() {
  background(255);
  translate(width / 2, height / 2);

  let oscillazione = sin(frameCount * velocitaOscillazione) * ampiezzaOscillazione;
  let raggio = raggioEsterno;
  for (let i = 0; i < numFasce; i++) {
    // fasce adiacenti in senso opposto: una avanza, l'altra arretra
    let verso = 1;
    if (i % 2 === 1) {
      verso = -1;
    }
    disegnaFascia(raggio, oscillazione * verso, verso);
    raggio = raggio * rapportoFasce;
  }
}

// Un anello di chevron a V, tutti uguali, disposti a distanza angolare costante;
// verso indica il senso in cui la fascia si muove
function disegnaFascia(raggio, oscillazione, verso) {
  let passo = TWO_PI / numChevron;
  // distanza fra il centro di un chevron e quello del successivo, misurata sull'anello
  let spazio = raggio * passo;
  let grandezza = raggio * rapportoChevron;
  let h = grandezza * altezzaChevron;
  // il bianco fra due chevron è una banda a V della stessa forma dei chevron:
  // con scarto uguale a spazio/2 ha lo stesso spessore del nero, misurato
  // perpendicolarmente ai bracci (se h supera spazio/4 le punte si accavallano)
  let scarto = spazio / 2;

  push();
  rotate(oscillazione);
  fill(0);
  noStroke();
  for (let i = 0; i < numChevron; i++) {
    push();
    rotate(i * passo);
    translate(0, -raggio);
    // il chevron punta nella direzione del moto della fascia, non verso il centro
    rotate(HALF_PI * verso);
    // il chevron è una banda a forma di V, con le estremità tagliate piatte
    beginShape();
    vertex(-grandezza / 2, h);
    vertex(0, -h);
    vertex(grandezza / 2, h);
    vertex(grandezza / 2, h + scarto);
    vertex(0, -h + scarto);
    vertex(-grandezza / 2, h + scarto);
    endShape(CLOSE);
    pop();
  }
  pop();
}
