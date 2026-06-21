let squadra = [];
let statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: 0 };
let forzaAttuale = 0;
let inFaseMercato = false;
let modalitaSelezionata = "";
let allenatoreSelezionato = null;
const MAX_GIOCATORI = 11;
let rerollDisponibili = 3;
let slotAttivo = null; // Traccia quale posizione sul campo l'utente ha cliccato

const schermataMenu = document.getElementById("schermata-iniziale");
const schermataModulo = document.getElementById("schermata-modulo");
const schermataGioco = document.getElementById("schermata-gioco");
const areaDraft = document.getElementById("area-draft");
const testoRuolo = document.getElementById("testo-ruolo");

// Aggancia i pulsanti (NUOVI)
const btnReroll = document.querySelector(".btn-usa-reroll");
const btnStagione = document.querySelector(".btn-completa-stagione");

// Configurazione esatta per ogni modulo
const configurazioneModuli = {
    "4-3-3": [
        { rep: "att", ruoli: ["AS", "ATT", "AD"] },
        { rep: "cen", ruoli: ["CC", "CDC", "CC"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "4-4-2": [
        { rep: "att", ruoli: ["ATT", "ATT"] },
        { rep: "cen", ruoli: ["ES", "CC", "CC", "ED"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "3-5-2": [
        { rep: "att", ruoli: ["ATT", "ATT"] },
        { rep: "cen", ruoli: ["ES", "CC", "CDC", "CC", "ED"] },
        { rep: "dif", ruoli: ["DC", "DC", "DC"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "4-2-3-1": [
        { rep: "att", ruoli: ["ATT"] },
        { rep: "cen", ruoli: ["ES", "COC", "ED"] },
        { rep: "cen", ruoli: ["CDC", "CDC"] },
        { rep: "dif", ruoli: ["TS", "DC", "DC", "TD"] },
        { rep: "por", ruoli: ["POR"] }
    ],
    "3-4-2-1": [
        { rep: "att", ruoli: ["ATT"] },
        { rep: "cen", ruoli: ["COC", "COC"] },
        { rep: "cen", ruoli: ["ES", "CC", "CC", "ED"] },
        { rep: "dif", ruoli: ["DC", "DC", "DC"] },
        { rep: "por", ruoli: ["POR"] }

    ]
};

// 1. Dal Menu alla Scelta Modulo
function avviaSceltaModulo(modalita) {
    modalitaSelezionata = modalita; // Salva la modalità scelta
    schermataMenu.style.display = "none";
    schermataModulo.style.display = "block";
}

// 2. Dal Modulo al Campo
function impostaModulo(modulo) {
    // 1. Costruisci fisicamente gli slot sul campo
    costruisciCampo(modulo);
    
    // 2. Aggiorna i testi del Recap a sinistra e della Headbar in alto
    document.getElementById("recap-modalita").innerText = modalitaSelezionata.toUpperCase();
    document.getElementById("badge-modalita-live").innerText = modalitaSelezionata.toUpperCase();
    document.getElementById("recap-modulo").innerText = modulo;
    
    // 3. Esegui la transizione visiva delle schermate
    schermataModulo.style.display = "none";
    schermataGioco.style.display = "block";

    // 4. Setup iniziale del Draft (Pulsante e Istruzioni)
    btnReroll.innerText = `USA REROLL (${rerollDisponibili})`;
    
    // Rimuoviamo l'event listener prima di riaggiungerlo per evitare bug se l'utente riavvia la partita
    btnReroll.removeEventListener("click", usaReroll);
    btnReroll.addEventListener("click", usaReroll);
    
    testoRuolo.innerText = "...";
    areaDraft.innerHTML = "<p style='color:#666; text-align:center; width:100%; margin-top:20px;'>Tocca un ruolo vuoto sul campo per iniziare il draft.</p>";

    // NUOVA LOGICA: Se siamo ne "La Risalita", metti in campo i 4 fedelissimi
    if (modalitaSelezionata === 'risalita') {
        precompilaFedelissimi();
    }
}

// 3. Costruzione visiva del campo
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
            slot.dataset.ruolo = ruolo; // Salva il ruolo esatto nascosto nell'HTML
            slot.innerHTML = `<span class="ruolo-label">${ruolo}</span>`;
            
            // Assegna il click al singolo slot
            slot.addEventListener("click", () => avviaTurnoDraftManuale(slot));
            
            divReparto.appendChild(slot);
        });
        
        campo.appendChild(divReparto);
    });
}

// 4. Utente clicca uno slot vuoto
function avviaTurnoDraftManuale(elementoSlot) {
    // Se è già occupato non fare nulla
    if (elementoSlot.classList.contains("occupato")) return;

    // Togli lo stato attivo agli altri slot
    document.querySelectorAll(".slot").forEach(s => s.classList.remove("active-slot"));
    
    // Rendi attivo quello cliccato
    slotAttivo = elementoSlot;
    slotAttivo.classList.add("active-slot");

    const ruoloRichiesto = slotAttivo.dataset.ruolo;
    testoRuolo.innerText = ruoloRichiesto;

    generaCarteDraft(ruoloRichiesto);
}

// 5. Generazione Carte Draft
function generaCarteDraft(ruoloRichiesto) {
    areaDraft.innerHTML = "";

    // Filtra per ruolo e scarta chi è già stato draftato
    let opzioni = databaseJuve.filter(g => g.ruolo === ruoloRichiesto && !squadra.some(s => s.id === g.id));
    
    // --- NUOVA LOGICA "LA RISALITA" (Giocatori < 80 di rating) ---
    if (modalitaSelezionata === 'risalita') {
        let opzioniScadenti = opzioni.filter(g => g.rating < 80);
        if (opzioniScadenti.length > 0) {
            opzioni = opzioniScadenti.sort(() => 0.5 - Math.random());
        } else {
            // Fallback: se in quel ruolo non ci sono abbastanza scarsi, prendi i peggiori disponibili
            opzioni = opzioni.sort((a, b) => a.rating - b.rating);
        }
    } else {
        opzioni = opzioni.sort(() => 0.5 - Math.random());
    }

    // Prendi solo 3 carte
    opzioni = opzioni.slice(0, 3);

    opzioni.forEach((giocatore, index) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");
        cartaDiv.style.animationDelay = `${index * 0.1}s`; // Effetto di comparsa sfalsato
        cartaDiv.innerHTML = `
            <div class="carta-info">
                <h3 style="margin:0; font-size:1.4rem;">${giocatore.nome}</h3>
                <p style="margin:0; color:#888;">${giocatore.ruolo} • ${giocatore.stagione}</p>
            </div>
            <div class="rating-numero" style="font-size:2.5rem;">${giocatore.rating}</div>
        `;
        cartaDiv.addEventListener("click", () => scegliGiocatore(giocatore));
        areaDraft.appendChild(cartaDiv);
    });
}

// 6. Funzione Reroll
function usaReroll() {
    if (!slotAttivo) {
        alert("Seleziona prima uno slot sul campo!");
        return;
    }

    if (rerollDisponibili > 0) {
        rerollDisponibili--; // Scala di 1
        
        // Aggiorna il testo del bottone
        btnReroll.innerText = `USA REROLL (${rerollDisponibili})`;
        
        // Aggiorna il contatore nell'headbar in alto
        document.getElementById("headbar-reroll-count").innerText = rerollDisponibili;
        
        // Se arrivi a 0, disabilita graficamente e funzionalmente il bottone
        if (rerollDisponibili === 0) {
            btnReroll.style.opacity = "0.3";
            btnReroll.style.cursor = "not-allowed";
            btnReroll.disabled = true;
        }
        
        // Rigenera le carte per quello specifico ruolo
        generaCarteDraft(slotAttivo.dataset.ruolo);
    }
}

// 7. Selezione Giocatore e posizionamento
function scegliGiocatore(giocatoreScelto) {
    if (!slotAttivo) return;

    squadra.push(giocatoreScelto);
    
    // Aggiorna lo slot
    slotAttivo.classList.remove("active-slot");
    slotAttivo.classList.add("occupato");
    slotAttivo.innerHTML = `
        <span style="color:var(--accento-juve); font-family:'Bebas Neue', sans-serif; font-size:1.5rem;">${giocatoreScelto.rating}</span>
        <span style="color:#fff; font-size:0.7rem; font-weight:bold; text-align:center;">${giocatoreScelto.nome.toUpperCase()}</span>
    `;
    slotAttivo.style.border = "1px solid var(--accento-juve)";
    slotAttivo.style.background = "rgba(0,0,0,0.8)";
    slotAttivo.style.cursor = "default";

    // Pulisci l'area draft e attendi il prossimo click
    slotAttivo = null;
    testoRuolo.innerText = "...";
    btnStagione.innerText = `VIA ALLA STAGIONE (${squadra.length}/${MAX_GIOCATORI})`;
    areaDraft.innerHTML = "<p style='color:#888; text-align:center; width:100%;'>Tocca il prossimo ruolo sul campo.</p>";

    // Controllo fine draft Giocatori
    if (squadra.length === MAX_GIOCATORI) {
        areaDraft.innerHTML = "<h3 style='color:var(--accento-juve); text-align:center; width:100%; margin-top:20px;'>SQUADRA COMPLETATA</h3><p style='color:#666; text-align:center; font-size:0.8rem;'>Procedi con la scelta del Mister</p>";
        btnStagione.disabled = false;
        btnStagione.classList.add("attivo");
        btnStagione.innerText = "SCEGLI ALLENATORE";
        btnStagione.onclick = avviaDraftAllenatore; // Associa il click alla nuova funzione
    }
}

// 8. Generazione Carte Allenatore
function avviaDraftAllenatore() {
    testoRuolo.innerText = "ALLENATORE";
    areaDraft.innerHTML = "";
    
    // Nascondiamo il bottone Reroll (le scelte mister sono definitive!)
    document.querySelector(".btn-usa-reroll").style.display = "none";
    
    // Aggiorniamo il bottone principale
    btnStagione.disabled = true;
    btnStagione.classList.remove("attivo");
    btnStagione.innerText = "ATTESA SCELTA...";

    // Estrai 3 allenatori casuali
    let opzioni = databaseAllenatori.sort(() => 0.5 - Math.random()).slice(0, 3);

    opzioni.forEach((mister, index) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");
        cartaDiv.style.animationDelay = `${index * 0.1}s`;
        
        // Coloriamo il modificatore di verde se positivo, rosso se negativo
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

// 9. Selezione Allenatore
function scegliAllenatore(mister) {
    allenatoreSelezionato = mister;

    // Aggiorna il pannello Recap di sinistra
    document.getElementById("recap-allenatore").innerText = mister.nome;

    // Aggiorna l'area Draft con un resoconto
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

    // Attiva il pulsante per la simulazione finale
    // Dentro la funzione scegliAllenatore(mister)
    btnStagione.disabled = false;
    btnStagione.classList.add("attivo");
    btnStagione.innerText = "SIMULA STAGIONE";

    // NUOVA LOGICA: Controllo diramazione modalità
    btnStagione.onclick = () => {
        if (modalitaSelezionata === 'champions') {
            simulaChampionsLeague();
        } else if (modalitaSelezionata === 'risalita') {
            simulaSerieB();
        } else {
            simulaStagioneFinale();
        }
    };
}

// ==========================================================================
// VARIABILI GLOBALI DI SIMULAZIONE E MERCATO
// ==========================================================================
// RIMOSSE LE DUE RIGHE CON "let statsStagione" e "let forzaAttuale"
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
    // Passaggio di schermata pulito
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";

    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()} (${allenatoreSelezionato.modificatore >= 0 ? '+' : ''}${allenatoreSelezionato.modificatore})`;

    // Calcolo Forza della squadra (Media giocatori + bonus allenatore)
    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    // Inizializza Classifica Campionato
    classificaSerieA = [{ nome: "Juventus (Tu)", punti: 0, v: 0, p: 0, s: 0, forza: forzaAttuale }];
    
    // Definiamo la forza base storica delle squadre
    const forzaStorica = {
        "Inter": 88, "Milan": 86, "Napoli": 85, "Atalanta": 84, "Roma": 83, "Lazio": 82,
        "Fiorentina": 80, "Torino": 78, "Bologna": 78, "Udinese": 76, "Sampdoria": 75,
        "Genoa": 75, "Verona": 74, "Cagliari": 73, "Lecce": 72, "Empoli": 72,
        "Monza": 73, "Venezia": 70, "Parma": 71
    };

    squadreSerieA.forEach(squadraNome => {
        let base = forzaStorica[squadraNome] || 75;
        // Aggiungiamo un piccolo margine randomico (-2 a +3) per simulare sorprese stagionali
        let forzaVariabile = base + Math.floor(Math.random() * 6) - 2; 
        classificaSerieA.push({ nome: squadraNome, punti: 0, v: 0, p: 0, s: 0, forza: forzaVariabile });
    });

    // Pulisci i gol dei tuoi giocatori
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
        
        // Scegli un avversario random per questa giornata (escludendo la Juve)
        let indiceAvversario = (giornataAttuale - 1) % squadreSerieA.length;
        let avversarioOggi = squadreSerieA[indiceAvversario];

        // Trova l'oggetto dell'avversario in classifica per calcolare il match
        let datiAvversario = classificaSerieA.find(s => s.nome === avversarioOggi);

        // Calcolo Gol in base al differenziale di forza delle due squadre
        let diff = forzaAttuale - datiAvversario.forza;
        let baseGolJuve = Math.max(0, Math.floor(Math.random() * 3) + (diff > 5 ? 1 : 0));
        let baseGolAvv = Math.max(0, Math.floor(Math.random() * 3) + (diff < -5 ? 1 : 0));

        // Aggiorna Record Juve
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

        // Assegnazione Marcatori per la Juve se ha segnato
        let chiHaSegnato = [];
        for (let i = 0; i < baseGolJuve; i++) {
            let estrattore = Math.random();
            let tiratori = [];
    
            // Fix dei ruoli: mappiamo i ruoli reali del database giocatori
            if (estrattore < 0.75) {
                // 75% dei gol divisi tra TUTTO il reparto offensivo (ATT, Ali AS/AD e Trequartisti COC)
                tiratori = squadra.filter(g => ["ATT", "AS", "AD", "COC"].includes(g.ruolo));
            } else if (estrattore < 0.95) {
                // 20% ai centrocampisti (CC, CDC, ED, ES)
                tiratori = squadra.filter(g => ["CC", "CDC", "ED", "ES"].includes(g.ruolo));
            } else {
                // 5% ai difensori (DC, TD, TS)
            tiratori = squadra.filter(g => ["DC", "TD", "TS"].includes(g.ruolo));
            }

            // Fallback di sicurezza: se un reparto è vuoto, pesca dalla rosa escludendo TASSATIVAMENTE il portiere ("POR")
            if (tiratori.length === 0) {
                tiratori = squadra.filter(g => g.ruolo !== "POR");
            }
    
            let marcatoreScelto = tiratori[Math.floor(Math.random() * tiratori.length)];
    
            registroGolMarcatori[marcatoreScelto.nome]++;
            chiHaSegnato.push(marcatoreScelto.nome);
        }

        // Simula le altre partite in background basandosi sulla FORZA REALE delle squadre
        classificaSerieA.forEach(s => {
            if (s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi) {
                // Forza media del campionato ~78. Modifichiamo le probabilità in base alla forza della squadra.
                // Più una squadra è forte, più la sua probabilità di vittoria sale matematicamente.
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

        // Riordina Classifica
        classificaSerieA.sort((a, b) => b.punti - a.punti);
        aggiornaClassificaLiveUI();

        // Aggiorna l'interfaccia centrale
        let stringaMarcatori = chiHaSegnato.length > 0 ? ` (${chiHaSegnato.join(", ")})` : "";
        ticker.innerHTML = `<div style="text-align:center;">
            <span style="font-size:0.9rem; color:#888; display:block;">RISULTATO LIVE</span>
            <strong>Juventus ${baseGolJuve} - ${baseGolAvv} ${avversarioOggi}</strong>
            <span style="font-size:0.8rem; color:var(--accento-juve); display:block; margin-top:5px;">${stringaMarcatori}</span>
        </div>`;

        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; padding-bottom:4px;">
                <span style="color:#666; width:70px;">Giar. ${giornataAttuale}</span>
                <span style="flex:1; text-align:left;">vs ${avversarioOggi}</span>
                <span style="font-weight:bold; color:${baseGolJuve >= baseGolAvv ? (baseGolJuve === baseGolAvv ? '#ffeb3b' : '#4caf50') : '#f44336'}">${baseGolJuve} - ${baseGolAvv}</span>
            </div>
        ` + cronologia.innerHTML;

        giornataAttuale++;
    }, 400); // Velocità di scorrimento delle giornate
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
// 12. PAUSA DI GENNAIO: INTERFACCIA E LOGICA DI SCAMBIO
// ==========================================================================
function mostraMercatoGennaio() {
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
        btnG.onclick = () => generaOpzioniAcquisto(index);
        containerTaglio.appendChild(btnG);
    });
}

