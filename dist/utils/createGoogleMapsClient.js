"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleMapsClient = void 0;
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
let client;
function createGoogleMapsClient() {
    if (client)
        return client;
    client = new google_maps_services_js_1.Client({});
    return client;
}
exports.createGoogleMapsClient = createGoogleMapsClient;
//# sourceMappingURL=createGoogleMapsClient.js.map