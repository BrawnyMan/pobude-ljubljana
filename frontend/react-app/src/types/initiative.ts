export interface Initiative {
    id: number
    title: string
    description: string
    status: "pending" | "approved" | "rejected"
    location: {
        lat: number
        lng: number
    }
    createdAt: string
}
