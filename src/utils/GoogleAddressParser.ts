import {
  AddressComponent,
  AddressType,
} from '@googlemaps/google-maps-services-js';
import { Address } from './../entity/Address';

interface AddressInfo {
  street_number?: number;
  street_name?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formatted_address?: string;
}
export class GoogleAddressParser {
  private address: AddressInfo = {};
  private formattedAddress: string = '';

  constructor(private address_components: Array<AddressComponent>) {
    this.parseAddress();
  }
  private createFormattedAddress(long_name: string): void {
    if (long_name) this.formattedAddress += long_name + ' ';
  }

  private parseAddress() {
    if (!Array.isArray(this.address_components)) {
      throw Error('Address Components is not an array');
    }

    if (!this.address_components.length) {
      throw Error('Address Components is empty');
    }

    for (let i = 0; i < this.address_components.length; i++) {
      const component: AddressComponent = this.address_components[i];

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

  private isStreetNumber(component: AddressComponent): boolean {
    return component.types.includes(AddressType.street_number);
  }

  private isStreetName(component: AddressComponent): boolean {
    return component.types.includes(AddressType.route);
  }

  private isCity(component: AddressComponent): boolean {
    return component.types.includes(AddressType.locality);
  }

  private isState(component: AddressComponent): boolean {
    return component.types.includes(AddressType.administrative_area_level_1);
  }

  private isCountry(component: AddressComponent): boolean {
    return component.types.includes(AddressType.country);
  }

  private isPostalCode(component: AddressComponent): boolean {
    return component.types.includes(AddressType.postal_code);
  }

  result(): Address {
    return Address.create({
      ...this.address,
      formatted_address: this.formattedAddress,
    });
  }
}
