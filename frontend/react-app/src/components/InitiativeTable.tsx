interface Initiative {
    id: number;
    title: string;
    description: string;
    location: string;
    email: string;
    status: string;
}

export default function InitiativeTable({ data }: { data: Initiative[] }) {
    return (
        <div className="container mt-5">
            <h3>Seznam vseh pobud</h3>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Naslov</th>
                            <th>Opis</th>
                            <th>Lokacija</th>
                            <th>E-pošta</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center">Ni še nobene pobude.</td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td>{item.description}</td>
                                    <td>{item.location}</td>
                                    <td>{item.email}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
