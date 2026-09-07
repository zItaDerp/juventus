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
let recordSalvataggioInSospeso = null;

const difficoltaSimulazione = {
    boostJuveMax: 5,
    boostAvversarioMax: 7,
    sogliaBonusJuve: 5,
    sogliaSuperBonusJuve: 9,
    sogliaBonusAvversario: -3,
    sogliaSuperBonusAvversario: -7
};

function generaBoostJuve() {
    return Math.floor(Math.random() * difficoltaSimulazione.boostJuveMax);
}

function generaBoostAvversario() {
    return Math.floor(Math.random() * difficoltaSimulazione.boostAvversarioMax);
}

function calcolaGolJuve(diffReale, varianzaGol = 3) {
    return Math.max(0, Math.floor(Math.random() * varianzaGol) + (diffReale >= difficoltaSimulazione.sogliaBonusJuve ? 1 : 0) + (diffReale >= difficoltaSimulazione.sogliaSuperBonusJuve ? 1 : 0));
}

function calcolaGolAvversario(diffReale, varianzaGol = 3) {
    return Math.max(0, Math.floor(Math.random() * varianzaGol) + (diffReale <= difficoltaSimulazione.sogliaBonusAvversario ? 1 : 0) + (diffReale <= difficoltaSimulazione.sogliaSuperBonusAvversario ? 1 : 0));
}

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
const schermataScelta1v1 = document.getElementById("schermata-1v1-scelta");
const schermataLobbyOnline1v1 = document.getElementById("schermata-1v1-online-lobby");
const schermataLobbyAmico1v1 = document.getElementById("schermata-1v1-amico-lobby");
const schermataSceltaTorneo = document.getElementById("schermata-torneo-scelta");
const schermataSetupTorneo = document.getElementById("schermata-torneo-setup");
const schermataEntraTorneo = document.getElementById("schermata-torneo-entra");
const schermataLobbyTorneo = document.getElementById("schermata-torneo-lobby");
const areaDraft = document.getElementById("area-draft");
const testoRuolo = document.getElementById("testo-ruolo");

// Il selettore generico intercettava il pulsante del torneo, che precede quello
// offline nel DOM. Usiamo l'ID della sola modalità singleplayer.
const btnReroll = document.getElementById("btn-reroll-offline");
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
    nomiGiocatoriDraftati = []; 
    inFaseMercato = false;
    rerollDisponibili = 3;

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
    btnReroll.disabled = false;
    btnReroll.style.opacity = "1";
    btnReroll.style.cursor = "pointer";
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
    if (elementoSlot.classList.contains("occupato")) return;

    if (modalitaSelezionata === 'risalita' && inFasePosizionamentoFedelissimi) {
        if (typeof giocatoreInFaseDiPiazzamento !== 'undefined' && giocatoreInFaseDiPiazzamento !== null) {
            piazzaFedelissimoInSlot(giocatoreInFaseDiPiazzamento, elementoSlot);
        } else {
            mostraMessaggioCustom("EHI MISTER!", "In questa fase devi prima cliccare sulla carta del Fedelissimo a destra per scegliere in che ruolo schierarlo!");
        }
        return; 
    }

    if (slotAttivo === elementoSlot) return; 
    
    if (slotAttivo !== null && slotAttivo !== elementoSlot) {
        mostraMessaggioCustom("ATTENZIONE", "Devi prima scegliere un giocatore dal draft per il ruolo selezionato!");
        return;
    }

    document.querySelectorAll(".slot").forEach(s => s.classList.remove("active-slot"));
    
    slotAttivo = elementoSlot;
    slotAttivo.classList.add("active-slot");

    const ruoloRichiesto = slotAttivo.dataset.ruolo;
    testoRuolo.innerText = ruoloRichiesto;

    generaCarteDraft(ruoloRichiesto);
}

function piazzaFedelissimoInSlot(giocatore, slot) {
    let ruoliAmmessi = slot.dataset.ruolo.split('/');
    
    if (!giocatore.ruolo.some(r => ruoliAmmessi.includes(r))) {
        mostraMessaggioCustom("RUOLO NON COMPATIBILE", `${giocatore.nome} non può giocare nel ruolo di ${slot.dataset.ruolo}!`);
        return;
    }

    squadra.push(giocatore);
    nomiGiocatoriDraftati.push(giocatore.nome);

    slot.classList.add("occupato");
    slot.innerHTML = `
        <span style="color:var(--accento-juve); font-family:'Bebas Neue', sans-serif; font-size:1.5rem;">${giocatore.rating}</span>
        <span style="color:#fff; font-size:0.7rem; font-weight:bold; text-align:center;">${giocatore.nome.toUpperCase()}</span>
    `;
    slot.style.border = "1px solid var(--accento-juve)";
    slot.style.background = "rgba(0,0,0,0.8)";
    slot.style.cursor = "default";

    document.querySelectorAll(".slot:not(.occupato)").forEach(s => {
        s.classList.remove("active-slot");
        s.style.border = "1px dashed var(--accento-juve)";
    });

    giocatoreInFaseDiPiazzamento = null;
    mostraFedelissimiInSidebar();

    let contatoreFedelissimiInCampo = fedelissimiScelti.filter(f => squadra.some(g => g.nome === f.nome)).length;
    
    if (contatoreFedelissimiInCampo === fedelissimiScelti.length) {
        inFasePosizionamentoFedelissimi = false; 
        slotAttivo = null;                       
        
        mostraMessaggioCustom("FEDELISSIMI SCHIERATI", "I tuoi due Fedelissimi sono in posizione! Ora clicca su un qualsiasi ruolo vuoto per iniziare il vero Draft standard.");
    }
}

function generaCarteDraft(ruoloRichiesto) {
    areaDraft.innerHTML = "";

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
    } else {
        mostraMessaggioCustom("REROLL ESAURITI", "Hai finito i reroll disponibili!");
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
            simulaStagioneRoguelike(); 
        } else {
            simulaStagioneFinale();
        }
    };
}

let classificaSerieA = [];
let registroGolMarcatori = {};
let loopSimulazione = null;
let giornataAttuale = 1;

const squadreSerieA = [
    "Inter", "Milan", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", 
    "Bologna", "Torino", "Udinese", "Sampdoria", "Genoa", "Verona", 
    "Cagliari", "Lecce", "Empoli", "Monza", "Venezia", "Parma"
];

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
        let forzaVariabile = base + Math.floor(Math.random() * 5) - 3; 
        classificaSerieA.push({ nome: squadraNome, punti: 0, v: 0, p: 0, s: 0, forza: forzaVariabile });
    });

    squadra.forEach(g => registroGolMarcatori[g.nome] = 0);

    aggiornaClassificaLiveUI();
    avviaLoopCampionato(1, 19, mostraMercatoGennaio);
}

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

        let boostJuve = generaBoostJuve(); 
        let boostAvv = generaBoostAvversario();  
        let diffReale = (forzaAttuale + boostJuve) - (datiAvversario.forza + boostAvv);

        let baseGolJuve = calcolaGolJuve(diffReale);
        let baseGolAvv = calcolaGolAvversario(diffReale);

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
                return; 
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
    
    let budgetMercato = 9999;
    if (modalitaSelezionata === 'mod-fairplay') {
        budgetMercato = budgetRimanente + tagliato.rating;
    }

    let ruoloPrincipale = tagliato.ruolo[0];

    let opzioniCompatibili = databaseJuve.filter(g => 
        g.ruolo.includes(ruoloPrincipale) && !nomiGiocatoriDraftati.includes(g.nome)
    );

    if (modalitaSelezionata === 'mod-fairplay') {
        opzioniCompatibili = opzioniCompatibili.filter(g => g.rating <= budgetMercato);
    }
    
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
            if (modalitaSelezionata === 'mod-fairplay') {
                budgetRimanente = budgetMercato - nuovoG.rating;
                const testBudget = document.getElementById("headbar-budget-count");
                if (testBudget) {
                    testBudget.innerText = budgetRimanente;
                    testBudget.style.color = budgetRimanente < 150 ? "#f44336" : "#ffcc00";
                }
            }

            let oldIndex = nomiGiocatoriDraftati.indexOf(tagliato.nome);
            if (oldIndex !== -1) nomiGiocatoriDraftati.splice(oldIndex, 1);

            squadra[indexGiocatoreDaTagliare] = nuovoG;
            nomiGiocatoriDraftati.push(nuovoG.nome); 
            
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

