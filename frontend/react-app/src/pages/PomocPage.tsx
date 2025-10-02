import React, { useState } from 'react';

const PomocPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Pregled sistema',
      icon: '🏠',
      content: (
        <div>
          <p className="lead">Spletni servis "Pobude meščanov" je prilagodljiva oblika, postavljena v kombinaciji s HTML5, CSS in JavaScript ter v skladu s sprejetimi standardi konzorcija W3C.</p>
          
          <div className="row g-4 my-4">
            <div className="col-md-6">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="display-4 mb-3">🌐</div>
                  <h5 className="card-title">Spletni brskalniki</h5>
                  <p className="card-text">Deluje na Mozilla Firefox (verzija 11+), Internet Explorer (verzija 9+), Google Chrome (verzija 20+) z omogočenim JavaScript.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <div className="display-4 mb-3">📱</div>
                  <h5 className="card-title">Mobilne naprave</h5>
                  <p className="card-text">Vnos pobud je možno opraviti tudi preko tabličnih računalnikov in mobilnih naprav.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'submission',
      title: 'Vnos pobude',
      icon: '📝',
      content: (
        <div>
          <div className="alert alert-info">
            <h5 className="alert-heading">💡 Kako začeti?</h5>
            <p className="mb-0">Vnos pobude se začne z izborom želene ulice in hišne številke ali pa z označitvijo lokacije pobude s klikom na zemljevid.</p>
          </div>

          <div className="row g-4 my-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 mb-3">📍</div>
                  <h5 className="card-title">1. Lokacija</h5>
                  <p className="card-text">Izberite ulico in hišno številko ali označite lokacijo na zemljevidu.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 mb-3">🏷️</div>
                  <h5 className="card-title">2. Kategorija</h5>
                  <p className="card-text">Vnesite vrsto pobude, ki je najbolj primerna vašemu vprašanju.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="display-4 mb-3">✍️</div>
                  <h5 className="card-title">3. Opis</h5>
                  <p className="card-text">Vnesite naslov (5-40 znakov) in opis pobude (20-500 znakov).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card my-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📋 Obvezna polja</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex align-items-center">
                  <span className="badge bg-danger me-2">Obvezno</span>
                  Ime in priimek
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <span className="badge bg-danger me-2">Obvezno</span>
                  Elektronski naslov
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <span className="badge bg-warning me-2">Neobvezno</span>
                  Telefonska številka
                </li>
              </ul>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-success">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">🔒 Varnost</h6>
                </div>
                <div className="card-body">
                  <p className="card-text">Če vam je besedilo za varnost slabo razumljivo, kliknite na ikono za nov napis.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-info">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">📸 Fotografije</h6>
                </div>
                <div className="card-body">
                  <p className="card-text">Pobudi lahko dodate dve fotografiji (velikost ne sme presegati 25 MB).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'browsing',
      title: 'Pregled pobud',
      icon: '👀',
      content: (
        <div>
          <div className="alert alert-success">
            <h5 className="alert-heading">🔍 Funkcionalnosti pregleda</h5>
            <p className="mb-0">Spletni servis vam omogoča pregled objavljenih, odgovorjenih in neodgovorjenih pobud ter pregled pobud preko karte.</p>
          </div>

          <div className="row g-4 my-4">
            <div className="col-md-6">
              <div className="card h-100 border-primary">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="display-4 me-3">📊</div>
                    <div>
                      <h5 className="card-title mb-0">Filtriranje</h5>
                      <small className="text-muted">Pregled po vrsti in obdobju</small>
                    </div>
                  </div>
                  <p className="card-text">Pobude lahko pregledujete po vrsti in obdobju prijave pobude oziroma odgovora na pobudo.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-success">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="display-4 me-3">🗺️</div>
                    <div>
                      <h5 className="card-title mb-0">Zemljevid</h5>
                      <small className="text-muted">Vizualni pregled lokacij</small>
                    </div>
                  </div>
                  <p className="card-text">Pregled pobud preko interaktivnega zemljevida za lažje iskanje po lokacijah.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card my-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">📈 Statusi pobud</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-warning me-2">⏳</span>
                    <span>V obravnavi</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success me-2">✅</span>
                    <span>Odgovorjene</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-info me-2">📝</span>
                    <span>Objavljene</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-3">
          <div className="card shadow-sm sticky-top" style={{ top: '2rem' }}>
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">📚 Pomoč</h4>
            </div>
            <div className="list-group list-group-flush">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="me-3 fs-4">{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <span className="display-4 me-3">
                  {sections.find(s => s.id === activeSection)?.icon}
                </span>
                <div>
                  <h1 className="mb-0">
                    {sections.find(s => s.id === activeSection)?.title}
                  </h1>
                  <p className="text-muted mb-0">Vodnik za uporabo sistema</p>
                </div>
              </div>
              
              <div className="content">
                {sections.find(s => s.id === activeSection)?.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomocPage; 