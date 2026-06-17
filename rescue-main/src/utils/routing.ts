// Helper to get real driving route from OSRM
export async function getRealRoute(start: { lat: number, lng: number }, end: { lat: number, lng: number }): Promise<[number, number][]> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            // OSRM returns [lng, lat], Leaflet needs [lat, lng]
            const coords = data.routes[0].geometry.coordinates;
            return coords.map((c: number[]) => [c[1], c[0]] as [number, number]);
        }
    } catch (error) {
        console.error("OSRM Route Error", error);
    }

    // Fallback: Straight line if API fails
    return [[start.lat, start.lng], [end.lat, end.lng]];
}

// Function to get point along polyline at t (0-1)
export function getPointAtPercentage(route: [number, number][], t: number): { lat: number, lng: number } | null {
    if (!route || route.length < 2) return null;
    if (t <= 0) return { lat: route[0][0], lng: route[0][1] };
    if (t >= 1) return { lat: route[route.length - 1][0], lng: route[route.length - 1][1] };

    // Interpolate by vertex index to naturally slow down at curves/intersections
    // where OSRM places a higher density of geometry points.
    const floatIndex = t * (route.length - 1);
    const lowerIndex = Math.floor(floatIndex);
    const upperIndex = Math.ceil(floatIndex);
    
    if (lowerIndex === upperIndex) {
        return { lat: route[lowerIndex][0], lng: route[lowerIndex][1] };
    }

    const segmentT = floatIndex - lowerIndex;
    const lat = route[lowerIndex][0] + (route[upperIndex][0] - route[lowerIndex][0]) * segmentT;
    const lng = route[lowerIndex][1] + (route[upperIndex][1] - route[lowerIndex][1]) * segmentT;

    return { lat, lng };
}