function generaOpzioniAcquisto(indexGiocatoreDaTagliare) {
    let tagliato = squadra[indexGiocatoreDaTagliare];
    
    // Filtra il database storico per trovare giocatori dello stesso identico ruolo non presenti in squadra
    let opzioniCompatibili = databaseJuve.filter(g => g.ruolo === tagliato.ruolo && !squadra.some(s => s.id === g.id));
    
    // Se non bastano, allarga la ricerca
    if (opzioniCompatibili.length < 3) opzioniCompatibili = databaseJuve.filter(g => g.ruolo === tagliato.ruolo);
    
    // Pesca 3 svincolati a caso
    let treProposte = opzioniCompatibili.sort(() => 0.5 - Math.random()).slice(0, 3);

    let ticker = document.getElementById("ticker-match-live");
    ticker.innerHTML = `<div style="width:100%;">
        <p style="margin:0 0 10px 0; font-size:0.9rem; text-align:center; color:var(--accento-juve);">Sostituto per ${tagliato.nome}: Scegli chi acquistare</p>
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
            // Effettua la sostituzione strutturale nel vettore squadra
            squadra[indexGiocatoreDaTagliare] = nuovoG;
            delete registroGolMarcatori[tagliato.nome];
            registroGolMarcatori[nuovoG.nome] = 0;

            // Ricalcola istantaneamente il peso e la forza aggiornata del collettivo
            let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
            forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;
            classificaSerieA.find(s => s.nome === "Juventus (Tu)").forza = forzaAttuale;

            alert(`Acquisto Completato! Entra in squadra ${nuovoG.nome}.`);
            continuaCampionatoRitorno();
        };
        boxAcquisti.appendChild(divCarta);
    });
}

function continuaCampionatoRitorno() {
    document.getElementById("box-controlli-sim").innerHTML = "";
    avviaLoopCampionato(20, 38, mostraFineCampionatoCompleta);
}

// ==========================================================================
// 13. COMPILAZIONE SCHERMATA RECAP FINALE
// ==========================================================================
function mostraFineCampionatoCompleta() {
    document.getElementById("schermata-simulazione").style.display = "none";
    document.getElementById("schermata-recap").style.display = "block";

    // 1. Inietta il commento personalizzato della dirigenza
    let commentoBox = document.getElementById("commento-dirigenza");
    let pt = statsStagione.punti;
    if (pt >= 90) {
        commentoBox.innerHTML = `🏆 <strong>LEGGENDA BIANCONERA!</strong> Hai dominato la Serie A totalizzando ben ${pt} punti. Questo scudetto entra di diritto nella storia del club. La dirigenza è estasiata!`;
    } else if (pt >= 76) {
        commentoBox.innerHTML = `⭐ <strong>ZONA CHAMPIONS CONQUISTATA.</strong> Ottimo lavoro...`;
    } else if (pt >= 60) {
        commentoBox.innerHTML = `😐 <strong>STAGIONE ALTALENANTE.</strong> Chiusura a metà classifica con ${pt} punti. Troppi passi falsi e manovra a tratti prevedibile. Serve rifondare.`;
    } else {
        commentoBox.innerHTML = `📉 <strong>DISASTRO ESONERO!</strong> Chiudere la stagione della Juventus con così pochi punti è inaccettabile. I tifosi contestano e la società ti solleva dall'incarico.`;
    }

    // 2. Compila la tabella di classifica reale
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

    // 3. Compila i blocchi numerici del rendimento Juve
    let statsBox = document.getElementById("stats-riepilogo-juve");
    statsBox.innerHTML = `
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:var(--accento-juve);">${statsStagione.punti}</span><p style="margin:0; font-size:0.7rem; color:#888;">PUNTI TOTALI</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#4caf50;">${statsStagione.vittorie}</span><p style="margin:0; font-size:0.7rem; color:#888;">VITTORIE</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#fff;">${statsStagione.golFatti}</span><p style="margin:0; font-size:0.7rem; color:#888;">GOL FATTI</p></div>
        <div style="background:#1a1a1a; padding:10px; border-radius:6px;"><span style="font-size:1.8rem; font-family:'Bebas Neue'; color:#f44336;">${statsStagione.golSubiti}</span><p style="margin:0; font-size:0.7rem; color:#888;">GOL SUBITI</p></div>
    `;

    // 4. Compila la classifica cannonieri interna ordinata per gol descrescenti
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

