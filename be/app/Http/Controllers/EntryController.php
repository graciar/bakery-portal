<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    /**
     * Display a listing of the entries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Entry::with(['product.tier', 'store.tier']);

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('name', $operator, "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search, $operator) {
                        $pq->where('name', $operator, "%{$search}%")
                            ->orWhere('code', $operator, "%{$search}%")
                            ->orWhere('category', $operator, "%{$search}%");
                    })
                    ->orWhereHas('store', function ($sq) use ($search, $operator) {
                        $sq->where('name', $operator, "%{$search}%")
                            ->orWhere('code', $operator, "%{$search}%")
                            ->orWhere('city', $operator, "%{$search}%");
                    });
            });
        }

        if ($request->filled('tier_id') && $request->input('tier_id') !== 'ALL') {
            $tier = $request->input('tier_id');
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($tier, $operator) {
                $q->whereHas('store', function ($sq) use ($tier, $operator) {
                    if (is_numeric($tier)) {
                        $sq->where('tier_id', $tier);
                    } else {
                        $sq->whereHas('tier', fn ($tq) => $tq->where('name', $operator, "%{$tier}%"));
                    }
                })->orWhereHas('product', function ($pq) use ($tier, $operator) {
                    if (is_numeric($tier)) {
                        $pq->where('tier_id', $tier);
                    } else {
                        $pq->whereHas('tier', fn ($tq) => $tq->where('name', $operator, "%{$tier}%"));
                    }
                });
            });
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        if ($request->filled('store_id')) {
            $query->where('store_id', $request->input('store_id'));
        }

        if ($request->boolean('paginate') || $request->has('page') || $request->has('per_page')) {
            $perPage = $request->integer('per_page', 10);

            return response()->json($query->latest()->paginate($perPage));
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created entry in storage.
     */
    public function store(Request $request): JsonResponse
    {
        if (! $request->has('name') && $request->has('customer_name')) {
            $request->merge(['name' => $request->input('customer_name')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'store_id' => ['required', 'integer', 'exists:stores,id'],
        ]);

        $entry = Entry::create($validated);
        $entry->load(['product.tier', 'store.tier']);

        return response()->json($entry, 201);
    }

    /**
     * Display the specified entry.
     */
    public function show(Entry $entry): JsonResponse
    {
        $entry->load(['product.tier', 'store.tier']);

        return response()->json($entry);
    }

    /**
     * Update the specified entry in storage.
     */
    public function update(Request $request, Entry $entry): JsonResponse
    {
        if (! $request->has('name') && $request->has('customer_name')) {
            $request->merge(['name' => $request->input('customer_name')]);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'product_id' => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'store_id' => ['sometimes', 'required', 'integer', 'exists:stores,id'],
        ]);

        $entry->update($validated);
        $entry->load(['product.tier', 'store.tier']);

        return response()->json($entry);
    }

    /**
     * Remove the specified entry from storage.
     */
    public function destroy(Entry $entry): JsonResponse
    {
        $entry->delete();

        return response()->json([
            'message' => 'Entry deleted successfully',
        ]);
    }
}
