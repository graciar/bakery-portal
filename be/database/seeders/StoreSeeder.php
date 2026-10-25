<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Tier;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tierMap = Tier::pluck('id', 'name'); // ['Tier A' => 1, 'Tier B' => 2, 'Tier C' => 3]

        $stores = [
            [
                'code' => 'STR-JKT-001',
                'name' => 'Innocean Bakery Senopati',
                'street_address' => 'Jl. Senopati No. 45, Kebayoran Baru',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'tier' => 'Tier A',
            ],
            [
                'code' => 'STR-JKT-002',
                'name' => 'Innocean Bakery Kelapa Gading',
                'street_address' => 'Jl. Boulevard Raya Blok LA-4',
                'city' => 'Jakarta Utara',
                'province' => 'DKI Jakarta',
                'tier' => 'Tier B',
            ],
            [
                'code' => 'STR-BDG-001',
                'name' => 'Innocean Bakery Riau Heritage',
                'street_address' => 'Jl. LLRE Martadinata No. 88',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'tier' => 'Tier A',
            ],
            [
                'code' => 'STR-BKS-001',
                'name' => 'Innocean Bakery Summarecon',
                'street_address' => 'Jl. Bulevar Ahmad Yani Blok M',
                'city' => 'Bekasi',
                'province' => 'Jawa Barat',
                'tier' => 'Tier C',
            ],
            [
                'code' => 'STR-SBY-001',
                'name' => 'Innocean Bakery Darmo',
                'street_address' => 'Jl. Raya Darmo No. 112, Wonokromo',
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
                'tier' => 'Tier A',
            ],
            [
                'code' => 'STR-MLG-001',
                'name' => 'Innocean Bakery Ijen',
                'street_address' => 'Jl. Besar Ijen No. 24, Klojen',
                'city' => 'Malang',
                'province' => 'Jawa Timur',
                'tier' => 'Tier B',
            ],
            [
                'code' => 'STR-DPS-001',
                'name' => 'Innocean Bakery Seminyak',
                'street_address' => 'Jl. Kayu Aya No. 18X, Seminyak',
                'city' => 'Badung',
                'province' => 'Bali',
                'tier' => 'Tier A',
            ],
            [
                'code' => 'STR-UBU-001',
                'name' => 'Innocean Bakery Ubud Hub',
                'street_address' => 'Jl. Raya Ubud No. 35, Ubud',
                'city' => 'Gianyar',
                'province' => 'Bali',
                'tier' => 'Tier B',
            ],
            [
                'code' => 'STR-MDN-001',
                'name' => 'Innocean Bakery Merdeka',
                'street_address' => 'Jl. Balai Kota No. 7, Kesawan',
                'city' => 'Medan',
                'province' => 'Sumatera Utara',
                'tier' => 'Tier B',
            ],
            [
                'code' => 'STR-MKS-001',
                'name' => 'Innocean Bakery Losari',
                'street_address' => 'Jl. Penghibur No. 52, Ujung Pandang',
                'city' => 'Makassar',
                'province' => 'Sulawesi Selatan',
                'tier' => 'Tier C',
            ],
        ];

        foreach ($stores as $store) {
            Store::updateOrCreate(
                ['code' => $store['code']],
                [
                    'name' => $store['name'],
                    'street_address' => $store['street_address'] ?? null,
                    'city' => $store['city'] ?? null,
                    'province' => $store['province'] ?? null,
                    'tier_id' => $tierMap[$store['tier']],
                ]
            );
        }
    }
}
