<?php

namespace App\Http\Controllers;

use App\Models\Tier;
use Illuminate\Http\JsonResponse;

class TierController extends Controller
{
    /**
     * Display a listing of tiers.
     */
    public function index(): JsonResponse
    {
        return response()->json(Tier::all());
    }

    /**
     * Display the specified tier.
     */
    public function show(Tier $tier): JsonResponse
    {
        $tier->load(['products', 'stores']);

        return response()->json($tier);
    }
}
