<?php

use App\Http\Controllers\EntryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\TierController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('stores/{store}/products', [StoreController::class, 'products']);
Route::apiResource('products', ProductController::class);
Route::apiResource('stores', StoreController::class);
Route::apiResource('entries', EntryController::class);
Route::apiResource('tiers', TierController::class)->only(['index', 'show']);
