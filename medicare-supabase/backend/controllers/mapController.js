const axios = require("axios");

exports.findNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const radius = 5000; // 5 km

    const query = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  relation["amenity"="hospital"](around:${radius},${lat},${lng});
);
out center tags;
`;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      new URLSearchParams({
        data: query,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MediCare-Backend/1.0",
        },
      }
    );

    const hospitals = response.data.elements.map((place) => ({
      id: place.id,
      name: place.tags?.name || "Unnamed Hospital",
      type: place.type,
      latitude: place.lat || place.center?.lat,
      longitude: place.lon || place.center?.lon,
      address:
        place.tags?.["addr:full"] ||
        place.tags?.["addr:street"] ||
        place.tags?.["addr:city"] ||
        "Address not available",
      phone:
        place.tags?.phone ||
        place.tags?.["contact:phone"] ||
        "Phone not available",
    }));

    res.status(200).json({
      message: "Nearby hospitals fetched successfully",
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch nearby hospitals",
      error: error.message,
    });
  }
};