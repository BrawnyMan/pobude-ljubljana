from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def preberi_glavno():
    return {"sporocilo": "Dobrodošel v API-ju Pobude meščanov"}
