<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Tier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tierMap = Tier::pluck('id', 'name'); // ['Tier A' => 1, 'Tier B' => 2, 'Tier C' => 3]

        $products = [
            [
                'code' => 'PRD-001',
                'name' => 'Artisanal Country Sourdough Loaf',
                'category' => 'Artisanal Bread',
                'tier' => 'Tier A',
                'price' => 55000,
            ],
            [
                'code' => 'PRD-002',
                'name' => 'Valrhona Dark Chocolate Babka',
                'category' => 'Viennoiserie',
                'tier' => 'Tier A',
                'price' => 68000,
            ],
            [
                'code' => 'PRD-003',
                'name' => 'Truffle & Smoked Beef Croissant',
                'category' => 'Savory Pastry',
                'tier' => 'Tier A',
                'price' => 48000,
            ],
            [
                'code' => 'PRD-004',
                'name' => 'Signature Basque Burnt Cheesecake Slice',
                'category' => 'Cakes & Tarts',
                'tier' => 'Tier A',
                'price' => 52000,
            ],
            [
                'code' => 'PRD-005',
                'name' => 'French Butter Croissant',
                'category' => 'Viennoiserie',
                'tier' => 'Tier B',
                'price' => 28000,
            ],
            [
                'code' => 'PRD-006',
                'name' => 'Pain au Chocolat',
                'category' => 'Viennoiserie',
                'tier' => 'Tier B',
                'price' => 32000,
            ],
            [
                'code' => 'PRD-007',
                'name' => 'Japanese Milk Bread Shokupan',
                'category' => 'Loaves & Toast',
                'tier' => 'Tier B',
                'price' => 35000,
            ],
            [
                'code' => 'PRD-008',
                'name' => 'Smoked Chicken & Cheese Danish',
                'category' => 'Savory Pastry',
                'tier' => 'Tier B',
                'price' => 30000,
            ],
            [
                'code' => 'PRD-009',
                'name' => 'Pistachio Cardamom Escargot',
                'category' => 'Viennoiserie',
                'tier' => 'Tier A',
                'price' => 42000,
            ],
            [
                'code' => 'PRD-010',
                'name' => 'Classic Cinnamon Morning Roll',
                'category' => 'Sweet Buns',
                'tier' => 'Tier B',
                'price' => 22000,
            ],
            [
                'code' => 'PRD-011',
                'name' => 'Roti Kopi Klasik (Coffee Bun)',
                'category' => 'Sweet Buns',
                'tier' => 'Tier C',
                'price' => 12000,
            ],
            [
                'code' => 'PRD-012',
                'name' => 'Roti Cokelat Keju (Chocolate Cheese Bun)',
                'category' => 'Sweet Buns',
                'tier' => 'Tier C',
                'price' => 11000,
            ],
            [
                'code' => 'PRD-013',
                'name' => 'Roti Abon Ayam Gurih (Chicken Floss Bun)',
                'category' => 'Savory Buns',
                'tier' => 'Tier C',
                'price' => 14000,
            ],
            [
                'code' => 'PRD-014',
                'name' => 'Donat Kampung Gula Halus',
                'category' => 'Donuts',
                'tier' => 'Tier C',
                'price' => 8000,
            ],
            [
                'code' => 'PRD-015',
                'name' => 'Banana Molen Danish',
                'category' => 'Sweet Pastry',
                'tier' => 'Tier C',
                'price' => 10000,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['code' => $product['code']],
                [
                    'name' => $product['name'],
                    'category' => $product['category'],
                    'price' => $product['price'],
                    'tier_id' => $tierMap[$product['tier']],
                ]
            );
        }
    }
}