function mostraFineCampionatoCompleta() {
    document.getElementById("schermata-simulazione").style.display = "none";
    document.getElementById("schermata-recap").style.display = "block";

    let commentoBox = document.getElementById("commento-dirigenza");
    let pt = statsStagione.punti;
    let pos = classificaSerieA.findIndex(s => s.nome === "Juventus (Tu)") + 1;

    if (modalitaSelezionata === 'quota-102') {
        let maxTeoricoPossibile = pt + ((38 - statsStagione.giocate) * 3);
        
        if (pt >= 103) {
            commentoBox.innerHTML = `👑 <strong>CAMPIONI IMMORTALI!</strong> Hai chiuso a ${pt} punti, disintegrando il record di 102 di Antonio Conte. Lo Stadium è in un delirio assoluto!`;
        } else {
            commentoBox.innerHTML = `❌ <strong>IMPRESA FALLITA.</strong> La matematica ti condanna alla giornata ${statsStagione.giocate} con ${pt} punti (proiezione massima: ${maxTeoricoPossibile}). Il record di Conte resta imbattuto.`;
        }
    } 
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

    // --- AGGIUNTA SALVATAGGIO CLASSIFICHE CAMPIONATO ---
    let datiJuveFinale = classificaSerieA.find(s => s.nome === "Juventus (Tu)") || { v: 0, p: 0, s: 0, punti: 0 };
    let modClassifica = modalitaSelezionata === "mod-fairplay" ? "fpf" : 
                        modalitaSelezionata === "quota-102" ? "quota102" : 
                        modalitaSelezionata;

    if (modClassifica === "quota102") {
        registraNuovoRecordUtente("quota102", {
            vittorie: datiJuveFinale.v,
            punti: datiJuveFinale.punti,
            sfidaSuperata: datiJuveFinale.punti >= 103 // 103 per superare il record di 102
        });
    } else {
        registraNuovoRecordUtente(modClassifica, {
            vittorie: datiJuveFinale.v,
            pareggi: datiJuveFinale.p,
            sconfitte: datiJuveFinale.s,
            punti: datiJuveFinale.punti
        });
    }
    // ----------------------------------------------------

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

function impostaModalitaEAvvia(scelta) {
    modalitaSelezionata = scelta;
    document.getElementById('screen-modalita').classList.add('nascosto');
    
    if (typeof avviaSceltaModulo === 'function') {
        avviaSceltaModulo(scelta);
    } else {
        console.error("ERRORE: La funzione 'avviaSceltaModulo' non è stata trovata in script.js!");
    }
}

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

        let boostJuve = generaBoostJuve(); 
        let boostAvv = generaBoostAvversario();  
        let diffReale = (forzaAttuale + boostJuve) - (avvObj.forza + boostAvv);

        let golJuve = calcolaGolJuve(diffReale);
        let golAvv = calcolaGolAvversario(diffReale);

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
        boxControlli.innerHTML = `<button id="btn-ricomincia-draft-champions" class="btn-menu-principale-premium" style="max-width:300px; margin:0 auto; padding:18px 30px; font-size:1.2rem; justify-content:center;" onclick="window.location.reload()">🔄 RICOMINCIA DRAFT</button>`;
        
        // --- AGGIUNTA SALVATAGGIO CLASSIFICHE CHAMPIONS ---
        registraNuovoRecordUtente("champions", {
            piazzamento: "Gironi",
            piazzamentoVal: 6, // Valore per eliminazione ai gironi
            posizioneGenerale: posJuve
        });
        // ----------------------------------------------------
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
        let golJuve = calcolaGolJuve(diff, 4);
        let golAvv = calcolaGolAvversario(diff, 4);
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
            boxControlli.innerHTML = `<button id="btn-ricomincia-draft-champions" class="btn-menu-principale-premium" style="max-width:300px; margin:0 auto; padding:18px 30px; font-size:1.2rem; justify-content:center;" onclick="window.location.reload()">🔄 RICOMINCIA DRAFT</button>`;
            
            // --- AGGIUNTA SALVATAGGIO CLASSIFICHE CHAMPIONS ---
            let posGenerale = classificaEuropa.findIndex(s => s.nome === "Juventus (Tu)") + 1;
            registraNuovoRecordUtente("champions", { piazzamento: "Finale", piazzamentoVal: 2, posizioneGenerale: posGenerale });
            // ----------------------------------------------------
        }
        return { vinto: vinto };
        
    } else {
        let gJuve_a = calcolaGolJuve(diff, 4);
        let gAvv_a = calcolaGolAvversario(diff, 4);
        
        let gJuve_r = calcolaGolJuve(diff, 4);
        let gAvv_r = calcolaGolAvversario(diff, 4);
        
        let totJuve = gJuve_a + gJuve_r;
        let totAvv = gAvv_a + gAvv_r;
        let note = "";
        let vinto = false;
        
        if (totJuve === totAvv) {
            if (Math.random() > 0.5) { totJuve++; note = " (d.t.s.)"; vinto = true; } 
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
            boxControlli.innerHTML = `<button id="btn-ricomincia-draft-champions" class="btn-menu-principale-premium" style="max-width:300px; margin:0 auto; padding:18px 30px; font-size:1.2rem; justify-content:center;" onclick="window.location.reload()">🔄 RICOMINCIA DRAFT</button>`;
            
            // --- AGGIUNTA SALVATAGGIO CLASSIFICHE CHAMPIONS ---
            let posGenerale = classificaEuropa.findIndex(s => s.nome === "Juventus (Tu)") + 1;
            let valPiazzamento = 6; // Playoff
            if (nomeFase === 'Ottavi di Finale') valPiazzamento = 5;
            if (nomeFase === 'Quarti di Finale') valPiazzamento = 4;
            if (nomeFase === 'Semifinale') valPiazzamento = 3;
            
            registraNuovoRecordUtente("champions", { piazzamento: nomeFase, piazzamentoVal: valPiazzamento, posizioneGenerale: posGenerale });
            // ----------------------------------------------------
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
                <p>Impresa leggendaria! Hai trionfato nella Finalissima contro l'ostico ${avversario.nome}. La coppa torna a Torino!</p>
            </div>`;
            boxControlli.innerHTML = `<button id="btn-ricomincia-draft-champions" class="btn-menu-principale-premium" style="max-width:300px; margin:0 auto; padding:18px 30px; font-size:1.2rem; justify-content:center;" onclick="window.location.reload()">🔄 RICOMINCIA DRAFT</button>`;
            
            // --- AGGIUNTA SALVATAGGIO CLASSIFICHE CHAMPIONS ---
            let posGenerale = classificaEuropa.findIndex(s => s.nome === "Juventus (Tu)") + 1;
            registraNuovoRecordUtente("champions", { piazzamento: "Vincitore", piazzamentoVal: 1, posizioneGenerale: posGenerale });
            // ----------------------------------------------------
        }
    }
}

function mostraMessaggioCustom(titolo, messaggio, callback) {
    const modal = document.getElementById("modal-custom-alert");
    
    document.getElementById("modal-titolo").innerText = titolo;
    document.getElementById("modal-messaggio").innerText = messaggio;
    
    modal.classList.remove("nascosto");
    
    setTimeout(() => {
        modal.classList.add("attivo");
    }, 10);
    
    const btnOk = modal.querySelector(".btn-scegli-mode");
    
    btnOk.onclick = () => {
        modal.classList.remove("attivo");
        
        setTimeout(() => {
            modal.classList.add("nascosto");
            
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

const squadreSerieB2006 = [
    "Napoli", "Genoa", "Bologna", "Rimini", "Mantova", "Brescia", 
    "Piacenza", "Treviso", "Bari", "Lecce", "Albinoleffe", "Frosinone", 
    "Triestina", "Verona", "Vicenza", "Pescara", "Arezzo", "Crotone", 
    "Modena", "Spezia", "Cesena"
];

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
                    mostraMessaggioCustom("ATTENZIONE", "Puoi scegliere al massimo 2 fedelissimi!");
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

function mostraFedelissimiInSidebar() {
    const areaDraft = document.getElementById("area-draft");
    areaDraft.innerHTML = ""; 

    let rimasti = fedelissimiScelti.filter(f => !squadra.some(g => g.nome === f.nome));

    if (rimasti.length === 0) {
        testoRuolo.innerText = "...";
        areaDraft.innerHTML = "<p style='color:#666; text-align:center; width:100%; margin-top:20px;'>Tutti i fedelissimi sono in campo. Clicca su un ruolo vuoto per il draft standard.</p>";
        return;
    }

    testoRuolo.innerText = "SCONTO SERIE B";

    rimasti.forEach((giocatore, index) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");
        cartaDiv.style.animationDelay = `${index * 0.1}s`;

        if (giocatoreInFaseDiPiazzamento === giocatore) {
            cartaDiv.style.border = "2px solid var(--accento-juve)";
            cartaDiv.style.background = "rgba(224, 200, 112, 0.15)";
        }

        cartaDiv.innerHTML = `
            <div class="carta-info">
                <h3 style="margin:0; font-size:1.4rem;">${giocatore.nome}</h3>
                <p style="margin:0; color:#888;">${giocatore.ruolo.join(' / ')} • Stagione ${giocatore.stagione}</p>
            </div>
            <div class="rating-numero" style="font-size:2.5rem; color:#fff">${giocatore.rating}</div>
        `;

        cartaDiv.addEventListener("click", () => {
            giocatoreInFaseDiPiazzamento = giocatore;
            
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

    const tuttiGliSlot = document.querySelectorAll(".slot");
    tuttiGliSlot.forEach(slot => {
        slot.classList.remove("active-slot");
        if (!slot.classList.contains("occupato")) {
            slot.style.border = "1px dashed var(--accento-juve)";
            slot.onclick = () => avviaTurnoDraftManuale(slot); 
        }
    });

    const slotsDisponibili = document.querySelectorAll(".slot:not(.occupato)");
    let ruoloTrovato = false;

    slotsDisponibili.forEach(slot => {
        let ruoliAmmessi = slot.dataset.ruolo.split('/');
        
        if (giocatore.ruolo.some(r => ruoliAmmessi.includes(r))) {
            ruoloTrovato = true;
            slot.classList.add("active-slot");
            slot.style.border = "2px solid #ffeb3b";
            slot.style.cursor = "pointer";

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

                document.querySelectorAll(".slot:not(.occupato)").forEach(s => {
                    s.classList.remove("active-slot");
                    s.style.border = "1px dashed var(--accento-juve)";
                    s.onclick = () => avviaTurnoDraftManuale(s);
                });

                giocatoreInFaseDiPiazzamento = null;
                mostraFedelissimiInSidebar(); 
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

        let boostJuve = generaBoostJuve(); 
        let boostAvv = generaBoostAvversario();  
        let diffReale = (forzaAttuale + boostJuve) - (datiAvversario.forza + boostAvv);

        let baseGolJuve = calcolaGolJuve(diffReale);
        let baseGolAvv = calcolaGolAvversario(diffReale);

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

    // --- AGGIUNTA SALVATAGGIO CLASSIFICHE SERIE B ---
    let datiJuveFinale = classificaSerieA.find(s => s.nome === "Juventus (Tu)") || { v: 0, p: 0, s: 0, punti: 0 };
    registraNuovoRecordUtente("serieb", {
        vittorie: datiJuveFinale.v,
        pareggi: datiJuveFinale.p,
        sconfitte: datiJuveFinale.s,
        punti: datiJuveFinale.punti
    });
    // ----------------------------------------------------

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

        let boostJuve = generaBoostJuve(); 
        let boostAvv = generaBoostAvversario();  
        let diffReale = (forzaEffettiva + boostJuve) - (datiAvversario.forza + boostAvv);

        let baseGolJuve = calcolaGolJuve(diffReale);
        let baseGolAvv = calcolaGolAvversario(diffReale);

        statsStagione.giocate++; statsStagione.golFatti += baseGolJuve; statsStagione.golSubiti += baseGolAvv;
        let juveObj = classificaSerieA.find(s => s.nome === "Juventus (Tu)");

        if (baseGolJuve > baseGolAvv) { statsStagione.vittorie++; statsStagione.punti += 3; juveObj.punti += 3; juveObj.v++; datiAvversario.s++; } 
        else if (baseGolJuve === baseGolAvv) { statsStagione.pareggi++; statsStagione.punti += 1; juveObj.punti += 1; juveObj.p++; datiAvversario.punti += 1; datiAvversario.p++; } 
        else { statsStagione.sconfitte++; juveObj.s++; datiAvversario.punti += 3; datiAvversario.v++; }

        let chiHaSegnato = [];
        for (let i = 0; i < baseGolJuve; i++) {
            let estrattore = Math.random();
            
            let tiratori = estrattore < 0.75 ? squadra.filter(g => g.ruolo.some(r => ["ATT", "AS", "AD", "COC"].includes(r))) : 
                           estrattore < 0.95 ? squadra.filter(g => g.ruolo.some(r => ["CC", "CDC", "ED", "ES"].includes(r))) : 
                           squadra.filter(g => g.ruolo.some(r => ["DC", "TD", "TS"].includes(r)));
            
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

document.addEventListener("DOMContentLoaded", function() {
    const btnGuida = document.getElementById("btn-hub-guida");
    if(btnGuida) {
        btnGuida.addEventListener("click", () => {
            document.getElementById("modal-come-si-gioca").classList.remove("hidden");
        });
    }
// Gestione apertura e chiusura modale Classifiche
    const btnClassifiche = document.getElementById("btn-hub-classifiche");

    if (btnClassifiche) {
        btnClassifiche.addEventListener("click", apriClassifiche);
    }

    const paramsAvvio = new URLSearchParams(window.location.search);
    if (paramsAvvio.has("torneo")) {
        gestisciLinkInvitoLobbyTorneo();
    } else {
        gestisciLinkInvitoLobby1v1();
    }
});

function chiudiSottomenuModalita() {
    chiudiTendina("tendina-modalita", "btn-hub-gioca");
    chiudiTendina("tendina-multiplayer", "btn-hub-multiplayer");
}

function chiudiModalGuida() {
    document.getElementById("modal-come-si-gioca").classList.add("hidden");
}

function selezionaModalita(modalita) {
    chiudiTendina("tendina-modalita", "btn-hub-gioca");
    chiudiTendina("tendina-multiplayer", "btn-hub-multiplayer");
    avviaSceltaModulo(modalita);
}

function selezionaMultiplayer(modalita) {
    chiudiTendina("tendina-multiplayer", "btn-hub-multiplayer");
    chiudiTendina("tendina-modalita", "btn-hub-gioca");

    if (modalita === "1v1") {
        // Nascondi il menu principale e mostra SOLO la schermata scelta 1v1
        schermataMenu.style.display = "none";
        schermataScelta1v1.style.display = "block";
        return;
    }

    if (modalita === "torneo") {
        apriSceltaTorneo();
    }
}

const TORNEO_NOME_DEFAULT = "Utente generico";
const TORNEO_MODULO_DEFAULT = "4-3-3";
const configTorneoScelta = {
    dimensione: 16,
    tempoDraft: 90,
    overallVisibili: true
};

let lobbyTorneoCorrente = null;
let unsubscribeLobbyTorneo = null;
let azioneLobbyTorneoInCorso = false;

function aggiornaBottoniSetupTorneo(attributo, valore) {
    document.querySelectorAll(`[${attributo}]`).forEach((bottone) => {
        bottone.classList.toggle("is-selected", bottone.getAttribute(attributo) === String(valore));
    });
}

function sincronizzaSetupTorneo() {
    aggiornaBottoniSetupTorneo("data-torneo-size", configTorneoScelta.dimensione);
    aggiornaBottoniSetupTorneo("data-torneo-time", configTorneoScelta.tempoDraft);
    aggiornaBottoniSetupTorneo("data-torneo-overall", configTorneoScelta.overallVisibili);
}

function selezionaDimensioneTorneo(dimensione) {
    const valore = Number(dimensione);
    if (![4, 8, 16, 32].includes(valore)) return;

    configTorneoScelta.dimensione = valore;
    sincronizzaSetupTorneo();
}

function selezionaTempoDraftTorneo(secondi) {
    const valore = Number(secondi);
    if (![60, 90, 120, 180].includes(valore)) return;

    configTorneoScelta.tempoDraft = valore;
    sincronizzaSetupTorneo();
}

function selezionaOverallTorneo(visibili) {
    configTorneoScelta.overallVisibili = Boolean(visibili);
    sincronizzaSetupTorneo();
}

function mostraSoloSchermataTorneo(nomeSchermata) {
    [
        schermataMenu,
        schermataModulo,
        schermataGioco,
        schermataScelta1v1,
        schermataLobbyOnline1v1,
        schermataLobbyAmico1v1,
        schermataSceltaTorneo,
        schermataSetupTorneo,
        schermataEntraTorneo,
        schermataLobbyTorneo,
        document.getElementById("schermata-torneo-draft"),
        document.getElementById("schermata-torneo-simulazione"),
        document.getElementById("schermata-torneo-risultato"),
        document.getElementById("vista-tabellone-torneo")
    ].forEach((schermata) => {
        if (schermata) schermata.style.display = "none";
    });

    if (nomeSchermata === "scelta" && schermataSceltaTorneo) {
        schermataSceltaTorneo.style.display = "block";
    }

    if (nomeSchermata === "setup" && schermataSetupTorneo) {
        schermataSetupTorneo.style.display = "block";
    }

    if (nomeSchermata === "entra" && schermataEntraTorneo) {
        schermataEntraTorneo.style.display = "block";
    }

    if (nomeSchermata === "lobby" && schermataLobbyTorneo) {
        schermataLobbyTorneo.style.display = "block";
    }

    schermataLobby1v1Corrente = null;
}

// --- FUNZIONI PER LA NAVIGAZIONE TORNEO ---

function apriSceltaTorneo() {
    pulisciParametroLobbyTorneo();
    mostraSoloSchermataTorneo("scelta");
}

function apriCreaTorneo() {
    sincronizzaSetupTorneo();
    mostraSoloSchermataTorneo("setup");
}

function apriEntraTorneo() {
    mostraSoloSchermataTorneo("entra");
    
    // Reset input (solo codice, il nickname si mette nella lobby)
    const inputCodice = document.getElementById("input-codice-torneo");
    const btnConferma = document.getElementById("btn-entra-torneo-conferma");
    
    if (inputCodice) inputCodice.value = "";
    if (btnConferma) {
        btnConferma.disabled = true;
        btnConferma.style.opacity = "0.4";
        btnConferma.style.cursor = "not-allowed";
    }
    
    // Aggiungi listener per validazione real-time (solo codice)
    if (inputCodice) {
        inputCodice.oninput = validaInputEntraTorneo;
    }
}

function validaInputEntraTorneo() {
    const inputCodice = document.getElementById("input-codice-torneo");
    const btnConferma = document.getElementById("btn-entra-torneo-conferma");
    
    const codice = inputCodice ? inputCodice.value.trim() : "";
    const codiceValido = codice.length >= 4;
    
    // Abilita/disabilita bottone solo in base al codice
    if (btnConferma) {
        btnConferma.disabled = !codiceValido;
        btnConferma.style.opacity = codiceValido ? "1" : "0.4";
        btnConferma.style.cursor = codiceValido ? "pointer" : "not-allowed";
    }
}

async function confermaEntrataInTorneo() {
    const inputCodice = document.getElementById("input-codice-torneo");
    const codice = inputCodice ? inputCodice.value.trim().toUpperCase() : "";
    
    if (!codice || codice.length < 4) {
        mostraMessaggioCustom("CODICE NON VALIDO", "Inserisci un codice torneo valido (minimo 4 caratteri).");
        return;
    }
    
    await eseguiOperazioneLobbyTorneo(async () => {
        mostraSoloSchermataTorneo("lobby");
        impostaStatoTorneoProvvisorio("Entro nel torneo...");

        try {
            await entraInLobbyTorneo(codice);
            // Il nickname verrà impostato nella lobby tramite il form
        } catch (error) {
            console.error("Errore ingresso torneo da codice:", error);
            fermaAscoltoLobbyTorneo();
            lobbyTorneoCorrente = null;
            apriEntraTorneo();
            mostraMessaggioCustom("CODICE NON VALIDO", `Impossibile entrare nel torneo con il codice "${codice}". Potrebbe essere scaduto, pieno o non esistente.`);
        }
    });
}

function tornaAllaSceltaTorneo() {
    apriSceltaTorneo();
}

function apriSetupTorneo() {
    sincronizzaSetupTorneo();
    pulisciParametroLobbyTorneo();
    mostraSoloSchermataTorneo("setup");
}

function impostaAzioniLobbyTorneoDisabilitate(disabilitate) {
    document.querySelectorAll("[data-torneo-action]").forEach((bottone) => {
        if (disabilitate) {
            bottone.dataset.torneoDisabledBefore = bottone.disabled ? "true" : "false";
            bottone.disabled = true;
            bottone.classList.add("is-loading");
            return;
        }

        bottone.disabled = bottone.dataset.torneoDisabledBefore === "true";
        delete bottone.dataset.torneoDisabledBefore;
        bottone.classList.remove("is-loading");
    });

    if (!disabilitate && lobbyTorneoCorrente) {
        aggiornaUiLobbyTorneo(lobbyTorneoCorrente);
    }
}

async function eseguiOperazioneLobbyTorneo(operazione) {
    if (azioneLobbyTorneoInCorso) return;

    azioneLobbyTorneoInCorso = true;
    impostaAzioniLobbyTorneoDisabilitate(true);

    try {
        await operazione();
    } finally {
        azioneLobbyTorneoInCorso = false;
        impostaAzioniLobbyTorneoDisabilitate(false);
    }
}

function fermaAscoltoLobbyTorneo() {
    if (typeof unsubscribeLobbyTorneo === "function") {
        unsubscribeLobbyTorneo();
    }
    unsubscribeLobbyTorneo = null;
}

function pulisciParametroLobbyTorneo() {
    const url = new URL(window.location.href);
    url.searchParams.delete("torneo");
    url.searchParams.delete("lobby");
    window.history.replaceState({}, "", url.toString());
}

function aggiornaParametroLobbyTorneo(lobby) {
    const url = new URL(window.location.href);

    if (lobby && lobby.id && lobby.stato !== "closed") {
        url.searchParams.set("torneo", lobby.id);
        url.searchParams.delete("lobby");
    } else {
        url.searchParams.delete("torneo");
    }

    window.history.replaceState({}, "", url.toString());
}

function generaLobbyIdTorneo() {
    return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function getLinkLobbyTorneo(lobbyId) {
    const url = new URL(window.location.href);
    url.searchParams.set("torneo", lobbyId);
    url.searchParams.delete("lobby");
    return url.toString();
}

function getSogliaAvvioTorneo(dimensione) {
    return Math.max(2, Number(dimensione) / 2);
}

function calcolaStatoTorneoPerNumero(numeroGiocatori, dimensione) {
    return numeroGiocatori >= getSogliaAvvioTorneo(dimensione) ? "ready" : "waiting";
}

function normalizzaGiocatoriTorneo(lobby) {
    return Array.isArray(lobby && lobby.giocatori) ? lobby.giocatori.filter(Boolean) : [];
}

function creaGiocatoreTorneo(isHost = false) {
    return {
        uid: window.utenteUID,
        nome: TORNEO_NOME_DEFAULT,
        modulo: TORNEO_MODULO_DEFAULT,
        isHost,
        joinedAt: Date.now()
    };
}

function getGiocatoreTorneoCorrente(lobby) {
    return normalizzaGiocatoriTorneo(lobby).find((giocatore) => giocatore.uid === window.utenteUID) || null;
}

function getNomeTorneoDaInput() {
    const input = document.getElementById("input-nome-torneo");
    const nome = input ? input.value.trim().replace(/\s+/g, " ") : "";
    return nome || TORNEO_NOME_DEFAULT;
}

function getModuloTorneoDaInput() {
    const select = document.getElementById("select-modulo-torneo");
    return select && select.value ? select.value : TORNEO_MODULO_DEFAULT;
}

function sincronizzaFormProfiloTorneo(lobby) {
    const inputNome = document.getElementById("input-nome-torneo");
    const selectModulo = document.getElementById("select-modulo-torneo");
    const giocatore = getGiocatoreTorneoCorrente(lobby);

    if (inputNome && document.activeElement !== inputNome) {
        inputNome.value = giocatore ? giocatore.nome : TORNEO_NOME_DEFAULT;
    }

    if (selectModulo && document.activeElement !== selectModulo) {
        selectModulo.value = giocatore ? giocatore.modulo : TORNEO_MODULO_DEFAULT;
    }
}

function getCampoTorneo(nomeCampo) {
    return document.querySelector(`[data-torneo-field="${nomeCampo}"]`);
}

function setCampoTorneo(nomeCampo, valore) {
    const campo = getCampoTorneo(nomeCampo);
    if (campo) campo.textContent = valore;
}

function impostaStatoTorneoProvvisorio(messaggio) {
    const dimensione = configTorneoScelta.dimensione;
    const lista = document.getElementById("lista-slot-torneo");
    const btnAvvia = document.getElementById("btn-avvia-torneo");

    setCampoTorneo("titolo", `MONDIALE A ${dimensione} SQUADRE`);
    setCampoTorneo("iscritti", "1");
    setCampoTorneo("posti-liberi", String(dimensione - 1));
    setCampoTorneo("soglia", String(getSogliaAvvioTorneo(dimensione)));
    setCampoTorneo("codice", "----");
    setCampoTorneo("tempo", `${configTorneoScelta.tempoDraft}s per squadra`);
    setCampoTorneo("overall", configTorneoScelta.overallVisibili ? "Overall visibili" : "Overall nascosti");
    setCampoTorneo("stato", messaggio);

    if (lista) {
        lista.innerHTML = "";
        for (let i = 0; i < dimensione; i++) {
            lista.appendChild(creaRigaSlotTorneo(i, i === 0 ? creaGiocatoreTorneo(true) : null, {
                hostUid: window.utenteUID,
                stato: "waiting"
            }));
        }
    }

    if (btnAvvia) {
        btnAvvia.disabled = true;
        btnAvvia.textContent = "AVVIA TORNEO";
    }
}

async function preparaFirebaseLobbyTorneo() {
    await attendiUtenteFirebase();

    if (!window.dbFirestore || !window.fb || !window.fb.runTransaction) {
        throw new Error("Firebase non inizializzato");
    }
}

async function creaLobbyTorneo() {
    await preparaFirebaseLobbyTorneo();

    const { doc, setDoc } = window.fb;
    const lobbyId = generaLobbyIdTorneo();
    const adesso = Date.now();
    const host = creaGiocatoreTorneo(true);
    const lobby = {
        id: lobbyId,
        modalita: "torneo",
        tipo: "privata",
        stato: "waiting",
        dimensione: configTorneoScelta.dimensione,
        tempoDraft: configTorneoScelta.tempoDraft,
        overallVisibili: configTorneoScelta.overallVisibili,
        hostUid: window.utenteUID,
        hostNome: host.nome,
        giocatori: [host],
        createdAt: adesso,
        updatedAt: adesso,
        torneoCreato: false
    };

    await setDoc(doc(window.dbFirestore, "lobby_tornei", lobbyId), lobby);
    return lobby;
}

async function creaLobbyTorneoDaSetup() {
    await eseguiOperazioneLobbyTorneo(async () => {
        mostraSoloSchermataTorneo("lobby");
        impostaStatoTorneoProvvisorio("Creo la stanza torneo...");
        await abbandonaLobbyTorneoCorrente();

        try {
            const lobby = await creaLobbyTorneo();
            aggiornaUiLobbyTorneo(lobby);
            ascoltaLobbyTorneo(lobby.id);
        } catch (error) {
            console.error("Errore creazione lobby torneo:", error);
            fermaAscoltoLobbyTorneo();
            lobbyTorneoCorrente = null;
            apriSetupTorneo();
            mostraMessaggioCustom("ERRORE TORNEO", "Non sono riuscito a creare la lobby torneo. Controlla la connessione e riprova.");
        }
    });
}

function creaRigaSlotTorneo(indice, giocatore, lobby) {
    const riga = document.createElement("div");
    riga.className = "torneo-slot-row";
    if (!giocatore) riga.classList.add("is-empty");
    if (giocatore && giocatore.uid === window.utenteUID) riga.classList.add("is-you");
    if (giocatore && giocatore.uid === lobby.hostUid) riga.classList.add("is-host");

    const numero = document.createElement("span");
    numero.className = "torneo-slot-number";
    numero.textContent = String(indice + 1).padStart(2, "0");

    const info = document.createElement("div");
    info.className = "torneo-slot-info";

    const nome = document.createElement("strong");
    nome.textContent = giocatore ? giocatore.nome : "posto libero";

    const meta = document.createElement("small");
    meta.textContent = giocatore ? `Modulo ${giocatore.modulo || TORNEO_MODULO_DEFAULT}` : "invita un amico";

    info.appendChild(nome);
    info.appendChild(meta);

    const badgeBox = document.createElement("div");
    badgeBox.className = "torneo-slot-badges";

    if (giocatore && giocatore.uid === window.utenteUID) {
        const badgeTu = document.createElement("span");
        badgeTu.textContent = "TU";
        badgeBox.appendChild(badgeTu);
    }

    if (giocatore && giocatore.uid === lobby.hostUid) {
        const badgeHost = document.createElement("span");
        badgeHost.textContent = "HOST";
        badgeBox.appendChild(badgeHost);
    }

    const stato = document.createElement("span");
    stato.className = "torneo-slot-status";
    stato.textContent = giocatore
        ? (lobby.stato === "starting" ? "PRONTO AL DRAFT" : "IN ATTESA...")
        : (lobby.stato === "starting" ? "CPU INSERITA" : "CPU ALL'INIZIO");

    riga.appendChild(numero);
    riga.appendChild(info);
    riga.appendChild(badgeBox);
    riga.appendChild(stato);

    return riga;
}

function aggiornaListaSlotTorneo(lobby) {
    const lista = document.getElementById("lista-slot-torneo");
    if (!lista) return;

    const dimensione = Number(lobby.dimensione) || configTorneoScelta.dimensione;
    const giocatori = normalizzaGiocatoriTorneo(lobby);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < dimensione; i++) {
        fragment.appendChild(creaRigaSlotTorneo(i, giocatori[i] || null, lobby));
    }

    lista.innerHTML = "";
    lista.appendChild(fragment);
}

function aggiornaUiLobbyTorneo(lobby) {
    lobbyTorneoCorrente = lobby;

    // Durante draft e torneo la lobby continua a ricevere snapshot Firebase,
    // ma non deve mai riportare l'utente alla schermata di attesa.
    if (lobby.stato === "draft" || lobby.stato === "simulazione" || lobby.stato === "concluso") return;

    if (schermataLobbyTorneo && schermataLobbyTorneo.style.display === "none") {
        mostraSoloSchermataTorneo("lobby");
    }

    const dimensione = Number(lobby.dimensione) || configTorneoScelta.dimensione;
    const giocatori = normalizzaGiocatoriTorneo(lobby);
    const iscritti = giocatori.length;
    const soglia = getSogliaAvvioTorneo(dimensione);
    const postiLiberi = Math.max(0, dimensione - iscritti);
    const sonoHost = lobby.hostUid === window.utenteUID;
    const sogliaRaggiunta = iscritti >= soglia;
    const lobbyAttiva = lobby.stato !== "closed" && lobby.stato !== "starting";

    setCampoTorneo("tag", sonoHost ? "HOST TORNEO" : "TORNEO PRIVATO");
    setCampoTorneo("titolo", `MONDIALE A ${dimensione} SQUADRE`);
    setCampoTorneo("iscritti", String(iscritti));
    setCampoTorneo("posti-liberi", String(postiLiberi));
    setCampoTorneo("soglia", String(soglia));
    setCampoTorneo("codice", lobby.id || "----");
    setCampoTorneo("tempo", `${lobby.tempoDraft || configTorneoScelta.tempoDraft}s per squadra`);
    setCampoTorneo("overall", lobby.overallVisibili ? "Overall visibili" : "Overall nascosti");

    if (lobby.stato === "starting") {
        setCampoTorneo("stato", "Torneo avviato. Il tabellone verra' collegato nel prossimo step.");
    } else if (lobby.stato === "closed") {
        setCampoTorneo("stato", "Lobby chiusa.");
    } else if (sogliaRaggiunta) {
        setCampoTorneo("stato", postiLiberi === 0 ? "Lobby piena. L'host puo dare il via." : "Soglia raggiunta. Gli slot liberi diventeranno CPU all'inizio.");
    } else {
        setCampoTorneo("stato", `Mancano ${soglia - iscritti} iscritti per creare il tabellone.`);
    }

    aggiornaListaSlotTorneo(lobby);
    sincronizzaFormProfiloTorneo(lobby);

    const btnAvvia = document.getElementById("btn-avvia-torneo");
    if (btnAvvia) {
        btnAvvia.disabled = !(sonoHost && sogliaRaggiunta && lobbyAttiva);

        if (lobby.stato === "starting") {
            btnAvvia.textContent = "TORNEO AVVIATO";
        } else if (!sonoHost) {
            btnAvvia.textContent = "IN ATTESA HOST";
        } else if (!sogliaRaggiunta) {
            btnAvvia.textContent = `SERVONO ${soglia - iscritti} GIOCATORI`;
        } else if (postiLiberi > 0) {
            btnAvvia.textContent = "AVVIA CON CPU";
        } else {
            btnAvvia.textContent = "AVVIA TORNEO";
        }
    }

    aggiornaParametroLobbyTorneo(lobby);
}

async function entraInLobbyTorneo(lobbyId) {
    await preparaFirebaseLobbyTorneo();

    const { doc, runTransaction } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_tornei", lobbyId);

    const lobbyAggiornata = await runTransaction(window.dbFirestore, async (transaction) => {
        const snapshot = await transaction.get(ref);

        if (!snapshot.exists()) {
            throw new Error("Lobby torneo non trovata");
        }

        const lobby = { id: snapshot.id, ...snapshot.data() };
        const dimensione = Number(lobby.dimensione) || 16;
        const giocatori = normalizzaGiocatoriTorneo(lobby);

        if (lobby.stato === "closed" || lobby.stato === "starting") {
            throw new Error("Lobby torneo non disponibile");
        }

        if (giocatori.some((giocatore) => giocatore.uid === window.utenteUID)) {
            return lobby;
        }

        if (giocatori.length >= dimensione) {
            throw new Error("Lobby torneo piena");
        }

        const giocatoriAggiornati = [...giocatori, creaGiocatoreTorneo(false)];
        const aggiornamento = {
            giocatori: giocatoriAggiornati,
            stato: calcolaStatoTorneoPerNumero(giocatoriAggiornati.length, dimensione),
            updatedAt: Date.now()
        };

        transaction.update(ref, aggiornamento);
        return { ...lobby, ...aggiornamento };
    });

    aggiornaUiLobbyTorneo(lobbyAggiornata);
    ascoltaLobbyTorneo(lobbyId);
}

function ascoltaLobbyTorneo(lobbyId) {
    fermaAscoltoLobbyTorneo();

    const { doc, onSnapshot } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_tornei", lobbyId);

    unsubscribeLobbyTorneo = onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) {
            const eraLobbyCorrente = lobbyTorneoCorrente && lobbyTorneoCorrente.id === lobbyId;
            fermaAscoltoLobbyTorneo();
            lobbyTorneoCorrente = null;

            if (eraLobbyCorrente) {
                mostraMessaggioCustom("LOBBY TORNEO CHIUSA", "Questa lobby non esiste piu o non e' disponibile.", () => {
                    apriSetupTorneo();
                });
            }
            return;
        }

        const statoPrecedente = lobbyTorneoCorrente ? lobbyTorneoCorrente.stato : null;
        const lobby = { id: snapshot.id, ...snapshot.data() };
        aggiornaUiLobbyTorneo(lobby);

        if (lobby.stato === "closed") {
            fermaAscoltoLobbyTorneo();
            lobbyTorneoCorrente = null;

            if (lobby.closedBy !== window.utenteUID) {
                mostraMessaggioCustom("LOBBY TORNEO CHIUSA", "L'host e' uscito dalla lobby. Puoi crearne una nuova o tornare al menu.", () => {
                    apriSetupTorneo();
                });
            }
        }

        // FIX: Avvia draft quando lo stato passa a "draft"
        if (statoPrecedente !== "draft" && lobby.stato === "draft" && lobby.startedBy !== window.utenteUID) {
            fermaAscoltoLobbyTorneo();
            mostraMessaggioCustom("TORNEO AVVIATO!", "Il draft sta per iniziare. Preparati a scegliere la tua squadra!", () => {
                avviaTorneoDraft(lobby.id);
            });
        }
        
        if (statoPrecedente !== "starting" && lobby.stato === "starting" && lobby.startedBy !== window.utenteUID) {
            mostraMessaggioCustom("TORNEO AVVIATO", "L'host ha dato il via. Nel prossimo step collegheremo tabellone e draft.");
        }
    }, (error) => {
        console.error("Errore ascolto lobby torneo:", error);
        mostraMessaggioCustom("CONNESSIONE TORNEO", "Ho perso il collegamento con la lobby torneo. Riprova tra poco.");
    });
}

async function salvaProfiloTorneo() {
    if (!lobbyTorneoCorrente || !lobbyTorneoCorrente.id) return;

    await eseguiOperazioneLobbyTorneo(async () => {
        try {
            await preparaFirebaseLobbyTorneo();

            const { doc, runTransaction } = window.fb;
            const ref = doc(window.dbFirestore, "lobby_tornei", lobbyTorneoCorrente.id);
            const nome = getNomeTorneoDaInput();
            const modulo = getModuloTorneoDaInput();

            const lobbyAggiornata = await runTransaction(window.dbFirestore, async (transaction) => {
                const snapshot = await transaction.get(ref);

                if (!snapshot.exists()) {
                    throw new Error("Lobby torneo non trovata");
                }

                const lobby = { id: snapshot.id, ...snapshot.data() };
                const giocatori = normalizzaGiocatoriTorneo(lobby);
                const indiceGiocatore = giocatori.findIndex((giocatore) => giocatore.uid === window.utenteUID);

                if (indiceGiocatore === -1) {
                    throw new Error("Giocatore non presente in lobby");
                }

                const giocatoriAggiornati = giocatori.map((giocatore, indice) => {
                    if (indice !== indiceGiocatore) return giocatore;
                    return { ...giocatore, nome, modulo };
                });

                const aggiornamento = {
                    giocatori: giocatoriAggiornati,
                    updatedAt: Date.now()
                };

                if (lobby.hostUid === window.utenteUID) {
                    aggiornamento.hostNome = nome;
                }

                transaction.update(ref, aggiornamento);
                return { ...lobby, ...aggiornamento };
            });

            aggiornaUiLobbyTorneo(lobbyAggiornata);
        } catch (error) {
            console.error("Errore salvataggio profilo torneo:", error);
            mostraMessaggioCustom("PROFILO TORNEO", "Non sono riuscito a salvare nome e modulo. Riprova tra poco.");
        }
    });
}

async function avviaTorneoDaLobby() {
    if (!lobbyTorneoCorrente || !lobbyTorneoCorrente.id) return;

    await eseguiOperazioneLobbyTorneo(async () => {
        try {
            await preparaFirebaseLobbyTorneo();

            const { doc, runTransaction } = window.fb;
            const ref = doc(window.dbFirestore, "lobby_tornei", lobbyTorneoCorrente.id);

            const lobbyAggiornata = await runTransaction(window.dbFirestore, async (transaction) => {
                const snapshot = await transaction.get(ref);

                if (!snapshot.exists()) {
                    throw new Error("Lobby torneo non trovata");
                }

                const lobby = { id: snapshot.id, ...snapshot.data() };
                const giocatori = normalizzaGiocatoriTorneo(lobby);
                const dimensione = Number(lobby.dimensione) || 16;
                const soglia = getSogliaAvvioTorneo(dimensione);

                if (lobby.hostUid !== window.utenteUID) {
                    throw new Error("Solo l'host puo avviare il torneo");
                }

                if (giocatori.length < soglia) {
                    throw new Error("Soglia torneo non raggiunta");
                }

                // Inizializza draftState se non esiste
                const draftState = lobby.draftState || {
                    squadre: {},
                    allenatori: {},
                    giocatoriDraftati: [],
                    allenatoriDraftati: [],
                    updatedAt: Date.now()
                };
                draftState.scadenzaDraft = Date.now() + ((Number(lobby.tempoDraft) || 90) * 1000);
                draftState.autoCompletato = false;

                const aggiornamento = {
                    stato: "draft",
                    torneoCreato: true,
                    startedBy: window.utenteUID,
                    startedAt: Date.now(),
                    draftState: draftState,
                    updatedAt: Date.now()
                };

                transaction.update(ref, aggiornamento);
                return { ...lobby, ...aggiornamento };
            });

            aggiornaUiLobbyTorneo(lobbyAggiornata);
            
            // Avvia il draft per tutti i giocatori
            mostraMessaggioCustom("TORNEO AVVIATO!", "Il draft sta per iniziare. Preparati a scegliere la tua squadra!", () => {
                avviaTorneoDraft(lobbyAggiornata.id);
            });
        } catch (error) {
            console.error("Errore avvio torneo:", error);
            mostraMessaggioCustom("AVVIO TORNEO", "Non posso ancora avviare il torneo. Controlla soglia giocatori e ruolo host.");
        }
    });
}

async function copiaLinkLobbyTorneo() {
    if (!lobbyTorneoCorrente || !lobbyTorneoCorrente.id) return;

    const link = getLinkLobbyTorneo(lobbyTorneoCorrente.id);

    try {
        await navigator.clipboard.writeText(link);
        mostraMessaggioCustom("LINK COPIATO", "Invialo agli altri manager per farli entrare nella lobby torneo.");
    } catch (error) {
        const inputTemporaneo = document.createElement("input");
        inputTemporaneo.value = link;
        document.body.appendChild(inputTemporaneo);
        inputTemporaneo.select();
        document.execCommand("copy");
        document.body.removeChild(inputTemporaneo);
        mostraMessaggioCustom("LINK PRONTO", "Il link invito e' stato preparato per la copia.");
    }
}

async function abbandonaLobbyTorneoCorrente() {
    if (!lobbyTorneoCorrente || !lobbyTorneoCorrente.id) {
        fermaAscoltoLobbyTorneo();
        lobbyTorneoCorrente = null;
        return;
    }

    const lobbyId = lobbyTorneoCorrente.id;
    fermaAscoltoLobbyTorneo();

    try {
        await preparaFirebaseLobbyTorneo();

        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_tornei", lobbyId);

        await runTransaction(window.dbFirestore, async (transaction) => {
            const snapshot = await transaction.get(ref);

            if (!snapshot.exists()) return;

            const lobby = { id: snapshot.id, ...snapshot.data() };
            const giocatori = normalizzaGiocatoriTorneo(lobby);
            const sonoHost = lobby.hostUid === window.utenteUID;
            const sonoDentro = giocatori.some((giocatore) => giocatore.uid === window.utenteUID);

            if (!sonoHost && !sonoDentro) return;

            // Un torneo già avviato è una risorsa condivisa: uscire dal recap non
            // deve riportarlo allo stato di lobby o modificarne i partecipanti.
            if (["draft", "simulazione", "concluso"].includes(lobby.stato)) return;

            if (sonoHost) {
                if (giocatori.length <= 1) {
                    transaction.delete(ref);
                    return;
                }

                transaction.update(ref, {
                    stato: "closed",
                    closedBy: window.utenteUID,
                    closedAt: Date.now(),
                    updatedAt: Date.now()
                });
                return;
            }

            const giocatoriAggiornati = giocatori.filter((giocatore) => giocatore.uid !== window.utenteUID);
            transaction.update(ref, {
                giocatori: giocatoriAggiornati,
                stato: calcolaStatoTorneoPerNumero(giocatoriAggiornati.length, lobby.dimensione),
                updatedAt: Date.now()
            });
        });
    } catch (error) {
        console.error("Errore uscita lobby torneo:", error);
    } finally {
        lobbyTorneoCorrente = null;
        pulisciParametroLobbyTorneo();
    }
}

async function tornaAllaConfigurazioneTorneo() {
    await eseguiOperazioneLobbyTorneo(async () => {
        await abbandonaLobbyTorneoCorrente();
        apriSetupTorneo();
    });
}

async function tornaAlMenuDaTorneo() {
    await eseguiOperazioneLobbyTorneo(async () => {
        if (statoTorneo.timerDraftInterval) clearInterval(statoTorneo.timerDraftInterval);
        if (statoTorneo.unsubscribeDraftTorneo) statoTorneo.unsubscribeDraftTorneo();
        if (statoSimulazioneTorneo.cronometroInterval) clearInterval(statoSimulazioneTorneo.cronometroInterval);

        await abbandonaLobbyTorneoCorrente();
        pulisciParametroLobbyTorneo();
        statoTorneo.lobbyId = null;
        statoTorneo.unsubscribeDraftTorneo = null;
        statoTorneo.timerDraftInterval = null;
        Object.assign(statoSimulazioneTorneo, {
            partitaCorrente: null,
            tabellone: null,
            faseCorrente: null,
            mioPercorso: [],
            risultatiPartite: {},
            vistaTabelloneAttiva: false,
            cronometroInterval: null
        });
        mostraMenuPrincipaleDaOnline();
    });
}

async function gestisciLinkInvitoLobbyTorneo() {
    const params = new URLSearchParams(window.location.search);
    const lobbyId = params.get("torneo");
    if (!lobbyId) return;

    await eseguiOperazioneLobbyTorneo(async () => {
        mostraSoloSchermataTorneo("lobby");
        impostaStatoTorneoProvvisorio("Entro nella lobby torneo...");

        try {
            await entraInLobbyTorneo(lobbyId);
        } catch (error) {
            console.error("Errore ingresso lobby torneo da link:", error);
            fermaAscoltoLobbyTorneo();
            lobbyTorneoCorrente = null;
            pulisciParametroLobbyTorneo();
            apriSceltaTorneo();
            mostraMessaggioCustom("INVITO TORNEO NON VALIDO", "Non riesco a entrare in questa lobby. Potrebbe essere scaduta, piena o gia avviata.");
        }
    });
}

let lobby1v1Corrente = null;
let unsubscribeLobby1v1 = null;
let schermataLobby1v1Corrente = null;
let azioneLobby1v1InCorso = false;

// ============================================================================
// --- VARIABILI GLOBALI TORNEO ---
// ============================================================================
let statoTorneo = {
    mioUID: null,
    mioNickname: "",
    mioModulo: null,
    lobbyId: null,
    miaSquadra: [],
    mioAllenatore: null,
    giocatoriDraftatiGlobale: [], // Giocatori presi da TUTTI i partecipanti
    allenatoriDraftatiGlobale: [], // Allenatori presi (NON esclusivi)
    rerollDisponibili: 3,
    slotAttivoRuolo: null,
    slotAttivoElement: null,
    slotAttivoKey: null,
    cartePerSlot: {},
    rerollUsatiPerSlot: {},
    unsubscribeDraftTorneo: null,
    campoCostruitoTorneo: false,
    tempoDraft: 90,
    overallVisibili: true,
    scadenzaDraft: null,
    timerDraftInterval: null,
    completamentoScadenzaInCorso: false
};

function mostraSoloSchermata1v1(nomeSchermata) {
    nascondiTutteLeSchermate1v1Extra();

    const schermate = [
        schermataMenu,
        schermataModulo,
        schermataGioco,
        schermataScelta1v1,
        schermataLobbyOnline1v1,
        schermataLobbyAmico1v1,
        schermataSetupTorneo,
        schermataLobbyTorneo
    ];

    schermate.forEach((schermata) => {
        if (schermata) schermata.style.display = "none";
    });

    if (!nomeSchermata) {
        schermataLobby1v1Corrente = null;
        return;
    }

    if (nomeSchermata === "scelta" && schermataScelta1v1) {
        schermataScelta1v1.style.display = "block";
        schermataLobby1v1Corrente = null;
        return;
    }

    if (nomeSchermata === "online" && schermataLobbyOnline1v1) {
        schermataLobbyOnline1v1.style.display = "block";
        schermataLobby1v1Corrente = "online";
        return;
    }

    if (nomeSchermata === "amico" && schermataLobbyAmico1v1) {
        schermataLobbyAmico1v1.style.display = "block";
        schermataLobby1v1Corrente = "amico";
    }
}

function mostraMenuPrincipaleDaOnline() {
    nascondiTutteLeSchermate1v1Extra();
    nascondiSchermateTorneoExtra();

    [
        schermataScelta1v1,
        schermataLobbyOnline1v1,
        schermataLobbyAmico1v1,
        schermataSceltaTorneo,
        schermataSetupTorneo,
        schermataEntraTorneo,
        schermataLobbyTorneo,
        schermataModulo,
        schermataGioco
    ].forEach((schermata) => {
        if (schermata) schermata.style.display = "none";
    });

    if (schermataMenu) schermataMenu.style.display = "block";
    schermataLobby1v1Corrente = null;
}

function nascondiSchermateTorneoExtra() {
    [
        "schermata-torneo-draft",
        "schermata-torneo-simulazione",
        "schermata-torneo-risultato",
        "vista-tabellone-torneo"
    ].forEach((id) => {
        const schermata = document.getElementById(id);
        if (schermata) schermata.style.display = "none";
    });
}

function pulisciParametroLobby1v1() {
    const url = new URL(window.location.href);
    url.searchParams.delete("lobby");
    url.searchParams.delete("torneo");
    window.history.replaceState({}, "", url.toString());
}

function aggiornaParametroLobby1v1(lobby) {
    const url = new URL(window.location.href);

    if (lobby && lobby.tipo === "privata") {
        url.searchParams.set("lobby", lobby.id);
        url.searchParams.delete("torneo");
    } else {
        url.searchParams.delete("lobby");
    }

    window.history.replaceState({}, "", url.toString());
}

function getPannelloLobby1v1(tipoSchermata = schermataLobby1v1Corrente) {
    if (!tipoSchermata) return null;
    return document.querySelector(`[data-lobby-panel="${tipoSchermata}"]`);
}

function getCampoLobby1v1(nomeCampo, tipoSchermata = schermataLobby1v1Corrente) {
    const pannello = getPannelloLobby1v1(tipoSchermata);
    return pannello ? pannello.querySelector(`[data-lobby-field="${nomeCampo}"]`) : null;
}

function setTestoCampoLobby1v1(nomeCampo, testo, tipoSchermata = schermataLobby1v1Corrente) {
    const campo = getCampoLobby1v1(nomeCampo, tipoSchermata);
    if (campo) campo.textContent = testo;
}

function pulisciUiLobby1v1() {
    ["online", "amico"].forEach((tipoSchermata) => {
        setTestoCampoLobby1v1("tipo", tipoSchermata === "amico" ? "INVITO PRIVATO" : "MATCHMAKING", tipoSchermata);
        setTestoCampoLobby1v1("titolo", "Lobby in preparazione", tipoSchermata);
        setTestoCampoLobby1v1("stato", "In attesa dei dati della lobby...", tipoSchermata);
        setTestoCampoLobby1v1("host-name", "In attesa", tipoSchermata);
        setTestoCampoLobby1v1("host-status", "Slot host", tipoSchermata);
        setTestoCampoLobby1v1("guest-name", "In attesa", tipoSchermata);
        setTestoCampoLobby1v1("guest-status", "Slot sfidante", tipoSchermata);

        const inputLink = getCampoLobby1v1("link-input", tipoSchermata);
        const boxLink = getCampoLobby1v1("link-box", tipoSchermata);
        const btnDraft = getCampoLobby1v1("draft-button", tipoSchermata);

        if (inputLink) inputLink.value = "";
        if (boxLink) boxLink.hidden = true;
        if (btnDraft) {
            btnDraft.disabled = true;
            btnDraft.onclick = () => mostraMessaggioCustom("DRAFT 1V1", "La lobby e' pronta. Nel prossimo step collegheremo qui il draft 1v1.");
        }
    });
}

function impostaAzioniLobby1v1Disabilitate(disabilitate) {
    document.querySelectorAll("[data-1v1-action]").forEach((bottone) => {
        bottone.disabled = disabilitate;
        bottone.classList.toggle("is-loading", disabilitate);
    });
}

async function eseguiOperazioneLobby1v1(operazione) {
    if (azioneLobby1v1InCorso) return;

    azioneLobby1v1InCorso = true;
    impostaAzioniLobby1v1Disabilitate(true);

    try {
        await operazione();
    } finally {
        azioneLobby1v1InCorso = false;
        impostaAzioniLobby1v1Disabilitate(false);
    }
}

function fermaAscoltoLobby1v1() {
    if (typeof unsubscribeLobby1v1 === "function") {
        unsubscribeLobby1v1();
    }
    unsubscribeLobby1v1 = null;
}

function apriSchermataScelta1v1() {
    pulisciUiLobby1v1();
    pulisciParametroLobby1v1();
    mostraSoloSchermata1v1("scelta");
}

function apriSchermataLobby1v1() {
    apriSchermataScelta1v1();
}

async function tornaAlMenuDaOnline() {
    await eseguiOperazioneLobby1v1(async () => {
        await abbandonaLobby1v1Corrente();
        pulisciUiLobby1v1();
        pulisciParametroLobby1v1();
        // Nascondi tutte le schermate 1v1 e mostra il menu principale
        nascondiTutteLeSchermate1v1Extra();
        schermataScelta1v1.style.display = "none";
        schermataLobbyOnline1v1.style.display = "none";
        schermataLobbyAmico1v1.style.display = "none";
        schermataMenu.style.display = "block";
    });
}

async function tornaAllaScelta1v1() {
    await eseguiOperazioneLobby1v1(async () => {
        impostaStatoLobbyProvvisorio("Esco dalla lobby...");
        await abbandonaLobby1v1Corrente();
        apriSchermataScelta1v1();
    });
}

function resetSchermataLobby1v1(fermaListener = true) {
    if (fermaListener) fermaAscoltoLobby1v1();
    lobby1v1Corrente = null;
    apriSchermataScelta1v1();
}

function generaLobbyId1v1() {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `JUV-${random}`;
}

function getNomeManagerOnline() {
    // FIX: Non usare più localStorage per le lobby 1v1
    // Il nickname viene preso direttamente dall'input field nella lobby
    return "Manager"; // Valore placeholder, verrà sovrascritto dall'input
}

function getLinkLobby1v1(lobbyId) {
    const url = new URL(window.location.href);
    url.searchParams.set("lobby", lobbyId);
    return url.toString();
}

function aggiornaUiLobby1v1(lobby) {
    const tipoSchermata = lobby.tipo === "privata" ? "amico" : "online";

    if (schermataLobby1v1Corrente !== tipoSchermata) {
        mostraSoloSchermata1v1(tipoSchermata);
    }

    const titolo = getCampoLobby1v1("titolo", tipoSchermata);
    const stato = getCampoLobby1v1("stato", tipoSchermata);
    const tipo = getCampoLobby1v1("tipo", tipoSchermata);
    const hostName = getCampoLobby1v1("host-name", tipoSchermata);
    const hostStatus = getCampoLobby1v1("host-status", tipoSchermata);
    const guestName = getCampoLobby1v1("guest-name", tipoSchermata);
    const guestStatus = getCampoLobby1v1("guest-status", tipoSchermata);
    const inputLink = getCampoLobby1v1("link-input", tipoSchermata);
    const boxLink = getCampoLobby1v1("link-box", tipoSchermata);
    const btnDraft = getCampoLobby1v1("draft-button", tipoSchermata);

    lobby1v1Corrente = lobby;

    if (titolo) titolo.textContent = `Lobby ${lobby.id}`;
    if (tipo) tipo.textContent = lobby.tipo === "privata" ? "INVITO PRIVATO" : "MATCHMAKING";
    
    // FIX: Mostra "Inserisci nickname" se non ancora impostato
    if (hostName) {
        if (lobby.hostUid === window.utenteUID && !lobby.hostNome) {
            hostName.textContent = "Inserisci il tuo nickname →";
        } else {
            hostName.textContent = lobby.hostNome || "In attesa nickname...";
        }
    }
    
    if (hostStatus) {
        hostStatus.textContent = lobby.hostUid === window.utenteUID ? "Sei tu" : "Host collegato";
    }
    
    if (guestName) {
        if (lobby.guestUid === window.utenteUID && !lobby.guestNome) {
            guestName.textContent = "Inserisci il tuo nickname →";
        } else if (lobby.guestUid) {
            guestName.textContent = lobby.guestNome || "In attesa nickname...";
        } else {
            guestName.textContent = "In attesa sfidante...";
        }
    }
    
    if (guestStatus) {
        guestStatus.textContent = lobby.guestUid ? (lobby.guestUid === window.utenteUID ? "Sei tu" : "Sfidante collegato") : "Slot libero";
    }

    if (inputLink) inputLink.value = getLinkLobby1v1(lobby.id);
    if (boxLink) boxLink.hidden = lobby.tipo !== "privata";

    // FIX: La lobby è pronta solo se ENTRAMBI hanno inserito il nickname
    const lobbyPronta = Boolean(
        lobby.hostUid && 
        lobby.guestUid && 
        lobby.hostNome && 
        lobby.guestNome && 
        lobby.stato !== "closed"
    );

    // Controlla che il nickname dell'utente corrente sia valido
    const inputNickOnline = document.getElementById("input-nickname-lobby-online");
    const inputNickAmico = document.getElementById("input-nickname-lobby-amico");
    let mioNickValido = false;
    if (inputNickOnline && inputNickOnline.value.trim().length >= 2) mioNickValido = true;
    if (inputNickAmico && inputNickAmico.value.trim().length >= 2) mioNickValido = true;

    if (stato) {
        if (lobby.stato === "closed") {
            stato.textContent = "Lobby chiusa. Torna alle opzioni per crearne una nuova.";
        } else if (!lobby.guestUid) {
            stato.textContent = "In attesa del secondo giocatore...";
        } else if (!lobby.hostNome || !lobby.guestNome) {
            stato.textContent = "Entrambi i giocatori devono inserire il proprio nickname (min. 2 caratteri) per continuare.";
        } else if (lobbyPronta) {
            stato.textContent = "Entrambi pronti! Clicca AVVIA DRAFT per iniziare.";
        } else {
            stato.textContent = "Preparazione lobby in corso...";
        }
    }

    if (btnDraft) {
        btnDraft.disabled = !(lobbyPronta && mioNickValido);
        btnDraft.onclick = () => avviaDraft1v1DaLobby();
    }

    aggiornaParametroLobby1v1(lobby);
}

function attendiUtenteFirebase() {
    if (window.utenteUID) return Promise.resolve(window.utenteUID);

    return new Promise((resolve, reject) => {
        let tentativi = 0;
        const timer = setInterval(() => {
            tentativi++;
            if (window.utenteUID) {
                clearInterval(timer);
                resolve(window.utenteUID);
            } else if (tentativi > 60) {
                clearInterval(timer);
                reject(new Error("Login anonimo non disponibile"));
            }
        }, 100);
    });
}

async function preparaFirebaseLobby1v1() {
    await attendiUtenteFirebase();

    if (!window.dbFirestore || !window.fb || !window.fb.runTransaction) {
        throw new Error("Firebase non inizializzato");
    }
}

async function creaLobby1v1(tipo) {
    await preparaFirebaseLobby1v1();

    const { doc, setDoc } = window.fb;
    const lobbyId = generaLobbyId1v1();
    const adesso = Date.now();
    const lobby = {
        id: lobbyId,
        modalita: "1v1",
        tipo,
        stato: "waiting",
        hostUid: window.utenteUID,
        hostNome: null, // FIX: Sarà impostato quando l'utente inserisce il nickname
        guestUid: null,
        guestNome: null,
        createdAt: adesso,
        updatedAt: adesso,
        draftCreato: false
    };

    await setDoc(doc(window.dbFirestore, "lobby_1v1", lobbyId), lobby);
    return lobby;
}

async function apriLobbyAmico1v1() {
    await eseguiOperazioneLobby1v1(async () => {
        mostraSoloSchermata1v1("amico");
        impostaStatoLobbyProvvisorio("Creo la lobby privata...", "amico");

        // FIX: Reset completo dello stato precedente
        await abbandonaLobby1v1Corrente();
        
        // FIX: Pulisci il campo nickname per evitare di riutilizzare quello vecchio
        const inputNick = document.getElementById("input-nickname-lobby-amico");
        if (inputNick) {
            inputNick.value = "";
            // Aggiorna l'hint
            const hint = document.getElementById("hint-nickname-amico");
            if (hint) {
                hint.style.color = "#f44336";
                hint.textContent = "Minimo 2 caratteri richiesti.";
            }
        }

        try {
            const lobby = await creaLobby1v1("privata");
            aggiornaUiLobby1v1(lobby);
            ascoltaLobby1v1(lobby.id);
        } catch (error) {
            console.error("Errore creazione lobby privata:", error);
            resetSchermataLobby1v1();
            mostraMessaggioCustom("ERRORE LOBBY", "Non sono riuscito a creare la lobby privata. Controlla la connessione e riprova.");
        }
    });
}

function creaLobbyAmico1v1() {
    return apriLobbyAmico1v1();
}

async function apriLobbyOnline1v1() {
    await eseguiOperazioneLobby1v1(async () => {
        mostraSoloSchermata1v1("online");
        impostaStatoLobbyProvvisorio("Cerco un manager online...", "online");

        // FIX: Reset completo dello stato precedente prima di cercare/creare una lobby
        await abbandonaLobby1v1Corrente();
        
        // FIX: Pulisci il campo nickname per evitare di riutilizzare quello vecchio
        const inputNick = document.getElementById("input-nickname-lobby-online");
        if (inputNick) {
            inputNick.value = "";
            // Aggiorna l'hint
            const hint = document.getElementById("hint-nickname-online");
            if (hint) {
                hint.style.color = "#f44336";
                hint.textContent = "Minimo 2 caratteri richiesti.";
            }
        }

        try {
            await preparaFirebaseLobby1v1();
            // Il matchmaking e' atomico: due utenti che cliccano nello stesso
            // istante non possono creare due lobby pubbliche separate.
            const lobby = await trovaOCreaLobbyPubblica1v1();
            aggiornaUiLobby1v1(lobby);
            ascoltaLobby1v1(lobby.id);
        } catch (error) {
            console.error("Errore matchmaking 1v1:", error);
            resetSchermataLobby1v1();
            mostraMessaggioCustom("MATCHMAKING NON DISPONIBILE", "Non sono riuscito a preparare una lobby online. Riprova tra poco.");
        }
    });
}

function avviaMatchmaking1v1() {
    return apriLobbyOnline1v1();
}

async function trovaOCreaLobbyPubblica1v1() {
    await preparaFirebaseLobby1v1();

    const { doc, runTransaction } = window.fb;
    const codaRef = doc(window.dbFirestore, "lobby_1v1", "_matchmaking_pubblica");

    return runTransaction(window.dbFirestore, async (transaction) => {
        const codaSnap = await transaction.get(codaRef);
        const lobbyInAttesaId = codaSnap.exists() ? codaSnap.data().lobbyInAttesaId : null;

        if (lobbyInAttesaId) {
            const lobbyRef = doc(window.dbFirestore, "lobby_1v1", lobbyInAttesaId);
            const lobbySnap = await transaction.get(lobbyRef);

            if (lobbySnap.exists()) {
                const lobby = { id: lobbySnap.id, ...lobbySnap.data() };
                const lobbyDisponibile = (
                    lobby.tipo === "pubblica" &&
                    lobby.stato === "waiting" &&
                    lobby.hostUid &&
                    !lobby.guestUid
                );

                if (lobbyDisponibile && lobby.hostUid !== window.utenteUID) {
                    const aggiornamento = {
                        guestUid: window.utenteUID,
                        guestNome: null,
                        stato: "ready",
                        updatedAt: Date.now()
                    };

                    transaction.update(lobbyRef, aggiornamento);
                    transaction.set(codaRef, { lobbyInAttesaId: null, updatedAt: Date.now() }, { merge: true });
                    return { ...lobby, ...aggiornamento };
                }

                // Evita di far creare una seconda lobby allo stesso utente in
                // caso di doppio click o retry della richiesta.
                if (lobbyDisponibile && lobby.hostUid === window.utenteUID) {
                    return lobby;
                }
            }
        }

        const lobbyId = generaLobbyId1v1();
        const adesso = Date.now();
        const nuovaLobby = {
            id: lobbyId,
            modalita: "1v1",
            tipo: "pubblica",
            stato: "waiting",
            hostUid: window.utenteUID,
            hostNome: null,
            guestUid: null,
            guestNome: null,
            createdAt: adesso,
            updatedAt: adesso,
            draftCreato: false
        };

        transaction.set(doc(window.dbFirestore, "lobby_1v1", lobbyId), nuovaLobby);
        transaction.set(codaRef, { lobbyInAttesaId: lobbyId, updatedAt: adesso }, { merge: true });
        return nuovaLobby;
    });
}

async function cercaLobbyPubblicaDisponibile1v1() {
    const { collection, getDocs, query, where, limit } = window.fb;
    const q = query(
        collection(window.dbFirestore, "lobby_1v1"),
        where("tipo", "==", "pubblica"),
        where("stato", "==", "waiting"),
        limit(10)
    );

    const snapshot = await getDocs(q);
    let candidata = null;

    snapshot.forEach((docSnap) => {
        const lobby = { id: docSnap.id, ...docSnap.data() };
        if (!candidata && lobby.hostUid !== window.utenteUID && !lobby.guestUid) {
            candidata = lobby;
        }
    });

    return candidata;
}

async function entraInLobby1v1(lobbyId) {
    await preparaFirebaseLobby1v1();

    const { doc, runTransaction } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", lobbyId);

    const lobbyAggiornata = await runTransaction(window.dbFirestore, async (transaction) => {
        const snapshot = await transaction.get(ref);

        if (!snapshot.exists()) {
            throw new Error("Lobby non trovata");
        }

        const lobby = { id: snapshot.id, ...snapshot.data() };

        if (lobby.stato === "closed") {
            throw new Error("Lobby chiusa");
        }

        if (lobby.hostUid === window.utenteUID || lobby.guestUid === window.utenteUID) {
            return lobby;
        }

        if (lobby.guestUid) {
            throw new Error("Lobby piena");
        }

        const aggiornamento = {
            guestUid: window.utenteUID,
            guestNome: null, // FIX: Sarà impostato quando l'utente inserisce il nickname
            stato: "ready",
            updatedAt: Date.now()
        };

        transaction.update(ref, aggiornamento);
        return { ...lobby, ...aggiornamento };
    });

    aggiornaUiLobby1v1(lobbyAggiornata);
    ascoltaLobby1v1(lobbyId);
}

function ascoltaLobby1v1(lobbyId) {
    fermaAscoltoLobby1v1();

    const { doc, onSnapshot } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", lobbyId);

    unsubscribeLobby1v1 = onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) {
            const eraLobbyCorrente = lobby1v1Corrente && lobby1v1Corrente.id === lobbyId;
            fermaAscoltoLobby1v1();
            lobby1v1Corrente = null;

            if (eraLobbyCorrente) {
                mostraMessaggioCustom("LOBBY CHIUSA", "Questa lobby non esiste piu o non e' disponibile.", () => {
                    apriSchermataScelta1v1();
                });
            }
            return;
        }

        const lobbyPrecedente = lobby1v1Corrente;
        const lobby = { id: snapshot.id, ...snapshot.data() };
        aggiornaUiLobby1v1(lobby);

        if (lobby.draftCreato && lobby.stato !== "closed") {
            avviaDraft1v1DaLobby();
            return;
        }

        if (lobby.stato === "closed") {
            fermaAscoltoLobby1v1();
            const nomeUscito = lobby.closedBy === lobby.hostUid ? (lobby.hostNome || "L'host") : (lobby.guestNome || "Lo sfidante");
            lobby1v1Corrente = null;

            if (lobby.closedBy !== window.utenteUID) {
                mostraMessaggioCustom("LOBBY CHIUSA", `${nomeUscito} ha abbandonato la lobby.`, () => {
                    apriSchermataScelta1v1();
                });
            }
            return;
        }

        // FIX: Rileva quando un giocatore esce dalla lobby (guestUid passa da esistente a null)
        if (lobbyPrecedente && lobbyPrecedente.guestUid && !lobby.guestUid) {
            const nomeUscito = lobbyPrecedente.guestNome || "Lo sfidante";
            mostraMessaggioCustom("GIOCATORE USCITO", `${nomeUscito} ha abbandonato la lobby. In attesa di un nuovo sfidante...`);
        }
    }, (error) => {
        console.error("Errore ascolto lobby:", error);
        mostraMessaggioCustom("CONNESSIONE LOBBY", "Ho perso il collegamento con la lobby. Riprova tra poco.");
    });
}

async function abbandonaLobby1v1Corrente() {
    if (!lobby1v1Corrente || !lobby1v1Corrente.id) {
        fermaAscoltoLobby1v1();
        lobby1v1Corrente = null;
        return;
    }

    const lobbyId = lobby1v1Corrente.id;
    fermaAscoltoLobby1v1();

    try {
        await preparaFirebaseLobby1v1();

        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_1v1", lobbyId);

        await runTransaction(window.dbFirestore, async (transaction) => {
            const snapshot = await transaction.get(ref);

            if (!snapshot.exists()) return;

            const lobby = snapshot.data();
            const sonoHost = lobby.hostUid === window.utenteUID;
            const sonoGuest = lobby.guestUid === window.utenteUID;
            const codaRef = doc(window.dbFirestore, "lobby_1v1", "_matchmaking_pubblica");
            const codaSnapshot = lobby.tipo === "pubblica" ? await transaction.get(codaRef) : null;
            const lobbyInCodaId = codaSnapshot?.exists() ? codaSnapshot.data().lobbyInAttesaId : null;

            if (!sonoHost && !sonoGuest) return;

            if (sonoGuest) {
                transaction.update(ref, {
                    guestUid: null,
                    guestNome: null,
                    stato: "waiting",
                    updatedAt: Date.now()
                });

                // Rende di nuovo disponibile la lobby pubblica per il prossimo
                // manager, senza sovrascrivere un'eventuale coda gia valida.
                if (lobby.tipo === "pubblica" && !lobbyInCodaId) {
                    transaction.set(codaRef, { lobbyInAttesaId: lobbyId, updatedAt: Date.now() }, { merge: true });
                }
                return;
            }

            if (sonoHost && lobby.guestUid) {
                transaction.update(ref, {
                    stato: "closed",
                    closedBy: window.utenteUID,
                    closedAt: Date.now(),
                    updatedAt: Date.now()
                });
                return;
            }

            if (lobby.tipo === "pubblica" && lobbyInCodaId === lobbyId) {
                transaction.set(codaRef, { lobbyInAttesaId: null, updatedAt: Date.now() }, { merge: true });
            }
            transaction.delete(ref);
        });
    } catch (error) {
        console.error("Errore uscita lobby 1v1:", error);
    } finally {
        lobby1v1Corrente = null;
        pulisciParametroLobby1v1();
    }
}

function impostaStatoLobbyProvvisorio(messaggio, tipoSchermata = schermataLobby1v1Corrente) {
    const titolo = getCampoLobby1v1("titolo", tipoSchermata);
    const stato = getCampoLobby1v1("stato", tipoSchermata);
    const tipo = getCampoLobby1v1("tipo", tipoSchermata);
    const hostName = getCampoLobby1v1("host-name", tipoSchermata);
    const guestName = getCampoLobby1v1("guest-name", tipoSchermata);
    const hostStatus = getCampoLobby1v1("host-status", tipoSchermata);
    const guestStatus = getCampoLobby1v1("guest-status", tipoSchermata);
    const boxLink = getCampoLobby1v1("link-box", tipoSchermata);
    const btnDraft = getCampoLobby1v1("draft-button", tipoSchermata);

    if (titolo) titolo.textContent = "Lobby 1v1";
    if (stato) stato.textContent = messaggio;
    if (tipo) tipo.textContent = tipoSchermata === "amico" ? "INVITO PRIVATO" : "MATCHMAKING";
    if (hostName) hostName.textContent = getNomeManagerOnline();
    if (guestName) guestName.textContent = "In attesa";
    if (hostStatus) hostStatus.textContent = "Connessione in corso";
    if (guestStatus) guestStatus.textContent = "Slot libero";
    if (boxLink) boxLink.hidden = true;
    if (btnDraft) btnDraft.disabled = true;
}

async function copiaLinkLobby1v1() {
    const input = getCampoLobby1v1("link-input", "amico");
    if (!input || !input.value) return;

    try {
        await navigator.clipboard.writeText(input.value);
        mostraMessaggioCustom("LINK COPIATO", "Invialo al tuo amico per farlo entrare nella lobby 1v1.");
    } catch (error) {
        input.select();
        document.execCommand("copy");
        mostraMessaggioCustom("LINK PRONTO", "Il link e' selezionato. Puoi copiarlo e inviarlo al tuo amico.");
    }
}

async function gestisciLinkInvitoLobby1v1() {
    const params = new URLSearchParams(window.location.search);
    const lobbyId = params.get("lobby");
    if (!lobbyId) return;

    await eseguiOperazioneLobby1v1(async () => {
        mostraSoloSchermata1v1("amico");
        impostaStatoLobbyProvvisorio("Entro nella lobby invitata...", "amico");

        // FIX: Reset completo prima di entrare nella lobby da link
        await abbandonaLobby1v1Corrente();
        
        // FIX: Pulisci il campo nickname
        const inputNick = document.getElementById("input-nickname-lobby-amico");
        if (inputNick) {
            inputNick.value = "";
            const hint = document.getElementById("hint-nickname-amico");
            if (hint) {
                hint.style.color = "#f44336";
                hint.textContent = "Minimo 2 caratteri richiesti.";
            }
        }

        try {
            await entraInLobby1v1(lobbyId);
        } catch (error) {
            console.error("Errore ingresso lobby da link:", error);
            resetSchermataLobby1v1();
            mostraMessaggioCustom("INVITO NON VALIDO", "Non riesco a entrare in questa lobby. Potrebbe essere scaduta o gia completa.");
        }
    });
}

document.getElementById("btn-hub-guida").addEventListener("click", () => {
    document.getElementById("modal-come-si-gioca").classList.remove("hidden");
});

function chiudiTendina(idTendina, idBottone) {
    const tendina = document.getElementById(idTendina);
    const bottone = document.getElementById(idBottone);

    if (tendina) {
        tendina.classList.remove("attivo");
    }

    if (bottone) {
        bottone.setAttribute("aria-expanded", "false");
    }
}

function toggleTendina() {
    const tendina = document.getElementById("tendina-modalita");
    const bottone = document.getElementById("btn-hub-gioca");
    if (!tendina) return;

    const siApre = !tendina.classList.contains("attivo");
    chiudiTendina("tendina-multiplayer", "btn-hub-multiplayer");
    tendina.classList.toggle("attivo", siApre);

    if (bottone) {
        bottone.setAttribute("aria-expanded", siApre ? "true" : "false");
    }
}

function toggleTendinaMultiplayer() {
    const tendina = document.getElementById("tendina-multiplayer");
    const bottone = document.getElementById("btn-hub-multiplayer");
    if (!tendina) return;

    const siApre = !tendina.classList.contains("attivo");
    chiudiTendina("tendina-modalita", "btn-hub-gioca");
    tendina.classList.toggle("attivo", siApre);

    if (bottone) {
        bottone.setAttribute("aria-expanded", siApre ? "true" : "false");
    }
}

window.addEventListener('click', function(e) {
    const dropdownGioca = document.getElementById("dropdown-gioca");
    const dropdownMulti = document.getElementById("dropdown-multiplayer");

    if (dropdownGioca && !dropdownGioca.contains(e.target)) {
        chiudiTendina("tendina-modalita", "btn-hub-gioca");
    }

    if (dropdownMulti && !dropdownMulti.contains(e.target)) {
        chiudiTendina("tendina-multiplayer", "btn-hub-multiplayer");
    }
});

const audioInno = document.getElementById("audio-inno-juve");
const btnToggleAudio = document.getElementById("btn-toggle-audio");

if (audioInno && btnToggleAudio) {
    audioInno.volume = 0.4; 

    btnToggleAudio.addEventListener("click", () => {
        if (audioInno.paused) {
            btnToggleAudio.classList.add("attivo");
            btnToggleAudio.innerHTML = "🔊 INNO: ON";
            
            audioInno.play().catch(err => {
                console.error("Errore audio:", err);
                mostraMessaggioCustom("AUDIO NON TROVATO", "File audio non trovato! Controlla che il file si chiami esattamente come nell'HTML.");
                btnToggleAudio.classList.remove("attivo");
                btnToggleAudio.innerHTML = "🔇 INNO: OFF";
            });
        } else {
            btnToggleAudio.classList.remove("attivo");
            btnToggleAudio.innerHTML = "🔇 INNO: OFF";
            audioInno.pause();
        }
    });
}

// ============================================================================
// --- MOTORE DI GESTIONE DELLE CLASSIFICHE (FIREBASE FIRESTORE) ---
// ============================================================================

let tipoClassificaCorrente = "giornaliere"; 
let modalitaClassificaCorrente = "classica";

// La funzione di ordinamento rimane invariata, è perfetta.
function ordinaClassificaSezione(arrayRecord, modalita) {
    arrayRecord.sort((a, b) => {
        if (modalita === "quota102") {
            if (a.sfidaSuperata !== b.sfidaSuperata) return a.sfidaSuperata ? -1 : 1;
            if (b.punti !== a.punti) return b.punti - a.punti;
            if (b.vittorie !== a.vittorie) return b.vittorie - a.vittorie;
            return a.timestamp - b.timestamp;
            
        } else if (modalita === "champions") {
            if (a.piazzamentoVal !== b.piazzamentoVal) return a.piazzamentoVal - b.piazzamentoVal;
            if (a.posizioneGenerale !== b.posizioneGenerale) return a.posizioneGenerale - b.posizioneGenerale;
            return a.timestamp - b.timestamp;
            
        } else {
            if (b.vittorie !== a.vittorie) return b.vittorie - a.vittorie;
            return a.timestamp - b.timestamp;
        }
    });
}

async function registraNuovoRecordUtente(modalita, datiRecord) {
    mostraBoxSalvataggioRecord(modalita, datiRecord);
    return;

    let username = "";
    if (!username || username.trim() === "") username = "Anonimo";
    username = username.trim();

    // Salviamo il nome in locale solo per sapere chi è l'utente e mostrargli il suo record personale
    localStorage.setItem("juve_manager_username", username);
    
    const timestampAttuale = Date.now();
    let record = {
        uid: window.utenteUID || "sconosciuto", // <-- AGGIUNGI QUESTO
        nome: username,
        timestamp: timestampAttuale,
        modalita: modalita,
        ...datiRecord
    };
    
    try {
        // Controlla che Firebase sia stato caricato dall'HTML
        if (window.dbFirestore && window.fb) {
            const { collection, addDoc } = window.fb;
            // Salva nel db su una collezione specifica per la modalità (es: classifiche_classica)
            await addDoc(collection(window.dbFirestore, `classifiche_${modalita}`), record);
            console.log("Record salvato su Firebase con successo!");
        }
        
        if (!document.getElementById("modal-classifiche").classList.contains("hidden")) {
            renderizzaClassificaCorrente();
        }
    } catch (error) {
        console.error("Errore nel salvataggio su Firebase:", error);
        mostraMessaggioCustom("ERRORE DI CONNESSIONE", "Impossibile salvare il record sul server. Riprova più tardi.");
    }
}

function mostraBoxSalvataggioRecord(modalita, datiRecord) {
    const boxSalvataggio = document.getElementById("sezione-salvataggio");
    const inputNome = document.getElementById("nome-manager-input");
    const messaggioConferma = document.getElementById("messaggio-conferma-salvataggio");
    const btnSalva = document.getElementById("btn-salva-stagione");

    if (!boxSalvataggio || !inputNome || !messaggioConferma || !btnSalva) return;

    recordSalvataggioInSospeso = { modalita, datiRecord };

    inputNome.disabled = false;
    inputNome.value = localStorage.getItem("juve_manager_username") || "";
    messaggioConferma.style.display = "none";
    btnSalva.disabled = false;
    btnSalva.style.opacity = "1";
    btnSalva.style.cursor = "pointer";
    boxSalvataggio.style.display = "block";

    const schermataRecap = document.getElementById("schermata-recap");
    const recapVisibile = schermataRecap && schermataRecap.style.display !== "none";

    if (recapVisibile) {
        const bottoneRicomincia = schermataRecap.querySelector("center[style*='margin: 40px']");
        if (bottoneRicomincia && boxSalvataggio.parentElement !== schermataRecap) {
            schermataRecap.insertBefore(boxSalvataggio, bottoneRicomincia);
        } else if (!bottoneRicomincia && boxSalvataggio.parentElement !== schermataRecap) {
            schermataRecap.appendChild(boxSalvataggio);
        }
    } else {
        const boxControlliSim = document.getElementById("box-controlli-sim");
        const schermataSimulazione = document.getElementById("schermata-simulazione");
        if (boxControlliSim) {
            if (schermataSimulazione) schermataSimulazione.style.overflowY = "auto";
            boxControlliSim.style.flexDirection = "column";
            boxControlliSim.style.alignItems = "stretch";
            boxControlliSim.appendChild(boxSalvataggio);

            // In Champions il pulsante di nuovo draft deve restare dopo la
            // registrazione in classifica, non sopra al relativo box.
            if (modalita === "champions") {
                const btnRicomincia = document.getElementById("btn-ricomincia-draft-champions");
                if (btnRicomincia) boxControlliSim.appendChild(btnRicomincia);
            }
        }
    }

    setTimeout(() => {
        boxSalvataggio.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
}

function apriClassifiche() {
    const modal = document.getElementById("modal-classifiche");
    modal.classList.remove("hidden");
    setTimeout(() => { modal.classList.add("attivo"); }, 10);
    renderizzaClassificaCorrente();
}

function chiudiClassifiche() {
    const modal = document.getElementById("modal-classifiche");
    modal.classList.remove("attivo");
    setTimeout(() => { modal.classList.add("hidden"); }, 300);
}

function cambiaTipoClassifica(tipo) {
    tipoClassificaCorrente = tipo;
    document.getElementById("tab-giornaliere").classList.toggle("attivo", tipo === "giornaliere");
    document.getElementById("tab-alltime").classList.toggle("attivo", tipo === "allTime");
    renderizzaClassificaCorrente();
}

function cambiaModalitaClassifica(modalita) {
    modalitaClassificaCorrente = modalita;
    document.querySelectorAll(".btn-mod-tab").forEach(btn => {
        btn.classList.toggle("attivo", btn.getAttribute("data-mod") === modalita);
    });
    renderizzaClassificaCorrente();
}

async function renderizzaClassificaCorrente() {
    const intestazione = document.getElementById("intestazione-tabella-classifica");
    const corpo = document.getElementById("corpo-tabella-classifica");
    const containerPersonale = document.getElementById("record-personale-utente");
    
    // UI di Caricamento
    corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--accento-juve); padding:30px; font-weight:bold;">Caricamento dati dal server... ⏳</td></tr>`;
    containerPersonale.innerHTML = "Ricerca del tuo record personale in corso...";
    
    // Setup Intestazioni Tabella
    let intestazioneHTML = `<th>POS</th><th>ALLENATORE</th>`;
    if (modalitaClassificaCorrente === "quota102") {
        intestazioneHTML += `<th>SFIDA 102</th><th>PUNTI TOTALI</th><th>VITTORIE</th><th>DATA</th>`;
    } else if (modalitaClassificaCorrente === "champions") {
        intestazioneHTML += `<th>PIAZZAMENTO FINALE</th><th>POS. GENERALE</th><th>DATA</th>`;
    } else {
        intestazioneHTML += `<th>VITTORIE</th><th>PAREGGI</th><th>SCONFITTE</th><th>DATA</th>`;
    }
    intestazione.innerHTML = intestazioneHTML;
    
    try {
        if (!window.dbFirestore) throw new Error("Firebase non inizializzato");
        const { collection, getDocs, query, where } = window.fb;
        const colRef = collection(window.dbFirestore, `classifiche_${modalitaClassificaCorrente}`);
        
        let q = query(colRef);

        // Se l'utente vuole la classifica giornaliera, filtriamo i record da mezzanotte in poi
        if (tipoClassificaCorrente === "giornaliere") {
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0); // Mezzanotte di oggi
            q = query(colRef, where("timestamp", ">=", oggi.getTime()));
        }

        const querySnapshot = await getDocs(q);
        let records = [];
        querySnapshot.forEach((doc) => {
            records.push(doc.data());
        });

        // 1. Ordina tutti i record usando la tua logica
        ordinaClassificaSezione(records, modalitaClassificaCorrente);

        // 2. Estrapola il record personale (se l'utente ha salvato un nome)
        let mioNome = localStorage.getItem("juve_manager_username");
        let recordPersonale = null;
        if (mioNome) {
            // Poiché l'array è già ordinato, il primo che troviamo col suo nome è il suo record migliore!
            recordPersonale = records.find(r => r.nome.toLowerCase() === mioNome.toLowerCase());
        }

        // 3. Taglia l'array per mostrare solo la Top 10
        const top10 = records.slice(0, 10);

        // -- RENDER DELLA TABELLA --
        corpo.innerHTML = "";
        if (top10.length === 0) {
            corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#555; padding:20px;">Nessun record registrato. Sii il primo a fare la storia!</td></tr>`;
        } else {
            top10.forEach((rec, index) => {
                const dataFormattata = new Date(rec.timestamp).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'});
                let rigaHTML = `<tr><td>#${index + 1}</td><td><strong>${rec.nome}</strong></td>`;
                
                if (modalitaClassificaCorrente === "quota102") {
                    const sfidaIcona = rec.sfidaSuperata ? "✅ SUPERATA" : "❌ FALLITA";
                    rigaHTML += `<td>${sfidaIcona}</td><td>${rec.punti} Pti</td><td>${rec.vittorie} V</td><td>${dataFormattata}</td>`;
                } else if (modalitaClassificaCorrente === "champions") {
                    rigaHTML += `<td>🏆 ${rec.piazzamento.toUpperCase()}</td><td>${rec.posizioneGenerale}° Posto</td><td>${dataFormattata}</td>`;
                } else {
                    rigaHTML += `<td>${rec.vittorie} V</td><td>${rec.pareggi} N</td><td>${rec.sconfitte} P</td><td>${dataFormattata}</td>`;
                }
                
                rigaHTML += `</tr>`;
                corpo.innerHTML += rigaHTML;
            });
        }

        // -- RENDER DEL RECORD PERSONALE --
        if (!recordPersonale) {
            containerPersonale.innerHTML = `⚽ Non hai ancora record in questa modalità (o non hai mai inserito il tuo nome).`;
        } else {
            const dataPers = new Date(recordPersonale.timestamp).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'});
            let stringaDati = "";
            
            if (modalitaClassificaCorrente === "quota102") {
                stringaDati = `Sfida 102: <strong>${recordPersonale.sfidaSuperata ? "SUPERATA ✅" : "FALLITA ❌"}</strong> | Punti: <strong>${recordPersonale.punti}</strong>`;
            } else if (modalitaClassificaCorrente === "champions") {
                stringaDati = `Piazzamento: <strong>${recordPersonale.piazzamento}</strong> | Generale: <strong>${recordPersonale.posizioneGenerale}°</strong>`;
            } else {
                stringaDati = `Vittorie: <strong>${recordPersonale.vittorie}</strong> | Punti: <strong>${recordPersonale.punti || (recordPersonale.vittorie * 3 + recordPersonale.pareggi)}</strong>`;
            }
            
            containerPersonale.innerHTML = `🛡️ <strong>IL TUO MIGLIOR RECORD (${recordPersonale.nome}):</strong> ${stringaDati} <span style="float:right; font-size:0.8rem; color:#666;">Registrato il ${dataPers}</span>`;
        }

    } catch (error) {
        console.error("Errore nel caricamento delle classifiche:", error);
        corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f44336; padding:20px;">Errore di connessione al server.</td></tr>`;
        containerPersonale.innerHTML = `Impossibile caricare il record personale.`;
    }
}

