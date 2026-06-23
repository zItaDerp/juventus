let squadra = [];
let nomiGiocatoriDraftati = []; // NUOVO: Array per tracciare i giocatori unici
let fedelissimiScelti = []; // Salva i 2 leader selezionati nel modal
let inFasePosizionamentoFedelissimi = false; // Flag per la fase di posizionamento iniziale
let giocatoreInFaseDiPiazzamento = null;     // Tiene in memoria il giocatore appena cliccato
let statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: 0 };
let forzaAttuale = 0;
let inFaseMercato = false;
let modalitaSelezionata = "";
let allenatoreSelezionato = null;
const MAX_GIOCATORI = 11;
let rerollDisponibili = 3;
let slotAttivo = null; 
let budgetRimanente = 930;
// VARIABILI ROGUELIKE
let forzaModificataRoguelike = 0;
let durataEffettoRoguelike = 0;

const databaseImprevisti = [
    { tipo: "bonus_temp", titolo: "MACCHINA DA GOL", testo: "La squadra gira a meraviglia e i tifosi spingono! +6 alla forza della squadra per le prossime 3 partite.", valore: 6, durata: 3 },
    { tipo: "malus_temp", titolo: "POLEMICHE ARBITRALI", testo: "Un arbitraggio scandaloso ha innervosito lo spogliatoio. -5 alla forza per le prossime 2 partite.", valore: -5, durata: 2 },
    { tipo: "malus_temp", titolo: "VIRUS INFLUENZALE", testo: "Mezza squadra è a letto con la febbre. Scenderanno in campo le riserve! -8 alla forza per 1 partita.", valore: -8, durata: 1 },
    { tipo: "bonus_perm", titolo: "DISCORSO DEL PRESIDENTE", testo: "La dirigenza ha caricato la squadra a dovere. Tutta la rosa guadagna fiducia! +2 permanente alla forza.", valore: 2, durata: 0 },
    { tipo: "sostituzione", titolo: "SCANDALO SCOMMESSE", testo: "Disastro! Un tuo giocatore è stato squalificato per calcioscommesse." },
    { tipo: "sostituzione", titolo: "ROTTURA DEL CROCIATO", testo: "Infortunio gravissimo in allenamento. La sua stagione finisce qui." },
    { tipo: "sostituzione", titolo: "RESCISSIONE CONSENSUALE", testo: "Un giocatore ha litigato furiosamente col mister, ha stracciato il contratto ed è volato a Dubai." }
];

const schermataMenu = document.getElementById("schermata-iniziale");
const schermataModulo = document.getElementById("schermata-modulo");
const schermataGioco = document.getElementById("schermata-gioco");
const areaDraft = document.getElementById("area-draft");
const testoRuolo = document.getElementById("testo-ruolo");

const btnReroll = document.querySelector(".btn-usa-reroll");
const btnStagione = document.querySelector(".btn-completa-stagione");