// Variabile globale per sapere a cosa stiamo giocando
modalitaSelezionata = 'classica';

// Funzione 1: Nasconde la Home e mostra il selettore
function mostraSchermataModalita() {
    const screenHome = document.getElementById('screen-home');
    const screenModalita = document.getElementById('screen-modalita');

    // 1. Nascondiamo la schermata iniziale
    screenHome.classList.add('nascosto');
    
    // 2. Mostriamo la schermata delle modalità
    screenModalita.classList.remove('nascosto');
    
    // 3. Aggiungiamo l'animazione di entrata
    screenModalita.classList.add('fade-in');
}

// Funzione 2: Salva la scelta, nasconde il selettore e avvia i moduli
function impostaModalitaEAvvia(scelta) {
    console.log("Modalità scelta dall'utente:", scelta);
    modalitaSelezionata = scelta;
    
    // Nascondi la schermata delle modalità
    document.getElementById('screen-modalita').classList.add('nascosto');
    
    // Richiama la tua funzione nativa per mostrare i moduli
    if (typeof avviaSceltaModulo === 'function') {
        avviaSceltaModulo(scelta);
    } else {
        console.error("ERRORE: La funzione 'avviaSceltaModulo' non è stata trovata in script.js!");
    }
}

// ==========================================================================
// DATABASE CHAMPIONS LEAGUE DA 36 SQUADRE DIVISE IN 4 FASCE
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
}; // 35 squadre totali. La 36esima sarà la tua Juventus.