async function salvaStagioneCustom() {
    const inputNome = document.getElementById("nome-manager-input");
    const nomeManager = inputNome.value.trim();
    
    if (nomeManager === "") {
        mostraMessaggioCustom("ERRORE", "Inserisci un nome valido prima di salvare!");
        return;
    }

    if (!recordSalvataggioInSospeso) {
        mostraMessaggioCustom("ERRORE", "Nessun record pronto da salvare per questa simulazione.");
        return;
    }

    const btnSalva = document.getElementById("btn-salva-stagione");
    btnSalva.disabled = true;
    btnSalva.style.opacity = "0.4";
    btnSalva.style.cursor = "not-allowed";

    try {
        await registraNuovoRecordUtenteConNomeGiaFornito(
            recordSalvataggioInSospeso.modalita,
            recordSalvataggioInSospeso.datiRecord,
            nomeManager
        );

        document.getElementById("messaggio-conferma-salvataggio").style.display = "block";
        inputNome.disabled = true;
        recordSalvataggioInSospeso = null;

        if (!document.getElementById("modal-classifiche").classList.contains("hidden")) {
            renderizzaClassificaCorrente();
        }
    } catch (error) {
        console.error("Errore nel salvataggio su Firebase:", error);
        btnSalva.disabled = false;
        btnSalva.style.opacity = "1";
        btnSalva.style.cursor = "pointer";
        mostraMessaggioCustom("ERRORE DI CONNESSIONE", "Impossibile salvare il record sul server. Riprova piu tardi.");
    }
}

// Funzione helper per il bottone custom di salvataggio a fine gara
async function registraNuovoRecordUtenteConNomeGiaFornito(modalita, datiRecord, username) {
    localStorage.setItem("juve_manager_username", username);
    const timestampAttuale = Date.now();
    
    let record = { 
        uid: window.utenteUID || "sconosciuto", // <-- AGGIUNGI QUESTO
        nome: username, 
        timestamp: timestampAttuale, 
        modalita: modalita, 
        ...datiRecord 
    };
    
    if (window.dbFirestore && window.fb) {
        const { collection, addDoc } = window.fb;
        await addDoc(collection(window.dbFirestore, `classifiche_${modalita}`), record);
    }
}


// ============================================================================
// --- MODALITÀ 1V1 ONLINE: NICKNAME IN LOBBY, DRAFT SIMULTANEO, SIMULAZIONE, RISULTATO ---
// ============================================================================

// --- STATO GLOBALE 1V1 ---
let stato1v1 = {
    mioRuolo: null,               // "host" o "guest"
    mioUID: null,
    mioNickname: "",
    avvNickname: "",
    mioModulo: null,
    avvModulo: null,
    lobbyId: null,
    miaSquadra: [],               // array giocatori scelti da me
    avvSquadra: [],               // array giocatori scelti dall'avversario
    giocatoriDraftatiGlobal: [],  // NOMI BASE già scelti da chiunque (esclude tutte le versioni)
    allenatoriDraftatiGlobal: [], // nomi allenatori già scelti
    mioAllenatore: null,
    avvAllenatore: null,
    faseCorrente: "modulo",       // "modulo" | "draft" | "allenatore" | "done"
    unsubscribeDraft: null,
    // Reroll (locali, non sincronizzati — ogni client gestisce i propri)
    reroll1v1Disponibili: 3,
    slotAttivoRuolo: null,        // ruolo attualmente selezionato per il draft
    slotAttivoElement: null,      // elemento DOM dello slot attivo
    carteDraftCorrente: [],       // le 3 carte mostrate ora (anti-reroll gratuito)
    carteSlotCorrente: [],        // opzioni dell'ultimo slot aperto
    slotUltimoRuolo: null,        // ultimo ruolo per cui sono state generate carte fresche
    rerollUsatoSuSlotCorrente: false, // blocca reroll multipli sullo stesso slot
    ultimoRuoloReroll: null,      // per compatibilità (non più usato attivamente)
    unsubscribeAllenatore: null,
};

// Nessun ordine a turni: il draft è simultaneo, ogni utente sceglie il proprio slot
let campiVisualiCostruiti = false;

// Timer pick per aggiungere pressione temporale
const TEMPO_PICK_SECONDI = 30;

// ============================================================================
// --- HELPERS: ESCLUSIONE NOME BASE (tutte le versioni dello stesso giocatore) ---
// ============================================================================

// Estrae il "nome base" da un nome giocatore (es. "G. Buffon 02/03" → "G. Buffon")
// Nel database il nome è già il cognome/nome senza stagione, ma ci possono essere
// duplicati dello stesso nome. Confrontiamo per nome esatto → escludiamo tutte le
// istanze con lo stesso nome, indipendentemente dalla stagione.
function getNomiBaseEsclusi(nomiDraftati) {
    // Dato che ogni giocatore ha nome come "G. Buffon" uguale per tutte le stagioni,
    // basta usare l'array direttamente — ogni entry è già il nome base.
    return new Set(nomiDraftati);
}

function giocatoreGiaEscluso1v1(giocatore, nomiDraftati) {
    const nomiBase = getNomiBaseEsclusi(nomiDraftati);
    return nomiBase.has(giocatore.nome);
}

function allenatoreGiaEscluso1v1(allenatore, nomiDraftati) {
    return nomiDraftati.includes(allenatore.nome);
}

function normalizzaSquadraDraft1v1(squadra) {
    const normalizzata = Array.isArray(squadra) ? squadra.slice(0, 11) : [];
    while (normalizzata.length < 11) normalizzata.push(null);
    return normalizzata;
}

