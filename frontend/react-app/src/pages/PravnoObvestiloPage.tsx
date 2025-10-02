import React from "react";

const PravnoObvestiloPage: React.FC = () => {
  return (
    <div className="container my-5">
      <div className="card shadow-lg rounded-3">
        <div className="card-body px-4 py-5" style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
          <h1 className="mb-4 text-center">Pravno obvestilo</h1>
          <div role="main" aria-label="Legal notice content" className="legal-text">
            <p>
              Pozdravljeni na spletnem servisu Mestne občine Ljubljana
              <strong> »Pobude meščanov«</strong>. Servis meščanov je portal, ki sprejema
              pobude meščank in meščanov, ki se nanašajo na življenje v Mestni občini
              Ljubljana. Mestna občina Ljubljana podaja odgovore na pobude v delokrogu
              svojih pristojnosti. Servis meščanov ni forum, zatorej ni odprt za komentarje
              na objavljene odgovore.
            </p>

            <h4 className="mt-4">Pogoji uporabe</h4>
            <p>
              Servis meščanov je odprt za vse, pa vendar se morajo avtorji pobud in
              vprašanj predstaviti z imenom, priimkom in e-naslovom ter morajo biti starejši
              od 15 let.
            </p>

            <h4 className="mt-4">Varstvo osebnih podatkov</h4>
            <p>
              Osebni podatki posameznika, ki so pridobljeni na podlagi privolitve, se lahko
              obdelujejo in hranijo do izpolnitve namena zbiranja (komunikacija s pobudnikom,
              pojasnitev nejasnosti glede pobude, možnost posredovanja neposrednega odgovora
              pobudniku) oziroma do preklica dane privolitve posameznika.
            </p>
            <p>
              Po posredovanju odgovora na pobudo se osebni podatki sistemsko pobrišejo.
              Posameznik lahko privolitev kadarkoli spremeni ali prekliče. Prav tako lahko
              zahteva vpogled, popravek, omejitev obdelave ali izbris osebnih podatkov.
            </p>
            <p>
              Zahteve se lahko posredujejo pisno na naslov Mestna občina Ljubljana, Mestni
              trg 1, 1000 Ljubljana ali preko e-naslova{" "}
              <a href="mailto:dpo@ljubljana.si">dpo@ljubljana.si</a>. Pritožbo glede obdelave
              osebnih podatkov pa lahko posameznik vloži tudi pri Informacijskem pooblaščencu
              Republike Slovenije.
            </p>

            <h4 className="mt-4">Odgovornost za vsebino</h4>
            <p>
              Kot upravitelji spletnega portala smo odgovorni za vsebino zapisov, ki jih
              objavljamo. Mestna občina Ljubljana si zato pridržuje pravico do zavrnitve
              neprimernih, podcenjujočih, zaničljivih, omalovažujočih in žaljivih vprašanj in
              sporočil.
            </p>
            <p>
              Evropsko sodišče za človekove pravice je zavzelo stališče, da je svoboda govora
              na vrhu človekovih pravic, vendar to ni absolutna kategorija.
            </p>

            <h4 className="mt-4">Avtorske pravice</h4>
            <p>
              Vse fotografije in vsebine, ki so sestavni del pobud in objavljene na spletnem
              mestu, so predmet avtorske zaščite ali druge oblike zaščite intelektualne
              lastnine.
            </p>
            <p>
              Na podlagi Zakona o avtorski in sorodnih pravicah (ZASP) je Mestna občina
              Ljubljana nosilec materialnih avtorskih pravic nad vsebinami v najširšem pomenu
              (besedila, fotografije, skice, zemljevidi, načrti, avdio-video posnetki,
              računalniški programi ...).
            </p>
            <p>
              Brez pisnega dovoljenja Mestne občine Ljubljana je prepovedano kopiranje,
              prepisovanje, razmnoževanje in razširjanje v komercialne namene. Z zakonom
              (ZASP, členi 48, 49, 51) pa so dovoljeni uporaba v izobraževalne namene ter
              citiranje ob obveznem navedku vira in avtorstva dela. Člen 50 ZASP dovoljuje
              uporabo avtorskih del tudi za zasebno, nekomercialno uporabo.
            </p>

            <h4 className="mt-4">Pravna omejitev</h4>
            <p>
              Storitev spletnega servisa »Pobude meščanov« ne nadomešča upravnih postopkov,
              ki jih vodi Mestna občina Ljubljana in so določeni z veljavnimi zakoni.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PravnoObvestiloPage;
