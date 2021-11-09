"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRepo = void 0;
const GoogleAddressParser_1 = require("./../utils/GoogleAddressParser");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const createGoogleMapsClient_1 = require("../utils/createGoogleMapsClient");
const Address_1 = require("./../entity/Address");
let AddressRepo = class AddressRepo extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.API_KEY = process.env.GOOGLE_MAPS_API_KEY + '';
        this.googleMapsClient = (0, createGoogleMapsClient_1.createGoogleMapsClient)();
    }
    async findLatLngWithComponents(components) {
        var _a;
        if (!components)
            return null;
        try {
            const { data, status } = await this.googleMapsClient.geocode({
                params: { key: this.API_KEY, components },
            });
            if (status && status === 200 && ((_a = data === null || data === void 0 ? void 0 : data.results) === null || _a === void 0 ? void 0 : _a.length)) {
                const { lat, lng } = data.results[0].geometry.location;
                return { lat, lng };
            }
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    async findLatLngWithStringAddress(address) {
        var _a;
        if (!address)
            return null;
        try {
            const { data, status } = await this.googleMapsClient.geocode({
                params: { key: this.API_KEY, address },
            });
            if (status && status === 200 && ((_a = data === null || data === void 0 ? void 0 : data.results) === null || _a === void 0 ? void 0 : _a.length)) {
                const { lat, lng } = data.results[0].geometry.location;
                return { lat, lng };
            }
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    async findAddressWithLatLng(lat, lng) {
        var _a;
        const latlng = [lat, lng];
        try {
            const { status, data } = await this.googleMapsClient.reverseGeocode({
                params: {
                    key: this.API_KEY,
                    latlng,
                    language: google_maps_services_js_1.Language.en,
                },
            });
            if (status && status === 200 && ((_a = data === null || data === void 0 ? void 0 : data.results) === null || _a === void 0 ? void 0 : _a.length)) {
                const { address_components } = [...data.results].sort((a, b) => { var _a, _b; return ((_a = a.address_components) === null || _a === void 0 ? void 0 : _a.length) < ((_b = b.address_components) === null || _b === void 0 ? void 0 : _b.length) ? 1 : -1; })[0];
                const address = new GoogleAddressParser_1.GoogleAddressParser(address_components).result();
                address.lat = lat;
                address.lng = lng;
                return address;
            }
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    async createFormattedAddress(address) {
        const { city, country, lat, lng, state } = address;
        let formattedAddress = null;
        if (!lat || !lng) {
            return formattedAddress;
        }
        console.log(`🚀 ~ file: AddressRepo.repo.ts ~ line 119 ~ AddressRepo ~ lat`, lat, lng);
        if (!city || !country || !state) {
            formattedAddress = await this.findAddressWithLatLng(lat, lng);
        }
        else {
            formattedAddress = Address_1.Address.create(Object.assign(Object.assign({}, address), { lat,
                lng }));
        }
        return formattedAddress;
    }
    async findNearestUsers(lat, lng, radius) {
        const sql = `
        select * 
        from 
        (
          SELECT 
          id, email,phone,full_name,lat,lng,
          (
            6371 *
            acos(cos(radians(${lat})) * 
            cos(radians(lat)) * 
            cos(radians(lng) - 
            radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(lat)))
        ) AS distance 
        from public."user"
        ) as innerTable
        where distance < ${Math.min(radius, 5)}
        ORDER BY distance
        limit 20;`;
        const users = (await (0, typeorm_1.getConnection)().query(sql));
        return users;
    }
};
AddressRepo = __decorate([
    (0, typedi_1.Service)(),
    (0, typeorm_1.EntityRepository)(Address_1.Address)
], AddressRepo);
exports.AddressRepo = AddressRepo;
//# sourceMappingURL=AddressRepo.repo.js.map