function getGiocatoriSquadra1v1(squadra) {
    return normalizzaSquadraDraft1v1(squadra).filter(Boolean);
}

function contaGiocatoriSquadra1v1(squadra) {
    return getGiocatoriSquadra1v1(squadra).length;
}

function getNomiSquadra1v1(squadra) {
    return getGiocatoriSquadra1v1(squadra).map(g => g.nome);
}

// ============================================================================
// --- FUNZIONE DI ENTRATA: il nickname si prende direttamente dalla lobby ---
// ============================================================================

async function avviaDraft1v1DaLobby() {
    const lobby = lobby1v1Corrente;
    if (!lobby) return;

    stato1v1.mioUID = window.utenteUID;
    stato1v1.mioRuolo = lobby.hostUid === window.utenteUID ? "host" : "guest";
    stato1v1.lobbyId = lobby.id;

    // Il nickname è già stato impostato in lobby tramite aggiornaNicknameInLobby
    stato1v1.mioNickname = stato1v1.mioRuolo === "host" ? lobby.hostNome : lobby.guestNome;
    stato1v1.avvNickname = stato1v1.mioRuolo === "host" ? lobby.guestNome : lobby.hostNome;

    // Reset stato draft
    stato1v1.rerollUsatiPerSlot = {};
    stato1v1.cartePerSlot = {};
    stato1v1.reroll1v1Disponibili = 3;
    stato1v1.slotAttivoRuolo = null;
    stato1v1.slotAttivoElement = null;
    stato1v1.slotAttivoKey = null;
    campiVisualiCostruiti = false;

    fermaAscoltoLobby1v1();
    mostraSoloSchermata1v1(null);
    
    // FIX #1: ENTRAMBI devono cliccare prima di iniziare
    try {
        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
        
        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) throw new Error("Lobby non trovata");
            
            const data = snap.data();
            const campoPronto = stato1v1.mioRuolo === "host" ? "hostProntoDraft" : "guestProntoDraft";
            const campoAvvPronto = stato1v1.mioRuolo === "host" ? "guestProntoDraft" : "hostProntoDraft";
            
            const avvPronto = data[campoAvvPronto] || false;
            
            // Marco me stesso come pronto
            transaction.update(ref, { [campoPronto]: true, updatedAt: Date.now() });
            
            // Se l'avversario è già pronto, inizializzo il documento draft
            if (avvPronto && stato1v1.mioRuolo === "host") {
                // Solo l'host inizializza il draft quando entrambi sono pronti
                transaction.update(ref, {
                    draftCreato: true,
                    stato: "draft",
                    draftStartedBy: window.utenteUID,
                    draftState: creaDraftStateIniziale1v1(),
                    updatedAt: Date.now()
                });
            }
        });
        
        // Mostra schermata modulo e aspetta che il draft sia pronto
        document.getElementById("schermata-1v1-modulo").style.display = "block";
        
        // Aspetta che entrambi siano pronti
        const checkInterval = setInterval(async () => {
            const { doc, getDoc } = window.fb;
            const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
            const snap = await getDoc(ref);
            
            if (snap.exists() && snap.data().draftCreato) {
                clearInterval(checkInterval);
                ascoltaStatoDraft1v1();
            }
        }, 500);
        
    } catch (error) {
        console.error("Errore avvio draft 1v1:", error);
        mostraMessaggioCustom("ERRORE DRAFT 1V1", "Non riesco ad avviare il draft. Controlla la connessione e riprova.");
        tornaAllaLobbyDaModulo1v1();
    }
}

// FIX #2: Torna alla lobby dalla schermata modulo
function tornaAllaLobbyDaModulo1v1() {
    const lobby = lobby1v1Corrente;
    if (!lobby) return;
    
    // Ferma listener Firebase se attivo
    if (stato1v1.unsubscribeDraft) {
        stato1v1.unsubscribeDraft();
        stato1v1.unsubscribeDraft = null;
    }
    
    // Resetta lo stato modulo
    stato1v1.mioModulo = null;
    stato1v1.avvModulo = null;
    
    // Torna alla schermata lobby appropriata
    nascondiTutteLeSchermate1v1Extra();
    const tipoSchermata = lobby.tipo === "privata" ? "amico" : "online";
    mostraSoloSchermata1v1(tipoSchermata);
}

function nascondiTutteLeSchermate1v1Extra() {
    ["schermata-1v1-modulo","schermata-1v1-draft","schermata-1v1-allenatore","schermata-1v1-recap","schermata-1v1-simulazione","schermata-1v1-risultato"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
}

async function aggiornaNicknameLobby1v1(nick) {
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    const { doc, updateDoc } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
    const campo = stato1v1.mioRuolo === "host" ? "hostNome" : "guestNome";
    await updateDoc(ref, { [campo]: nick, updatedAt: Date.now() });
}

// Aggiorna il nome visivo nella lobby quando l'utente digita (già chiamata dall'HTML)
function aggiornaNicknameInLobby(tipo) {
    const inputId = tipo === "online" ? "input-nickname-lobby-online" : "input-nickname-lobby-amico";
    const input = document.getElementById(inputId);
    if (!input) return;
    const nick = input.value.trim();
    const hintId = tipo === "online" ? "hint-nickname-online" : "hint-nickname-amico";
    const hint = document.getElementById(hintId);
    if (hint) {
        hint.style.color = nick.length >= 2 ? "#4caf50" : "#f44336";
        hint.textContent = nick.length >= 2 ? `Nickname: "${nick}" ✓` : "Minimo 2 caratteri richiesti.";
    }
    // FIX: NON salvare più in localStorage - il nickname è solo per questa lobby
    // Aggiorna il nome su Firebase nella lobby corrente (se esiste)
    if (nick.length >= 2 && lobby1v1Corrente && lobby1v1Corrente.id && window.dbFirestore && window.fb) {
        const { doc, updateDoc } = window.fb;
        const mioRuolo = lobby1v1Corrente.hostUid === window.utenteUID ? "host" : "guest";
        const campo = mioRuolo === "host" ? "hostNome" : "guestNome";
        const ref = doc(window.dbFirestore, "lobby_1v1", lobby1v1Corrente.id);
        updateDoc(ref, { [campo]: nick, updatedAt: Date.now() }).catch(() => {});
    }
    // Riaggiorna il bottone AVVIA DRAFT in base alla validità del nick
    if (lobby1v1Corrente) {
        const tipoSchermata = lobby1v1Corrente.tipo === "privata" ? "amico" : "online";
        const btnDraft = getCampoLobby1v1("draft-button", tipoSchermata);
        if (btnDraft) {
            const lobbyPronta = Boolean(
                lobby1v1Corrente.hostUid && 
                lobby1v1Corrente.guestUid && 
                lobby1v1Corrente.hostNome && 
                lobby1v1Corrente.guestNome && 
                lobby1v1Corrente.stato !== "closed"
            );
            btnDraft.disabled = !(lobbyPronta && nick.length >= 2);
        }
    }
}

// ============================================================================
// --- INIZIALIZZAZIONE SCHERMATA DRAFT 1V1 (SIMULTANEO) ---
// ============================================================================

function inizializzaDraftScreen1v1() {
    stato1v1.miaSquadra = [];
    stato1v1.avvSquadra = [];
    stato1v1.giocatoriDraftatiGlobal = [];
    stato1v1.allenatoriDraftatiGlobal = [];
    stato1v1.mioModulo = null;
    stato1v1.avvModulo = null;
    stato1v1.faseCorrente = "modulo";
    stato1v1.mioAllenatore = null;
    stato1v1.avvAllenatore = null;
    stato1v1.reroll1v1Disponibili = 3;
    stato1v1.slotAttivoRuolo = null;
    stato1v1.slotAttivoElement = null;
    stato1v1.carteDraftCorrente = [];
    stato1v1.carteSlotCorrente = [];
    stato1v1.slotUltimoRuolo = null;
    stato1v1.rerollUsatoSuSlotCorrente = false;
    stato1v1.ultimoRuoloReroll = null;
    stato1v1.opzioniAllenatoriGenerate = false; // FIX #2: Reset flag allenatori
    campiVisualiCostruiti = false;

    aggiornaHeaderDraft1v1();
    mostraFasiDraft1v1("modulo");
    ascoltaStatoDraft1v1();
}

function mostraFasiDraft1v1(fase) {
    const fasi = ["draft-1v1-fase-modulo","draft-1v1-attesa-modulo","draft-1v1-fase-draft","draft-1v1-fase-allenatore","draft-1v1-attesa-allenatore"];
    fasi.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    const target = document.getElementById(fase);
    if (target) target.style.display = "block";
}

function aggiornaHeaderDraft1v1() {
    const lobby = lobby1v1Corrente;
    const mioRuolo = stato1v1.mioRuolo;

    let hostNome = stato1v1.mioRuolo === "host" ? stato1v1.mioNickname : stato1v1.avvNickname;
    let guestNome = stato1v1.mioRuolo === "guest" ? stato1v1.mioNickname : stato1v1.avvNickname;
    if (!hostNome) hostNome = (lobby && lobby.hostNome) || "Manager 1";
    if (!guestNome) guestNome = (lobby && lobby.guestNome) || "Manager 2";

    // Update title with player's name
    document.getElementById("draft-1v1-titolo-nome").textContent = stato1v1.mioNickname + " - DRAFT";
}

// ============================================================================
// --- FIREBASE: DOCUMENTO DRAFT 1V1 ---
// ============================================================================

function creaDraftStateIniziale1v1() {
    return {
        faseCorrente: "modulo",
        hostModulo: null,
        guestModulo: null,
        // Draft simultaneo: ogni squadra ha il proprio array
        giocatoriDraftati: [],   // NOMI BASE già scelti da chiunque
        hostSquadra: Array(11).fill(null),
        guestSquadra: Array(11).fill(null),
        // Allenatore
        hostAllenatore: null,
        guestAllenatore: null,
        allenatoriDraftati: [],
        updatedAt: Date.now()
    };
}

async function inizializzaDocumentoDraft1v1() {
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    const { doc, runTransaction, setDoc } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

    if (runTransaction) {
        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            const data = snap.exists() ? snap.data() : {};
            const updateBase = {
                draftCreato: true,
                stato: "draft",
                draftStartedBy: window.utenteUID,
                hostProntoSim: false,
                guestProntoSim: false,
                updatedAt: Date.now()
            };

            if (data.draftState) {
                transaction.update(ref, updateBase);
                return;
            }

            transaction.set(ref, {
                ...updateBase,
                draftState: creaDraftStateIniziale1v1()
            }, { merge: true });
        });
        return;
    }

    await setDoc(ref, {
        draftCreato: true,
        stato: "draft",
        draftStartedBy: window.utenteUID,
        hostProntoSim: false,
        guestProntoSim: false,
        draftState: creaDraftStateIniziale1v1(),
        updatedAt: Date.now()
    }, { merge: true });
}

function ascoltaStatoDraft1v1() {
    if (stato1v1.unsubscribeDraft) stato1v1.unsubscribeDraft();
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;

    const { doc, onSnapshot } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

    stato1v1.unsubscribeDraft = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const ds = data.draftState;
        if (!ds) return;

        // Aggiorna nickname avversario se cambiato
        if (stato1v1.mioRuolo === "host" && data.guestNome) stato1v1.avvNickname = data.guestNome;
        if (stato1v1.mioRuolo === "guest" && data.hostNome) stato1v1.avvNickname = data.hostNome;
        stato1v1.hostProntoSim = Boolean(data.hostProntoSim);
        stato1v1.guestProntoSim = Boolean(data.guestProntoSim);

        sincronizzaStatoDraft1v1(ds);
    });

    return stato1v1.unsubscribeDraft;
}

// --- SINCRONIZZAZIONE STATO DRAFT DAL FIRESTORE ---
function sincronizzaStatoDraft1v1(ds) {
    stato1v1.faseCorrente = ds.faseCorrente;
    stato1v1.giocatoriDraftatiGlobal = ds.giocatoriDraftati || [];
    stato1v1.allenatoriDraftatiGlobal = ds.allenatoriDraftati || [];

    const hostSquadra = normalizzaSquadraDraft1v1(ds.hostSquadra);
    const guestSquadra = normalizzaSquadraDraft1v1(ds.guestSquadra);
    const hostAllenatore = ds.hostAllenatore;
    const guestAllenatore = ds.guestAllenatore;

    if (stato1v1.mioRuolo === "host") {
        stato1v1.miaSquadra = hostSquadra;
        stato1v1.avvSquadra = guestSquadra;
        stato1v1.mioModulo = ds.hostModulo;
        stato1v1.avvModulo = ds.guestModulo;
        stato1v1.mioAllenatore = hostAllenatore;
        stato1v1.avvAllenatore = guestAllenatore;
    } else {
        stato1v1.miaSquadra = guestSquadra;
        stato1v1.avvSquadra = hostSquadra;
        stato1v1.mioModulo = ds.guestModulo;
        stato1v1.avvModulo = ds.hostModulo;
        stato1v1.mioAllenatore = guestAllenatore;
        stato1v1.avvAllenatore = hostAllenatore;
    }

    window._lastDs = { ...ds, hostSquadra, guestSquadra };

    aggiornaHeaderDraft1v1();
    aggiornaContatoriDraft1v1();

    if (ds.faseCorrente === "modulo") {
        gestisciFaseModulo1v1(ds);
    } else if (ds.faseCorrente === "draft") {
        gestisciFaseDraft1v1(ds);
    } else if (ds.faseCorrente === "allenatore") {
        gestisciFaseAllenatore1v1(ds);
    } else if (ds.faseCorrente === "recap" || ds.faseCorrente === "done") {
        mostraRecapDraft1v1();
    } else if (ds.faseCorrente === "simulazione") {
        avviaSimulazione1v1();
    }
}

function aggiornaContatoriDraft1v1() {
    // Update recap sidebar instead of missing header elements
    document.getElementById("recap-1v1-mio-nick").textContent = stato1v1.mioNickname || "-";
    document.getElementById("recap-1v1-avv-nick").textContent = stato1v1.avvNickname || "-";
    document.getElementById("recap-1v1-modulo").textContent = stato1v1.mioModulo || "-";
    // FIX: Conta solo i giocatori non-null
    const countGiocatori = contaGiocatoriSquadra1v1(stato1v1.miaSquadra);
    document.getElementById("recap-1v1-count").textContent = `${countGiocatori}/11`;
    const rerollHeader = document.getElementById("headbar-reroll-1v1-count");
    if (rerollHeader) rerollHeader.textContent = stato1v1.reroll1v1Disponibili;
}

// --- GESTIONE FASE MODULO ---
function gestisciFaseModulo1v1(ds) {
    const mioModulo = stato1v1.mioRuolo === "host" ? ds.hostModulo : ds.guestModulo;
    const avvModulo = stato1v1.mioRuolo === "host" ? ds.guestModulo : ds.hostModulo;

    // Assicura che siamo sulla schermata modulo (separata)
    const schermataModuloEl = document.getElementById("schermata-1v1-modulo");
    if (!schermataModuloEl || schermataModuloEl.style.display === "none") {
        nascondiTutteLeSchermate1v1Extra();
        schermataModuloEl.style.display = "block";
    }

    const labelAttesa = document.getElementById("label-attesa-modulo-1v1");
    
    if (!mioModulo) {
        // Devo ancora scegliere il modulo
        if (labelAttesa) labelAttesa.textContent = "Scegli lo schema tattico per la tua squadra";
        document.querySelectorAll("#schermata-1v1-modulo .card-modulo").forEach(card => {
            card.style.pointerEvents = "auto";
            card.style.opacity = "1";
            card.style.border = "";
        });
    } else if (!avvModulo) {
        // Ho scelto, aspetto l'avversario
        if (labelAttesa) labelAttesa.textContent = `✓ Hai scelto ${mioModulo}. In attesa di ${stato1v1.avvNickname || "avversario"}...`;
        document.querySelectorAll("#schermata-1v1-modulo .card-modulo").forEach(card => {
            card.style.pointerEvents = "none";
            card.style.opacity = "0.4";
            card.style.border = "";
        });
        // Evidenzia la carta selezionata
        document.querySelectorAll("#schermata-1v1-modulo .card-modulo").forEach(card => {
            const nomeModulo = card.querySelector(".nome-modulo");
            if (nomeModulo && nomeModulo.textContent === mioModulo) {
                card.style.opacity = "1";
                card.style.border = "2px solid var(--accento-juve)";
            }
        });
    } else {
        // Entrambi hanno scelto — passa alla schermata draft
        nascondiTutteLeSchermate1v1Extra();
        document.getElementById("schermata-1v1-draft").style.display = "block";
        // Costruisci il campo se non ancora fatto
        if (!campiVisualiCostruiti) {
            costruisciCampiVisivi1v1(ds);
            campiVisualiCostruiti = true;
        }
        aggiornaContatoriDraft1v1();
    }
}

async function impostaModulo1v1(modulo) {
    stato1v1.mioModulo = modulo;
    
    // Visual feedback immediato
    const labelAttesa = document.getElementById("label-attesa-modulo-1v1");
    if (labelAttesa) labelAttesa.textContent = `Hai scelto: ${modulo}. In attesa dell'avversario...`;
    
    // Disabilita tutte le carte modulo
    document.querySelectorAll("#schermata-1v1-modulo .card-modulo").forEach(card => {
        card.style.pointerEvents = "none";
        card.style.opacity = "0.5";
    });
    
    // Evidenzia la carta selezionata
    const selectedCard = Array.from(document.querySelectorAll("#schermata-1v1-modulo .card-modulo"))
        .find(card => card.textContent.includes(modulo));
    if (selectedCard) {
        selectedCard.style.opacity = "1";
        selectedCard.style.border = "2px solid var(--accento-juve)";
    }
    
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) {
        console.error("Firebase non disponibile per salvare il modulo");
        return;
    }

    try {
        const { doc, updateDoc, getDoc } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

        const snap = await getDoc(ref);
        if (!snap.exists()) {
            console.error("Documento lobby non trovato");
            return;
        }
        const ds = snap.data().draftState || {};

        const campoDaAggiornare = stato1v1.mioRuolo === "host" ? "draftState.hostModulo" : "draftState.guestModulo";
        const aggiornamento = {
            [campoDaAggiornare]: modulo,
            "draftState.updatedAt": Date.now()
        };

        // Se l'altro ha già scelto, passiamo alla fase draft
        const avvModulo = stato1v1.mioRuolo === "host" ? ds.guestModulo : ds.hostModulo;
        if (avvModulo) {
            aggiornamento["draftState.faseCorrente"] = "draft";
        }

        await updateDoc(ref, aggiornamento);
    } catch (error) {
        console.error("Errore salvando modulo:", error);
        mostraMessaggioCustom("ERRORE", "Impossibile salvare il modulo. Riprova.");
    }
}

// --- COSTRUZIONE ORDINE DRAFT ---
// Genera l'elenco di 22 pick (11 host + 11 guest) in ordine alternato,
// con l'host che inizia. Per ogni pick salviamo il ruolo da draftare.
function costruisciOrdineDraft1v1(moduloHost, moduloGuest) {
    const slotsHost = estraiSlotsOrdinati(moduloHost);   // 11 slot ruoli
    const slotsGuest = estraiSlotsOrdinati(moduloGuest); // 11 slot ruoli
    const ordine = [];
    for (let i = 0; i < 11; i++) {
        // Il turno pari (0,2,4...) va all'host, dispari al guest (serpentina)
        ordine.push({ ruolo: slotsHost[i], proprietario: "host", slotIndice: i });
        ordine.push({ ruolo: slotsGuest[i], proprietario: "guest", slotIndice: i });
    }
    return ordine;
}

function estraiSlotsOrdinati(modulo) {
    const config = configurazioneModuli[modulo];
    const ruoli = [];
    config.forEach(linea => {
        linea.ruoli.forEach(ruolo => ruoli.push(ruolo));
    });
    return ruoli; // 11 ruoli in ordine campo (por -> dif -> cen -> att)
}

// --- GESTIONE FASE DRAFT SIMULTANEA ---
function gestisciFaseDraft1v1(ds) {
    // Assicura che siamo sulla schermata draft
    const schermataVisible = document.getElementById("schermata-1v1-draft").style.display !== "none";
    if (!schermataVisible) {
        nascondiTutteLeSchermate1v1Extra();
        document.getElementById("schermata-1v1-draft").style.display = "block";
    }

    // Costruisci i campi visivi se non ancora fatto
    if (!campiVisualiCostruiti) {
        costruisciCampiVisivi1v1(ds);
        campiVisualiCostruiti = true;
    } else {
        // Aggiorna solo i giocatori posizionati
        aggiornaSlotCampoVisivo("draft-1v1-mio-campo", stato1v1.miaSquadra, stato1v1.mioModulo);
    }

    aggiornaHeaderDraft1v1();
    aggiornaContatoriDraft1v1();

    // Mostra il contatore reroll
    const btnReroll = document.getElementById("btn-reroll-1v1");
    const countReroll = document.getElementById("reroll-1v1-count");
    if (btnReroll && countReroll) {
        countReroll.textContent = stato1v1.reroll1v1Disponibili;
        const slotKey = stato1v1.slotAttivoKey;
        const rerollGiaUsato = stato1v1.rerollUsatiPerSlot && stato1v1.rerollUsatiPerSlot[slotKey];
        btnReroll.disabled = stato1v1.reroll1v1Disponibili === 0 || !stato1v1.slotAttivoRuolo || rerollGiaUsato;
    }

    const statoBox = document.getElementById("draft-1v1-stato-box");
    const areaDraft = document.getElementById("area-draft-1v1");
    const countMio = contaGiocatoriSquadra1v1(stato1v1.miaSquadra);
    const countAvv = contaGiocatoriSquadra1v1(stato1v1.avvSquadra);

    // Se ho già 11 giocatori, passo automaticamente alla fase allenatore
    if (countMio >= 11 && countAvv >= 11) {
        passaAFaseAllenatore1v1();
    } else if (countMio >= 11) {
        if (statoBox) {
            statoBox.textContent = "Squadra completa! Attendi il tuo avversario...";
            statoBox.style.color = "var(--accento-juve)";
        }
        if (areaDraft) {
            areaDraft.innerHTML = `<p style="color:var(--accento-juve);text-align:center;margin-top:40px;font-weight:bold;">✓ Hai completato il draft! Attendi ${stato1v1.avvNickname}...</p>`;
        }
    } else if (!stato1v1.slotAttivoRuolo) {
        if (statoBox) {
            statoBox.textContent = "Clicca un ruolo vuoto sul tuo campo per scegliere un giocatore.";
            statoBox.style.color = "#888";
        }
        if (areaDraft) {
            areaDraft.innerHTML = "";
        }
    }
}

// --- COSTRUZIONE CAMPI VISIVI ---
// (campiVisualiCostruiti è già dichiarata globalmente sopra)

function costruisciCampiVisivi1v1(ds) {
    if (campiVisualiCostruiti) {
        aggiornaSlotCampoVisivo("draft-1v1-mio-campo", stato1v1.miaSquadra, stato1v1.mioModulo);
        return;
    }
    campiVisualiCostruiti = true;

    // Costruisci SOLO il campo del giocatore corrente (draft simultaneo indipendente)
    costruisciCampoSoloVisivo("draft-1v1-mio-campo", stato1v1.mioModulo);
    aggiornaSlotCampoVisivo("draft-1v1-mio-campo", stato1v1.miaSquadra, stato1v1.mioModulo);
}

function costruisciCampoSoloVisivo(campoId, modulo) {
    const campo = document.getElementById(campoId);
    if (!campo || !modulo) return;
    campo.innerHTML = "";
    const linee = configurazioneModuli[modulo];
    const isMioCampo = campoId === "draft-1v1-mio-campo";
    
    let slotIndex = 0;
    linee.forEach(linea => {
        const divRep = document.createElement("div");
        divRep.className = `reparto reparto-${linea.rep}`;
        linea.ruoli.forEach(ruolo => {
            const slot = document.createElement("div");
            slot.className = "slot slot-1v1-visivo";
            slot.dataset.ruolo = ruolo;
            slot.dataset.slotIndex = String(slotIndex);
            // Chiave univoca permanente per questo slot
            slot.dataset.slotKey = `${campoId}_${slotIndex}_${ruolo.replace(/\//g, '-')}`;
            slot.innerHTML = `<span class="ruolo-label">${ruolo}</span>`;
            
            if (isMioCampo) {
                slot.style.cursor = "pointer";
                slot.addEventListener("click", () => selezionaSlotDraft1v1(ruolo, slot));
            } else {
                slot.style.cursor = "default";
                slot.style.pointerEvents = "none";
            }
            
            divRep.appendChild(slot);
            slotIndex++;
        });
        campo.appendChild(divRep);
    });
}

// Funzione per selezionare uno slot e mostrare le carte
function selezionaSlotDraft1v1(ruolo, slotElement) {
    // Slot già occupato → ignora
    if (slotElement.classList.contains("occupato")) return;
    
    // Squadra completa → nulla da fare
    if (contaGiocatoriSquadra1v1(stato1v1.miaSquadra) >= 11) return;

    // REGOLA 1: Se c'è già uno slot attivo ed è LO STESSO → ignora (anti-riclick gratuito)
    if (stato1v1.slotAttivoElement === slotElement) {
        mostraMessaggioCustom("RUOLO GIÀ SELEZIONATO", "Hai già selezionato questo ruolo! Scegli uno dei giocatori proposti o usa un reroll.");
        return;
    }

    // REGOLA 2: Se c'è già uno slot attivo ed è DIVERSO → blocca finché non scegli un giocatore
    if (stato1v1.slotAttivoElement && stato1v1.slotAttivoElement !== slotElement) {
        mostraMessaggioCustom("ATTENZIONE", "Devi prima scegliere un giocatore dal draft prima di selezionare un altro ruolo!");
        return;
    }

    const slotKey = slotElement.dataset.slotKey;
    
    // Deseleziona tutti gli slot visivamente
    document.querySelectorAll("#draft-1v1-mio-campo .slot").forEach(s => {
        s.classList.remove("active-slot");
    });
    
    // Attiva questo slot
    slotElement.classList.add("active-slot");
    stato1v1.slotAttivoRuolo = ruolo;
    stato1v1.slotAttivoElement = slotElement;
    stato1v1.slotAttivoKey = slotKey;
    
    // Recupera le carte già generate per questo slot (se esistono), altrimenti genera nuove
    if (!stato1v1.cartePerSlot) stato1v1.cartePerSlot = {};
    if (!stato1v1.rerollUsatiPerSlot) stato1v1.rerollUsatiPerSlot = {};
    
    if (!stato1v1.cartePerSlot[slotKey]) {
        // Prima apertura: genera carte fresche
        stato1v1.cartePerSlot[slotKey] = generaOpzioniSlot1v1(ruolo);
    }
    
    // Mostra le carte
    renderCarteDraft1v1(stato1v1.cartePerSlot[slotKey]);
    
    // Aggiorna etichetta ruolo
    const ruoloLabel = document.getElementById("draft-1v1-ruolo-corrente");
    if (ruoloLabel) ruoloLabel.textContent = ruolo;
    
    const statoBox = document.getElementById("draft-1v1-stato-box");
    if (statoBox) {
        statoBox.textContent = `Ruolo selezionato: ${ruolo} — Scegli un giocatore`;
        statoBox.style.color = "var(--accento-juve)";
    }
    
    // Gestisci stato bottone reroll
    const rerollGiaUsato = stato1v1.rerollUsatiPerSlot[slotKey];
    const btnReroll = document.getElementById("btn-reroll-1v1");
    const countReroll = document.getElementById("reroll-1v1-count");
    if (btnReroll) {
        btnReroll.disabled = stato1v1.reroll1v1Disponibili <= 0 || !!rerollGiaUsato;
        btnReroll.style.opacity = (stato1v1.reroll1v1Disponibili <= 0 || rerollGiaUsato) ? "0.4" : "1";
    }
    if (countReroll) countReroll.textContent = stato1v1.reroll1v1Disponibili;
}

// --- REROLL 1V1 CON PROTEZIONE ANTI-EXPLOIT PER SLOT ---
function usaReroll1v1() {
    if (!stato1v1.slotAttivoRuolo || !stato1v1.slotAttivoKey) {
        mostraMessaggioCustom("REROLL", "Seleziona prima un ruolo sul campo!");
        return;
    }
    
    if (stato1v1.reroll1v1Disponibili <= 0) {
        mostraMessaggioCustom("REROLL ESAURITI", "Hai finito i reroll disponibili!");
        return;
    }
    
    // PROTEZIONE ANTI-EXPLOIT: ogni slot può essere rerollato al massimo una volta
    if (!stato1v1.rerollUsatiPerSlot) stato1v1.rerollUsatiPerSlot = {};
    const slotKey = stato1v1.slotAttivoKey;
    
    if (stato1v1.rerollUsatiPerSlot[slotKey]) {
        mostraMessaggioCustom("REROLL GIÀ USATO", "Hai già usato un reroll su questo ruolo! Scegli uno dei giocatori disponibili.");
        return;
    }
    
    // Consuma il reroll e marca questo slot come già rerollato
    stato1v1.reroll1v1Disponibili--;
    stato1v1.rerollUsatiPerSlot[slotKey] = true;
    
    // Aggiorna UI contatore
    const countReroll = document.getElementById("reroll-1v1-count");
    if (countReroll) countReroll.textContent = stato1v1.reroll1v1Disponibili;
    const countRerollHeader = document.getElementById("headbar-reroll-1v1-count");
    if (countRerollHeader) countRerollHeader.textContent = stato1v1.reroll1v1Disponibili;
    
    const btnReroll = document.getElementById("btn-reroll-1v1");
    if (btnReroll) {
        // Disabilita il reroll per questo slot (non più disponibile)
        btnReroll.disabled = true;
    }
    
    // Genera nuove carte e aggiorna la cache per questo slot
    const nuoveOpzioni = generaOpzioniSlot1v1(stato1v1.slotAttivoRuolo);
    if (!stato1v1.cartePerSlot) stato1v1.cartePerSlot = {};
    stato1v1.cartePerSlot[slotKey] = nuoveOpzioni;
    renderCarteDraft1v1(nuoveOpzioni);
}

function aggiornaSlotCampoVisivo(campoId, squadra, modulo) {
    if (!modulo) return;
    const campo = document.getElementById(campoId);
    if (!campo) return;
    const slotsOrdinati = estraiSlotsOrdinati(modulo);
    const slots = campo.querySelectorAll(".slot-1v1-visivo");
    slots.forEach((slot, i) => {
        // FIX: Salta gli slot null (non ancora riempiti)
        if (squadra[i] && squadra[i] !== null) {
            const g = squadra[i];
            slot.classList.add("occupato");
            slot.innerHTML = `
                <span style="color:var(--accento-juve);font-family:'Bebas Neue',sans-serif;font-size:1.2rem;">${g.rating}</span>
                <span style="color:#fff;font-size:0.6rem;font-weight:bold;text-align:center;">${g.nome.split(" ").pop().toUpperCase()}</span>
            `;
            slot.style.border = "1px solid var(--accento-juve)";
            slot.style.background = "rgba(0,0,0,0.8)";
        }
    });
}

// --- CARTE DRAFT 1V1 ---
// Genera le opzioni giocatori per un ruolo (senza mostrare nella UI)
function generaOpzioniSlot1v1(ruoloRichiesto) {
    let ruoliAccettati = ruoloRichiesto.split("/");
    const giaDraftati = getNomiSquadra1v1(stato1v1.miaSquadra);
    let opzioni = databaseJuve.filter(g =>
        g.ruolo.some(r => ruoliAccettati.includes(r)) && !giaDraftati.includes(g.nome)
    ).sort(() => 0.5 - Math.random()).slice(0, 3);

    if (opzioni.length === 0) {
        // fallback: qualsiasi giocatore disponibile
        opzioni = databaseJuve.filter(g => !giaDraftati.includes(g.nome))
            .sort(() => 0.5 - Math.random()).slice(0, 3);
    }
    return opzioni;
}

// Renderizza le carte nella UI (usa opzioni già generate)
function renderCarteDraft1v1(opzioni) {
    const area = document.getElementById("area-draft-1v1");
    if (!area) return;
    
    area.innerHTML = "";

    if (!opzioni || opzioni.length === 0) {
        area.innerHTML = `<p style="color:#555;text-align:center;margin-top:40px;">Nessun giocatore disponibile per questo ruolo.</p>`;
        return;
    }

    opzioni.forEach((giocatore, index) => {
        const carta = document.createElement("div");
        carta.classList.add("carta", "carta-draft-1v1");
        carta.style.animationDelay = `${index * 0.1}s`;
        carta.innerHTML = `
            <div class="carta-info">
                <h3 style="margin:0;font-size:1.3rem;">${giocatore.nome}</h3>
                <p style="margin:0;color:#888;">${giocatore.ruolo.join(" / ")} · ${giocatore.stagione}</p>
            </div>
            <div class="rating-numero" style="font-size:2.2rem;">${giocatore.rating}</div>
        `;
        carta.addEventListener("click", () => scegliGiocatore1v1(giocatore));
        area.appendChild(carta);
    });
}

// Compatibilità: mostraCarteDraft1v1 ora genera e renderizza
function mostraCarteDraft1v1(ruoloRichiesto, giaDraftati) {
    const opzioni = generaOpzioniSlot1v1(ruoloRichiesto);
    stato1v1.carteSlotCorrente = opzioni;
    renderCarteDraft1v1(opzioni);
}

