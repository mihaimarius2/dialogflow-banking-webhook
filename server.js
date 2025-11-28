// server.js - Versiunea finală (Calcul + Salvare în Sheets)
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); 
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000; 

// !!! URL-UL DE LA PASUL 3 SE ADAUGĂ AICI !!!
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyhe1HP05ZijitYPX0iW6KpIxiC94iioX8PuqPubI_volGe3Qwl9uwhk3vvinhlGbocdA/exec'; 
// !!! NU UITA SA INSEREZI LINKUL TAU !!!

app.post('/', async (req, res) => { 
    const body = req.body;
    const intentName = body.queryResult ? body.queryResult.intent.displayName : "Necunoscut";
    const params = body.queryResult ? body.queryResult.parameters : {};
    const session = body.session;

    console.log(`\n🔔 Intent primit: ${intentName}`);

    // LOGICA 1: ÎNREGISTRARE CERERE (Creare Cont)
    if (intentName === 'Creare cont - Tip cont') {
        const { nume, email, telefon, tip } = params;
        
        const registrationData = { nume, email, telefon, tip }; 
        let fulfillmentText;
        
        try {
            // Trimitem datele către API-ul tău din Sheets
            const response = await fetch(SHEETS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            if (response.status === 200) {
                console.log('✅ Datele au fost scrise cu succes în Sheets.');
                fulfillmentText = `Super! Cererea ta de cont (${tip}) a fost înregistrată. Vei fi contactat în scurt timp.`;
            } else {
                 console.error(`Eroare Sheets: Status ${response.status}. Nu s-a putut scrie.`);
                 fulfillmentText = "Ne pare rău, a apărut o eroare la înregistrarea datelor. Te rugăm să încerci mai târziu.";
            }

        } catch (error) {
            console.error('Eroare la apelul fetch:', error);
            fulfillmentText = "Eroare la conexiune. Te rugăm să verifici serverul.";
        }
        
        return res.json({
            fulfillmentText: fulfillmentText,
            outputContexts: [
                { name: `${session}/contexts/secondary-menu`, lifespanCount: 5 }
            ]
        });
    }

    // LOGICA 2: CALCUL VALUTAR
    if (intentName === 'Curs valutar - Suma (Euro)' || intentName === 'Curs valutar - Suma (Dolar)') {
        const lei = params.suma_lei;
        let curs = intentName.includes('Euro') ? 4.97 : 4.50;
        let simbol = intentName.includes('Euro') ? "EUR" : "USD";
        const rezultat = (lei / curs).toFixed(2);
        
        const mesaj = `Suma: ${lei} Lei înseamnă aproximativ ${rezultat} ${simbol} (curs: ${curs}).\n\nDorești să revii la meniul principal sau să oferi feedback?`;

        return res.json({
            fulfillmentText: mesaj,
            outputContexts: [
                { name: `${session}/contexts/secondary-menu`, lifespanCount: 5 }
            ]
        });
    }

    // Răspuns de fallback
    res.json({ fulfillmentText: 'Salut! Webhook-ul funcționează.' });
});

app.listen(PORT, () => {
  console.log(`Serverul este live pe portul ${PORT}!`);
});