let classificaEuropa = [];
let qualificatiOttaviDiretti = [];
let qualificatiSpareggi = [];
let superstitiChampions = []; // Conterrà le squadre via via ancora in corsa nella fase finale

// 1. GENERAZIONE CALENDARIO BILANCIATO PER LA JUVE
function generaCalendarioChampionsJuve() {
    // Pesca 2 squadre casuali da ciascuna delle 4 fasce
    let a = [...squadreChampionsTiers.alta].sort(() => 0.5 - Math.random()).slice(0, 2);
    let ma = [...squadreChampionsTiers.medioAlta].sort(() => 0.5 - Math.random()).slice(0, 2);
    let mb = [...squadreChampionsTiers.medioBassa].sort(() => 0.5 - Math.random()).slice(0, 2);
    let b = [...squadreChampionsTiers.bassa].sort(() => 0.5 - Math.random()).slice(0, 2);
    
    // Unisce le 8 avversarie e le mescola per non giocarle in ordine fisso di fascia
    return [...a, ...ma, ...mb, ...b].sort(() => 0.5 - Math.random());
}

// 2. AVVIO E COSTRUZIONE DELLA CLASSIFICA INIZIALE
function simulaChampionsLeague() {
    statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: 0, golFatti: 0, golSubiti: 0 };
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";
    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()}`;

    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    // Crea la classifica con tutte e 36 le squadre partecipanti
    classificaEuropa = [{ nome: "Juventus (Tu)", punti: 0, v: 0, p: 0, s: 0, golFatti: 0, golSubiti: 0, diffReti: 0, forza: forzaAttuale }];
    
    Object.keys(squadreChampionsTiers).forEach(fascia => {
        squadreChampionsTiers[fascia].forEach(s => {
            classificaEuropa.push({ 
                nome: s.nome, punti: 0, v: 0, p: 0, s: 0, golFatti: 0, golSubiti: 0, diffReti: 0, 
                forza: s.forza + (Math.floor(Math.random() * 5) - 2) // Piccolo modificatore di forma casuale iniziale
            });
        });
    });

    let calendarioJuve = generaCalendarioChampionsJuve();
    aggiornaClassificaChampionsUI();
    
    // Fa partire il simulatore delle 8 giornate
    avviaGironeChampions(1, 8, calendarioJuve, calcolaEsitoGirone);
}

// 3. MOTORE DI SIMULAZIONE DEL GIRONE UNICO (8 GIORNATE COMPRESE LE ALTRE 34 SQUADRE)
function avviaGironeChampions(giornataAttuale, maxGiornate, calendarioJuve, callbackFine) {
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");
    let boxControlli = document.getElementById("box-controlli-sim");
    boxControlli.innerHTML = ""; // Disabilita i tasti durante la simulazione

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

        // A. SIMULAZIONE MATCH DELLA JUVENTUS
        let diffJuve = forzaAttuale - avvObj.forza;
        let golJuve = Math.max(0, Math.floor(Math.random() * 3) + (diffJuve > 5 ? 1 : 0) + (diffJuve > 12 ? 1 : 0));
        let golAvv = Math.max(0, Math.floor(Math.random() * 3) + (diffJuve < -5 ? 1 : 0) + (diffJuve < -12 ? 1 : 0));

        juveObj.golFatti += golJuve; juveObj.golSubiti += golAvv; juveObj.diffReti += (golJuve - golAvv);
        avvObj.golFatti += golAvv; avvObj.golSubiti += golJuve; avvObj.diffReti += (golAvv - golJuve);

        if (golJuve > golAvv) {
            juveObj.punti += 3; juveObj.v++; avvObj.s++;
        } else if (golJuve === golAvv) {
            juveObj.punti += 1; juveObj.p++; avvObj.punti += 1; avvObj.p++;
        } else {
            juveObj.s++; avvObj.punti += 3; avvObj.v++;
        }

        // B. ACCOPPIAMENTO CASUALE E SIMULAZIONE DELLE ALTRE 34 SQUADRE RIMASTE
        let squadreRimaste = classificaEuropa.filter(s => s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi);
        squadreRimaste.sort(() => 0.5 - Math.random()); // Mescola per generare i match del giorno

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

        // C. RE-ORDINAMENTO REALE DELLA CLASSIFICA GENERALE (Punti -> DR -> Gol Segnati)
        classificaEuropa.sort((a, b) => {
            if (b.punti !== a.punti) return b.punti - a.punti;
            if (b.diffReti !== a.diffReti) return b.diffReti - a.diffReti;
            return b.golFatti - a.golFatti;
        });

        // D. AGGIORNAMENTO UI
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

// 4. RENDERING GRAFICO AVANZATO DELLA CLASSIFICA CON FASCE DI COLORE
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
        
        // Bordini colorati per rispecchiare i regolamenti UEFA
        if (idx < 8) riga.style.borderLeft = "4px solid #4caf50";       // 1-8: Ottavi diretti (Verde)
        else if (idx < 24) riga.style.borderLeft = "4px solid #ffeb3b"; // 9-24: Spareggi (Giallo)
        else riga.style.borderLeft = "4px solid #f44336";               // 25-36: Eliminati (Rosso)
        
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

// 5. STILAZIONE DEI VERDETTI DI FINE GIRONE
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

// ==========================================================================
// 6. LOGICA DI GESTIONE DEI KNOCKOUT (ANDATA E RITORNO, FINALE SECCA)
// ==========================================================================

// Simulazione per le altre squadre in background
function simulaMatchInvisibile(s1, s2, isFinale = false) {
    let diff = s1.forza - s2.forza;
    
    if (isFinale) {
        // Gara secca
        let g1 = Math.max(0, Math.floor(Math.random() * 4) + (diff > 6 ? 1 : 0));
        let g2 = Math.max(0, Math.floor(Math.random() * 4) + (diff < -6 ? 1 : 0));
        if (g1 === g2) return Math.random() > 0.5 ? s1 : s2;
        return g1 > g2 ? s1 : s2;
    } else {
        // Doppio confronto (Andata + Ritorno)
        let g1_andata = Math.max(0, Math.floor(Math.random() * 4) + (diff > 6 ? 1 : 0));
        let g2_andata = Math.max(0, Math.floor(Math.random() * 4) + (diff < -6 ? 1 : 0));
        
        let g1_ritorno = Math.max(0, Math.floor(Math.random() * 4) + (diff > 6 ? 1 : 0));
        let g2_ritorno = Math.max(0, Math.floor(Math.random() * 4) + (diff < -6 ? 1 : 0));
        
        let tot1 = g1_andata + g1_ritorno;
        let tot2 = g2_andata + g2_ritorno;
        
        if (tot1 === tot2) return Math.random() > 0.5 ? s1 : s2; // Risoluzione rigori
        return tot1 > tot2 ? s1 : s2;
    }
}

// Simulazione visiva per i match della Juventus
function simulaMatchVisibile(avversario, nomeFase) {
    let diff = forzaAttuale - avversario.forza;
    let ticker = document.getElementById("ticker-match-live");
    let cronologia = document.getElementById("cronologia-partite");
    let boxControlli = document.getElementById("box-controlli-sim");
    
    if (nomeFase === 'FINALE') {
        // Gara Secca per la Finale
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
        // Andata e Ritorno per tutti gli altri turni
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
        
        // Rendering grafico avanzato a due righe per mostrare i parziali di andata/ritorno
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

// ==========================================================================
// 7. SCENARIO A: LA JUVE SALTA GLI SPAREGGI E ATTENDE CHI PASSA
// ==========================================================================
function simulaSpareggiSenzaJuve() {
    let teamPlayoff = [...qualificatiSpareggi].sort(() => 0.5 - Math.random());
    let vincenti = [];
    for(let i = 0; i < teamPlayoff.length; i += 2) {
        vincenti.push(simulaMatchInvisibile(teamPlayoff[i], teamPlayoff[i+1], false));
    }
    superstitiChampions = [...qualificatiOttaviDiretti, ...vincenti];
    avviaFaseEliminatoria('Ottavi di Finale');
}

// ==========================================================================
// 8. SCENARIO B: LA JUVE PARTECIPA ATTIVAMENTE AGLI SPAREGGI (ANDATA E RITORNO)
// ==========================================================================
function avviaSpareggioJuve() {
    document.getElementById("giornata-corrente").innerText = "SPAREGGI PLAYOFF";
    let teamPlayoff = [...qualificatiSpareggi].filter(s => s.nome !== "Juventus (Tu)");
    
    // Sorteggio avversario Juve
    let indexAvv = Math.floor(Math.random() * teamPlayoff.length);
    let avversario = teamPlayoff[indexAvv];
    teamPlayoff.splice(indexAvv, 1); 
    
    // Simula gli altri spareggi in background
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

// ==========================================================================
// 9. CICLO RICORRENTE TABELLONE DIRETTO FINO ALLA FINALE
// ==========================================================================
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

    // Controlla se siamo arrivati all'atto finale per decretare la gara secca
    let isFinale = (faseAttuale === 'FINALE');

    // Scrematura delle altre squadre della Champions in background
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
            // Vittoria finale del torneo
            ticker.innerHTML = `<div style="text-align:center; color:var(--accento-juve);">
                <h2 style="font-size:3rem; margin:0; letter-spacing:1px;">🏆 CAMPIONI D'EUROPA! 🏆</h2>
                <p>Impresa leggendaria! Hai trionfato nella Finalissima contro il l'ostico ${avversario.nome}. La coppa torna a Torino!</p>
            </div>`;
            boxControlli.innerHTML = `<button class="btn-azione-draft btn-usa-reroll attivo" style="width:100%;" onclick="location.reload()">TORNA ALLA HOME</button>`;
        }
    }
}

// ==========================================================================
// MODALITÀ "LA RISALITA" (SERIE B 2006/2007)
// ==========================================================================

const squadreSerieB = [
    "Napoli", "Genoa", "Piacenza", "Rimini", "Brescia", "Bologna", "Mantova", 
    "Lecce", "Albinoleffe", "Vicenza", "Treviso", "Bari", "Frosinone", 
    "Modena", "Cesena", "Arezzo", "Crotone", "Verona", "Pescara", "Spezia", "Triestina"
]; // 21 Squadre (La 22esima è la Juve)

let classificaSerieB = [];

function precompilaFedelissimi() {
    // Array con gli ID esatti e le preferenze di ruolo sul campo
    const fedelissimi = [
        { idObj: 9, preferenze: ["POR"] }, // Buffon (06/07)
        { idObj: 194, preferenze: ["ATT", "COC", "AD", "AS"] }, // Trezeguet (05/06)
        { idObj: 190, preferenze: ["ATT", "AS", "COC", "ES"] }, // Del Piero (07/08)
        { idObj: 149, preferenze: ["ES", "AS", "CC", "CDC", "ED"] } // Nedved (02/03)
    ];

    fedelissimi.forEach(f => {
        let giocatore = databaseJuve.find(g => g.id === f.idObj);
        if (!giocatore) return;

        let slotTrovato = null;
        // Cerca lo slot preferito non ancora occupato
        for (let ruolo of f.preferenze) {
            let slots = document.querySelectorAll(`.slot[data-ruolo="${ruolo}"]:not(.occupato)`);
            if (slots.length > 0) {
                slotTrovato = slots[0];
                break;
            }
        }
        
        // Fallback: se il modulo scelto è assurdo e non ha i loro ruoli, prendi il primo libero
        if (!slotTrovato) {
            let tuttiVuoti = document.querySelectorAll(`.slot:not(.occupato)`);
            if (tuttiVuoti.length > 0) slotTrovato = tuttiVuoti[0];
        }

        if (slotTrovato) {
            squadra.push(giocatore);
            slotTrovato.classList.add("occupato");
            slotTrovato.innerHTML = `
                <span style="color:var(--accento-juve); font-family:'Bebas Neue', sans-serif; font-size:1.5rem;">${giocatore.rating}</span>
                <span style="color:#fff; font-size:0.7rem; font-weight:bold; text-align:center;">${giocatore.nome.toUpperCase()}</span>
            `;
            // Stile dorato per distinguere i fedelissimi
            slotTrovato.style.border = "2px solid #bba360"; 
            slotTrovato.style.background = "rgba(187, 163, 96, 0.15)";
            slotTrovato.style.cursor = "default";
        }
    });

    // Aggiorna conteggio draft (partirà da 4/11)
    btnStagione.innerText = `VIA ALLA STAGIONE (${squadra.length}/${MAX_GIOCATORI})`;
}

function simulaSerieB() {
    // Si parte da -9 punti!
    statsStagione = { giocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, punti: -9, golFatti: 0, golSubiti: 0 };
    
    document.getElementById("schermata-gioco").style.display = "none";
    document.getElementById("schermata-simulazione").style.display = "block";
    document.getElementById("info-mister-sim").innerText = `MISTER: ${allenatoreSelezionato.nome.toUpperCase()} (${allenatoreSelezionato.modificatore >= 0 ? '+' : ''}${allenatoreSelezionato.modificatore})`;

    let sommaRating = squadra.reduce((acc, g) => acc + g.rating, 0);
    forzaAttuale = (sommaRating / 11) + allenatoreSelezionato.modificatore;

    classificaSerieB = [{ nome: "Juventus (Tu)", punti: -9, v: 0, p: 0, s: 0, forza: forzaAttuale }];
    
    // Forza storica delle avversarie più ostiche di quell'anno
    const forzaStoricaB = { "Napoli": 76, "Genoa": 75, "Bologna": 73, "Brescia": 72, "Mantova": 71, "Rimini": 71 };

    squadreSerieB.forEach(squadraNome => {
        let base = forzaStoricaB[squadraNome] || 68; // 68 per le squadre minori
        let forzaVariabile = base + Math.floor(Math.random() * 4) - 2; 
        classificaSerieB.push({ nome: squadraNome, punti: 0, v: 0, p: 0, s: 0, forza: forzaVariabile });
    });

    squadra.forEach(g => registroGolMarcatori[g.nome] = 0);

    aggiornaClassificaB_UI();
    avviaLoopSerieB(1, 42); // La Serie B a 22 squadre ha 42 giornate
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

        document.getElementById("giornata-corrente").innerText = `SERIE B - GIORNATA ${giornataAttuale}`;
        
        let indiceAvversario = (giornataAttuale - 1) % squadreSerieB.length;
        let avversarioOggi = squadreSerieB[indiceAvversario];
        let datiAvversario = classificaSerieB.find(s => s.nome === avversarioOggi);

        let diff = forzaAttuale - datiAvversario.forza;
        let baseGolJuve = Math.max(0, Math.floor(Math.random() * 3) + (diff > 5 ? 1 : 0));
        let baseGolAvv = Math.max(0, Math.floor(Math.random() * 3) + (diff < -5 ? 1 : 0));

        statsStagione.giocate++;
        statsStagione.golFatti += baseGolJuve;
        statsStagione.golSubiti += baseGolAvv;

        let juveObj = classificaSerieB.find(s => s.nome === "Juventus (Tu)");

        if (baseGolJuve > baseGolAvv) {
            statsStagione.vittorie++; statsStagione.punti += 3;
            juveObj.punti += 3; juveObj.v++; datiAvversario.s++;
        } else if (baseGolJuve === baseGolAvv) {
            statsStagione.pareggi++; statsStagione.punti += 1;
            juveObj.punti += 1; juveObj.p++; datiAvversario.punti += 1; datiAvversario.p++;
        } else {
            statsStagione.sconfitte++;
            juveObj.s++; datiAvversario.punti += 3; datiAvversario.v++;
        }

        // Assegnazione Marcatori (identica a Serie A)
        let chiHaSegnato = [];
        for (let i = 0; i < baseGolJuve; i++) {
            let estrattore = Math.random();
            let tiratori = [];
            if (estrattore < 0.75) tiratori = squadra.filter(g => ["ATT", "AS", "AD", "COC"].includes(g.ruolo));
            else if (estrattore < 0.95) tiratori = squadra.filter(g => ["CC", "CDC", "ED", "ES"].includes(g.ruolo));
            else tiratori = squadra.filter(g => ["DC", "TD", "TS"].includes(g.ruolo));
            
            if (tiratori.length === 0) tiratori = squadra.filter(g => g.ruolo !== "POR");
            let marcatoreScelto = tiratori[Math.floor(Math.random() * tiratori.length)];
            registroGolMarcatori[marcatoreScelto.nome]++;
            chiHaSegnato.push(marcatoreScelto.nome);
        }

        // Simulazione altre squadre Serie B
        classificaSerieB.forEach(s => {
            if (s.nome !== "Juventus (Tu)" && s.nome !== avversarioOggi) {
                let probVittoria = 0.40 + (s.forza - 70) * 0.02; 
                let r = Math.random();
                if (r < probVittoria) { s.punti += 3; s.v++; } 
                else if (r < probVittoria + 0.30) { s.punti += 1; s.p++; } 
                else { s.s++; }
            }
        });

        classificaSerieB.sort((a, b) => b.punti - a.punti);
        aggiornaClassificaB_UI();

        let stringaMarcatori = chiHaSegnato.length > 0 ? ` (${chiHaSegnato.join(", ")})` : "";
        ticker.innerHTML = `<div style="text-align:center;">
            <span style="font-size:0.9rem; color:#888; display:block;">RISULTATO LIVE</span>
            <strong>Juventus ${baseGolJuve} - ${baseGolAvv} ${avversarioOggi}</strong>
            <span style="font-size:0.8rem; color:var(--accento-juve); display:block; margin-top:5px;">${stringaMarcatori}</span>
        </div>`;

        cronologia.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; padding-bottom:4px;">
                <span style="color:#666; width:70px;">G. ${giornataAttuale}</span>
                <span style="flex:1; text-align:left;">vs ${avversarioOggi}</span>
                <span style="font-weight:bold; color:${baseGolJuve >= baseGolAvv ? (baseGolJuve === baseGolAvv ? '#ffeb3b' : '#4caf50') : '#f44336'}">${baseGolJuve} - ${baseGolAvv}</span>
            </div>
        ` + cronologia.innerHTML;

        giornataAttuale++;
    }, 200); // Leggermente più veloce essendoci 42 giornate
}