async function scegliGiocatore1v1(giocatore) {
    // Disabilita immediatamente le carte per evitare doppio click
    document.querySelectorAll(".carta-draft-1v1").forEach(c => {
        c.style.pointerEvents = "none";
        c.style.opacity = "0.5";
    });
    
    const statoBox = document.getElementById("draft-1v1-stato-box");
    if (statoBox) statoBox.textContent = `Scelta confermata: ${giocatore.nome}`;

    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    
    // FIX: Ottieni l'indice dello slot selezionato
    const slotIndex = stato1v1.slotAttivoElement ? parseInt(stato1v1.slotAttivoElement.dataset.slotIndex, 10) : NaN;
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 10) {
        console.error("Nessuno slot attivo selezionato");
        return;
    }

    try {
        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) throw new Error("Documento non trovato");
            const ds = snap.data().draftState || {};

            // Verifica che il giocatore non sia già stato scelto
            if ((ds.giocatoriDraftati || []).includes(giocatore.nome)) {
                throw new Error("Giocatore già scelto dall'avversario");
            }

            const gObj = { 
                id: giocatore.id, 
                nome: giocatore.nome, 
                ruolo: giocatore.ruolo, 
                rating: giocatore.rating, 
                stagione: giocatore.stagione 
            };

            // FIX: Inizializza gli array con 11 slot se vuoti, poi inserisci nella posizione specifica
            let hostSquadra = normalizzaSquadraDraft1v1(ds.hostSquadra);
            let guestSquadra = normalizzaSquadraDraft1v1(ds.guestSquadra);
            const squadraMia = stato1v1.mioRuolo === "host" ? hostSquadra : guestSquadra;

            if (squadraMia[slotIndex]) {
                throw new Error("Slot gia occupato");
            }

            if (getNomiSquadra1v1(squadraMia).includes(giocatore.nome)) {
                throw new Error("Giocatore gia scelto nella tua squadra");
            }
            
            // Inserisci il giocatore nella posizione specifica
            if (stato1v1.mioRuolo === "host") {
                hostSquadra[slotIndex] = gObj;
            } else {
                guestSquadra[slotIndex] = gObj;
            }

            const nuoviDraftati = Array.from(new Set([
                ...getNomiSquadra1v1(hostSquadra),
                ...getNomiSquadra1v1(guestSquadra)
            ]));

            // Conta quanti giocatori sono stati scelti (escludendo null)
            const countHost = contaGiocatoriSquadra1v1(hostSquadra);
            const countGuest = contaGiocatoriSquadra1v1(guestSquadra);
            
            // Se entrambi hanno 11 giocatori, passa alla fase allenatore
            const nuovaFase = (countHost >= 11 && countGuest >= 11) ? "allenatore" : "draft";

            transaction.update(ref, {
                "draftState.hostSquadra": hostSquadra,
                "draftState.guestSquadra": guestSquadra,
                "draftState.giocatoriDraftati": nuoviDraftati,
                "draftState.faseCorrente": nuovaFase,
                "draftState.updatedAt": Date.now()
            });
        });
        
        // Reset dello slot attivo dopo selezione completata
        if (stato1v1.slotAttivoElement) {
            stato1v1.slotAttivoElement.classList.remove("active-slot");
        }
        stato1v1.slotAttivoRuolo = null;
        stato1v1.slotAttivoElement = null;
        stato1v1.slotAttivoKey = null;
        
        // Pulisci l'area draft
        const areaDraft = document.getElementById("area-draft-1v1");
        if (areaDraft) areaDraft.innerHTML = "";
        
        if (statoBox) {
            statoBox.textContent = "Giocatore aggiunto! Clicca un altro ruolo vuoto per continuare.";
            statoBox.style.color = "#4caf50";
        }
        
    } catch (err) {
        console.error("Errore scelta giocatore 1v1:", err);
        // Riabilita le carte in caso di errore
        document.querySelectorAll(".carta-draft-1v1").forEach(c => {
            c.style.pointerEvents = "auto";
            c.style.opacity = "1";
        });
        if (err.message.includes("già scelto")) {
            mostraMessaggioCustom("GIOCATORE NON DISPONIBILE", "L'avversario ha appena scelto questo giocatore! Scegline un altro.");
            // Rigenera le carte
            if (stato1v1.slotAttivoRuolo && stato1v1.slotAttivoKey) {
                const nuoveOpzioni = generaOpzioniSlot1v1(stato1v1.slotAttivoRuolo);
                stato1v1.cartePerSlot[stato1v1.slotAttivoKey] = nuoveOpzioni;
                renderCarteDraft1v1(nuoveOpzioni);
            }
        }
    }
}

// ============================================================================
// --- TIMER DRAFT 1V1 ---
// ============================================================================

function avviaTimerDraft1v1() {
    fermaTimerDraft1v1();
    stato1v1.secondiRimanenti = TEMPO_PICK_SECONDI;

    const barra = document.getElementById("draft-1v1-timer-bar");
    if (barra) {
        barra.style.transition = "none";
        barra.style.width = "100%";
        // Forza il reflow per resettare la transizione
        barra.getBoundingClientRect();
        barra.style.transition = `width ${TEMPO_PICK_SECONDI}s linear`;
        barra.style.width = "0%";
    }

    stato1v1.timerDraft = setInterval(() => {
        stato1v1.secondiRimanenti--;

        const statoBox = document.getElementById("draft-1v1-stato-box");
        if (statoBox) {
            statoBox.textContent = `È il tuo turno! Scegli un giocatore. (${stato1v1.secondiRimanenti}s)`;
        }

        if (stato1v1.secondiRimanenti <= 0) {
            fermaTimerDraft1v1();
            // Scelta automatica: prende il primo giocatore disponibile nella lista
            const carte = document.querySelectorAll(".carta-draft-1v1");
            if (carte.length > 0) {
                carte[0].click();
            }
        }
    }, 1000);
}

function fermaTimerDraft1v1() {
    if (stato1v1.timerDraft) {
        clearInterval(stato1v1.timerDraft);
        stato1v1.timerDraft = null;
    }
    const barra = document.getElementById("draft-1v1-timer-bar");
    if (barra) {
        barra.style.transition = "none";
        barra.style.width = "100%";
    }
}

// ============================================================================
// --- SIMULAZIONE CAMPIONATO 1V1 (20 SQUADRE) ---
// ============================================================================

let classifica1v1 = [];
let loopSimulazione1v1 = null;
let giornata1v1 = 1;
let registroGol1v1 = {};

const squadreCPU1v1 = [
    "Inter", "Milan", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina",
    "Bologna", "Torino", "Udinese", "Sampdoria", "Genoa", "Verona",
    "Cagliari", "Lecce", "Empoli", "Monza", "Parma"
];

const forzaStorica1v1 = {
    "Inter": 88, "Milan": 86, "Napoli": 85, "Atalanta": 84, "Roma": 83, "Lazio": 82,
    "Fiorentina": 80, "Torino": 78, "Bologna": 78, "Udinese": 76, "Sampdoria": 75,
    "Genoa": 75, "Verona": 74, "Cagliari": 73, "Lecce": 72, "Empoli": 72,
    "Monza": 73, "Parma": 71
};

// ============================================================================
// --- FASE ALLENATORE 1V1 ---
// ============================================================================

async function passaAFaseAllenatore1v1() {
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    const { doc, runTransaction, updateDoc } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

    if (runTransaction) {
        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) return;
            const ds = snap.data().draftState || {};
            const hostCompleta = contaGiocatoriSquadra1v1(ds.hostSquadra) >= 11;
            const guestCompleta = contaGiocatoriSquadra1v1(ds.guestSquadra) >= 11;
            if (!hostCompleta || !guestCompleta || ds.faseCorrente !== "draft") return;

            transaction.update(ref, {
                "draftState.faseCorrente": "allenatore",
                "draftState.updatedAt": Date.now()
            });
        });
        return;
    }

    await updateDoc(ref, {
        "draftState.faseCorrente": "allenatore",
        "draftState.updatedAt": Date.now()
    });
}

function gestisciFaseAllenatore1v1(ds) {
    if (contaGiocatoriSquadra1v1(ds.hostSquadra) < 11 || contaGiocatoriSquadra1v1(ds.guestSquadra) < 11) {
        if (stato1v1.mioRuolo === "host" && window.dbFirestore && window.fb) {
            const { doc, updateDoc } = window.fb;
            const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
            updateDoc(ref, {
                "draftState.faseCorrente": "draft",
                "draftState.updatedAt": Date.now()
            }).catch(() => {});
        }
        return;
    }

    // Mostra schermata allenatore
    nascondiTutteLeSchermate1v1Extra();
    document.getElementById("schermata-1v1-allenatore").style.display = "block";

    const mioAllenatore   = stato1v1.mioRuolo === "host" ? ds.hostAllenatore  : ds.guestAllenatore;
    const avvAllenatore   = stato1v1.mioRuolo === "host" ? ds.guestAllenatore : ds.hostAllenatore;
    const allenatoriGiaPresi = ds.allenatoriDraftati || [];

    if (!mioAllenatore) {
        // Devo ancora scegliere
        document.getElementById("draft-1v1-attesa-all-avv").style.display = "none";
        document.getElementById("draft-1v1-carte-allenatore-panel").style.display = "block";

        const area = document.getElementById("draft-1v1-carte-allenatore");
        
        // FIX #2: NON rigenerare le opzioni se sono già state create
        // Genera opzioni solo la prima volta che entro in questa fase
        if (!stato1v1.opzioniAllenatoriGenerate || area.children.length === 0) {
            area.innerHTML = "";
            
            // Genera 3 allenatori non già scelti da nessuno
            const opzioni = databaseAllenatori
                .filter(a => !allenatoriGiaPresi.includes(a.nome))
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            opzioni.forEach((mister, idx) => {
                const carta = document.createElement("div");
                carta.classList.add("carta", "carta-draft-1v1");
                carta.style.animationDelay = `${idx * 0.1}s`;
                const col = mister.modificatore >= 0 ? "#4caf50" : "#f44336";
                const segno = mister.modificatore > 0 ? "+" : "";
                carta.innerHTML = `
                    <div class="carta-info" style="flex:1;">
                        <h3 style="margin:0;font-size:1.2rem;color:var(--accento-juve);">${mister.nome}</h3>
                        <p style="margin:4px 0 0 0;color:#888;font-size:0.75rem;line-height:1.3;">${mister.effetto}</p>
                    </div>
                    <div class="rating-numero" style="font-size:1.8rem;color:${col};min-width:52px;text-align:right;">${segno}${mister.modificatore}</div>
                `;
                carta.addEventListener("click", () => scegliAllenatore1v1(mister));
                area.appendChild(carta);
            });
            
            // Marca come già generate per evitare reroll gratuiti
            stato1v1.opzioniAllenatoriGenerate = true;
        }

    } else if (!avvAllenatore) {
        // Ho già scelto, attendo l'avversario
        document.getElementById("draft-1v1-attesa-all-avv").style.display = "block";
        document.getElementById("draft-1v1-carte-allenatore-panel").style.display = "none";
        const el = document.getElementById("nome-avv-attesa-all");
        if (el) el.textContent = stato1v1.avvNickname;
    } else {
        // Entrambi hanno scelto - vai al recap
        mostraRecapDraft1v1();
    }
}

function mostraRecapDraft1v1() {
    nascondiTutteLeSchermate1v1Extra();
    document.getElementById("schermata-1v1-recap").style.display = "block";

    const renderListaRecap1v1 = (containerId, squadra, modulo, coloreRating) => {
        const lista = document.getElementById(containerId);
        if (!lista) return;
        lista.innerHTML = "";
        const ruoli = modulo && configurazioneModuli[modulo] ? estraiSlotsOrdinati(modulo) : [];
        normalizzaSquadraDraft1v1(squadra).forEach((g, index) => {
            if (!g) return;
            const div = document.createElement("div");
            div.style.cssText = "display:grid;grid-template-columns:54px 1fr auto;align-items:center;gap:10px;padding:8px;background:#111;border-radius:4px;";
            div.innerHTML = `
                <span style="color:#777;font-size:0.72rem;font-weight:800;">${ruoli[index] || "-"}</span>
                <span style="color:#fff;font-size:0.9rem;">${g.nome}</span>
                <span style="color:${coloreRating};font-weight:bold;font-size:0.9rem;">${g.rating}</span>
            `;
            lista.appendChild(div);
        });
    };

    // Popola recap squadra mia
    document.getElementById("recap-final-mio-nome").textContent = stato1v1.mioNickname + " FC";
    document.getElementById("recap-final-mio-modulo").textContent = stato1v1.mioModulo;
    document.getElementById("recap-final-mio-all").textContent = stato1v1.mioAllenatore ? stato1v1.mioAllenatore.nome : "-";

    renderListaRecap1v1("lista-giocatori-miei", stato1v1.miaSquadra, stato1v1.mioModulo, "var(--accento-juve)");

    // Popola recap squadra avversario
    document.getElementById("recap-final-avv-nome").textContent = stato1v1.avvNickname + " FC";
    document.getElementById("recap-final-avv-modulo").textContent = stato1v1.avvModulo;
    document.getElementById("recap-final-avv-all").textContent = stato1v1.avvAllenatore ? stato1v1.avvAllenatore.nome : "-";

    renderListaRecap1v1("lista-giocatori-avv", stato1v1.avvSquadra, stato1v1.avvModulo, "#ccc");

    // Reset button state
    document.getElementById("testo-btn-sim-1v1").textContent = "AVVIA SIMULAZIONE";
    document.getElementById("btn-avvia-sim-1v1").disabled = false;
    document.getElementById("stato-attesa-sim-1v1").textContent = "Entrambi i manager devono cliccare per avviare la simulazione.";
    
    // FIX: Avvia listener per monitorare lo stato del pulsante in tempo reale
    ascoltaStatoSimulazione1v1();
}

async function scegliAllenatore1v1(mister) {
    // Disabilita immediatamente tutte le carte
    document.querySelectorAll("#draft-1v1-carte-allenatore .carta-draft-1v1").forEach(c => {
        c.style.pointerEvents = "none";
        c.style.opacity = "0.5";
    });

    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;

    try {
        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) throw new Error("Documento non trovato");
            const ds = snap.data().draftState || {};

            // Controlla che l'allenatore non sia già stato preso
            const allenatoriGia = ds.allenatoriDraftati || [];
            if (allenatoriGia.includes(mister.nome)) {
                throw new Error("Allenatore già scelto dall'avversario");
            }

            const misterObj = {
                nome: mister.nome,
                modificatore: mister.modificatore,
                effetto: mister.effetto
            };

            const campoMio   = stato1v1.mioRuolo === "host" ? "draftState.hostAllenatore"  : "draftState.guestAllenatore";
            const campoAvv   = stato1v1.mioRuolo === "host" ? "draftState.guestAllenatore" : "draftState.hostAllenatore";
            const avvGiaScelto = stato1v1.mioRuolo === "host" ? ds.guestAllenatore : ds.hostAllenatore;

            const nuoviAllDraftati = [...allenatoriGia, mister.nome];
            const nuovaFase = avvGiaScelto ? "recap" : "allenatore";

            transaction.update(ref, {
                [campoMio]: misterObj,
                "draftState.allenatoriDraftati": nuoviAllDraftati,
                "draftState.faseCorrente": nuovaFase,
                "draftState.updatedAt": Date.now()
            });
        });

    } catch (err) {
        console.error("Errore scelta allenatore 1v1:", err);
        document.querySelectorAll("#draft-1v1-carte-allenatore .carta-draft-1v1").forEach(c => {
            c.style.pointerEvents = "auto";
            c.style.opacity = "1";
        });
        if (err.message.includes("già scelto")) {
            mostraMessaggioCustom("ALLENATORE NON DISPONIBILE",
                "L'avversario ha appena preso questo mister! Scegline un altro.");
            // Rigenera le carte
            gestisciFaseAllenatore1v1({ ...window._lastDs, allenatoriDraftati: stato1v1.allenatoriDraftatiGlobal });
        }
    }
}

function calcolaForzaSquadra1v1(squadra, allenatore) {
    if (!squadra || squadra.length === 0) return 75;
    const media = squadra.reduce((acc, g) => acc + g.rating, 0) / squadra.length;
    const bonus = allenatore ? (allenatore.modificatore || 0) : 0;
    return Math.round(media + bonus);
}

async function confermaAvvioSimulazione1v1() {
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    
    const { doc, runTransaction } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
    
    // Disabilita immediatamente il pulsante per evitare doppi click
    const btn = document.getElementById("btn-avvia-sim-1v1");
    const testo = document.getElementById("testo-btn-sim-1v1");
    btn.disabled = true;
    
    // FIX: Usa transazione per sincronizzare entrambi i giocatori
    await runTransaction(window.dbFirestore, async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) return;
        const data = snap.data();
        
        const campoPronto = stato1v1.mioRuolo === "host" ? "hostProntoSim" : "guestProntoSim";
        const campoAvvPronto = stato1v1.mioRuolo === "host" ? "guestProntoSim" : "hostProntoSim";
        
        const avvPronto = data[campoAvvPronto] || false;
        
        // Marco me stesso come pronto
        const aggiornamento = { [campoPronto]: true, updatedAt: Date.now() };
        
        // Se l'avversario è già pronto, solo l'host avvia la simulazione
        // Il secondo giocatore che conferma, host o guest, porta la lobby
        // alla fase di simulazione dentro la stessa transazione.
        if (avvPronto) {
            aggiornamento["draftState.faseCorrente"] = "simulazione";
        }

        transaction.update(ref, aggiornamento);
    });
}

// FIX: Listener in tempo reale per lo stato del pulsante simulazione
let unsubscribeStatoSim = null;

function ascoltaStatoSimulazione1v1() {
    // Ferma listener precedente se esiste
    if (unsubscribeStatoSim) {
        unsubscribeStatoSim();
        unsubscribeStatoSim = null;
    }
    
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    
    const { doc, onSnapshot } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
    
    unsubscribeStatoSim = onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) return;
        
        const data = snapshot.data();
        const hostPronto = data.hostProntoSim || false;
        const guestPronto = data.guestProntoSim || false;
        const ioPronto = stato1v1.mioRuolo === "host" ? hostPronto : guestPronto;
        const avvPronto = stato1v1.mioRuolo === "host" ? guestPronto : hostPronto;
        
        const btn = document.getElementById("btn-avvia-sim-1v1");
        const testo = document.getElementById("testo-btn-sim-1v1");
        const statoEl = document.getElementById("stato-attesa-sim-1v1");
        
        if (!btn || !testo || !statoEl) return;
        
        if (hostPronto && guestPronto) {
            // Entrambi pronti - avvia simulazione
            testo.textContent = "AVVIO SIMULAZIONE...";
            btn.disabled = true;
            statoEl.textContent = "Entrambi pronti! Avvio in corso...";
            statoEl.style.color = "var(--accento-juve)";
            // La simulazione partirà automaticamente tramite ascoltaStatoDraft1v1
        } else if (ioPronto && !avvPronto) {
            // Io pronto, avversario no
            testo.textContent = "IN ATTESA AVVERSARIO...";
            btn.disabled = true;
            statoEl.textContent = `In attesa che ${stato1v1.avvNickname} confermi...`;
            statoEl.style.color = "#ff9800";
        } else if (!ioPronto && avvPronto) {
            // Avversario pronto, io no
            testo.textContent = "AVVIA SIMULAZIONE";
            btn.disabled = false;
            statoEl.textContent = `${stato1v1.avvNickname} è pronto! Clicca per iniziare.`;
            statoEl.style.color = "var(--accento-juve)";
        } else {
            // Nessuno pronto
            testo.textContent = "AVVIA SIMULAZIONE";
            btn.disabled = false;
            statoEl.textContent = "Entrambi i manager devono cliccare per avviare la simulazione.";
            statoEl.style.color = "#999";
        }
    });
}

async function avviaSimulazione1v1() {
    // FIX: Ferma TUTTI i listener precedenti prima di iniziare
    if (stato1v1.unsubscribeDraft) {
        stato1v1.unsubscribeDraft();
        stato1v1.unsubscribeDraft = null;
    }
    if (stato1v1.unsubscribeSimulazione) {
        stato1v1.unsubscribeSimulazione();
        stato1v1.unsubscribeSimulazione = null;
    }
    // FIX: Ferma il listener dello stato simulazione (non serve più)
    if (unsubscribeStatoSim) {
        unsubscribeStatoSim();
        unsubscribeStatoSim = null;
    }

    // Mostra schermata simulazione
    nascondiTutteLeSchermate1v1Extra();
    document.getElementById("schermata-1v1-simulazione").style.display = "block";

    const nomeSquadraMia = stato1v1.mioNickname + " FC";
    const nomeSquadraAvv = stato1v1.avvNickname + " FC";
    
    document.getElementById("sim-1v1-info-sfida").textContent = `${nomeSquadraMia} vs ${nomeSquadraAvv}`;

    // SOLO L'HOST ESEGUE LA SIMULAZIONE
    if (stato1v1.mioRuolo === "host") {
        // Avvia la simulazione in background (non bloccante)
        eseguiSimulazioneHost1v1().catch(err => {
            console.error("Errore durante la simulazione:", err);
        });
    }
    
    // ENTRAMBI (host e guest) ascoltano gli aggiornamenti in tempo reale
    ascoltaSimulazione1v1();
}

// L'HOST esegue la simulazione completa e salva su Firebase giornata per giornata
async function eseguiSimulazioneHost1v1() {
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    
    const { doc, updateDoc } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);

    const nomeSquadraHost = stato1v1.mioNickname + " FC";
    const nomeSquadraGuest = stato1v1.avvNickname + " FC";
    
    const squadraHost = stato1v1.miaSquadra;
    const squadraGuest = stato1v1.avvSquadra;
    
    // Costruisci classifica iniziale 20 squadre
    const classifica = [];
    
    classifica.push({
        nome: nomeSquadraHost,
        punti: 0, v: 0, p: 0, s: 0,
        forza: calcolaForzaSquadra1v1(squadraHost),
        isHost: true, isGuest: false,
        giocate: 0
    });
    classifica.push({
        nome: nomeSquadraGuest,
        punti: 0, v: 0, p: 0, s: 0,
        forza: calcolaForzaSquadra1v1(squadraGuest),
        isHost: false, isGuest: true,
        giocate: 0
    });
    
    // 18 squadre CPU
    squadreCPU1v1.forEach(nome => {
        const base = forzaStorica1v1[nome] || 75;
        classifica.push({
            nome,
            punti: 0, v: 0, p: 0, s: 0,
            forza: base + Math.floor(Math.random() * 5) - 2,
            isHost: false, isGuest: false,
            giocate: 0
        });
    });

    // Genera calendario round-robin completo
    const calendario = generaCalendarioRoundRobin1v1(classifica.map(s => s.nome));
    
    const marcatoriHost = {};
    const marcatoriGuest = {};
    squadraHost.forEach(g => { marcatoriHost[g.nome] = 0; });
    squadraGuest.forEach(g => { marcatoriGuest[g.nome] = 0; });
    
    let golTotaliHost = 0;
    let golSubitiHost = 0;
    let golTotaliGuest = 0;
    let golSubitiGuest = 0;

    // SIMULA GIORNATA PER GIORNATA E SALVA PROGRESSIVAMENTE
    for (let giornata = 1; giornata <= 38; giornata++) {
        const partiteGiornata = calendario[giornata - 1];
        
        let infoPartitaHost = null;
        let infoPartitaGuest = null;
        
        // FIX #3: Controlla se Host e Guest giocano tra loro in questa giornata
        const partitaDirecta = partiteGiornata.find(p => 
            (p.casa === nomeSquadraHost && p.trasferta === nomeSquadraGuest) ||
            (p.casa === nomeSquadraGuest && p.trasferta === nomeSquadraHost)
        );
        
        if (partitaDirecta) {
            // Host e Guest giocano tra loro - simula UNA SOLA VOLTA
            const hostInCasa = partitaDirecta.casa === nomeSquadraHost;
            const datiHost = classifica.find(s => s.nome === nomeSquadraHost);
            const datiGuest = classifica.find(s => s.nome === nomeSquadraGuest);
            
            const boostHost = Math.floor(Math.random() * 5);
            const boostGuest = Math.floor(Math.random() * 7);
            const diff = (datiHost.forza + boostHost) - (datiGuest.forza + boostGuest);
            
            const golHost = calcolaGolJuve(diff);
            const golGuest = calcolaGolAvversario(diff);
            
            golTotaliHost += golHost;
            golSubitiHost += golGuest;
            golTotaliGuest += golGuest;
            golSubitiGuest += golHost;
            
            datiHost.giocate++;
            datiGuest.giocate++;
            
            if (golHost > golGuest) {
                datiHost.punti += 3; datiHost.v++; datiGuest.s++;
            } else if (golHost === golGuest) {
                datiHost.punti += 1; datiHost.p++;
                datiGuest.punti += 1; datiGuest.p++;
            } else {
                datiHost.s++;
                datiGuest.punti += 3; datiGuest.v++;
            }
            
            // Marcatori host
            const marcatoriPartitaHost = [];
            for (let i = 0; i < golHost; i++) {
                let pool = squadraHost.filter(g => g.ruolo.some(r => ["ATT","AS","AD","COC","AT"].includes(r)));
                if (Math.random() > 0.75) pool = squadraHost.filter(g => g.ruolo.some(r => ["CC","CDC","ED","ES"].includes(r)));
                if (pool.length === 0) pool = squadraHost.filter(g => !g.ruolo.includes("POR"));
                if (pool.length > 0) {
                    const marc = pool[Math.floor(Math.random() * pool.length)];
                    marcatoriHost[marc.nome] = (marcatoriHost[marc.nome] || 0) + 1;
                    marcatoriPartitaHost.push(marc.nome);
                }
            }
            
            // Marcatori guest
            const marcatoriPartitaGuest = [];
            for (let i = 0; i < golGuest; i++) {
                let pool = squadraGuest.filter(g => g.ruolo.some(r => ["ATT","AS","AD","COC","AT"].includes(r)));
                if (Math.random() > 0.75) pool = squadraGuest.filter(g => g.ruolo.some(r => ["CC","CDC","ED","ES"].includes(r)));
                if (pool.length === 0) pool = squadraGuest.filter(g => !g.ruolo.includes("POR"));
                if (pool.length > 0) {
                    const marc = pool[Math.floor(Math.random() * pool.length)];
                    marcatoriGuest[marc.nome] = (marcatoriGuest[marc.nome] || 0) + 1;
                    marcatoriPartitaGuest.push(marc.nome);
                }
            }
            
            // FIX #3: Salva il risultato corretto per entrambi (invertito per il guest)
            infoPartitaHost = {
                avversario: nomeSquadraGuest,
                golFatti: golHost,
                golSubiti: golGuest,
                marcatori: marcatoriPartitaHost,
                èScontroDigretto: true
            };
            
            infoPartitaGuest = {
                avversario: nomeSquadraHost,
                golFatti: golGuest,
                golSubiti: golHost,
                marcatori: marcatoriPartitaGuest,
                èScontroDigretto: true
            };
            
        } else {
            // Host e Guest giocano contro squadre diverse
            
            // Trova e simula la partita dell'Host
            let partitaHost = partiteGiornata.find(p => p.casa === nomeSquadraHost || p.trasferta === nomeSquadraHost);
            if (partitaHost) {
                const èInCasa = partitaHost.casa === nomeSquadraHost;
                const nomeAvvHost = èInCasa ? partitaHost.trasferta : partitaHost.casa;
                const datiAvvHost = classifica.find(s => s.nome === nomeAvvHost);
                const datiHost = classifica.find(s => s.nome === nomeSquadraHost);
                
                const boostHost = Math.floor(Math.random() * 5);
                const boostAvvHost = Math.floor(Math.random() * 7);
                const diffHost = (datiHost.forza + boostHost) - (datiAvvHost.forza + boostAvvHost);
                
                const golHost = calcolaGolJuve(diffHost);
                const golAvvHost = calcolaGolAvversario(diffHost);
                
                golTotaliHost += golHost;
                golSubitiHost += golAvvHost;
                
                datiHost.giocate++;
                datiAvvHost.giocate++;
                
                if (golHost > golAvvHost) {
                    datiHost.punti += 3; datiHost.v++; datiAvvHost.s++;
                } else if (golHost === golAvvHost) {
                    datiHost.punti += 1; datiHost.p++;
                    datiAvvHost.punti += 1; datiAvvHost.p++;
                } else {
                    datiHost.s++;
                    datiAvvHost.punti += 3; datiAvvHost.v++;
                }
                
                // Marcatori host
                const marcatoriPartita = [];
                for (let i = 0; i < golHost; i++) {
                    let pool = squadraHost.filter(g => g.ruolo.some(r => ["ATT","AS","AD","COC","AT"].includes(r)));
                    if (Math.random() > 0.75) pool = squadraHost.filter(g => g.ruolo.some(r => ["CC","CDC","ED","ES"].includes(r)));
                    if (pool.length === 0) pool = squadraHost.filter(g => !g.ruolo.includes("POR"));
                    if (pool.length > 0) {
                        const marc = pool[Math.floor(Math.random() * pool.length)];
                        marcatoriHost[marc.nome] = (marcatoriHost[marc.nome] || 0) + 1;
                        marcatoriPartita.push(marc.nome);
                    }
                }
                
                infoPartitaHost = {
                    avversario: nomeAvvHost,
                    golFatti: golHost,
                    golSubiti: golAvvHost,
                    marcatori: marcatoriPartita,
                    èScontroDigretto: false
                };
            }
            
            // Trova e simula la partita del Guest
            let partitaGuest = partiteGiornata.find(p => p.casa === nomeSquadraGuest || p.trasferta === nomeSquadraGuest);
            if (partitaGuest) {
                const èInCasa = partitaGuest.casa === nomeSquadraGuest;
                const nomeAvvGuest = èInCasa ? partitaGuest.trasferta : partitaGuest.casa;
                const datiAvvGuest = classifica.find(s => s.nome === nomeAvvGuest);
                const datiGuest = classifica.find(s => s.nome === nomeSquadraGuest);
                
                const boostGuest = Math.floor(Math.random() * 5);
                const boostAvvGuest = Math.floor(Math.random() * 7);
                const diffGuest = (datiGuest.forza + boostGuest) - (datiAvvGuest.forza + boostAvvGuest);
                
                const golGuest = calcolaGolJuve(diffGuest);
                const golAvvGuest = calcolaGolAvversario(diffGuest);
                
                golTotaliGuest += golGuest;
                golSubitiGuest += golAvvGuest;
                
                datiGuest.giocate++;
                datiAvvGuest.giocate++;
                
                if (golGuest > golAvvGuest) {
                    datiGuest.punti += 3; datiGuest.v++; datiAvvGuest.s++;
                } else if (golGuest === golAvvGuest) {
                    datiGuest.punti += 1; datiGuest.p++;
                    datiAvvGuest.punti += 1; datiAvvGuest.p++;
                } else {
                    datiGuest.s++;
                    datiAvvGuest.punti += 3; datiAvvGuest.v++;
                }
                
                // Marcatori guest
                const marcatoriPartita = [];
                for (let i = 0; i < golGuest; i++) {
                    let pool = squadraGuest.filter(g => g.ruolo.some(r => ["ATT","AS","AD","COC","AT"].includes(r)));
                    if (Math.random() > 0.75) pool = squadraGuest.filter(g => g.ruolo.some(r => ["CC","CDC","ED","ES"].includes(r)));
                    if (pool.length === 0) pool = squadraGuest.filter(g => !g.ruolo.includes("POR"));
                    if (pool.length > 0) {
                        const marc = pool[Math.floor(Math.random() * pool.length)];
                        marcatoriGuest[marc.nome] = (marcatoriGuest[marc.nome] || 0) + 1;
                        marcatoriPartita.push(marc.nome);
                    }
                }
                
                infoPartitaGuest = {
                    avversario: nomeAvvGuest,
                    golFatti: golGuest,
                    golSubiti: golAvvGuest,
                    marcatori: marcatoriPartita,
                    èScontroDigretto: false
                };
            }
        }
        
        // Simula TUTTE le altre partite della giornata
        partiteGiornata.forEach(partita => {
            if ((partita.casa === nomeSquadraHost || partita.trasferta === nomeSquadraHost) ||
                (partita.casa === nomeSquadraGuest || partita.trasferta === nomeSquadraGuest)) {
                return;
            }
            
            const datiCasa = classifica.find(s => s.nome === partita.casa);
            const datiTrasf = classifica.find(s => s.nome === partita.trasferta);
            
            datiCasa.giocate++;
            datiTrasf.giocate++;
            
            const boostCasa = Math.floor(Math.random() * 5);
            const boostTrasf = Math.floor(Math.random() * 7);
            const diff = (datiCasa.forza + boostCasa) - (datiTrasf.forza + boostTrasf);
            
            const golCasa = Math.max(0, Math.floor(Math.random() * 3) + (diff > 5 ? 1 : 0));
            const golTrasf = Math.max(0, Math.floor(Math.random() * 3) + (diff < -5 ? 1 : 0));
            
            if (golCasa > golTrasf) {
                datiCasa.punti += 3; datiCasa.v++; datiTrasf.s++;
            } else if (golCasa === golTrasf) {
                datiCasa.punti += 1; datiCasa.p++;
                datiTrasf.punti += 1; datiTrasf.p++;
            } else {
                datiTrasf.punti += 3; datiTrasf.v++;
                datiCasa.s++;
            }
        });
        
        // Ordina classifica
        classifica.sort((a, b) => b.punti - a.punti || b.v - a.v);
        
        // SALVA PROGRESSIVAMENTE OGNI GIORNATA SU FIREBASE
        await updateDoc(ref, {
            "simulazione": {
                completata: giornata === 38,
                giornataCorrente: giornata,
                partitaHost: infoPartitaHost,
                partitaGuest: infoPartitaGuest,
                classifica: JSON.parse(JSON.stringify(classifica)),
                marcatoriHost,
                marcatoriGuest,
                golTotaliHost,
                golSubitiHost,
                golTotaliGuest,
                golSubitiGuest
            },
            updatedAt: Date.now()
        });
        
        // Aspetta 500ms prima della prossima giornata per dare tempo ai client di aggiornare
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // FIX #2: Verifica finale che tutte le squadre abbiano giocato esattamente 38 partite
    const erroriPartite = classifica.filter(s => s.giocate !== 38);
    if (erroriPartite.length > 0) {
        console.error("⚠️ ATTENZIONE: Alcune squadre non hanno giocato 38 partite:", erroriPartite);
    } else {
        console.log("✅ Simulazione completata: tutte le squadre hanno giocato esattamente 38 partite");
    }
}

