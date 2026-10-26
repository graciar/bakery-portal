<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Product;

class StoreController extends Controller
{
    /**
     * Display a listing of the stores.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Store::with('tier:id,name');

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('name', $operator, "%{$search}%")
                    ->orWhere('code', $operator, "%{$search}%")
                    ->orWhere('city', $operator, "%{$search}%")
                    ->orWhere('province', $operator, "%{$search}%")
                    ->orWhere('street_address', $operator, "%{$search}%");
            });
        }

        if ($request->filled('tier_id') && $request->input('tier_id') !== 'ALL') {
            $query->where('tier_id', $tier = $request->input('tier_id'));
        }

        if ($request->filled('city')) {
            $query->where('city', $request->input('city'));
        }

        if ($request->filled('province')) {
            $query->where('province', $request->input('province'));
        }

        if ($request->boolean('paginate') || $request->has('page') || $request->has('per_page')) {
            $perPage = $request->integer('per_page', 10);

            return response()->json($query->latest()->paginate($perPage));
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created store in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:11', 'unique:stores,code'],
            'name' => ['required', 'string', 'max:255'],
            'street_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'tier_id' => ['required', 'integer', 'exists:tiers,id'],
        ]);

        $store = Store::create($validated);
        $store->load('tier');

        return response()->json($store, 201);
    }

    /**
     * Display the specified store.
     */
    public function show(Request $request, Store $store): JsonResponse
    {
        $store->load('tier:id,name');

        if ($request->boolean('entries')) {
            $store->load('entries.product');
        }

        return response()->json($store);
    }

    /**
     * Update the specified store in storage.
     */
    public function update(Request $request, Store $store): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:11', Rule::unique('stores', 'code')->ignore($store->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'street_address' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:255'],
            'province' => ['sometimes', 'required', 'string', 'max:255'],
            'tier_id' => ['sometimes', 'required', 'integer', 'exists:tiers,id'],
        ]);

        $store->update($validated);
        $store->load('tier');

        return response()->json($store);
    }

    /**
     * Remove the specified store from storage.
     */
    public function destroy(Store $store): JsonResponse
    {
        $store->delete();

        return response()->json([
            'message' => 'Store deleted successfully',
        ]);
    }

    /**
     * Display products available for the specified store (based on tier).
     */
    public function products(Store $store): JsonResponse
    {
        $products = Product::where('tier_id', $store->tier_id)
            ->with('tier:id,name')
            ->orderBy('name')
            ->get();

        return response()->json($products);
    }
}
