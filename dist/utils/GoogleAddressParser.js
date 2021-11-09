"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAddressParser = void 0;
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const Address_1 = require("./../entity/Address");
class GoogleAddressParser {
    constructor(address_components) {
        this.address_components = address_components;
        this.address = {};
        this.formattedAddress = '';
        this.parseAddress();
    }
    createFormattedAddress(long_name) {
        if (long_name)
            this.formattedAddress += long_name + ' ';
    }
    parseAddress() {
        if (!Array.isArray(this.address_components)) {
            throw Error('Address Components is not an array');
        }
        if (!this.address_components.length) {
            throw Error('Address Components is empty');
        }
        for (let component of this.address_components) {
            if (this.isStreetNumber(component)) {
                this.address.street_number = parseInt(component.long_name);
                this.createFormattedAddress(component.long_name);
            }
            if (this.isStreetName(component)) {
                this.address.street_name = component.long_name;
                this.createFormattedAddress(component.long_name);
            }
            if (this.isCity(component)) {
                this.address.city = component.long_name;
                this.createFormattedAddress(component.long_name);
            }
            if (this.isCountry(component)) {
                this.address.country = component.long_name;
                this.createFormattedAddress(component.long_name);
            }
            if (this.isState(component)) {
                this.address.state = component.long_name;
                this.createFormattedAddress(component.long_name);
            }
            if (this.isPostalCode(component)) {
                this.address.zip = component.long_name;
                this.createFormattedAddress(component.long_name);
            }
        }
    }
    isStreetNumber(component) {
        return component.types.includes(google_maps_services_js_1.AddressType.street_number);
    }
    isStreetName(component) {
        return component.types.includes(google_maps_services_js_1.AddressType.route);
    }
    isCity(component) {
        return component.types.includes(google_maps_services_js_1.AddressType.locality);
    }
    isState(component) {
        return component.types.includes(google_maps_services_js_1.AddressType.administrative_area_level_1);
    }
    isCountry(component) {
        return component.types.includes(google_maps_services_js_1.AddressType.country);
    }
    isPostalCode(component) {
        return component.types.includes(google_maps_services_js_1.AddressType.postal_code);
    }
    result() {
        return Address_1.Address.create(Object.assign(Object.assign({}, this.address), { formatted_address: this.formattedAddress }));
    }
}
exports.GoogleAddressParser = GoogleAddressParser;
//# sourceMappingURL=GoogleAddressParser.js.map