const databaseJuve = [
    // ==========================================
    // PORTIERI (POR)
    // ==========================================
    { id: 1, nome: "D. Zoff", stagione: "76/77", ruolo: ["POR"], rating: 87 },
    { id: 2, nome: "D. Zoff", stagione: "81/82", ruolo: ["POR"], rating: 90 },
    { id: 3, nome: "S. Tacconi", stagione: "84/85", ruolo: ["POR"], rating: 84 },
    { id: 4, nome: "S. Tacconi", stagione: "89/90", ruolo: ["POR"], rating: 82 },
    { id: 5, nome: "A. Peruzzi", stagione: "95/96", ruolo: ["POR"], rating: 87 },
    { id: 6, nome: "A. Peruzzi", stagione: "97/98", ruolo: ["POR"], rating: 84 },
    { id: 7, nome: "E. Van der Sar", stagione: "99/00", ruolo: ["POR"], rating: 76 }, // Flop
    { id: 8, nome: "G. Buffon", stagione: "02/03", ruolo: ["POR"], rating: 91 },
    { id: 9, nome: "G. Buffon", stagione: "06/07", ruolo: ["POR"], rating: 94 }, // Peak
    { id: 10, nome: "G. Buffon", stagione: "14/15", ruolo: ["POR"], rating: 87 },
    { id: 11, nome: "G. Buffon", stagione: "16/17", ruolo: ["POR"], rating: 89 },
    { id: 12, nome: "W. Szczesny", stagione: "19/20", ruolo: ["POR"], rating: 85 },
    { id: 13, nome: "W. Szczesny", stagione: "23/24", ruolo: ["POR"], rating: 82 },
    { id: 14, nome: "M. Di Gregorio", stagione: "24/25", ruolo: ["POR"], rating: 78 },
    { id: 15, nome: "C. Pinsoglio", stagione: "22/23", ruolo: ["POR"], rating: 74 },


    // ==========================================
    // DIFENSORI CENTRALI (DC)
    // ==========================================
    { id: 20, nome: "G. Scirea", stagione: "76/77", ruolo: ["DC"], rating: 87 },
    { id: 21, nome: "G. Scirea", stagione: "81/82", ruolo: ["DC"], rating: 94 }, // Peak
    { id: 22, nome: "C. Gentile", stagione: "76/77", ruolo: ["DC", "TD"], rating: 85 },
    { id: 23, nome: "C. Gentile", stagione: "81/82", ruolo: ["DC", "TD"], rating: 88 },
    { id: 24, nome: "S. Brio", stagione: "83/84", ruolo: ["DC"], rating: 82 },
    { id: 25, nome: "J. Kohler", stagione: "92/93", ruolo: ["DC"], rating: 87 },
    { id: 26, nome: "J. Cesar", stagione: "92/93", ruolo: ["DC"], rating: 83 },
    { id: 27, nome: "C. Ferrara", stagione: "96/97", ruolo: ["DC", "TD"], rating: 86 },
    { id: 28, nome: "C. Ferrara", stagione: "02/03", ruolo: ["DC"], rating: 81 },
    { id: 29, nome: "P. Montero", stagione: "96/97", ruolo: ["DC", "TS"], rating: 85 },
    { id: 30, nome: "P. Montero", stagione: "02/03", ruolo: ["DC"], rating: 80 },
    { id: 31, nome: "M. Iuliano", stagione: "97/98", ruolo: ["DC", "TS"], rating: 79 },
    { id: 32, nome: "I. Tudor", stagione: "01/02", ruolo: ["DC", "CDC"], rating: 80 },
    { id: 33, nome: "F. Cannavaro", stagione: "04/05", ruolo: ["DC"], rating: 87 },
    { id: 34, nome: "F. Cannavaro", stagione: "05/06", ruolo: ["DC"], rating: 92 }, // Pallone d'Oro
    { id: 35, nome: "J. Andrade", stagione: "07/08", ruolo: ["DC"], rating: 66 }, // Rotto
    { id: 36, nome: "N. Legrottaglie", stagione: "07/08", ruolo: ["DC"], rating: 78 },
    { id: 37, nome: "G. Chiellini", stagione: "08/09", ruolo: ["DC", "TS"], rating: 80 },
    { id: 38, nome: "G. Chiellini", stagione: "11/12", ruolo: ["DC", "TS"], rating: 83 },
    { id: 39, nome: "G. Chiellini", stagione: "14/15", ruolo: ["DC"], rating: 89 },
    { id: 40, nome: "G. Chiellini", stagione: "16/17", ruolo: ["DC"], rating: 85 },
    { id: 41, nome: "A. Barzagli", stagione: "11/12", ruolo: ["DC", "TD"], rating: 84 },
    { id: 42, nome: "A. Barzagli", stagione: "14/15", ruolo: ["DC", "TD"], rating: 86 },
    { id: 43, nome: "L. Bonucci", stagione: "11/12", ruolo: ["DC"], rating: 81 },
    { id: 44, nome: "L. Bonucci", stagione: "14/15", ruolo: ["DC"], rating: 83 },
    { id: 45, nome: "L. Bonucci", stagione: "16/17", ruolo: ["DC"], rating: 87 },
    { id: 46, nome: "M. Benatia", stagione: "17/18", ruolo: ["DC"], rating: 82 },
    { id: 47, nome: "M. De Ligt", stagione: "19/20", ruolo: ["DC"], rating: 83 },
    { id: 48, nome: "G. Bremer", stagione: "23/24", ruolo: ["DC"], rating: 85 },
    { id: 49, nome: "P. Kalulu", stagione: "24/25", ruolo: ["DC", "TD"], rating: 81 },
    { id: 50, nome: "F. Gatti", stagione: "23/24", ruolo: ["DC"], rating: 78 },
    { id: 51, nome: "L. Kelly", stagione: "25/26", ruolo: ["DC", "TS"], rating: 78 },
    

    // ==========================================
    // TERZINI DESTRI (TD)
    // ==========================================
    { id: 60, nome: "A. Cuccureddu", stagione: "76/77", ruolo: ["TD", "CC", "ES"], rating: 81 },
    { id: 61, nome: "M. Torricelli", stagione: "95/96", ruolo: ["TD", "TS", "DC"], rating: 82 },
    { id: 62, nome: "A. Birindelli", stagione: "02/03", ruolo: ["TD", "TS", "ED"], rating: 76 },
    { id: 63, nome: "L. Thuram", stagione: "01/02", ruolo: ["TD", "DC"], rating: 85 },
    { id: 64, nome: "L. Thuram", stagione: "04/05", ruolo: ["TD", "DC"], rating: 88 },
    { id: 65, nome: "J. Zebina", stagione: "04/05", ruolo: ["TD", "DC"], rating: 76 },
    { id: 66, nome: "Z. Grygera", stagione: "08/09", ruolo: ["TD", "DC"], rating: 70 }, // Flop
    { id: 67, nome: "S. Lichtsteiner", stagione: "11/12", ruolo: ["TD", "ED"], rating: 80 },
    { id: 68, nome: "S. Lichtsteiner", stagione: "14/15", ruolo: ["TD", "ED"], rating: 82 },
    { id: 69, nome: "Dani Alves", stagione: "16/17", ruolo: ["TD", "ED", "AD"], rating: 84 },
    { id: 70, nome: "J. Cancelo", stagione: "18/19", ruolo: ["TD", "TS", "ED"], rating: 83 },
    { id: 71, nome: "J. Cuadrado", stagione: "20/21", ruolo: ["TD", "ED", "AD"], rating: 81 },
    { id: 72, nome: "Danilo", stagione: "22/23", ruolo: ["TD", "DC", "TS"], rating: 79 },
    { id: 73, nome: "M. De Sciglio", stagione: "17/18", ruolo: ["TD", "TS"], rating: 73 },

    // ==========================================
    // TERZINI SINISTRI (TS)
    // ==========================================
    { id: 80, nome: "A. Cabrini", stagione: "77/78", ruolo: ["TS", "ES"], rating: 83 },
    { id: 81, nome: "A. Cabrini", stagione: "81/82", ruolo: ["TS", "ES"], rating: 87 },
    { id: 82, nome: "L. De Agostini", stagione: "89/90", ruolo: ["TS", "CC", "ES"], rating: 80 },
    { id: 83, nome: "G. Pessotto", stagione: "95/96", ruolo: ["TS", "TD", "ES"], rating: 79 },
    { id: 84, nome: "G. Pessotto", stagione: "97/98", ruolo: ["TS", "TD", "ES"], rating: 80 },
    { id: 85, nome: "G. Zambrotta", stagione: "02/03", ruolo: ["TS", "TD", "ES", "ED"], rating: 84 },
    { id: 86, nome: "G. Zambrotta", stagione: "04/05", ruolo: ["TS", "TD", "ES", "ED"], rating: 86 },
    { id: 87, nome: "C. Molinaro", stagione: "08/09", ruolo: ["TS", "ES"], rating: 68 }, // Flop
    { id: 88, nome: "F. Grosso", stagione: "09/10", ruolo: ["TS", "ES"], rating: 73 },
    { id: 89, nome: "P. Evra", stagione: "14/15", ruolo: ["TS", "ES"], rating: 81 },
    { id: 90, nome: "A. Sandro", stagione: "15/16", ruolo: ["TS", "ES"], rating: 81 },
    { id: 91, nome: "A. Sandro", stagione: "16/17", ruolo: ["TS", "ES"], rating: 85 },
    { id: 92, nome: "A. Sandro", stagione: "22/23", ruolo: ["TS", "DC"], rating: 72 }, // Tracollo
    { id: 93, nome: "A. Cambiaso", stagione: "23/24", ruolo: ["TS", "TD", "ES", "ED", "CC"], rating: 80 },

    // ==========================================
    // CENTROCAMPISTI CENTRALI E MEDIANI (CC, CDC)
    // ==========================================
    { id: 100, nome: "G. Furino", stagione: "76/77", ruolo: ["CDC", "CC"], rating: 83 },
    { id: 101, nome: "M. Tardelli", stagione: "81/82", ruolo: ["CC", "ED"], rating: 88 },
    { id: 102, nome: "M. Tardelli", stagione: "83/84", ruolo: ["CC", "ED"], rating: 85 },
    { id: 103, nome: "M. Bonini", stagione: "83/84", ruolo: ["CDC"], rating: 81 },
    { id: 104, nome: "P. Sousa", stagione: "94/95", ruolo: ["CC", "CDC"], rating: 84 },
    { id: 105, nome: "D. Deschamps", stagione: "95/96", ruolo: ["CDC", "CC"], rating: 86 },
    { id: 106, nome: "A. Conte", stagione: "95/96", ruolo: ["CC", "ED", "CDC"], rating: 84 },
    { id: 107, nome: "A. Conte", stagione: "01/02", ruolo: ["CC", "CDC"], rating: 78 },
    { id: 108, nome: "V. Jugovic", stagione: "95/96", ruolo: ["CC", "ES", "ED"], rating: 81 },
    { id: 109, nome: "E. Davids", stagione: "97/98", ruolo: ["CC", "CDC", "ES"], rating: 86 },
    { id: 110, nome: "E. Davids", stagione: "02/03", ruolo: ["CC", "CDC", "ES"], rating: 88 },
    { id: 111, nome: "A. Tacchinardi", stagione: "02/03", ruolo: ["CDC", "CC", "DC"], rating: 82 },
    { id: 112, nome: "Emerson", stagione: "04/05", ruolo: ["CDC", "CC"], rating: 85 },
    { id: 113, nome: "P. Vieira", stagione: "05/06", ruolo: ["CC", "CDC"], rating: 84 },
    { id: 114, nome: "C. Zanetti", stagione: "07/08", ruolo: ["CDC", "CC"], rating: 79 },
    { id: 115, nome: "M. Sissoko", stagione: "08/09", ruolo: ["CDC", "CC"], rating: 79 },
    { id: 116, nome: "C. Poulsen", stagione: "08/09", ruolo: ["CDC", "CC"], rating: 66 }, // Ostacolo draft
    { id: 117, nome: "Felipe Melo", stagione: "09/10", ruolo: ["CDC", "CC"], rating: 66 }, // Ostacolo draft
    { id: 118, nome: "C. Marchisio", stagione: "08/09", ruolo: ["CC", "CDC", "ES", "ED"], rating: 78 },
    { id: 119, nome: "C. Marchisio", stagione: "11/12", ruolo: ["CC", "CDC", "ES", "ED"], rating: 83 },
    { id: 120, nome: "C. Marchisio", stagione: "14/15", ruolo: ["CC", "CDC", "ES"], rating: 85 },
    { id: 121, nome: "A. Pirlo", stagione: "11/12", ruolo: ["CDC", "CC"], rating: 88 },
    { id: 122, nome: "A. Pirlo", stagione: "14/15", ruolo: ["CDC", "CC"], rating: 85 },
    { id: 123, nome: "A. Vidal", stagione: "11/12", ruolo: ["CC", "CDC", "COC"], rating: 84 },
    { id: 124, nome: "A. Vidal", stagione: "14/15", ruolo: ["CC", "CDC", "COC"], rating: 87 },
    { id: 125, nome: "P. Pogba", stagione: "12/13", ruolo: ["CC", "COC", "ES"], rating: 81 },
    { id: 126, nome: "P. Pogba", stagione: "15/16", ruolo: ["CC", "COC", "ES"], rating: 88 },
    { id: 127, nome: "S. Khedira", stagione: "16/17", ruolo: ["CC", "CDC"], rating: 84 },
    { id: 128, nome: "M. Pjanic", stagione: "16/17", ruolo: ["CDC", "CC", "COC"], rating: 83 },
    { id: 129, nome: "M. Pjanic", stagione: "17/18", ruolo: ["CDC", "CC", "COC"], rating: 85 },
    { id: 130, nome: "B. Matuidi", stagione: "17/18", ruolo: ["CC", "ES"], rating: 82 },
    { id: 131, nome: "R. Bentancur", stagione: "19/20", ruolo: ["CC", "CDC"], rating: 77 },
    { id: 132, nome: "Arthur", stagione: "20/21", ruolo: ["CC", "CDC"], rating: 68 }, // Flop
    { id: 133, nome: "A. Rabiot", stagione: "22/23", ruolo: ["CC", "ES"], rating: 82 },
    { id: 134, nome: "M. Locatelli", stagione: "23/24", ruolo: ["CDC", "CC"], rating: 79 },
    { id: 135, nome: "W. McKennie", stagione: "23/24", ruolo: ["CC", "ED", "TD"], rating: 78 },
    { id: 136, nome: "T. Koopmeiners", stagione: "24/25", ruolo: ["CC", "COC"], rating: 80 },

    // ==========================================
    // ESTERNI DI CENTROCAMPO (ES, ED)
    // ==========================================
    { id: 140, nome: "F. Causio", stagione: "76/77", ruolo: ["ED", "AD", "COC"], rating: 86 },
    { id: 141, nome: "M. Mauro", stagione: "85/86", ruolo: ["ED", "CC"], rating: 78 },
    { id: 142, nome: "A. Di Livio", stagione: "95/96", ruolo: ["ED", "ES", "TD"], rating: 81 },
    { id: 143, nome: "M. Camoranesi", stagione: "02/03", ruolo: ["ED", "CC", "ES"], rating: 83 },
    { id: 144, nome: "M. Camoranesi", stagione: "05/06", ruolo: ["ED", "CC", "ES"], rating: 85 },
    { id: 145, nome: "M. Krasic", stagione: "10/11", ruolo: ["ED", "AD"], rating: 79 },
    { id: 146, nome: "M. Krasic", stagione: "11/12", ruolo: ["ED", "AD"], rating: 68 }, // Flop sgonfiato
    { id: 147, nome: "S. Pepe", stagione: "11/12", ruolo: ["ED", "ES", "AD", "AS"], rating: 78 },
    { id: 148, nome: "P. Nedved", stagione: "01/02", ruolo: ["ES", "COC", "AS"], rating: 86 },
    { id: 149, nome: "P. Nedved", stagione: "02/03", ruolo: ["ES", "COC", "AS"], rating: 93 }, // Pallone d'oro
    { id: 150, nome: "K. Asamoah", stagione: "13/14", ruolo: ["ES", "TS", "CC"], rating: 80 },
    { id: 151, nome: "F. Kostic", stagione: "22/23", ruolo: ["ES", "AS"], rating: 79 },
    { id: 152, nome: "T. Weah", stagione: "24/25", ruolo: ["ED", "TD", "AD"], rating: 77 },

    // ==========================================
    // TREQUARTISTI (COC)
    // ==========================================
    { id: 160, nome: "R. Benetti", stagione: "76/77", ruolo: ["COC", "CC"], rating: 82 },
    { id: 161, nome: "M. Platini", stagione: "82/83", ruolo: ["COC", "AT", "ATT"], rating: 91 },
    { id: 162, nome: "M. Platini", stagione: "83/84", ruolo: ["COC", "AT", "ATT"], rating: 95 }, // God mode
    { id: 163, nome: "R. Baggio", stagione: "90/91", ruolo: ["COC", "AT", "ATT"], rating: 88 },
    { id: 164, nome: "R. Baggio", stagione: "92/93", ruolo: ["COC", "AT", "ATT"], rating: 94 }, // Pallone d'oro
    { id: 165, nome: "Z. Zidane", stagione: "96/97", ruolo: ["COC", "CC", "ES"], rating: 88 },
    { id: 166, nome: "Z. Zidane", stagione: "97/98", ruolo: ["COC", "CC", "ES"], rating: 95 }, // Pallone d'oro
    { id: 167, nome: "Z. Zidane", stagione: "00/01", ruolo: ["COC", "CC", "ES"], rating: 90 },
    { id: 168, nome: "Diego", stagione: "09/10", ruolo: ["COC", "AT"], rating: 72 }, // Flop relativo

    // ==========================================
    // ALI OFFENSIVE (AS, AD)
    // ==========================================
    { id: 170, nome: "J. Cuadrado", stagione: "16/17", ruolo: ["AD", "ED", "TD"], rating: 82 },
    { id: 171, nome: "D. Costa", stagione: "17/18", ruolo: ["AD", "AS", "ED", "ES"], rating: 84 },
    { id: 172, nome: "F. Bernardeschi", stagione: "18/19", ruolo: ["AD", "AS", "ED", "CC", "COC"], rating: 77 }, // Ovunque!
    { id: 173, nome: "F. Chiesa", stagione: "20/21", ruolo: ["AD", "AS", "ED", "ES", "ATT"], rating: 84 },
    { id: 174, nome: "F. Chiesa", stagione: "23/24", ruolo: ["AS", "AD", "ATT"], rating: 80 },
    { id: 175, nome: "A. Di Maria", stagione: "22/23", ruolo: ["AD", "COC", "AT"], rating: 83 },
    { id: 176, nome: "K. Yildiz", stagione: "25/26", ruolo: ["AS", "COC", "AT"], rating: 85 },
    { id: 177, nome: "F. Conceição", stagione: "24/25", ruolo: ["AD", "ED"], rating: 81 },
    { id: 178, nome: "M. Mandzukic", stagione: "16/17", ruolo: ["AS", "ATT"], rating: 83 },

    // ==========================================
    // ATTACCANTI CENTRALI (ATT)
    // ==========================================
    { id: 180, nome: "R. Bettega", stagione: "76/77", ruolo: ["ATT", "AT", "AS"], rating: 86 },
    { id: 181, nome: "P. Rossi", stagione: "82/83", ruolo: ["ATT"], rating: 87 },
    { id: 182, nome: "T. Schillaci", stagione: "89/90", ruolo: ["ATT"], rating: 83 },
    { id: 183, nome: "G. Vialli", stagione: "92/93", ruolo: ["ATT", "AD", "AS"], rating: 84 },
    { id: 184, nome: "G. Vialli", stagione: "94/95", ruolo: ["ATT", "AD", "AS"], rating: 86 },
    { id: 185, nome: "F. Ravanelli", stagione: "94/95", ruolo: ["ATT", "AS"], rating: 84 },
    { id: 186, nome: "F. Ravanelli", stagione: "95/96", ruolo: ["ATT", "AS"], rating: 83 },
    { id: 187, nome: "A. Del Piero", stagione: "95/96", ruolo: ["ATT", "AT", "AS", "COC"], rating: 89 },
    { id: 188, nome: "A. Del Piero", stagione: "97/98", ruolo: ["ATT", "AT", "AS", "COC"], rating: 93 }, // Prime assoluto
    { id: 189, nome: "A. Del Piero", stagione: "02/03", ruolo: ["ATT", "AT", "AS", "COC"], rating: 90 },
    { id: 190, nome: "A. Del Piero", stagione: "07/08", ruolo: ["ATT", "AT", "AS", "COC"], rating: 89 },
    { id: 191, nome: "F. Inzaghi", stagione: "97/98", ruolo: ["ATT"], rating: 87 },
    { id: 192, nome: "D. Trezeguet", stagione: "00/01", ruolo: ["ATT"], rating: 84 },
    { id: 193, nome: "D. Trezeguet", stagione: "01/02", ruolo: ["ATT"], rating: 89 },
    { id: 194, nome: "D. Trezeguet", stagione: "05/06", ruolo: ["ATT"], rating: 88 },
    { id: 195, nome: "Z. Ibrahimovic", stagione: "04/05", ruolo: ["ATT"], rating: 86 },
    { id: 196, nome: "Z. Ibrahimovic", stagione: "05/06", ruolo: ["ATT"], rating: 85 },
    { id: 197, nome: "A. Mutu", stagione: "05/06", ruolo: ["ATT", "AS", "AD", "AT"], rating: 82 },
    { id: 198, nome: "V. Iaquinta", stagione: "07/08", ruolo: ["ATT", "AD", "AS"], rating: 78 },
    { id: 199, nome: "Amauri", stagione: "08/09", ruolo: ["ATT"], rating: 80 },
    { id: 200, nome: "Amauri", stagione: "10/11", ruolo: ["ATT"], rating: 65 }, // Disastro draft
    { id: 201, nome: "M. Vucinic", stagione: "11/12", ruolo: ["ATT", "AS", "AT"], rating: 81 },
    { id: 202, nome: "A. Matri", stagione: "11/12", ruolo: ["ATT"], rating: 78 },
    { id: 203, nome: "F. Quagliarella", stagione: "12/13", ruolo: ["ATT", "AT"], rating: 77 },
    { id: 204, nome: "F. Llorente", stagione: "13/14", ruolo: ["ATT"], rating: 80 },
    { id: 205, nome: "C. Tevez", stagione: "13/14", ruolo: ["ATT", "AT", "COC"], rating: 85 },
    { id: 206, nome: "C. Tevez", stagione: "14/15", ruolo: ["ATT", "AT", "COC"], rating: 89 },
    { id: 207, nome: "A. Morata", stagione: "14/15", ruolo: ["ATT", "AS"], rating: 82 },
    { id: 208, nome: "M. Mandzukic", stagione: "15/16", ruolo: ["ATT", "AS"], rating: 84 },
    { id: 209, nome: "P. Dybala", stagione: "15/16", ruolo: ["ATT", "AT", "COC", "AD"], rating: 86 },
    { id: 210, nome: "P. Dybala", stagione: "17/18", ruolo: ["ATT", "AT", "COC", "AD"], rating: 89 },
    { id: 211, nome: "P. Dybala", stagione: "21/22", ruolo: ["ATT", "AT", "COC", "AD"], rating: 84 },
    { id: 212, nome: "G. Higuain", stagione: "16/17", ruolo: ["ATT"], rating: 86 },
    { id: 213, nome: "G. Higuain", stagione: "17/18", ruolo: ["ATT"], rating: 84 },
    { id: 214, nome: "C. Ronaldo", stagione: "18/19", ruolo: ["ATT", "AS"], rating: 92 },
    { id: 215, nome: "C. Ronaldo", stagione: "19/20", ruolo: ["ATT", "AS"], rating: 93 },
    { id: 216, nome: "C. Ronaldo", stagione: "20/21", ruolo: ["ATT", "AS"], rating: 89 },
    { id: 217, nome: "D. Vlahovic", stagione: "21/22", ruolo: ["ATT"], rating: 84 },
    { id: 218, nome: "D. Vlahovic", stagione: "23/24", ruolo: ["ATT"], rating: 82 },
    { id: 219, nome: "A. Milik", stagione: "22/23", ruolo: ["ATT"], rating: 75 },
    { id: 220, nome: "J. David", stagione: "25/26", ruolo: ["ATT"], rating: 80 },
    { id: 221, nome: "L. Openda", stagione: "25/26", ruolo: ["ATT"], rating: 74 },

    // ==========================================
    // I GREGARI E LE METEORE (Rating 74-78)
    // ==========================================
    
    // Portieri
    { id: 401, nome: "A. Manninger", stagione: "08/09", ruolo: ["POR"], rating: 76 },
    { id: 402, nome: "Neto", stagione: "15/16", ruolo: ["POR"], rating: 78 },
    { id: 403, nome: "F. Carini", stagione: "01/02", ruolo: ["POR"], rating: 74 },

    // Difensori
    { id: 404, nome: "J. Boumsong", stagione: "06/07", ruolo: ["DC"], rating: 76 },
    { id: 405, nome: "D. Rugani", stagione: "17/18", ruolo: ["DC"], rating: 77 },
    { id: 406, nome: "O. Mellberg", stagione: "08/09", ruolo: ["DC"], rating: 78 },
    { id: 407, nome: "F. Peluso", stagione: "13/14", ruolo: ["TS", "DC"], rating: 75 },
    { id: 408, nome: "A. Traoré", stagione: "10/11", ruolo: ["TS"], rating: 74 },
    { id: 409, nome: "M. Motta", stagione: "10/11", ruolo: ["TD"], rating: 74 },
    { id: 410, nome: "Z. Grygera", stagione: "07/08", ruolo: ["TD", "DC"], rating: 76 },

    // Centrocampisti
    { id: 411, nome: "S. Padoin", stagione: "14/15", ruolo: ["CC", "TD", "TS", "ED", "ES", "CDC"], rating: 76 }, // Il Talismano è ovunque!
    { id: 412, nome: "S. Sturaro", stagione: "15/16", ruolo: ["CDC", "CC", "TD"], rating: 76 },
    { id: 413, nome: "Tiago", stagione: "07/08", ruolo: ["CC", "CDC"], rating: 77 },
    { id: 414, nome: "S. Almiron", stagione: "07/08", ruolo: ["CC", "CDC"], rating: 75 },
    { id: 415, nome: "M. Pazienza", stagione: "11/12", ruolo: ["CDC", "CC"], rating: 74 },
    { id: 416, nome: "M. Lemina", stagione: "16/17", ruolo: ["CC", "CDC"], rating: 77 },
    { id: 417, nome: "R. Pereyra", stagione: "14/15", ruolo: ["COC", "CC", "ED"], rating: 78 },

    // Esterni
    { id: 418, nome: "M. Estigarribia", stagione: "11/12", ruolo: ["ES", "TS"], rating: 76 },
    { id: 419, nome: "E. Elia", stagione: "11/12", ruolo: ["ED", "AD", "AS"], rating: 75 },
    { id: 420, nome: "J. Martinez", stagione: "10/11", ruolo: ["ES", "ED", "AD"], rating: 74 },
    { id: 421, nome: "M. Isla", stagione: "12/13", ruolo: ["ED", "TD", "CC"], rating: 76 },

    // Attaccanti
    { id: 422, nome: "M. Zalayeta", stagione: "02/03", ruolo: ["ATT"], rating: 77 },
    { id: 423, nome: "M. Borriello", stagione: "11/12", ruolo: ["ATT"], rating: 76 },
    { id: 424, nome: "R. Bojinov", stagione: "06/07", ruolo: ["ATT"], rating: 76 },
    { id: 425, nome: "N. Bendtner", stagione: "12/13", ruolo: ["ATT"], rating: 74 },
    { id: 426, nome: "N. Anelka", stagione: "12/13", ruolo: ["ATT"], rating: 74 },

    // ==========================================
    // NUOVE ICONE & LEGGENDE
    // ==========================================
    { id: 500, nome: "Z. Boniek", stagione: "83/84", ruolo: ["COC", "ES", "AT", "ATT"], rating: 88 }, // Bello di notte
    { id: 501, nome: "Z. Boniek", stagione: "84/85", ruolo: ["ES", "COC", "AT"], rating: 86 },
    { id: 502, nome: "M. Laudrup", stagione: "85/86", ruolo: ["COC", "AT", "ES"], rating: 87 },
    { id: 503, nome: "M. Laudrup", stagione: "88/89", ruolo: ["COC", "AT", "ES"], rating: 84 },
    { id: 504, nome: "C. Vieri", stagione: "96/97", ruolo: ["ATT"], rating: 87 },
    { id: 505, nome: "A. Boksic", stagione: "96/97", ruolo: ["ATT"], rating: 85 },
    { id: 506, nome: "P. Vierchowod", stagione: "95/96", ruolo: ["DC"], rating: 85 }, // Il muro della Champions
    { id: 507, nome: "D. Baggio", stagione: "92/93", ruolo: ["CDC", "CC"], rating: 84 },
    { id: 508, nome: "A. Möller", stagione: "92/93", ruolo: ["COC", "AT"], rating: 86 },

    // ==========================================
    // VERSIONI ALTERNATIVE DEI CAMPIONI (Role/OVR shift)
    // ==========================================
    { id: 510, nome: "A. Del Piero", stagione: "05/06", ruolo: ["ATT", "AT", "COC"], rating: 86 }, // L'anno della panchina con Capello
    { id: 511, nome: "P. Dybala", stagione: "19/20", ruolo: ["COC", "AT", "ATT", "AD"], rating: 88 }, // MVP della Serie A di Sarri
    { id: 512, nome: "F. Chiesa", stagione: "21/22", ruolo: ["AD", "AS", "ATT"], rating: 86 }, // Post-Europeo prime, prima dell'infortunio
    { id: 513, nome: "K. Asamoah", stagione: "16/17", ruolo: ["TS", "ES"], rating: 78 }, // Riadattato a terzino basso
    { id: 514, nome: "M. Caceres", stagione: "12/13", ruolo: ["TD", "DC", "TS"], rating: 80 },
    { id: 515, nome: "M. Caceres", stagione: "15/16", ruolo: ["DC", "TD", "TS"], rating: 78 },
    { id: 516, nome: "F. Gatti", stagione: "24/25", ruolo: ["DC"], rating: 82 }, // Upgrade con fascia da capitano
    { id: 517, nome: "N. Legrottaglie", stagione: "03/04", ruolo: ["DC"], rating: 72 }, // La primissima annata da flop totale

    // ==========================================
    // GREGARI SOLIDI & OTTIMI RINUCALZI
    // ==========================================
    { id: 520, nome: "M. Rampulla", stagione: "96/97", ruolo: ["POR"], rating: 78 },
    { id: 521, nome: "M. Perin", stagione: "23/24", ruolo: ["POR"], rating: 80 },
    { id: 522, nome: "G. Marocchi", stagione: "89/90", ruolo: ["CC", "ES"], rating: 81 },
    { id: 523, nome: "M. Carrera", stagione: "92/93", ruolo: ["DC"], rating: 81 },
    { id: 524, nome: "S. Appiah", stagione: "03/04", ruolo: ["CC", "CDC"], rating: 78 },
    { id: 525, nome: "H. Salihamidzic", stagione: "07/08", ruolo: ["ED", "ES", "TD", "TS"], rating: 79 },
    { id: 526, nome: "E. Giaccherini", stagione: "11/12", ruolo: ["ES", "CC", "ED"], rating: 78 },
    { id: 527, nome: "S. Giovinco", stagione: "12/13", ruolo: ["ATT", "AT", "AS", "COC"], rating: 81 },
    { id: 528, nome: "M. Di Vaio", stagione: "02/03", ruolo: ["ATT"], rating: 82 },
    { id: 529, nome: "L. Spinazzola", stagione: "18/19", ruolo: ["TS", "TD", "ES"], rating: 79 },
    { id: 530, nome: "M. Demiral", stagione: "20/21", ruolo: ["DC"], rating: 79 },
    { id: 531, nome: "Douglas Luiz", stagione: "24/25", ruolo: ["CC", "CDC"], rating: 81 },
    { id: 532, nome: "K. Thuram", stagione: "24/25", ruolo: ["CDC", "CC"], rating: 80 },

    // ==========================================
    // FLOP STORICI & METEORE (Trappole per il Draft)
    // ==========================================
    { id: 540, nome: "I. Rush", stagione: "87/88", ruolo: ["ATT"], rating: 76 }, // Re dei bomber al Liverpool, delusione a Torino
    { id: 541, nome: "M. Salas", stagione: "01/02", ruolo: ["ATT"], rating: 77 }, // Falcidiato dagli infortuni
    { id: 542, nome: "E. Belardi", stagione: "07/08", ruolo: ["POR"], rating: 71 }, // Portiere di riserva post-Serie B
    { id: 543, nome: "F. Miccoli", stagione: "03/04", ruolo: ["AD", "ATT", "AT"], rating: 80 }, // Tanta classe ma poca continuità in bianconero
    { id: 544, nome: "K. Coman", stagione: "14/15", ruolo: ["AS", "AD", "COC"], rating: 74 }, // Troppo giovane, non ha inciso
    { id: 545, nome: "D. Kulusevski", stagione: "20/21", ruolo: ["AD", "COC", "ED", "CC"], rating: 78 }, // Promessa non mantenuta
    { id: 546, nome: "S. Zaza", stagione: "15/16", ruolo: ["ATT"], rating: 79 }, // Il gol al Napoli e poco altro
    { id: 547, nome: "M. Kean", stagione: "18/19", ruolo: ["ATT"], rating: 79 }, // Prima ascesa
    { id: 548, nome: "M. Kean", stagione: "23/24", ruolo: ["ATT"], rating: 74 },  // Zero gol in campionato

    // ==========================================
    // ESPANSIONE ONLINE - PORTIERI
    // ==========================================
    { id: 600, nome: "L. Bodini", stagione: "82/83", ruolo: ["POR"], rating: 76 },
    { id: 601, nome: "S. Tacconi", stagione: "86/87", ruolo: ["POR"], rating: 83 },
    { id: 602, nome: "M. Rampulla", stagione: "92/93", ruolo: ["POR"], rating: 77 },
    { id: 603, nome: "M. Rampulla", stagione: "98/99", ruolo: ["POR"], rating: 74 },
    { id: 604, nome: "E. Van der Sar", stagione: "00/01", ruolo: ["POR"], rating: 78 },
    { id: 605, nome: "A. Chimenti", stagione: "03/04", ruolo: ["POR"], rating: 75 },
    { id: 606, nome: "C. Abbiati", stagione: "05/06", ruolo: ["POR"], rating: 81 },
    { id: 607, nome: "A. Mirante", stagione: "06/07", ruolo: ["POR"], rating: 72 },
    { id: 608, nome: "M. Storari", stagione: "10/11", ruolo: ["POR"], rating: 79 },
    { id: 609, nome: "M. Storari", stagione: "12/13", ruolo: ["POR"], rating: 77 },
    { id: 610, nome: "Rubinho", stagione: "13/14", ruolo: ["POR"], rating: 70 },
    { id: 611, nome: "E. Audero", stagione: "16/17", ruolo: ["POR"], rating: 69 },
    { id: 612, nome: "G. Buffon", stagione: "19/20", ruolo: ["POR"], rating: 80 },
    { id: 613, nome: "M. Perin", stagione: "18/19", ruolo: ["POR"], rating: 78 },
    { id: 614, nome: "M. Perin", stagione: "24/25", ruolo: ["POR"], rating: 79 },
    { id: 615, nome: "C. Pinsoglio", stagione: "20/21", ruolo: ["POR"], rating: 72 },

    // ==========================================
    // ESPANSIONE ONLINE - DIFENSORI
    // ==========================================
    { id: 620, nome: "F. Morini", stagione: "76/77", ruolo: ["DC"], rating: 82 },
    { id: 621, nome: "G. Spinosi", stagione: "78/79", ruolo: ["DC", "TD"], rating: 78 },
    { id: 622, nome: "S. Brio", stagione: "85/86", ruolo: ["DC"], rating: 84 },
    { id: 623, nome: "L. Favero", stagione: "84/85", ruolo: ["DC", "TD"], rating: 82 },
    { id: 624, nome: "R. Tricella", stagione: "87/88", ruolo: ["DC", "CDC"], rating: 80 },
    { id: 625, nome: "L. De Agostini", stagione: "87/88", ruolo: ["TS", "ES"], rating: 82 },
    { id: 626, nome: "A. De Marchi", stagione: "90/91", ruolo: ["DC"], rating: 76 },
    { id: 627, nome: "M. Luppi", stagione: "91/92", ruolo: ["DC"], rating: 75 },
    { id: 628, nome: "J. Reuter", stagione: "92/93", ruolo: ["TD", "ED", "CC"], rating: 79 },
    { id: 629, nome: "M. Carrera", stagione: "94/95", ruolo: ["DC", "TS"], rating: 82 },
    { id: 630, nome: "S. Porrini", stagione: "95/96", ruolo: ["TD", "DC"], rating: 80 },
    { id: 631, nome: "Dimas", stagione: "96/97", ruolo: ["TS", "ES"], rating: 78 },
    { id: 632, nome: "M. Torricelli", stagione: "97/98", ruolo: ["TD", "TS", "DC"], rating: 81 },
    { id: 633, nome: "M. Iuliano", stagione: "00/01", ruolo: ["DC"], rating: 80 },
    { id: 634, nome: "A. Paramatti", stagione: "01/02", ruolo: ["TS", "DC"], rating: 72 },
    { id: 635, nome: "I. Tudor", stagione: "04/05", ruolo: ["DC", "CDC"], rating: 78 },
    { id: 636, nome: "R. Kovac", stagione: "05/06", ruolo: ["DC"], rating: 79 },
    { id: 637, nome: "F. Balzaretti", stagione: "06/07", ruolo: ["TS", "ES"], rating: 77 },
    { id: 638, nome: "D. Criscito", stagione: "06/07", ruolo: ["TS", "DC"], rating: 76 },
    { id: 639, nome: "G. Chiellini", stagione: "06/07", ruolo: ["TS", "DC"], rating: 78 },
    { id: 640, nome: "F. Cannavaro", stagione: "09/10", ruolo: ["DC"], rating: 72 },
    { id: 641, nome: "M. Caceres", stagione: "09/10", ruolo: ["TD", "DC", "TS"], rating: 77 },
    { id: 642, nome: "P. De Ceglie", stagione: "10/11", ruolo: ["TS", "ES"], rating: 73 },
    { id: 643, nome: "L. Bonucci", stagione: "10/11", ruolo: ["DC"], rating: 74 },
    { id: 644, nome: "F. Sorensen", stagione: "10/11", ruolo: ["DC", "TD"], rating: 71 },
    { id: 645, nome: "A. Barzagli", stagione: "18/19", ruolo: ["DC"], rating: 75 },
    { id: 646, nome: "A. Ogbonna", stagione: "13/14", ruolo: ["DC", "TS"], rating: 78 },
    { id: 647, nome: "Romulo", stagione: "14/15", ruolo: ["TD", "ED", "CC"], rating: 70 },
    { id: 648, nome: "P. Evra", stagione: "15/16", ruolo: ["TS", "ES"], rating: 80 },
    { id: 649, nome: "D. Rugani", stagione: "15/16", ruolo: ["DC"], rating: 76 },
    { id: 650, nome: "M. Benatia", stagione: "16/17", ruolo: ["DC"], rating: 80 },
    { id: 651, nome: "L. Spinazzola", stagione: "17/18", ruolo: ["TS", "TD", "ES"], rating: 77 },
    { id: 652, nome: "M. De Ligt", stagione: "20/21", ruolo: ["DC"], rating: 84 },
    { id: 653, nome: "M. Demiral", stagione: "19/20", ruolo: ["DC"], rating: 78 },
    { id: 654, nome: "G. Frabotta", stagione: "20/21", ruolo: ["TS", "ES"], rating: 69 },
    { id: 655, nome: "L. Pellegrini", stagione: "21/22", ruolo: ["TS", "ES"], rating: 74 },
    { id: 656, nome: "D. Rugani", stagione: "21/22", ruolo: ["DC"], rating: 75 },
    { id: 657, nome: "A. Cambiaso", stagione: "24/25", ruolo: ["TS", "TD", "CC", "ES"], rating: 82 },
    { id: 658, nome: "D. Huijsen", stagione: "23/24", ruolo: ["DC"], rating: 71 },
    { id: 659, nome: "T. Djalo", stagione: "23/24", ruolo: ["DC"], rating: 68 },
    { id: 660, nome: "J. Cabal", stagione: "24/25", ruolo: ["TS", "DC"], rating: 74 },
    { id: 661, nome: "N. Savona", stagione: "24/25", ruolo: ["TD", "DC"], rating: 73 },
    { id: 662, nome: "J. Rouhi", stagione: "24/25", ruolo: ["TS"], rating: 66 },
    { id: 663, nome: "R. Veiga", stagione: "24/25", ruolo: ["DC", "TS"], rating: 76 },
    { id: 664, nome: "Alberto Costa", stagione: "24/25", ruolo: ["TD", "ED"], rating: 72 },
    { id: 665, nome: "G. Bremer", stagione: "24/25", ruolo: ["DC"], rating: 77 },
    { id: 666, nome: "Danilo", stagione: "19/20", ruolo: ["TD", "DC", "TS"], rating: 77 },

    // ==========================================
    // ESPANSIONE ONLINE - CENTROCAMPISTI
    // ==========================================
    { id: 680, nome: "L. Brady", stagione: "80/81", ruolo: ["CC", "COC"], rating: 88 },
    { id: 681, nome: "D. Marocchino", stagione: "81/82", ruolo: ["ES", "COC", "AS"], rating: 82 },
    { id: 682, nome: "L. Prandelli", stagione: "82/83", ruolo: ["CC", "CDC"], rating: 78 },
    { id: 683, nome: "B. Vignola", stagione: "83/84", ruolo: ["COC", "AT", "ES"], rating: 80 },
    { id: 684, nome: "L. Manfredonia", stagione: "85/86", ruolo: ["CDC", "DC"], rating: 82 },
    { id: 685, nome: "A. Magrin", stagione: "87/88", ruolo: ["CC", "CDC"], rating: 74 },
    { id: 686, nome: "S. Aleinikov", stagione: "89/90", ruolo: ["CC", "CDC"], rating: 78 },
    { id: 687, nome: "Rui Barros", stagione: "88/89", ruolo: ["COC", "AT", "AS"], rating: 83 },
    { id: 688, nome: "T. Hassler", stagione: "90/91", ruolo: ["COC", "CC", "ES"], rating: 84 },
    { id: 689, nome: "D. Baggio", stagione: "94/95", ruolo: ["CC", "CDC"], rating: 82 },
    { id: 690, nome: "A. Conte", stagione: "92/93", ruolo: ["CC", "CDC", "ED"], rating: 80 },
    { id: 691, nome: "A. Lombardo", stagione: "95/96", ruolo: ["ED", "ES"], rating: 79 },
    { id: 692, nome: "D. Deschamps", stagione: "97/98", ruolo: ["CDC", "CC"], rating: 87 },
    { id: 693, nome: "A. Tacchinardi", stagione: "96/97", ruolo: ["CDC", "CC"], rating: 80 },
    { id: 694, nome: "Z. Zidane", stagione: "99/00", ruolo: ["COC", "CC"], rating: 92 },
    { id: 695, nome: "E. Davids", stagione: "98/99", ruolo: ["CC", "CDC", "ES"], rating: 87 },
    { id: 696, nome: "F. O'Neill", stagione: "00/01", ruolo: ["CC", "COC"], rating: 76 },
    { id: 697, nome: "E. Maresca", stagione: "01/02", ruolo: ["CC", "CDC"], rating: 76 },
    { id: 698, nome: "M. Brighi", stagione: "02/03", ruolo: ["CC", "CDC"], rating: 74 },
    { id: 699, nome: "M. Blasi", stagione: "04/05", ruolo: ["CDC", "CC"], rating: 77 },
    { id: 700, nome: "S. Appiah", stagione: "04/05", ruolo: ["CC", "CDC"], rating: 79 },
    { id: 701, nome: "R. Olivera", stagione: "05/06", ruolo: ["CC", "COC", "ES"], rating: 72 },
    { id: 702, nome: "G. Giannichedda", stagione: "05/06", ruolo: ["CDC", "CC"], rating: 76 },
    { id: 703, nome: "M. Marchionni", stagione: "06/07", ruolo: ["ED", "ES"], rating: 77 },
    { id: 704, nome: "A. Nocerino", stagione: "07/08", ruolo: ["CC", "CDC"], rating: 76 },
    { id: 705, nome: "C. Zanetti", stagione: "08/09", ruolo: ["CDC", "CC"], rating: 78 },
    { id: 706, nome: "C. Poulsen", stagione: "09/10", ruolo: ["CDC", "CC"], rating: 64 },
    { id: 707, nome: "A. Aquilani", stagione: "10/11", ruolo: ["CC", "COC"], rating: 78 },
    { id: 708, nome: "Felipe Melo", stagione: "10/11", ruolo: ["CDC", "CC"], rating: 70 },
    { id: 709, nome: "A. Pirlo", stagione: "12/13", ruolo: ["CDC", "CC"], rating: 89 },
    { id: 710, nome: "E. Giaccherini", stagione: "12/13", ruolo: ["ES", "CC", "ED"], rating: 77 },
    { id: 711, nome: "K. Asamoah", stagione: "12/13", ruolo: ["ES", "TS", "CC"], rating: 82 },
    { id: 712, nome: "S. Padoin", stagione: "13/14", ruolo: ["CC", "TD", "TS", "ED", "ES", "CDC"], rating: 75 },
    { id: 713, nome: "R. Pereyra", stagione: "15/16", ruolo: ["COC", "CC", "ED"], rating: 77 },
    { id: 714, nome: "Hernanes", stagione: "15/16", ruolo: ["COC", "CDC", "CC"], rating: 70 },
    { id: 715, nome: "M. Lemina", stagione: "15/16", ruolo: ["CC", "CDC"], rating: 76 },
    { id: 716, nome: "T. Rincon", stagione: "16/17", ruolo: ["CDC", "CC"], rating: 73 },
    { id: 717, nome: "S. Sturaro", stagione: "16/17", ruolo: ["CDC", "CC", "TD"], rating: 75 },
    { id: 718, nome: "R. Bentancur", stagione: "17/18", ruolo: ["CC", "CDC"], rating: 76 },
    { id: 719, nome: "Emre Can", stagione: "18/19", ruolo: ["CC", "CDC", "DC"], rating: 79 },
    { id: 720, nome: "A. Ramsey", stagione: "19/20", ruolo: ["CC", "COC"], rating: 74 },
    { id: 721, nome: "A. Rabiot", stagione: "20/21", ruolo: ["CC", "CDC", "ES"], rating: 76 },
    { id: 722, nome: "W. McKennie", stagione: "20/21", ruolo: ["CC", "ED"], rating: 77 },
    { id: 723, nome: "M. Locatelli", stagione: "21/22", ruolo: ["CDC", "CC"], rating: 80 },
    { id: 724, nome: "D. Zakaria", stagione: "21/22", ruolo: ["CDC", "CC"], rating: 75 },
    { id: 725, nome: "L. Paredes", stagione: "22/23", ruolo: ["CDC", "CC"], rating: 72 },
    { id: 726, nome: "P. Pogba", stagione: "22/23", ruolo: ["CC", "COC"], rating: 63 },
    { id: 727, nome: "N. Fagioli", stagione: "22/23", ruolo: ["CC", "CDC"], rating: 78 },
    { id: 728, nome: "F. Miretti", stagione: "23/24", ruolo: ["CC", "COC"], rating: 73 },
    { id: 729, nome: "C. Alcaraz", stagione: "23/24", ruolo: ["CC", "COC"], rating: 70 },
    { id: 730, nome: "N. Fagioli", stagione: "24/25", ruolo: ["CC", "CDC"], rating: 77 },
    { id: 731, nome: "V. Adzic", stagione: "24/25", ruolo: ["COC", "CC"], rating: 68 },

    // ==========================================
    // ESPANSIONE ONLINE - ESTERNI, TREQUARTISTI E ATTACCANTI
    // ==========================================
    { id: 750, nome: "F. Causio", stagione: "77/78", ruolo: ["ED", "AD", "COC"], rating: 85 },
    { id: 751, nome: "R. Bettega", stagione: "80/81", ruolo: ["ATT", "AT", "AS"], rating: 84 },
    { id: 752, nome: "D. Marocchino", stagione: "82/83", ruolo: ["AS", "ES", "AT"], rating: 81 },
    { id: 753, nome: "B. Vignola", stagione: "84/85", ruolo: ["COC", "AT", "ES"], rating: 82 },
    { id: 754, nome: "A. Serena", stagione: "85/86", ruolo: ["ATT"], rating: 83 },
    { id: 755, nome: "R. Briaschi", stagione: "85/86", ruolo: ["ATT", "AD"], rating: 79 },
    { id: 756, nome: "A. Zavarov", stagione: "88/89", ruolo: ["COC", "AT"], rating: 76 },
    { id: 757, nome: "S. Schillaci", stagione: "90/91", ruolo: ["ATT"], rating: 78 },
    { id: 758, nome: "P. Casiraghi", stagione: "91/92", ruolo: ["ATT"], rating: 80 },
    { id: 759, nome: "P. Di Canio", stagione: "92/93", ruolo: ["AS", "AD", "AT"], rating: 79 },
    { id: 760, nome: "R. Baggio", stagione: "93/94", ruolo: ["COC", "AT", "ATT"], rating: 91 },
    { id: 761, nome: "F. Ravanelli", stagione: "92/93", ruolo: ["ATT", "AS"], rating: 80 },
    { id: 762, nome: "M. Padovano", stagione: "95/96", ruolo: ["ATT"], rating: 79 },
    { id: 763, nome: "N. Amoruso", stagione: "96/97", ruolo: ["ATT"], rating: 78 },
    { id: 764, nome: "D. Fonseca", stagione: "97/98", ruolo: ["ATT", "AT"], rating: 79 },
    { id: 765, nome: "T. Henry", stagione: "98/99", ruolo: ["AS", "AD", "ATT"], rating: 73 },
    { id: 766, nome: "J. Esnaider", stagione: "99/00", ruolo: ["ATT"], rating: 70 },
    { id: 767, nome: "D. Trezeguet", stagione: "03/04", ruolo: ["ATT"], rating: 86 },
    { id: 768, nome: "F. Miccoli", stagione: "02/03", ruolo: ["AD", "ATT", "AT"], rating: 79 },
    { id: 769, nome: "A. Mutu", stagione: "04/05", ruolo: ["ATT", "AS", "AD", "AT"], rating: 78 },
    { id: 770, nome: "R. Palladino", stagione: "06/07", ruolo: ["AS", "AD", "ATT"], rating: 77 },
    { id: 771, nome: "A. Del Piero", stagione: "06/07", ruolo: ["ATT", "AT", "AS", "COC"], rating: 88 },
    { id: 772, nome: "D. Trezeguet", stagione: "07/08", ruolo: ["ATT"], rating: 87 },
    { id: 773, nome: "S. Giovinco", stagione: "08/09", ruolo: ["AS", "AT", "COC"], rating: 76 },
    { id: 774, nome: "V. Iaquinta", stagione: "08/09", ruolo: ["ATT", "AD", "AS"], rating: 80 },
    { id: 775, nome: "A. Del Piero", stagione: "08/09", ruolo: ["ATT", "AT", "AS", "COC"], rating: 84 },
    { id: 776, nome: "Amauri", stagione: "09/10", ruolo: ["ATT"], rating: 73 },
    { id: 777, nome: "F. Quagliarella", stagione: "10/11", ruolo: ["ATT", "AT"], rating: 82 },
    { id: 778, nome: "A. Matri", stagione: "10/11", ruolo: ["ATT"], rating: 79 },
    { id: 779, nome: "L. Toni", stagione: "10/11", ruolo: ["ATT"], rating: 74 },
    { id: 780, nome: "M. Vucinic", stagione: "12/13", ruolo: ["ATT", "AS", "AT"], rating: 80 },
    { id: 781, nome: "F. Llorente", stagione: "14/15", ruolo: ["ATT"], rating: 78 },
    { id: 782, nome: "A. Morata", stagione: "15/16", ruolo: ["ATT", "AS"], rating: 81 },
    { id: 783, nome: "C. Tevez", stagione: "15/16", ruolo: ["ATT", "AT", "COC"], rating: 83 },
    { id: 784, nome: "M. Pjaca", stagione: "16/17", ruolo: ["AS", "AD", "AT"], rating: 70 },
    { id: 785, nome: "M. Kean", stagione: "16/17", ruolo: ["ATT"], rating: 68 },
    { id: 786, nome: "D. Costa", stagione: "18/19", ruolo: ["AD", "AS", "ED", "ES"], rating: 79 },
    { id: 787, nome: "G. Higuain", stagione: "19/20", ruolo: ["ATT"], rating: 79 },
    { id: 788, nome: "D. Kulusevski", stagione: "21/22", ruolo: ["AD", "COC", "ED", "CC"], rating: 76 },
    { id: 789, nome: "F. Chiesa", stagione: "22/23", ruolo: ["AD", "AS", "ATT"], rating: 75 },
    { id: 790, nome: "M. Soule", stagione: "22/23", ruolo: ["AD", "COC", "AS"], rating: 72 },
    { id: 791, nome: "S. Iling-Junior", stagione: "22/23", ruolo: ["AS", "ES"], rating: 73 },
    { id: 792, nome: "K. Yildiz", stagione: "23/24", ruolo: ["AS", "COC", "AT"], rating: 78 },
    { id: 793, nome: "T. Weah", stagione: "23/24", ruolo: ["ED", "TD", "AD"], rating: 74 },
    { id: 794, nome: "Nico Gonzalez", stagione: "24/25", ruolo: ["AD", "AS", "ATT"], rating: 78 },
    { id: 795, nome: "S. Mbangula", stagione: "24/25", ruolo: ["AS", "AD"], rating: 72 },
    { id: 796, nome: "D. Vlahovic", stagione: "24/25", ruolo: ["ATT"], rating: 81 },
    { id: 797, nome: "A. Milik", stagione: "23/24", ruolo: ["ATT"], rating: 74 },
    { id: 798, nome: "A. Morata", stagione: "20/21", ruolo: ["ATT", "AS"], rating: 79 },
    { id: 799, nome: "C. Ronaldo", stagione: "21/22", ruolo: ["ATT", "AS"], rating: 86 }
];