// FIX #3: FUNZIONE PER GENERARE UN CALENDARIO ROUND-ROBIN BILANCIATO
// Garantisce che ogni squadra giochi esattamente 38 partite (19 andata + 19 ritorno)
function generaCalendarioRoundRobin1v1(squadre) {
    const n = squadre.length;
    const calendario = [];
    
    // Algoritmo round-robin per n squadre
    // Genera 19 giornate di andata
    for (let giornata = 0; giornata < n - 1; giornata++) {
        const partiteGiornata = [];
        
        for (let i = 0; i < n / 2; i++) {
            let casa = (giornata + i) % (n - 1);
            let trasferta = (n - 1 - i + giornata) % (n - 1);
            
            // L'ultima squadra ruota in modo speciale
            if (i === 0) {
                trasferta = n - 1;
            }
            
            // Inverti casa/trasferta per bilanciare
            if (giornata % 2 === 0) {
                partiteGiornata.push({ casa: squadre[casa], trasferta: squadre[trasferta] });
            } else {
                partiteGiornata.push({ casa: squadre[trasferta], trasferta: squadre[casa] });
            }
        }
        
        calendario.push(partiteGiornata);
    }
    
    // Genera 19 giornate di ritorno (invertendo casa/trasferta)
    for (let giornata = 0; giornata < n - 1; giornata++) {
        const partiteAndata = calendario[giornata];
        const partiteRitorno = partiteAndata.map(p => ({
            casa: p.trasferta,
            trasferta: p.casa
        }));
        calendario.push(partiteRitorno);
    }
    
    return calendario;
}

// IL GUEST (e anche l'host) ascoltano i dati della simulazione in tempo reale
function ascoltaSimulazione1v1() {
    if (!window.dbFirestore || !window.fb || !stato1v1.lobbyId) return;
    
    const { doc, onSnapshot } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_1v1", stato1v1.lobbyId);
    
    let ultimaGiornataVisualizzata = 0;
    const cronologiaHost = [];
    const cronologiaGuest = [];
    
    stato1v1.unsubscribeSimulazione = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const sim = data.simulazione;
        
        if (!sim) {
            document.getElementById("sim-1v1-ticker").innerHTML = `<div style="text-align:center;"><span style="font-size:0.9rem;color:#888;">⏳ In attesa dell'avvio simulazione...</span></div>`;
            return;
        }
        
        if (!sim.giornataCorrente || sim.giornataCorrente <= ultimaGiornataVisualizzata) {
            return; // Nessun aggiornamento da visualizzare
        }
        
        // NUOVA GIORNATA DA VISUALIZZARE
        const giornata = sim.giornataCorrente;
        ultimaGiornataVisualizzata = giornata;
        
        // Aggiorna la classifica globale (uguale per tutti)
        classifica1v1 = sim.classifica.map(s => ({
            ...s,
            isMia: (stato1v1.mioRuolo === "host" && s.isHost) || (stato1v1.mioRuolo === "guest" && s.isGuest),
            isAvv: (stato1v1.mioRuolo === "host" && s.isGuest) || (stato1v1.mioRuolo === "guest" && s.isHost)
        }));
        
        // Aggiorna UI
        document.getElementById("sim-1v1-giornata").textContent = `GIORNATA ${giornata}`;
        aggiorna1v1ClassificaLiveUI();
        
        // Mostra il risultato della MIA squadra (personalizzato per ruolo)
        const miaPartita = stato1v1.mioRuolo === "host" ? sim.partitaHost : sim.partitaGuest;
        const nomeSquadraMia = stato1v1.mioNickname + " FC";
        
        if (miaPartita) {
            const stringaMarcatori = miaPartita.marcatori && miaPartita.marcatori.length > 0 
                ? ` (${miaPartita.marcatori.join(", ")})` 
                : "";
            const coloreRis = miaPartita.golFatti > miaPartita.golSubiti ? "#4caf50" 
                : miaPartita.golFatti === miaPartita.golSubiti ? "#ffeb3b" 
                : "#f44336";
            
            document.getElementById("sim-1v1-ticker").innerHTML = `<div style="text-align:center;">
                <span style="font-size:0.9rem;color:#888;display:block;">RISULTATO LIVE</span>
                <strong style="color:${coloreRis}">${nomeSquadraMia} ${miaPartita.golFatti} – ${miaPartita.golSubiti} ${miaPartita.avversario}</strong>
                <span style="font-size:0.8rem;color:var(--accento-juve);display:block;margin-top:5px;">${stringaMarcatori}</span>
            </div>`;
            
            // Aggiungi alla cronologia
            const cronologiaEl = document.getElementById("sim-1v1-cronologia");
            cronologiaEl.innerHTML = `
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #1a1a1a;padding-bottom:4px;">
                    <span style="color:#666;width:70px;">Gior. ${giornata}</span>
                    <span style="flex:1;text-align:left;">vs ${miaPartita.avversario}</span>
                    <span style="font-weight:bold;color:${coloreRis}">${miaPartita.golFatti} – ${miaPartita.golSubiti}</span>
                </div>
            ` + cronologiaEl.innerHTML;
        }
        
        // Se la simulazione è completata, salva i dati finali e mostra risultati
        if (sim.completata && giornata === 38) {
            stato1v1.unsubscribeSimulazione();
            stato1v1.unsubscribeSimulazione = null;
            
            // Salva marcatori e goal totali
            if (stato1v1.mioRuolo === "host") {
                registroGol1v1 = sim.marcatoriHost || {};
                stato1v1.golTotali = sim.golTotaliHost || 0;
                stato1v1.golSubiti = sim.golSubitiHost || 0;
            } else {
                registroGol1v1 = sim.marcatoriGuest || {};
                stato1v1.golTotali = sim.golTotaliGuest || 0;
                stato1v1.golSubiti = sim.golSubitiGuest || 0;
            }
            
            // Aspetta 2 secondi prima di mostrare il risultato finale
            setTimeout(() => {
                mostraRisultato1v1();
            }, 2000);
        }
    });
}

// Rimuovi la vecchia funzione mostraSimulazioneCompleta1v1 dato che ora è gestita in tempo reale

function aggiorna1v1ClassificaLiveUI() {
    const container = document.getElementById("sim-1v1-classifica");
    if (!container) return;
    const nomeSquadraMia = stato1v1.mioNickname + " FC";
    const nomeSquadraAvv = stato1v1.avvNickname + " FC";
    container.innerHTML = "";
    classifica1v1.forEach((s, idx) => {
        const riga = document.createElement("div");
        riga.style.cssText = "display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #222;";
        if (s.isMia) {
            riga.style.color = "var(--accento-juve)";
            riga.style.fontWeight = "bold";
        } else if (s.isAvv) {
            riga.style.color = "#e0e0e0";
            riga.style.fontWeight = "bold";
        }
        riga.innerHTML = `<span>${idx + 1}. ${s.nome}</span><strong>${s.punti} pt</strong>`;
        container.appendChild(riga);
    });
}

// Funzione per tornare al menu principale dalla modalità 1v1
async function tornaAlMenuDa1v1() {
    // FIX: Ferma TUTTI i listener Firebase attivi PRIMA di fare altro
    if (stato1v1.unsubscribeDraft) {
        stato1v1.unsubscribeDraft();
        stato1v1.unsubscribeDraft = null;
    }
    if (stato1v1.unsubscribeSimulazione) {
        stato1v1.unsubscribeSimulazione();
        stato1v1.unsubscribeSimulazione = null;
    }
    if (unsubscribeLobby1v1) {
        unsubscribeLobby1v1();
        unsubscribeLobby1v1 = null;
    }
    // FIX: Ferma anche il listener dello stato simulazione
    if (unsubscribeStatoSim) {
        unsubscribeStatoSim();
        unsubscribeStatoSim = null;
    }
    
    // Pulisci la lobby corrente
    await abbandonaLobby1v1Corrente();
    
    // Reset stato 1v1
    stato1v1 = {
        mioRuolo: null,
        mioUID: null,
        mioNickname: "",
        avvNickname: "",
        mioModulo: null,
        avvModulo: null,
        lobbyId: null,
        miaSquadra: [],
        avvSquadra: [],
        giocatoriDraftatiGlobal: [],
        allenatoriDraftatiGlobal: [],
        mioAllenatore: null,
        avvAllenatore: null,
        faseCorrente: "modulo",
        unsubscribeDraft: null,
        reroll1v1Disponibili: 3,
        slotAttivoRuolo: null,
        slotAttivoElement: null,
        carteDraftCorrente: [],
        carteSlotCorrente: [],
        slotUltimoRuolo: null,
        rerollUsatoSuSlotCorrente: false,
        ultimoRuoloReroll: null,
        unsubscribeAllenatore: null,
        unsubscribeSimulazione: null,
        opzioniAllenatoriGenerate: false
    };
    
    campiVisualiCostruiti = false;
    classifica1v1 = [];
    registroGol1v1 = {};
    
    // Nascondi tutte le schermate 1v1
    nascondiTutteLeSchermate1v1Extra();
    
    // Mostra il menu principale
    pulisciParametroLobby1v1();
    schermataScelta1v1.style.display = "none";
    schermataLobbyOnline1v1.style.display = "none";
    schermataLobbyAmico1v1.style.display = "none";
    schermataMenu.style.display = "block";
}

// ============================================================================
// --- SCHERMATA RISULTATO 1V1 ---
// ============================================================================

function mostraRisultato1v1() {
    const nomeSquadraMia = stato1v1.mioNickname + " FC";
    const nomeSquadraAvv = stato1v1.avvNickname + " FC";

    const posMia = classifica1v1.findIndex(s => s.nome === nomeSquadraMia) + 1;
    const posAvv = classifica1v1.findIndex(s => s.nome === nomeSquadraAvv) + 1;
    const datiMia = classifica1v1.find(s => s.nome === nomeSquadraMia);
    const datiAvv = classifica1v1.find(s => s.nome === nomeSquadraAvv);

    nascondiTutteLeSchermate1v1Extra();
    document.getElementById("schermata-1v1-simulazione").style.display = "none";
    document.getElementById("schermata-1v1-risultato").style.display = "block";

    const hoVinto = posMia < posAvv;
    const pareggio = posMia === posAvv;

    // Hero
    const trophy = document.getElementById("risultato-1v1-trophy");
    const titolo = document.getElementById("risultato-1v1-titolo");
    const sub = document.getElementById("risultato-1v1-sub");
    const hero = document.getElementById("risultato-1v1-hero");

    if (hoVinto) {
        trophy.textContent = "🏆";
        titolo.textContent = "HAI VINTO!";
        sub.textContent = `${stato1v1.mioNickname} domina il campionato (${posMia}° posto)`;
        hero.style.background = "linear-gradient(135deg, #1a1a00, #2a2000)";
        hero.style.borderBottom = "2px solid var(--accento-juve)";
    } else if (pareggio) {
        trophy.textContent = "🤝";
        titolo.textContent = "PAREGGIO!";
        sub.textContent = "Stessa posizione in classifica — nessuno prevale";
        hero.style.background = "linear-gradient(135deg, #0a0a1a, #101030)";
        hero.style.borderBottom = "2px solid #4488ff";
    } else {
        trophy.textContent = "💀";
        titolo.textContent = "HAI PERSO";
        sub.textContent = `${stato1v1.avvNickname} ha fatto meglio di te (${posAvv}° vs ${posMia}°)`;
        hero.style.background = "linear-gradient(135deg, #1a0000, #200000)";
        hero.style.borderBottom = "2px solid #f44336";
    }

    // Tabella classifica finale
    const tbody = document.querySelector("#risultato-1v1-tabella tbody");
    tbody.innerHTML = "";
    classifica1v1.forEach((s, idx) => {
        const isMia = s.nome === nomeSquadraMia;
        const isAvv = s.nome === nomeSquadraAvv;
        const tr = document.createElement("tr");
        tr.style.cssText = isMia
            ? "color:var(--accento-juve);font-weight:bold;"
            : isAvv ? "color:#e0e0e0;font-weight:bold;" : "";
        tr.innerHTML = `
            <td style="padding:8px 5px;">${idx + 1}${idx === 0 ? " 🏆" : ""}</td>
            <td>${s.nome}${isMia ? " ★" : ""}</td>
            <td>${s.punti}</td>
            <td>${s.v}</td>
            <td>${s.p}</td>
            <td>${s.s}</td>
        `;
        tbody.appendChild(tr);
    });

    // Scontro diretto
    const sfidaContent = document.getElementById("risultato-1v1-sfida-content");
    sfidaContent.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;padding:20px 0;">
            <div style="text-align:center;">
                <div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:${hoVinto ? 'var(--accento-juve)' : '#888'}">${stato1v1.mioNickname.toUpperCase()}</div>
                <div style="font-size:2.5rem;font-family:'Bebas Neue',sans-serif;">${posMia}°</div>
            </div>
            <div style="font-size:1.5rem;color:#555;">VS</div>
            <div style="text-align:center;">
                <div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:${!hoVinto && !pareggio ? 'var(--accento-juve)' : '#888'}">${stato1v1.avvNickname.toUpperCase()}</div>
                <div style="font-size:2.5rem;font-family:'Bebas Neue',sans-serif;">${posAvv}°</div>
            </div>
        </div>
        <p style="text-align:center;color:#666;font-size:0.8rem;margin:0;">
            ${hoVinto ? "Hai superato il tuo avversario in classifica!" : pareggio ? "Stesso piazzamento — onore a entrambi." : "L'avversario ha chiuso più in alto. Rivincita?"}
        </p>
    `;

    // Le mie stat
    const statsEl = document.getElementById("risultato-1v1-stats");
    statsEl.innerHTML = "";
    const stat = (label, valore, colore = "#fff") => `
        <div style="background:#1a1a1a;border:1px solid #222;border-radius:8px;padding:12px;text-align:center;">
            <div style="color:#666;font-size:0.7rem;font-weight:600;letter-spacing:1px;">${label}</div>
            <div style="color:${colore};font-size:1.6rem;font-family:'Bebas Neue',sans-serif;">${valore}</div>
        </div>
    `;
    const topMarcatore = Object.entries(registroGol1v1).sort((a, b) => b[1] - a[1])[0];
    const golTotali = stato1v1.golTotali || 0;
    
    statsEl.innerHTML =
        stat("POSIZIONE", `${posMia}°`, posMia <= 3 ? "var(--accento-juve)" : "#fff") +
        stat("PUNTI", datiMia ? datiMia.punti : 0, "var(--accento-juve)") +
        stat("VITTORIE", datiMia ? datiMia.v : 0, "#4caf50") +
        stat("CAPOCANNONIERE", topMarcatore ? topMarcatore[0].split(" ").pop() : "-", "#e0c870") +
        stat("GOL TOTALI", golTotali, "#4caf50") +
        stat("MODULO", stato1v1.mioModulo || "-");
}

// ============================================================================
// --- SISTEMA DRAFT TORNEO (SIMULTANEO COME 1V1) ---
// ============================================================================

// Il draft del torneo funziona ESATTAMENTE come il draft 1v1:
// - Ogni giocatore sceglie i propri 11 giocatori in modo indipendente
// - I giocatori (nome base) scelti da qualcuno non possono essere presi da altri
// - Gli allenatori NON sono esclusivi: possono essere presi da più utenti
// - Quando tutti hanno finito il draft (o scade il tempo), si passa al tabellone

async function avviaTorneoDraft(lobbyId) {
    if (!lobbyId) {
        console.error("Nessun lobby ID fornito per il draft torneo");
        return;
    }
    
    statoTorneo.lobbyId = lobbyId;
    statoTorneo.mioUID = window.utenteUID;

    if (statoSimulazioneTorneo.cronometroInterval) clearInterval(statoSimulazioneTorneo.cronometroInterval);
    Object.assign(statoSimulazioneTorneo, {
        tabellone: null,
        faseCorrente: null,
        partitaCorrente: null,
        risultatiPartite: {},
        mioPercorso: [],
        eliminato: false,
        cronometroInterval: null,
        minutiPartita: 0,
        golMia: 0,
        golAvv: 0,
        vistaTabelloneAttiva: false
    });
    
    // Reset completo dello stato draft
    statoTorneo.miaSquadra = [];
    statoTorneo.mioAllenatore = null;
    statoTorneo.giocatoriDraftatiGlobale = [];
    statoTorneo.allenatoriDraftatiGlobale = [];
    statoTorneo.rerollDisponibili = 3;
    statoTorneo.slotAttivoRuolo = null;
    statoTorneo.slotAttivoElement = null;
    statoTorneo.slotAttivoKey = null;
    statoTorneo.cartePerSlot = {};
    statoTorneo.rerollUsatiPerSlot = {};
    statoTorneo.campoCostruitoTorneo = false;
    statoTorneo.completamentoScadenzaInCorso = false;
    
    // Recupera dati dalla lobby
    try {
        const { doc, getDoc } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_tornei", lobbyId);
        const snap = await getDoc(ref);
        
        if (!snap.exists()) {
            throw new Error("Lobby torneo non trovata");
        }
        
        const lobby = snap.data();
        statoTorneo.tempoDraft = Number(lobby.tempoDraft) || 90;
        statoTorneo.numeroPartecipanti = Number(lobby.dimensione) || normalizzaGiocatoriTorneo(lobby).length;
        statoTorneo.overallVisibili = lobby.overallVisibili !== false;
        statoTorneo.scadenzaDraft = lobby.draftState?.scadenzaDraft || null;
        
        // Trova il mio giocatore nella lobby
        const giocatori = normalizzaGiocatoriTorneo(lobby);
        const mioGiocatore = giocatori.find(g => g.uid === window.utenteUID);
        
        if (!mioGiocatore) {
            throw new Error("Non sei presente in questa lobby");
        }
        
        statoTorneo.mioNickname = mioGiocatore.nome;
        statoTorneo.mioModulo = mioGiocatore.modulo;
        
        // Nascondi tutte le schermate
        nascondiTutteLeSchermate1v1Extra();
        [
            schermataMenu,
            schermataModulo,
            schermataGioco,
            schermataScelta1v1,
            schermataLobbyOnline1v1,
            schermataLobbyAmico1v1,
            schermataSceltaTorneo,
            schermataSetupTorneo,
            schermataEntraTorneo,
            schermataLobbyTorneo
        ].forEach(s => { if (s) s.style.display = "none"; });
        
        // Mostra schermata draft torneo
        document.getElementById("schermata-torneo-draft").style.display = "block";
        
        // Inizializza UI
        aggiornaHeaderDraftTorneo();
        avviaTimerDraftTorneo();
        
        // Costruisci il campo se non già fatto
        if (!statoTorneo.campoCostruitoTorneo) {
            costruisciCampoDraftTorneo();
            statoTorneo.campoCostruitoTorneo = true;
        }
        
        // Ascolta gli aggiornamenti del draft in tempo reale
        ascoltaDraftTorneo();
        
    } catch (error) {
        console.error("Errore avvio draft torneo:", error);
        mostraMessaggioCustom("ERRORE DRAFT TORNEO", "Non riesco ad avviare il draft del torneo. Controlla la connessione.");
        apriSceltaTorneo();
    }
}

function aggiornaHeaderDraftTorneo() {
    document.getElementById("draft-torneo-titolo-nome").textContent = statoTorneo.mioNickname + " - DRAFT TORNEO";
    document.getElementById("draft-torneo-stato-live").textContent = "Scegli i tuoi giocatori";
    document.getElementById("recap-torneo-mio-nick").textContent = statoTorneo.mioNickname;
    document.getElementById("recap-torneo-modulo").textContent = statoTorneo.mioModulo || "-";
    
    const countGiocatori = statoTorneo.miaSquadra.filter(Boolean).length;
    document.getElementById("recap-torneo-count").textContent = `${countGiocatori}/11`;
    document.getElementById("headbar-reroll-torneo-count").textContent = statoTorneo.rerollDisponibili;
}

function aggiornaTimerDraftTorneo() {
    const timer = document.getElementById("headbar-timer-torneo");
    if (!timer || !statoTorneo.scadenzaDraft) return false;

    const secondiRimasti = Math.max(0, Math.ceil((statoTorneo.scadenzaDraft - Date.now()) / 1000));
    timer.textContent = `${String(Math.floor(secondiRimasti / 60)).padStart(2, "0")}:${String(secondiRimasti % 60).padStart(2, "0")}`;
    timer.style.color = secondiRimasti <= 15 ? "#f44336" : "var(--accento-juve)";
    return secondiRimasti === 0;
}

function avviaTimerDraftTorneo() {
    if (statoTorneo.timerDraftInterval) clearInterval(statoTorneo.timerDraftInterval);
    if (!statoTorneo.scadenzaDraft) return;

    const aggiorna = () => {
        if (aggiornaTimerDraftTorneo()) {
            clearInterval(statoTorneo.timerDraftInterval);
            statoTorneo.timerDraftInterval = null;
            // La scadenza del timer non genera un aggiornamento Firebase da sola:
            // avvia quindi esplicitamente il completamento automatico delle rose.
            completaDraftScadutoTorneo();
        }
    };

    aggiorna();
    statoTorneo.timerDraftInterval = setInterval(aggiorna, 1000);
}

function draftTorneoScaduto() {
    return Boolean(statoTorneo.scadenzaDraft && Date.now() >= statoTorneo.scadenzaDraft);
}

function creaGiocatoreAutomaticoTorneo(giocatore) {
    return {
        id: giocatore.id,
        nome: giocatore.nome,
        ruolo: giocatore.ruolo,
        rating: giocatore.rating,
        stagione: giocatore.stagione
    };
}

async function completaDraftScadutoTorneo() {
    if (statoTorneo.completamentoScadenzaInCorso || !window.dbFirestore || !window.fb || !statoTorneo.lobbyId) return;
    statoTorneo.completamentoScadenzaInCorso = true;

    try {
        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_tornei", statoTorneo.lobbyId);

        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) return;

            const lobby = snap.data();
            const draftState = lobby.draftState || {};
            if (draftState.autoCompletato || !draftState.scadenzaDraft || Date.now() < draftState.scadenzaDraft) return;

            const squadre = { ...(draftState.squadre || {}) };
            const giocatoriGiaScelti = new Set(draftState.giocatoriDraftati || []);

            normalizzaGiocatoriTorneo(lobby).forEach((manager) => {
                const squadra = Array.isArray(squadre[manager.uid]) ? [...squadre[manager.uid]] : Array(11).fill(null);
                while (squadra.length < 11) squadra.push(null);
                const ruoli = estraiSlotsOrdinati(manager.modulo || TORNEO_MODULO_DEFAULT);

                squadra.forEach((giocatore, indice) => {
                    if (giocatore) return;
                    const ruoliAccettati = (ruoli[indice] || "").split("/");
                    let candidati = databaseJuve.filter((candidato) =>
                        !giocatoriGiaScelti.has(candidato.nome) &&
                        candidato.ruolo.some((ruolo) => ruoliAccettati.includes(ruolo))
                    );

                    if (!candidati.length) {
                        candidati = databaseJuve.filter((candidato) => !giocatoriGiaScelti.has(candidato.nome));
                    }

                    if (!candidati.length) return;
                    const scelto = candidati[Math.floor(Math.random() * candidati.length)];
                    squadra[indice] = creaGiocatoreAutomaticoTorneo(scelto);
                    giocatoriGiaScelti.add(scelto.nome);
                });

                squadre[manager.uid] = squadra.slice(0, 11);
            });

            transaction.update(ref, {
                "draftState.squadre": squadre,
                "draftState.giocatoriDraftati": [...giocatoriGiaScelti],
                "draftState.autoCompletato": true,
                "draftState.updatedAt": Date.now(),
                updatedAt: Date.now()
            });
        });
    } catch (error) {
        console.error("Errore completamento automatico draft torneo:", error);
    } finally {
        statoTorneo.completamentoScadenzaInCorso = false;
    }
}

function costruisciCampoDraftTorneo() {
    const campo = document.getElementById("campo-torneo-draft");
    if (!campo || !statoTorneo.mioModulo) return;
    
    campo.innerHTML = "";
    const linee = configurazioneModuli[statoTorneo.mioModulo];
    
    let slotIndex = 0;
    linee.forEach(linea => {
        const divRep = document.createElement("div");
        divRep.className = `reparto reparto-${linea.rep}`;
        
        linea.ruoli.forEach(ruolo => {
            const slot = document.createElement("div");
            slot.className = "slot slot-torneo-draft";
            slot.dataset.ruolo = ruolo;
            slot.dataset.slotIndex = String(slotIndex);
            slot.dataset.slotKey = `torneo_${slotIndex}_${ruolo.replace(/\//g, '-')}`;
            slot.innerHTML = `<span class="ruolo-label">${ruolo}</span>`;
            slot.style.cursor = "pointer";
            slot.addEventListener("click", () => selezionaSlotDraftTorneo(ruolo, slot));
            divRep.appendChild(slot);
            slotIndex++;
        });
        
        campo.appendChild(divRep);
    });
}

function selezionaSlotDraftTorneo(ruolo, slotElement) {
    if (draftTorneoScaduto()) {
        mostraMessaggioCustom("TEMPO SCADUTO", "Il tempo per il draft e' terminato.");
        return;
    }
    // Slot già occupato
    if (slotElement.classList.contains("occupato")) return;
    
    // Squadra completa
    if (statoTorneo.miaSquadra.filter(Boolean).length >= 11) return;
    
    // Se stesso slot già attivo
    if (statoTorneo.slotAttivoElement === slotElement) {
        mostraMessaggioCustom("RUOLO GIÀ SELEZIONATO", "Hai già selezionato questo ruolo! Scegli uno dei giocatori proposti o usa un reroll.");
        return;
    }
    
    // Se c'è un altro slot attivo, blocca
    if (statoTorneo.slotAttivoElement && statoTorneo.slotAttivoElement !== slotElement) {
        mostraMessaggioCustom("ATTENZIONE", "Devi prima scegliere un giocatore dal draft prima di selezionare un altro ruolo!");
        return;
    }
    
    const slotKey = slotElement.dataset.slotKey;
    
    // Deseleziona tutti gli altri slot
    document.querySelectorAll("#campo-torneo-draft .slot").forEach(s => s.classList.remove("active-slot"));
    
    // Attiva questo slot
    slotElement.classList.add("active-slot");
    statoTorneo.slotAttivoRuolo = ruolo;
    statoTorneo.slotAttivoElement = slotElement;
    statoTorneo.slotAttivoKey = slotKey;
    
    // Genera/recupera le carte per questo slot
    if (!statoTorneo.cartePerSlot[slotKey]) {
        statoTorneo.cartePerSlot[slotKey] = generaOpzioniSlotTorneo(ruolo);
    }
    
    renderCarteDraftTorneo(statoTorneo.cartePerSlot[slotKey]);
    
    document.getElementById("draft-torneo-ruolo-corrente").textContent = ruolo;
    document.getElementById("draft-torneo-stato-box").textContent = `Ruolo selezionato: ${ruolo} — Scegli un giocatore`;
    
    // Aggiorna stato bottone reroll
    const rerollGiaUsato = statoTorneo.rerollUsatiPerSlot[slotKey];
    const btnReroll = document.getElementById("btn-reroll-torneo");
    if (btnReroll) {
        btnReroll.disabled = statoTorneo.rerollDisponibili <= 0 || !!rerollGiaUsato;
    }
    document.getElementById("reroll-torneo-count").textContent = statoTorneo.rerollDisponibili;
}

function generaOpzioniSlotTorneo(ruoloRichiesto) {
    const ruoliAccettati = ruoloRichiesto.split("/");
    const giaDraftati = statoTorneo.miaSquadra.filter(Boolean).map(g => g.nome);
    
    let opzioni = databaseJuve.filter(g => 
        g.ruolo.some(r => ruoliAccettati.includes(r)) && 
        !giaDraftati.includes(g.nome) &&
        !statoTorneo.giocatoriDraftatiGlobale.includes(g.nome)
    ).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    if (opzioni.length === 0) {
        // Fallback: qualsiasi giocatore disponibile
        opzioni = databaseJuve.filter(g => 
            !giaDraftati.includes(g.nome) &&
            !statoTorneo.giocatoriDraftatiGlobale.includes(g.nome)
        ).sort(() => 0.5 - Math.random()).slice(0, 3);
    }
    
    return opzioni;
}

function renderCarteDraftTorneo(opzioni) {
    const area = document.getElementById("area-draft-torneo");
    if (!area) return;
    
    area.innerHTML = "";
    
    if (!opzioni || opzioni.length === 0) {
        area.innerHTML = `<p style="color:#555;text-align:center;margin-top:40px;">Nessun giocatore disponibile per questo ruolo.</p>`;
        return;
    }
    
    opzioni.forEach((giocatore, index) => {
        const carta = document.createElement("div");
        carta.classList.add("carta", "carta-draft-torneo");
        carta.style.animationDelay = `${index * 0.1}s`;
        carta.innerHTML = `
            <div class="carta-info">
                <h3 style="margin:0;font-size:1.3rem;">${giocatore.nome}</h3>
                <p style="margin:0;color:#888;">${giocatore.ruolo.join(" / ")} · ${giocatore.stagione}</p>
            </div>
            <div class="rating-numero" style="font-size:2.2rem;">${statoTorneo.overallVisibili ? giocatore.rating : "?"}</div>
        `;
        carta.addEventListener("click", () => scegliGiocatoreTorneo(giocatore));
        area.appendChild(carta);
    });
}

function usaRerollTorneo() {
    if (draftTorneoScaduto()) {
        mostraMessaggioCustom("TEMPO SCADUTO", "Il tempo per il draft e' terminato.");
        return;
    }
    if (!statoTorneo.slotAttivoRuolo || !statoTorneo.slotAttivoKey) {
        mostraMessaggioCustom("REROLL", "Seleziona prima un ruolo sul campo!");
        return;
    }
    
    if (statoTorneo.rerollDisponibili <= 0) {
        mostraMessaggioCustom("REROLL ESAURITI", "Hai finito i reroll disponibili!");
        return;
    }
    
    // Protezione: ogni slot può essere rerollato al massimo una volta
    const slotKey = statoTorneo.slotAttivoKey;
    if (statoTorneo.rerollUsatiPerSlot[slotKey]) {
        mostraMessaggioCustom("REROLL GIÀ USATO", "Hai già usato un reroll su questo ruolo! Scegli uno dei giocatori disponibili.");
        return;
    }
    
    // Consuma il reroll
    statoTorneo.rerollDisponibili--;
    statoTorneo.rerollUsatiPerSlot[slotKey] = true;
    
    // Aggiorna UI
    document.getElementById("reroll-torneo-count").textContent = statoTorneo.rerollDisponibili;
    document.getElementById("headbar-reroll-torneo-count").textContent = statoTorneo.rerollDisponibili;
    
    const btnReroll = document.getElementById("btn-reroll-torneo");
    if (btnReroll) btnReroll.disabled = true;
    
    // Genera nuove carte
    const nuoveOpzioni = generaOpzioniSlotTorneo(statoTorneo.slotAttivoRuolo);
    statoTorneo.cartePerSlot[slotKey] = nuoveOpzioni;
    renderCarteDraftTorneo(nuoveOpzioni);
}

async function scegliGiocatoreTorneo(giocatore) {
    if (draftTorneoScaduto()) {
        mostraMessaggioCustom("TEMPO SCADUTO", "Il tempo per il draft e' terminato.");
        return;
    }
    // Disabilita immediatamente le carte
    document.querySelectorAll(".carta-draft-torneo").forEach(c => {
        c.style.pointerEvents = "none";
        c.style.opacity = "0.5";
    });
    
    if (!window.dbFirestore || !window.fb || !statoTorneo.lobbyId) return;
    
    const slotIndex = parseInt(statoTorneo.slotAttivoElement.dataset.slotIndex, 10);
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 10) {
        console.error("Indice slot non valido");
        return;
    }
    
    try {
        const { doc, runTransaction } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_tornei", statoTorneo.lobbyId);
        
        await runTransaction(window.dbFirestore, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) throw new Error("Lobby non trovata");
            
            const data = snap.data();
            const draftState = data.draftState || {};
            
            // Verifica che il giocatore non sia già stato preso
            const giocatoriGlobali = draftState.giocatoriDraftati || [];
            if (giocatoriGlobali.includes(giocatore.nome)) {
                throw new Error("Giocatore già scelto da un altro partecipante");
            }
            
            const gObj = {
                id: giocatore.id,
                nome: giocatore.nome,
                ruolo: giocatore.ruolo,
                rating: giocatore.rating,
                stagione: giocatore.stagione
            };
            
            // Recupera o inizializza la mia squadra nel draftState
            const squadre = draftState.squadre || {};
            let miaSquadra = squadre[window.utenteUID] || Array(11).fill(null);
            
            if (miaSquadra[slotIndex]) {
                throw new Error("Slot già occupato");
            }
            
            // Inserisci il giocatore
            miaSquadra[slotIndex] = gObj;
            squadre[window.utenteUID] = miaSquadra;
            
            // Aggiorna lista globale giocatori
            const nuoviDraftati = [...giocatoriGlobali, giocatore.nome];
            
            transaction.update(ref, {
                "draftState.squadre": squadre,
                "draftState.giocatoriDraftati": nuoviDraftati,
                "draftState.updatedAt": Date.now()
            });
        });
        
        // Reset slot attivo
        if (statoTorneo.slotAttivoElement) {
            statoTorneo.slotAttivoElement.classList.remove("active-slot");
        }
        statoTorneo.slotAttivoRuolo = null;
        statoTorneo.slotAttivoElement = null;
        statoTorneo.slotAttivoKey = null;
        
        // Pulisci area draft
        document.getElementById("area-draft-torneo").innerHTML = "";
        document.getElementById("draft-torneo-stato-box").textContent = "Giocatore aggiunto! Clicca un altro ruolo vuoto per continuare.";
        
    } catch (error) {
        console.error("Errore scelta giocatore torneo:", error);
        
        // Riabilita le carte in caso di errore
        document.querySelectorAll(".carta-draft-torneo").forEach(c => {
            c.style.pointerEvents = "auto";
            c.style.opacity = "1";
        });
        
        if (error.message.includes("già scelto")) {
            mostraMessaggioCustom("GIOCATORE NON DISPONIBILE", "Un altro partecipante ha appena scelto questo giocatore! Scegline un altro.");
            
            // Rigenera le carte
            if (statoTorneo.slotAttivoRuolo && statoTorneo.slotAttivoKey) {
                const nuoveOpzioni = generaOpzioniSlotTorneo(statoTorneo.slotAttivoRuolo);
                statoTorneo.cartePerSlot[statoTorneo.slotAttivoKey] = nuoveOpzioni;
                renderCarteDraftTorneo(nuoveOpzioni);
            }
        }
    }
}

