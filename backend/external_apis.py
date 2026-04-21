import requests
from fastapi import HTTPException

class OpenFoodFactsService:
    @staticmethod
    def get_product_data(barcode: str):
        off_url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
        response = requests.get(off_url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Product not found in Open Food Facts")
        
        data = response.json()
        product = data.get("product", {})
        if not product:
            raise HTTPException(status_code=404, detail="Product data is empty")
            
        return product