const databaseAllenatori = [
    { id: 301, nome: "Giovanni Trapattoni", effetto: "Pragmatismo: +3 stabilità difensiva, solidità d'altri tempi", modificatore: 3 },
    { id: 302, nome: "Rino Marchesi", effetto: "Transizione ordinata: nessun bonus o malus di rilievo", modificatore: 0 },
    { id: 303, nome: "Dino Zoff", effetto: "Gentiluomo di ghiaccio: +2 compattezza tattica nelle gare tese", modificatore: 2 },
    { id: 304, nome: "Luigi Maifredi", effetto: "Calcio Champagne: +4 spinta offensiva, ma -5 stabilità difensiva", modificatore: -1 },
    { id: 305, nome: "Marcello Lippi", effetto: "Mentalità Vincente: +3 carattere e bonus fisso su ogni reparto", modificatore: 4 },
    { id: 306, nome: "Carlo Ancelotti", effetto: "Re di Coppe: Ottimo nei big match, calo di tensione con le piccole", modificatore: 2 },
    { id: 307, nome: "Fabio Capello", effetto: "Caterpillar: +4 cinismo e concretezza nei risultati di misura", modificatore: 4 },
    { id: 308, nome: "Didier Deschamps", effetto: "Spirito di Rinascita: +2 motivazione della rosa in moments critici", modificatore: 2 },
    { id: 309, nome: "Giancarlo Corradini", effetto: "Traghettatore puro: nessun impatto significativo", modificatore: 0 },
    { id: 310, nome: "Claudio Ranieri", effetto: "Aggiustatore: +2 continuità contro le squadre di bassa classifica", modificatore: 1 },
    { id: 311, nome: "Ciro Ferrara", effetto: "Crisi Tattica: Instabilità nello spogliatoio e calo generale", modificatore: -3 },
    { id: 312, nome: "Alberto Zaccheroni", effetto: "Fase Calante: Difficoltà nella copertura degli spazi arretrati", modificatore: -2 },
    { id: 313, nome: "Luigi Delneri", effetto: "4-4-2 Rigido: Limiti di adattamento contro moduli speculari", modificatore: -2 },
    { id: 314, nome: "Antonio Conte", effetto: "Spirito Martello: +5 intensità agonistica costante in campionato", modificatore: 5 },
    { id: 315, nome: "Massimiliano Allegri", effetto: "Corto Muso: +4 efficienza e gestione del vantaggio, -2 spettacolo", modificatore: 3 },
    { id: 316, nome: "Maurizio Sarri", effetto: "Sarrismo Alternato: +3 rapidità di fraseggio, ma -1 rigidità difensiva", modificatore: 2 },
    { id: 317, nome: "Andrea Pirlo", effetto: "Maestro d'Improvvisazione: +1 imprevedibilità nelle verticalizzazioni", modificatore: 1 },
    { id: 318, nome: "Thiago Motta", effetto: "Modernità Liquida: +3 controllo totale del possesso palla", modificatore: 2 },
    { id: 319, nome: "Igor Tudor", effetto: "Catastrofe: -2 gioco di squadra, non ha fatto il suo", modificatore: -2 },
    { id: 320, nome: "Luciano Spalletti", effetto: "Il giusto: ha fatto il suo con una squadra mediocre, nessun bonus o malus", modificatore: 0 }
];
