<?php

namespace Database\Seeders;

use App\Models\Tier;
use Illuminate\Database\Seeder;

class TierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            ['name' => 'Tier A'],
            ['name' => 'Tier B'],
            ['name' => 'Tier C'],
        ];

        foreach ($tiers as $tier) {
            Tier::updateOrCreate(['name' => $tier['name']], $tier);
        }
    }
}