function ascoltaDraftTorneo() {
    if (statoTorneo.unsubscribeDraftTorneo) {
        statoTorneo.unsubscribeDraftTorneo();
    }
    
    if (!window.dbFirestore || !window.fb || !statoTorneo.lobbyId) return;
    
    const { doc, onSnapshot } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_tornei", statoTorneo.lobbyId);
    
    statoTorneo.unsubscribeDraftTorneo = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        
        const data = snap.data();
        const draftState = data.draftState || {};
        statoTorneo.tempoDraft = Number(data.tempoDraft) || 90;
        statoTorneo.overallVisibili = data.overallVisibili !== false;
        statoTorneo.scadenzaDraft = draftState.scadenzaDraft || statoTorneo.scadenzaDraft;
        avviaTimerDraftTorneo();
        
        // Aggiorna stato globale
        statoTorneo.giocatoriDraftatiGlobale = draftState.giocatoriDraftati || [];
        statoTorneo.allenatoriDraftatiGlobale = draftState.allenatoriDraftati || [];
        
        // Aggiorna la mia squadra
        const squadre = draftState.squadre || {};
        statoTorneo.miaSquadra = squadre[window.utenteUID] || Array(11).fill(null);
        
        // Aggiorna UI
        aggiornaSlotCampoTorneo();
        aggiornaHeaderDraftTorneo();

        if (draftTorneoScaduto() && !draftState.autoCompletato) {
            const area = document.getElementById("area-draft-torneo");
            if (area) area.innerHTML = `<p style="color:#f44336;text-align:center;margin-top:40px;font-weight:bold;">Tempo scaduto: completamento automatico delle rose...</p>`;
            completaDraftScadutoTorneo();
            return;
        }
        
        // Se ho completato la squadra, attendi che tutti completino
        const countGiocatori = statoTorneo.miaSquadra.filter(Boolean).length;
        if (countGiocatori >= 11) {
            const area = document.getElementById("area-draft-torneo");
            if (area) {
                area.innerHTML = `<p style="color:var(--accento-juve);text-align:center;margin-top:40px;font-weight:bold;">✓ Draft completato! Attendi gli altri giocatori...</p>`;
            }
            
            // Controlla se tutti hanno completato
            verificaAvanzamentoFaseTorneo(data);
        }
    });
}

// Verifica se tutti i giocatori hanno completato il draft
async function verificaAvanzamentoFaseTorneo(lobbyData) {
    const tuttiCompleti = tuttiDraftTorneoCompleti(lobbyData);

    if (tuttiCompleti && lobbyData.stato === "draft" && lobbyData.hostUid === window.utenteUID) {
        // Tabellone e passaggio alla simulazione devono essere scritti insieme:
        // tutti i partecipanti partiranno dalla stessa struttura persistita.
        await finalizzaTorneoDopoDraft();
    }
    
    // Se la lobby è in simulazione, avvia la mia partita
    if (lobbyData.stato === "simulazione" && lobbyData.tabellone && !statoSimulazioneTorneo.partitaCorrente) {
        if (statoTorneo.timerDraftInterval) {
            clearInterval(statoTorneo.timerDraftInterval);
            statoTorneo.timerDraftInterval = null;
        }
        statoTorneo.unsubscribeDraftTorneo();
        statoTorneo.unsubscribeDraftTorneo = null;
        
        // Carica il tabellone e avvia simulazione
        statoSimulazioneTorneo.tabellone = lobbyData.tabellone;
        statoSimulazioneTorneo.faseCorrente = lobbyData.tabellone?.faseIniziale || "ottavi";
        
        setTimeout(() => avviaSimulazionePartitaTorneo(), 1500);
    }
}

function aggiornaSlotCampoTorneo() {
    const campo = document.getElementById("campo-torneo-draft");
    if (!campo) return;
    
    const slots = campo.querySelectorAll(".slot-torneo-draft");
    slots.forEach((slot, i) => {
        const giocatore = statoTorneo.miaSquadra[i];
        if (giocatore) {
            slot.classList.add("occupato");
            slot.innerHTML = `
                <span style="color:var(--accento-juve);font-family:'Bebas Neue',sans-serif;font-size:1.2rem;">${giocatore.rating}</span>
                <span style="color:#fff;font-size:0.6rem;font-weight:bold;text-align:center;">${giocatore.nome.split(" ").pop().toUpperCase()}</span>
            `;
            slot.style.border = "1px solid var(--accento-juve)";
            slot.style.background = "rgba(0,0,0,0.8)";
            slot.style.pointerEvents = "none";
        }
    });
}


// ============================================================================
// --- SISTEMA TABELLONE E SIMULAZIONE TORNEO ---
// ============================================================================

let statoSimulazioneTorneo = {
    tabellone: null,           // Struttura del tabellone
    faseCorrente: null,        // "ottavi", "quarti", "semifinali", "finale"
    partitaCorrente: null,     // Partita che sto giocando ora
    risultatiPartite: {},      // Risultati di tutte le partite
    mioPercorso: [],           // Storico delle mie partite
    eliminato: false,
    cronometroInterval: null,
    minutiPartita: 0,
    golMia: 0,
    golAvv: 0,
    vistaTabelloneAttiva: false
};

// Helper: genera nomi casuali per le squadre CPU
function generaNomiSquadreCPU(numero) {
    const clubItaliani = [
        "Torino", "Sampdoria", "Genoa", "Palermo", "Brescia", "Parma", 
        "Como", "Venezia", "Cremonese", "Salernitana", "Frosinone", "Perugia",
        "Bari", "Reggina", "Catania", "Messina", "Livorno", "Pisa",
        "Cesena", "Modena", "Spezia", "Ascoli", "Ternana", "Cosenza"
    ];
    
    // Mescola e completa l'elenco anche per il formato a 32 squadre.
    const mescolate = clubItaliani.sort(() => 0.5 - Math.random());
    return Array.from({ length: numero }, (_, indice) => mescolate[indice] || `Club CPU ${indice + 1}`);
}

// Helper: genera una squadra CPU completa
function generaSquadraCPU(nomeSquadra) {
    // Le CPU sono volutamente inferiori alle rose draftate dagli utenti.
    // Il margine lascia comunque spazio a qualche sorpresa senza pareggiare
    // la forza media di una squadra costruita nel draft.
    const forzaBase = 52 + Math.floor(Math.random() * 9);
    
    const roseCPU = {
        Torino: ["Milinkovic-Savic", "Buongiorno", "Schuurs", "Lazaro", "Rodriguez", "Ricci", "Ilic", "Vlasic", "Bellanova", "Sanabria", "Zapata"],
        Sampdoria: ["Audero", "Bereszynski", "Colley", "Nuytinck", "Augello", "Rincon", "Sabiri", "Cuisance", "Gabbiadini", "Quagliarella", "Lammers"],
        Genoa: ["Martinez", "Bani", "Vasquez", "De Winter", "Martin", "Frendrup", "Badelj", "Strootman", "Gudmundsson", "Retegui", "Messias"],
        Palermo: ["Pigliacelli", "Mateju", "Marconi", "Nedelcearu", "Aurelio", "Segre", "Gomes", "Verre", "Di Mariano", "Brunori", "Insigne"],
        Parma: ["Chichizola", "Delprato", "Circati", "Osorio", "Valeri", "Bernabe", "Estevez", "Hernani", "Man", "Benedyczak", "Bonny"],
        Como: ["Semper", "Goldaniga", "Dossena", "Barba", "Ioannou", "Da Cunha", "Baselli", "Strefezza", "Verdi", "Cutrone", "Cerri"],
        Brescia: ["Joronen", "Sabelli", "Cistana", "Chancellor", "Martella", "Tonali", "Bisoli", "Romulo", "Spalek", "Donnarumma", "Balotelli"],
        Venezia: ["Lezzerini", "Mazzocchi", "Ceccaroni", "Modolo", "Molinaro", "Ampadu", "Busio", "Tessmann", "Aramu", "Okereke", "Forte"],
        Cremonese: ["Carnesecchi", "Sernicola", "Vasquez", "Chiriches", "Valeri", "Pickel", "Meite", "Castagnetti", "Zanimacchia", "Okereke", "Dessers"],
        Salernitana: ["Ochoa", "Daniliuc", "Gyomber", "Pirola", "Bradarić", "Candreva", "Coulibaly", "Lassana Coulibaly", "Kastanos", "Dia", "Tchaouna"],
        Frosinone: ["Turati", "Monterisi", "Romagnoli", "Marchizza", "Zortea", "Mazzitelli", "Barrenechea", "Brescianini", "Soulé", "Cheddira", "Kaio Jorge"],
        Perugia: ["Gori", "Rosi", "Angella", "Dell'Orco", "Paz", "Kouan", "Segre", "Lisi", "Falzerano", "De Luca", "Olivieri"],
        Bari: ["Caprile", "Pucino", "Di Cesare", "Vicari", "Ricci", "Maita", "Benedetti", "Bellomo", "Folorunsho", "Cheddira", "Antenucci"],
        Reggina: ["Micai", "Cionek", "Loiacono", "Gagliolo", "Di Chiara", "Fabbian", "Hernani", "Majer", "Rivas", "Menez", "Strelec"],
        Catania: ["Andujar", "Potenza", "Spolli", "Legrottaglie", "Marchese", "Lodi", "Almiron", "Izco", "Barrientos", "Bergessio", "Gomez"],
        Messina: ["Storari", "Zanchi", "Rezaei", "Aronica", "Parisi", "Coppola", "Donati", "D'Agostino", "Sullo", "Di Napoli", "Zampagna"],
        Livorno: ["Amelia", "Grandoni", "Knezevic", "Galante", "Vargas", "Doga", "Loveliso", "Moro", "Diamanti", "Lucarelli", "Tavano"],
        Pisa: ["Nicolas", "Calabresi", "Caracciolo", "Canestrelli", "Beruatto", "Marin", "Nag", "Tramoni", "Morutan", "Sibilli", "Lucca"],
        Cesena: ["Agliardi", "Ceccarelli", "Von Bergen", "Lucchini", "Renzetti", "Cascione", "Parolo", "De Feudis", "Eder", "Mutu", "Succi"],
        Modena: ["Gagno", "Pergreffi", "Zaro", "Cittadini", "Ponsi", "Gerli", "Magnino", "Tremolada", "Falcinelli", "Bonfanti", "Diaw"],
        Spezia: ["Provedel", "Amian", "Erlic", "Nikolaou", "Bastoni", "Maggiore", "Ricci", "Kovalenko", "Verde", "Nzola", "Gyasi"],
        Ascoli: ["Guarna", "Brosco", "Bellusci", "Mignanelli", "Baschirotto", "Buchel", "Caligara", "Collocolo", "Falzerano", "Dionisi", "Gondo"],
        Ternana: ["Iannarilli", "Diakite", "Capuano", "Sgarbi", "Corrado", "Palumbo", "Agazzi", "Paghera", "Partipilo", "Falletti", "Donnarumma"],
        Cosenza: ["Micai", "Rispoli", "Camporese", "Vaisanen", "D'Orazio", "Palmiero", "Bruccini", "Voca", "Marras", "Tutino", "Larrivey"]
    };
    const rosaNomi = roseCPU[nomeSquadra] || roseCPU.Torino;

    // Genera una rosa CPU con calciatori reali e rating intorno alla forza base.
    const squadraCPU = [];
    const ruoliStandard = ["POR", "DC", "DC", "TD", "TS", "CC", "CDC", "CC", "ED", "ES", "ATT"];
    
    for (let i = 0; i < 11; i++) {
        const variazione = Math.floor(Math.random() * 9) - 4; // ±4
        squadraCPU.push({
            id: `cpu_${nomeSquadra}_${i}`,
            nome: rosaNomi[i],
            ruolo: [ruoliStandard[i]],
            rating: Math.max(45, Math.min(67, forzaBase + variazione)),
            stagione: "CPU"
        });
    }
    
    return {
        uid: `cpu_${nomeSquadra}`,
        nome: nomeSquadra,
        modulo: "4-3-3",
        squadra: squadraCPU,
        allenatore: { nome: "CPU", modificatore: 0, effetto: "Allenatore CPU" },
        forza: forzaBase,
        isHuman: false
    };
}

function tuttiDraftTorneoCompleti(lobby) {
    const squadre = lobby.draftState?.squadre || {};
    return normalizzaGiocatoriTorneo(lobby).every((giocatore) =>
        (squadre[giocatore.uid] || []).filter(Boolean).length === 11
    );
}

// Costruisce il tabellone da un singolo snapshot della lobby. Il chiamante lo
// persiste in una transazione, rendendolo la fonte condivisa del torneo.
function creaTabelloneTorneoDaLobby(lobby) {
    const giocatori = normalizzaGiocatoriTorneo(lobby);
    const squadre = lobby.draftState?.squadre || {};
    const allenatori = lobby.draftState?.allenatori || {};
    const dimensione = lobby.dimensione || 16;
    
    // Crea lista partecipanti con le loro squadre
    const partecipanti = giocatori.map(g => ({
        uid: g.uid,
        nome: g.nome,
        modulo: g.modulo,
        squadra: squadre[g.uid] || [],
        allenatore: allenatori[g.uid] || null,
        forza: calcolaForzaSquadra1v1(squadre[g.uid] || [], allenatori[g.uid]),
        isHuman: true
    })).filter(p => p.squadra.filter(Boolean).length === 11);
    
    // FIX #1: GENERA SQUADRE CPU PER I POSTI VUOTI
    const postiLiberi = dimensione - partecipanti.length;
    if (postiLiberi > 0) {
        const nomiCPU = generaNomiSquadreCPU(postiLiberi);
        for (let i = 0; i < postiLiberi; i++) {
            partecipanti.push(generaSquadraCPU(nomiCPU[i]));
        }
    }
    
    // Randomizza l'ordine dei partecipanti
    partecipanti.sort(() => 0.5 - Math.random());
    
    // Determina la fase iniziale in base al numero di partecipanti
    let faseIniziale;
    if (partecipanti.length <= 2) faseIniziale = "finale";
    else if (partecipanti.length <= 4) faseIniziale = "semifinali";
    else if (partecipanti.length <= 8) faseIniziale = "quarti";
    else if (partecipanti.length <= 16) faseIniziale = "ottavi";
    else faseIniziale = "sedicesimi";
    
    // Crea gli accoppiamenti della fase iniziale
    const accoppiamenti = [];
    for (let i = 0; i < partecipanti.length; i += 2) {
        if (i + 1 < partecipanti.length) {
            accoppiamenti.push(creaPartitaPianificataTorneo(partecipanti[i], partecipanti[i + 1], faseIniziale));
        }
    }
    
    const tabellone = {
        faseIniziale,
        accoppiamenti: {
            [faseIniziale]: accoppiamenti
        },
        partecipantiOriginali: partecipanti.length
    };
    completaStrutturaTabelloneTorneo(tabellone);
    return tabellone;
}

async function finalizzaTorneoDopoDraft() {
    if (!window.dbFirestore || !window.fb || !statoTorneo.lobbyId) return null;

    const { doc, runTransaction } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_tornei", statoTorneo.lobbyId);

    return runTransaction(window.dbFirestore, async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) return null;

        const lobby = snapshot.data();
        if (lobby.stato !== "draft" || !tuttiDraftTorneoCompleti(lobby)) return lobby.tabellone || null;

        const tabellone = creaTabelloneTorneoDaLobby(lobby);
        transaction.update(ref, {
            tabellone,
            stato: "simulazione",
            simulazioneAvviataAt: Date.now(),
            updatedAt: Date.now()
        });
        return tabellone;
    });
}


// Trova la mia partita nella fase corrente
function trovaMiaPartita() {
    if (!statoSimulazioneTorneo.tabellone || !statoSimulazioneTorneo.faseCorrente) return null;
    
    const accoppiamenti = statoSimulazioneTorneo.tabellone.accoppiamenti[statoSimulazioneTorneo.faseCorrente];
    if (!accoppiamenti) return null;
    
    return accoppiamenti.find(a => 
        a.squadra1.uid === window.utenteUID || a.squadra2.uid === window.utenteUID
    );
}

// Avvia la simulazione della mia partita
async function avviaSimulazionePartitaTorneo() {
    const miaPartita = trovaMiaPartita();
    if (!miaPartita) {
        mostraMessaggioCustom("ERRORE", "Non trovo la tua partita nel tabellone!");
        return;
    }
    
    statoSimulazioneTorneo.partitaCorrente = miaPartita;
    const sonoSquadra1 = miaPartita.squadra1.uid === window.utenteUID;
    const miaSquadra = sonoSquadra1 ? miaPartita.squadra1 : miaPartita.squadra2;
    const avvSquadra = sonoSquadra1 ? miaPartita.squadra2 : miaPartita.squadra1;
    
    // Nascondi tutte le schermate
    nascondiTutteLeSchermate1v1Extra();
    [schermataMenu, schermataModulo, schermataGioco, schermataScelta1v1, schermataLobbyOnline1v1,
     schermataLobbyAmico1v1, schermataSceltaTorneo, schermataSetupTorneo, schermataEntraTorneo,
     schermataLobbyTorneo, document.getElementById("schermata-torneo-draft")
    ].forEach(s => { if (s) s.style.display = "none"; });
    
    // Mostra schermata simulazione (NUOVA UI)
    document.getElementById("schermata-torneo-simulazione").style.display = "block";
    document.getElementById("vista-tabellone-torneo").style.display = "none";
    statoSimulazioneTorneo.vistaTabelloneAttiva = false;
    
    // Setup UI - NUOVI ELEMENTI
    const nomeFase = getNomeFaseVisivo(statoSimulazioneTorneo.faseCorrente);
    document.getElementById("torneo-sim-mio-nome-header").textContent = miaSquadra.nome;
    document.getElementById("torneo-sim-avv-nome-header").textContent = avvSquadra.nome;
    document.getElementById("torneo-sim-overall-mia").textContent = `OVERALL TUA SQUADRA: ${Math.round(miaSquadra.forza || 0)}`;
    document.getElementById("torneo-sim-fase-label").textContent = nomeFase.toUpperCase();
    document.getElementById("torneo-sim-nome-utente").textContent = miaSquadra.nome.toUpperCase();
    
    // Genera percorso fasi
    generaPercorsoFasi();
    
    // Reset stato partita
    statoSimulazioneTorneo.minutiPartita = 0;
    statoSimulazioneTorneo.golMia = 0;
    statoSimulazioneTorneo.golAvv = 0;
    
    // Reset UI risultato
    document.getElementById("torneo-sim-risultato-mio").textContent = "0";
    document.getElementById("torneo-sim-risultato-avv").textContent = "0";
    document.getElementById("torneo-sim-cronometro").textContent = "0'";
    document.getElementById("torneo-sim-eventi").innerHTML = "";
    
    // Controlla se esistono già eventi in Firebase (sincronizzazione)
    // Gli eventi fanno parte del tabellone persistito dopo il draft. Il
    // fallback supporta anche le lobby create con la versione precedente.
    const eventiEsistenti = miaPartita.esito?.eventi || await getEventiPartitaFirebase();
    
    // Avvia il cronometro e la simulazione con o senza eventi pre-generati
    simulaPartitaTorneo(miaSquadra, avvSquadra, eventiEsistenti);
}

// Genera il percorso visivo verso la finale (stile reference image)
function generaPercorsoFasi() {
    const containerPercorso = document.getElementById("torneo-percorso-fasi");
    containerPercorso.innerHTML = "";
    
    const fasi = ["sedicesimi", "ottavi", "quarti", "semifinali", "finale"]
        .slice([32, 16, 8, 4, 2].includes(statoTorneo.numeroPartecipanti) ?
            { 32: 0, 16: 1, 8: 2, 4: 3, 2: 4 }[statoTorneo.numeroPartecipanti] : 1);
    const indiceFaseAttuale = fasi.indexOf(statoSimulazioneTorneo.faseCorrente);
    const avvNome = statoSimulazioneTorneo.partitaCorrente ? 
        (statoSimulazioneTorneo.partitaCorrente.squadra1.uid === window.utenteUID ? 
         statoSimulazioneTorneo.partitaCorrente.squadra2.nome : 
         statoSimulazioneTorneo.partitaCorrente.squadra1.nome) : "???";
    
    fasi.forEach((fase, idx) => {
        const isAttuale = fase === statoSimulazioneTorneo.faseCorrente;
        const isPrecedente = idx < indiceFaseAttuale;
        const isSuccessiva = idx > indiceFaseAttuale;
        const nomeFase = getNomeFaseVisivo(fase).toUpperCase();
        
        const div = document.createElement("div");
        div.style.cssText = `
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(224,200,112,0.3);
            border-radius: 8px;
            padding: 15px 20px;
            font-family: 'Bebas Neue', sans-serif;
        `;
        
        if (isAttuale) {
            div.style.borderColor = "var(--accento-juve)";
            div.style.background = "rgba(224,200,112,0.1)";
            div.innerHTML = `
                <div style="color: var(--accento-juve); font-size: 1.1rem; letter-spacing: 2px; margin-bottom: 5px;">${nomeFase}</div>
                <div style="color: #888; font-size: 0.85rem;">VS ${avvNome.toUpperCase()}</div>
            `;
        } else if (isSuccessiva && idx === indiceFaseAttuale + 1) {
            div.innerHTML = `
                <div style="color: #666; font-size: 1.1rem; letter-spacing: 2px; margin-bottom: 5px;">${nomeFase}</div>
                <div style="color: #444; font-size: 0.85rem;">???</div>
            `;
        } else if (isPrecedente) {
            div.style.opacity = "0.5";
            div.innerHTML = `
                <div style="color: #4caf50; font-size: 1.1rem; letter-spacing: 2px;">${nomeFase}</div>
                <div style="color: #666; font-size: 0.85rem;">COMPLETATO</div>
            `;
        } else {
            div.style.opacity = "0.3";
            div.innerHTML = `
                <div style="color: #444; font-size: 1.1rem; letter-spacing: 2px;">${nomeFase}</div>
            `;
        }
        
        containerPercorso.appendChild(div);
    });
}


// Simulazione breve: gli eventi hanno una squadra proprietaria, non una prospettiva.
// Questo consente ai due sfidanti di vedere la stessa partita dal proprio lato del campo.
function simulaPartitaTorneo(miaSquadra, avvSquadra, eventiPreGenerati = null) {
    const eventiEl = document.getElementById("torneo-sim-eventi");
    eventiEl.innerHTML = "";
    const DURATA_TOTALE_MS = 20000;
    const inizioSimulazione = Date.now();
    const partita = statoSimulazioneTorneo.partitaCorrente;
    const seed = generaSeedPartitaTorneo(partita, partita?.fase);
    const esito = partita?.esito || generaEsitoPartitaTorneo(partita, partita?.fase);
    if (partita && !partita.esito) partita.esito = esito;
    const eventi = (eventiPreGenerati || esito.eventi || generaEventiPartitaSincronizzati(seed, partita.squadra1, partita.squadra2))
        .map(evento => ({ ...evento, mostrato: false }));

    if (!eventiPreGenerati && !partita?.esito) salvaEventiPartitaFirebase(eventi);

    statoSimulazioneTorneo.cronometroInterval = setInterval(() => {
        const tempoTrascorso = Date.now() - inizioSimulazione;
        const minutiAttuali = Math.min(90, Math.floor((tempoTrascorso / DURATA_TOTALE_MS) * 90));
        document.getElementById("torneo-sim-cronometro").textContent = minutiAttuali + "'";

        eventi.forEach(evento => {
            if (evento.minuto > minutiAttuali || evento.mostrato) return;
            evento.mostrato = true;
            const eventoMio = evento.squadraUid === miaSquadra.uid;

            if (evento.tipo === "gol") {
                if (eventoMio) statoSimulazioneTorneo.golMia++;
                else statoSimulazioneTorneo.golAvv++;
                document.getElementById("torneo-sim-risultato-mio").textContent = statoSimulazioneTorneo.golMia;
                document.getElementById("torneo-sim-risultato-avv").textContent = statoSimulazioneTorneo.golAvv;
            }

            const dettagli = {
                gol: { icona: "⚽", testo: `${evento.protagonista} GOL!`, colore: "var(--accento-juve)" },
                giallo: { icona: "🟨", testo: `${evento.protagonista} ammonito`, colore: "#f4c542" },
                rosso: { icona: "🟥", testo: `${evento.protagonista} espulso`, colore: "#ef5350" },
                infortunio: { icona: "✚", testo: `${evento.protagonista} si infortuna`, colore: "#ff8a65" },
                rigore: { icona: "•", testo: `RIGORE PER ${eventoMio ? "LA TUA SQUADRA" : "GLI AVVERSARI"}`, colore: "#fff" }
            }[evento.tipo];
            const eventoDiv = document.createElement("div");
            eventoDiv.style.cssText = `display:flex;align-items:center;gap:8px;padding:7px 10px;background:${eventoMio ? "rgba(224,200,112,.08)" : "rgba(255,255,255,.035)"};border-left:2px solid ${dettagli.colore};border-radius:4px;font-family:'Bebas Neue',sans-serif;font-size:.86rem;letter-spacing:.4px;`;
            eventoDiv.innerHTML = `<span style="color:#aaa;min-width:24px;">${evento.minuto}'</span><span style="font-size:.85rem;">${dettagli.icona}</span><span style="color:${dettagli.colore};">${dettagli.testo}</span>`;
            eventiEl.insertBefore(eventoDiv, eventiEl.firstChild);
        });

        if (tempoTrascorso >= DURATA_TOTALE_MS) {
            clearInterval(statoSimulazioneTorneo.cronometroInterval);
            if (esito.decisione === "rigori") {
                setTimeout(() => avviaRigori(miaSquadra, avvSquadra, esito.rigori), 500);
            } else {
                setTimeout(() => finePartitaTorneo(miaSquadra, avvSquadra), 500);
            }
        }
    }, 150);
}


