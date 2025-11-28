const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000; 
app.post('/', (req, res) => {
    const body = req.body;
    const intentName = body.queryResult ? body.queryResult.intent.displayName : "Necunoscut";
    const params = body.queryResult ? body.queryResult.parameters : {};
    const session = body.session;
    console.log(`\n🔔 Intent primit: ${intentName}`);

    // ----------------------------------------------------
    // LOGICA 1: ÎNREGISTRARE CERERE (Creare Cont)
    // ----------------------------------------------------
    if (intentName === 'Creare cont - Tip cont') {
        const { nume, email, telefon, tip } = params;
        
        // --- CERERE ÎNREGISTRATĂ ÎN CONSOLA ---
        console.log('***********************************');
        console.log(`CERERE ÎNREGISTRATĂ PENTRU: ${tip}`);
        console.log('Nume:', nume, 'Email:', email, 'Telefon:', telefon);
        console.log('***********************************');
        
        const fulfillmentText = `Super! Cererea ta de cont (${tip}) a fost înregistrată în sistem. Datele au fost preluate. Vei fi contactat în scurt timp.`;

        return res.json({
            fulfillmentText: fulfillmentText,
            outputContexts: [
                { name: `${session}/contexts/secondary-menu`, lifespanCount: 5 }
            ]
        });
    }

    // ----------------------------------------------------
    // LOGICA 2: CALCUL VALUTAR
    // ----------------------------------------------------
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
