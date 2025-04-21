export default function PobudaCard({ pobuda }) {
    return (
        <div style={{ border: "1px solid #ccc", padding: "1em", marginBottom: "1em" }}>
            <h3>{pobuda.naslov}</h3>
            <p>{pobuda.vsebina}</p>
            <small>Status: {pobuda.status}</small>
        </div>
    );
}
