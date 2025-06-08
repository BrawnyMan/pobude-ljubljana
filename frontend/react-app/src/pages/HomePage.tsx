import React from "react"
import MapView from "../components/MapView"
import SubmitForm from "../components/SubmitForm"

const HomePage: React.FC = () => {
    return (
        <div className="container-fluid">
            <div className="row vh-100">
                <div className="col-md-8 p-3 border-end overflow-auto">
                    <MapView />
                </div>
                <div className="col-md-4 p-3 bg-light overflow-auto">
                    <SubmitForm />
                </div>
            </div>
        </div>
    )
}

export default HomePage
