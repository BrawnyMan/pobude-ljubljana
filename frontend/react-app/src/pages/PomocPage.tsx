import React from 'react';

const pomocBesedilo = `Servis pobude meščanov\n\nPrilagodljiva oblika spletnega servisa »Pobude meščanov« je postavljena v kombinaciji s HTML5 in CSS in Javascript ter v skladu s sprejetimi standardi konzorcija W3C. Pobude delujejo na sledečih spletnih brskalnikih: Mozilla Firefox (verzija 11 in več), Internet Explorer (verzija 9 in več), Google Chrome (verzija 20 in več), vse z omogočenim Javascript. Če dostopate do spletnega servisa z Internet Explorerjem morate za pravilen prikaz in delovanje servisa imeti izklopljen združljivostmi pogled.\nVnos pobude\nVnos pobude se začne z izborom želene ulice in hišne številke ali pa z označitvijo same lokacije pobude s klikom na zemljevid. Lahko pa uporabite tudi orodje za premik po zemljevidu in tako določite lokacijo, kjer boste vnesli pobudo. Če ne poznate hišne številke, bo iskalec zemljevid in pobudo postavil na začetek izbrane ulice. Vnesete vrsto pobude, za katero mislite, da je najbolj primerna vašemu vprašanju oziroma pobudi. Vnesite še kratek naslov pobude (naslov lahko vsebuje od 5 do 40 znakov). Na kratko opišite vašo pobudo oziroma postavite vprašanje (opis oz. vprašanje morata vsebovati od 20 do 500 znakov) in se predstavite: ime, priimek in elektronski naslov so obvezna polja.\n* Telefonska številka ni obvezna. Vpišite jo, če želite. Poklicali vas bomo le, če nam vaše vprašanje ne bo povsem razumljivo.\n\nČe vam je besedilo, ki ga morate pretipkati zaradi varnosti, slabo razumljivo, kliknite na ikono ob le-tem in dobili boste nov napis, ki ga prepišite.\nPobudi lahko dodate dve fotografiji ( velikost fotografije ne sme presegati 25 GB).\nS potrditvijo bo vaša pobuda sprejeta v sistem in bo vidna na portalu, ko jo potrdi moderator. Vnos pobude lahko opravite tudi preko tabličnih računalnikov in mobilnih naprav.\nPregled pobud\nSpletni servis vam omogoča pregled objavljenih , odgovorjenih in neodgovorjenih pobud ter pregled pobud preko karte. Pobude lahko pregledujete po vrsti in obdobju prijave pobude oziroma odgovora na pobudo.`;

const PomocPage: React.FC = () => (
  <div className="container my-5">
    <div className="card shadow-sm">
      <div className="card-body" style={{ whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: 1.7 }}>
        <h1 className="mb-4">Pomoč</h1>
        <div role="main" aria-label="Help content">
          {pomocBesedilo}
        </div>
      </div>
    </div>
  </div>
);

export default PomocPage; 