const configurazioneModuli = {
    "4-3-3": [
        { rep: "att", ruoli: ["ES/AS", "ATT/AT", "ED/AD"] },
        { rep: "cen", ruoli: ["CC/CDC", "CC/CDC", "CC/CDC"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "4-4-2": [
        { rep: "att", ruoli: ["ATT/AT", "ATT/AT"] },
        { rep: "cen", ruoli: ["ES/AS", "CC/CDC", "CC/CDC", "ED/AD"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "3-5-2": [
        { rep: "att", ruoli: ["ATT/AT", "ATT/AT"] },
        { rep: "cen", ruoli: ["ES", "CC", "CDC", "CC", "ED"] },
        { rep: "dif", ruoli: ["DC", "DC", "DC"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "4-2-3-1": [
        { rep: "att", ruoli: ["ATT"] },
        { rep: "cen", ruoli: ["ES/AS", "COC/AT", "ED/AD"] },
        { rep: "cen", ruoli: ["CDC/CC", "CDC/CC"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "3-4-2-1": [
        { rep: "att", ruoli: ["ATT"] },
        { rep: "cen", ruoli: ["COC/AT", "COC/AT"] },
        { rep: "cen", ruoli: ["ES", "CC/CDC", "CC/CDC", "ED"] },
        { rep: "dif", ruoli: ["DC", "DC", "DC"] },
        { rep: "por", ruoli: ["POR"] }

    ],
    "4-3-2-1": [
        { rep: "att", ruoli: ["ATT"] },
        { rep: "att", ruoli: ["COC/AT", "COC/AT"] },
        { rep: "cen", ruoli: ["CC", "CC/CDC", "CC"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }        
    ]
};

function avviaSceltaModulo(modalita) {
    modalitaSelezionata = modalita; 
    schermataMenu.style.display = "none";
    schermataModulo.style.display = "block";
}

function impostaModulo(modulo) {
    squadra = [];
    nomiGiocatoriDraftati = []; // Resetta la cronologia dei nomi unici
    inFaseMercato = false;

    costruisciCampo(modulo);
    
    document.getElementById("recap-modalita").innerText = modalitaSelezionata.toUpperCase();
    document.getElementById("badge-modalita-live").innerText = modalitaSelezionata.toUpperCase();
    document.getElementById("recap-modulo").innerText = modulo;
    
    schermataModulo.style.display = "none";
    schermataGioco.style.display = "block";

    const boxBudget = document.getElementById("box-budget-salariale");
    const testBudget = document.getElementById("headbar-budget-count");

    if (modalitaSelezionata === 'mod-fairplay') {
        budgetRimanente = 930;
        boxBudget.style.display = "block"; 
        testBudget.innerText = budgetRimanente;
        testBudget.style.color = "#ffcc00"; 
    } else {
        boxBudget.style.display = "none"; 
    }

    btnReroll.innerText = `USA REROLL (${rerollDisponibili})`;
    btnReroll.removeEventListener("click", usaReroll);
    btnReroll.addEventListener("click", usaReroll);
    
    testoRuolo.innerText = "...";
    areaDraft.innerHTML = "<p style='color:#666; text-align:center; width:100%; margin-top:20px;'>Tocca un ruolo vuoto sul campo per iniziare il draft.</p>";

    if (modalitaSelezionata === 'risalita') {
        avviaSceltaFedelissimi();
    }
}

function costruisciCampo(moduloSelezionato) {
    const campo = document.getElementById("campo-dinamico");
    campo.innerHTML = ""; 

    const linee = configurazioneModuli[moduloSelezionato];

    linee.forEach(linea => {
        const divReparto = document.createElement("div");
        divReparto.className = `reparto reparto-${linea.rep}`;
        
        linea.ruoli.forEach(ruolo => {
            const slot = document.createElement("div");
            slot.className = "slot";
            slot.dataset.ruolo = ruolo; 
            slot.innerHTML = `<span class="ruolo-label">${ruolo}</span>`;
            
            slot.addEventListener("click", () => avviaTurnoDraftManuale(slot));
            
            divReparto.appendChild(slot);
        });
        
        campo.appendChild(divReparto);
    });
}

function avviaTurnoDraftManuale(elementoSlot) {
    // Se lo slot è già occupato da un giocatore, non fare nulla
    if (elementoSlot.classList.contains("occupato")) return;

    // =================================================================
    // FIX BUG 1: GESTIONE MODALITÀ LA RISALITA (FASE FEDELISSIMI)
    // =================================================================
    if (modalitaSelezionata === 'risalita' && inFasePosizionamentoFedelissimi) {
        // Controlliamo se il mister ha prima selezionato un fedelissimo dalla colonna di destra
        if (typeof giocatoreInFaseDiPiazzamento !== 'undefined' && giocatoreInFaseDiPiazzamento !== null) {
            // Se lo ha selezionato, procediamo al piazzamento nello slot cliccato
            piazzaFedelissimoInSlot(giocatoreInFaseDiPiazzamento, elementoSlot);
        } else {
            // Se non lo ha selezionato, mostriamo l'avviso CORRETTO senza rompere il flusso
            mostraMessaggioCustom("EHI MISTER!", "In questa fase devi prima cliccare sulla carta del Fedelissimo a destra per scegliere in che ruolo schierarlo!");
        }
        return; // Blocca qui l'esecuzione in modo che NON parta la logica del draft standard
    }

    // =================================================================
    // LOGICA DRAFT STANDARD 
    // =================================================================
    
    // FIX REROLL GRATUITO: Se clicco sullo slot già attivo, non fare nulla!
    if (slotAttivo === elementoSlot) return; 
    
    if (slotAttivo !== null && slotAttivo !== elementoSlot) {
        mostraMessaggioCustom("ATTENZIONE", "Devi prima scegliere un giocatore dal draft per il ruolo selezionato!");
        return;
    }

    // Attivazione visiva dello slot per il draft normale
    document.querySelectorAll(".slot").forEach(s => s.classList.remove("active-slot"));
    
    slotAttivo = elementoSlot;
    slotAttivo.classList.add("active-slot");

    const ruoloRichiesto = slotAttivo.dataset.ruolo;
    testoRuolo.innerText = ruoloRichiesto;

    generaCarteDraft(ruoloRichiesto);
}

function piazzaFedelissimoInSlot(giocatore, slot) {
    let ruoliAmmessi = slot.dataset.ruolo.split('/');
    
    // 1. Verifica se il fedelissimo può giocare in quel ruolo specifico
    if (!giocatore.ruolo.some(r => ruoliAmmessi.includes(r))) {
        mostraMessaggioCustom("RUOLO NON COMPATIBILE", `${giocatore.nome} non può giocare nel ruolo di ${slot.dataset.ruolo}!`);
        return;
    }

    // 2. Inserisci il giocatore nella squadra e nel registro dei draftati
    squadra.push(giocatore);
    nomiGiocatoriDraftati.push(giocatore.nome);

    // 3. Aggiorna la grafica dello slot sul campo
    slot.classList.add("occupato");
    slot.innerHTML = `
        <span style="color:var(--accento-juve); font-family:'Bebas Neue', sans-serif; font-size:1.5rem;">${giocatore.rating}</span>
        <span style="color:#fff; font-size:0.7rem; font-weight:bold; text-align:center;">${giocatore.nome.toUpperCase()}</span>
    `;
    slot.style.border = "1px solid var(--accento-juve)";
    slot.style.background = "rgba(0,0,0,0.8)";
    slot.style.cursor = "default";

    // 4. Ripristina lo stile standard per tutti gli altri slot liberi
    document.querySelectorAll(".slot:not(.occupato)").forEach(s => {
        s.classList.remove("active-slot");
        s.style.border = "1px dashed var(--accento-juve)";
    });

    // 5. Svuota la selezione temporanea del fedelissimo
    giocatoreInFaseDiPiazzamento = null;

    // 6. Aggiorna la sidebar destra per aggiornare la lista dei fedelissimi rimasti
    mostraFedelissimiInSidebar();

    // =================================================================
    // FIX BUG 2: CONTROLLO DI FINE FASE ED EVITAMENTO BLOCCHI DRAFT
    // =================================================================
    let contatoreFedelissimiInCampo = fedelissimiScelti.filter(f => squadra.some(g => g.nome === f.nome)).length;
    
    if (contatoreFedelissimiInCampo === fedelissimiScelti.length) {
        inFasePosizionamentoFedelissimi = false; // Disattiviamo la fase fedelissimi
        slotAttivo = null;                       // RESET COMPLETO DI SLOT ATTIVO: Risolve l'errore "ATTENZIONE..."
        
        mostraMessaggioCustom("FEDELISSIMI SCHIERATI", "I tuoi due Fedelissimi sono in posizione! Ora clicca su un qualsiasi ruolo vuoto per iniziare il vero Draft standard.");
    }
}

function generaCarteDraft(ruoloRichiesto) {
    areaDraft.innerHTML = "";

    // === CODICE DRAFT STANDARD (Invariato) ===
    let ruoliAccettati = ruoloRichiesto.split('/');
    let opzioni = databaseJuve.filter(g => 
        g.ruolo.some(r => ruoliAccettati.includes(r)) && !nomiGiocatoriDraftati.includes(g.nome)
    );
    
    if (modalitaSelezionata === 'risalita') {
        let opzioniScadenti = opzioni.filter(g => g.rating < 82);
        if (opzioniScadenti.length > 0) {
            opzioni = opzioniScadenti.sort(() => 0.5 - Math.random());
        } else {
            opzioni = opzioni.sort((a, b) => a.rating - b.rating);
        }
    } else {
        opzioni = opzioni.sort(() => 0.5 - Math.random());
    }

    opzioni = opzioni.slice(0, 3);

    opzioni.forEach((giocatore, index) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");
        cartaDiv.style.animationDelay = `${index * 0.1}s`; 
        
        let colorRating = "#fff"; 
        if (modalitaSelezionata === 'mod-fairplay' && budgetRimanente < giocatore.rating) {
            colorRating = "#f44336"; 
        }

        cartaDiv.innerHTML = `
            <div class="carta-info">
                <h3 style="margin:0; font-size:1.4rem;">${giocatore.nome}</h3>
                <p style="margin:0; color:#888;">${giocatore.ruolo.join(' / ')} • ${giocatore.stagione}</p>
            </div>
            <div class="rating-numero" style="font-size:2.5rem; color:${colorRating}">${giocatore.rating}</div>
        `;
        cartaDiv.addEventListener("click", () => scegliGiocatore(giocatore));
        areaDraft.appendChild(cartaDiv);
    });
}

function usaReroll() {
    if (!slotAttivo) {
        mostraMessaggioCustom("MOMENTO!", "Seleziona prima uno slot sul campo per poter usare il Reroll!");
        return;
    }

    if (rerollDisponibili > 0) {
        rerollDisponibili--; 
        
        btnReroll.innerText = `USA REROLL (${rerollDisponibili})`;
        document.getElementById("headbar-reroll-count").innerText = rerollDisponibili;
        
        if (rerollDisponibili === 0) {
            btnReroll.style.opacity = "0.3";
            btnReroll.style.cursor = "not-allowed";
            btnReroll.disabled = true;
        }
        
        generaCarteDraft(slotAttivo.dataset.ruolo);
    }
}

function scegliGiocatore(giocatoreScelto) {
    if (!slotAttivo) return;

    if (modalitaSelezionata === 'mod-fairplay') {
        if (budgetRimanente < giocatoreScelto.rating) {
            mostraMessaggioCustom("BUDGET INSUFFICIENTE", `Non hai abbastanza punti...`);
            return;
        }
        budgetRimanente -= giocatoreScelto.rating;
        const testBudget = document.getElementById("headbar-budget-count");
        testBudget.innerText = budgetRimanente;
        if (budgetRimanente < 150) testBudget.style.color = "#f44336";
    }

    squadra.push(giocatoreScelto);
    nomiGiocatoriDraftati.push(giocatoreScelto.nome); 
    
    slotAttivo.classList.remove("active-slot");
    slotAttivo.classList.add("occupato");
    slotAttivo.innerHTML = `
        <span style="color:var(--accento-juve); font-family:'Bebas Neue', sans-serif; font-size:1.5rem;">${giocatoreScelto.rating}</span>
        <span style="color:#fff; font-size:0.7rem; font-weight:bold; text-align:center;">${giocatoreScelto.nome.toUpperCase()}</span>
    `;
    slotAttivo.style.border = "1px solid var(--accento-juve)";
    slotAttivo.style.background = "rgba(0,0,0,0.8)";
    slotAttivo.style.cursor = "default";

    slotAttivo = null;
    testoRuolo.innerText = "...";
    btnStagione.innerText = `VIA ALLA STAGIONE (${squadra.length}/${MAX_GIOCATORI})`;

    if (squadra.length === MAX_GIOCATORI) {
        areaDraft.innerHTML = "<h3 style='color:var(--accento-juve); text-align:center; width:100%; margin-top:20px;'>SQUADRA COMPLETATA</h3><p style='color:#666; text-align:center; font-size:0.8rem;'>Procedi con la scelta del Mister</p>";
        btnStagione.disabled = false;
        btnStagione.classList.add("attivo");
        btnStagione.innerText = "SCEGLI ALLENATORE";
        btnStagione.onclick = avviaDraftAllenatore; 
    } else {
        // NUOVO CODICE AGGIUNTO QUI: Svuota l'area draft per il prossimo turno
        areaDraft.innerHTML = "<p style='color:#666; text-align:center; width:100%; margin-top:20px;'>Tocca un ruolo vuoto sul campo per continuare il draft.</p>";
    }
}

function avviaDraftAllenatore() {
    testoRuolo.innerText = "ALLENATORE";
    areaDraft.innerHTML = "";
    
    document.querySelector(".btn-usa-reroll").style.display = "none";
    
    btnStagione.disabled = true;
    btnStagione.classList.remove("attivo");
    btnStagione.innerText = "ATTESA SCELTA...";

    let opzioni = databaseAllenatori.sort(() => 0.5 - Math.random()).slice(0, 3);

    opzioni.forEach((mister, index) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");
        cartaDiv.style.animationDelay = `${index * 0.1}s`;
        
        let coloreMod = mister.modificatore >= 0 ? "#4caf50" : "#f44336";
        let segnoMod = mister.modificatore > 0 ? "+" : "";

        cartaDiv.innerHTML = `
            <div class="carta-info" style="width:75%;">
                <h3 style="margin:0; font-size:1.4rem; color:var(--accento-juve);">${mister.nome}</h3>
                <p style="margin:5px 0 0 0; color:#aaa; font-size:0.75rem; line-height:1.2;">${mister.effetto}</p>
            </div>
            <div class="rating-numero" style="font-size:2rem; color:${coloreMod};">${segnoMod}${mister.modificatore}</div>
        `;
        
        cartaDiv.addEventListener("click", () => scegliAllenatore(mister));
        areaDraft.appendChild(cartaDiv);
    });
}

function scegliAllenatore(mister) {
    allenatoreSelezionato = mister;

    document.getElementById("recap-allenatore").innerText = mister.nome;

    areaDraft.innerHTML = `
        <div style="text-align:center; padding:20px; animation: slideInRight 0.4s forwards;">
            <h3 style="color:var(--accento-juve); font-size:2rem; margin:0; font-family:'Bebas Neue', sans-serif;">${mister.nome}</h3>
            <p style="color:#fff; font-size:1rem; margin-top:10px;">${mister.effetto}</p>
            <div style="margin-top:20px; padding:10px; border:1px solid #333; border-radius:8px; background:rgba(0,0,0,0.5);">
                <span style="color:#888; font-size:0.8rem; display:block;">IMPATTO SULLA SQUADRA</span>
                <span style="font-size:1.5rem; font-family:'Bebas Neue'; color:${mister.modificatore >= 0 ? '#4caf50' : '#f44336'}">${mister.modificatore > 0 ? '+' : ''}${mister.modificatore} Punti</span>
            </div>
        </div>
    `;

    btnStagione.disabled = false;
    btnStagione.classList.add("attivo");
    btnStagione.innerText = "SIMULA STAGIONE";

    btnStagione.onclick = () => {
        if (modalitaSelezionata === 'champions') {
            simulaChampionsLeague();
        } else if (modalitaSelezionata === 'risalita') {
            simulaSerieB();
        } else if (modalitaSelezionata === 'roguelike') {
            simulaStagioneRoguelike(); // <-- NUOVA RIGA
        } else {
            simulaStagioneFinale();
        }
    };
}

// ==========================================================================
// VARIABILI GLOBALI DI SIMULAZIONE E MERCATO
// ==========================================================================
let classificaSerieA = [];
let registroGolMarcatori = {};
let loopSimulazione = null;
let giornataAttuale = 1;

const squadreSerieA = [
    "Inter", "Milan", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", 
    "Bologna", "Torino", "Udinese", "Sampdoria", "Genoa", "Verona", 
    "Cagliari", "Lecce", "Empoli", "Monza", "Venezia", "Parma"
];

// ==========================================================================
// 10. SETUP DELLA SCHERMATA DI SIMULAZIONE
// ==========================================================================
function simulaStagioneFinale() {
    statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: 0, golFatti: 0, golSubiti: 0 };
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";

    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()} (${allenatoreSelezionato.modificatore >= 0 ? '+' : ''}${allenatoreSelezionato.modificatore})`;

    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    classificaSerieA = [{ nome: "Juventus (Tu)", punti: 0, v: 0, p: 0, s: 0, forza: forzaAttuale }];
    
    const forzaStorica = {
        "Inter": 88, "Milan": 86, "Napoli": 85, "Atalanta": 84, "Roma": 83, "Lazio": 82,
        "Fiorentina": 80, "Torino": 78, "Bologna": 78, "Udinese": 76, "Sampdoria": 75,
        "Genoa": 75, "Verona": 74, "Cagliari": 73, "Lecce": 72, "Empoli": 72,
        "Monza": 73, "Venezia": 70, "Parma": 71
    };

    squadreSerieA.forEach(squadraNome => {
        let base = forzaStorica[squadraNome] || 75;
        // Modificato: riduciamo il range casuale. Ora le squadre avversarie oscilleranno tra -3 e +1.
        // In questo modo eviti che Inter o Milan schizzino a livelli imbattibili per puro caso.
        let forzaVariabile = base + Math.floor(Math.random() * 5) - 3; 
        classificaSerieA.push({ nome: squadraNome, punti: 0, v: 0, p: 0, s: 0, forza: forzaVariabile });
    });

    squadra.forEach(g => registroGolMarcatori[g.nome] = 0);

    aggiornaClassificaLiveUI();
    avviaLoopCampionato(1, 19, mostraMercatoGennaio);
}

// ==========================================================================
// 11. IL MOTORE DELLE GIORNATE
// ==========================================================================
function avviaLoopCampionato(daGiornata, aGiornata, callbackFine) {
    giornataAttuale = daGiornata;
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");

    loopSimulazione = setInterval(() => {
        if (giornataAttuale > aGiornata) {
            clearInterval(loopSimulazione);
            if (callbackFine) callbackFine();
            return;
        }

        document.getElementById("giornata-corrente").innerText = `GIORNATA ${giornataAttuale}`;
        
        let indiceAvversario = (giornataAttuale - 1) % squadreSerieA.length;
        let avversarioOggi = squadreSerieA[indiceAvversario];
        let datiAvversario = classificaSerieA.find(s => s.nome === avversarioOggi);

        // FIX PAREGGITE: Aggiungiamo un bonus "forma" casuale da 0 a 5 per sbloccare le partite tese
        let boostJuve = Math.floor(Math.random() * 6); 
        let boostAvv = Math.floor(Math.random() * 6);  
        let diffReale = (forzaAttuale + boostJuve) - (datiAvversario.forza + boostAvv);

        // Sostituisci le righe dei gol con queste:
        let baseGolJuve = Math.max(0, Math.floor(Math.random() * 3) + (diffReale >= 4 ? 1 : 0) + (diffReale >= 8 ? 1 : 0));
        let baseGolAvv = Math.max(0, Math.floor(Math.random() * 3) + (diffReale <= -4 ? 1 : 0) + (diffReale <= -8 ? 1 : 0));

        statsStagione.giocate++;
        statsStagione.golFatti += baseGolJuve;
        statsStagione.golSubiti += baseGolAvv;

        let risultatoLabel = "";
        let coloreEsito = "";

        let juveObj = classificaSerieA.find(s => s.nome === "Juventus (Tu)");

        if (baseGolJuve > baseGolAvv) {
            statsStagione.vittorie++; statsStagione.punti += 3;
            juveObj.punti += 3; juveObj.v++;
            datiAvversario.s++;
            risultatoLabel = "VITTORIA"; coloreEsito = "#4caf50";
        } else if (baseGolJuve === baseGolAvv) {
            statsStagione.pareggi++; statsStagione.punti += 1;
            juveObj.punti += 1; juveObj.p++;
            datiAvversario.punti += 1; datiAvversario.p++;
        } else {
            statsStagione.sconfitte++;
            juveObj.s++;
            datiAvversario.punti += 3; datiAvversario.v++;
            risultatoLabel = "SCONFITTA"; coloreEsito = "#f44336";
        }

        if (modalitaSelezionata === 'quota-102') {
            if (!verificaFattibilita102(statsStagione.punti, statsStagione.giocate)) {
                clearInterval(loopSimulazione);
                mostraFineCampionatoCompleta();
                return; // Stacca la spina all'istante
            }
        }

        let chiHaSegnato = [];
        for (let i = 0; i < baseGolJuve; i++) {
            let estrattore = Math.random();
            let tiratori = [];
    
            if (estrattore < 0.75) {
                tiratori = squadra.filter(g => g.ruolo.some(r => ["ATT", "AS", "AD", "COC"].includes(r)));
            } else if (estrattore < 0.95) {
                tiratori = squadra.filter(g => g.ruolo.some(r => ["CC", "CDC", "ED", "ES"].includes(r)));
            } else {
                tiratori = squadra.filter(g => g.ruolo.some(r => ["DC", "TD", "TS"].includes(r)));
            }

            if (tiratori.length === 0) {
                tiratori = squadra.filter(g => g.ruolo !== "POR");
            }
    
            let marcatoreScelto = tiratori[Math.floor(Math.random() * tiratori.length)];
    
            registroGolMarcatori[marcatoreScelto.nome]++;
            chiHaSegnato.push(marcatoreScelto.nome);
        }

        classificaSerieA.forEach(s => {
            if (s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi) {
                let probVittoria = 0.42 + (s.forza - 78) * 0.025; 
                let probPareggio = 0.28;
        
                let r = Math.random();
                if (r < probVittoria) {
                    s.punti += 3; s.v++;
                } else if (r < probVittoria + probPareggio) {
                    s.punti += 1; s.p++;
                } else {
                    s.s++;
                }
            }
        });

        classificaSerieA.sort((a, b) => b.punti - a.punti);
        aggiornaClassificaLiveUI();      

        let stringaMarcatori = chiHaSegnato.length > 0 ? ` (${chiHaSegnato.join(", ")})` : "";
        ticker.innerHTML = `<div style="text-align:center;">
            <span style="font-size:0.9rem; color:#888; display:block;">RISULTATO LIVE</span>
            <strong>Juventus ${baseGolJuve} - ${baseGolAvv} ${avversarioOggi}</strong>
            <span style="font-size:0.8rem; color:var(--accento-juve); display:block; margin-top:5px;">${stringaMarcatori}</span>
        </div>`;

        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; padding-bottom:4px;">
                <span style="color:#666; width:70px;">Gior. ${giornataAttuale}</span>
                <span style="flex:1; text-align:left;">vs ${avversarioOggi}</span>
                <span style="font-weight:bold; color:${baseGolJuve >= baseGolAvv ? (baseGolJuve === baseGolAvv ? '#ffeb3b' : '#4caf50') : '#f44336'}">${baseGolJuve} - ${baseGolAvv}</span>
            </div>
        ` + cronologia.innerHTML;

        giornataAttuale++;
    }, 400); 
}

function aggiornaClassificaLiveUI() {
    let container = document.getElementById("classifica-live-container");
    container.innerHTML = "";
    classificaSerieA.forEach((s, idx) => {
        let riga = document.createElement("div");
        riga.style.display = "flex";
        riga.style.justifyContent = "space-between";
        riga.style.padding = "5px 0";
        riga.style.borderBottom = "1px solid #222";
        if (s.nome === "Juventus (Tu)") {
            riga.style.color = "var(--accento-juve)";
            riga.style.fontWeight = "bold";
        }
        riga.innerHTML = `<span>${idx + 1}. ${s.nome}</span><strong>${s.punti} pt</strong>`;
        container.appendChild(riga);
    });
}

// ==========================================================================
// 12. PAUSA DI GENNAIO E MERCATO FAIR PLAY FINANZIARIO
// ==========================================================================
function mostraMercatoGennaio() {
    inFaseMercato = true;
    
    let ticker = document.getElementById("ticker-match-live");
    ticker.innerHTML = `<div style="text-align:center; color:var(--accento-juve);">
        <h3 style="margin:0; font-family:'Bebas Neue'; font-size:1.8rem;">CAMPIONATO IN PAUSA: MERCATO DI GENNAIO</h3>
        <p style="font-size:0.85rem; color:#fff; margin:5px 0 0 0;">Sei alla giornata 19. Vuoi puntellare la rosa o continuare?</p>
    </div>`;

    let boxControlli = document.getElementById("box-controlli-sim");
    boxControlli.innerHTML = `
        <button class="btn-azione-draft btn-usa-reroll" style="flex:1;" onclick="apriPannelloScambio()">FAI UNO SCAMBIO</button>
        <button class="btn-azione-draft btn-completa-stagione attivo" style="flex:1;" onclick="continuaCampionatoRitorno()">CONTINUA COSÌ</button>
    `;
}

function apriPannelloScambio() {
    let btnScambio = document.querySelector("#box-controlli-sim .btn-usa-reroll");
    if (btnScambio) {
        btnScambio.disabled = true;
        btnScambio.style.opacity = "0.5";
        btnScambio.style.cursor = "not-allowed";
        btnScambio.onclick = null; 
    }

    let ticker = document.getElementById("ticker-match-live");
    ticker.innerHTML = `<div style="width:100%;">
        <p style="margin:0 0 10px 0; font-size:0.9rem; text-align:center; color:#aaa;">Seleziona il giocatore che desideri cedere dal tuo 11 titolare:</p>
        <div id="lista-taglio-mercato" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-height:150px; overflow-y:auto; padding:5px;"></div>
    </div>`;

    let containerTaglio = document.getElementById("lista-taglio-mercato");
    squadra.forEach((giocatore, index) => {
        let btnG = document.createElement("button");
        btnG.style.background = "#222";
        btnG.style.border = "1px solid #444";
        btnG.style.color = "#fff";
        btnG.style.padding = "6px";
        btnG.style.borderRadius = "4px";
        btnG.style.fontSize = "0.75rem";
        btnG.style.cursor = "pointer";
        btnG.innerText = `[${giocatore.ruolo}] ${giocatore.nome} (${giocatore.rating})`;
        
        btnG.onclick = () => {
            let tuttiBottoniTaglio = document.querySelectorAll("#lista-taglio-mercato button");
            tuttiBottoniTaglio.forEach(b => {
                b.disabled = true;
                b.style.opacity = "0.5";
                b.style.cursor = "not-allowed";
            });
            
            generaOpzioniAcquisto(index);
        };
        
        containerTaglio.appendChild(btnG);
    });
}

function generaOpzioniAcquisto(indexGiocatoreDaTagliare) {
    let tagliato = squadra[indexGiocatoreDaTagliare];
    
    // 🔥 FIX SINO-ANNATE: Non rimuoviamo il nome qui, così il vecchio giocatore 
    // rimane inserito nei "nomiGiocatoriDraftati" e blocca i suoi cloni di altre annate!

    // Calcolo del budget specifico per il FPF
    let budgetMercato = 9999;
    if (modalitaSelezionata === 'mod-fairplay') {
        budgetMercato = budgetRimanente + tagliato.rating;
    }

    // 🔥 FIX RUOLI: Prendiamo il ruolo principale (il primo dell'array) del giocatore che stai sostituendo
    let ruoloPrincipale = tagliato.ruolo[0];

    // Filtra il DB: i candidati devono avere quel ruolo specifico tra i loro ruoli e non essere doppioni
    let opzioniCompatibili = databaseJuve.filter(g => 
        g.ruolo.includes(ruoloPrincipale) && !nomiGiocatoriDraftati.includes(g.nome)
    );

    // Nella modalità FPF, i giocatori in vetrina non possono costare più del budget ricalcolato
    if (modalitaSelezionata === 'mod-fairplay') {
        opzioniCompatibili = opzioniCompatibili.filter(g => g.rating <= budgetMercato);
    }
    
    // Estrai le opzioni validate
    let treProposte = opzioniCompatibili.sort(() => 0.5 - Math.random()).slice(0, 3);

    let extraTestoBudget = modalitaSelezionata === 'mod-fairplay' ? `<br><span style="color:#fff; font-size:0.8rem;">Budget ricalcolato: <strong>${budgetMercato} Pt</strong></span>` : "";

    let ticker = document.getElementById("ticker-match-live");
    ticker.innerHTML = `<div style="width:100%;">
        <p style="margin:0 0 10px 0; font-size:0.9rem; text-align:center; color:var(--accento-juve);">
            Sostituto per ${tagliato.nome}: Scegli chi acquistare ${extraTestoBudget}
        </p>
        <div id="opzioni-acquisto-box" style="display:flex; gap:10px; justify-content:center;"></div>
    </div>`;

    let boxAcquisti = document.getElementById("opzioni-acquisto-box");
    treProposte.forEach(nuovoG => {
        let divCarta = document.createElement("div");
        divCarta.style.background = "linear-gradient(180deg, #252525, #111)";
        divCarta.style.border = "1px solid var(--accento-juve)";
        divCarta.style.borderRadius = "6px";
        divCarta.style.padding = "10px";
        divCarta.style.cursor = "pointer";
        divCarta.style.textAlign = "center";
        divCarta.style.minWidth = "100px";
        
        divCarta.innerHTML = `
            <div style="font-weight:bold; font-size:1.1rem; color:var(--accento-juve);">${nuovoG.rating}</div>
            <div style="font-size:0.8rem; margin:3px 0;">${nuovoG.nome}</div>
            <div style="font-size:0.65rem; color:#888;">Anni: ${nuovoG.stagione}</div>
        `;
        
        divCarta.onclick = () => {
            // Se in FPF, scalo il budget al momento dell'acquisto
            if (modalitaSelezionata === 'mod-fairplay') {
                budgetRimanente = budgetMercato - nuovoG.rating;
                const testBudget = document.getElementById("headbar-budget-count");
                if (testBudget) {
                    testBudget.innerText = budgetRimanente;
                    testBudget.style.color = budgetRimanente < 150 ? "#f44336" : "#ffcc00";
                }
            }

            // 🔥 FIX DOPIE ANNATE (Parte 2): Rimuoviamo il vecchio nome solo ADESSO che lo scambio è confermato
            let oldIndex = nomiGiocatoriDraftati.indexOf(tagliato.nome);
            if (oldIndex !== -1) nomiGiocatoriDraftati.splice(oldIndex, 1);

            squadra[indexGiocatoreDaTagliare] = nuovoG;
            nomiGiocatoriDraftati.push(nuovoG.nome); // Blocca il nuovo nome estratto
            
            delete registroGolMarcatori[tagliato.nome];
            registroGolMarcatori[nuovoG.nome] = 0;

            let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
            forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;
            classificaSerieA.find(s => s.nome === "Juventus (Tu)").forza = forzaAttuale;

            mostraMessaggioCustom("OPERAZIONE CONCLUSA", `Acquisto Completato!\n\nEntra in squadra ${nuovoG.nome}.`);
            continuaCampionatoRitorno();
        };
        boxAcquisti.appendChild(divCarta);
    });
}

function continuaCampionatoRitorno() {
    inFaseMercato = false;
    document.getElementById("box-controlli-sim").innerHTML = "";
    avviaLoopCampionato(20, 38, mostraFineCampionatoCompleta);
}

// ==========================================================================
// 13. COMPILAZIONE SCHERMATA RECAP FINALE
// ==========================================================================
function mostraFineCampionatoCompleta() {
    document.getElementById("schermata-simulazione").style.display = "none";
    document.getElementById("schermata-recap").style.display = "block";

    let commentoBox = document.getElementById("commento-dirigenza");
    let pt = statsStagione.punti;
    let pos = classificaSerieA.findIndex(s => s.nome === "Juventus (Tu)") + 1;

    // BIVIO 1: Valutazione esclusiva per la Quota 102
    if (modalitaSelezionata === 'quota-102') {
        let maxTeoricoPossibile = pt + ((38 - statsStagione.giocate) * 3);
        
        if (pt >= 103) {
            commentoBox.innerHTML = `👑 <strong>CAMPIONI IMMORTALI!</strong> Hai chiuso a ${pt} punti, disintegrando il record di 102 di Antonio Conte. Lo Stadium è in un delirio assoluto!`;
        } else {
            commentoBox.innerHTML = `❌ <strong>IMPRESA FALLITA.</strong> La matematica ti condanna alla giornata ${statsStagione.giocate} con ${pt} punti (proiezione massima: ${maxTeoricoPossibile}). Il record di Conte resta imbattuto.`;
        }
    } 
    // BIVIO 2: Valutazione standard per tutte le altre modalità
    else if (pos === 1) {
        commentoBox.innerHTML = `🏆 <strong>CAMPIONI D'ITALIA!</strong> Hai dominato la Serie A totalizzando ben ${pt} punti. Questo scudetto entra di diritto nella storia del club. La dirigenza è estasiata!`;
    } else if (pos === 2 && pt >= 85) {
        commentoBox.innerHTML = `🥈 <strong>BEFFA CLAMOROSA!</strong> Hai fatto una stagione pazzesca da ${pt} punti, ma un avversario ha fatto un miracolo. Chiudere secondi così fa malissimo, ma la dirigenza applaude lo sforzo.`;
    } else if (pos <= 4) {
        commentoBox.innerHTML = `⭐ <strong>ZONA CHAMPIONS CONQUISTATA.</strong> Chiudi al ${pos}° posto con ${pt} punti. Obiettivo minimo raggiunto, ma sai bene che qui l'unica cosa che conta è vincere...`;
    } else if (pos <= 10) {
        commentoBox.innerHTML = `😐 <strong>STAGIONE ALTALENANTE.</strong> Chiusura a metà classifica al ${pos}° posto con ${pt} punti. Troppi passi falsi e manovra a tratti prevedibile. Serve rifondare.`;
    } else {
        commentoBox.innerHTML = `📉 <strong>DISASTRO ESONERO!</strong> Chiudere la stagione della Juventus al ${pos}° posto è inaccettabile. I tifosi contestano e la società ti solleva dall'incarico.`;
    }

    let tbodyClassifica = document.querySelector("#tabella-classifica-finale tbody");
    tbodyClassifica.innerHTML = "";
    classificaSerieA.forEach((s, idx) => {
        let tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #1a1a1a";
        if (s.nome === "Juventus (Tu)") {
            tr.style.background = "rgba(224, 200, 112, 0.1)";
            tr.style.color = "var(--accento-juve)";
            tr.style.fontWeight = "bold";
        }
        tr.innerHTML = `
            <td style="padding:10px 5px; color:#888;">${idx + 1}</td>
            <td>${s.nome.toUpperCase()}</td>
            <td style="font-weight:bold;">${s.punti}</td>
            <td>${s.v || 0}</td>
            <td>${s.p || 0}</td>
            <td>${s.s || 0}</td>
        `;
        tbodyClassifica.appendChild(tr);
    });

    let statsBox = document.getElementById("stats-riepilogo-juve");
    statsBox.innerHTML = `
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:var(--accento-juve);">${statsStagione.punti}</span><p style="margin:0; font-size:0.7rem; color:#888;">PUNTI TOTALI</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#4caf50;">${statsStagione.vittorie}</span><p style="margin:0; font-size:0.7rem; color:#888;">VITTORIE</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#fff;">${statsStagione.golFatti}</span><p style="margin:0; font-size:0.7rem; color:#888;">GOL FATTI</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#f44336;">${statsStagione.golSubiti}</span><p style="margin:0; font-size:0.7rem; color:#888;">GOL SUBITI</p></div>
    `;

    let boxMarcatori = document.getElementById("lista-marcatori-finale");
    boxMarcatori.innerHTML = "";
    
    let ordinati = Object.entries(registroGolMarcatori)
        .map(([nome, gol]) => ({ nome, gol }))
        .sort((a, b) => b.gol - a.gol);

    ordinati.forEach((m, idx) => {
        let rigaM = document.createElement("div");
        rigaM.style.display = "flex";
        rigaM.style.justifyContent = "space-between";
        rigaM.style.background = "rgba(255,255,255,0.02)";
        rigaM.style.padding = "8px 12px";
        rigaM.style.borderRadius = "4px";
        rigaM.style.fontSize = "0.85rem";
        
        let corona = idx === 0 && m.gol > 0 ? "👑 " : "";
        rigaM.innerHTML = `<span>${idx + 1}. ${corona}${m.nome}</span><strong style="color:var(--accento-juve);">${m.gol} Gol</strong>`;
        boxMarcatori.appendChild(rigaM);
    });
}

modalitaSelezionata = 'classica';

function mostraSchermataModalita() {
    const screenHome = document.getElementById('screen-home');
    const screenModalita = document.getElementById('screen-modalita');

    screenHome.classList.add('nascosto');
    screenModalita.classList.remove('nascosto');
    screenModalita.classList.add('fade-in');
}

function impostaModalitaEAvvia(scelta) {
    modalitaSelezionata = scelta;
    document.getElementById('screen-modalita').classList.add('nascosto');
    
    if (typeof avviaSceltaModulo === 'function') {
        avviaSceltaModulo(scelta);
    } else {
        console.error("ERRORE: La funzione 'avviaSceltaModulo' non è stata trovata in script.js!");
    }
}

// ==========================================================================
// DATABASE CHAMPIONS LEAGUE
// ==========================================================================
const squadreChampionsTiers = {
    alta: [
        { nome: "Real Madrid", forza: 93 }, { nome: "Manchester City", forza: 92 }, 
        { nome: "Bayern Monaco", forza: 90 }, { nome: "Liverpool", forza: 89 }, 
        { nome: "Arsenal", forza: 88 }, { nome: "PSG", forza: 88 }, 
        { nome: "Barcellona", forza: 87 }, { nome: "Inter", forza: 86 }, 
        { nome: "B. Leverkusen", forza: 86 }
    ],
    medioAlta: [
        { nome: "Atletico Madrid", forza: 84 }, { nome: "B. Dortmund", forza: 84 }, 
        { nome: "Atalanta", forza: 83 }, { nome: "Milan", forza: 82 }, 
        { nome: "RB Lipsia", forza: 82 }, { nome: "Sporting CP", forza: 81 }, 
        { nome: "Aston Villa", forza: 81 }, { nome: "PSV Eindhoven", forza: 80 }, 
        { nome: "Benfica", forza: 80 }
    ],
    medioBassa: [
        { nome: "Porto", forza: 79 }, { nome: "Monaco", forza: 78 }, 
        { nome: "Lille", forza: 78 }, { nome: "Girona", forza: 77 }, 
        { nome: "Stoccarda", forza: 77 }, { nome: "Feyenoord", forza: 76 }, 
        { nome: "Galatasaray", forza: 76 }, { nome: "Brest", forza: 75 }, 
        { nome: "Club Brugge", forza: 75 }
    ],
    bassa: [
        { nome: "Celtic", forza: 74 }, { nome: "Salisburgo", forza: 74 }, 
        { nome: "Stella Rossa", forza: 72 }, { nome: "Dinamo Zagabria", forza: 71 }, 
        { nome: "Sparta Praga", forza: 70 }, { nome: "Young Boys", forza: 70 }, 
        { nome: "Sturm Graz", forza: 68 }, { nome: "Slovan Bratislava", forza: 65 }
    ]
}; 

let classificaEuropa = [];
let qualificatiOttaviDiretti = [];
let qualificatiSpareggi = [];
let superstitiChampions = []; 

function generaCalendarioChampionsJuve() {
    let a = [...squadreChampionsTiers.alta].sort(() => 0.5 - Math.random()).slice(0, 2);
    let ma = [...squadreChampionsTiers.medioAlta].sort(() => 0.5 - Math.random()).slice(0, 2);
    let mb = [...squadreChampionsTiers.medioBassa].sort(() => 0.5 - Math.random()).slice(0, 2);
    let b = [...squadreChampionsTiers.bassa].sort(() => 0.5 - Math.random()).slice(0, 2);
    
    return [...a, ...ma, ...mb, ...b].sort(() => 0.5 - Math.random());
}

function simulaChampionsLeague() {
    statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: 0, golFatti: 0, golSubiti: 0 };
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";
    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()}`;

    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    classificaEuropa = [{ nome: "Juventus (Tu)", punti: 0, v: 0, p: 0, s: 0, golFatti: 0, golSubiti: 0, diffReti: 0, forza: forzaAttuale }];
    
    Object.keys(squadreChampionsTiers).forEach(fascia => {
        squadreChampionsTiers[fascia].forEach(s => {
            classificaEuropa.push({ 
                nome: s.nome, punti: 0, v: 0, p: 0, s: 0, golFatti: 0, golSubiti: 0, diffReti: 0, 
                forza: s.forza + (Math.floor(Math.random() * 5) - 2) 
            });
        });
    });

    let calendarioJuve = generaCalendarioChampionsJuve();
    aggiornaClassificaChampionsUI();
    
    avviaGironeChampions(1, 8, calendarioJuve, calcolaEsitoGirone);
}

function avviaGironeChampions(giornataAttuale, maxGiornate, calendarioJuve, callbackFine) {
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");
    let boxControlli = document.getElementById("box-controlli-sim");
    boxControlli.innerHTML = ""; 

    let loopChampions = setInterval(() => {
        if (giornataAttuale > maxGiornate) {
            clearInterval(loopChampions);
            if (callbackFine) callbackFine();
            return;
        }

        document.getElementById("giornata-corrente").innerText = `FASE CAMPIONATO - GIORNATA ${giornataAttuale} / 8`;
        let avversarioOggi = calendarioJuve[giornataAttuale - 1].nome;
        
        let juveObj = classificaEuropa.find(s => s.nome === "Juventus (Tu)");
        let avvObj = classificaEuropa.find(s => s.nome === avversarioOggi);

        let boostJuve = Math.floor(Math.random() * 6); 
        let boostAvv = Math.floor(Math.random() * 6);  
        let diffReale = (forzaAttuale + boostJuve) - (avvObj.forza + boostAvv);

        // Sostituisci le righe dei gol con queste:
        let golJuve = Math.max(0, Math.floor(Math.random() * 3) + (diffReale >= 4 ? 1 : 0) + (diffReale >= 9 ? 1 : 0));
        let golAvv = Math.max(0, Math.floor(Math.random() * 3) + (diffReale <= -4 ? 1 : 0) + (diffReale <= -9 ? 1 : 0));

        juveObj.golFatti += golJuve; juveObj.golSubiti += golAvv; juveObj.diffReti += (golJuve - golAvv);
        avvObj.golFatti += golAvv; avvObj.golSubiti += golJuve; avvObj.diffReti += (golAvv - golJuve);

        if (golJuve > golAvv) {
            juveObj.punti += 3; juveObj.v++; avvObj.s++;
        } else if (golJuve === golAvv) {
            juveObj.punti += 1; juveObj.p++; avvObj.punti += 1; avvObj.p++;
        } else {
            juveObj.s++; avvObj.punti += 3; avvObj.v++;
        }

        let squadreRimaste = classificaEuropa.filter(s => s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi);
        squadreRimaste.sort(() => 0.5 - Math.random()); 

        for (let i = 0; i < squadreRimaste.length; i += 2) {
            let s1 = squadreRimaste[i];
            let s2 = squadreRimaste[i+1];
            
            let diffAltri = s1.forza - s2.forza;
            let g1 = Math.max(0, Math.floor(Math.random() * 3) + (diffAltri > 5 ? 1 : 0));
            let g2 = Math.max(0, Math.floor(Math.random() * 3) + (diffAltri < -5 ? 1 : 0));
            
            s1.golFatti += g1; s1.golSubiti += g2; s1.diffReti += (g1 - g2);
            s2.golFatti += g2; s2.golSubiti += g1; s2.diffReti += (g2 - g1);
            
            if (g1 > g2) {
                s1.punti += 3; s1.v++; s2.s++;
            } else if (g1 === g2) {
                s1.punti += 1; s1.p++; s2.punti += 1; s2.p++;
            } else {
                s2.punti += 3; s2.v++; s1.s++;
            }
        }

        classificaEuropa.sort((a, b) => {
            if (b.punti !== a.punti) return b.punti - a.punti;
            if (b.diffReti !== a.diffReti) return b.diffReti - a.diffReti;
            return b.golFatti - a.golFatti;
        });

        aggiornaClassificaChampionsUI();

        ticker.innerHTML = `
            <div style="text-align:center;">
                <span style="font-size:0.8rem; color:#aaa; display:block; letter-spacing: 1px;">RISULTATO LIVE</span>
                <strong style="font-size:1.4rem; font-family:'Bebas Neue', sans-serif;">Juventus ${golJuve} - ${golAvv} ${avvObj.nome}</strong>
            </div>
        `;

        let col = golJuve > golAvv ? '#4caf50' : (golJuve === golAvv ? '#ffeb3b' : '#f44336');
        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:6px 0; font-size:0.9rem;">
                <span style="color:#666; font-weight:bold; width:50px;">G ${giornataAttuale}</span>
                <span style="flex:1; text-align:left;">vs ${avvObj.nome}</span>
                <span style="font-weight:bold; color:${col}">${golJuve} - ${golAvv}</span>
            </div>
        ` + cronologia.innerHTML;

        giornataAttuale++;
    }, 800);
}

function aggiornaClassificaChampionsUI() {
    let container = document.getElementById("classifica-live-container");
    container.innerHTML = "";
    
    classificaEuropa.forEach((s, idx) => {
        let riga = document.createElement("div");
        riga.style.display = "flex";
        riga.style.justifyContent = "space-between";
        riga.style.padding = "6px 8px";
        riga.style.borderBottom = "1px solid #1a1a1a";
        riga.style.fontSize = "0.85rem";
        
        if (idx < 8) riga.style.borderLeft = "4px solid #4caf50";       
        else if (idx < 24) riga.style.borderLeft = "4px solid #ffeb3b"; 
        else riga.style.borderLeft = "4px solid #f44336";               
        
        if (s.nome === "Juventus (Tu)") {
            riga.style.background = "rgba(224, 200, 112, 0.12)";
            riga.style.color = "var(--accento-juve)";
            riga.style.fontWeight = "bold";
        }
        
        let segnoDR = s.diffReti > 0 ? "+" : "";
        riga.innerHTML = `
            <span style="flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <span style="color: #666; margin-right: 5px;">${idx + 1}.</span>${s.nome}
            </span>
            <span style="width: 40px; text-align: center; color: #888;">${segnoDR}${s.diffReti}</span>
            <strong style="width: 45px; text-align: right;">${s.punti} PT</strong>
        `;
        container.appendChild(riga);
    });
}

function calcolaEsitoGirone() {
    let posJuve = classificaEuropa.findIndex(s => s.nome === "Juventus (Tu)") + 1;
    let ticker = document.getElementById("ticker-match-live");
    let boxControlli = document.getElementById("box-controlli-sim");
    
    qualificatiOttaviDiretti = classificaEuropa.slice(0, 8);
    qualificatiSpareggi = classificaEuropa.slice(8, 24);
    
    if (posJuve <= 8) {
        ticker.innerHTML = `<div style="text-align:center; color:#4caf50;"><h3>QUALIFICATO DIRETTO!</h3><p>Chiuso al ${posJuve}° posto. Accedi subito agli Ottavi di finale.</p></div>`;
        boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="simulaSpareggiSenzaJuve()">VAI AGLI OTTAVI</button>`;
    } else if (posJuve <= 24) {
        ticker.innerHTML = `<div style="text-align:center; color:#ffeb3b;"><h3>SPAREGGI PLAYOFF</h3><p>Chiuso al ${posJuve}° posto. Affronterai uno spareggio secco da dentro o fuori.</p></div>`;
        boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="avviaSpareggioJuve()">GIOCA LO SPAREGGIO</button>`;
    } else {
        ticker.innerHTML = `<div style="text-align:center; color:#f44336;"><h3>ELIMINATO</h3><p>Finisce qui la corsa europea. Chiuso al ${posJuve}° posto.</p></div>`;
        boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="location.reload()">RITENTA</button>`;
    }
}

function simulaMatchInvisibile(s1, s2, isFinale = false) {
    let diff = s1.forza - s2.forza;
    
    if (isFinale) {
        let g1 = Math.max(0, Math.floor(Math.random() * 4) + (diff > 6 ? 1 : 0));
        let g2 = Math.max(0, Math.floor(Math.random() * 4) + (diff < -6 ? 1 : 0));
        if (g1 === g2) return Math.random() > 0.5 ? s1 : s2;
        return g1 > g2 ? s1 : s2;
    } else {
        let g1_andata = Math.max(0, Math.floor(Math.random() * 4) + (diff > 6 ? 1 : 0));
        let g2_andata = Math.max(0, Math.floor(Math.random() * 4) + (diff < -6 ? 1 : 0));
        
        let g1_ritorno = Math.max(0, Math.floor(Math.random() * 4) + (diff > 6 ? 1 : 0));
        let g2_ritorno = Math.max(0, Math.floor(Math.random() * 4) + (diff < -6 ? 1 : 0));
        
        let tot1 = g1_andata + g1_ritorno;
        let tot2 = g2_andata + g2_ritorno;
        
        if (tot1 === tot2) return Math.random() > 0.5 ? s1 : s2; 
        return tot1 > tot2 ? s1 : s2;
    }
}

function simulaMatchVisibile(avversario, nomeFase) {
    let diff = forzaAttuale - avversario.forza;
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");
    let boxControlli = document.getElementById("box-controlli-sim");
    
    if (nomeFase === 'FINALE') {
        let golJuve = Math.max(0, Math.floor(Math.random() * 4) + (diff > 5 ? 1 : 0));
        let golAvv = Math.max(0, Math.floor(Math.random() * 4) + (diff < -5 ? 1 : 0));
        let note = "";
        let vinto = false;
        
        if (golJuve === golAvv) {
            if (Math.random() > 0.5) { golJuve++; note = " (d.t.r.)"; vinto = true; } 
            else { golAvv++; note = " (d.t.r.)"; vinto = false; }
        } else if (golJuve > golAvv) {
            vinto = true;
        }
        
        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; padding:6px 0; font-size:0.9rem;">
                <span style="color:var(--accento-juve); font-weight:bold; width:90px;">${nomeFase}</span>
                <span style="flex:1; text-align:left;">vs ${avversario.nome}</span>
                <span style="font-weight:bold; color:${vinto ? '#4caf50' : '#f44336'}">${golJuve} - ${golAvv}${note}</span>
            </div>
        ` + cronologia.innerHTML;
        
        if (!vinto) {
            ticker.innerHTML = `<div style="text-align:center; color:#f44336;"><h3>ELIMINATO IN FINALE</h3><p>Il sogno si ferma all'ultimo atto contro il ${avversario.nome} (${golJuve}-${golAvv}${note}).</p></div>`;
            boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="location.reload()">RITENTA LA STAGIONE</button>`;
        }
        return { vinto: vinto };
        
    } else {
        let gJuve_a = Math.max(0, Math.floor(Math.random() * 4) + (diff > 5 ? 1 : 0));
        let gAvv_a = Math.max(0, Math.floor(Math.random() * 4) + (diff < -5 ? 1 : 0));
        
        let gJuve_r = Math.max(0, Math.floor(Math.random() * 4) + (diff > 5 ? 1 : 0));
        let gAvv_r = Math.max(0, Math.floor(Math.random() * 4) + (diff < -5 ? 1 : 0));
        
        let totJuve = gJuve_a + gJuve_r;
        let totAvv = gAvv_a + gAvv_r;
        let note = "";
        let vinto = false;
        
        if (totJuve === totAvv) {
            if (Math.random() > 0.5) { totJuve++; note = " (d.t.r.)"; vinto = true; } 
            else { totAvv++; note = " (d.t.r.)"; vinto = false; }
        } else if (totJuve > totAvv) {
            vinto = true;
        }
        
        cronologia.innerHTML = `
            <div style="display:flex; flex-direction:column; border-bottom:1px solid #1a1a1a; padding:8px 0; font-size:0.9rem;">
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:var(--accento-juve);">
                    <span>${nomeFase}</span>
                    <span style="color:${vinto ? '#4caf50' : '#f44336'}">TOT: ${totJuve} - ${totAvv}${note}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:#888; font-size:0.8rem; margin-top:2px;">
                    <span>vs ${avversario.nome}</span>
                    <span>Andata: ${gJuve_a}-${gAvv_a} | Ritorno: ${gJuve_r}-${gAvv_r}</span>
                </div>
            </div>
        ` + cronologia.innerHTML;
        
        if (vinto) {
            ticker.innerHTML = `<div style="text-align:center; color:#4caf50;"><h3>TURNO PASSATO!</h3><p>Superato il ${avversario.nome} (Aggregato: ${totJuve}-${totAvv}${note})!</p></div>`;
        } else {
            ticker.innerHTML = `<div style="text-align:center; color:#f44336;"><h3>ELIMINATO</h3><p>Il cammino si ferma contro il ${avversario.nome} (Aggregato: ${totJuve}-${totAvv}${note}).</p></div>`;
            boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="location.reload()">RITENTA LA STAGIONE</button>`;
        }
        return { vinto: vinto };
    }
}

function simulaSpareggiSenzaJuve() {
    let teamPlayoff = [...qualificatiSpareggi].sort(() => 0.5 - Math.random());
    let vincenti = [];
    for(let i = 0; i < teamPlayoff.length; i += 2) {
        vincenti.push(simulaMatchInvisibile(teamPlayoff[i], teamPlayoff[i+1], false));
    }
    superstitiChampions = [...qualificatiOttaviDiretti, ...vincenti];
    avviaFaseEliminatoria('Ottavi di Finale');
}

function avviaSpareggioJuve() {
    document.getElementById("giornata-corrente").innerText = "SPAREGGI PLAYOFF";
    let teamPlayoff = [...qualificatiSpareggi].filter(s => s.nome !== "Juventus (Tu)");
    
    let indexAvv = Math.floor(Math.random() * teamPlayoff.length);
    let avversario = teamPlayoff[indexAvv];
    teamPlayoff.splice(indexAvv, 1); 
    
    let vincentiAltri = [];
    for(let i = 0; i < teamPlayoff.length; i += 2) {
        vincentiAltri.push(simulaMatchInvisibile(teamPlayoff[i], teamPlayoff[i+1], false));
    }
    
    let esito = simulaMatchVisibile(avversario, 'Playoff');
    if (esito.vinto) {
        let juveObj = classificaEuropa.find(s => s.nome === "Juventus (Tu)");
        superstitiChampions = [...qualificatiOttaviDiretti, juveObj, ...vincentiAltri];
        let boxControlli = document.getElementById("box-controlli-sim");
        boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="avviaFaseEliminatoria('Ottavi di Finale')">ACCEDI AGLI OTTAVI</button>`;
    }
}

function avviaFaseEliminatoria(faseAttuale) {
    document.getElementById("giornata-corrente").innerText = faseAttuale.toUpperCase();
    let ticker = document.getElementById("ticker-match-live");
    let boxControlli = document.getElementById("box-controlli-sim");
    
    let juveObj = superstitiChampions.find(s => s.nome === "Juventus (Tu)");
    if (!juveObj) return;

    let altriSuperstiti = superstitiChampions.filter(s => s.nome !== "Juventus (Tu)");
    let indexAvv = Math.floor(Math.random() * altriSuperstiti.length);
    let avversario = altriSuperstiti[indexAvv];
    altriSuperstiti.splice(indexAvv, 1);

    let isFinale = (faseAttuale === 'FINALE');

    let vincentiAltri = [];
    for (let i = 0; i < altriSuperstiti.length; i += 2) {
        vincentiAltri.push(simulaMatchInvisibile(altriSuperstiti[i], altriSuperstiti[i+1], isFinale));
    }

    let esito = simulaMatchVisibile(avversario, faseAttuale);
    if (esito.vinto) {
        superstitiChampions = [juveObj, ...vincentiAltri];
        
        let prossimaFase = "";
        if (faseAttuale === 'Ottavi di Finale') prossimaFase = 'Quarti di Finale';
        else if (faseAttuale === 'Quarti di Finale') prossimaFase = 'Semifinale';
        else if (faseAttuale === 'Semifinale') prossimaFase = 'FINALE';
        
        if (prossimaFase) {
            boxControlli.innerHTML = `<button class="btn-azione-draft btn-completa-stagione attivo" style="width:100%;" onclick="avviaFaseEliminatoria('${prossimaFase}')">GIOCA ${prossimaFase.toUpperCase()}</button>`;
        } else {
            ticker.innerHTML = `<div style="text-align:center; color:var(--accento-juve);">
                <h2 style="font-size:3rem; margin:0; letter-spacing:1px;">🏆 CAMPIONI D'EUROPA! 🏆</h2>
                <p>Impresa leggendaria! Hai trionfato nella Finalissima contro il l'ostico ${avversario.nome}. La coppa torna a Torino!</p>
            </div>`;
            boxControlli.innerHTML = `<button class="btn-azione-draft btn-usa-reroll attivo" style="width:100%;" onclick="location.reload()">TORNA ALLA HOME</button>`;
        }
    }
}

// ==========================================
// FUNZIONI MODAL CUSTOM
// ==========================================
function mostraMessaggioCustom(titolo, messaggio, callback) {
    const modal = document.getElementById("modal-custom-alert");
    
    // 1. CORREZIONE ID: Usiamo gli ID esatti del tuo index.html
    document.getElementById("modal-titolo").innerText = titolo;
    document.getElementById("modal-messaggio").innerText = messaggio;
    
    // 2. CORREZIONE VISIBILITÀ: Togliamo "nascosto" prima di aggiungere "attivo"
    modal.classList.remove("nascosto");
    
    // Un micro-ritardo assicura che l'animazione CSS (opacity/scale) funzioni
    setTimeout(() => {
        modal.classList.add("attivo");
    }, 10);
    
    // Recupera il bottone "OK, CAPITO"
    const btnOk = modal.querySelector(".btn-scegli-mode");
    
    // 3. LOGICA DI CHIUSURA: Sovrascrive l'evento onclick del bottone
    btnOk.onclick = () => {
        modal.classList.remove("attivo");
        
        // Aspettiamo che finisca l'animazione di uscita (300ms) per rimettere "nascosto"
        setTimeout(() => {
            modal.classList.add("nascosto");
            
            // Facciamo ripartire la simulazione (il loop) SOLO ADESSO
            if (callback) {
                callback();
            }
        }, 300);
    };
}

function chiudiMessaggioCustom() {
    let modal = document.getElementById("modal-custom-alert");
    modal.classList.remove("attivo");
    
    setTimeout(() => {
        modal.classList.add("nascosto");
    }, 300); 
}

// ==========================================================================
// MODALITÀ "LA RISALITA" (Serie B 2006/2007)
// ==========================================================================
const squadreSerieB2006 = [
    "Napoli", "Genoa", "Bologna", "Rimini", "Mantova", "Brescia", 
    "Piacenza", "Treviso", "Bari", "Lecce", "Albinoleffe", "Frosinone", 
    "Triestina", "Verona", "Vicenza", "Pescara", "Arezzo", "Crotone", 
    "Modena", "Spezia", "Cesena"
];

// ==========================================================================
// NUOVA LOGICA DI SELEZIONE E POSIZIONAMENTO FEDELISSIMI (A CLICK)
// ==========================================================================

function avviaSceltaFedelissimi() {
    const modal = document.getElementById("modal-fedelissimi");
    const griglia = document.getElementById("griglia-scelta");
    const containerDestra = document.getElementById("container-scelti-destra");
    const btnConferma = document.getElementById("btn-conferma-fedelissimi");

    modal.style.display = "flex";
    griglia.innerHTML = "";
    containerDestra.innerHTML = "";
    fedelissimiScelti = [];
    
    btnConferma.disabled = true;
    btnConferma.style.opacity = "0.4";
    btnConferma.style.cursor = "not-allowed";
    btnConferma.innerText = "CONFERMA SCELTE (0/2)";

    // Generiamo il pool dei campioni simbolo per la rinascita
    const iconeRinascita = ["G. Buffon", "A. Del Piero", "P. Nedved", "M. Camoranesi", "D. Trezeguet", "G. Chiellini"];
    let poolFedeli = [];
    
    iconeRinascita.forEach(nome => {
        let giocatore = databaseJuve.find(g => g.nome === nome && (g.stagione === "06/07" || g.stagione === "02/03" || g.stagione === "01/02" || g.stagione === "07/08" || g.stagione === "05/06" || g.stagione === "11/12"));
        if (!giocatore) giocatore = databaseJuve.find(g => g.nome === nome);
        if (giocatore) poolFedeli.push(giocatore);
    });

    poolFedeli.forEach(giocatore => {
        const card = document.createElement("div");
        card.style.background = "#111";
        card.style.border = "1px solid #333";
        card.style.borderRadius = "8px";
        card.style.padding = "15px";
        card.style.textAlign = "center";
        card.style.cursor = "pointer";
        card.style.transition = "all 0.2s ease";
        
        card.innerHTML = `
            <div style="font-family:'Bebas Neue', sans-serif; font-size:1.4rem; color:var(--accento-juve);">${giocatore.nome}</div>
            <div style="font-size:0.75rem; color:#888; margin: 2px 0;">${giocatore.ruolo.join('/')} • ${giocatore.stagione}</div>
            <div style="font-size:1.8rem; font-weight:bold; color:#fff; margin-top:5px;">${giocatore.rating}</div>
        `;

        card.addEventListener("click", () => {
            if (fedelissimiScelti.some(g => g.id === giocatore.id)) {
                fedelissimiScelti = fedelissimiScelti.filter(g => g.id !== giocatore.id);
                card.style.border = "1px solid #333";
                card.style.background = "#111";
            } else {
                if (fedelissimiScelti.length < 2) {
                    fedelissimiScelti.push(giocatore);
                    card.style.border = "2px solid var(--accento-juve)";
                    card.style.background = "rgba(224, 200, 112, 0.08)";
                } else {
                    alert("Puoi scegliere al massimo 2 fedelissimi!");
                }
            }
            aggiornaRecapFedelissimi();
        });

        griglia.appendChild(card);
    });
}

function aggiornaRecapFedelissimi() {
    const containerDestra = document.getElementById("container-scelti-destra");
    const btnConferma = document.getElementById("btn-conferma-fedelissimi");
    
    containerDestra.innerHTML = "";
    
    fedelissimiScelti.forEach(g => {
        const voce = document.createElement("div");
        voce.style.background = "#1c1c1c";
        voce.style.padding = "10px";
        voce.style.borderRadius = "6px";
        voce.style.borderLeft = "4px solid var(--accento-juve)";
        voce.style.display = "flex";
        voce.style.justifyContent = "space-between";
        voce.style.alignItems = "center";
        
        voce.innerHTML = `
            <div>
                <strong style="color:#fff; font-size:0.9rem;">${g.nome}</strong>
                <span style="display:block; font-size:0.7rem; color:#666;">${g.ruolo.join('/')}</span>
            </div>
            <strong style="color:var(--accento-juve); font-size:1.2rem;">${g.rating}</strong>
        `;
        containerDestra.appendChild(voce);
    });

    btnConferma.innerText = `CONFERMA SCELTE (${fedelissimiScelti.length}/2)`;
    
    if (fedelissimiScelti.length === 2) {
        btnConferma.disabled = false;
        btnConferma.style.opacity = "1";
        btnConferma.style.cursor = "pointer";
    } else {
        btnConferma.disabled = true;
        btnConferma.style.opacity = "0.4";
        btnConferma.style.cursor = "not-allowed";
    }
}

function confermaEIniziaPosizionamento() {
    document.getElementById("modal-fedelissimi").style.display = "none";
    inFasePosizionamentoFedelissimi = true;
    
    mostraFedelissimiInSidebar();
}

// =================================================================
// FUNZIONE PER RENDERE L'ESTETICA DEI FEDELISSIMI IDENTICA AL DRAFT
// =================================================================
function mostraFedelissimiInSidebar() {
    const areaDraft = document.getElementById("area-draft");
    areaDraft.innerHTML = ""; // Svuota l'area per rigenerarla

    // Filtra i fedelissimi scelti che NON sono ancora stati posizionati in campo
    let rimasti = fedelissimiScelti.filter(f => !squadra.some(g => g.nome === f.nome));

    // Se li hai posizionati tutti, svuota la sidebar e imposta il testo di default
    if (rimasti.length === 0) {
        testoRuolo.innerText = "...";
        areaDraft.innerHTML = "<p style='color:#666; text-align:center; width:100%; margin-top:20px;'>Tutti i fedelissimi sono in campo. Clicca su un ruolo vuoto per il draft standard.</p>";
        return;
    }

    testoRuolo.innerText = "SCONTO SERIE B";

    // Genera le carte con lo stesso identico layout del Pull standard
    rimasti.forEach((giocatore, index) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");
        cartaDiv.style.animationDelay = `${index * 0.1}s`;

        // Se hai cliccato su questo fedelissimo, dagli un feedback visivo di selezione
        if (giocatoreInFaseDiPiazzamento === giocatore) {
            cartaDiv.style.border = "2px solid var(--accento-juve)";
            cartaDiv.style.background = "rgba(224, 200, 112, 0.15)";
        }

        // Struttura HTML speculare a generaCarteDraft()
        cartaDiv.innerHTML = `
            <div class="carta-info">
                <h3 style="margin:0; font-size:1.4rem;">${giocatore.nome}</h3>
                <p style="margin:0; color:#888;">${giocatore.ruolo.join(' / ')} • Stagione ${giocatore.stagione}</p>
            </div>
            <div class="rating-numero" style="font-size:2.5rem; color:#fff">${giocatore.rating}</div>
        `;

        // Al click, seleziona il fedelissimo per il piazzamento sul campo
        cartaDiv.addEventListener("click", () => {
            giocatoreInFaseDiPiazzamento = giocatore;
            
            // Rinfresca la sidebar per applicare lo stile "selezionato"
            mostraFedelissimiInSidebar();
            
            mostraMessaggioCustom(
                "MISTER, SCHIERALO!", 
                `Hai selezionato ${giocatore.nome}. Clicca su uno slot vuoto a sinistra compatibile con i ruoli: ${giocatore.ruolo.join(', ')}`
            );
        });

        areaDraft.appendChild(cartaDiv);
    });
}

function apriSceltaRuoloFedelissimo(giocatore) {
    giocatoreInFaseDiPiazzamento = giocatore;

    // 1. Resetta tutti gli slot per rimuovere vecchi highlight
    const tuttiGliSlot = document.querySelectorAll(".slot");
    tuttiGliSlot.forEach(slot => {
        slot.classList.remove("active-slot");
        if (!slot.classList.contains("occupato")) {
            slot.style.border = "1px dashed var(--accento-juve)";
            slot.onclick = () => avviaTurnoDraftManuale(slot); // Ripristina il click normale
        }
    });

    // 2. Trova e illumina solo gli slot compatibili col ruolo
    const slotsDisponibili = document.querySelectorAll(".slot:not(.occupato)");
    let ruoloTrovato = false;

    slotsDisponibili.forEach(slot => {
        let ruoliAmmessi = slot.dataset.ruolo.split('/');
        
        if (giocatore.ruolo.some(r => ruoliAmmessi.includes(r))) {
            ruoloTrovato = true;
            slot.classList.add("active-slot");
            slot.style.border = "2px solid #ffeb3b";
            slot.style.cursor = "pointer";

            // 3. Al click sullo slot compatibile, piazza il Fedelissimo
            slot.onclick = () => {
                squadra.push(giocatore);
                nomiGiocatoriDraftati.push(giocatore.nome);

                slot.classList.remove("active-slot");
                slot.classList.add("occupato");
                slot.innerHTML = `
                    <span style="color:var(--accento-juve); font-family:'Bebas Neue', sans-serif; font-size:1.5rem;">${giocatore.rating}</span>
                    <span style="color:#fff; font-size:0.7rem; font-weight:bold; text-align:center;">${giocatore.nome.toUpperCase()}</span>
                `;
                slot.style.border = "1px solid var(--accento-juve)";
                slot.style.background = "rgba(0,0,0,0.8)";
                slot.style.cursor = "default";
                slot.onclick = null;

                // Spegni gli altri highlight e ripristina i click normali
                document.querySelectorAll(".slot:not(.occupato)").forEach(s => {
                    s.classList.remove("active-slot");
                    s.style.border = "1px dashed var(--accento-juve)";
                    s.onclick = () => avviaTurnoDraftManuale(s);
                });

                giocatoreInFaseDiPiazzamento = null;
                mostraFedelissimiInSidebar(); // Ricarica la sidebar per rimuovere il giocatore appena piazzato
            };
        }
    });

    if (!ruoloTrovato) {
        mostraMessaggioCustom("ATTENZIONE", "Non ci sono slot liberi compatibili con i ruoli di questo giocatore!");
    }
}

function simulaSerieB() {
    statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: -9, golFatti: 0, golSubiti: 0 }; 
    
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";
    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()} (${allenatoreSelezionato.modificatore >= 0 ? '+' : ''}${allenatoreSelezionato.modificatore})`;

    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    classificaSerieA = [{ nome: "Juventus (Tu)", punti: -9, v: 0, p: 0, s: 0, forza: forzaAttuale }];

    const forzaB = { "Napoli": 76, "Genoa": 75, "Bologna": 74, "Brescia": 73, "Mantova": 72, "Rimini": 71 };

    squadreSerieB2006.forEach(squadraNome => {
        let base = forzaB[squadraNome] || 65;
        let forzaVariabile = base + Math.floor(Math.random() * 6) - 2; 
        classificaSerieA.push({ nome: squadraNome, punti: 0, v: 0, p: 0, s: 0, forza: forzaVariabile });
    });

    squadra.forEach(g => registroGolMarcatori[g.nome] = 0);
    aggiornaClassificaLiveUI();
    
    avviaLoopSerieB(1, 42); 
}

function avviaLoopSerieB(daGiornata, aGiornata) {
    giornataAttuale = daGiornata;
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");

    loopSimulazione = setInterval(() => {
        if (giornataAttuale > aGiornata) {
            clearInterval(loopSimulazione);
            mostraFineSerieB(); 
            return;
        }

        document.getElementById("giornata-corrente").innerText = `SERIE B - GIORNATA ${giornataAttuale} / 42`;
        
        let indiceAvversario = (giornataAttuale - 1) % squadreSerieB2006.length;
        let avversarioOggi = squadreSerieB2006[indiceAvversario];
        let datiAvversario = classificaSerieA.find(s => s.nome === avversarioOggi);

        let boostJuve = Math.floor(Math.random() * 6); 
        let boostAvv = Math.floor(Math.random() * 6);  
        let diffReale = (forzaAttuale + boostJuve) - (datiAvversario.forza + boostAvv);

        // Sostituisci le righe dei gol con queste:
        let baseGolJuve = Math.max(0, Math.floor(Math.random() * 3) + (diffReale >= 4 ? 1 : 0) + (diffReale >= 8 ? 1 : 0));
        let baseGolAvv = Math.max(0, Math.floor(Math.random() * 3) + (diffReale <= -4 ? 1 : 0) + (diffReale <= -8 ? 1 : 0));

        statsStagione.giocate++;
        statsStagione.golFatti += baseGolJuve;
        statsStagione.golSubiti += baseGolAvv;

        let juveObj = classificaSerieA.find(s => s.nome === "Juventus (Tu)");

        if (baseGolJuve > baseGolAvv) {
            statsStagione.vittorie++; statsStagione.punti += 3;
            juveObj.punti += 3; juveObj.v++;
            datiAvversario.s++;
        } else if (baseGolJuve === baseGolAvv) {
            statsStagione.pareggi++; statsStagione.punti += 1;
            juveObj.punti += 1; juveObj.p++;
            datiAvversario.punti += 1; datiAvversario.p++;
        } else {
            statsStagione.sconfitte++;
            juveObj.s++;
            datiAvversario.punti += 3; datiAvversario.v++;
        }

        let chiHaSegnato = [];
        for (let i = 0; i < baseGolJuve; i++) {
            let estrattore = Math.random();
            let tiratori = [];
            
            if (estrattore < 0.75) {
                tiratori = squadra.filter(g => g.ruolo.some(r => ["ATT", "AS", "AD", "COC"].includes(r)));
            } else if (estrattore < 0.95) {
                tiratori = squadra.filter(g => g.ruolo.some(r => ["CC", "CDC", "ED", "ES"].includes(r)));
            } else {
                tiratori = squadra.filter(g => g.ruolo.some(r => ["DC", "TD", "TS"].includes(r)));
            }
            
            if (tiratori.length === 0) {
                tiratori = squadra.filter(g => !g.ruolo.includes("POR"));
            }
            
            let m = tiratori[Math.floor(Math.random() * tiratori.length)];
            if(m){ registroGolMarcatori[m.nome]++; chiHaSegnato.push(m.nome); }
        }

        classificaSerieA.forEach(s => {
            if (s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi) {
                let probVittoria = 0.40 + (s.forza - 68) * 0.025; 
                let r = Math.random();
                if (r < probVittoria) { s.punti += 3; s.v++; } 
                else if (r < probVittoria + 0.30) { s.punti += 1; s.p++; } 
                else { s.s++; }
            }
        });

        classificaSerieA.sort((a, b) => b.punti - a.punti);
        aggiornaClassificaLiveUI();

        let stringaMarcatori = chiHaSegnato.length > 0 ? ` (${chiHaSegnato.join(", ")})` : "";
        ticker.innerHTML = `<div style="text-align:center;">
            <span style="font-size:0.9rem; color:#888; display:block;">RISULTATO LIVE SERIE B</span>
            <strong>Juventus ${baseGolJuve} - ${baseGolAvv} ${avversarioOggi}</strong>
            <span style="font-size:0.8rem; color:var(--accento-juve); display:block; margin-top:5px;">${stringaMarcatori}</span>
        </div>`;

        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; padding-bottom:4px;">
                <span style="color:#666; width:70px;">Gior. ${giornataAttuale}</span>
                <span style="flex:1; text-align:left;">vs ${avversarioOggi}</span>
                <span style="font-weight:bold; color:${baseGolJuve >= baseGolAvv ? (baseGolJuve === baseGolAvv ? '#ffeb3b' : '#4caf50') : '#f44336'}">${baseGolJuve} - ${baseGolAvv}</span>
            </div>
        ` + cronologia.innerHTML;

        giornataAttuale++;
    }, 300);
}

function mostraFineSerieB() {
    document.getElementById("schermata-simulazione").style.display = "none";
    document.getElementById("schermata-recap").style.display = "block";

    let commentoBox = document.getElementById("commento-dirigenza");
    let posJuve = classificaSerieA.findIndex(s => s.nome === "Juventus (Tu)") + 1;
    
    if (posJuve <= 2) {
        commentoBox.innerHTML = `🏆 <strong>PROMOZIONE DIRETTA!</strong> Hai dominato la Serie B annullando il -9 iniziale, chiudendo al ${posJuve}° posto. La Vecchia Signora è tornata al suo posto!`;
    } else if (posJuve <= 6) {
        commentoBox.innerHTML = `🔥 <strong>PLAYOFF RAGGIUNTI.</strong> Sei arrivato ${posJuve}°. La penalizzazione si è fatta sentire ma hai un'ultima chance ai Playoff per salire in A.`;
    } else {
        commentoBox.innerHTML = `📉 <strong>INFERNO CONTINUO!</strong> Solo ${posJuve}° posto in Serie B. Un disastro epocale, la società ti esonera per direttissima.`;
    }

    let tbodyClassifica = document.querySelector("#tabella-classifica-finale tbody");
    tbodyClassifica.innerHTML = "";
    classificaSerieA.forEach((s, idx) => {
        let tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #1a1a1a";
        if (s.nome === "Juventus (Tu)") {
            tr.style.background = "rgba(224, 200, 112, 0.1)";
            tr.style.color = "var(--accento-juve)";
            tr.style.fontWeight = "bold";
        }
        tr.innerHTML = `
            <td style="padding:10px 5px; color:#888;">${idx + 1}</td>
            <td>${s.nome.toUpperCase()}</td>
            <td style="font-weight:bold;">${s.punti}</td>
            <td>${s.v || 0}</td>
            <td>${s.p || 0}</td>
            <td>${s.s || 0}</td>
        `;
        tbodyClassifica.appendChild(tr);
    });

    document.getElementById("stats-riepilogo-juve").innerHTML = `
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:var(--accento-juve);">${statsStagione.punti}</span><p style="margin:0; font-size:0.7rem; color:#888;">PUNTI (-9)</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#4caf50;">${statsStagione.vittorie}</span><p style="margin:0; font-size:0.7rem; color:#888;">VITTORIE</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#fff;">${statsStagione.golFatti}</span><p style="margin:0; font-size:0.7rem; color:#888;">GOL FATTI</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#f44336;">${statsStagione.golSubiti}</span><p style="margin:0; font-size:0.7rem; color:#888;">GOL SUBITI</p></div>
    `;

    let boxMarcatori = document.getElementById("lista-marcatori-finale");
    boxMarcatori.innerHTML = "";
    let ordinati = Object.entries(registroGolMarcatori)
        .map(([nome, gol]) => ({ nome, gol }))
        .sort((a, b) => b.gol - a.gol);

    ordinati.forEach((m, idx) => {
        let rigaM = document.createElement("div");
        rigaM.style.display = "flex";
        rigaM.style.justifyContent = "space-between";
        rigaM.style.background = "rgba(255,255,255,0.02)";
        rigaM.style.padding = "8px 12px";
        rigaM.style.borderRadius = "4px";
        rigaM.style.fontSize = "0.85rem";
        
        let corona = idx === 0 && m.gol > 0 ? "👑 " : "";
        rigaM.innerHTML = `<span>${idx + 1}. ${corona}${m.nome}</span><strong style="color:var(--accento-juve);">${m.gol} Gol</strong>`;
        boxMarcatori.appendChild(rigaM);
    });
}

function verificaFattibilita102(puntiAttuali, giornateGiocate) {
    const OBIETTIVO_PUNTI = 103; 
    const GIORNATE_TOTALI = 38;

    const giornateRimanenti = GIORNATE_TOTALI - giornateGiocate;
    const puntiMassimiOttenibili = puntiAttuali + (giornateRimanenti * 3);

    return puntiMassimiOttenibili >= OBIETTIVO_PUNTI; 
}

function simulaStagioneRoguelike() {
    statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: 0, golFatti: 0, golSubiti: 0 };
    forzaModificataRoguelike = 0;
    durataEffettoRoguelike = 0;
    
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";
    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()} (${allenatoreSelezionato.modificatore >= 0 ? '+' : ''}${allenatoreSelezionato.modificatore})`;

    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    classificaSerieA = [{ nome: "Juventus (Tu)", punti: 0, v: 0, p: 0, s: 0, forza: forzaAttuale }];
    
    const forzaStorica = {
        "Inter": 88, "Milan": 86, "Napoli": 85, "Atalanta": 84, "Roma": 83, "Lazio": 82,
        "Fiorentina": 80, "Torino": 78, "Bologna": 78, "Udinese": 76, "Sampdoria": 75,
        "Genoa": 75, "Verona": 74, "Cagliari": 73, "Lecce": 72, "Empoli": 72,
        "Monza": 73, "Venezia": 70, "Parma": 71
    };

    squadreSerieA.forEach(squadraNome => {
        let base = forzaStorica[squadraNome] || 75;
        let forzaVariabile = base + Math.floor(Math.random() * 6) - 2; 
        classificaSerieA.push({ nome: squadraNome, punti: 0, v: 0, p: 0, s: 0, forza: forzaVariabile });
    });

    squadra.forEach(g => registroGolMarcatori[g.nome] = 0);
    aggiornaClassificaLiveUI();
    
    avviaLoopRoguelike(1, 38);
}

function avviaLoopRoguelike(daGiornata, aGiornata) {
    giornataAttuale = daGiornata;
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");

    loopSimulazione = setInterval(() => {
        if (giornataAttuale > aGiornata) {
            clearInterval(loopSimulazione);
            mostraFineCampionatoCompleta(); 
            return;
        }

        let forzaEffettiva = forzaAttuale;
        if (durataEffettoRoguelike > 0) {
            forzaEffettiva += forzaModificataRoguelike;
            durataEffettoRoguelike--;
        }

        document.getElementById("giornata-corrente").innerText = `GIORNATA ${giornataAttuale}`;
        let indiceAvversario = (giornataAttuale - 1) % squadreSerieA.length;
        let avversarioOggi = squadreSerieA[indiceAvversario];
        let datiAvversario = classificaSerieA.find(s => s.nome === avversarioOggi);

        let boostJuve = Math.floor(Math.random() * 6); 
        let boostAvv = Math.floor(Math.random() * 6);  
        let diffReale = (forzaEffettiva + boostJuve) - (datiAvversario.forza + boostAvv);

        // Sostituisci le righe dei gol con queste:
        let baseGolJuve = Math.max(0, Math.floor(Math.random() * 3) + (diffReale >= 4 ? 1 : 0) + (diffReale >= 8 ? 1 : 0));
        let baseGolAvv = Math.max(0, Math.floor(Math.random() * 3) + (diffReale <= -4 ? 1 : 0) + (diffReale <= -8 ? 1 : 0));

        statsStagione.giocate++; statsStagione.golFatti += baseGolJuve; statsStagione.golSubiti += baseGolAvv;
        let juveObj = classificaSerieA.find(s => s.nome === "Juventus (Tu)");

        if (baseGolJuve > baseGolAvv) { statsStagione.vittorie++; statsStagione.punti += 3; juveObj.punti += 3; juveObj.v++; datiAvversario.s++; } 
        else if (baseGolJuve === baseGolAvv) { statsStagione.pareggi++; statsStagione.punti += 1; juveObj.punti += 1; juveObj.p++; datiAvversario.punti += 1; datiAvversario.p++; } 
        else { statsStagione.sconfitte++; juveObj.s++; datiAvversario.punti += 3; datiAvversario.v++; }

        let chiHaSegnato = [];
        for (let i = 0; i < baseGolJuve; i++) {
            let estrattore = Math.random();
            
            // CORREZIONE: Uso di .some() per esplorare correttamente l'array dei ruoli del giocatore
            let tiratori = estrattore < 0.75 ? squadra.filter(g => g.ruolo.some(r => ["ATT", "AS", "AD", "COC"].includes(r))) : 
                           estrattore < 0.95 ? squadra.filter(g => g.ruolo.some(r => ["CC", "CDC", "ED", "ES"].includes(r))) : 
                           squadra.filter(g => g.ruolo.some(r => ["DC", "TD", "TS"].includes(r)));
            
            // CORREZIONE: Uso di !includes("POR") al posto di !== "POR"
            if (tiratori.length === 0) tiratori = squadra.filter(g => !g.ruolo.includes("POR"));
            
            let m = tiratori[Math.floor(Math.random() * tiratori.length)];
            if(m){ registroGolMarcatori[m.nome]++; chiHaSegnato.push(m.nome); }
        }

        classificaSerieA.forEach(s => {
            if (s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi) {
                let prob = 0.42 + (s.forza - 78) * 0.025; 
                let r = Math.random();
                if (r < prob) { s.punti += 3; s.v++; } else if (r < prob + 0.28) { s.punti += 1; s.p++; } else { s.s++; }
            }
        });
        classificaSerieA.sort((a, b) => b.punti - a.punti);
        aggiornaClassificaLiveUI();

        let stringaMarcatori = chiHaSegnato.length > 0 ? ` (${chiHaSegnato.join(", ")})` : "";
        ticker.innerHTML = `<div style="text-align:center;">
            <span style="font-size:0.9rem; color:#888; display:block;">RISULTATO LIVE</span>
            <strong>Juventus ${baseGolJuve} - ${baseGolAvv} ${avversarioOggi}</strong>
            <span style="font-size:0.8rem; color:var(--accento-juve); display:block; margin-top:5px;">${stringaMarcatori}</span>
            ${durataEffettoRoguelike > 0 ? `<span style="font-size:0.7rem; color:${forzaModificataRoguelike > 0 ? '#4caf50' : '#f44336'}; display:block; margin-top:5px;">⚠️ Effetto Attivo (${durataEffettoRoguelike} turni rimasti)</span>` : ''}
        </div>`;

        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; padding-bottom:4px;">
                <span style="color:#666; width:70px;">Gior. ${giornataAttuale}</span>
                <span style="flex:1; text-align:left;">vs ${avversarioOggi}</span>
                <span style="font-weight:bold; color:${baseGolJuve >= baseGolAvv ? (baseGolJuve === baseGolAvv ? '#ffeb3b' : '#4caf50') : '#f44336'}">${baseGolJuve} - ${baseGolAvv}</span>
            </div>
        ` + cronologia.innerHTML;

        giornataAttuale++;

        if (Math.random() < 0.12 && giornataAttuale <= aGiornata) {
            clearInterval(loopSimulazione); 
            innescaEventoRoguelike();
        }

    }, 500); 
}

function innescaEventoRoguelike() {
    let evento = databaseImprevisti[Math.floor(Math.random() * databaseImprevisti.length)];
    let ticker = document.getElementById("ticker-match-live");

    if (evento.tipo === "bonus_temp" || evento.tipo === "malus_temp") {
        forzaModificataRoguelike = evento.valore;
        durataEffettoRoguelike = evento.durata;
        
        mostraMessaggioCustom("IMPREVISTO!", `${evento.titolo}\n\n${evento.testo}`, () => {
            avviaLoopRoguelike(giornataAttuale, 38); 
        });
        
    } else if (evento.tipo === "bonus_perm") {
        forzaAttuale += evento.valore;
        classificaSerieA.find(s => s.nome === "Juventus (Tu)").forza = forzaAttuale;
        
        mostraMessaggioCustom("SVOLTA STAGIONALE", `${evento.titolo}\n\n${evento.testo}`, () => {
            avviaLoopRoguelike(giornataAttuale, 38); 
        });
        
    } else if (evento.tipo === "sostituzione") {
        let indexSfortunato = Math.floor(Math.random() * squadra.length);
        let tagliato = squadra[indexSfortunato];

        ticker.innerHTML = `<div style="text-align:center; color:#f44336; width:100%;">
            <h3 style="margin:0; font-family:'Bebas Neue'; font-size:1.8rem;">🚨 ${evento.titolo} 🚨</h3>
            <p style="font-size:0.85rem; margin:5px 0 10px 0; color:#fff;">${evento.testo}<br><strong>Hai perso ${tagliato.nome}!</strong> Scegli un rimpiazzo:</p>
            <div id="opzioni-roguelike-box" style="display:flex; gap:10px; justify-content:center;"></div>
        </div>`;

        let oldIndex = nomiGiocatoriDraftati.indexOf(tagliato.nome);
        if(oldIndex !== -1) nomiGiocatoriDraftati.splice(oldIndex, 1);

        let opzioniCompatibili = databaseJuve.filter(g => 
            g.ruolo.some(r => tagliato.ruolo.includes(r)) && 
            !nomiGiocatoriDraftati.includes(g.nome) &&
            g.nome !== tagliato.nome
        );

        let treProposte = opzioniCompatibili.sort(() => 0.5 - Math.random()).slice(0, 3);

        let boxAcquisti = document.getElementById("opzioni-roguelike-box");
        treProposte.forEach(nuovoG => {
            let divCarta = document.createElement("div");
            divCarta.style.background = "linear-gradient(180deg, #252525, #111)";
            divCarta.style.border = "1px solid var(--accento-juve)";
            divCarta.style.borderRadius = "6px";
            divCarta.style.padding = "10px";
            divCarta.style.cursor = "pointer";
            divCarta.style.minWidth = "90px";
            
            divCarta.innerHTML = `
                <div style="font-weight:bold; font-size:1.1rem; color:var(--accento-juve);">${nuovoG.rating}</div>
                <div style="font-size:0.8rem; margin:3px 0; color:#fff;">${nuovoG.nome}</div>
            `;
            
            divCarta.onclick = () => {
                squadra[indexSfortunato] = nuovoG;
                nomiGiocatoriDraftati.push(nuovoG.nome);
                delete registroGolMarcatori[tagliato.nome];
                registroGolMarcatori[nuovoG.nome] = 0;

                let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
                forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;
                classificaSerieA.find(s => s.nome === "Juventus (Tu)").forza = forzaAttuale;

                mostraMessaggioCustom("EMERGENZA RIENTRATA", `Hai inserito ${nuovoG.nome} al posto di ${tagliato.nome}. Il campionato riprende!`, () => {
                    avviaLoopRoguelike(giornataAttuale, 38);
                });
            };
            boxAcquisti.appendChild(divCarta);
        });
    }
}