#!/usr/bin/env python3
"""
EthnoGuessr Dataset & GeoJSON Exporter
Downloads polygon data and metadata for all phenotypes from EthnoGuessr (hbd.gg)
and converts them into standard GeoJSON FeatureCollections.
"""

import os
import re
import json
import math
import time
import urllib.request
import concurrent.futures

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "geojsons")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SEEDS = [
    'eastasian',
    'amerindian',
    'subsaharan',
    'european',
    'mena',
    'central_asian',
    'indian',
    'austronesian',
    'challenge'
]

def sanitize_slug(name: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', name).lower()

def create_circle_polygon(center_lng: float, center_lat: float, radius_km: float = 50.0, num_points: int = 24):
    """Generates a polygon approximation of a circle around a lat/lng center."""
    coords = []
    lat_deg = radius_km / 111.0
    cos_lat = math.cos(math.radians(center_lat))
    lng_deg = radius_km / (111.0 * max(0.01, cos_lat))
    
    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        pt_lat = center_lat + lat_deg * math.sin(angle)
        pt_lng = center_lng + lng_deg * math.cos(angle)
        coords.append([round(pt_lng, 6), round(pt_lat, 6)])
    coords.append(coords[0])
    return coords

def fetch_with_retry(url: str, retries: int = 4, delay: float = 1.0) -> str:
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as res:
                return res.read().decode('utf-8')
        except Exception as e:
            last_err = e
            time.sleep(delay * (attempt + 1))
    raise last_err

def discover_all_phenotypes():
    phenotype_regions = {}
    print("Discovering phenotypes across all seed categories...")
    for seed in SEEDS:
        url = f"https://hbd.gg/play?seed={seed}"
        try:
            html = fetch_with_retry(url, retries=3, delay=1.0)
            m = re.search(r'id=\"round-data\" type=\"application/json\">(\[.*?\])</script>', html)
            if m:
                items = json.loads(m.group(1))
                for item in items:
                    if item not in phenotype_regions:
                        phenotype_regions[item] = []
                    phenotype_regions[item].append(seed)
                print(f"  [+] Seed '{seed}': found {len(items)} items")
        except Exception as e:
            print(f"  [-] Error querying seed {seed}: {e}")
            
    print(f"Discovered total {len(phenotype_regions)} unique phenotypes.")
    return phenotype_regions

def fetch_and_convert(name: str, regions: list):
    slug = sanitize_slug(name)
    out_file = os.path.join(OUTPUT_DIR, f"{slug}.geojson")
    
    poly_url = f"https://hbd.gg/static/ethnoguessr/classic/polygons/{slug}_polygons.js"
    info_url = f"https://hbd.gg/static/ethnoguessr/classic/info/{slug}.js"
    
    # If already downloaded and valid, load it
    if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
        try:
            with open(out_file, 'r', encoding='utf-8') as f:
                geojson = json.load(f)
            # Reconstruct metadata
            meta = {
                "name": geojson.get("phenotype", name),
                "slug": slug,
                "regions": geojson.get("regions", regions),
                "centroid": geojson.get("centroid", {}),
                "bbox": geojson.get("bbox"),
                "feature_count": len(geojson.get("features", [])),
                "bright_count": sum(1 for feat in geojson.get("features", []) if feat.get("properties", {}).get("zone") == "bright"),
                "dull_count": sum(1 for feat in geojson.get("features", []) if feat.get("properties", {}).get("zone") == "dull"),
                "info": geojson.get("info", {})
            }
            return (geojson, meta), None
        except Exception:
            pass

    try:
        p_raw = fetch_with_retry(poly_url, retries=4, delay=1.5)
        m_poly = re.search(r'window\.polygonData\s*=\s*(\{.*\})', p_raw)
        if not m_poly:
            return None, f"Could not parse polygonData for {name}"
        poly_data = json.loads(m_poly.group(1))
    except Exception as e:
        return None, f"Polygon fetch failed for {name}: {e}"
        
    info_data = {}
    try:
        i_raw = fetch_with_retry(info_url, retries=3, delay=1.0)
        m_info = re.search(r'window\.raceData\s*=\s*(\{.*\})', i_raw)
        if m_info:
            info_data = json.loads(m_info.group(1))
    except Exception:
        pass
        
    features = []
    min_lng, min_lat, max_lng, max_lat = 180.0, 90.0, -180.0, -90.0
    
    def update_bbox(lng, lat):
        nonlocal min_lng, min_lat, max_lng, max_lat
        if lng < min_lng: min_lng = lng
        if lng > max_lng: max_lng = lng
        if lat < min_lat: min_lat = lat
        if lat > max_lat: max_lat = lat

    centroid = poly_data.get("centroid", {})
    if "lat" in centroid and "lng" in centroid:
        c_lat, c_lng = centroid["lat"], centroid["lng"]
        update_bbox(c_lng, c_lat)
        features.append({
            "type": "Feature",
            "properties": {
                "phenotype": name,
                "slug": slug,
                "zone": "centroid",
                "regions": regions
            },
            "geometry": {
                "type": "Point",
                "coordinates": [round(c_lng, 6), round(c_lat, 6)]
            }
        })

    for zone in ["bright", "dull"]:
        polys = poly_data.get(zone, [])
        for p_idx, poly_group in enumerate(polys):
            if not poly_group:
                continue
            ring = poly_group[0]
            if len(ring) <= 3:
                pt = ring[0]
                pt_lat, pt_lng = pt["lat"], pt["lng"]
                update_bbox(pt_lng, pt_lat)
                circle_coords = create_circle_polygon(pt_lng, pt_lat, radius_km=50.0)
                features.append({
                    "type": "Feature",
                    "properties": {
                        "phenotype": name,
                        "slug": slug,
                        "zone": zone,
                        "is_circle": True,
                        "radius_km": 50,
                        "center": [round(pt_lng, 6), round(pt_lat, 6)]
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [circle_coords]
                    }
                })
            else:
                coords = []
                for pt in ring:
                    p_lat, p_lng = pt["lat"], pt["lng"]
                    update_bbox(p_lng, p_lat)
                    coords.append([round(p_lng, 6), round(p_lat, 6)])
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                    
                features.append({
                    "type": "Feature",
                    "properties": {
                        "phenotype": name,
                        "slug": slug,
                        "zone": zone,
                        "polygon_index": p_idx
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [coords]
                    }
                })

    bbox = [round(min_lng, 6), round(min_lat, 6), round(max_lng, 6), round(max_lat, 6)] if features else None
    
    geojson = {
        "type": "FeatureCollection",
        "phenotype": name,
        "slug": slug,
        "regions": regions,
        "centroid": centroid,
        "bbox": bbox,
        "info": info_data,
        "features": features
    }
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
        
    metadata = {
        "name": name,
        "slug": slug,
        "regions": regions,
        "centroid": centroid,
        "bbox": bbox,
        "feature_count": len(features),
        "bright_count": len(poly_data.get("bright", [])),
        "dull_count": len(poly_data.get("dull", [])),
        "info": info_data
    }
    
    return (geojson, metadata), None

def main():
    phenotypes = discover_all_phenotypes()
    all_features = []
    metadata_catalog = {}
    
    print(f"\nDownloading and converting {len(phenotypes)} phenotypes (throttled)...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(fetch_and_convert, name, regions): name for name, regions in phenotypes.items()}
        completed = 0
        failed = []
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            completed += 1
            res, err = future.result()
            if err:
                print(f"  [{completed}/{len(phenotypes)}] FAIL {name}: {err}")
                failed.append((name, phenotypes[name]))
            else:
                geojson, meta = res
                all_features.extend(geojson["features"])
                metadata_catalog[meta["slug"]] = meta
                if completed % 25 == 0 or completed == len(phenotypes):
                    print(f"  [{completed}/{len(phenotypes)}] Done: {name}")

    # Retry any failed sequentially with pause
    if failed:
        print(f"\nRetrying {len(failed)} failed items with gentle pacing...")
        time.sleep(3)
        for name, regions in failed:
            time.sleep(1.0)
            res, err = fetch_and_convert(name, regions)
            if err:
                print(f"  Permanent FAIL {name}: {err}")
            else:
                geojson, meta = res
                all_features.extend(geojson["features"])
                metadata_catalog[meta["slug"]] = meta
                print(f"  Recovered {name}")

    # Write combined GeoJSON
    combined_geojson = {
        "type": "FeatureCollection",
        "features": all_features
    }
    combined_path = os.path.join(BASE_DIR, "all_phenotypes.geojson")
    with open(combined_path, "w", encoding="utf-8") as f:
        json.dump(combined_geojson, f)
    print(f"\n[+] Wrote combined GeoJSON to {combined_path} ({len(all_features)} total features)")

    # Write metadata catalog
    metadata_path = os.path.join(BASE_DIR, "phenotypes_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata_catalog, f, indent=2)
    print(f"[+] Wrote metadata catalog to {metadata_path} ({len(metadata_catalog)} phenotypes)")

    # Write simple index list
    index_path = os.path.join(BASE_DIR, "phenotypes_index.json")
    index_list = [{"name": m["name"], "slug": m["slug"], "regions": m["regions"], "centroid": m["centroid"]} for m in metadata_catalog.values()]
    index_list.sort(key=lambda x: x["name"])
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index_list, f, indent=2)
    print(f"[+] Wrote index list to {index_path}")
    print(f"[+] All individual files ready in {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