// Supplementari (tempi supplementari)
function avviaSupplementari(miaSquadra, avvSquadra) {
    const eventiEl = document.getElementById("torneo-sim-eventi");
    
    // Aggiungi intestazione supplementari
    const headerSupp = document.createElement("div");
    headerSupp.style.cssText = `
        text-align: center;
        padding: 15px;
        background: rgba(224,200,112,0.1);
        border: 1px solid var(--accento-juve);
        border-radius: 6px;
        margin: 20px 0;
        font-family: 'Bebas Neue', sans-serif;
    `;
    headerSupp.innerHTML = `
        <strong style="color: var(--accento-juve); font-size: 1.2rem; letter-spacing: 2px;">
            ⏱️ TEMPI SUPPLEMENTARI
        </strong>
        <p style="margin: 5px 0 0 0; color: #888; font-size: 0.85rem;">Altri 30 minuti di gioco</p>
    `;
    eventiEl.insertBefore(headerSupp, eventiEl.firstChild);
    
    const DURATA_SUPP_MS = 6000; // 6 secondi per 30 minuti
    const inizioSupp = Date.now();
    let minutiSupp = 90;
    
    // Genera 1-2 eventi nei supplementari
    const eventiSupp = [];
    const numEventiSupp = Math.random() < 0.6 ? 1 : (Math.random() < 0.5 ? 2 : 0);
    
    for (let i = 0; i < numEventiSupp; i++) {
        const minuto = 91 + Math.floor(Math.random() * 30);
        const differenza = miaSquadra.forza - avvSquadra.forza;
        let probMio = 0.5 + (differenza / 100);
        const èMioGol = Math.random() < probMio;
        
        let marcatore;
        if (èMioGol) {
            const pool = miaSquadra.squadra.filter(g => g && g.ruolo.some(r => ["ATT","AS","AD","COC","AT"].includes(r)));
            marcatore = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)].nome : miaSquadra.nome;
        } else {
            marcatore = avvSquadra.nome;
        }
        
        eventiSupp.push({ minuto, èMioGol, marcatore });
    }
    
    eventiSupp.sort((a, b) => a.minuto - b.minuto);
    
    statoSimulazioneTorneo.cronometroInterval = setInterval(() => {
        const tempoSupp = Date.now() - inizioSupp;
        minutiSupp = 90 + Math.min(30, Math.floor((tempoSupp / DURATA_SUPP_MS) * 30));
        
        document.getElementById("torneo-sim-cronometro").textContent = minutiSupp + "'";
        
        // Mostra eventi supplementari
        eventiSupp.forEach(evento => {
            if (evento.minuto === minutiSupp && !evento.mostrato) {
                evento.mostrato = true;
                
                if (evento.èMioGol) {
                    statoSimulazioneTorneo.golMia++;
                } else {
                    statoSimulazioneTorneo.golAvv++;
                }
                
                // Aggiorna risultato
                document.getElementById("torneo-sim-risultato-mio").textContent = statoSimulazioneTorneo.golMia;
                document.getElementById("torneo-sim-risultato-avv").textContent = statoSimulazioneTorneo.golAvv;
                
                // Aggiungi evento (stile reference image)
                const eventoDiv = document.createElement("div");
                eventoDiv.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(224,200,112,0.2);
                    border-radius: 6px;
                    font-family: 'Bebas Neue', sans-serif;
                `;
                
                eventoDiv.innerHTML = `
                    <span style="color: var(--accento-juve); font-size: 1.1rem; letter-spacing: 1px;">${evento.minuto}'</span>
                    <span style="color: #666;">-</span>
                    <span style="color: #fff; font-size: 1rem; letter-spacing: 1px;">${evento.marcatore.toUpperCase()}</span>
                `;
                
                eventiEl.insertBefore(eventoDiv, eventiEl.children[1]); // Dopo l'header supplementari
            }
        });
        
        // Fine supplementari
        if (tempoSupp >= DURATA_SUPP_MS) {
            clearInterval(statoSimulazioneTorneo.cronometroInterval);
            
            if (statoSimulazioneTorneo.golMia === statoSimulazioneTorneo.golAvv) {
                setTimeout(() => avviaRigori(miaSquadra, avvSquadra), 1500);
            } else {
                setTimeout(() => finePartitaTorneo(miaSquadra, avvSquadra), 1500);
            }
        }
    }, 200);
}


// Rigori
function avviaRigori(miaSquadra, avvSquadra, rigoriCanonici = null) {
    // Per le nuove lobby la sequenza dei rigori è decisa nel tabellone
    // condiviso: ogni sfidante vede lo stesso verdetto dal proprio lato.
    if (rigoriCanonici) {
        const sonoSquadra1 = statoSimulazioneTorneo.partitaCorrente?.squadra1?.uid === miaSquadra.uid;
        const rigoriMiei = sonoSquadra1 ? rigoriCanonici.squadra1 : rigoriCanonici.squadra2;
        const rigoriAvversari = sonoSquadra1 ? rigoriCanonici.squadra2 : rigoriCanonici.squadra1;
        const eventiEl = document.getElementById("torneo-sim-eventi");

        statoSimulazioneTorneo.golMia = rigoriMiei;
        statoSimulazioneTorneo.golAvv = rigoriAvversari;
        document.getElementById("torneo-sim-cronometro").textContent = "RIG";
        document.getElementById("torneo-sim-risultato-mio").textContent = rigoriMiei;
        document.getElementById("torneo-sim-risultato-avv").textContent = rigoriAvversari;

        if (eventiEl) {
            eventiEl.insertAdjacentHTML("afterbegin", `
                <div style="padding:12px 16px;background:rgba(224,200,112,.1);border:1px solid var(--accento-juve);border-radius:6px;text-align:center;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;">
                    RIGORI: ${rigoriMiei}-${rigoriAvversari}
                </div>
            `);
        }
        setTimeout(() => finePartitaTorneo(miaSquadra, avvSquadra), 1200);
        return;
    }
    const eventiEl = document.getElementById("torneo-sim-eventi");
    
    // Aggiungi intestazione rigori
    const headerRigori = document.createElement("div");
    headerRigori.style.cssText = `
        text-align: center;
        padding: 15px;
        background: rgba(244,67,54,0.1);
        border: 1px solid #f44336;
        border-radius: 6px;
        margin: 20px 0;
        font-family: 'Bebas Neue', sans-serif;
    `;
    headerRigori.innerHTML = `
        <strong style="color: #f44336; font-size: 1.2rem; font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px;">
            🎯 CALCI DI RIGORE
        </strong>
        <p style="margin: 5px 0 0 0; color: #888; font-size: 0.85rem;">Si decide ai rigori!</p>
    `;
    eventiEl.insertBefore(headerRigori, eventiEl.firstChild);
    
    // Aggiorna cronometro
    document.getElementById("torneo-sim-cronometro").textContent = "RIG";
    
    let rigoriMiei = 0;
    let rigoriAvv = 0;
    let turnoRigori = 0;
    const MAX_RIGORI = 5;
    const rngRigori = new SeededRandom(generaSeedPartitaTorneo(statoSimulazioneTorneo.partitaCorrente) + 997);
    
    const eseguiRigore = () => {
        if (turnoRigori >= MAX_RIGORI * 2) {
            // Fine rigori, controlla vincitore
            if (rigoriMiei === rigoriAvv) {
                // Sudden death
                const vinceSuddenDeath = rngRigori.next() < 0.5;
                if (vinceSuddenDeath) rigoriMiei++;
                else rigoriAvv++;
            }
            
            statoSimulazioneTorneo.golMia = rigoriMiei;
            statoSimulazioneTorneo.golAvv = rigoriAvv;
            
            document.getElementById("torneo-sim-risultato-mio").textContent = rigoriMiei;
            document.getElementById("torneo-sim-risultato-avv").textContent = rigoriAvv;
            
            setTimeout(() => finePartitaTorneo(miaSquadra, avvSquadra), 1500);
            return;
        }
        
        const èMioTurno = turnoRigori % 2 === 0;
        const differenza = miaSquadra.forza - avvSquadra.forza;
        let probSegnare = 0.75;
        
        if (èMioTurno) probSegnare = 0.75 + (differenza / 200);
        else probSegnare = 0.75 - (differenza / 200);
        
        const segna = rngRigori.next() < probSegnare;
        
        if (èMioTurno && segna) rigoriMiei++;
        if (!èMioTurno && segna) rigoriAvv++;
        
        // Aggiorna risultato live
        document.getElementById("torneo-sim-risultato-mio").textContent = rigoriMiei;
        document.getElementById("torneo-sim-risultato-avv").textContent = rigoriAvv;
        
        const colore = (èMioTurno && segna) || (!èMioTurno && !segna) ? "#4caf50" : "#f44336";
        const icona = segna ? "✅" : "❌";
        const testo = èMioTurno 
            ? (segna ? "TUO RIGORE SEGNATO!" : "TUO RIGORE SBAGLIATO")
            : (segna ? "RIGORE AVVERSARIO SEGNATO" : "RIGORE AVVERSARIO SBAGLIATO");
        
        const eventoRigore = document.createElement("div");
        eventoRigore.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 20px;
            background: rgba(0,0,0,0.3);
            border-left: 3px solid ${colore};
            border-radius: 4px;
        `;
        
        eventoRigore.innerHTML = `
            <div style="
                min-width: 40px;
                text-align: center;
                font-size: 1.5rem;
            ">${icona}</div>
            <div style="flex: 1;">
                <div style="color: ${colore}; font-weight: bold; font-size: 1rem;">
                    ${testo}
                </div>
                <div style="color: #888; font-size: 0.85rem;">Rigore ${Math.floor(turnoRigori / 2) + 1}/5</div>
            </div>
            <div style="font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; color: #fff;">
                ${rigoriMiei}-${rigoriAvv}
            </div>
        `;
        
        eventiEl.insertBefore(eventoRigore, eventiEl.children[1]);
        
        turnoRigori++;
        setTimeout(eseguiRigore, 1200);
    };
    
    setTimeout(eseguiRigore, 800);
}

function getVincitorePianificatoTorneo(partita) {
    const vincitoreUid = partita?.esito?.vincitoreUid || partita?.vincitore?.uid || partita?.vincitoreUid;
    if (!vincitoreUid) return null;
    return partita?.squadra1?.uid === vincitoreUid ? partita.squadra1 : partita?.squadra2;
}

function generaEsitoPartitaTorneo(partita, fase = partita?.fase) {
    const seed = generaSeedPartitaTorneo(partita, fase);
    const eventi = generaEventiPartitaSincronizzati(seed, partita.squadra1, partita.squadra2);
    const golSquadra1 = eventi.filter((evento) => evento.tipo === "gol" && evento.squadraUid === partita.squadra1.uid).length;
    const golSquadra2 = eventi.filter((evento) => evento.tipo === "gol" && evento.squadraUid === partita.squadra2.uid).length;

    if (golSquadra1 !== golSquadra2) {
        return {
            eventi,
            golSquadra1,
            golSquadra2,
            decisione: "tempi-regolamentari",
            vincitoreUid: golSquadra1 > golSquadra2 ? partita.squadra1.uid : partita.squadra2.uid
        };
    }

    // Anche i rigori sono canonici: niente più esiti diversi per la stessa
    // partita quando le due squadre umane guardano la simulazione da lati opposti.
    const rngRigori = new SeededRandom(seed + 997);
    const probabilitaSquadra1 = Math.max(.35, Math.min(.65, .5 + ((partita.squadra1.forza || 0) - (partita.squadra2.forza || 0)) / 120));
    const vinceSquadra1 = rngRigori.next() < probabilitaSquadra1;
    const scoreVincitore = 4 + rngRigori.nextInt(0, 1);
    const scoreSconfitto = Math.max(2, scoreVincitore - 1 - rngRigori.nextInt(0, 1));

    return {
        eventi,
        golSquadra1,
        golSquadra2,
        decisione: "rigori",
        vincitoreUid: vinceSquadra1 ? partita.squadra1.uid : partita.squadra2.uid,
        rigori: vinceSquadra1
            ? { squadra1: scoreVincitore, squadra2: scoreSconfitto }
            : { squadra1: scoreSconfitto, squadra2: scoreVincitore }
    };
}

function creaPartitaPianificataTorneo(squadra1, squadra2, fase) {
    const partita = {
        id: `${fase}_${squadra1.uid}_${squadra2.uid}`,
        squadra1,
        squadra2,
        fase,
        completata: false,
        vincitore: null
    };
    partita.esito = generaEsitoPartitaTorneo(partita, fase);
    partita.vincitorePrevistoUid = partita.esito.vincitoreUid;

    // Le sfide CPU-CPU non vengono mostrate a un partecipante umano: possono
    // quindi essere registrate subito senza lasciare buchi nel tabellone.
    if (!squadra1.isHuman && !squadra2.isHuman) {
        partita.completata = true;
        partita.vincitore = getVincitorePianificatoTorneo(partita);
    }
    return partita;
}

// Costruisce tutto il ramo una sola volta prima di salvarlo in Firebase. Le
// sfide dei turni successivi usano gli stessi vincitori pianificati per tutti.
function completaStrutturaTabelloneTorneo(tabellone) {
    let fase = tabellone.faseIniziale;
    while (getFaseSuccessiva(fase)) {
        const faseSuccessiva = getFaseSuccessiva(fase);
        const partite = tabellone.accoppiamenti[fase] || [];
        const vincitori = partite.map(getVincitorePianificatoTorneo);
        const prossimoTurno = [];
        for (let i = 0; i < vincitori.length; i += 2) {
            if (!vincitori[i + 1]) continue;
            prossimoTurno.push(creaPartitaPianificataTorneo(vincitori[i], vincitori[i + 1], faseSuccessiva));
        }
        tabellone.accoppiamenti[faseSuccessiva] = prossimoTurno;
        fase = faseSuccessiva;
    }
}

function determinaVincitoreStimatoTorneo(partita, fase) {
    if (!partita) return null;
    if (!partita.esito) partita.esito = generaEsitoPartitaTorneo(partita, fase);
    return getVincitorePianificatoTorneo(partita);
}

// Mantiene una via di compatibilità per tabelloni creati prima della struttura
// completa; i nuovi tabelloni hanno già tutti i turni pronti.
function preparaTurnoSuccessivoTorneo(fase) {
    const tabellone = statoSimulazioneTorneo.tabellone;
    const faseSuccessiva = getFaseSuccessiva(fase);
    if (!tabellone || !faseSuccessiva || tabellone.accoppiamenti[faseSuccessiva]) return;

    const vincitori = (tabellone.accoppiamenti[fase] || []).map((partita) => determinaVincitoreStimatoTorneo(partita, fase));
    tabellone.accoppiamenti[faseSuccessiva] = [];
    for (let i = 0; i < vincitori.length; i += 2) {
        if (!vincitori[i + 1]) continue;
        tabellone.accoppiamenti[faseSuccessiva].push(creaPartitaPianificataTorneo(vincitori[i], vincitori[i + 1], faseSuccessiva));
    }
}

function completaTorneoDopoEliminazione() {
    const tabellone = statoSimulazioneTorneo.tabellone;
    let fase = statoSimulazioneTorneo.faseCorrente;
    while (getFaseSuccessiva(fase)) {
        preparaTurnoSuccessivoTorneo(fase);
        fase = getFaseSuccessiva(fase);
    }
    const eventiEl = document.getElementById("torneo-sim-eventi");
    if (eventiEl) {
        eventiEl.insertAdjacentHTML("afterbegin", `<div style="padding:16px;border:1px solid #555;border-radius:6px;color:#aaa;text-align:center;">IL TORNEO PROSEGUE: STIAMO COMPLETANDO IL TABELLONE...</div>`);
    }
    generaPercorsoFasi();
    setTimeout(() => {
        if (!statoSimulazioneTorneo.vistaTabelloneAttiva) toggleTabelloneTorneo();
    }, 800);
    setTimeout(() => mostraRisultatoFinaleTorneo("eliminato"), 6500);
}

async function salvaRisultatoUfficialePartitaTorneo(partita) {
    if (!window.dbFirestore || !window.fb || !statoTorneo.lobbyId || !partita) return null;

    const { doc, runTransaction } = window.fb;
    const ref = doc(window.dbFirestore, "lobby_tornei", statoTorneo.lobbyId);

    return runTransaction(window.dbFirestore, async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) return null;

        const lobby = snapshot.data();
        const tabellone = lobby.tabellone;
        const partite = tabellone?.accoppiamenti?.[partita.fase] || [];
        const partitaUfficiale = partite.find((candidata) => candidata.id === partita.id)
            || partite.find((candidata) => candidata.squadra1?.uid === partita.squadra1?.uid && candidata.squadra2?.uid === partita.squadra2?.uid);

        if (!partitaUfficiale) return tabellone || null;

        if (!partitaUfficiale.esito) {
            partitaUfficiale.esito = partita.esito || generaEsitoPartitaTorneo(partitaUfficiale, partitaUfficiale.fase);
        }
        partitaUfficiale.completata = true;
        partitaUfficiale.vincitore = getVincitorePianificatoTorneo(partitaUfficiale);
        partitaUfficiale.vincitoreUid = partitaUfficiale.esito.vincitoreUid;
        partitaUfficiale.completataAt = Date.now();

        transaction.update(ref, { tabellone, updatedAt: Date.now() });
        return tabellone;
    });
}

// Fine partita e avanzamento
async function finePartitaTorneo(miaSquadra, avvSquadra) {
    const partitaCorrente = statoSimulazioneTorneo.partitaCorrente;
    if (!partitaCorrente) return;

    // L'esito ufficiale non dipende dalla prospettiva locale (squadra a sinistra
    // o a destra). Questo è essenziale quando due utenti giocano la stessa gara.
    const vincitoreUfficiale = getVincitorePianificatoTorneo(partitaCorrente);
    const hoVinto = vincitoreUfficiale?.uid === miaSquadra.uid;
    partitaCorrente.completata = true;
    partitaCorrente.vincitore = vincitoreUfficiale;
    partitaCorrente.vincitoreUid = vincitoreUfficiale?.uid || null;

    const tabelloneAggiornato = await salvaRisultatoUfficialePartitaTorneo(partitaCorrente);
    if (tabelloneAggiornato) statoSimulazioneTorneo.tabellone = tabelloneAggiornato;
    
    // Salva il risultato
    statoSimulazioneTorneo.mioPercorso.push({
        fase: statoSimulazioneTorneo.faseCorrente,
        avversario: avvSquadra.nome,
        risultato: `${statoSimulazioneTorneo.golMia}-${statoSimulazioneTorneo.golAvv}`,
        vinta: hoVinto
    });
    
    if (!hoVinto) {
        statoSimulazioneTorneo.eliminato = true;
        completaTorneoDopoEliminazione();
        return;
    }
    
    // Passa alla fase successiva
    const faseSuccessiva = getFaseSuccessiva(statoSimulazioneTorneo.faseCorrente);
    
    if (!faseSuccessiva) {
        // Ho vinto il torneo!
        setTimeout(() => mostraRisultatoFinaleTorneo("vincitore"), 2000);
        return;
    }
    
    preparaTurnoSuccessivoTorneo(statoSimulazioneTorneo.faseCorrente);
    // Continua al prossimo turno nello stesso ramo del tabellone.
    statoSimulazioneTorneo.faseCorrente = faseSuccessiva;
    
    const eventiEl = document.getElementById("torneo-sim-eventi");
    const headerVittoria = document.createElement("div");
    headerVittoria.style.cssText = "text-align:center;padding:15px;background:rgba(76,175,80,0.2);border:2px solid #4caf50;border-radius:6px;margin:20px 0;";
    headerVittoria.innerHTML = `
        <div style="text-align:center;padding:15px;background:rgba(76,175,80,0.2);border:2px solid #4caf50;border-radius:6px;margin:20px 0;">
            <strong style="color:#4caf50;font-size:1.3rem;">✅ HAI VINTO!</strong>
            <p style="margin:8px 0 0 0;color:#fff;font-size:0.95rem;">Avanzi a: ${getNomeFaseVisivo(faseSuccessiva)}</p>
        </div>
    `;
    eventiEl.insertBefore(headerVittoria, eventiEl.firstChild);
    
    setTimeout(() => avviaSimulazionePartitaTorneo(), 1800);
}


// Seeded random number generator for synchronized simulation
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    // Simple LCG algorithm
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

// Save match events to Firebase for synchronization
async function salvaEventiPartitaFirebase(eventiGol) {
    const lobbyId = statoTorneo.lobbyId || lobbyTorneoCorrente?.id;
    if (!window.dbFirestore || !window.fb || !lobbyId) return;
    
    try {
        const { doc, updateDoc } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_tornei", lobbyId);
        
        // Crea chiave unica per la partita corrente
        const partitaKey = `${statoSimulazioneTorneo.faseCorrente}_${statoSimulazioneTorneo.partitaCorrente?.squadra1?.uid}_${statoSimulazioneTorneo.partitaCorrente?.squadra2?.uid}`;
        
        await updateDoc(ref, {
            [`partiteEventi.${partitaKey}`]: {
                eventi: eventiGol,
                timestamp: Date.now()
            },
            updatedAt: Date.now()
        });
    } catch (error) {
        console.error("Errore salvataggio eventi partita:", error);
    }
}

// Get match events from Firebase
async function getEventiPartitaFirebase() {
    const lobbyId = statoTorneo.lobbyId || lobbyTorneoCorrente?.id;
    if (!window.dbFirestore || !window.fb || !lobbyId) return null;
    
    try {
        const { doc, getDoc } = window.fb;
        const ref = doc(window.dbFirestore, "lobby_tornei", lobbyId);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
            const data = snap.data();
            const partitaKey = `${statoSimulazioneTorneo.faseCorrente}_${statoSimulazioneTorneo.partitaCorrente?.squadra1?.uid}_${statoSimulazioneTorneo.partitaCorrente?.squadra2?.uid}`;
            return data.partiteEventi?.[partitaKey]?.eventi || null;
        }
    } catch (error) {
        console.error("Errore recupero eventi partita:", error);
    }
    
    return null;
}

// Generate match events with seeded random for synchronization
function generaEventiPartitaLegacy(seed, forzaMia, forzaAvv, miaSquadra, avvSquadra) {
    const rng = new SeededRandom(seed);
    const differenza = forzaMia - forzaAvv;
    
    const eventiGol = [];
    let numeroEventiMedi = 2.5;
    if (Math.abs(differenza) > 10) numeroEventiMedi = 3.5;
    const numeroEventi = Math.floor(numeroEventiMedi + rng.next() * 3);
    
    for (let i = 0; i < numeroEventi; i++) {
        const minuto = rng.nextInt(1, 90);
        
        let probMio = 0.5;
        if (differenza > 10) probMio = 0.75;
        else if (differenza > 5) probMio = 0.65;
        else if (differenza < -10) probMio = 0.25;
        else if (differenza < -5) probMio = 0.35;
        
        const èMioGol = rng.next() < probMio;
        
        let marcatore;
        if (èMioGol) {
            const attaccanti = miaSquadra.squadra.filter(g => g && g.ruolo.some(r => ["ATT","AS","AD","COC","AT"].includes(r)));
            const centrocampisti = miaSquadra.squadra.filter(g => g && g.ruolo.some(r => ["CC","CDC","ED","ES"].includes(r)));
            const pool = rng.next() < 0.75 ? (attaccanti.length > 0 ? attaccanti : centrocampisti) : centrocampisti;
            marcatore = pool.length > 0 ? pool[rng.nextInt(0, pool.length - 1)].nome : miaSquadra.nome;
        } else {
            marcatore = avvSquadra.nome;
        }
        
        eventiGol.push({ minuto, èMioGol, marcatore });
    }
    
    eventiGol.sort((a, b) => a.minuto - b.minuto);
    return eventiGol;
}

function generaSeedPartitaTorneo(partita, fase = partita?.fase || statoSimulazioneTorneo.faseCorrente) {
    return `${fase || ""}_${partita?.squadra1?.uid || ""}_${partita?.squadra2?.uid || ""}`
        .split("").reduce((seed, char) => ((seed * 31) + char.charCodeAt(0)) % 233280, 17);
}

function generaEventiPartitaSincronizzati(seed, squadra1, squadra2) {
    const rng = new SeededRandom(seed);
    const differenza = (squadra1.forza || 0) - (squadra2.forza || 0);
    const giocatoriDi = squadra => (squadra.squadra || []).filter(Boolean);
    const scegliProtagonista = (squadra, tipo) => {
        const rosa = giocatoriDi(squadra);
        if (!rosa.length) return squadra.nome;
        if (tipo !== "gol") return rosa[rng.nextInt(0, rosa.length - 1)].nome;

        const attaccanti = rosa.filter(giocatore => giocatore.ruolo?.some(ruolo => ["ATT", "AT", "AS", "AD", "ED", "ES", "COC"].includes(ruolo)));
        const centrocampisti = rosa.filter(giocatore => giocatore.ruolo?.some(ruolo => ["CC", "CDC", "CM", "MED"].includes(ruolo)));
        const difensori = rosa.filter(giocatore => giocatore.ruolo?.some(ruolo => ["DC", "TD", "TS", "DS", "DD"].includes(ruolo)));
        const giocatoriDiMovimento = rosa.filter(giocatore => !giocatore.ruolo?.includes("POR"));
        // Stessa gerarchia delle modalità offline: attaccanti 75%,
        // centrocampisti 20%, difensori 5%. I portieri non sono mai nel pool.
        const estrattore = rng.next();
        const pool = estrattore < .75 && attaccanti.length ? attaccanti
            : (estrattore < .95 && centrocampisti.length ? centrocampisti
                : (difensori.length ? difensori : giocatoriDiMovimento));
        return (pool.length ? pool : giocatoriDiMovimento)[rng.nextInt(0, Math.max(0, (pool.length ? pool : giocatoriDiMovimento).length - 1))]?.nome || squadra.nome;
    };
    const probabilitaSquadra1 = Math.max(.28, Math.min(.72, .5 + differenza / 100));
    const eventi = [];
    const aggiungiEvento = (tipo, minuto, squadra) => eventi.push({
        tipo, minuto, squadraUid: squadra.uid, protagonista: scegliProtagonista(squadra, tipo)
    });

    // Risultati più compatti: normalmente un gol, al massimo due.
    const numeroGol = rng.next() < .35 ? 2 : 1;
    for (let i = 0; i < numeroGol; i++) {
        aggiungiEvento("gol", rng.nextInt(4, 86), rng.next() < probabilitaSquadra1 ? squadra1 : squadra2);
    }
    const tipiExtra = ["giallo", "giallo", "rosso", "infortunio", "rigore"];
    // Meno interruzioni: un solo evento non-gol in circa metà delle gare.
    const numeroExtra = rng.next() < .45 ? 1 : 0;
    for (let i = 0; i < numeroExtra; i++) {
        aggiungiEvento(tipiExtra[rng.nextInt(0, tipiExtra.length - 1)], rng.nextInt(8, 88), rng.next() < .5 ? squadra1 : squadra2);
    }
    return eventi.sort((a, b) => a.minuto - b.minuto);
}

// Helper functions
function getNomeFaseVisivo(fase) {
    const nomi = {
        "sedicesimi": "Sedicesimi di Finale",
        "ottavi": "Ottavi di Finale",
        "quarti": "Quarti di Finale",
        "semifinali": "Semifinali",
        "finale": "FINALE"
    };
    return nomi[fase] || fase;
}

function getFaseSuccessiva(faseCorrente) {
    const ordine = ["sedicesimi", "ottavi", "quarti", "semifinali", "finale"];
    const indice = ordine.indexOf(faseCorrente);
    if (indice === -1 || indice === ordine.length - 1) return null;
    return ordine[indice + 1];
}

// Toggle vista tabellone
function toggleTabelloneTorneo() {
    statoSimulazioneTorneo.vistaTabelloneAttiva = !statoSimulazioneTorneo.vistaTabelloneAttiva;
    
    const vistaTabellone = document.getElementById("vista-tabellone-torneo");
    
    if (statoSimulazioneTorneo.vistaTabelloneAttiva) {
        vistaTabellone.style.display = "block";
        renderTabellone();
    } else {
        vistaTabellone.style.display = "none";
    }
}

function getPunteggioTabellone(match, squadra) {
    if (!match?.completata || !match.esito) return "-";

    const eSquadra1 = squadra.uid === match.squadra1.uid;
    const gol = eSquadra1 ? match.esito.golSquadra1 : match.esito.golSquadra2;
    if (match.esito.decisione !== "rigori") return String(gol ?? "-");

    const rigori = eSquadra1 ? match.esito.rigori?.squadra1 : match.esito.rigori?.squadra2;
    return `${gol ?? 0} (${rigori ?? "-"})`;
}

function disegnaConnettoriTabellone(container) {
    container.querySelector(".torneo-bracket-connectors")?.remove();

    const colonne = [...container.querySelectorAll(".torneo-bracket-column")];
    if (colonne.length < 2) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const rettangoloContainer = container.getBoundingClientRect();
    const larghezza = container.scrollWidth;
    const altezza = Math.max(container.scrollHeight, container.clientHeight);
    svg.classList.add("torneo-bracket-connectors");
    svg.setAttribute("width", String(larghezza));
    svg.setAttribute("height", String(altezza));
    svg.setAttribute("viewBox", `0 0 ${larghezza} ${altezza}`);

    const coordinate = (rettangolo, lato) => ({
        x: (lato === "destra" ? rettangolo.right : rettangolo.left) - rettangoloContainer.left + container.scrollLeft,
        y: rettangolo.top - rettangoloContainer.top + (rettangolo.height / 2) + container.scrollTop
    });

    colonne.slice(0, -1).forEach((colonna, indiceColonna) => {
        const sorgenti = [...colonna.querySelectorAll(".torneo-bracket-match")];
        const destinazioni = [...colonne[indiceColonna + 1].querySelectorAll(".torneo-bracket-match")];

        for (let indice = 0; indice < sorgenti.length; indice += 2) {
            const primaSorgente = sorgenti[indice];
            const secondaSorgente = sorgenti[indice + 1];
            const destinazione = destinazioni[Math.floor(indice / 2)];
            if (!primaSorgente || !destinazione) continue;

            const puntoA = coordinate(primaSorgente.getBoundingClientRect(), "destra");
            const puntoB = secondaSorgente
                ? coordinate(secondaSorgente.getBoundingClientRect(), "destra")
                : puntoA;
            const puntoDestinazione = coordinate(destinazione.getBoundingClientRect(), "sinistra");
            const nodoX = (puntoA.x + puntoDestinazione.x) / 2;
            const nodoY = (puntoA.y + puntoB.y) / 2;
            const percorso = document.createElementNS("http://www.w3.org/2000/svg", "path");

            percorso.setAttribute("d", `M ${puntoA.x} ${puntoA.y} H ${nodoX} V ${puntoB.y} M ${nodoX} ${nodoY} H ${puntoDestinazione.x} V ${puntoDestinazione.y}`);
            percorso.setAttribute("fill", "none");
            percorso.setAttribute("stroke", "rgba(224, 200, 112, .48)");
            percorso.setAttribute("stroke-width", "1.25");
            svg.appendChild(percorso);
        }
    });

    container.appendChild(svg);
}

// Renderizza il tabellone con ogni turno centrato verticalmente tra le sfide
// che lo alimentano, come in un classico bracket a eliminazione diretta.
function renderTabellone() {
    const container = document.getElementById("container-tabellone");
    if (!container || !statoSimulazioneTorneo.tabellone) return;

    container.innerHTML = "";
    container.classList.add("torneo-bracket-board");

    const fasi = ["sedicesimi", "ottavi", "quarti", "semifinali", "finale"];
    const faseIniziale = statoSimulazioneTorneo.tabellone.faseIniziale;
    const indiceInizio = fasi.indexOf(faseIniziale);
    let numeroPartiteAttese = (statoSimulazioneTorneo.tabellone.accoppiamenti[faseIniziale] || []).length || 1;
    const altezzaCorpo = Math.max(220, numeroPartiteAttese * 108);

    fasi.slice(indiceInizio).forEach((fase) => {
        const colonnaFase = document.createElement("div");
        colonnaFase.className = "torneo-bracket-column";

        const titoloFase = document.createElement("h3");
        titoloFase.textContent = getNomeFaseVisivo(fase).toUpperCase();
        titoloFase.className = "torneo-bracket-round-title";
        colonnaFase.appendChild(titoloFase);

        const binarioPartite = document.createElement("div");
        binarioPartite.className = "torneo-bracket-track";
        binarioPartite.style.height = `${altezzaCorpo}px`;

        const accoppiamentiEsistenti = statoSimulazioneTorneo.tabellone.accoppiamenti[fase] || [];
        const accoppiamenti = accoppiamentiEsistenti.length ? accoppiamentiEsistenti : Array(numeroPartiteAttese).fill(null);

        accoppiamenti.forEach((match) => {
            const matchDiv = document.createElement("div");
            matchDiv.className = "torneo-bracket-match";

            if (!match) {
                matchDiv.innerHTML = `<div class="torneo-bracket-empty">IN ATTESA DEL TURNO PRECEDENTE</div>`;
                binarioPartite.appendChild(matchDiv);
                return;
            }

            const renderSquadra = (squadra, eVincitore) => {
                const eMia = squadra.uid === window.utenteUID;
                const punteggio = getPunteggioTabellone(match, squadra);
                return `
                    <div class="torneo-bracket-team${eMia ? " is-you" : ""}${eVincitore ? " is-winner" : ""}">
                        <span>${squadra.nome}${eMia ? " ★" : ""}</span>
                        <strong>${punteggio}</strong>
                    </div>
                `;
            };

            if (match.completata && match.vincitore) {
                const eVincitore1 = match.vincitore.uid === match.squadra1.uid;
                matchDiv.innerHTML = `
                    ${renderSquadra(match.squadra1, eVincitore1)}
                    <div class="torneo-bracket-vs">VS</div>
                    ${renderSquadra(match.squadra2, !eVincitore1)}
                    <div class="torneo-bracket-result">VINCE: ${match.vincitore.nome}</div>
                `;
            } else {
                matchDiv.innerHTML = `
                    ${renderSquadra(match.squadra1, false)}
                    <div class="torneo-bracket-vs">VS</div>
                    ${renderSquadra(match.squadra2, false)}
                    <div class="torneo-bracket-result is-pending">IN ATTESA...</div>
                `;
            }

            binarioPartite.appendChild(matchDiv);
        });

        colonnaFase.appendChild(binarioPartite);
        container.appendChild(colonnaFase);
        numeroPartiteAttese = Math.max(1, Math.ceil(numeroPartiteAttese / 2));
    });

    requestAnimationFrame(() => disegnaConnettoriTabellone(container));
}


// Mostra risultato finale del torneo
function mostraRisultatoFinaleTorneo(esito) {
    // Nascondi tutte le schermate
    nascondiTutteLeSchermate1v1Extra();
    [schermataMenu, schermataModulo, schermataGioco, schermataScelta1v1, schermataLobbyOnline1v1,
     schermataLobbyAmico1v1, schermataSceltaTorneo, schermataSetupTorneo, schermataEntraTorneo,
     schermataLobbyTorneo, document.getElementById("schermata-torneo-draft"),
     document.getElementById("schermata-torneo-simulazione")
    ].forEach(s => { if (s) s.style.display = "none"; });

    const vistaTabellone = document.getElementById("vista-tabellone-torneo");
    if (vistaTabellone) vistaTabellone.style.display = "none";
    statoSimulazioneTorneo.vistaTabelloneAttiva = false;
    
    document.getElementById("schermata-torneo-risultato").style.display = "block";
    
    // Hero section
    const hero = document.getElementById("risultato-torneo-hero");
    const trophy = document.getElementById("risultato-torneo-trophy");
    const titolo = document.getElementById("risultato-torneo-titolo");
    const sub = document.getElementById("risultato-torneo-sub");
    
    if (esito === "vincitore") {
        trophy.textContent = "🏆";
        titolo.textContent = "CAMPIONE DEL TORNEO!";
        sub.textContent = `${statoTorneo.mioNickname} ha conquistato il torneo!`;
        hero.style.background = "linear-gradient(135deg, #1a1a00, #2a2000)";
        hero.style.borderBottom = "2px solid var(--accento-juve)";
    } else {
        trophy.textContent = "🥈";
        titolo.textContent = "ELIMINATO";
        const faseEliminazione = getNomeFaseVisivo(statoSimulazioneTorneo.faseCorrente);
        sub.textContent = `Eliminato a: ${faseEliminazione}`;
        hero.style.background = "linear-gradient(135deg, #1a0000, #200000)";
        hero.style.borderBottom = "2px solid #f44336";
    }
    
    // Podio (simula classifica finale)
    const podio = document.getElementById("torneo-risultato-podio");
    podio.innerHTML = "";
    
    const posizioniPodio = [
        { pos: "🥇", nome: esito === "vincitore" ? statoTorneo.mioNickname : "Vincitore Torneo", colore: "#ffd700" },
        { pos: "🥈", nome: "Finalista", colore: "#c0c0c0" },
        { pos: "🥉", nome: "Semifinalista 1", colore: "#cd7f32" },
        { pos: "4°", nome: "Semifinalista 2", colore: "#888" }
    ];
    
    const tabellonePodio = statoSimulazioneTorneo.tabellone;
    const finalePodio = tabellonePodio?.accoppiamenti?.finale?.[0];
    if (finalePodio && !finalePodio.vincitore) {
        finalePodio.vincitore = determinaVincitoreStimatoTorneo(finalePodio, "finale");
        finalePodio.completata = true;
    }
    const campionePodio = finalePodio?.vincitore || null;
    const finalistaPodio = finalePodio
        ? (finalePodio.squadra1.uid === campionePodio?.uid ? finalePodio.squadra2 : finalePodio.squadra1)
        : null;
    const semifinalistiEliminati = (tabellonePodio?.accoppiamenti?.semifinali || []).map(partita => {
        const vincitore = partita.vincitore || determinaVincitoreStimatoTorneo(partita, "semifinali");
        return partita.squadra1.uid === vincitore.uid ? partita.squadra2 : partita.squadra1;
    }).sort((a, b) => (b.forza || 0) - (a.forza || 0));
    posizioniPodio.splice(0, posizioniPodio.length,
        { pos: "1°", nome: campionePodio?.nome || "-", colore: "#ffd700" },
        { pos: "2°", nome: finalistaPodio?.nome || "-", colore: "#c0c0c0" },
        { pos: "3°", nome: semifinalistiEliminati[0]?.nome || "-", colore: "#cd7f32" },
        { pos: "4°", nome: semifinalistiEliminati[1]?.nome || "-", colore: "#888" }
    );

    posizioniPodio.forEach(p => {
        const div = document.createElement("div");
        div.style.cssText = `display:flex;align-items:center;gap:12px;padding:10px;background:#1a1a1a;border-radius:6px;border-left:3px solid ${p.colore};`;
        div.innerHTML = `
            <span style="font-size:1.5rem;">${p.pos}</span>
            <span style="color:${p.nome === statoTorneo.mioNickname ? 'var(--accento-juve)' : '#fff'};font-weight:${p.nome === statoTorneo.mioNickname ? 'bold' : 'normal'};font-size:1rem;">${p.nome}</span>
        `;
        podio.appendChild(div);
    });
    
    // Percorso
    const percorso = document.getElementById("torneo-risultato-percorso");
    percorso.innerHTML = "";
    
    statoSimulazioneTorneo.mioPercorso.forEach(partita => {
        const div = document.createElement("div");
        const colore = partita.vinta ? "#4caf50" : "#f44336";
        div.style.cssText = `padding:10px;background:#1a1a1a;border-radius:4px;border-left:3px solid ${colore};margin-bottom:8px;`;
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="color:#888;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;">${getNomeFaseVisivo(partita.fase)}</div>
                    <div style="color:#fff;font-size:0.9rem;margin-top:2px;">vs ${partita.avversario}</div>
                </div>
                <div style="text-align:right;">
                    <div style="color:${colore};font-weight:bold;font-size:1.1rem;font-family:'Bebas Neue',sans-serif;">${partita.risultato}</div>
                    <div style="color:${colore};font-size:0.75rem;">${partita.vinta ? 'VITTORIA' : 'SCONFITTA'}</div>
                </div>
            </div>
        `;
        percorso.appendChild(div);
    });
    
    // Statistiche
    const stats = document.getElementById("torneo-risultato-stats");
    stats.innerHTML = "";
    
    const vittorie = statoSimulazioneTorneo.mioPercorso.filter(p => p.vinta).length;
    const partiteGiocate = statoSimulazioneTorneo.mioPercorso.length;
    const faseRaggiunta = statoSimulazioneTorneo.faseCorrente;
    
    const stat = (label, valore, colore = "#fff") => `
        <div style="background:#1a1a1a;border:1px solid #222;border-radius:6px;padding:12px;text-align:center;">
            <div style="color:#666;font-size:0.7rem;font-weight:600;letter-spacing:1px;">${label}</div>
            <div style="color:${colore};font-size:1.6rem;font-family:'Bebas Neue',sans-serif;margin-top:4px;">${valore}</div>
        </div>
    `;
    
    stats.innerHTML = 
        stat("PARTITE", partiteGiocate, "#fff") +
        stat("VITTORIE", vittorie, "#4caf50") +
        stat("FASE FINALE", getNomeFaseVisivo(faseRaggiunta).split(" ")[0].toUpperCase(), "var(--accento-juve)") +
        stat("MODULO", statoTorneo.mioModulo || "-", "#888");
}