function aggiornaClassificaB_UI() {
    let container = document.getElementById("classifica-live-container");
    container.innerHTML = "";
    classificaSerieB.forEach((s, idx) => {
        let riga = document.createElement("div");
        riga.style.display = "flex";
        riga.style.justifyContent = "space-between";
        riga.style.padding = "5px 0";
        riga.style.borderBottom = "1px solid #222";
        
        // Colori per Promozione Diretta e Playoff
        if (idx < 2) riga.style.borderLeft = "4px solid #4caf50";
        else if (idx < 6) riga.style.borderLeft = "4px solid #ffeb3b";
        
        if (s.nome === "Juventus (Tu)") {
            riga.style.color = "var(--accento-juve)";
            riga.style.fontWeight = "bold";
        }
        riga.innerHTML = `<span style="padding-left: 5px;">${idx + 1}. ${s.nome}</span><strong>${s.punti} pt</strong>`;
        container.appendChild(riga);
    });
}

function mostraFineSerieB() {
    document.getElementById("schermata-simulazione").style.display = "none";
    document.getElementById("schermata-recap").style.display = "block";

    let commentoBox = document.getElementById("commento-dirigenza");
    let posJuve = classificaSerieB.findIndex(s => s.nome === "Juventus (Tu)") + 1;
    
    if (posJuve <= 2) {
        commentoBox.innerHTML = `🏆 <strong>PROMOZIONE DIRETTA!</strong> Hai superato i punti di penalizzazione e riportato la Vecchia Signora in Serie A. Una cavalcata storica!`;
    } else if (posJuve <= 6) {
        commentoBox.innerHTML = `⚠️ <strong>ZONA PLAYOFF.</strong> Non è bastato per la promozione diretta. Il cammino si deciderà ai Playoff, ma con questi campioni ci si aspettava il primo posto.`;
    } else {
        commentoBox.innerHTML = `📉 <strong>FALLIMENTO STORICO!</strong> Un disastro epocale. La Juventus rimane in Serie B, la piazza è in rivolta e sei stato esonerato.`;
    }

    let tbodyClassifica = document.querySelector("#tabella-classifica-finale tbody");
    tbodyClassifica.innerHTML = "";
    classificaSerieB.forEach((s, idx) => {
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
    Object.entries(registroGolMarcatori)
        .map(([nome, gol]) => ({ nome, gol }))
        .sort((a, b) => b.gol - a.gol)
        .forEach((m, idx) => {
            let rigaM = document.createElement("div");
            rigaM.style.display = "flex";
            rigaM.style.justifyContent = "space-between";
            rigaM.style.background = "rgba(255,255,255,0.02)";
            rigaM.style.padding = "8px 12px";
            rigaM.style.borderRadius = "4px";
            rigaM.style.fontSize = "0.85rem";
            rigaM.innerHTML = `<span>${idx + 1}. ${idx === 0 && m.gol > 0 ? "👑 " : ""}${m.nome}</span><strong style="color:var(--accento-juve);">${m.gol} Gol</strong>`;
            boxMarcatori.appendChild(rigaM);
        });
}