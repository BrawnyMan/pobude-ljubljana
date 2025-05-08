import PobudeTabela from "../components/PobudeTabela"
import PobudaForm from "../components/PobudaForm"
import Zemljevid from "../components/Zemljevid"

export default function Dashboard() {
    return (
        <div style={{ display: "flex", gap: "2rem" }}>
            <div style={{ flex: 1 }}>
                <Zemljevid />
            </div>
            <div style={{ flex: 2 }}>
                <PobudaForm />
                <PobudeTabela />
            </div>
        </div>
    );
}
