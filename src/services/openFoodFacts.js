import { alimentosCompletos } from './alimentosLocais';

export const searchProducts = async (query) => {
    try {
        const queryLower = query.toLowerCase();

        // Busca apenas localmente
        const localResults = alimentosCompletos.filter(p =>
            p.nome.toLowerCase().includes(queryLower)
        );

        return localResults;
    } catch (error) {
        console.error("Erro ao buscar alimentos:", error);
        return [];
    }
};

export const getProductByBarcode = async (barcode) => {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        const data = await response.json();
        if (data.status === 1 && data.product) {
            const p = data.product;
            return {
                id: p.code || p.id,
                nome: p.product_name || p.product_name_pt || p.generic_name || 'Produto sem nome',
                marca: p.brands || 'Marca não informada',
                imagem: p.image_front_small_url || p.image_front_url || null,
                calorias_100g: p.nutriments?.['energy-kcal_100g'] || 0,
                proteinas_100g: p.nutriments?.proteins_100g || 0,
                carboidratos_100g: p.nutriments?.carbohydrates_100g || 0,
                gorduras_100g: p.nutriments?.fat_100g || 0,
            };
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar produto por código de barras:", error);
        return null;
    }
};
